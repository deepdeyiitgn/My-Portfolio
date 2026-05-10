const { MongoClient, ObjectId } = require('mongodb');
const he = require('he');

let cachedClient = null;

async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db();
}

function getParam(req, name) {
  try {
    const url = new URL(req.url, 'http://x');
    return url.searchParams.get(name);
  } catch {
    return (req.query && req.query[name]) || null;
  }
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeRegexLiteral(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveJournalByRef(col, journalIdOrSlugOrTitle, onlyPublished = true) {
  const token = String(journalIdOrSlugOrTitle || '').trim();
  if (!token) return null;

  const titleLikeToken = token.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const slugToken = slugify(token);
  const queryVariants = [];

  if (ObjectId.isValid(token)) {
    queryVariants.push({ _id: new ObjectId(token) });
  }
  queryVariants.push({ slug: token });
  if (slugToken && slugToken !== token) queryVariants.push({ slug: slugToken });
  queryVariants.push({ title: new RegExp(`^${escapeRegexLiteral(token)}$`, 'i') });
  if (titleLikeToken && titleLikeToken !== token) {
    queryVariants.push({ title: new RegExp(`^${escapeRegexLiteral(titleLikeToken)}$`, 'i') });
  }

  for (const q of queryVariants) {
    const query = onlyPublished ? { ...q, published: true } : q;
    const doc = await col.findOne(query);
    if (doc) return doc;
  }
  return null;
}

function renderHtmlDocument(journal) {
  const title = he.escape(String(journal?.title || 'Journal'));
  const summary = he.escape(String(journal?.summary || ''));
  const content = String(journal?.content || '');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${summary ? `<meta name="description" content="${summary}" />` : ''}
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; background: #0a0a0a; color: #d4d4d8; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.65; }
    body { padding: 1rem; overflow-x: auto; }
    img, video, iframe { max-width: 100%; height: auto; border-radius: 0.75rem; }
    pre, code { max-width: 100%; overflow-x: auto; }
    a { color: #f59e0b; }
  </style>
</head>
<body>
  ${content}
  <script>
    (() => {
      const targetOrigin = (() => {
        try {
          return document.referrer ? new URL(document.referrer).origin : window.location.origin;
        } catch {
          return window.location.origin;
        }
      })();
      const postHeight = () => {
        try {
          const body = document.body;
          const html = document.documentElement;
          const height = Math.max(
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0,
            html ? html.clientHeight : 0,
            html ? html.scrollHeight : 0,
            html ? html.offsetHeight : 0
          );
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'journal-html-height', height }, targetOrigin);
          }
        } catch {}
      };
      let rafId = 0;
      const schedulePostHeight = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          postHeight();
        });
      };
      window.addEventListener('load', schedulePostHeight);
      window.addEventListener('resize', schedulePostHeight);
      new MutationObserver(schedulePostHeight).observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
      setTimeout(schedulePostHeight, 0);
      setTimeout(schedulePostHeight, 300);
      setTimeout(schedulePostHeight, 1000);
    })();
  </script>
</body>
</html>`;
}

module.exports = async (req, res) => {
  try {
    const allowedOrigin = String(process.env.JOURNAL_HTML_ALLOW_ORIGIN || '*').trim() || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Method Not Allowed');
      return;
    }

    const ref = String(getParam(req, 'slug') || getParam(req, 'id') || '').trim();
    if (!ref) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Missing journal id or slug');
      return;
    }

    const db = await getDb();
    const col = db.collection('journals');
    const journal = await resolveJournalByRef(col, ref, true);

    if (!journal) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Journal not found');
      return;
    }

    if (String(journal.contentType || '').toLowerCase() !== 'html') {
      res.statusCode = 415;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Only html content type is supported on this endpoint');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    res.end(renderHtmlDocument(journal));
  } catch (error) {
    console.error('[api/journal-html] failed:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
};
