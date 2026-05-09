const https = require('https');

const CHANNEL_ID = 'UCrh1Mx5CTTbbkgW5O6iS2Tw';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_UPLOADS = 500;
const CHANNEL_BASE_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;

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

function textFromYouTubeRuns(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value.simpleText === 'string') return value.simpleText.trim();
  if (Array.isArray(value.runs)) {
    return value.runs.map((run) => run?.text || '').join('').trim();
  }
  return '';
}

function parsePublishedAtFromText(input) {
  const text = String(input || '').toLowerCase().replace(/^streamed\s+/i, '').trim();
  if (!text) return '';
  if (/just now|today/i.test(text)) return new Date().toISOString();
  const m = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  if (!m) return '';
  const amount = Number.parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const now = new Date();
  if (!Number.isFinite(amount)) return '';
  if (unit === 'second') now.setSeconds(now.getSeconds() - amount);
  if (unit === 'minute') now.setMinutes(now.getMinutes() - amount);
  if (unit === 'hour') now.setHours(now.getHours() - amount);
  if (unit === 'day') now.setDate(now.getDate() - amount);
  if (unit === 'week') now.setDate(now.getDate() - (amount * 7));
  if (unit === 'month') now.setMonth(now.getMonth() - amount);
  if (unit === 'year') now.setFullYear(now.getFullYear() - amount);
  return now.toISOString();
}

function extractObjectAfterMarker(input, marker) {
  const markerIndex = input.indexOf(marker);
  if (markerIndex === -1) return null;
  const start = input.indexOf('{', markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = start; i < input.length; i += 1) {
    const ch = input[i];
    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (ch === '\\') {
        escaping = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        const jsonText = input.slice(start, i + 1);
        try {
          return JSON.parse(jsonText);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function extractInitialDataFromHtml(html) {
  return (
    extractObjectAfterMarker(html, 'var ytInitialData =')
    || extractObjectAfterMarker(html, 'window["ytInitialData"] =')
    || extractObjectAfterMarker(html, 'ytInitialData =')
  );
}

function extractInnertubeConfig(html) {
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  const clientVersionMatch = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/);
  const clientNameMatch = html.match(/"INNERTUBE_CONTEXT_CLIENT_NAME":\s*([0-9]+)/);
  return {
    apiKey: apiKeyMatch?.[1] || '',
    clientVersion: clientVersionMatch?.[1] || '',
    clientName: Number.parseInt(clientNameMatch?.[1] || '1', 10) || 1,
  };
}

function findContinuationToken(root) {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      for (const value of node) stack.push(value);
      continue;
    }
    const token =
      node?.continuationCommand?.token
      || node?.nextContinuationData?.continuation
      || node?.reloadContinuationData?.continuation;
    if (typeof token === 'string' && token) return token;
    for (const value of Object.values(node)) {
      if (value && typeof value === 'object') stack.push(value);
    }
  }
  return '';
}

function extractVideoItemsFromInitialData(root, sourceType) {
  const results = [];
  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      for (const value of node) stack.push(value);
      continue;
    }

    const videoRenderer = node.videoRenderer || node.gridVideoRenderer || node.compactVideoRenderer;
    if (videoRenderer?.videoId) {
      const videoId = videoRenderer.videoId;
      const title = textFromYouTubeRuns(videoRenderer?.title) || 'Untitled';
      const description = textFromYouTubeRuns(videoRenderer?.descriptionSnippet);
      const publishedText = textFromYouTubeRuns(videoRenderer?.publishedTimeText);
      const publishedAt = parsePublishedAtFromText(publishedText);
      const viewCount =
        parseCount(videoRenderer?.viewCountText?.simpleText?.replace(/[^\d]/g, ''))
        || parseCount(textFromYouTubeRuns(videoRenderer?.shortViewCountText).replace(/[^\d]/g, ''));
      const thumbList = videoRenderer?.thumbnail?.thumbnails || [];
      const thumbnail = thumbList[thumbList.length - 1]?.url || parseThumbnail(videoId);
      const badgeText = (videoRenderer?.badges || [])
        .map((badge) => textFromYouTubeRuns(badge?.metadataBadgeRenderer?.label))
        .join(' ')
        .toLowerCase();
      const type = parseVideoType({
        title,
        description: `${description} ${badgeText}`,
        durationSeconds: null,
        liveBroadcastContent: /live|upcoming/.test(badgeText) || sourceType === 'stream' ? 'live' : 'none',
      });
      results.push({
        videoId,
        title,
        publishedAt,
        updatedAt: publishedAt,
        author: '',
        description: description.slice(0, 500),
        thumbnail,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount,
        likeCount: null,
        commentCount: null,
        type: sourceType === 'short' ? 'short' : (sourceType === 'stream' ? 'stream' : type),
      });
    }

    const reelRenderer = node.reelItemRenderer;
    if (reelRenderer?.videoId) {
      const videoId = reelRenderer.videoId;
      const title = textFromYouTubeRuns(reelRenderer?.headline || reelRenderer?.title) || 'Short';
      const viewCount = parseCount(textFromYouTubeRuns(reelRenderer?.viewCountText).replace(/[^\d]/g, ''));
      const thumbList = reelRenderer?.thumbnail?.thumbnails || [];
      const thumbnail = thumbList[thumbList.length - 1]?.url || parseThumbnail(videoId);
      results.push({
        videoId,
        title,
        publishedAt: '',
        updatedAt: '',
        author: '',
        description: '',
        thumbnail,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`,
        watchUrl: `https://www.youtube.com/shorts/${videoId}`,
        viewCount,
        likeCount: null,
        commentCount: null,
        type: 'short',
      });
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === 'object') stack.push(value);
    }
  }

  return results;
}

