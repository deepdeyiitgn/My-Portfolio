/**
 * /api/journal
 * GET  ?page=1&limit=20&category=<slug>&published=true  → paginated list
 * GET  ?slug=<slug>|id=<id>&countView=true              → single journal entry
 * GET  ?action=status                                   → FETCH LIVE STATUS & HISTORY
 * GET  ?action=comments&journalId=X&page=1&sort=top     → paginated comments (top-level or replies)
 * GET  ?action=comment-count&journalIds=X,Y             → comment counts for multiple journals
 * GET  ?action=top-journals&limit=6                     → top N most-liked published journals
 * GET  ?action=blacklist                                → get blacklist words (auth required)
 * POST ?action=like&id=<id>&session=<sessionId>         → like a journal once/session
 * POST ?action=status                                   → CREATE LIVE STATUS (auth required)
 * POST ?action=comment                                  → add comment (Google token or owner cookie)
 * POST ?action=comment-like&id=<id>&session=<s>         → like a comment once/session
 * POST ?action=comment-pin                              → pin/unpin comment (auth required)
 * POST ?action=blacklist                                → add blacklist word (auth required)
 * POST                                                  → create journal (auth required)
 * PUT  ?action=comment                                  → edit own comment (Google token or owner cookie)
 * PUT                                                   → update journal (auth required); body must include _id
 * DELETE ?action=comment&id=<id>                        → delete comment (Google token or owner cookie)
 * DELETE ?action=blacklist&id=<id>                      → delete blacklist word (auth required)
 * DELETE ?id=<id>                                       → delete journal (auth required)
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
  return Math.max(1, Math.ceil(words / 110));
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
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

// ── Comment helpers ──────────────────────────────────────────────────────────

async function verifyGoogleToken(token) {
  if (!token) return null;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  try {
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    const data = await r.json();
    if (data.error || data.error_description || !data.sub) return null;
    if (clientId && data.aud !== clientId) return null;
    return {
      userId: data.sub,
      name: data.name || data.given_name || 'Anonymous',
      email: data.email || '',
      picture: data.picture || '',
    };
  } catch { return null; }
}

async function censorText(db, text) {
  try {
    const blacklist = await db.collection('comment_blacklist').find({}).toArray();
    if (!blacklist.length) return text;
    let result = text;
    for (const item of blacklist) {
      const word = String(item.word || '').trim();
      if (!word) continue;
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      result = result.replace(regex, (match) => '*'.repeat(match.length));
    }
    return result;
  } catch { return text; }
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

    // ==========================================
    // GET REQUESTS
    // ==========================================
    if (req.method === 'GET') {
      const action = getParam(req, 'action');

      // --- DB Stats: Storage usage for dashboard ---
      if (action === 'dbstats') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

        // Website DB stats (current database only)
        let overallStats = { dataSize: 0, storageSize: 0, indexSize: 0 };
        try {
          const s = await db.command({ dbStats: 1 });
          overallStats = { dataSize: s.dataSize || 0, storageSize: s.storageSize || 0, indexSize: s.indexSize || 0 };
        } catch { /* ignore */ }

        // Full cluster total (all databases on this Atlas cluster)
        let clusterTotalSize = 0;
        try {
          const listResult = await cachedClient.db('admin').command({ listDatabases: 1 });
          clusterTotalSize = listResult.totalSize || 0;
        } catch { /* Atlas M0 may not allow this — fall back to current DB size */ }

        const collectionNames = ['journals', 'projects', 'timeline', 'categories', 'live_status', 'settings', 'config', 'search_analytics'];
        const collections = {};
        for (const name of collectionNames) {
          try {
            const cursor = db.collection(name).aggregate([{ $collStats: { storageStats: {} } }]);
            const arr = await cursor.toArray();
            const cs = arr[0];
            collections[name] = {
              count: cs?.storageStats?.count || 0,
              size: cs?.storageStats?.size || 0,
              storageSize: cs?.storageStats?.storageSize || 0,
            };
          } catch {
            try {
              const count = await db.collection(name).countDocuments();
              collections[name] = { count, size: 0, storageSize: 0 };
            } catch { collections[name] = { count: 0, size: 0, storageSize: 0 }; }
          }
        }
        return json(res, 200, { ok: true, ...overallStats, clusterTotalSize, collections });
      }

      // --- Public Health Check (no auth) — used by /status page ---
      if (action === 'health') {
        const os = require('os');
        const dbPingStart = Date.now();
        try { await db.command({ ping: 1 }); } catch { /* ignore */ }
        const dbPingMs = Date.now() - dbPingStart;

        const mem = process.memoryUsage();
        const cpus = os.cpus();

        let diskInfo = null;
        try {
          const fsModule = require('fs');
          if (typeof fsModule.statfsSync === 'function') {
            const st = fsModule.statfsSync('/tmp');
            diskInfo = { total: st.blocks * st.bsize, free: st.bfree * st.bsize, available: st.bavail * st.bsize };
          }
        } catch { /* ignore — not available on all runtimes */ }

        return json(res, 200, {
          ok: true,
          timestamp: Date.now(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch(),
          osType: os.type(),
          osRelease: os.release(),
          hostname: os.hostname(),
          serverRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || process.env.FLY_REGION || '—',
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpus: cpus.map((c) => ({ model: c.model, speedMHz: c.speed, times: c.times })),
          cpuCount: cpus.length,
          processMemory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external },
          dbPingMs,
          loadAverage: os.loadavg(),
          diskInfo,
        });
      }

      // --- NAYA: Live Status Fetch Logic ---
      if (action === 'status') {
        const statusCol = db.collection('live_status');
        // Pagination ke liye up to 50 records fetch karenge
        const statuses = await statusCol.find({}).sort({ createdAt: -1 }).limit(50).toArray();
        const current = statuses.length > 0 ? statuses[0] : null;
        const history = statuses.length > 1 ? statuses.slice(1) : [];
        return json(res, 200, { ok: true, current, history });
      }

      // --- NAYA: Global Search & Easter Egg Engine ---
      if (action === 'search') {
        const q = getParam(req, 'q') || '';
        const analyticsCol = db.collection('search_analytics');

        // Always fetch the top 5 trending queries so the UI can show them even on empty state
        const trendingDocs = await analyticsCol
          .find({})
          .sort({ count: -1 })
          .limit(5)
          .toArray();
        const trending = trendingDocs.map(t => ({ query: t.query, count: t.count }));

        // If no query, just return trending data with empty results
        if (!q.trim()) {
          return json(res, 200, { ok: true, results: [], easterEgg: null, trending });
        }

        // --- Search Analytics: upsert query counter ---
        const normalizedQuery = q.trim().toLowerCase();
        await analyticsCol.updateOne(
          { query: normalizedQuery },
          {
            $inc: { count: 1 },
            $set: { lastSearched: new Date() },
            $setOnInsert: { query: normalizedQuery }
          },
          { upsert: true }
        );

        // --- Loose Multi-Keyword Matching ---
        // Escape each keyword for safe regex use, then build an $and clause so
        // every keyword must appear in at least one of the indexed fields.
        const keywords = normalizedQuery.split(/\s+/).filter(Boolean);
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const keywordConditions = keywords.map(kw => {
          const kwRegex = new RegExp(escapeRegex(kw), 'i');
          return {
            $or: [
              { title: kwRegex },
              { summary: kwRegex },
              { content: kwRegex },
              { categoryName: kwRegex }
            ]
          };
        });

        const journalsCol = db.collection('journals');
        const matchedJournals = await journalsCol.find({
          published: true,
          $and: keywordConditions
        }).sort({ createdAt: -1 }).toArray();

        // --- Multi-Keyword Snippet Generator ---
        // Strips HTML, locates each keyword, and highlights ALL keywords in every snippet.
        const getSnippets = (text, kws) => {
          if (!text || !kws.length) return [];
          const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

          const snippets = [];
          let count = 0;

          for (const kw of kws) {
            if (count >= 3) break;
            const regex = new RegExp(escapeRegex(kw), 'gi');
            let match;
            while ((match = regex.exec(plainText)) !== null && count < 3) {
              const start = Math.max(0, match.index - 40);
              const end = Math.min(plainText.length, match.index + kw.length + 40);
              let snippet = plainText.substring(start, end);
              if (start > 0) snippet = '...' + snippet;
              if (end < plainText.length) snippet += '...';

              // Highlight every matched keyword in this snippet
              for (const hw of kws) {
                snippet = snippet.replace(
                  new RegExp(`(${escapeRegex(hw)})`, 'gi'),
                  '<mark class="bg-amber-500/20 text-amber-500 rounded px-1 font-bold">$1</mark>'
                );
              }
              snippets.push(snippet);
              count++;
            }
          }

          return snippets.length > 0
            ? snippets
            : [plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '')];
        };

        const results = matchedJournals.map(j => ({
          _id: j._id,
          type: 'Journal',
          title: j.title,
          url: `/journal/view/${j.slug}`, // fixed: was /journal/${j.slug}
          category: j.categoryName,
          snippets: getSnippets(
            [j.title, j.summary, j.content].filter(Boolean).join(' | '),
            keywords
          ),
          createdAtIST: j.createdAtIST
        }));

        // --- Easter Egg Logic (Trigger Custom Status Card) ---
        const easterEggTriggers = ['status', 'deep', 'doing', 'free', 'author', 'deep dey', 'admin'];
        let easterEgg = null;
        if (easterEggTriggers.some(t => normalizedQuery.includes(t))) {
          const statusCol = db.collection('live_status');
          const latestStatus = await statusCol
            .find({ isVisible: true })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();
          if (latestStatus.length > 0) {
            easterEgg = latestStatus[0];
          }
        }

        return json(res, 200, { ok: true, results, easterEgg, trending });
      }

      // --- Comments: Get paginated comments ---
      if (action === 'comments') {
        const journalId = getParam(req, 'journalId');
        if (!journalId || !ObjectId.isValid(journalId)) return json(res, 400, { ok: false, message: 'journalId required' });

        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const sort = getParam(req, 'sort') || 'top';
        const parentIdParam = getParam(req, 'parentId');
        const isReply = Boolean(parentIdParam && ObjectId.isValid(parentIdParam));

        const commentsCol = db.collection('comments');

        // Pinned comments (top-level only, always returned regardless of page)
        let pinnedComments = [];
        if (!isReply) {
          pinnedComments = await commentsCol.find({
            journalId: new ObjectId(journalId),
            parentId: null,
            isPinned: true,
            isDeleted: { $ne: true },
          }).sort({ pinnedOrder: 1 }).toArray();
        }

        // Build filter for regular (non-pinned) comments
        const pinnedIds = pinnedComments.map(p => p._id);
        const filter = {
          journalId: new ObjectId(journalId),
          parentId: isReply ? new ObjectId(parentIdParam) : null,
          isDeleted: { $ne: true },
        };
        if (!isReply && pinnedIds.length > 0) {
          filter._id = { $nin: pinnedIds };
        }

        let sortObj;
        if (sort === 'new') sortObj = { createdAt: -1 };
        else if (sort === 'old') sortObj = { createdAt: 1 };
        else sortObj = { likes: -1, createdAt: -1 }; // top (default)

        const total = await commentsCol.countDocuments({
          journalId: new ObjectId(journalId),
          parentId: isReply ? new ObjectId(parentIdParam) : null,
          isDeleted: { $ne: true },
        });

        const comments = await commentsCol
          .find(filter)
          .sort(sortObj)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        // Get reply counts for all returned comments
        const allCommentIds = [...pinnedIds, ...comments.map(c => c._id)];
        let replyCountMap = {};
        if (allCommentIds.length > 0) {
          const replyAgg = await commentsCol.aggregate([
            { $match: { parentId: { $in: allCommentIds }, isDeleted: { $ne: true } } },
            { $group: { _id: '$parentId', count: { $sum: 1 } } },
          ]).toArray();
          replyAgg.forEach(r => { replyCountMap[r._id.toString()] = r.count; });
        }

        const addMeta = (c) => ({ ...c, replyCount: replyCountMap[c._id.toString()] || 0 });

        return json(res, 200, {
          ok: true,
          pinnedComments: pinnedComments.map(addMeta),
          comments: comments.map(addMeta),
          pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
      }

      // --- Comment Count for multiple journals ---
      if (action === 'comment-count') {
        const journalIdsParam = getParam(req, 'journalIds');
        if (!journalIdsParam) return json(res, 400, { ok: false, message: 'journalIds required' });
        const ids = journalIdsParam.split(',')
          .map(s => s.trim())
          .filter(s => ObjectId.isValid(s))
          .map(s => new ObjectId(s));
        if (!ids.length) return json(res, 200, { ok: true, counts: {} });
        const commentsCol = db.collection('comments');
        const agg = await commentsCol.aggregate([
          { $match: { journalId: { $in: ids }, isDeleted: { $ne: true } } },
          { $group: { _id: '$journalId', count: { $sum: 1 } } },
        ]).toArray();
        const counts = {};
        agg.forEach(a => { counts[a._id.toString()] = a.count; });
        return json(res, 200, { ok: true, counts });
      }

      // --- Top journals for home page ---
      if (action === 'top-journals') {
        const limitN = Math.min(20, Math.max(1, parseInt(getParam(req, 'limit') || '6', 10)));
        const topJournals = await col
          .find({ published: true })
          .sort({ likes: -1, views: -1, publishedAt: -1 })
          .limit(limitN)
          .toArray();
        return json(res, 200, { ok: true, journals: topJournals });
      }

      // --- Blacklist words (admin only) ---
      if (action === 'blacklist') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const blacklist = await db.collection('comment_blacklist').find({}).sort({ createdAt: -1 }).toArray();
        return json(res, 200, { ok: true, blacklist });
      }

      const slug = getParam(req, 'slug');
      const id = getParam(req, 'id');

      // --- EXISTING: Journal Fetch Logic ---
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

      const categoriesParam = getParam(req, 'categories');
      const singleCategoryParam = getParam(req, 'category');

      if (categoriesParam) {
        const cats = categoriesParam.split(',').map(c => c.trim()).filter(Boolean);
        if (cats.length > 0) {
          filter.categorySlug = { $in: cats };
        }
      } else if (singleCategoryParam) {
        filter.categorySlug = singleCategoryParam;
      }

      const sortParam = getParam(req, 'sort') || 'recent';
      let sortObj = { publishedAt: -1, createdAt: -1 };

      if (sortParam === 'old') {
        sortObj = { publishedAt: 1, createdAt: 1 };
      } else if (sortParam === 'most-liked') {
        sortObj = { likes: -1, publishedAt: -1 };
      } else if (sortParam === 'most-viewed') {
        sortObj = { views: -1, publishedAt: -1 };
      } else if (sortParam === 'relevant') {
        sortObj = { publishedAt: -1, createdAt: -1 };
      }

      const total = await col.countDocuments(filter);
      let journals = await col
        .find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      if (sortParam === 'relevant') {
        journals = journals.sort(() => 0.5 - Math.random());
      }

      return json(res, 200, {
        ok: true,
        journals,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // ==========================================
    // POST REQUESTS
    // ==========================================
    if (req.method === 'POST') {
      const action = getParam(req, 'action');

      // --- Manual Refresh: Rate-limited health snapshot (public) ---
      if (action === 'refresh') {
        const clientIp = getClientIp(req);
        const rlCol = db.collection('refresh_rate_limits');
        const windowStart = new Date(Date.now() - 60_000);

        // Cleanup records older than 2 minutes (fire-and-forget)
        rlCol.deleteMany({ createdAt: { $lt: new Date(Date.now() - 120_000) } }).catch(() => {});

        const [globalCount, ipCount] = await Promise.all([
          rlCol.countDocuments({ createdAt: { $gte: windowStart } }),
          rlCol.countDocuments({ ip: clientIp, createdAt: { $gte: windowStart } }),
        ]);

        if (globalCount >= 20) {
          return json(res, 429, { ok: false, message: 'Global rate limit reached (20/min). Try again shortly.', globalUsed: globalCount, globalLimit: 20, ipUsed: ipCount, ipLimit: 2 });
        }
        if (ipCount >= 2) {
          return json(res, 429, { ok: false, message: 'Rate limited: max 2 manual refreshes per minute per IP.', globalUsed: globalCount, globalLimit: 20, ipUsed: ipCount, ipLimit: 2 });
        }

        // Record this refresh
        await rlCol.insertOne({ ip: clientIp, createdAt: new Date() });

        // Collect health data
        const os = require('os');
        const dbPingStart = Date.now();
        try { await db.command({ ping: 1 }); } catch { /* ignore */ }
        const dbPingMs = Date.now() - dbPingStart;
        const mem = process.memoryUsage();
        const cpus = os.cpus();

        let diskInfo = null;
        try {
          const fsModule = require('fs');
          if (typeof fsModule.statfsSync === 'function') {
            const st = fsModule.statfsSync('/tmp');
            diskInfo = { total: st.blocks * st.bsize, free: st.bfree * st.bsize, available: st.bavail * st.bsize };
          }
        } catch { /* ignore */ }

        const healthData = {
          timestamp: Date.now(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch(),
          osType: os.type(),
          osRelease: os.release(),
          hostname: os.hostname(),
          serverRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || process.env.FLY_REGION || '—',
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpus: cpus.map((c) => ({ model: c.model, speedMHz: c.speed, times: c.times })),
          cpuCount: cpus.length,
          processMemory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external },
          dbPingMs,
          loadAverage: os.loadavg(),
          diskInfo,
        };

        // Save health snapshot to DB
        const snapshotsCol = db.collection('health_snapshots');
        await snapshotsCol.insertOne({ ...healthData, ip: clientIp, createdAtIST: nowIST() });

        return json(res, 200, {
          ok: true,
          ...healthData,
          globalUsed: globalCount + 1,
          globalLimit: 20,
          ipUsed: ipCount + 1,
          ipLimit: 2,
        });
      }

      // --- NAYA: Live Status Update Logic (Admin Only) ---
      if (action === 'status') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);

        const isVisible = body.isVisible !== undefined ? Boolean(body.isVisible) : true;
        const message = String(body.message || '').trim();
        const hexColor = String(body.hexColor || '#22c55e').trim(); // Exact Hex code
        const icon = String(body.icon || 'Activity').trim(); // Lucide icon name
        const actionUrl = String(body.actionUrl || '').trim(); // Custom Link
        const glow = Boolean(body.glow);
        const freeBy = String(body.freeBy || '').trim();

        // Agar visible hai toh message zaroori hai
        if (isVisible && !message) return json(res, 400, { ok: false, message: 'Message is required' });

        const statusCol = db.collection('live_status');
        const now = new Date();
        const doc = {
          isVisible,
          message,
          hexColor,
          icon,
          actionUrl,
          glow,
          freeBy,
          createdAt: now,
          createdAtIST: nowIST()
        };

        // Old records ko delete NAHI karna hai, bas naya append karna hai
        const result = await statusCol.insertOne(doc);
        return json(res, 201, { ok: true, status: { ...doc, _id: result.insertedId } });
      }

      // --- EXISTING: Like Logic ---
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

      // --- Comment: Add new comment (Google user or owner) ---
      if (action === 'comment') {
        const body = await readBody(req);
        const credential = String(body.credential || '').trim();
        const ownerPosting = isAuthenticated(req);

        let userInfo;
        if (ownerPosting) {
          userInfo = { userId: 'owner', name: 'Deep Dey (Owner)', email: '', picture: '' };
        } else {
          userInfo = await verifyGoogleToken(credential);
          if (!userInfo) return json(res, 401, { ok: false, message: 'Invalid or expired Google token. Please sign in again.' });
        }

        const journalId = String(body.journalId || '').trim();
        if (!journalId || !ObjectId.isValid(journalId)) return json(res, 400, { ok: false, message: 'journalId required' });

        const text = String(body.text || '').trim();
        if (!text) return json(res, 400, { ok: false, message: 'Comment text is required' });
        if (text.length > 2000) return json(res, 400, { ok: false, message: 'Comment too long (max 2000 chars)' });

        const parentIdParam = body.parentId ? String(body.parentId) : null;
        const parentId = parentIdParam && ObjectId.isValid(parentIdParam) ? new ObjectId(parentIdParam) : null;

        const journalExists = await col.findOne({ _id: new ObjectId(journalId), published: true });
        if (!journalExists) return json(res, 404, { ok: false, message: 'Journal not found' });

        const censoredText = await censorText(db, text);
        const now = new Date();
        const commentDoc = {
          journalId: new ObjectId(journalId),
          userId: userInfo.userId,
          userName: userInfo.name,
          userPic: userInfo.picture,
          text: censoredText,
          likes: 0,
          likedSessions: [],
          parentId,
          isPinned: false,
          pinnedOrder: 0,
          isDeleted: false,
          editedAt: null,
          createdAt: now,
          createdAtIST: nowIST(),
        };

        const result = await db.collection('comments').insertOne(commentDoc);
        return json(res, 201, { ok: true, comment: { ...commentDoc, _id: result.insertedId, replyCount: 0 } });
      }

      // --- Comment Like (session-based, same as journal like) ---
      if (action === 'comment-like') {
        const commentId = getParam(req, 'id');
        const session = String(getParam(req, 'session') || '').trim();
        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'Valid id required' });
        if (!session) return json(res, 400, { ok: false, message: 'session required' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        const likedSessions = Array.isArray(comment.likedSessions) ? comment.likedSessions : [];
        if (likedSessions.includes(session)) {
          return json(res, 200, { ok: true, alreadyLiked: true, likes: Number(comment.likes || 0) });
        }

        const nextSessions = [...likedSessions, session].slice(-5000);
        await commentsCol.updateOne(
          { _id: new ObjectId(commentId) },
          { $inc: { likes: 1 }, $set: { likedSessions: nextSessions } },
        );
        return json(res, 200, { ok: true, likes: Number(comment.likes || 0) + 1, alreadyLiked: false });
      }

      // --- Comment Pin/Unpin (admin only, max 3 per journal) ---
      if (action === 'comment-pin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const commentId = String(body.commentId || '').trim();
        const pin = body.pin !== false; // default true

        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'commentId required' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        if (pin) {
          const pinnedCount = await commentsCol.countDocuments({
            journalId: comment.journalId,
            parentId: null,
            isPinned: true,
            isDeleted: { $ne: true },
          });
          if (pinnedCount >= 3) return json(res, 400, { ok: false, message: 'Max 3 pinned comments per post' });
          await commentsCol.updateOne(
            { _id: new ObjectId(commentId) },
            { $set: { isPinned: true, pinnedOrder: pinnedCount + 1 } },
          );
        } else {
          await commentsCol.updateOne(
            { _id: new ObjectId(commentId) },
            { $set: { isPinned: false, pinnedOrder: 0 } },
          );
        }
        return json(res, 200, { ok: true });
      }

      // --- Blacklist: Add word (admin only) ---
      if (action === 'blacklist') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const word = String(body.word || '').trim().toLowerCase();
        if (!word) return json(res, 400, { ok: false, message: 'word required' });
        const blCol = db.collection('comment_blacklist');
        const exists = await blCol.findOne({ word });
        if (exists) return json(res, 200, { ok: true, message: 'Word already in blacklist', item: exists });
        const result = await blCol.insertOne({ word, createdAt: new Date(), createdAtIST: nowIST() });
        return json(res, 201, { ok: true, item: { _id: result.insertedId, word } });
      }

      // --- EXISTING: Journal Creation Logic ---
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      const body = await readBody(req);
      const title = String(body.title || '').trim();
      const summary = String(body.summary || '').trim();
      const content = String(body.content || '').trim();
      const categorySlug = String(body.categorySlug || '').trim();
      const categoryName = String(body.categoryName || '').trim();
      const contentType = String(body.contentType || 'richtext').trim();
      const publish = Boolean(body.publish);
      const images = normalizeImages(body.images);

      if (!title) return json(res, 400, { ok: false, message: 'Title is required' });
      if (!content) return json(res, 400, { ok: false, message: 'Content is required' });

      const slug = slugify(title);
      const now = new Date();
      const doc = {
        title, slug, summary, content, contentType, categorySlug, categoryName, images,
        published: publish,
        publishedAt: publish ? now : null,
        publishedAtIST: publish ? nowIST() : null,
        createdAt: now, updatedAt: now,
        readMinutes: estimateReadMinutes(content),
        views: 0, likes: 0, likedSessions: [],
      };

      const result = await col.insertOne(doc);
      return json(res, 201, { ok: true, journal: { ...doc, _id: result.insertedId } });
    }

    // ==========================================
    // PUT & DELETE (Journal + Comments)
    // ==========================================
    if (req.method === 'PUT') {
      const action = getParam(req, 'action');
      const body = await readBody(req);

      // --- Comment Edit (Google user or owner) ---
      if (action === 'comment') {
        const commentId = String(body.commentId || '').trim();
        const newText = String(body.text || '').trim();
        const credential = String(body.credential || '').trim();

        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'commentId required' });
        if (!newText) return json(res, 400, { ok: false, message: 'text required' });
        if (newText.length > 2000) return json(res, 400, { ok: false, message: 'Comment too long (max 2000 chars)' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        const ownerEditing = isAuthenticated(req);
        if (!ownerEditing) {
          const userInfo = await verifyGoogleToken(credential);
          if (!userInfo || userInfo.userId !== comment.userId) {
            return json(res, 403, { ok: false, message: 'Not authorized to edit this comment' });
          }
        }

        const censoredText = await censorText(db, newText);
        await commentsCol.updateOne(
          { _id: new ObjectId(commentId) },
          { $set: { text: censoredText, editedAt: new Date() } },
        );
        return json(res, 200, { ok: true, comment: { ...comment, text: censoredText, editedAt: new Date() } });
      }

      // Admin-only operations below
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      const id = body._id;
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: '_id required' });

      if (action === 'status') {
        const update = {
          isVisible: body.isVisible ?? true,
          message: String(body.message || '').trim(),
          hexColor: String(body.hexColor || '#22c55e').trim(),
          icon: String(body.icon || 'Activity').trim(),
          actionUrl: String(body.actionUrl || '').trim(),
          glow: Boolean(body.glow),
          freeBy: String(body.freeBy || '').trim(),
          updatedAt: new Date()
        };
        await db.collection('live_status').updateOne({ _id: new ObjectId(id) }, { $set: update });
        return json(res, 200, { ok: true, message: 'Status updated' });
      }
      // ... baki journal update ka code waisa hi rahega
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: '_id required' });

      const existing = await col.findOne({ _id: new ObjectId(id) });
      if (!existing) return json(res, 404, { ok: false, message: 'Not found' });

      const title = body.title !== undefined ? String(body.title).trim() : existing.title;
      const content = body.content !== undefined ? String(body.content).trim() : existing.content;
      const publish = body.publish !== undefined ? Boolean(body.publish) : existing.published;
      const contentType = body.contentType !== undefined ? String(body.contentType).trim() : (existing.contentType || 'richtext');

      const now = new Date();
      const update = {
        title,
        slug: slugify(title),
        summary: body.summary !== undefined ? String(body.summary).trim() : existing.summary,
        content,
        contentType,
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
      const action = getParam(req, 'action');

      // --- Comment Delete (Google user or owner) ---
      if (action === 'comment') {
        const commentId = getParam(req, 'id');
        const body = await readBody(req);
        const credential = String(body.credential || getParam(req, 'credential') || '').trim();

        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'id required' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        const ownerDeleting = isAuthenticated(req);
        if (!ownerDeleting) {
          const userInfo = await verifyGoogleToken(credential);
          if (!userInfo || userInfo.userId !== comment.userId) {
            return json(res, 403, { ok: false, message: 'Not authorized to delete this comment' });
          }
        }

        await commentsCol.updateOne({ _id: new ObjectId(commentId) }, { $set: { isDeleted: true } });
        return json(res, 200, { ok: true, message: 'Comment deleted' });
      }

      // --- Blacklist: Delete word (admin only) ---
      if (action === 'blacklist') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const blId = getParam(req, 'id');
        if (!blId || !ObjectId.isValid(blId)) return json(res, 400, { ok: false, message: 'id required' });
        await db.collection('comment_blacklist').deleteOne({ _id: new ObjectId(blId) });
        return json(res, 200, { ok: true, message: 'Word removed from blacklist' });
      }

      // Existing: Delete journal (admin only)
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const id = getParam(req, 'id');
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'id required' });

      if (action === 'status') {
        await db.collection('live_status').deleteOne({ _id: new ObjectId(id) });
        return json(res, 200, { ok: true, message: 'Status deleted' });
      }

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