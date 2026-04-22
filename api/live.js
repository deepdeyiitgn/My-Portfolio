/**
 * /api/live
 * GET → fetches latest YouTube videos/streams from public RSS feed.
 * Channel: https://www.youtube.com/channel/UCrh1Mx5CTTbbkgW5O6iS2Tw
 * No API key required — uses the public Atom feed.
 */

const https = require('https');

const CHANNEL_ID = 'UCrh1Mx5CTTbbkgW5O6iS2Tw';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=120'); // cache 2 minutes
  res.end(JSON.stringify(payload));
}

/** Minimal XML text-content extractor — no extra deps needed */
function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function parseVideoId(entryXml) {
  // <yt:videoId>XXXX</yt:videoId>
  const m = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
  return m ? m[1].trim() : '';
}

function parseThumbnail(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 8000 }, (resp) => {
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

    const feedXml = await fetchUrl(FEED_URL);

    // Split into <entry> blocks
    const entryBlocks = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
    let match;
    while ((match = entryRe.exec(feedXml)) !== null) {
      entryBlocks.push(match[1]);
    }

    const videos = entryBlocks.slice(0, 15).map((entry) => {
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

      return {
        videoId,
        title,
        publishedAt: published,
        updatedAt: updated,
        author,
        description: description.slice(0, 300),
        thumbnail: parseThumbnail(videoId),
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount,
      };
    }).filter((v) => v.videoId);

    // Live stream embed — YouTube auto-redirects to current live if one exists
    const liveEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1&rel=0`;
    const channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}`;

    return json(res, 200, {
      ok: true,
      channelId: CHANNEL_ID,
      channelUrl,
      liveEmbedUrl,
      videos,
    });
  } catch (err) {
    console.error('Live API error:', err);
    return json(res, 500, { ok: false, message: 'Failed to fetch stream data.' });
  }
};
