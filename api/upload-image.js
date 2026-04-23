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

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers['cookie']);
  return cookies['dd_auth'] === 'authenticated';
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/(png|jpeg|jpg));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!match) return null;
  const mime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const base64 = match[3];
  const buffer = Buffer.from(base64, 'base64');
  return { mime, buffer };
}

function extractStaticUrl(value) {
  const text = String(value || '');
  const matched = text.match(/https?:\/\/static\.qlynk\.me\/f\/[A-Za-z0-9._\-/]+/i);
  if (matched) return matched[0];
  return null;
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') return json(res, 405, { ok: false, message: 'Method not allowed' });
    if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
    if (!process.env.SPACE_PASSWORD) return json(res, 503, { ok: false, message: 'SPACE_PASSWORD is not configured' });

    const body = await readBody(req);
    const imageUrl = String(body.imageUrl || '').trim();
    const dataUrl = String(body.dataUrl || '').trim();
    const slug = String(body.slug || `journal-${Date.now()}`).trim();
    const title = String(body.title || 'Journal Image').trim();

    if (imageUrl) {
      const isAllowed = /\.(png|jpe?g)(\?.*)?$/i.test(imageUrl);
      if (!isAllowed) return json(res, 400, { ok: false, message: 'Only JPG and PNG links are supported' });
      return json(res, 200, { ok: true, url: imageUrl });
    }

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) {
      return json(res, 400, { ok: false, message: 'Invalid image payload. Upload one JPG/PNG file at a time.' });
    }

    const ext = parsed.mime === 'image/png' ? 'png' : 'jpg';
    const filename = `${slug || 'journal-image'}-${Date.now()}.${ext}`;

    const form = new FormData();
    form.set('file', new Blob([parsed.buffer], { type: parsed.mime }), filename);
    form.set('slug', slug || `journal-${Date.now()}`);
    form.set('title', title || 'Journal Image');
    form.set('format', 'redirect');

    const upstream = await fetch('https://static.qlynk.me/api/rest', {
      method: 'POST',
      headers: {
        password: process.env.SPACE_PASSWORD,
      },
      body: form,
    });

    const text = await upstream.text();
    const extracted = extractStaticUrl(text);

    if (!upstream.ok || !extracted) {
      return json(res, 502, { ok: false, message: 'Image upload failed', details: text.slice(0, 300) });
    }

    return json(res, 200, { ok: true, url: extracted });
  } catch (error) {
    console.error('upload-image error', error);
    return json(res, 500, { ok: false, message: 'Internal server error' });
  }
};
