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

      const expectedPassword = process.env.SPACE_PASSWORD;
      if (!expectedPassword) {
        return json(res, 503, { ok: false, message: 'Auth not configured. Set SPACE_PASSWORD environment variable.' });
      }

      if (!password || password !== expectedPassword) {
        return json(res, 401, { ok: false, message: 'Incorrect password.' });
      }

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
