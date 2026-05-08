const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let indexesReady = false;

const DEFAULT_PROJECT_SUBJECTS = [
  { id: 'quicklink', title: 'QuickLink', subSubjects: ['SaaS / Productivity', 'Frontend SPA', 'URL Processing', 'QR Utility', 'SEO Layer'] },
  { id: 'studybot', title: 'StudyBot', subSubjects: ['Automation / Discord', 'Bot Commands', 'Task Scheduler', 'Reminder Engine', 'Community Layer'] },
  { id: 'transparent-clock', title: 'Transparent Clock', subSubjects: ['Windows Utility', 'WPF UI', 'Session Tracking', 'Local Storage', 'Utility Integrations'] },
  { id: 'qlynk-node-server', title: 'QLYNK Node Server', subSubjects: ['Cloud Storage / CDN', 'API Gateway', 'Storage Layer', 'Ingestion Bot', 'Security Policies'] },
  { id: 'personal-portfolio', title: 'Deep Dey | Digital Ecosystem', subSubjects: ['Web Platform / CMS', 'React Frontend', 'Vercel Serverless API', 'MongoDB Data Layer', 'Admin Dashboard'] },
];

async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db();
}

async function ensureIndexes(db) {
  if (indexesReady) return;
  await db.collection('feedbacks').createIndex({ userId: 1, subjectSlug: 1, subSubjectId: 1 }, { unique: true, name: 'feedback_unique_area_per_user' });
  await db.collection('feedbacks').createIndex({ isPinned: 1, createdAt: -1 });
  await db.collection('feedback_subjects').createIndex({ slug: 1 }, { unique: true, name: 'feedback_subject_slug_unique' });
  indexesReady = true;
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

function getParam(req, name) {
  try {
    return new URL(req.url, 'http://x').searchParams.get(name);
  } catch {
    return (req.query && req.query[name]) || null;
  }
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
  const cookies = parseCookies(req.headers.cookie);
  return cookies.dd_auth === 'authenticated';
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

function normalizeSubSubject(name, id) {
  const trimmed = String(name || '').trim();
  const slug = slugify(trimmed);
  return {
    id: id || `${slug || 'item'}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    name: trimmed,
  };
}

function formatSubject(subject) {
  const seen = new Set();
  const subSubjects = Array.isArray(subject.subSubjects)
    ? subject.subSubjects
        .filter((item) => item && !item.hidden)
        .map((item) => normalizeSubSubject(item.name, item.id))
        .filter((item) => item.name && item.slug && !seen.has(item.slug) && seen.add(item.slug))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    id: String(subject._id || subject.id || subject.slug),
    slug: subject.slug,
    name: subject.name,
    source: subject.source === 'manual' ? 'manual' : 'auto',
    linkedProjectId: subject.linkedProjectId || undefined,
    subSubjects,
  };
}

function buildDefaultProjectSubjects(projects) {
  return projects
    .map((project) => {
      const title = String(project.title || '').trim();
      const subjectSlug = slugify(title);
      if (!title || !subjectSlug) return null;

      const rawSubSubjects = [
        project.category,
        ...(Array.isArray(project.architectureLayers) ? project.architectureLayers : []),
      ];

      const seen = new Set();
      const subSubjects = rawSubSubjects
        .map((entry) => normalizeSubSubject(entry))
        .filter((entry) => entry.name && entry.slug && !seen.has(entry.slug) && seen.add(entry.slug));

      return {
        slug: subjectSlug,
        name: title,
        source: 'auto',
        linkedProjectId: String(project.id || subjectSlug),
        subSubjects,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getProjectSubjects(db) {
  const config = await db.collection('config').findOne({ _id: 'site_config' });
  const projectsMode = config?.projectsMode || 'default';

  if (projectsMode === 'custom') {
    const items = await db.collection('projects').find({}).sort({ sortOrder: 1, title: 1 }).toArray();
    if (items.length > 0) return buildDefaultProjectSubjects(items);
  }

  return buildDefaultProjectSubjects(DEFAULT_PROJECT_SUBJECTS);
}

async function getMergedSubjects(db) {
  const [autoSubjects, storedDocs] = await Promise.all([
    getProjectSubjects(db),
    db.collection('feedback_subjects').find({ hidden: { $ne: true } }).toArray(),
  ]);

  const storedBySlug = new Map(storedDocs.map((doc) => [doc.slug, doc]));
  const merged = [];

  for (const autoSubject of autoSubjects) {
    const stored = storedBySlug.get(autoSubject.slug);
    if (stored) {
      merged.push(formatSubject({
        ...autoSubject,
        ...stored,
        name: stored.name || autoSubject.name,
        source: stored.source || 'auto',
        subSubjects: Array.isArray(stored.subSubjects) ? stored.subSubjects : autoSubject.subSubjects,
      }));
      storedBySlug.delete(autoSubject.slug);
    } else {
      merged.push(formatSubject(autoSubject));
    }
  }

  for (const doc of storedBySlug.values()) {
    merged.push(formatSubject(doc));
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

async function ensureStoredSubject(db, subjectSlug) {
  const subjectsCol = db.collection('feedback_subjects');
  const existing = await subjectsCol.findOne({ slug: subjectSlug });
  if (existing) return existing;

  const autoSubjects = await getProjectSubjects(db);
  const autoSubject = autoSubjects.find((item) => item.slug === subjectSlug);
  if (!autoSubject) return null;

  const doc = {
    slug: autoSubject.slug,
    name: autoSubject.name,
    source: 'auto',
    linkedProjectId: autoSubject.linkedProjectId || null,
    hidden: false,
    subSubjects: autoSubject.subSubjects,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await subjectsCol.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function verifyGoogleToken(token) {
  if (!token) return null;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    const data = await response.json();
    if (data.error || !data.sub) return null;
    if (clientId && data.aud !== clientId) return null;
    return {
      userId: data.sub,
      name: data.name || data.given_name || 'Anonymous',
      picture: data.picture || '',
    };
  } catch {
    return null;
  }
}

async function censorText(db, text) {
  const blacklist = await db.collection('comment_blacklist').find({}).toArray();
  if (!blacklist.length) return text;

  let result = String(text || '');
  for (const item of blacklist) {
    const word = String(item.word || '').trim();
    if (!word) continue;
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, (match) => '*'.repeat(match.length));
  }
  return result;
}

function normalizeFeedback(doc) {
  return {
    ...doc,
    _id: String(doc._id),
    sourceKey: `${doc.subjectSlug}:${doc.subSubjectId}`,
    userPic: doc.userId === 'owner' ? '/assets/images/myphoto.png' : String(doc.userPic || ''),
  };
}

async function getSummary(db) {
  const feedbacksCol = db.collection('feedbacks');
  const [buckets, totals] = await Promise.all([
    feedbacksCol.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]).toArray(),
    feedbacksCol.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, average: { $avg: '$rating' } } },
    ]).toArray(),
  ]);

  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: buckets.find((bucket) => Number(bucket._id) === rating)?.count || 0,
  }));

  return {
    total: totals[0]?.total || 0,
    average: Number((totals[0]?.average || 0).toFixed(1)),
    distribution,
  };
}

async function getMetrics(db, subjects) {
  const feedbacksCol = db.collection('feedbacks');
  const [totalFeedbacks, pinnedFeedbacks] = await Promise.all([
    feedbacksCol.countDocuments(),
    feedbacksCol.countDocuments({ isPinned: true }),
  ]);

  const totalSubSubjects = subjects.reduce((sum, subject) => sum + subject.subSubjects.length, 0);
  return {
    totalFeedbacks,
    pinnedFeedbacks,
    totalSubjects: subjects.length,
    totalSubSubjects,
  };
}

async function getFeedbackStorage(db) {
  const items = await db.collection('feedbacks').find({}, { projection: { message: 1, headline: 1, subjectName: 1, subSubjectName: 1, userName: 1, rating: 1, isPinned: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(250).toArray();
  return {
    count: await db.collection('feedbacks').countDocuments(),
    approxBytes: items.reduce((sum, item) => sum + Buffer.byteLength(JSON.stringify(item), 'utf8'), 0),
  };
}

async function getUserSubmissionKeys(db, userId) {
  if (!userId) return [];
  const docs = await db.collection('feedbacks').find({ userId }, { projection: { subjectSlug: 1, subSubjectId: 1 } }).toArray();
  return docs.map((doc) => `${doc.subjectSlug}:${doc.subSubjectId}`);
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
    await ensureIndexes(db);
    const feedbacksCol = db.collection('feedbacks');
    const subjectsCol = db.collection('feedback_subjects');
    const action = getParam(req, 'action') || '';

    if (req.method === 'GET') {
      if (action === 'featured') {
        const feedbacks = await feedbacksCol.find({ isPinned: true }).sort({ createdAt: -1 }).limit(50).toArray();
        return json(res, 200, { ok: true, feedbacks: feedbacks.map(normalizeFeedback) });
      }

      const subjects = await getMergedSubjects(db);

      if (action === 'admin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

        const [feedbacks, summary, metrics, storage] = await Promise.all([
          feedbacksCol.find({}).sort({ isPinned: -1, createdAt: -1 }).limit(250).toArray(),
          getSummary(db),
          getMetrics(db, subjects),
          getFeedbackStorage(db),
        ]);

        return json(res, 200, {
          ok: true,
          subjects,
          feedbacks: feedbacks.map(normalizeFeedback),
          summary,
          metrics,
          storage,
        });
      }

      const userId = String(getParam(req, 'userId') || '').trim();
      const [feedbacks, pinnedFeedbacks, summary, metrics, userSubmissionKeys] = await Promise.all([
        feedbacksCol.find({}).sort({ createdAt: -1 }).limit(60).toArray(),
        feedbacksCol.find({ isPinned: true }).sort({ createdAt: -1 }).limit(40).toArray(),
        getSummary(db),
        getMetrics(db, subjects),
        getUserSubmissionKeys(db, userId),
      ]);

      return json(res, 200, {
        ok: true,
        subjects,
        feedbacks: feedbacks.map(normalizeFeedback),
        pinnedFeedbacks: pinnedFeedbacks.map(normalizeFeedback),
        summary,
        metrics,
        userSubmissionKeys,
      });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);

      if (action === 'subject') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const name = String(body.name || '').trim();
        if (!name) return json(res, 400, { ok: false, message: 'Subject name required' });
        const slug = slugify(name);
        if (!slug) return json(res, 400, { ok: false, message: 'Invalid subject name' });

        const existing = await subjectsCol.findOne({ slug });
        if (existing && existing.hidden !== true) return json(res, 409, { ok: false, message: 'Subject already exists' });

        await subjectsCol.updateOne(
          { slug },
          {
            $set: {
              slug,
              name,
              source: 'manual',
              hidden: false,
              updatedAt: new Date(),
            },
            $setOnInsert: { subSubjects: [], createdAt: new Date() },
          },
          { upsert: true },
        );

        return json(res, 200, { ok: true });
      }

      if (action === 'sub-subject') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const subjectSlug = slugify(body.subjectSlug || body.subjectId || '');
        const name = String(body.name || '').trim();
        if (!subjectSlug || !name) return json(res, 400, { ok: false, message: 'Subject and sub-subject are required' });

        const subjectDoc = await ensureStoredSubject(db, subjectSlug);
        if (!subjectDoc) return json(res, 404, { ok: false, message: 'Subject not found' });

        const subSubject = normalizeSubSubject(name);
        const existing = (subjectDoc.subSubjects || []).find((item) => item.slug === subSubject.slug && !item.hidden);
        if (existing) return json(res, 409, { ok: false, message: 'Sub-subject already exists' });

        await subjectsCol.updateOne(
          { _id: subjectDoc._id },
          {
            $push: { subSubjects: { ...subSubject, hidden: false } },
            $set: { updatedAt: new Date(), hidden: false },
          },
        );

        return json(res, 200, { ok: true });
      }

      if (action === 'pin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const id = String(body.id || body.feedbackId || '').trim();
        if (!ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'Invalid feedback id' });
        await feedbacksCol.updateOne({ _id: new ObjectId(id) }, { $set: { isPinned: Boolean(body.pin) } });
        return json(res, 200, { ok: true });
      }

      const subjectSlug = slugify(body.subjectSlug || '');
      const subSubjectId = String(body.subSubjectId || '').trim();
      const rating = Number(body.rating || 0);
      const headline = String(body.headline || '').trim().slice(0, 120);
      const message = String(body.message || '').trim().slice(0, 800);

      if (!subjectSlug || !subSubjectId || !headline || !message || rating < 1 || rating > 5) {
        return json(res, 400, { ok: false, message: 'Subject, sub-subject, rating, headline, and message are required.' });
      }

      const subjects = await getMergedSubjects(db);
      const subject = subjects.find((item) => item.slug === subjectSlug);
      const subSubject = subject?.subSubjects.find((item) => item.id === subSubjectId);
      if (!subject || !subSubject) return json(res, 400, { ok: false, message: 'Invalid subject area selected.' });

      let userInfo = null;
      if (isAuthenticated(req)) {
        userInfo = { userId: 'owner', name: 'Deep Dey', picture: '/assets/images/myphoto.png' };
      } else {
        userInfo = await verifyGoogleToken(String(body.credential || ''));
      }

      if (!userInfo || !userInfo.userId) {
        return json(res, 401, { ok: false, message: 'Valid login required to post feedback.' });
      }

      const filteredHeadline = await censorText(db, headline);
      const filteredMessage = await censorText(db, message);
      const doc = {
        userId: userInfo.userId,
        userName: userInfo.name,
        userPic: userInfo.userId === 'owner' ? '/assets/images/myphoto.png' : userInfo.picture,
        subjectSlug: subject.slug,
        subjectName: subject.name,
        subSubjectId: subSubject.id,
        subSubjectSlug: subSubject.slug,
        subSubjectName: subSubject.name,
        rating,
        headline: filteredHeadline,
        message: filteredMessage,
        isPinned: false,
        createdAt: new Date(),
        createdAtIST: nowIST(),
      };

      try {
        const result = await feedbacksCol.insertOne(doc);
        return json(res, 201, { ok: true, feedback: normalizeFeedback({ ...doc, _id: result.insertedId }) });
      } catch (error) {
        if (error && error.code === 11000) {
          return json(res, 409, { ok: false, message: 'You have already posted feedback for this specific area.' });
        }
        throw error;
      }
    }

    if (req.method === 'PUT') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const body = await readBody(req);

      if (action === 'subject') {
        const currentSlug = slugify(body.currentSlug || body.slug || body.id || '');
        const name = String(body.name || '').trim();
        if (!currentSlug || !name) return json(res, 400, { ok: false, message: 'Subject update requires current slug and name.' });

        const subjectDoc = await ensureStoredSubject(db, currentSlug);
        if (!subjectDoc) return json(res, 404, { ok: false, message: 'Subject not found' });

        const nextSlug = slugify(name);
        if (!nextSlug) return json(res, 400, { ok: false, message: 'Invalid subject name' });
        if (nextSlug !== currentSlug) {
          const existing = await subjectsCol.findOne({ slug: nextSlug, hidden: { $ne: true } });
          if (existing) return json(res, 409, { ok: false, message: 'Another subject already uses that name.' });
        }

        await subjectsCol.updateOne(
          { _id: subjectDoc._id },
          { $set: { name, slug: nextSlug, hidden: false, updatedAt: new Date() } },
        );
        await feedbacksCol.updateMany({ subjectSlug: currentSlug }, { $set: { subjectSlug: nextSlug, subjectName: name } });
        return json(res, 200, { ok: true });
      }

      if (action === 'sub-subject') {
        const subjectSlug = slugify(body.subjectSlug || body.subjectId || '');
        const subSubjectId = String(body.subSubjectId || '').trim();
        const name = String(body.name || '').trim();
        if (!subjectSlug || !subSubjectId || !name) return json(res, 400, { ok: false, message: 'Sub-subject update requires subject, item, and name.' });

        const subjectDoc = await ensureStoredSubject(db, subjectSlug);
        if (!subjectDoc) return json(res, 404, { ok: false, message: 'Subject not found' });

        const nextSlug = slugify(name);
        const current = (subjectDoc.subSubjects || []).find((item) => item.id === subSubjectId && !item.hidden);
        if (!current) return json(res, 404, { ok: false, message: 'Sub-subject not found' });
        const duplicate = (subjectDoc.subSubjects || []).find((item) => item.id !== subSubjectId && !item.hidden && item.slug === nextSlug);
        if (duplicate) return json(res, 409, { ok: false, message: 'Another sub-subject already uses that name.' });

        const nextSubSubjects = (subjectDoc.subSubjects || []).map((item) => item.id === subSubjectId
          ? { ...item, name, slug: nextSlug, hidden: false }
          : item);

        await subjectsCol.updateOne(
          { _id: subjectDoc._id },
          { $set: { subSubjects: nextSubSubjects, hidden: false, updatedAt: new Date() } },
        );
        await feedbacksCol.updateMany(
          { subjectSlug, subSubjectId },
          { $set: { subSubjectSlug: nextSlug, subSubjectName: name } },
        );
        return json(res, 200, { ok: true });
      }

      return json(res, 400, { ok: false, message: 'Unsupported update action.' });
    }

    if (req.method === 'DELETE') {
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      if (action === 'subject') {
        const subjectSlug = slugify(getParam(req, 'subjectSlug') || getParam(req, 'id') || '');
        if (!subjectSlug) return json(res, 400, { ok: false, message: 'Subject required' });

        const subjectDoc = await ensureStoredSubject(db, subjectSlug);
        if (!subjectDoc) return json(res, 404, { ok: false, message: 'Subject not found' });

        await subjectsCol.updateOne({ _id: subjectDoc._id }, { $set: { hidden: true, updatedAt: new Date() } });
        return json(res, 200, { ok: true });
      }

      if (action === 'sub-subject') {
        const subjectSlug = slugify(getParam(req, 'subjectSlug') || '');
        const subSubjectId = String(getParam(req, 'subSubjectId') || '').trim();
        if (!subjectSlug || !subSubjectId) return json(res, 400, { ok: false, message: 'Subject and sub-subject are required' });

        const subjectDoc = await ensureStoredSubject(db, subjectSlug);
        if (!subjectDoc) return json(res, 404, { ok: false, message: 'Subject not found' });

        const nextSubSubjects = (subjectDoc.subSubjects || []).map((item) => item.id === subSubjectId ? { ...item, hidden: true } : item);
        await subjectsCol.updateOne({ _id: subjectDoc._id }, { $set: { subSubjects: nextSubSubjects, updatedAt: new Date() } });
        return json(res, 200, { ok: true });
      }

      const id = String(getParam(req, 'id') || '').trim();
      if (!ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'Invalid feedback id' });
      await feedbacksCol.deleteOne({ _id: new ObjectId(id) });
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { ok: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Feedback API error:', error);
    if (error?.message === 'MONGODB_URI not set') {
      return json(res, 503, { ok: false, message: 'Database not configured.' });
    }
    return json(res, 500, { ok: false, message: 'Internal server error.' });
  }
};