async function fetchTabPageVideos(path, sourceType) {
  const html = await fetchUrl(`${CHANNEL_BASE_URL}/${path}`);
  const initialData = extractInitialDataFromHtml(html);
  if (!initialData) return [];

  const config = extractInnertubeConfig(html);
  const videos = extractVideoItemsFromInitialData(initialData, sourceType);
  const seen = new Set(videos.map((v) => v.videoId));
  let continuation = findContinuationToken(initialData);
  let pageCount = 0;
  const MAX_WEB_CONTINUATION_PAGES = 8;

  while (continuation && config.apiKey && config.clientVersion && pageCount < MAX_WEB_CONTINUATION_PAGES) {
    pageCount += 1;
    try {
      const endpoint = `https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0; +https://deepdey.vercel.app)',
          Origin: 'https://www.youtube.com',
          Referer: `${CHANNEL_BASE_URL}/${path}`,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: config.clientName,
              clientVersion: config.clientVersion,
            },
          },
          continuation,
        }),
      });
      if (!response.ok) break;
      const payload = await response.json();
      const more = extractVideoItemsFromInitialData(payload, sourceType);
      for (const item of more) {
        if (seen.has(item.videoId)) continue;
        seen.add(item.videoId);
        videos.push(item);
      }
      continuation = findContinuationToken(payload);
    } catch {
      break;
    }
  }

  return videos;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0; +https://deepdey.vercel.app)',
        Accept: 'text/html,application/xml;q=0.9,*/*;q=0.8',
      },
    }, (resp) => {
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

async function fetchUploadsWithoutApiKey() {
  const [rssResult, videosTab, streamsTab, shortsTab] = await Promise.all([
    fetchUploadsFromRss(),
    fetchTabPageVideos('videos', 'video').catch(() => []),
    fetchTabPageVideos('streams', 'stream').catch(() => []),
    fetchTabPageVideos('shorts', 'short').catch(() => []),
  ]);

  const merged = [...videosTab, ...streamsTab, ...shortsTab, ...rssResult.videos];
  const seen = new Set();
  const deduped = [];
  for (const item of merged) {
    if (!item?.videoId || seen.has(item.videoId)) continue;
    seen.add(item.videoId);
    deduped.push(item);
  }

  deduped.sort((a, b) => {
    const at = new Date(a.publishedAt || 0).getTime();
    const bt = new Date(b.publishedAt || 0).getTime();
    if (Number.isNaN(bt) && Number.isNaN(at)) return 0;
    if (Number.isNaN(bt)) return -1;
    if (Number.isNaN(at)) return 1;
    return bt - at;
  });

  return { videos: deduped, hasMore: rssResult.hasMore };
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
      const comments = await fetchTopComments(commentsFor, apiKey, 15);
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
        result = await fetchUploadsWithoutApiKey();
        source = 'youtube-web-rss';
      }
    } else {
      result = await fetchUploadsWithoutApiKey();
      source = 'youtube-web-rss';
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
