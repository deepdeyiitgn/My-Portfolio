// In-memory sitemap cache — refreshed every 6 hours
let sitemapCache = { xml: '', refreshedAt: 0 };
const SITEMAP_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const DOMAIN = 'https://deepdey.vercel.app';

// Fixed lastmod for static pages (only changes when manually updated)
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

async function buildSitemap(baseUrl) {
  const routes = [];

  // Static pages — fixed lastmod
  for (const page of STATIC_PAGES) {
    routes.push({
      loc: page,
      lastmod: STATIC_PAGE_LASTMOD,
      changefreq: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? '1.0' : '0.8',
    });
  }

  // Dynamic routes from DB
  try {
    const [journalRes, usersRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/journal?published=true&limit=200`),
      fetch(`${baseUrl}/api/journal?action=all-users&page=1`),
    ]);

    // Journal slugs — use actual publishedAt date
    if (journalRes.status === 'fulfilled') {
      try {
        const data = await journalRes.value.json();
        if (data.ok && Array.isArray(data.journals)) {
          for (const j of data.journals) {
            const slug = j.slug || j._id;
            const lastmod = formatDate(j.publishedAt || j.createdAt);
            routes.push({ loc: `/journal/view/${slug}`, lastmod, changefreq: 'weekly', priority: '0.7' });
            routes.push({ loc: `/journal/view/${slug}/comments`, lastmod, changefreq: 'daily', priority: '0.6' });
          }
        }
      } catch { /* ignore */ }
    }

    // User profiles — use actual lastCommentAt date
    if (usersRes.status === 'fulfilled') {
      try {
        const data = await usersRes.value.json();
        if (data.ok && Array.isArray(data.users)) {
          for (const u of data.users) {
            if (u.userId) {
              const lastmod = formatDate(u.lastCommentAt || u.createdAt);
              routes.push({ loc: `/user/${encodeURIComponent(u.userId)}`, lastmod, changefreq: 'weekly', priority: '0.6' });
            }
          }
        }
      } catch { /* ignore */ }
    }

    // Project detail pages (static list, kept for completeness)
    const projectIds = ['transparent-clock', 'quicklink', 'studybot', 'personal-portfolio', 'qlynk-node-server'];
    for (const id of projectIds) {
      routes.push({ loc: `/projects/${id}`, lastmod: STATIC_PAGE_LASTMOD, changefreq: 'monthly', priority: '0.7' });
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

