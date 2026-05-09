const https = require('https');

const CHANNEL_ID = 'UCrh1Mx5CTTbbkgW5O6iS2Tw';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_UPLOADS = 500;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=120');
  res.end(JSON.stringify(payload));
}

function parseCount(value) {
  if (value == null) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDurationToSeconds(isoDuration) {
  if (!isoDuration || typeof isoDuration !== 'string') return null;
  const match = isoDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return null;
  const [, h = '0', m = '0', s = '0'] = match;
  return (Number.parseInt(h, 10) * 3600) + (Number.parseInt(m, 10) * 60) + Number.parseInt(s, 10);
}

function parseVideoType({ title = '', description = '', durationSeconds = null, liveBroadcastContent = 'none' }) {
  const text = `${title} ${description}`.toLowerCase();
  if (liveBroadcastContent === 'live' || liveBroadcastContent === 'upcoming') return 'stream';
  if (typeof durationSeconds === 'number' && durationSeconds > 0 && durationSeconds <= 90) return 'short';
  if (/#shorts?\b|#ytshorts/i.test(text)) return 'short';
  if (/#live\b|#stream\b|#livestream\b|live stream|going live/i.test(text)) return 'stream';
  return 'video';
}

function parseThumbnail(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        fetchUrl(resp.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      resp.on('data', (c) => { data += c; });
      resp.on('end', () => resolve(data));
      resp.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`YouTube API request failed (${response.status}): ${body.slice(0, 300)}`);
  }
  return response.json();
}

async function fetchTopComments(videoId, apiKey, maxResults = 10) {
  const url = `${YOUTUBE_API_BASE}/commentThreads?part=snippet&videoId=${encodeURIComponent(videoId)}&maxResults=${maxResults}&order=relevance&textFormat=plainText&key=${encodeURIComponent(apiKey)}`;
  try {
    const data = await fetchJson(url);
    const comments = Array.isArray(data.items) ? data.items : [];
    return comments.map((item) => {
      const top = item?.snippet?.topLevelComment?.snippet || {};
      return {
        id: item?.id || `${videoId}-${Math.random().toString(36).slice(2)}`,
        author: top.authorDisplayName || 'YouTube User',
        text: top.textDisplay || '',
        likeCount: parseCount(top.likeCount),
        publishedAt: top.publishedAt || '',
      };
    }).filter((comment) => comment.text);
  } catch (error) {
    const message = String(error?.message || '');
    if (
      /commentsDisabled|403|disabled|forbidden|notFound|videoNotFound|processingFailure/i.test(message)
    ) {
      return [];
    }
    throw error;
  }
}

async function fetchUploadsFromYouTubeApi(apiKey) {
  const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${CHANNEL_ID}&key=${encodeURIComponent(apiKey)}`;
  const channelData = await fetchJson(channelUrl);
  const playlistId = channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) throw new Error('Could not resolve uploads playlist for channel.');

  const uploadIds = [];
  let pageToken = '';
  let hasMore = false;

  do {
    const listUrl = `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(playlistId)}&maxResults=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}&key=${encodeURIComponent(apiKey)}`;
    const listData = await fetchJson(listUrl);
    const items = Array.isArray(listData.items) ? listData.items : [];

    for (const item of items) {
      const id = item?.contentDetails?.videoId;
      if (id) {
        uploadIds.push(id);
      }
      if (uploadIds.length >= MAX_UPLOADS) break;
    }

    pageToken = listData.nextPageToken || '';
    if (uploadIds.length >= MAX_UPLOADS && pageToken) {
      hasMore = true;
      pageToken = '';
    }
  } while (pageToken);

  const videos = [];
  for (let index = 0; index < uploadIds.length; index += 50) {
    const ids = uploadIds.slice(index, index + 50).join(',');
    if (!ids) continue;

    const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${encodeURIComponent(ids)}&key=${encodeURIComponent(apiKey)}`;
    const videosData = await fetchJson(videosUrl);
    const items = Array.isArray(videosData.items) ? videosData.items : [];

    for (const item of items) {
      const videoId = item?.id;
      if (!videoId) continue;

      const snippet = item?.snippet || {};
      const statistics = item?.statistics || {};
      const durationSeconds = parseDurationToSeconds(item?.contentDetails?.duration);
      const type = parseVideoType({
        title: snippet.title || '',
        description: snippet.description || '',
        durationSeconds,
        liveBroadcastContent: snippet.liveBroadcastContent || 'none',
      });

      videos.push({
        videoId,
        title: snippet.title || 'Untitled',
        publishedAt: snippet.publishedAt || '',
        updatedAt: snippet.publishedAt || '',
        author: snippet.channelTitle || '',
        description: (snippet.description || '').slice(0, 500),
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || parseThumbnail(videoId),
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount: parseCount(statistics.viewCount),
        likeCount: parseCount(statistics.likeCount),
        commentCount: parseCount(statistics.commentCount),
        type,
      });
    }
  }

  videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return { videos, hasMore };
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
}

