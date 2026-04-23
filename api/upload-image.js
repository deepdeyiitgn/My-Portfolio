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
  // Accept optional embedded newlines that some browsers insert into large base64 data URLs.
  // Using [\w+/=\n]+ is intentional: it matches valid base64 chars plus \n so the regex
  // itself accepts newlines, and we strip them before decoding below.
  const match = /^data:(image\/(png|jpeg|jpg));base64,([\w+/=\n]+)$/.exec(String(dataUrl || ''));
  if (!match) return null;
  const mime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const base64 = match[3].replace(/\n/g, ''); // strip newlines before decoding
  const buffer = Buffer.from(base64, 'base64');
  return { mime, buffer };
}

/**
 * Try to extract a static.qlynk.me file URL from any text/JSON response.
 * Handles the API returning format=json (URL in response fields) as well as
 * plain-text or redirect bodies.
 */
function extractFileUrl(text, fallbackSlug) {
  // 1. Try JSON parse — look for common URL field names
  try {
    const data = JSON.parse(text);
    const candidate =
      data.url ||
      data.link ||
      data.path ||
      data.file_url ||
      data.download_url ||
      data.public_url ||
      data.cdn_url ||
      (data.file && (data.file.url || data.file.link)) ||
      (data.data && (data.data.url || data.data.link));

    if (candidate && typeof candidate === 'string') {
      const raw = candidate.trim();
      // Absolute URL — return as-is
      if (/^https?:\/\//i.test(raw)) return raw;
      // Relative path — prefix with base
      if (raw.startsWith('/')) return `https://static.qlynk.me${raw}`;
    }

    // If response has a slug field we can construct the URL ourselves
    const slug = data.slug || data.id || data.key;
    if (slug && typeof slug === 'string') {
      return `https://static.qlynk.me/f/${encodeURIComponent(slug.trim())}`;
    }
  } catch {
    // Not JSON — fall through
  }

  // 2. Regex scan of the raw text body
  const matched = text.match(/https?:\/\/static\.qlynk\.me\/f\/[^\s"'<>]+/i);
  if (matched) return matched[0].replace(/[.,;)]+$/, ''); // trim trailing punctuation

  // 3. Last-resort: construct from the slug we sent
  if (fallbackSlug) {
    return `https://static.qlynk.me/f/${encodeURIComponent(fallbackSlug)}`;
  }

  return null;
}

/**
 * Build a short, safe slug.  We cap the user-supplied base at 40 chars and
 * append 6 random hex chars, giving a total of ≤47 chars.  This stays well
 * within typical API slug length limits and avoids 409 "slug already assigned"
 * errors from the upstream API.
 */
function buildSlug(rawSlug) {
  const base = (rawSlug || 'img')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
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
    const rawSlug = String(body.slug || '').trim();
    const title = String(body.title || 'Journal Image').trim();

    // ── Link passthrough (no actual upload needed) ──────────────────────────
    if (imageUrl) {
      const isAllowed = /\.(png|jpe?g)(\?.*)?$/i.test(imageUrl) ||
                        imageUrl.includes('static.qlynk.me/f/');
      if (!isAllowed) return json(res, 400, { ok: false, message: 'Only JPG/PNG links or static.qlynk.me/f/ URLs are supported' });
      return json(res, 200, { ok: true, url: imageUrl });
    }

    // ── File upload via data URL ─────────────────────────────────────────────
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) {
      return json(res, 400, { ok: false, message: 'Invalid image payload. Provide a valid JPG or PNG file.' });
    }

    const ext = parsed.mime === 'image/png' ? 'png' : 'jpg';
    const slug = buildSlug(rawSlug);
    const filename = `${slug}.${ext}`;

    // Build multipart form for the upstream API
    const form = new FormData();
    form.set('file', new Blob([parsed.buffer], { type: parsed.mime }), filename);
    form.set('slug', slug);
    form.set('title', title);
    form.set('format', 'json');   // ← Request JSON response so we can parse the URL

    const upstream = await fetch('https://static.qlynk.me/api/rest', {
      method: 'POST',
      headers: {
        password: process.env.SPACE_PASSWORD,
      },
      body: form,
    });

    const text = await upstream.text();

    // The API may return a non-2xx code on duplicate slug (409) or auth failure (401/403)
    if (!upstream.ok) {
      console.error('upload-image upstream error', upstream.status, text.slice(0, 400));
      return json(res, 502, {
        ok: false,
        message: `Upstream API returned ${upstream.status}`,
        details: text.slice(0, 300),
      });
    }

    // Check if the CDN returned a JSON error even with 200 status
    try {
      const parsed = JSON.parse(text);
      if (parsed.status === 'error' || parsed.ok === false || parsed.error) {
        console.error('upload-image cdn returned error', text.slice(0, 400));
        return json(res, 502, {
          ok: false,
          message: parsed.message || parsed.error || 'CDN upload failed',
        });
      }
    } catch {
      // not JSON – continue to URL extraction
    }

    const fileUrl = extractFileUrl(text, slug);

    if (!fileUrl) {
      console.error('upload-image: could not extract URL from response', text.slice(0, 400));
      return json(res, 502, {
        ok: false,
        message: 'Image uploaded but could not determine file URL',
        details: text.slice(0, 300),
      });
    }

    return json(res, 200, { ok: true, url: fileUrl });
  } catch (error) {
    console.error('upload-image error', error);
    return json(res, 500, { ok: false, message: String(error?.message || 'Internal server error') });
  }
};
