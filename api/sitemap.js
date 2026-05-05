// In-memory sitemap cache — refreshed every 6 hours
let sitemapCache = { xml: '', refreshedAt: 0 };
const SITEMAP_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const DOMAIN = 'https://deepdey.vercel.app';

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

function buildXml(routes) {
  const today = new Date().toISOString().split('T')[0];
  let urls = '';
  for (const { loc, changefreq, priority } of routes) {
    urls += `\n  <url>\n    <loc>${DOMAIN}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
}

async function buildSitemap(baseUrl) {
  const routes = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    routes.push({
      loc: page,
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

    // Journal slugs
    if (journalRes.status === 'fulfilled') {
      try {
        const data = await journalRes.value.json();
        if (data.ok && Array.isArray(data.journals)) {
          for (const j of data.journals) {
            const slug = j.slug || j._id;
            routes.push({ loc: `/journal/view/${slug}`, changefreq: 'weekly', priority: '0.7' });
            routes.push({ loc: `/journal/view/${slug}/comments`, changefreq: 'daily', priority: '0.6' });
          }
        }
      } catch { /* ignore */ }
    }

    // User profiles
    if (usersRes.status === 'fulfilled') {
      try {
        const data = await usersRes.value.json();
        if (data.ok && Array.isArray(data.users)) {
          for (const u of data.users) {
            if (u.userId) routes.push({ loc: `/user/${encodeURIComponent(u.userId)}`, changefreq: 'weekly', priority: '0.6' });
          }
        }
      } catch { /* ignore */ }
    }

    // Project detail pages (static list, kept for completeness)
    const projectIds = ['transparent-clock', 'quicklink', 'studybot', 'personal-portfolio', 'qlynk-node-server'];
    for (const id of projectIds) {
      routes.push({ loc: `/projects/${id}`, changefreq: 'monthly', priority: '0.7' });
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