function parseVideoId(entryXml) {
  const m = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
  return m ? m[1].trim() : '';
}

async function fetchUploadsFromRss() {
  const feedXml = await fetchUrl(FEED_URL);
  const entryBlocks = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = entryRe.exec(feedXml)) !== null) {
    entryBlocks.push(match[1]);
  }

  const videos = entryBlocks.map((entry) => {
    const videoId = parseVideoId(entry);
    const title = extractTag(entry, 'title');
    const published = extractTag(entry, 'published');
    const updated = extractTag(entry, 'updated');
    const author = extractTag(entry, 'name');
    const description = extractTag(entry, 'media:description') || extractTag(entry, 'summary');
    const viewCount = (() => {
      const m2 = entry.match(/views="(\d+)"/);
      return m2 ? parseInt(m2[1], 10) : null;
    })();
    const type = parseVideoType({ title, description });

    return {
      videoId,
      title,
      publishedAt: published,
      updatedAt: updated,
      author,
      description: description.slice(0, 500),
      thumbnail: parseThumbnail(videoId),
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      viewCount,
      likeCount: null,
      commentCount: null,
      type,
    };
  }).filter((v) => v.videoId);

  videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return { videos, hasMore: false };
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'GET') {
      return json(res, 405, { ok: false, message: 'Method not allowed' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || '';
    const commentsFor = typeof req.query?.commentsFor === 'string' ? req.query.commentsFor.trim() : '';

    if (commentsFor && !apiKey) {
      return json(res, 200, { ok: true, comments: [] });
    }
    if (commentsFor && apiKey) {
      const comments = await fetchTopComments(commentsFor, apiKey, 10);
      return json(res, 200, { ok: true, comments });
    }

    let result;
    let source = 'rss';
    if (apiKey) {
      try {
        result = await fetchUploadsFromYouTubeApi(apiKey);
        source = 'youtube-api';
      } catch (error) {
        console.error('YouTube API fetch failed, falling back to RSS:', error);
        result = await fetchUploadsFromRss();
      }
    } else {
      result = await fetchUploadsFromRss();
    }

    const videos = result.videos || [];
    const latestStream = videos.find((video) => video.type === 'stream') || null;
    const defaultVideoId = latestStream?.videoId || videos[0]?.videoId || null;

    const liveEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1&rel=0`;
    const channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}`;

    return json(res, 200, {
      ok: true,
      channelId: CHANNEL_ID,
      channelUrl,
      liveEmbedUrl,
      source,
      hasMore: Boolean(result.hasMore),
      defaultVideoId,
      latestStream,
      videos,
    });
  } catch (err) {
    console.error('Live API error:', err);
    return json(res, 500, { ok: false, message: 'Failed to fetch stream data.' });
  }
};
