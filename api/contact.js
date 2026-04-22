const rateMap = globalThis.__ddRateMap || new Map();
globalThis.__ddRateMap = rateMap;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, message: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const last = rateMap.get(ip) || 0;
  if (now - last < 15000) {
    return json(res, 429, { ok: false, message: 'Too many requests. Try after 15 seconds.' });
  }
  rateMap.set(ip, now);

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

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
};
