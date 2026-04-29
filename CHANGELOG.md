# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [3.2.0] — 2026-04-29

### Added
- **V3.0 Global Search Engine:** `/search` route added to sitemap for full search-engine indexing. Trending tags and history pills now use improved spacing (gap-3, py-2.5) for a perfectly balanced look on mobile and desktop.
- **Live Status Ecosystem Refinements:** Floating status widget button background reduced to 40% opacity (`rgba(0,0,0,0.4)`) for a premium glassmorphism effect. Inner dot opacity tuned to exactly 80%. Glow ping and dot are now perfectly centered with `items-center justify-center`. History tab ExternalLink icon is now a fully clickable `<a target="_blank">` pointing to the status URL.
- **CMS Rich Text Embed Upgrades:** Three new media-embed action buttons added to the Journal editor toolbar — **🖼️ Image** (inserts `<img>` with `w-full rounded-xl`), **🎬 Video** (auto-converts YouTube URLs to `<iframe>` or mp4 to `<video controls>`), and **🎵 Audio** (inserts `<audio controls>`). All use `window.prompt()` for zero-friction URL entry.
- **Rich Typography Rendering:** `JournalView` and `JournalEmbed` HTML/richtext content divs now apply explicit Tailwind arbitrary-variant selectors (`[&>h1]`, `[&>h2]`, `[&>ul]`, `[&>p]`, `[&>blockquote]`, `[&>img]`) for premium Medium/Notion-style typography without requiring `@tailwindcss/typography` plugin.
- **Share Button Enhancement:** Share payload in `JournalView` now sends `"{title} by Deep Dey.\n\nRead the full post here: {url}\n\nExplore more at: deepdey.vercel.app"`.

---

## [3.1.5] — 2026-04-24 [LAST]

### Added
- `.github/workflows/ci.yml` — GitHub Actions CI pipeline (type-check + build on every push/PR)
- `.github/dependabot.yml` — Automated weekly dependency updates for npm and GitHub Actions
- `CHANGELOG.md` — This file

### Fixed
- `api/upload-image.js` — Upload proxy now sends `Authorization: Bearer` header (primary) alongside the legacy `password` header and a `password` form field, resolving 403 rejections from the upstream CDN when only the legacy header was sent
- `.env.example` — Corrected description of `SPACE_PASSWORD` (it is the CDN upload credential, not only a dashboard password)

---

## [Unreleased]

### Added
- **Dynamic Projects Dashboard:** Added a fully functional "Projects" tab in the admin dashboard to manage portfolio ecosystem directly via MongoDB. Includes a live split-screen visual and JSON preview.
- **3-Layer Auto-Screenshot Architecture:** Engineered a highly resilient serverless screenshot generator to bypass Vercel timeouts and Cloudflare bot-protections:
  - **Layer 1:** Google PageSpeed Insights API (Official Google servers for 0% CAPTCHA block and high compression).
  - **Layer 2:** Site-Shot API with Global Geolocation Proxies (Brazil/Tokyo) to bypass regional blocks.
  - **Layer 3:** Thum.io API with massive rotating human-like headers as a fail-safe raw image fallback.
- **Default vs Custom Ecosystem Mode:** Added a global toggle to seamlessly switch between static file-based projects (`projectsData.ts`) and dynamic MongoDB-driven projects.
- **Smart Client-Side Image Formatting:** Added CSS-based `object-fit` handling on the frontend to automatically stretch or crop heavily portrait screenshots into perfect 16:10 landscape preview cards.

### Changed
- Transitioned serverless architecture to Node.js 22 (`engines` updated).
- Optimized Vercel deployment by shifting from heavy local headless browsers to lightweight Cloud APIs, eliminating 502 memory crashes.

### Removed
- Removed `@sparticuz/chromium` to reduce build size and prevent Vercel 10-second timeout limits.

---


## [3.1.0] — 2026-04-09

### Added
- Academic Hiatus Notice effective April 9 2026 — bandwidth reallocated to JEE Advanced 2027
- `CONTRIBUTOR.md` — Attribution format and contributor roll
- `.github/CODEOWNERS` — Path-level code ownership declarations
- `.github/ISSUE_TEMPLATE/documentation.yml` — Dedicated documentation improvement template

### Changed
- Dashboard image upload: slug capped at 40 chars + 6-char random hex suffix to prevent 409 collisions
- `extractFileUrl()` enhanced to scan JSON response fields and fall back to regex scan + slug construction
- `parseDataUrl()` now strips embedded newlines from large base64 data URLs before decoding

### Fixed
- Upload proxy correctly detects CDN-level `status: "error"` responses even when HTTP status is 200

---

## [3.0.0] — 2025-12-01

### Added
- **React 19 + Vite 6** migration — concurrent rendering and sub-second HMR
- **12-language i18n** system — EN, BN, HI, ES, FR, DE, AR, RU, PT, JA, KO, ZH via React Context
- **Cinematic Loading Engine** — system-parsing intro with 50-quote rotating archive
- **Kinetic 3D PDF Portfolio Viewer** — Motion physics engine with `rotateY`, zoom controls, external URL fallback
- **YouTube Live Hub** — live stream auto-load, All/Stream/Video/Shorts tabs, 20-per-page pagination
- **Journal CMS** — MongoDB-backed markdown journal with per-visit view counting, one-like-per-session
- **Journal Embed** — `/journal/embed/:id` iframe-safe view (no header/footer chrome)
- **Smart Contact Routing** — 15 inquiry categories mapped to correct email channels with ticket IDs
- **CDN Image Upload Dashboard** — owner-only upload via `static.qlynk.me` proxy with drag-and-drop, clipboard paste
- **Link-in-Bio Engine** — 30+ nodes with JSON-driven inline SVG icons
- **Self-Aware Timeline** — auto-highlights current year phase, extends to 2035
- **Max-Level SEO** — `react-helmet-async`, JSON-LD (Person, FAQPage, SoftwareApplication), OpenGraph, canonical URLs
- `SECURITY.md` — Responsible disclosure policy and architectural security posture
- `CONTRIBUTING.md` — Branch naming, commit conventions, development workflow
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `SUPPORT.md` — Support matrix and response timeline
- `.github/pull_request_template.md` — Standardized PR template
- `.github/ISSUE_TEMPLATE/bug_report.yml` — Structured bug report form
- `.github/ISSUE_TEMPLATE/feature_request.yml` — Feature request form
- `.github/ISSUE_TEMPLATE/config.yml` — Issue template chooser with contact links

### Changed
- Routing migrated to React Router DOM v7 with lazy-loaded pages and animated transitions

---

## [2.0.0] — 2024-06-01

### Added
- React 18 + Vite 5 rewrite of the original HTML/CSS portfolio
- Tailwind CSS 3 Dark-Amber design system
- Motion animation library integration
- `react-pdf` 3D portfolio document viewer

---

## [1.0.0] — 2023-01-01

### Added
- Initial release — Vanilla HTML/CSS/JS personal portfolio site

---

[Unreleased]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/releases/tag/v1.0.0
