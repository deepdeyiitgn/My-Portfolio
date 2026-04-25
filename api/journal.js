/**
 * /api/journal
 * GET  ?page=1&limit=20&category=<slug>&published=true  → paginated list
 * GET  ?slug=<slug>|id=<id>&countView=true              → single journal entry
 * POST ?action=like&id=<id>&session=<sessionId>         → like a journal once/session
 * POST                                                   → create journal (auth required)
 * PUT                                                    → update journal (auth required); body must include _id
 * DELETE ?id=<id>                                        → delete (auth required)
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

function estimateReadMinutes(body) {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length;
  // Dashboard ki tarah backend me bhi realistic read time 110 words/minute
  return Math.max(1, Math.ceil(words / 110));
}
function nowIST() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getParam(req, name) {
  try {
    const url = new URL(req.url, 'http://x');
    return url.searchParams.get(name);
  } catch {
    return (req.query && req.query[name]) || null;
  }
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  const unique = new Set();
  for (const img of images) {
    const value = String(img || '').trim();
    if (value) unique.add(value);
  }
  return Array.from(unique);
}

async function getJournalByIdOrSlug(col, req) {
  const slugParam = getParam(req, 'slug');
  const idParam = getParam(req, 'id');
  const authed = isAuthenticated(req);

  const query = {};
  if (slugParam) query.slug = slugParam;
  if (idParam && ObjectId.isValid(idParam)) query._id = new ObjectId(idParam);

  if (!query.slug && !query._id) return null;
  if (!authed) query.published = true;

  return col.findOne(query);
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
    const col = db.collection('journals');

    if (req.method === 'GET') {
      const wantsSingle = Boolean(getParam(req, 'slug') || getParam(req, 'id'));
      if (wantsSingle) {
        const entry = await getJournalByIdOrSlug(col, req);
        if (!entry) return json(res, 404, { ok: false, message: 'Not found' });

        const shouldCountView = getParam(req, 'countView') === 'true' || getParam(req, 'countView') === '1';
        let journal = entry;
        if (shouldCountView && entry._id) {
          await col.updateOne({ _id: entry._id }, { $inc: { views: 1 } });
          journal = { ...entry, views: Number(entry.views || 0) + 1 };
        }

        return json(res, 200, { ok: true, journal });
      }

      const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
      const limit = Math.min(20, Math.max(1, parseInt(getParam(req, 'limit') || '20', 10)));
      const onlyPublished = !isAuthenticated(req);

      const filter = {};
      if (onlyPublished) filter.published = true;

      // 1. Multiple Categories Handle Karna
      const categoriesParam = getParam(req, 'categories');
      const singleCategoryParam = getParam(req, 'category'); // Fallback purane code ke liye
      
      if (categoriesParam) {
        // Agar comma separated list aati hai "tech,design" -> array banayega
        const cats = categoriesParam.split(',').map(c => c.trim()).filter(Boolean);
        if (cats.length > 0) {
          filter.categorySlug = { $in: cats };
        }
      } else if (singleCategoryParam) {
        filter.categorySlug = singleCategoryParam;
      }

      // 2. Sorting Handle Karna
      const sortParam = getParam(req, 'sort') || 'recent';
      let sortObj = { publishedAt: -1, createdAt: -1 }; // Default Recent

      if (sortParam === 'old') {
        sortObj = { publishedAt: 1, createdAt: 1 };
      } else if (sortParam === 'most-liked') {
        sortObj = { likes: -1, publishedAt: -1 };
      } else if (sortParam === 'most-viewed') {
        sortObj = { views: -1, publishedAt: -1 };
      } else if (sortParam === 'relevant') {
        // 'relevant' ke liye database sort normal rakhenge, array ko JavaScript me randomly shuffle karenge
        sortObj = { publishedAt: -1, createdAt: -1 }; 
      }

      const total = await col.countDocuments(filter);
      let journals = await col
        .find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      // Agar 'relevant' sort selected hai, toh array items ko randomly mix kar do
      if (sortParam === 'relevant') {
        journals = journals.sort(() => 0.5 - Math.random());
      }

      return json(res, 200, {
        ok: true,
        journals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (req.method === 'POST') {
      const action = getParam(req, 'action');
      if (action === 'like') {
        const id = getParam(req, 'id');
        const session = String(getParam(req, 'session') || '').trim();
        if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'Valid id required' });
        if (!session) return json(res, 400, { ok: false, message: 'session required' });

        const existing = await col.findOne({ _id: new ObjectId(id), published: true });
        if (!existing) return json(res, 404, { ok: false, message: 'Not found' });

        const likedSessions = Array.isArray(existing.likedSessions) ? existing.likedSessions : [];
        if (likedSessions.includes(session)) {
          return json(res, 200, { ok: true, alreadyLiked: true, likes: Number(existing.likes || 0) });
        }

        const nextSessions = [...likedSessions, session].slice(-5000);
        await col.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 }, $set: { likedSessions: nextSessions } },
        );

        return json(res, 200, { ok: true, likes: Number(existing.likes || 0) + 1, alreadyLiked: false });
      }

      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      const body = await readBody(req);
      const title = String(body.title || '').trim();
      const summary = String(body.summary || '').trim();
      const content = String(body.content || '').trim();
      const categorySlug = String(body.categorySlug || '').trim();
      const categoryName = String(body.categoryName || '').trim();
      const publish = Boolean(body.publish);
      const images = normalizeImages(body.images);

      if (!title) return json(res, 400, { ok: false, message: 'Title is required' });
      if (!content) return json(res, 400, { ok: false, message: 'Content is required' });

      const slug = slugify(title);
      const now = new Date();
      const doc = {
        title,
        slug,
        summary,
        content,
        categorySlug,
        categoryName,
        images,
        published: publish,
        publishedAt: publish ? now : null,
        publishedAtIST: publish ? nowIST() : null,
        createdAt: now,
        updatedAt: now,
        readMinutes: estimateReadMinutes(content),
        views: 0,
        likes: 0,
        likedSessions: [],
      };

      const result = await col.insertOne(doc);
      return json(res, 201, { ok: true, journal: { ...doc, _id: result.insertedId } });
    }

    if (req.method === 'PUT') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      const body = await readBody(req);
      const id = body._id;
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: '_id required' });

      const existing = await col.findOne({ _id: new ObjectId(id) });
      if (!existing) return json(res, 404, { ok: false, message: 'Not found' });

      const title = body.title !== undefined ? String(body.title).trim() : existing.title;
      const content = body.content !== undefined ? String(body.content).trim() : existing.content;
      const publish = body.publish !== undefined ? Boolean(body.publish) : existing.published;

      const now = new Date();
      const update = {
        title,
        slug: slugify(title),
        summary: body.summary !== undefined ? String(body.summary).trim() : existing.summary,
        content,
        categorySlug: body.categorySlug !== undefined ? String(body.categorySlug).trim() : existing.categorySlug,
        categoryName: body.categoryName !== undefined ? String(body.categoryName).trim() : existing.categoryName,
        images: body.images !== undefined ? normalizeImages(body.images) : normalizeImages(existing.images),
        published: publish,
        publishedAt: publish ? (existing.publishedAt || now) : null,
        publishedAtIST: publish ? (existing.publishedAtIST || nowIST()) : null,
        updatedAt: now,
        readMinutes: estimateReadMinutes(content),
      };

      await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
      return json(res, 200, { ok: true, journal: { ...existing, ...update } });
    }

    if (req.method === 'DELETE') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const id = getParam(req, 'id');
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'id required' });
      await col.deleteOne({ _id: new ObjectId(id) });
      return json(res, 200, { ok: true, message: 'Deleted' });
    }

    return json(res, 405, { ok: false, message: 'Method not allowed' });
  } catch (err) {
    console.error('Journal error:', err);
    if (err.message === 'MONGODB_URI not set') {
      return json(res, 503, { ok: false, message: 'Database not configured.' });
    }
    return json(res, 500, { ok: false, message: 'Internal server error.' });
  }
};
