/**
 * /api/categories
 * GET    → list categories (supports ?type=feedback)
 * POST   → create category / feedback subject or sub-subject (requires dd_auth cookie)
 * PUT    → update feedback subject/sub-subject (requires dd_auth cookie)
 * DELETE → delete category / feedback subject/sub-subject (requires dd_auth cookie)
 */

const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;

const DEFAULT_PROJECT_SUBSUBJECTS = [
  'UI/UX',
  'Performance',
  'Bug Report',
  'Feature Request',
  'General',
  'Security',
];

const DEFAULT_CUSTOM_SUBJECTS = [
  {
    subject: 'System / Platform',
    subSubjects: ['Architecture', 'Performance', 'Reliability', 'UI/UX', 'Security', 'General'],
  },
  {
    subject: 'Owner (Deep Dey)',
    subSubjects: ['Communication', 'Mentorship', 'Collaboration', 'Professionalism', 'General'],
  },
];

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
  return String(str || '')
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
  const seen = new Set();
  const source = Array.isArray(values)
    ? values
    : String(values || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  const normalized = [];
  for (const item of source) {
    const name = String(item || '').trim().slice(0, 80);
    if (!name) continue;
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    normalized.push({ name, slug });
  }
  return normalized;
}

async function ensureFeedbackSeed(db) {
  const col = db.collection('feedback_categories');
  const count = await col.countDocuments({});
  if (count > 0) return;

  const now = new Date();
  const docs = [];

  const projects = await db.collection('projects').find({}, { projection: { title: 1 } }).toArray();
  const projectSubjects = projects
    .map((p) => String(p?.title || '').trim())
    .filter(Boolean)
    .slice(0, 200);

  for (const subject of projectSubjects) {
    docs.push({
      type: 'feedback',
      subject,
      subjectSlug: slugify(subject),
      subSubjects: normalizeSubSubjects(DEFAULT_PROJECT_SUBSUBJECTS),
      source: 'project',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const cfg of DEFAULT_CUSTOM_SUBJECTS) {
    docs.push({
      type: 'feedback',
      subject: cfg.subject,
      subjectSlug: slugify(cfg.subject),
      subSubjects: normalizeSubSubjects(cfg.subSubjects),
      source: 'custom',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const bySlug = new Map();
  for (const d of docs) {
    if (!d.subjectSlug || bySlug.has(d.subjectSlug)) continue;
    bySlug.set(d.subjectSlug, d);
  }

  const finalDocs = [...bySlug.values()];
  if (finalDocs.length > 0) {
    await col.insertMany(finalDocs, { ordered: false });
  }
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
    const type = String(getParam(req, 'type') || '').trim().toLowerCase();

    // =========================================================
    // Feedback category system (subjects + sub-subjects)
    // =========================================================
    if (type === 'feedback') {
      const feedbackCol = db.collection('feedback_categories');

      if (req.method === 'GET') {
        await ensureFeedbackSeed(db);
        const categories = await feedbackCol.find({ type: 'feedback' }).sort({ subject: 1 }).toArray();
        return json(res, 200, { ok: true, categories });
      }

      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      if (req.method === 'POST') {
        const body = await readBody(req);
        const action = String(body.action || 'create-subject').trim();

        if (action === 'create-subject') {
          const subject = String(body.subject || body.name || '').trim().slice(0, 120);
          if (!subject) return json(res, 400, { ok: false, message: 'subject required' });
          const subjectSlug = slugify(subject);
          if (!subjectSlug) return json(res, 400, { ok: false, message: 'Invalid subject' });
          const exists = await feedbackCol.findOne({ type: 'feedback', subjectSlug });
          if (exists) return json(res, 409, { ok: false, message: 'Subject already exists' });

          const subSubjects = normalizeSubSubjects(body.subSubjects || body.subsubjects || []);
          const now = new Date();
          const doc = {
            type: 'feedback',
            subject,
            subjectSlug,
            subSubjects,
            source: 'custom',
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          };
          const result = await feedbackCol.insertOne(doc);
          return json(res, 201, { ok: true, category: { ...doc, _id: result.insertedId } });
        }

        if (action === 'create-subsubject') {
          const categoryId = String(body.categoryId || '').trim();
          const name = String(body.name || '').trim().slice(0, 80);
          if (!categoryId || !ObjectId.isValid(categoryId)) return json(res, 400, { ok: false, message: 'categoryId required' });
          if (!name) return json(res, 400, { ok: false, message: 'name required' });

          const category = await feedbackCol.findOne({ _id: new ObjectId(categoryId), type: 'feedback' });
          if (!category) return json(res, 404, { ok: false, message: 'Subject not found' });

          const slug = slugify(name);
          if (!slug) return json(res, 400, { ok: false, message: 'Invalid name' });
          const existing = Array.isArray(category.subSubjects) ? category.subSubjects : [];
          if (existing.some((s) => s?.slug === slug)) {
            return json(res, 409, { ok: false, message: 'Sub-subject already exists' });
          }

          const next = [...existing, { name, slug }];
          await feedbackCol.updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: { subSubjects: next, updatedAt: new Date(), isDefault: false } },
          );
          const updated = await feedbackCol.findOne({ _id: new ObjectId(categoryId) });
          return json(res, 200, { ok: true, category: updated });
        }

        return json(res, 400, { ok: false, message: 'Invalid action' });
      }

      if (req.method === 'PUT') {
        const body = await readBody(req);
        const action = String(body.action || '').trim();
        const categoryId = String(body.categoryId || '').trim();
        if (!categoryId || !ObjectId.isValid(categoryId)) return json(res, 400, { ok: false, message: 'categoryId required' });

        const category = await feedbackCol.findOne({ _id: new ObjectId(categoryId), type: 'feedback' });
        if (!category) return json(res, 404, { ok: false, message: 'Subject not found' });

        if (action === 'update-subject') {
          const subject = String(body.subject || '').trim().slice(0, 120);
          if (!subject) return json(res, 400, { ok: false, message: 'subject required' });
          const subjectSlug = slugify(subject);
          const duplicate = await feedbackCol.findOne({ type: 'feedback', subjectSlug, _id: { $ne: new ObjectId(categoryId) } });
          if (duplicate) return json(res, 409, { ok: false, message: 'Subject already exists' });
          await feedbackCol.updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: { subject, subjectSlug, updatedAt: new Date(), isDefault: false } },
          );
          const updated = await feedbackCol.findOne({ _id: new ObjectId(categoryId) });
          return json(res, 200, { ok: true, category: updated });
        }

        if (action === 'update-subsubject') {
          const oldSlug = slugify(body.oldName || body.oldSlug || body.subSubjectSlug || '');
          const nextName = String(body.name || '').trim().slice(0, 80);
          if (!oldSlug) return json(res, 400, { ok: false, message: 'oldName required' });
          if (!nextName) return json(res, 400, { ok: false, message: 'name required' });
          const nextSlug = slugify(nextName);

          const subSubjects = Array.isArray(category.subSubjects) ? category.subSubjects : [];
          const idx = subSubjects.findIndex((s) => s?.slug === oldSlug);
          if (idx === -1) return json(res, 404, { ok: false, message: 'Sub-subject not found' });
          if (subSubjects.some((s, i) => i !== idx && s?.slug === nextSlug)) {
            return json(res, 409, { ok: false, message: 'Sub-subject already exists' });
          }

          const next = subSubjects.map((s, i) => (i === idx ? { name: nextName, slug: nextSlug } : s));
          await feedbackCol.updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: { subSubjects: next, updatedAt: new Date(), isDefault: false } },
          );
          const updated = await feedbackCol.findOne({ _id: new ObjectId(categoryId) });
          return json(res, 200, { ok: true, category: updated });
        }

        return json(res, 400, { ok: false, message: 'Invalid action' });
      }

      if (req.method === 'DELETE') {
        const action = String(getParam(req, 'action') || '').trim();
        const categoryId = String(getParam(req, 'categoryId') || getParam(req, 'id') || '').trim();

        if (!categoryId || !ObjectId.isValid(categoryId)) return json(res, 400, { ok: false, message: 'categoryId required' });

        if (action === 'delete-subsubject') {
          const subSlug = slugify(getParam(req, 'subSlug') || getParam(req, 'name') || '');
          if (!subSlug) return json(res, 400, { ok: false, message: 'subSlug required' });
          const category = await feedbackCol.findOne({ _id: new ObjectId(categoryId), type: 'feedback' });
          if (!category) return json(res, 404, { ok: false, message: 'Subject not found' });
          const subSubjects = Array.isArray(category.subSubjects) ? category.subSubjects : [];
          const next = subSubjects.filter((s) => s?.slug !== subSlug);
          await feedbackCol.updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: { subSubjects: next, updatedAt: new Date(), isDefault: false } },
          );
          const updated = await feedbackCol.findOne({ _id: new ObjectId(categoryId) });
          return json(res, 200, { ok: true, category: updated });
        }

        await feedbackCol.deleteOne({ _id: new ObjectId(categoryId), type: 'feedback' });
        return json(res, 200, { ok: true, message: 'Deleted' });
      }

      return json(res, 405, { ok: false, message: 'Method not allowed' });
    }

    // =========================================================
    // Existing journal categories
    // =========================================================
    const col = db.collection('categories');

    if (req.method === 'GET') {
      const cats = await col.find({}).sort({ name: 1 }).toArray();
      return json(res, 200, { ok: true, categories: cats });
    }

    if (req.method === 'POST') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      if (!name) return json(res, 400, { ok: false, message: 'Category name required' });
      const slug = slugify(name);
      const existing = await col.findOne({ slug });
      if (existing) return json(res, 409, { ok: false, message: 'Category already exists' });
      const result = await col.insertOne({ name, slug, createdAt: new Date() });
      return json(res, 201, { ok: true, category: { _id: result.insertedId, name, slug } });
    }

    if (req.method === 'DELETE') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const id = (req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id');
      if (!id) return json(res, 400, { ok: false, message: 'id required' });
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
