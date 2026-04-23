/**
 * /api/timeline
 *
 * GET                          → { ok, mode, items }
 *                                mode = 'default' | 'custom'
 *                                items = custom MongoDB items (only when mode='custom')
 *
 * PUT  body: { mode: 'default'|'custom' }
 *            → update timeline display mode (auth required)
 *
 * POST body: { year, dateStr, title, school, description, iconName, iconSize, sortOrder }
 *            → create a new timeline item (auth required)
 *
 * PUT  body: { _id, year?, dateStr?, title?, school?, description?, iconName?, iconSize?, sortOrder? }
 *            → update an existing timeline item (auth required)
 *
 * DELETE ?id=<objectId>
 *            → delete an item (auth required)
 */

const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;

async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db();
}

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

function getParam(req, name) {
  try {
    const url = new URL(req.url, 'http://x');
    return url.searchParams.get(name);
  } catch {
    return (req.query && req.query[name]) || null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  let db;
  try {
    db = await getDb();
  } catch (e) {
    return json(res, 500, { ok: false, message: 'DB connection failed', details: e.message });
  }

  const settings = db.collection('settings');
  const timeline = db.collection('timeline');

  try {
    // ── GET: public ─────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const modeSetting = await settings.findOne({ key: 'timeline-mode' });
      const mode = modeSetting?.value === 'custom' ? 'custom' : 'default';

      let items = [];
      if (mode === 'custom') {
        const raw = await timeline.find({}).sort({ sortOrder: 1, year: 1 }).toArray();
        items = raw.map((item) => ({
          _id: item._id.toString(),
          year: item.year,
          dateStr: item.dateStr || String(item.year),
          title: item.title,
          school: item.school || '',
          description: item.description || '',
          iconName: item.iconName || 'Milestone',
          iconSize: item.iconSize || 20,
          sortOrder: item.sortOrder || 0,
        }));
      }
      return json(res, 200, { ok: true, mode, items });
    }

    // ── All mutating methods require auth ────────────────────────────────────
    if (!isAuthenticated(req)) {
      return json(res, 401, { ok: false, message: 'Unauthorized' });
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const id = getParam(req, 'id');
      if (!id) return json(res, 400, { ok: false, message: 'Missing id param' });
      try {
        await timeline.deleteOne({ _id: new ObjectId(id) });
      } catch {
        return json(res, 400, { ok: false, message: 'Invalid id' });
      }
      return json(res, 200, { ok: true });
    }

    const body = await readBody(req);

    // ── POST: create item ────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { year, dateStr, title, school, description, iconName, iconSize, sortOrder } = body;
      if (!title || !year) return json(res, 400, { ok: false, message: 'title and year are required' });
      const result = await timeline.insertOne({
        year: Number(year),
        dateStr: String(dateStr || year),
        title: String(title),
        school: String(school || ''),
        description: String(description || ''),
        iconName: String(iconName || 'Milestone'),
        iconSize: Number(iconSize) || 20,
        sortOrder: Number(sortOrder) || 0,
        createdAt: new Date(),
      });
      return json(res, 201, { ok: true, id: result.insertedId.toString() });
    }

    // ── PUT: mode update OR item update ──────────────────────────────────────
    if (req.method === 'PUT') {
      // Mode change — body has 'mode' key and no '_id'
      if (body.mode !== undefined && !body._id) {
        const mode = body.mode === 'custom' ? 'custom' : 'default';
        await settings.updateOne(
          { key: 'timeline-mode' },
          { $set: { key: 'timeline-mode', value: mode, updatedAt: new Date() } },
          { upsert: true }
        );
        return json(res, 200, { ok: true, mode });
      }

      // Item update
      const { _id, year, dateStr, title, school, description, iconName, iconSize, sortOrder } = body;
      if (!_id) return json(res, 400, { ok: false, message: 'Missing _id' });

      const update = { updatedAt: new Date() };
      if (year !== undefined) update.year = Number(year);
      if (dateStr !== undefined) update.dateStr = String(dateStr);
      if (title !== undefined) update.title = String(title);
      if (school !== undefined) update.school = String(school);
      if (description !== undefined) update.description = String(description);
      if (iconName !== undefined) update.iconName = String(iconName);
      if (iconSize !== undefined) update.iconSize = Number(iconSize);
      if (sortOrder !== undefined) update.sortOrder = Number(sortOrder);

      try {
        await timeline.updateOne({ _id: new ObjectId(_id) }, { $set: update });
      } catch {
        return json(res, 400, { ok: false, message: 'Invalid _id' });
      }
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { ok: false, message: 'Method not allowed' });

  } catch (e) {
    console.error('timeline api error', e);
    return json(res, 500, { ok: false, message: e.message || 'Internal server error' });
  }
};
