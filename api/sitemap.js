export default async function handler(req, res) {
  try {
    // 1. Saare STATIC ROUTES
    const staticPages = [
      '', '/projects', '/about', '/me', '/contact', '/faq', 
      '/portfolio', '/links', '/proof', '/journal', '/now', 
      '/legal', '/terms', '/privacy', '/dmca', '/copyright', '/live'
    ];

    let dynamicRoutes = [];

    // 2. DYNAMIC ROUTES (Backend se fetch karna)
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      // A) Journal Links Fetch karna (Sirf published wale)
      const journalRes = await fetch(`${baseUrl}/api/journal?published=true`);
      const journalData = await journalRes.json();

      if (journalData.ok && Array.isArray(journalData.journals)) {
        journalData.journals.forEach(post => {
          dynamicRoutes.push(`/journal/view/${post._id}`);
        });
      }

      // B) Project Links (Tere diye gaye IDs)
      const projectIds = [
        'transparent-clock', 
        'quicklink', 
        'studybot', 
        'qlynk-node-server'
      ];
      
      projectIds.forEach(id => {
        dynamicRoutes.push(`/projects/${id}`);
      });

    } catch (error) {
      console.error('Error fetching dynamic routes for sitemap:', error);
    }

    // Saare pages ek array mein combine kar do
    const allRoutes = [...staticPages, ...dynamicRoutes];

    // 3. DONO DOMAINS jinpe tera portfolio chal raha hai
    const domains = ['https://just.qlynk.me', 'https://deepdey.vercel.app'];

    let xmlUrls = '';
    
    // Aaj ki date format karna (e.g., 2026-04-20)
    const today = new Date().toISOString().split('T')[0];

    // Dono domains ke liye saare routes ka XML string banana
    domains.forEach(domain => {
      allRoutes.forEach(route => {
        // Change frequency logic
        const changeFreq = route.includes('/journal/') ? 'weekly' : 'monthly';
        // Priority logic
        const priority = route === '' ? '1.0' : (route.includes('/journal/view/') ? '0.7' : '0.8');

        xmlUrls += `
  <url>
    <loc>${domain}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
      });
    });

    // Final XML structure
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`;

    // Browser/Bot ko batana ki ye XML file hai
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // 24 hours caching
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Sitemap generation failed:', error);
    res.status(500).send('Error generating sitemap');
  }
}
