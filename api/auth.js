/**
 * /api/auth
 * POST { password } → verify against SPACE_PASSWORD env, set forever session cookie
 * GET  → verify dd_auth cookie, return { ok, authenticated }
 */

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body || '{}'); } catch { return {}; }
    }
    if (Buffer.isBuffer(req.body)) {
      try { return JSON.parse(req.body.toString('utf8') || '{}'); } catch { return {}; }
    }
    if (typeof req.body === 'object') return req.body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk.toString('utf8'); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
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

const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const FIRST_LOCK_MS = 2 * 60 * 1000;
const LOCK_STEP_MS = 5 * 60 * 1000;
const LOCK_MAX_MS = 60 * 60 * 1000;
const loginRateLimitState = new Map();

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function getLoginRateState(ip, now = Date.now()) {
  const existing = loginRateLimitState.get(ip);
  if (!existing) {
    const fresh = { attempts: 0, windowStart: now, lockUntil: 0, lockCount: 0 };
    loginRateLimitState.set(ip, fresh);
    return fresh;
  }
  if (existing.lockUntil && existing.lockUntil <= now) {
    existing.lockUntil = 0;
  }
  if (now - existing.windowStart >= LOGIN_WINDOW_MS) {
    existing.windowStart = now;
    existing.attempts = 0;
  }
  return existing;
}

function nextLockDurationMs(lockCount) {
  if (lockCount <= 1) return FIRST_LOCK_MS;
  const stepped = (lockCount - 1) * LOCK_STEP_MS;
  return Math.min(stepped, LOCK_MAX_MS);
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      const cookies = parseCookies(req.headers['cookie']);
      const authenticated = cookies['dd_auth'] === 'authenticated';
      return json(res, 200, { ok: true, authenticated });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { password } = body;
      const ip = getClientIp(req);
      const now = Date.now();
      const state = getLoginRateState(ip, now);

      const expectedPassword = process.env.SPACE_PASSWORD;
      if (!expectedPassword) {
        return json(res, 503, { ok: false, message: 'Auth not configured. Set SPACE_PASSWORD environment variable.' });
      }

      if (state.lockUntil && state.lockUntil > now) {
        const retryAfterSec = Math.ceil((state.lockUntil - now) / 1000);
        return json(res, 429, {
          ok: false,
          message: `Too many failed attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
          retryAfterSec,
          lockout: true,
        });
      }

      if (!password || password !== expectedPassword) {
        state.attempts += 1;
        if (state.attempts >= LOGIN_MAX_ATTEMPTS) {
          state.lockCount += 1;
          const lockDurationMs = nextLockDurationMs(state.lockCount);
          state.lockUntil = now + lockDurationMs;
          state.attempts = 0;
          state.windowStart = now;
          const retryAfterSec = Math.ceil(lockDurationMs / 1000);
          return json(res, 429, {
            ok: false,
            message: `Too many failed attempts. Locked for ${Math.ceil(lockDurationMs / 60000)} minute(s).`,
            retryAfterSec,
            lockout: true,
          });
        }
        const remaining = LOGIN_MAX_ATTEMPTS - state.attempts;
        return json(res, 401, {
          ok: false,
          message: `Incorrect password. ${remaining} attempt(s) left in this 1-minute window.`,
          attemptsLeft: remaining,
        });
      }

      loginRateLimitState.delete(ip);

      // Set a forever cookie (10 years)
      res.setHeader(
        'Set-Cookie',
        'dd_auth=authenticated; Path=/; Max-Age=315360000; HttpOnly; SameSite=Strict'
      );
      return json(res, 200, { ok: true, message: 'Authenticated successfully.' });
    }

    if (req.method === 'DELETE') {
      res.setHeader(
        'Set-Cookie',
        'dd_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'
      );
      return json(res, 200, { ok: true, message: 'Logged out.' });
    }

    return json(res, 405, { ok: false, message: 'Method not allowed.' });
  } catch (err) {
    console.error('Auth error:', err);
    return json(res, 500, { ok: false, message: 'Internal server error.' });
  }
};
