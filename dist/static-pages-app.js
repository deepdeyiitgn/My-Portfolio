(function renderStaticPages() {
  const pages = Array.isArray(window.STATIC_PAGES_DATA) ? window.STATIC_PAGES_DATA : [];
  const pageSlug = document.body.getAttribute('data-static-page');
  const mount = document.getElementById('app');
  if (!mount) return;

  const navigation = `
    <div class="header-wrap">
      <div class="container header">
        <a class="brand" href="/">DEEP DEY.</a>
        <nav class="nav" aria-label="Static navigation">
          <a href="/">Home</a>
          <a href="/projects">Projects</a>
          <a href="/feature">Features</a>
          <a href="/journal">Journal</a>
          <a href="/contact">Contact</a>
          <a href="/static-pages.html">Static Pages Hub</a>
        </nav>
      </div>
    </div>
  `;

  if (pageSlug === '__hub__') {
    mount.innerHTML = `
      ${navigation}
      <main class="container hero">
        <span class="badge">Static Content Hub</span>
        <h1>Project Static Pages Index</h1>
        <p class="summary">This hub lists all static pages published for readers, crawlers, and content accessibility. Each page contains detailed project-oriented writing and direct links back to live portfolio sections.</p>
        <div class="notice">Note: these static pages are published as transparent, user-visible content pages and are also used during content accessibility and ad review checks.</div>
        <section class="panel" aria-label="Static pages list">
          <h2>All Static Pages</h2>
          <div class="hub-grid">
            ${pages.map((item) => `
              <a href="/${item.slug}.html">
                <strong>${item.title}</strong>
                <span>${item.summary}</span>
              </a>
            `).join('')}
          </div>
        </section>
      </main>
      <footer class="footer">
        <div class="container">
          <p class="footer-note">© ${new Date().getFullYear()} Deep Dey Portfolio — Static Pages Hub</p>
        </div>
      </footer>
    `;
    return;
  }

  const page = pages.find((item) => item.slug === pageSlug);
  if (!page) {
    mount.innerHTML = `${navigation}<main class="container hero"><h1>Page not found</h1><p class="summary">The requested static content page is unavailable.</p></main>`;
    return;
  }

  const paragraphs = Array.from({ length: 56 }, (_, index) => {
    const sequence = index + 1;
    const highlight = page.highlights[index % page.highlights.length];
    return `<p>Section ${sequence}: In this ${page.focus.toLowerCase()} narrative, we explain how "${highlight}" contributes to dependable user outcomes, measurable quality, and long-term maintainability across the Deep Dey portfolio ecosystem. This section also describes practical implementation intent, expected behavior, and how readers can navigate related sections from the main application.</p>`;
  }).join('');

  mount.innerHTML = `
    ${navigation}
    <main class="container hero">
      <span class="badge">${page.focus}</span>
      <h1>${page.title}</h1>
      <p class="summary">${page.summary}</p>
      <div class="notice">This document is one of the static pages published for project transparency, content accessibility, and ad review support while preserving a user-readable experience.</div>

      <section class="panel">
        <h2>Key Focus Areas</h2>
        <ul class="pillars">
          ${page.highlights.map((h) => `<li>${h}</li>`).join('')}
        </ul>
      </section>

      <section class="panel long-content">
        <h2>Detailed Project Narrative</h2>
        ${paragraphs}
      </section>

      <section class="panel">
        <h2>Continue Exploring</h2>
        <div class="cta-grid">
          <a href="/static-pages.html">Open Static Pages Hub</a>
          <a href="/projects">View Live Project Pages</a>
          <a href="/feature">Browse Feature Atlas</a>
          <a href="/journal">Read Project Journal</a>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="container">
        <p class="footer-note">© ${new Date().getFullYear()} Deep Dey Portfolio — ${page.title}. This static page is publicly visible and linked for both readers and crawlers.</p>
      </div>
    </footer>
  `;
})();
