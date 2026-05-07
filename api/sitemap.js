// In-memory sitemap cache — refreshed every 6 hours
let sitemapCache = { xml: '', refreshedAt: 0 };
const SITEMAP_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const DOMAIN = 'https://deepdey.vercel.app';

// Fixed lastmod for static pages (manually bump this date whenever STATIC_PAGES content/SEO text is updated)
const STATIC_PAGE_LASTMOD = '2025-01-01';

// All static routes (no /dashboard, no /journal/embed)
const STATIC_PAGES = [
  '',
  '/projects',
  '/about',
  '/me',
  '/contact',
  '/faq',
  '/portfolio',
  '/links',
  '/proof',
  '/journal',
  '/now',
  '/legal',
  '/terms',
  '/privacy',
  '/dmca',
  '/copyright',
  '/live',
  '/search',
  '/status',
  '/user',
  '/journal/comment',
];

function formatDate(d) {
  if (!d) return STATIC_PAGE_LASTMOD;
  try { return new Date(d).toISOString().split('T')[0]; } catch { return STATIC_PAGE_LASTMOD; }
}

function buildXml(routes) {
  let urls = '';
  for (const { loc, lastmod, changefreq, priority } of routes) {
    urls += `\n  <url>\n    <loc>${DOMAIN}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchAllPublishedJournals(baseUrl) {
  const journals = [];
  const maxPages = 100;
  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchJson(`${baseUrl}/api/journal?published=true&page=${page}&limit=20`);
    if (!data?.ok || !Array.isArray(data.journals)) break;
    journals.push(...data.journals);
    const totalPages = Number(data.pagination?.totalPages || 1);
    if (page >= totalPages) break;
  }
  return journals;
}

async function fetchAllUsers(baseUrl) {
  const users = [];
  const maxPages = 200;
  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchJson(`${baseUrl}/api/journal?action=all-users&page=${page}`);
    if (!data?.ok || !Array.isArray(data.users)) break;
    users.push(...data.users);
    const totalPages = Number(data.pagination?.totalPages || 1);
    if (page >= totalPages) break;
  }
  return users;
}

async function fetchAllCommentsForJournal(baseUrl, journalId, parentId = null) {
  const comments = [];
  const seen = new Set();
  const maxPages = 500;

  for (let page = 1; page <= maxPages; page++) {
    const parentParam = parentId ? `&parentId=${encodeURIComponent(parentId)}` : '';
    const data = await fetchJson(`${baseUrl}/api/journal?action=comments&journalId=${encodeURIComponent(journalId)}&page=${page}&sort=old${parentParam}`);
    if (!data?.ok) break;

    const merged = [
      ...(parentId ? [] : (Array.isArray(data.pinnedComments) ? data.pinnedComments : [])),
      ...(Array.isArray(data.comments) ? data.comments : []),
    ];

    for (const c of merged) {
      const id = String(c?._id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      comments.push(c);
    }

    const totalPages = Number(data.pagination?.totalPages || 1);
    if (page >= totalPages) break;
  }

  return comments;
}

async function buildSitemap(baseUrl) {
  const routes = [];
  const seenLocs = new Set();

  const addRoute = ({ loc, lastmod, changefreq, priority }) => {
    if (!loc || seenLocs.has(loc)) return;
    seenLocs.add(loc);
    routes.push({ loc, lastmod, changefreq, priority });
  };

  // Static pages — fixed lastmod
  for (const page of STATIC_PAGES) {
    addRoute({
      loc: page,
      lastmod: STATIC_PAGE_LASTMOD,
      changefreq: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? '1.0' : '0.8',
    });
  }
  addRoute({ loc: '/user/owner', lastmod: STATIC_PAGE_LASTMOD, changefreq: 'weekly', priority: '0.6' });

  // Dynamic routes from DB
  try {
    const [journals, users] = await Promise.all([
      fetchAllPublishedJournals(baseUrl),
      fetchAllUsers(baseUrl),
    ]);

    // User profiles — include all paginated users
    for (const u of users) {
      if (!u?.userId) continue;
      const lastmod = formatDate(u.lastCommentAt || u.createdAt);
      addRoute({ loc: `/user/${encodeURIComponent(u.userId)}`, lastmod, changefreq: 'weekly', priority: '0.6' });
    }

    // Journal pages + comments/replies permalinks (ID-based only)
    for (const j of journals) {
      const id = String(j?._id || '');
      if (!id) continue;
      const journalLastmod = formatDate(j.publishedAt || j.createdAt);
      addRoute({ loc: `/journal/view/${id}`, lastmod: journalLastmod, changefreq: 'weekly', priority: '0.7' });
      addRoute({ loc: `/journal/view/${id}/comments`, lastmod: journalLastmod, changefreq: 'daily', priority: '0.6' });

      const topLevelComments = await fetchAllCommentsForJournal(baseUrl, id);
      for (const c of topLevelComments) {
        const commentId = String(c?._id || '');
        if (!commentId) continue;
        const commentLastmod = formatDate(c.updatedAt || c.createdAt || j.publishedAt || j.createdAt);
        addRoute({ loc: `/journal/view/${id}/comment/${commentId}`, lastmod: commentLastmod, changefreq: 'weekly', priority: '0.5' });

        const replies = await fetchAllCommentsForJournal(baseUrl, id, commentId);
        for (const r of replies) {
          const replyId = String(r?._id || '');
          if (!replyId) continue;
          const replyLastmod = formatDate(r.updatedAt || r.createdAt || c.createdAt);
          addRoute({ loc: `/journal/view/${id}/comment/${replyId}`, lastmod: replyLastmod, changefreq: 'weekly', priority: '0.5' });
        }
      }
    }

    // Project detail pages (static list, kept for completeness)
    const projectIds = ['transparent-clock', 'quicklink', 'studybot', 'personal-portfolio', 'qlynk-node-server'];
    for (const id of projectIds) {
      addRoute({ loc: `/projects/${id}`, lastmod: STATIC_PAGE_LASTMOD, changefreq: 'monthly', priority: '0.7' });
    }
  } catch { /* ignore dynamic failures */ }

  return buildXml(routes);
}

export default async function handler(req, res) {
  try {
    const now = Date.now();
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'deepdey.vercel.app';
    const baseUrl = host.startsWith('localhost') ? `http://${host}` : `${protocol}://${host}`;

    // Serve from cache if still fresh
    if (sitemapCache.xml && now - sitemapCache.refreshedAt < SITEMAP_TTL_MS) {
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=3600');
      res.setHeader('X-Sitemap-Cache', 'HIT');
      return res.status(200).send(sitemapCache.xml);
    }

    // Build fresh sitemap
    const xml = await buildSitemap(baseUrl);
    sitemapCache = { xml, refreshedAt: now };

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=3600');
    res.setHeader('X-Sitemap-Cache', 'MISS');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    res.status(500).send('Error generating sitemap');
  }
}
