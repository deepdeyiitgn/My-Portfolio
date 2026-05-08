/**
 * /api/categories
 * GET    → list all categories
 * POST   → create category (requires dd_auth cookie)
 * PUT    → update category (requires dd_auth cookie)
 * DELETE ?id=<id> → delete category (requires dd_auth cookie)
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

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getParam(req, name) {
  try {
    const url = new URL(req.url, 'http://x');
    return url.searchParams.get(name);
  } catch {
    return (req.query && req.query[name]) || null;
  }
}

function normalizeSubSubjects(values) {
  if (!Array.isArray(values)) return [];
  const unique = new Set();
  for (const item of values) {
    const value = String(item || '').trim().slice(0, 60);
    if (value) unique.add(value);
    if (unique.size >= 20) break;
  }
  return Array.from(unique);
}

function projectDefaultSubSubjects() {
  return ['UI/UX', 'Performance', 'Bug Report', 'Feature Request', 'General', 'Security'];
}

function systemDefaultSubjects() {
  return [
    {
      name: 'System / Platform',
      slug: 'system-platform',
      source: 'system',
      subSubjects: ['UI/UX', 'Performance', 'Accessibility', 'Stability', 'Security', 'General'],
      isDefault: true,
    },
    {
      name: 'Owner (Deep Dey)',
      slug: 'owner-deep-dey',
      source: 'owner',
      subSubjects: ['Communication', 'Support', 'Professionalism', 'Collaboration', 'Mentorship', 'General'],
      isDefault: true,
    },
  ];
}

async function getProjectSubjectNames(db) {
  const fallback = ['QuickLink', 'StudyBot', 'Transparent Clock', 'QLYNK Node Server', 'Deep Dey | Digital Ecosystem'];
  try {
    const config = await db.collection('config').findOne({ _id: 'site_config' }, { projection: { projectsMode: 1 } });
    if (config?.projectsMode === 'custom') {
      const custom = await db.collection('projects').find({}, { projection: { title: 1 } }).sort({ sortOrder: 1, createdAt: 1 }).toArray();
      const names = custom.map((p) => String(p.title || '').trim()).filter(Boolean);
      return names.length ? names : fallback;
    }
  } catch {
    // fallback only
  }
  return fallback;
}

async function getFeedbackCategories(db) {
  const col = db.collection('feedback_categories');
  const projectSubjects = await getProjectSubjectNames(db);

  const defaults = [
    ...projectSubjects.map((name) => ({
      name,
      slug: slugify(name),
      source: 'project',
      subSubjects: projectDefaultSubSubjects(),
      isDefault: true,
    })),
    ...systemDefaultSubjects(),
  ];

  const customDocs = await col.find({}).sort({ createdAt: 1 }).toArray();
  const hiddenSlugs = new Set(customDocs.filter((d) => d.hidden).map((d) => String(d.slug || '').trim()).filter(Boolean));
  const overrideMap = new Map(
    customDocs
      .filter((d) => !d.hidden && d.slug)
      .map((d) => [String(d.slug), d]),
  );

  const merged = [];
  const usedSlugs = new Set();

  for (const base of defaults) {
    if (!base.slug || hiddenSlugs.has(base.slug)) continue;
    const override = overrideMap.get(base.slug);
    usedSlugs.add(base.slug);
    merged.push({
      _id: String(override?._id || `default:${base.slug}`),
      name: String(override?.name || base.name),
      slug: base.slug,
      source: String(override?.source || base.source),
      subSubjects: normalizeSubSubjects(override?.subSubjects || base.subSubjects),
      isDefault: Boolean(base.isDefault),
    });
  }

  for (const doc of customDocs) {
    const slug = String(doc.slug || '').trim();
    if (!slug || doc.hidden || usedSlugs.has(slug)) continue;
    merged.push({
      _id: String(doc._id),
      name: String(doc.name || ''),
      slug,
      source: String(doc.source || 'custom'),
      subSubjects: normalizeSubSubjects(doc.subSubjects || []),
      isDefault: false,
    });
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const db = await getDb();
    const col = db.collection('categories');
    const type = String(getParam(req, 'type') || '').trim();
    const isFeedbackType = type === 'feedback';

    if (req.method === 'GET') {
      if (isFeedbackType) {
        const categories = await getFeedbackCategories(db);
        return json(res, 200, { ok: true, categories });
      }
      const cats = await col.find({}).sort({ name: 1 }).toArray();
      return json(res, 200, { ok: true, categories: cats });
    }

    if (req.method === 'POST') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const body = await readBody(req);
      if (isFeedbackType) {
        const feedbackCol = db.collection('feedback_categories');
        const name = String(body.name || '').trim();
        const requestedSlug = String(body.slug || '').trim();
        const slug = slugify(requestedSlug || name);
        const subSubjects = normalizeSubSubjects(body.subSubjects || []);
        const source = String(body.source || 'custom').trim() || 'custom';
        if (!name || !slug) return json(res, 400, { ok: false, message: 'Subject name required' });
        const now = new Date();
        await feedbackCol.updateOne(
          { slug },
          {
            $set: { name, slug, source, subSubjects, hidden: false, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          { upsert: true },
        );
        return json(res, 201, { ok: true });
      }
      const name = String(body.name || '').trim();
      if (!name) return json(res, 400, { ok: false, message: 'Category name required' });
      const slug = slugify(name);
      const existing = await col.findOne({ slug });
      if (existing) return json(res, 409, { ok: false, message: 'Category already exists' });
      const result = await col.insertOne({ name, slug, createdAt: new Date() });
      return json(res, 201, { ok: true, category: { _id: result.insertedId, name, slug } });
    }

    if (req.method === 'PUT') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const body = await readBody(req);

      if (isFeedbackType) {
        const feedbackCol = db.collection('feedback_categories');
        const id = String(body.id || body._id || '').trim();
        const name = String(body.name || '').trim();
        const requestedSlug = String(body.slug || '').trim();
        const slug = slugify(requestedSlug || name);
        const subSubjects = normalizeSubSubjects(body.subSubjects || []);
        const source = String(body.source || 'custom').trim() || 'custom';
        if ((!id && !slug) || !name) return json(res, 400, { ok: false, message: 'Valid subject required' });
        const now = new Date();
        if (id && ObjectId.isValid(id)) {
          await feedbackCol.updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, slug: slug || undefined, source, subSubjects, hidden: false, updatedAt: now } },
          );
          return json(res, 200, { ok: true });
        }
        await feedbackCol.updateOne(
          { slug },
          {
            $set: { name, slug, source, subSubjects, hidden: false, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          { upsert: true },
        );
        return json(res, 200, { ok: true });
      }

      const id = String(body.id || body._id || '').trim();
      const name = String(body.name || '').trim();
      if (!id || !ObjectId.isValid(id) || !name) return json(res, 400, { ok: false, message: 'Valid id and name required' });
      await col.updateOne({ _id: new ObjectId(id) }, { $set: { name, slug: slugify(name), updatedAt: new Date() } });
      return json(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const id = getParam(req, 'id');
      const slug = slugify(String(getParam(req, 'slug') || ''));
      if (isFeedbackType) {
        const feedbackCol = db.collection('feedback_categories');
        if (id && ObjectId.isValid(id)) {
          await feedbackCol.deleteOne({ _id: new ObjectId(id) });
          return json(res, 200, { ok: true, message: 'Deleted' });
        }
        if (!slug) return json(res, 400, { ok: false, message: 'id or slug required' });
        await feedbackCol.updateOne(
          { slug },
          {
            $set: { slug, hidden: true, updatedAt: new Date() },
            $setOnInsert: { name: slug, source: 'custom', subSubjects: [], createdAt: new Date() },
          },
          { upsert: true },
        );
        return json(res, 200, { ok: true, message: 'Deleted' });
      }
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'id required' });
      await col.deleteOne({ _id: new ObjectId(id) });
      return json(res, 200, { ok: true, message: 'Deleted' });
    }

    return json(res, 405, { ok: false, message: 'Method not allowed' });
  } catch (err) {
    console.error('Categories error:', err);
    if (err.message === 'MONGODB_URI not set') {
      return json(res, 503, { ok: false, message: 'Database not configured.' });
    }
    return json(res, 500, { ok: false, message: 'Internal server error.' });
  }
};
