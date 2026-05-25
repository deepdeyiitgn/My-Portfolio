import fs from 'node:fs';
import path from 'node:path';
import logger from './logger.js';

// In-memory sitemap cache — refreshed every 6 hours
let sitemapCache = { xml: '', refreshedAt: 0 };
const SITEMAP_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const SITEMAP_SNAPSHOT_FILE = '/tmp/my-portfolio-sitemap.xml';
let sitemapRefreshPromise = null;

const DOMAIN = 'https://deepdey.vercel.app';
const PROJECT_ROOT = process.cwd();

function resolveStableFallbackDate() {
  const fallbackSources = ['package.json', 'src/App.tsx', 'api/sitemap.js'];
  let latest = 0;
  for (const relPath of fallbackSources) {
    try {
      const stat = fs.statSync(path.resolve(PROJECT_ROOT, relPath));
      if (stat.mtimeMs > latest) latest = stat.mtimeMs;
    } catch {
      // ignore missing files
    }
  }
  if (latest > 0) return new Date(latest).toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

// Fallback if source file date can't be resolved
// const STATIC_PAGE_LASTMOD_FALLBACK = resolveStableFallbackDate();
const STATIC_PAGE_LASTMOD_FALLBACK = '2026-02-21';

// All static routes (no /dashboard, no /journal/embed)
const STATIC_PAGES = [
  '/',
  '/projects',
  '/about',
  '/me',
  '/contact',
  '/faq',
  '/feature',
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
  '/feedback',
  '/journal/comment',
];

const STATIC_HTML_PAGES = [
  '/static-pages.html',
  '/project-architecture-blueprint.html',
  '/ui-design-system-overview.html',
  '/performance-engineering-report.html',
  '/api-reliability-playbook.html',
  '/security-hardening-notes.html',
  '/seo-and-indexing-guide.html',
  '/content-strategy-manifest.html',
  '/user-feedback-operations.html',
  '/deployment-and-release-story.html',
  '/data-model-governance.html',
  '/accessibility-improvement-log.html',
  '/mobile-experience-handbook.html',
  '/feature-delivery-timeline.html',
  '/monitoring-and-status-notes.html',
  '/journal-platform-deep-dive.html',
  '/community-and-support-framework.html',
  '/learning-roadmap-and-goals.html',
  '/portfolio-case-study-quicklink.html',
  '/portfolio-case-study-studybot.html',
  '/portfolio-case-study-transparent-clock.html',
  '/portfolio-case-study-node-server.html',
  '/collaboration-and-contact-workflow.html',
  '/legal-and-compliance-summary.html',
  '/future-innovation-lab.html',
  '/project-retrospective-2026.html',
];

function formatDate(dateInput) {
  if (!dateInput) return STATIC_PAGE_LASTMOD_FALLBACK;
  try { return new Date(dateInput).toISOString().split('T')[0]; } catch { return STATIC_PAGE_LASTMOD_FALLBACK; }
}

function toTimestamp(dateInput) {
  if (!dateInput) return 0;
  const parsed = new Date(dateInput).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function slugifyToken(value) {
  return String(value || '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getJournalRouteKey(journal) {
  // Sitemap journal slug is always id-based
  return String(journal?._id || '').trim();
}

const STATIC_ROUTE_SOURCES = {
  '': ['src/pages/Home.tsx', 'src/App.tsx'],
  '/projects': ['src/pages/Projects.tsx'],
  '/about': ['src/pages/About.tsx'],
  '/me': ['src/pages/Me.tsx'],
  '/contact': ['src/pages/Contact.tsx'],
  '/faq': ['src/pages/FAQ.tsx', 'src/data/faqData.ts'],
  '/feature': ['src/pages/Features.tsx'],
  '/portfolio': ['src/pages/Portfolio.tsx'],
  '/links': ['src/pages/Links.tsx'],
  '/proof': ['src/pages/Proof.tsx'],
  '/journal': ['src/pages/Journal.tsx'],
  '/now': ['src/pages/Now.tsx'],
  '/legal': ['src/pages/LegalHub.tsx'],
  '/terms': ['src/pages/Terms.tsx'],
  '/privacy': ['src/pages/Privacy.tsx'],
  '/dmca': ['src/pages/DMCA.tsx'],
  '/copyright': ['src/pages/Copyright.tsx'],
  '/live': ['src/pages/Live.tsx'],
  '/search': ['src/pages/SearchResults.tsx'],
  '/status': ['src/pages/Status.tsx'],
  '/user': ['src/pages/AllUsers.tsx'],
  '/feedback': ['src/pages/Feedback.tsx'],
  '/journal/comment': ['src/pages/CommentGuide.tsx'],
  '/404': ['src/pages/NotFound.tsx'],
  '/user/owner': ['src/pages/UserProfile.tsx'],
};

for (const staticHtmlPage of STATIC_HTML_PAGES) {
  const cleanPath = staticHtmlPage.replace(/^\//, '');
  STATIC_ROUTE_SOURCES[staticHtmlPage] = [`public/${cleanPath}`];
}

const PROJECT_DETAIL_SOURCES = ['src/pages/ProjectDetail.tsx', 'src/data/projectsData.ts'];

function latestMtimeDate(sourcePaths) {
  let latest = 0;
  for (const relPath of sourcePaths || []) {
    try {
      const stat = fs.statSync(path.resolve(PROJECT_ROOT, relPath));
      if (stat.mtimeMs > latest) latest = stat.mtimeMs;
    } catch {
      // ignore missing files
    }
  }
  return latest > 0 ? formatDate(new Date(latest)) : STATIC_PAGE_LASTMOD_FALLBACK;
}

function buildXml(routes) {
  let urls = '';
  for (const { loc, lastmod, changefreq, priority } of routes) {
    urls += `\n  <url>\n    <loc>${DOMAIN}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
}

function loadSitemapSnapshot() {
  try {
    if (!fs.existsSync(SITEMAP_SNAPSHOT_FILE)) return;
    const snapshot = fs.readFileSync(SITEMAP_SNAPSHOT_FILE, 'utf8');
    if (!snapshot || !snapshot.includes('<urlset')) return;
    const stat = fs.statSync(SITEMAP_SNAPSHOT_FILE);
    sitemapCache = {
      xml: snapshot,
      refreshedAt: stat.mtimeMs || 0,
    };
  } catch {
    // ignore snapshot load failure
  }
}

function persistSitemapSnapshot(xml) {
  try {
    const dir = path.dirname(SITEMAP_SNAPSHOT_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SITEMAP_SNAPSHOT_FILE, xml, 'utf8');
  } catch {
    // ignore snapshot write failure
  }
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

async function fetchPaginatedCollection({ baseUrl, maxPages, itemsKey, buildUrl }) {
  const items = [];
  let ok = false;

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchJson(buildUrl(page, baseUrl));
    if (!data?.ok || !Array.isArray(data[itemsKey])) break;
    ok = true;
    items.push(...data[itemsKey]);
    const totalPages = Number(data.pagination?.totalPages || 1);
    if (page >= totalPages) break;
  }

  return { items, ok };
}

async function fetchAllPublishedJournals(baseUrl) {
  return fetchPaginatedCollection({
    baseUrl,
    maxPages: 100,
    itemsKey: 'journals',
    buildUrl: (page, origin) => `${origin}/api/journal?published=true&page=${page}&limit=20`,
  });
}

async function fetchAllUsers(baseUrl) {
  return fetchPaginatedCollection({
    baseUrl,
    maxPages: 200,
    itemsKey: 'users',
    buildUrl: (page, origin) => `${origin}/api/journal?action=all-users&page=${page}`,
  });
}

async function fetchAllCommentsForJournal(baseUrl, journalId, parentId = null) {
  const comments = [];
  const seen = new Set();
  const maxPages = 500;
  let ok = false;

  for (let page = 1; page <= maxPages; page++) {
    const parentParam = parentId ? `&parentId=${encodeURIComponent(parentId)}` : '';
    const data = await fetchJson(`${baseUrl}/api/journal?action=comments&journalId=${encodeURIComponent(journalId)}&page=${page}&sort=old${parentParam}`);
    if (!data?.ok) break;
    ok = true;

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

  return { items: comments, ok };
}

async function buildSitemap(baseUrl) {
  const routes = [];
  const seenLocs = new Set();

  const addRoute = ({ loc, lastmod, changefreq, priority }) => {
    if (!loc || seenLocs.has(loc)) {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Skipping sitemap route', { loc, reason: !loc ? 'empty' : 'duplicate' });
      }
      return false;
    }
    seenLocs.add(loc);
    routes.push({ loc, lastmod, changefreq, priority });
    return true;
  };

  let dynamicRouteCount = 0;
  let dynamicFetchFailed = false;
  const addDynamicRoute = (route) => {
    if (addRoute(route)) dynamicRouteCount += 1;
  };

  // Static pages — file-change-based lastmod
  for (const page of STATIC_PAGES) {
    addRoute({
      loc: page,
      lastmod: latestMtimeDate(STATIC_ROUTE_SOURCES[page]),
      changefreq: page === '' ? 'daily' : 'weekly',
      priority: '1.0',
    });
  }
  for (const page of STATIC_HTML_PAGES) {
    addRoute({
      loc: page,
      lastmod: latestMtimeDate(STATIC_ROUTE_SOURCES[page]),
      changefreq: 'monthly',
      priority: '0.6',
    });
  }
  addRoute({ loc: '/404', lastmod: latestMtimeDate(STATIC_ROUTE_SOURCES['/404']), changefreq: 'monthly', priority: '0.2' });
  addRoute({ loc: '/user/owner', lastmod: latestMtimeDate(STATIC_ROUTE_SOURCES['/user/owner']), changefreq: 'weekly', priority: '0.5' });
  addRoute({ loc: '/user/owner?tab=comments', lastmod: latestMtimeDate(STATIC_ROUTE_SOURCES['/user/owner']), changefreq: 'weekly', priority: '0.5' });

  // Dynamic routes from DB
  const [journalsResult, usersResult] = await Promise.all([
    fetchAllPublishedJournals(baseUrl),
    fetchAllUsers(baseUrl),
  ]);

  const journals = journalsResult.items;
  const users = usersResult.items;
  if (!journalsResult.ok) {
    dynamicFetchFailed = true;
    logger.error('Sitemap journals fetch failed', { baseUrl });
  }
  if (!usersResult.ok) {
    dynamicFetchFailed = true;
    logger.error('Sitemap users fetch failed', { baseUrl });
  }

  // User profiles — include all paginated users
  for (const u of users) {
    if (!u?.userId) continue;
    const lastmod = formatDate(
      u.profileUpdatedAt ||
      u.verifiedUpdatedAt ||
      u.lastCommentAt ||
      u.firstCommentAt ||
      u.createdAt,
    );
    addDynamicRoute({ loc: `/user/${encodeURIComponent(u.userId)}`, lastmod, changefreq: 'weekly', priority: '0.5' });
    addDynamicRoute({ loc: `/user/${encodeURIComponent(u.userId)}?tab=comments`, lastmod, changefreq: 'weekly', priority: '0.5' });
  }

  // Journal pages + comments/replies permalinks (slug-first)
  const tagLastmodMap = new Map();
  const hashtagLastmodMap = new Map();
  for (const j of journals) {
    const id = String(j?._id || '');
    if (!id) continue;
    const journalRouteKey = encodeURIComponent(getJournalRouteKey(j));
    const journalLastmod = formatDate(j.updatedAt || j.publishedAt || j.createdAt);
    const journalTagLastmod = j.updatedAt || j.publishedAt || j.createdAt;
    const keywords = Array.isArray(j?.keywords) ? j.keywords : [];
    const hashtags = Array.isArray(j?.hashtags) ? j.hashtags : [];
    for (const keyword of keywords) {
      const token = slugifyToken(keyword);
      if (!token) continue;
      const prevTs = tagLastmodMap.get(token) ? toTimestamp(tagLastmodMap.get(token)) : 0;
      const nextTs = toTimestamp(journalTagLastmod);
      if (!prevTs || nextTs > prevTs) tagLastmodMap.set(token, journalTagLastmod);
    }
    for (const hashtag of hashtags) {
      const token = slugifyToken(hashtag);
      if (!token) continue;
      const prevTs = hashtagLastmodMap.get(token) ? toTimestamp(hashtagLastmodMap.get(token)) : 0;
      const nextTs = toTimestamp(journalTagLastmod);
      if (!prevTs || nextTs > prevTs) hashtagLastmodMap.set(token, journalTagLastmod);
    }
    addDynamicRoute({ loc: `/journal/view/${journalRouteKey}`, lastmod: journalLastmod, changefreq: 'weekly', priority: '0.7' });

    let commentsPageLastmodTs = toTimestamp(j.updatedAt || j.publishedAt || j.createdAt);
    const topLevelCommentsResult = await fetchAllCommentsForJournal(baseUrl, id);
    if (!topLevelCommentsResult.ok) {
      dynamicFetchFailed = true;
      logger.error('Sitemap top-level comments fetch failed', { baseUrl, journalId: id });
    }

    for (const c of topLevelCommentsResult.items) {
      const commentId = String(c?._id || '');
      if (!commentId) continue;
      const commentLastmodTs = toTimestamp(c.editedAt || c.createdAt || j.updatedAt || j.publishedAt || j.createdAt);
      if (commentLastmodTs > commentsPageLastmodTs) commentsPageLastmodTs = commentLastmodTs;
      const commentLastmod = formatDate(c.editedAt || c.createdAt || j.updatedAt || j.publishedAt || j.createdAt);
      addDynamicRoute({ loc: `/journal/view/${journalRouteKey}/comment/${commentId}`, lastmod: commentLastmod, changefreq: 'weekly', priority: '0.5' });
      addDynamicRoute({ loc: `/journal/comment/${commentId}`, lastmod: commentLastmod, changefreq: 'weekly', priority: '0.5' });

      const repliesResult = await fetchAllCommentsForJournal(baseUrl, id, commentId);
      if (!repliesResult.ok) {
        dynamicFetchFailed = true;
        logger.error('Sitemap reply comments fetch failed', { baseUrl, journalId: id, parentId: commentId });
      }

      for (const r of repliesResult.items) {
        const replyId = String(r?._id || '');
        if (!replyId) continue;
        const replyLastmodTs = toTimestamp(r.editedAt || r.createdAt || c.editedAt || c.createdAt || j.updatedAt || j.publishedAt || j.createdAt);
        if (replyLastmodTs > commentsPageLastmodTs) commentsPageLastmodTs = replyLastmodTs;
        const replyLastmod = formatDate(r.editedAt || r.createdAt || c.editedAt || c.createdAt || j.updatedAt || j.publishedAt || j.createdAt);
        addDynamicRoute({ loc: `/journal/view/${journalRouteKey}/comment/${replyId}`, lastmod: replyLastmod, changefreq: 'weekly', priority: '0.5' });
        addDynamicRoute({ loc: `/journal/comment/${replyId}`, lastmod: replyLastmod, changefreq: 'weekly', priority: '0.5' });
      }
    }

    addDynamicRoute({
      loc: `/journal/view/${journalRouteKey}/comments`,
      lastmod: formatDate(commentsPageLastmodTs ? new Date(commentsPageLastmodTs) : (j.updatedAt || j.publishedAt || j.createdAt)),
      changefreq: 'weekly',
      priority: '0.6',
    });
  }

  for (const [token, lastmodSource] of tagLastmodMap.entries()) {
    addDynamicRoute({
      loc: `/journal/tags/${encodeURIComponent(token)}`,
      lastmod: formatDate(lastmodSource),
      changefreq: 'weekly',
      priority: '0.4',
    });
  }

  for (const [token, lastmodSource] of hashtagLastmodMap.entries()) {
    addDynamicRoute({
      loc: `/journal/hastags/${encodeURIComponent(token)}`,
      lastmod: formatDate(lastmodSource),
      changefreq: 'weekly',
      priority: '0.4',
    });
  }

  // Project detail pages (static list, kept for completeness)
  const projectIds = ['transparent-clock', 'quicklink', 'studybot', 'personal-portfolio', 'qlynk-node-server'];
  for (const id of projectIds) {
    addRoute({ loc: `/projects/${id}`, lastmod: latestMtimeDate(PROJECT_DETAIL_SOURCES), changefreq: 'monthly', priority: '0.7' });
  }

  return { xml: buildXml(routes), dynamicRouteCount, dynamicFetchFailed };
}

async function refreshSitemapCache(baseUrl) {
  if (sitemapRefreshPromise) return sitemapRefreshPromise;

  sitemapRefreshPromise = (async () => {
    const built = await buildSitemap(baseUrl);
    if (sitemapCache.xml && built.dynamicFetchFailed && built.dynamicRouteCount === 0) {
      logger.error('Keeping previous sitemap cache because dynamic sitemap fetch failed', { baseUrl });
      return { ...built, usedStaleFallback: true };
    }

    sitemapCache = { xml: built.xml, refreshedAt: Date.now() };
    persistSitemapSnapshot(built.xml);
    return { ...built, usedStaleFallback: false };
  })();

  try {
    return await sitemapRefreshPromise;
  } finally {
    sitemapRefreshPromise = null;
  }
}

loadSitemapSnapshot();
void refreshSitemapCache(DOMAIN).catch((error) => {
  logger.error('Initial sitemap warmup failed', error);
});

function sendSitemapResponse(res, { xml, cacheHeader, dynamicRouteCount, fetchFailed }) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=3600');
  res.setHeader('X-Sitemap-Cache', cacheHeader);
  res.setHeader('X-Sitemap-Dynamic-Routes', String(dynamicRouteCount));
  if (fetchFailed) res.setHeader('X-Sitemap-Dynamic-Fetch-Failed', 'true');
  return res.status(200).send(xml);
}

export default async function handler(req, res) {
  try {
    const now = Date.now();
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'deepdey.vercel.app';
    const baseUrl = host.startsWith('localhost') ? `http://${host}` : `${protocol}://${host}`;

    // Serve from cache if still fresh
    if (sitemapCache.xml && now - sitemapCache.refreshedAt < SITEMAP_TTL_MS) {
      return sendSitemapResponse(res, {
        xml: sitemapCache.xml,
        cacheHeader: 'HIT',
        dynamicRouteCount: 'cached',
        fetchFailed: false,
      });
    }

    // If stale cache exists, serve it immediately and refresh in background
    if (sitemapCache.xml) {
      void refreshSitemapCache(baseUrl).catch((error) => {
        logger.error('Background sitemap refresh failed', error);
      });
      return sendSitemapResponse(res, {
        xml: sitemapCache.xml,
        cacheHeader: 'STALE-HIT',
        dynamicRouteCount: 'cached',
        fetchFailed: false,
      });
    }

    // No cache available: build once and cache it
    const built = await refreshSitemapCache(baseUrl);
    if (sitemapCache.xml && built.usedStaleFallback) {
      return sendSitemapResponse(res, {
        xml: sitemapCache.xml,
        cacheHeader: 'STALE-FALLBACK',
        dynamicRouteCount: 'cached',
        fetchFailed: true,
      });
    }

    return sendSitemapResponse(res, {
      xml: sitemapCache.xml,
      cacheHeader: 'MISS',
      dynamicRouteCount: built.dynamicRouteCount,
      fetchFailed: built.dynamicFetchFailed,
    });
  } catch (error) {
    logger.error('Sitemap generation failed:', error);
    res.status(500).send('Error generating sitemap');
  }
}
