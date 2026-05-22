const { MongoClient, ObjectId } = require('mongodb');
const { randomBytes, createHash, timingSafeEqual } = require('crypto');
const { resolveTxt } = require('node:dns').promises;

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
const WATERMARK_TRACK_MAX_PER_WINDOW = 4;
const WATERMARK_TRACK_MAX_PER_DOMAIN_WINDOW = 12;
const WATERMARK_HEARTBEAT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const WATERMARK_SIGNATURE_WINDOW_MS = 10 * 60 * 1000;
const WATERMARK_VERIFY_CHALLENGE_TTL_MS = 15 * 60 * 1000;
const WATERMARK_DOMAIN_REVERIFY_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const watermarkTrackRateState = new Map();
const watermarkTrackDomainRateState = new Map();
const watermarkReplayNonceState = new Map();

function setCors(res, req, action = '') {
  const reqOrigin = String(req.headers?.origin || '').trim();
  const isWatermarkPublicAction = action.startsWith('watermark-');
  const allowOrigin = (isWatermarkPublicAction && reqOrigin) ? reqOrigin : '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  if (allowOrigin !== '*') res.setHeader('Vary', 'Origin');
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

function normalizeDomain(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return '';
  try {
    const url = value.includes('://') ? new URL(value) : new URL(`https://${value}`);
    return String(url.hostname || '').toLowerCase();
  } catch {
    return value.replace(/^\.+|\.+$/g, '');
  }
}

function extractDomainFromUrl(raw) {
  const normalized = normalizeUrl(raw);
  if (!normalized) return '';
  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function resolveRequestDomain(req, bodyDomain, bodyUrl) {
  const direct = normalizeDomain(bodyDomain);
  if (direct) return direct;
  const fromBodyUrl = extractDomainFromUrl(bodyUrl);
  if (fromBodyUrl) return fromBodyUrl;
  const fromReferer = extractDomainFromUrl(req.headers?.referer || '');
  if (fromReferer) return fromReferer;
  return normalizeDomain(req.headers?.origin || '');
}

function extractHeaderDomain(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return '';
  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isRequestDomainVerified(domain, req) {
  const expected = normalizeDomain(domain);
  if (!expected) return false;
  const originDomain = extractHeaderDomain(req.headers?.origin || '');
  const refererDomain = extractHeaderDomain(req.headers?.referer || '');
  if (originDomain && originDomain !== expected) return false;
  if (refererDomain && refererDomain !== expected) return false;
  return Boolean(originDomain || refererDomain);
}

function sha256Hex(value) {
  return createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function safeTokenEquals(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length || left.length === 0) return false;
  try {
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function buildSignature(domain, ts, nonce, siteToken) {
  return sha256Hex([String(domain || '').toLowerCase(), String(ts || ''), String(nonce || ''), String(siteToken || '')].join('|'));
}

function isHeartbeatSignatureValid(domain, body) {
  const sig = String(body?.sig || '').trim().toLowerCase();
  const siteToken = String(body?.siteToken || '').trim();
  const nonce = String(body?.nonce || '').trim();
  const ts = Number(body?.ts || 0);
  if (!sig || !siteToken || !nonce || !Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() - ts) > WATERMARK_SIGNATURE_WINDOW_MS) return false;
  const expected = buildSignature(domain, ts, nonce, siteToken);
  return safeTokenEquals(expected, sig);
}

function registerReplayNonce(domain, nonce, ts) {
  const key = `${String(domain || '').toLowerCase()}|${String(nonce || '')}`;
  if (!key || key.endsWith('|')) return false;
  const now = Date.now();
  for (const [storedKey, storedTs] of watermarkReplayNonceState.entries()) {
    if ((now - storedTs) > WATERMARK_SIGNATURE_WINDOW_MS) watermarkReplayNonceState.delete(storedKey);
  }
  if (watermarkReplayNonceState.has(key)) return false;
  watermarkReplayNonceState.set(key, Number(ts || now));
  return true;
}

function generateWatermarkChallenge(domain) {
  const token = randomBytes(24).toString('hex');
  const challengePath = '/.well-known/deep-watermark-verification.txt';
  return {
    domain: normalizeDomain(domain),
    token,
    tokenHash: sha256Hex(token),
    challengePath,
    challengeContent: `deep-watermark-verification=${token}`,
    challengeExpiresAt: new Date(Date.now() + WATERMARK_VERIFY_CHALLENGE_TTL_MS),
  };
}

function getWatermarkChallengeLine(token) {
  return `deep-watermark-verification=${String(token || '').trim()}`;
}

function buildWatermarkTxtHost(domain) {
  const normalizedDomain = normalizeDomain(domain);
  return normalizedDomain ? `_deep-watermark.${normalizedDomain}` : '';
}

function buildWatermarkChallengePayload(domain, token, challengePath, challengeExpiresAt) {
  const normalizedDomain = normalizeDomain(domain);
  const line = getWatermarkChallengeLine(token);
  const txtHost = buildWatermarkTxtHost(normalizedDomain);
  return {
    path: String(challengePath || '/.well-known/deep-watermark-verification.txt'),
    content: line,
    expiresAt: challengeExpiresAt || null,
    txt: {
      host: txtHost,
      value: line,
      fallbackHost: normalizedDomain,
    },
  };
}

async function fetchText(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function verifyWatermarkDomainFileChallenge(domain, token, challengePath) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain || !token) return false;
  const path = String(challengePath || '/.well-known/deep-watermark-verification.txt');
  const httpsText = await fetchText(`https://${normalizedDomain}${path}`);
  const expectedLine = getWatermarkChallengeLine(token);
  if (httpsText.split('\n').map((line) => line.trim()).includes(expectedLine)) return true;
  const httpText = await fetchText(`http://${normalizedDomain}${path}`);
  return httpText.split('\n').map((line) => line.trim()).includes(expectedLine);
}

async function resolveTxtWithTimeout(hostname, timeoutMs = 5000) {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host) return [];
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve([]), timeoutMs);
  });
  try {
    const records = await Promise.race([resolveTxt(host), timeout]);
    if (!Array.isArray(records)) return [];
    return records
      .map((entry) => Array.isArray(entry) ? entry.join('') : String(entry || ''))
      .map((entry) => entry.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function verifyWatermarkDomainTxtChallenge(domain, token) {
  const normalizedDomain = normalizeDomain(domain);
  const txtHost = buildWatermarkTxtHost(normalizedDomain);
  const expectedLine = getWatermarkChallengeLine(token);
  if (!normalizedDomain || !expectedLine) return false;
  const hosts = [txtHost, normalizedDomain].filter(Boolean);
  for (const host of hosts) {
    const records = await resolveTxtWithTimeout(host);
    if (records.includes(expectedLine)) return true;
  }
  return false;
}

async function verifyWatermarkDomainOwnership(domain, token, challengePath) {
  const [fileValid, txtValid] = await Promise.all([
    verifyWatermarkDomainFileChallenge(domain, token, challengePath),
    verifyWatermarkDomainTxtChallenge(domain, token),
  ]);
  return {
    ok: fileValid && txtValid,
    fileValid,
    txtValid,
  };
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
  const action = String(req.query?.action || req.body?.action || '').trim();
  setCors(res, req, action);
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

  try {
    const db = await connectToDatabase();
    const configCol = db.collection('config');
    const projectsCol = db.collection('projects');
    const watermarkSitesCol = db.collection('watermark_sites');

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

    if (req.method === 'POST' && action === 'watermark-register') {
      const normalizedUrl = resolveTrackingUrl(req, req.body?.url);
      if (!normalizedUrl) return res.status(400).json({ ok: false, message: 'Valid URL required' });
      const domain = resolveRequestDomain(req, req.body?.domain, normalizedUrl);
      if (!domain) return res.status(400).json({ ok: false, message: 'Invalid hostname' });
      const ip = getClientIp(req);
      if (isWatermarkTrackRateLimited(domain, ip)) return res.status(202).json({ ok: true, rateLimited: true });
      const cookies = parseCookies(req.headers?.cookie);
      const trustedDashboard = cookies.dd_auth === 'authenticated';
      if (!trustedDashboard && !isRequestDomainVerified(domain, req)) {
        return res.status(403).json({ ok: false, message: 'Origin or referer mismatch' });
      }

      const now = new Date();
      const favicon = buildGoogleFaviconUrl(normalizedUrl || domain);
      const title = sanitizeTitle(req.body?.title);
      const challenge = generateWatermarkChallenge(domain);

      await watermarkSitesCol.updateOne(
        { domain },
        {
          $set: {
            url: normalizedUrl,
            domain,
            favicon,
            updatedAt: now,
            lastSeenAt: now,
            ...(title ? { title } : {}),
            trust: 'low',
            verificationState: 'pending',
            challengeToken: challenge.token,
            challengeTokenHash: challenge.tokenHash,
            challengePath: challenge.challengePath,
            challengeExpiresAt: challenge.challengeExpiresAt,
            challengeIssuedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
            source: 'auto',
            status: 'pending',
            hidden: false,
            hits: 0,
            heartbeatBuckets: [],
            tokenMatched: false,
          },
        },
        { upsert: true },
      );
      return res.status(200).json({
        ok: true,
        domain,
        verificationState: 'pending',
        challenge: buildWatermarkChallengePayload(
          domain,
          challenge.token,
          challenge.challengePath,
          challenge.challengeExpiresAt,
        ),
      });
    }

    if (req.method === 'POST' && action === 'watermark-verify') {
      const domain = resolveRequestDomain(req, req.body?.domain, req.body?.url);
      if (!domain) return res.status(400).json({ ok: false, message: 'Domain required' });
      const cookies = parseCookies(req.headers?.cookie);
      if (cookies.dd_auth !== 'authenticated') {
        return res.status(401).json({ ok: false, message: 'Unauthorized' });
      }
      const site = await watermarkSitesCol.findOne({ domain });
      if (!site) return res.status(404).json({ ok: false, message: 'Site not found' });
      const challengeExpiresAt = site?.challengeExpiresAt ? new Date(site.challengeExpiresAt) : null;
      const challengeExpiryMs = challengeExpiresAt ? challengeExpiresAt.getTime() : Number.NaN;
      const isAlreadyVerified = String(site.verificationState || '').toLowerCase() === 'verified';
      if (!site.challengeTokenHash || (!isAlreadyVerified && (!Number.isFinite(challengeExpiryMs) || challengeExpiryMs < Date.now()))) {
        return res.status(400).json({ ok: false, message: 'Challenge missing or expired, register again.' });
      }
      const challengeToken = String(site.challengeToken || '').trim();
      if (!challengeToken || (site.challengeTokenHash && !safeTokenEquals(sha256Hex(challengeToken), String(site.challengeTokenHash || '')))) {
        return res.status(400).json({ ok: false, message: 'Challenge token mismatch' });
      }
      const ownershipCheck = await verifyWatermarkDomainOwnership(domain, challengeToken, site.challengePath);
      if (!ownershipCheck.ok) {
        const now = new Date();
        await watermarkSitesCol.updateOne(
          { domain },
          {
            $set: {
              verificationState: 'pending',
              trust: 'low',
              tokenMatched: false,
              hidden: true,
              updatedAt: now,
              lastDomainVerificationCheckAt: now,
              nextDomainVerificationCheckAt: new Date(now.getTime() + WATERMARK_DOMAIN_REVERIFY_INTERVAL_MS),
            },
          },
        );
        return res.status(400).json({
          ok: false,
          message: `Domain verification failed (${ownershipCheck.fileValid ? 'file:ok' : 'file:missing'}, ${ownershipCheck.txtValid ? 'txt:ok' : 'txt:missing'})`,
          checks: ownershipCheck,
        });
      }

      const existingToken = String(site.siteToken || '').trim();
      const issuedToken = existingToken || randomBytes(32).toString('hex');
      const now = new Date();
      await watermarkSitesCol.updateOne(
        { domain },
        {
          $set: {
            verificationState: 'verified',
            trust: 'trusted',
            tokenMatched: true,
            status: site.status === 'declined' ? 'pending' : site.status,
            siteToken: issuedToken,
            siteTokenHash: sha256Hex(issuedToken),
            hidden: false,
            verifiedAt: now,
            updatedAt: now,
            nextAllowedHeartbeatAt: now,
            lastDomainVerificationCheckAt: now,
            nextDomainVerificationCheckAt: new Date(now.getTime() + WATERMARK_DOMAIN_REVERIFY_INTERVAL_MS),
          },
        },
      );
      return res.status(200).json({
        ok: true,
        domain,
        verificationState: 'verified',
        siteToken: issuedToken,
        nextAllowedHeartbeatAt: now,
        checks: ownershipCheck,
      });
    }

    if (req.method === 'POST' && action === 'watermark-heartbeat') {
      const normalizedUrl = resolveTrackingUrl(req, req.body?.url);
      if (!normalizedUrl) return res.status(400).json({ ok: false, message: 'Valid URL required' });
      const domain = resolveRequestDomain(req, req.body?.domain, normalizedUrl);
      if (!domain) return res.status(400).json({ ok: false, message: 'Invalid hostname' });
      const ip = getClientIp(req);
      if (isWatermarkTrackRateLimited(domain, ip)) return res.status(202).json({ ok: true, rateLimited: true });
      if (!isRequestDomainVerified(domain, req)) return res.status(403).json({ ok: false, message: 'Origin or referer mismatch' });
      if (!isHeartbeatSignatureValid(domain, req.body || {})) {
        return res.status(403).json({ ok: false, message: 'Invalid heartbeat signature' });
      }
      if (!registerReplayNonce(domain, req.body?.nonce, req.body?.ts)) {
        return res.status(409).json({ ok: false, message: 'Replay detected' });
      }

      const site = await watermarkSitesCol.findOne({ domain });
      if (!site || site.verificationState !== 'verified') {
        return res.status(403).json({ ok: false, message: 'Domain not verified' });
      }
      const providedSiteToken = String(req.body?.siteToken || '').trim();
      if (!site.siteTokenHash || !safeTokenEquals(sha256Hex(providedSiteToken), String(site.siteTokenHash || ''))) {
        return res.status(403).json({ ok: false, message: 'Invalid site token' });
      }
      const now = new Date();
      const nextAllowed = site.nextAllowedHeartbeatAt ? new Date(site.nextAllowedHeartbeatAt) : new Date(0);
      if (nextAllowed.getTime() > now.getTime()) {
        return res.status(202).json({ ok: true, skipped: true, nextAllowedHeartbeatAt: nextAllowed });
      }
      const verificationToken = String(site.challengeToken || '').trim();
      if (!verificationToken || (site.challengeTokenHash && !safeTokenEquals(sha256Hex(verificationToken), String(site.challengeTokenHash || '')))) {
        await watermarkSitesCol.updateOne(
          { domain },
          {
            $set: {
              verificationState: 'pending',
              trust: 'low',
              tokenMatched: false,
              hidden: true,
              updatedAt: now,
              lastDomainVerificationCheckAt: now,
              nextDomainVerificationCheckAt: new Date(now.getTime() + WATERMARK_DOMAIN_REVERIFY_INTERVAL_MS),
            },
          },
        );
        return res.status(403).json({ ok: false, message: 'Domain verification token missing; re-register domain challenge' });
      }
      const ownershipCheck = await verifyWatermarkDomainOwnership(domain, verificationToken, site.challengePath);
      if (!ownershipCheck.ok) {
        await watermarkSitesCol.updateOne(
          { domain },
          {
            $set: {
              verificationState: 'pending',
              trust: 'low',
              tokenMatched: false,
              hidden: true,
              updatedAt: now,
              lastDomainVerificationCheckAt: now,
              nextDomainVerificationCheckAt: new Date(now.getTime() + WATERMARK_DOMAIN_REVERIFY_INTERVAL_MS),
            },
          },
        );
        return res.status(403).json({
          ok: false,
          message: 'Domain ownership check failed for weekly verification. Re-verify from dashboard.',
          checks: ownershipCheck,
        });
      }

      const dayBucket = getDayBucket(now);
      const title = sanitizeTitle(req.body?.title);
      await watermarkSitesCol.updateOne(
        { domain },
        {
          $set: {
            url: normalizedUrl,
            domain,
            favicon: buildGoogleFaviconUrl(normalizedUrl || domain),
            ...(title ? { title } : {}),
            updatedAt: now,
            lastSeenAt: now,
            lastHeartbeatAt: now,
            nextAllowedHeartbeatAt: new Date(now.getTime() + WATERMARK_HEARTBEAT_INTERVAL_MS),
            lastDomainVerificationCheckAt: now,
            nextDomainVerificationCheckAt: new Date(now.getTime() + WATERMARK_DOMAIN_REVERIFY_INTERVAL_MS),
          },
          $inc: { hits: 1 },
          $push: { heartbeatBuckets: { $each: [dayBucket], $slice: -90 } },
        },
      );
      return res.status(200).json({ ok: true, domain, nextAllowedHeartbeatAt: new Date(now.getTime() + WATERMARK_HEARTBEAT_INTERVAL_MS) });
    }

    if (req.method === 'GET' && action === 'watermark-status') {
      const domain = resolveRequestDomain(req, req.query?.domain, req.query?.url);
      if (!domain) return res.status(400).json({ ok: false, message: 'Domain required' });
      const site = await watermarkSitesCol.findOne(
        { domain },
        {
          projection: {
            domain: 1,
            status: 1,
            trust: 1,
            verificationState: 1,
            lastSeenAt: 1,
            lastHeartbeatAt: 1,
            nextAllowedHeartbeatAt: 1,
            tokenMatched: 1,
            siteToken: 1,
            challengeToken: 1,
            challengePath: 1,
            challengeExpiresAt: 1,
            lastDomainVerificationCheckAt: 1,
            nextDomainVerificationCheckAt: 1,
          },
        },
      );
      if (!site) return res.status(404).json({ ok: false, message: 'Site not found' });
      const cookies = parseCookies(req.headers?.cookie);
      const trustedDashboard = cookies.dd_auth === 'authenticated';
      return res.status(200).json({
        ok: true,
        site: {
          ...site,
          ...(trustedDashboard ? {
            siteToken: site.siteToken || '',
            ...(site.challengeToken ? {
              challenge: buildWatermarkChallengePayload(
                domain,
                site.challengeToken,
                site.challengePath,
                site.challengeExpiresAt || null,
              ),
            } : {}),
          } : {}),
        },
      });
    }

    // Backward compatibility for old embeds: register domain and return migration hint.
    if (req.method === 'POST' && action === 'watermark-track') {
      const normalizedUrl = resolveTrackingUrl(req, req.body?.url);
      if (!normalizedUrl) return res.status(400).json({ ok: false, message: 'Valid URL required' });
      const domain = resolveRequestDomain(req, req.body?.domain, normalizedUrl);
      if (!domain) return res.status(400).json({ ok: false, message: 'Invalid hostname' });
      const now = new Date();
      await watermarkSitesCol.updateOne(
        { domain },
        {
          $set: {
            url: normalizedUrl,
            domain,
            favicon: buildGoogleFaviconUrl(normalizedUrl || domain),
            title: sanitizeTitle(req.body?.title),
            updatedAt: now,
            lastSeenAt: now,
            trust: 'low',
            verificationState: 'legacy',
          },
          $setOnInsert: {
            createdAt: now,
            source: 'auto',
            status: 'pending',
            hidden: false,
            hits: 0,
            heartbeatBuckets: [],
            tokenMatched: false,
          },
        },
        { upsert: true },
      );
      return res.status(200).json({ ok: true, migrationRequired: true, message: 'Use watermark-register and watermark-heartbeat actions.' });
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
              trust: 'trusted',
              verificationState: 'manual',
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
              verificationState: 1,
              createdAt: 1,
              updatedAt: 1,
              lastSeenAt: 1,
              lastHeartbeatAt: 1,
              nextAllowedHeartbeatAt: 1,
              lastDomainVerificationCheckAt: 1,
              nextDomainVerificationCheckAt: 1,
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
