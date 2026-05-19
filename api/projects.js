const { MongoClient, ObjectId } = require('mongodb');
const { randomBytes } = require('crypto');

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

const ROTATING_HEADERS = [
  { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9' },
  { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', 'Accept-Language': 'en-GB,en;q=0.9' },
  { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0' },
  { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
  { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
  { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0' },
  { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36' },
];

const VALID_WATERMARK_STATUSES = new Set(['pending', 'approved', 'declined']);
const MAX_WATERMARK_PAGE_SIZE = 10;
const WATERMARK_TRACK_WINDOW_MS = 60 * 1000;
const WATERMARK_TRACK_MAX_PER_WINDOW = 6;
const WATERMARK_TRACK_MAX_PER_DOMAIN_WINDOW = 20;
const watermarkTrackRateState = new Map();
const watermarkTrackDomainRateState = new Map();

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function asObjectId(value) {
  if (!value || typeof value !== 'string' || !ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) cookies[k.trim()] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null;
  parsed.hash = '';
  const cleanedPath = parsed.pathname.replace(/\/+$/, '') || '/';
  return `${parsed.origin}${cleanedPath}${parsed.search}`;
}

function resolveTrackingUrl(req, bodyUrl) {
  const direct = normalizeUrl(bodyUrl);
  if (direct) return direct;
  const ref = normalizeUrl(req.headers?.referer || '');
  if (ref) return ref;
  const origin = normalizeUrl(req.headers?.origin || '');
  return origin;
}

function sanitizeTitle(raw) {
  return String(raw || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 140);
}

function getDayBucket(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function isWatermarkTrackRateLimited(domain, ip, nowMs = Date.now()) {
  const normalizedDomain = String(domain || '').toLowerCase().trim();
  if (!normalizedDomain) return true;
  const domainState = watermarkTrackDomainRateState.get(normalizedDomain);
  if (!domainState || nowMs - domainState.windowStart >= WATERMARK_TRACK_WINDOW_MS) {
    watermarkTrackDomainRateState.set(normalizedDomain, { count: 1, windowStart: nowMs });
  } else {
    domainState.count += 1;
    if (domainState.count > WATERMARK_TRACK_MAX_PER_DOMAIN_WINDOW) return true;
  }
  const key = `${normalizedDomain}|${ip}`;
  if (key.startsWith('|')) return true;
  const existing = watermarkTrackRateState.get(key);
  if (!existing || nowMs - existing.windowStart >= WATERMARK_TRACK_WINDOW_MS) {
    watermarkTrackRateState.set(key, { count: 1, windowStart: nowMs });
    return false;
  }
  existing.count += 1;
  return existing.count > WATERMARK_TRACK_MAX_PER_WINDOW;
}

function buildGoogleFaviconUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'https://www.google.com/s2/favicons?sz=64';
  let domainUrl = raw;
  try {
    domainUrl = new URL(raw).origin;
  } catch {
    try {
      domainUrl = new URL(`https://${raw}`).origin;
    } catch {
      domainUrl = raw;
    }
  }
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domainUrl)}`;
}

async function takeScreenshot(url) {
  const googleKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const siteShotKey = process.env.SITESHOT_API_KEY;

  if (googleKey) {
    try {
      const gUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=desktop&key=${googleKey}`;
      const res = await fetch(gUrl);
      const data = await res.json();
      const b64 = data?.lighthouseResult?.audits?.['final-screenshot']?.details?.data;
      if (b64) return b64;
    } catch {
      // ignore
    }
  }

  if (siteShotKey) {
    try {
      const ssUrl = `https://api.site-shot.com/?url=${encodeURIComponent(url)}&userkey=${siteShotKey}&width=1280&height=800&fade=1&delay=2000`;
      const res = await fetch(ssUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
      }
    } catch {
      // ignore
    }
  }

  const thumUrl = `https://image.thum.io/get/noanimate/width/1280/crop/800/${url}`;
  const header = ROTATING_HEADERS[Math.floor(Math.random() * ROTATING_HEADERS.length)];
  const res = await fetch(thumUrl, { headers: header });
  if (res.ok) {
    const buffer = await res.arrayBuffer();
    return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
  }
  throw new Error('Failed to capture screenshot after trying Google PageSpeed, Site-Shot, and Thum.io fallback.');
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

  try {
    const db = await connectToDatabase();
    const configCol = db.collection('config');
    const projectsCol = db.collection('projects');
    const watermarkSitesCol = db.collection('watermark_sites');
    const action = String(req.query?.action || req.body?.action || '').trim();

    if (req.method === 'POST' && req.body?.action === 'screenshot') {
      const { url } = req.body;
      if (!url) return res.status(400).json({ ok: false, message: 'URL required' });
      try {
        const image = await takeScreenshot(url);
        return res.status(200).json({ ok: true, image });
      } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
      }
    }

    if (req.method === 'POST' && action === 'watermark-track') {
      const normalizedUrl = resolveTrackingUrl(req, req.body?.url);
      if (!normalizedUrl) return res.status(400).json({ ok: false, message: 'Valid URL required' });

      const domain = (() => {
        try {
          return new URL(normalizedUrl).hostname;
        } catch {
          return '';
        }
      })();
      if (!domain) return res.status(400).json({ ok: false, message: 'Invalid hostname' });
      const ip = getClientIp(req);
      if (isWatermarkTrackRateLimited(domain, ip)) {
        return res.status(202).json({ ok: true, rateLimited: true });
      }

      const now = new Date();
      const dayBucket = getDayBucket(now);
      const favicon = buildGoogleFaviconUrl(normalizedUrl || domain);
      const title = sanitizeTitle(req.body?.title);
      const cookies = parseCookies(req.headers?.cookie);
      const trustedDashboard = cookies.dd_auth === 'authenticated';
      let expectedSiteToken = '';
      if (!trustedDashboard) {
        const cfg = await configCol.findOne(
          { _id: 'site_config' },
          { projection: { watermarkSiteToken: 1 } },
        );
        expectedSiteToken = String(cfg?.watermarkSiteToken || '').trim();
      }
      const providedSiteToken = String(req.body?.siteToken || '').trim();
      const trustedByToken = Boolean(expectedSiteToken) && Boolean(providedSiteToken) && providedSiteToken === expectedSiteToken;
      const trust = trustedDashboard || trustedByToken ? 'trusted' : 'low';
      const tokenMatched = trustedDashboard || trustedByToken;
      const trustSet = tokenMatched ? { trust, tokenMatched } : {};

      await watermarkSitesCol.updateOne(
        { domain },
        {
          $set: { url: normalizedUrl, domain, favicon, updatedAt: now, lastSeenAt: now, ...(title ? { title } : {}), ...trustSet },
          $setOnInsert: {
            createdAt: now,
            source: 'auto',
            status: 'pending',
            hidden: false,
            hits: 0,
            heartbeatBuckets: [],
            trust: tokenMatched ? 'trusted' : 'low',
            tokenMatched,
          },
        },
        { upsert: true },
      );
      if (!tokenMatched) {
        await watermarkSitesCol.updateOne(
          { domain, trust: { $exists: false } },
          { $set: { trust: 'low', tokenMatched: false, updatedAt: now } },
        );
      }
      await watermarkSitesCol.updateOne(
        { domain, lastHeartbeatBucket: { $ne: dayBucket } },
        {
          $push: { heartbeatBuckets: { $each: [dayBucket], $slice: -90 } },
          $inc: { hits: 1 },
          $set: { updatedAt: now, lastHeartbeatBucket: dayBucket },
        },
      );
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST' && action === 'watermark-manual-add') {
      const normalizedUrl = normalizeUrl(req.body?.url || '');
      if (!normalizedUrl) return res.status(400).json({ ok: false, message: 'Valid URL required' });
      const parsed = new URL(normalizedUrl);
      const now = new Date();
      const domain = parsed.hostname;
      const favicon = buildGoogleFaviconUrl(normalizedUrl || domain);

      await watermarkSitesCol.updateOne(
        { url: normalizedUrl },
        {
          $set: {
            url: normalizedUrl,
            domain,
            favicon,
            source: 'manual',
              status: 'approved',
              hidden: false,
              approvedAt: now,
              updatedAt: now,
              lastSeenAt: now,
              title: sanitizeTitle(req.body?.title),
            },
          $setOnInsert: { createdAt: now, hits: 0 },
        },
        { upsert: true },
      );
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET' && action === 'watermark-sites') {
      const page = Math.max(1, Number(req.query?.page || 1));
      const limit = Math.min(MAX_WATERMARK_PAGE_SIZE, Math.max(1, Number(req.query?.limit || MAX_WATERMARK_PAGE_SIZE)));
      const requestedStatus = String(req.query?.status || 'approved').trim().toLowerCase();
      const status = requestedStatus === 'all' ? 'all' : (VALID_WATERMARK_STATUSES.has(requestedStatus) ? requestedStatus : 'approved');
      const visibleOnly = String(req.query?.visible || '').trim() === '1';
      const filter = status === 'all' ? {} : { status };
      if (visibleOnly) filter.hidden = { $ne: true };

      const [total, sites] = await Promise.all([
        watermarkSitesCol.countDocuments(filter),
        watermarkSitesCol
          .find(filter, {
            projection: {
              url: 1,
              domain: 1,
              favicon: 1,
              title: 1,
              status: 1,
              source: 1,
              hidden: 1,
              hits: 1,
              trust: 1,
              tokenMatched: 1,
              createdAt: 1,
              updatedAt: 1,
              lastSeenAt: 1,
              approvedAt: 1,
            },
          })
          .sort({ approvedAt: -1, updatedAt: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
      ]);

      return res.status(200).json({
        ok: true,
        sites,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    }

    if (req.method === 'GET' && action === 'watermark-token') {
      const cookies = parseCookies(req.headers?.cookie);
      if (cookies.dd_auth !== 'authenticated') {
        return res.status(401).json({ ok: false, message: 'Unauthorized' });
      }
      const existing = await configCol.findOne(
        { _id: 'site_config' },
        { projection: { watermarkSiteToken: 1 } },
      );
      let token = String(existing?.watermarkSiteToken || '').trim();
      if (!token) {
        token = randomBytes(24).toString('hex');
        await configCol.updateOne(
          { _id: 'site_config' },
          { $set: { watermarkSiteToken: token, updatedAt: new Date() } },
          { upsert: true },
        );
      }
      return res.status(200).json({ ok: true, token });
    }

    if (req.method === 'PUT' && action === 'watermark-status') {
      const id = asObjectId(req.body?.id);
      const status = String(req.body?.status || '').trim().toLowerCase();
      const title = sanitizeTitle(req.body?.title);
      if (!id) return res.status(400).json({ ok: false, message: 'Valid id required' });
      if (!VALID_WATERMARK_STATUSES.has(status)) return res.status(400).json({ ok: false, message: 'Invalid status' });
      const now = new Date();
      const update = {
        status,
        updatedAt: now,
        ...(status === 'approved' ? { approvedAt: now, hidden: false } : {}),
        ...(title ? { title } : {}),
      };
      await watermarkSitesCol.updateOne({ _id: id }, { $set: update });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT' && action === 'watermark-visibility') {
      const id = asObjectId(req.body?.id);
      if (!id) return res.status(400).json({ ok: false, message: 'Valid id required' });
      const hidden = Boolean(req.body?.hidden);
      await watermarkSitesCol.updateOne({ _id: id }, { $set: { hidden, updatedAt: new Date() } });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE' && action === 'watermark-site') {
      const id = asObjectId(String(req.query?.id || ''));
      if (!id) return res.status(400).json({ ok: false, message: 'Valid id required' });
      await watermarkSitesCol.deleteOne({ _id: id });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const config = await configCol.findOne({ _id: 'site_config' });
      const mode = config?.projectsMode || 'default';
      const items = await projectsCol.find({}).sort({ sortOrder: 1 }).toArray();
      return res.status(200).json({ ok: true, mode, items });
    }

    if (req.method === 'PUT') {
      if (req.body.mode) {
        await configCol.updateOne({ _id: 'site_config' }, { $set: { projectsMode: req.body.mode } }, { upsert: true });
        return res.status(200).json({ ok: true });
      }
      if (req.body._id) {
        const { _id, ...updateData } = req.body;
        delete updateData.action;
        const objectId = asObjectId(String(_id));
        if (!objectId) return res.status(400).json({ ok: false, message: 'Invalid project id' });
        await projectsCol.updateOne({ _id: objectId }, { $set: updateData });
        return res.status(200).json({ ok: true });
      }
    }

    if (req.method === 'POST') {
      const { action: _action, ...newProjectData } = req.body;
      const result = await projectsCol.insertOne(newProjectData);
      return res.status(201).json({ ok: true, _id: result.insertedId });
    }

    if (req.method === 'DELETE') {
      const objectId = asObjectId(String(req.query?.id || ''));
      if (!objectId) return res.status(400).json({ ok: false, message: 'Invalid project id' });
      await projectsCol.deleteOne({ _id: objectId });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false });
  } catch {
    return res.status(500).json({ ok: false, message: 'Server Error' });
  }
};
