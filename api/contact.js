const rateMap = globalThis.__ddRateMap || new Map();
globalThis.__ddRateMap = rateMap;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8') || '{}');
    if (typeof req.body === 'object') return req.body;
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk.toString('utf8'); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return json(res, 405, { ok: false, message: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'unknown';
    const now = Date.now();
    const last = rateMap.get(ip) || 0;
    if (now - last < 15000) {
      return json(res, 429, { ok: false, message: 'Too many requests. Try after 15 seconds.' });
    }
    rateMap.set(ip, now);

    const body = await readBody(req);

    if (body.companyWebsite) {
      return json(res, 200, { ok: true, message: 'Submission accepted.' });
    }

    const required = ['name', 'email', 'supportType', 'subject', 'message'];
    const missing = required.filter((key) => !String(body[key] || '').trim());
    if (missing.length) {
      return json(res, 400, { ok: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    const idPart =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().slice(0, 8).toUpperCase()
        : `${Date.now().toString(36).toUpperCase()}`;
    const ticketId = `DD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${idPart}`;
    const autoReply = {
      ticketId,
      routedTo: body.supportType,
      sla: 'Initial response within 24-48 hours during active cycle; longer during academic hiatus.',
      message: 'Thanks for contacting Deep Dey. Your inquiry has been queued and routed to the correct node.',
    };

    return json(res, 200, { ok: true, autoReply });
  } catch (err) {
    return json(res, 500, { ok: false, message: 'Internal server error. Please try again later.' });
  }
};
