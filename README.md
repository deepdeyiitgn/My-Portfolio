<div align="center">
  <img src="public/assets/images/myphoto.png" alt="Deep Dey" width="110" height="110" style="border-radius:50%;border:3px solid #f59e0b;" />

  # 🌌 Deep Dey — Portfolio & System Architecture

  **Software Architect · AI Prompt Engineer · JEE Advanced 2027 Aspirant**

  [![Live](https://img.shields.io/badge/Live-deepdey.vercel.app-000000?style=for-the-badge&logo=vercel)](https://deepdey.vercel.app)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

  [![License](https://img.shields.io/badge/License-Custom_Restricted_🔒-ef4444?style=for-the-badge)](./LICENSE)
  [![Security](https://img.shields.io/badge/Security-Policy-f97316?style=for-the-badge)](./SECURITY.md)
  [![Contributing](https://img.shields.io/badge/Contributing-Welcome-22c55e?style=for-the-badge)](./CONTRIBUTING.md)
  [![Code of Conduct](https://img.shields.io/badge/Code_of_Conduct-Enforced-8b5cf6?style=for-the-badge)](./CODE_OF_CONDUCT.md)
  [![Support](https://img.shields.io/badge/Support-Available-0ea5e9?style=for-the-badge)](./SUPPORT.md)
  [![Changelog](https://img.shields.io/badge/Changelog-📋-64748b?style=for-the-badge)](./CHANGELOG.md)
  [![Setup Manual](https://img.shields.io/badge/Setup_Manual-Start_Here-0ea5e9?style=for-the-badge)](./PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md)
  [![CI](https://github.com/deepdeyiitgn/My-Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/deepdeyiitgn/My-Portfolio/actions/workflows/ci.yml)

  > *"100% effort + extra 1% = Dream Achieved."*

  **[🌐 Live Site](https://deepdey.vercel.app)** · **[📬 Contact](https://deepdey.vercel.app/contact)** · **[🔗 Links Hub](https://deepdey.vercel.app/links)** · **[📖 Journal](https://deepdey.vercel.app/journal)**
</div>

---

## 📖 Overview

This repository is the complete source code of **Deep Dey's personal portfolio platform** — a production-grade, high-fidelity web application built with a cinematic **Dark-Amber** design language (`zinc-950` backgrounds · `amber-500` glowing accents).

It is not just a portfolio site. It is a **system-architecture-themed personal brand platform** that combines:

- 3+ years of self-taught full-stack experience
- A live **Build Journal** (markdown CMS with MongoDB backend)
- A **Content Dashboard** for managing journals, images, and categories
- A **YouTube Live Stream** hub with tab filters and pagination
- A **Smart Contact Router** that auto-maps inquiry types to correct email channels
- Max-level **Technical SEO** with JSON-LD structured data

All while the author simultaneously prepares for **JEE Advanced 2027** targeting **IIT KGP CSE**.

---

## 🧾 Summary

- Fully responsive React + TypeScript portfolio with API-backed dynamic modules.
- `/live` now supports category-aware content listing (Stream/Video/Shorts), enriched metadata, and paginated browsing.
- `/api/live` supports no-key fallback mode plus richer YouTube stats/comments when API key is configured.
- Root auth shortcut URLs are supported: `/?signup`, `/?login`, `/?logout`, and `/?password=<SPACE_PASSWORD>`.
- Google shortcut callback on `/contact?googleAuth=1&intent=...` now persists session identity so login/signup both remain signed in consistently.
- Full self-setup documentation is available in **[`PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md`](./PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md)**.

---

## 🎯 Feature Highlights

### 🔭 Global Command Palette Search
Full-stack search engine at `/search` with typewriter-animated suggestions, trending query tracking, localStorage history, and a TF-IDF ML fallback. Searches journals, projects, FAQs, social links, live status, plus community users and comment permalinks. Fully indexed in the sitemap.

### 🧩 Dynamic Feature Atlas
New route family `/feature` and `/feature/:slug` provides 30+ detailed feature pages with title, summary, long description, architecture nodes, workflow stages, implementation notes, visualizations, quality checks, risks, and roadmap sections. Feature cards on `/feature` auto-load from the `src/features/content/*.json` directory and truncate long summaries with `.......` for compact readability. Adding a new JSON file in that folder automatically enables atlas listing, detail rendering, server-side social metadata, and sitemap inclusion without editing `App.tsx`, feature page code, or `api/sitemap.js`.

### 📡 Real-Time System Status Monitor
Live status page at `/status` probes all website-critical API routes every 60 s (heavy endpoints every 5 min) and displays latency, HTTP status, and connection quality. Monitored endpoints include auth, journal listing/search/top feeds, user profile/activity/community APIs, categories, projects, timeline, links, FAQs, YouTube live feed, contact (GET + POST), sitemap, and upload proxy route metadata. To reduce serverless cold-start distortion, automatic probes/ping use a warm-up call followed by a measured second call. Includes a **Server Health** panel with a highlighted **System Specifications** card showing RAM, storage, CPU model/cores/speed, OS type and kernel, architecture, runtime version, server region, and hostname. A rate-limited **"Refresh Now"** button (global 20/min · per-IP 2/min) triggers a full health snapshot stored in MongoDB for historical tracking.

### 🧪 Floating Live Status Widget
A global status widget is mounted at the app shell level and remains available across routes. It provides quick visibility into live API health without leaving the current page.

### 🖥️ Interactive Terminal 404 Experience
The `*` fallback route powers a command-driven terminal UI with route-aware `cd` navigation, API-backed `status`/`links` commands, command history, hidden easter-egg commands, and matrix-style effects.

### 🎬 Cinematic Loading Engine
A one-time-per-browser-session cinematic title sequence (`Deep Dey's Portfolio` → `A QLYNK Production`) now plays before the normal loader. The normal loading screen enforces a strict **minimum 3-second visibility**, then waits for document load plus in-flight fetch calls to finish before disappearing. Progress percentage/bar are now synchronized with loader completion timing, and route-loader scroll reset now uses non-smooth top reset only on real route changes to avoid bounce/jump effects.

### 🎞️ Kinetic 3D PDF Portfolio Viewer
Custom `react-pdf` viewer wrapped in a Motion 3D physics engine (`rotateY`). Includes A4 aspect-ratio lock, zoom controls, and an external-URL fallback chain.

### 📬 Smart Contact Routing Matrix
Backend-less intelligent intake. Routes 15 inquiry categories to the right email node with pre-filled mailto tickets and auto-generated ticket IDs. Contact now supports optional Google sign-in to prefill the **actual Google account name + email** and auto-attach each logged-in user's private service key in submission metadata (fallback label: `NON LOGIN USER`) without exposing the service key directly in the on-page contact UI. If an owner session is already authenticated (`/api/auth` cookie), Contact no longer asks for Google sign-up/sign-in. Contact page container keeps horizontal clipping only (`overflow-x-hidden`) so vertical scroll remains normal on mobile browsers.

### 🔐 URL-Based Auth Shortcuts
Quick URL triggers are available from the root route:
- `/?signup` → calls backend auth URL builder, redirects to Google auth, then returns to Contact callback flow and redirects the signed-in user to `/user/:userId`
- `/?login` → calls backend auth URL builder, redirects to Google auth, then returns to Contact callback flow and redirects the signed-in user to `/user/:userId`
- Both callbacks persist the Google identity in local storage after state + nonce validation, so Contact/login state stays synced after redirect.
- `/?logout` → calls backend logout, clears owner/community session state, then redirects to home (`/`)
- `/?password=<SPACE_PASSWORD>` → posts to owner auth and redirects to Dashboard (`/dashboard`)

### 📓 Journal CMS with Embed Support
Full rich text / markdown / HTML journal system backed by MongoDB. Features per-visit view counting, one-like-per-session enforcement, native share API, image galleries, and embeddable output (`/journal/embed/:id`). Embed code now always uses the journal MongoDB `_id` for stable resolution, and embeds render the actual post body for all supported content types. HTML-type posts are served by `/api/journal?action=html-file` and rendered inline (non-iframe) in journal view/embed, while markdown/richtext behavior remains unchanged. Unpublishing a post keeps existing comments/replies intact and preserves the original publish timestamp for any later re-publish.

### 📺 YouTube Live Hub
Auto-loads the current live stream. Sidebar shows all channel content filtered by **All / Stream / Video / Shorts** tabs with newest-first sorting, views count, and Prev/Next pagination (20 per page).

### 🖼️ CDN Image Upload & Media CMS (Dashboard)
Owner-only dashboard uploads images to `static.qlynk.me` via `/api/upload-image` proxy. Supports file picker, drag-and-drop, clipboard paste, and URL links. Rich text editor includes one-click embed buttons for **Images**, **YouTube/MP4 Videos**, and **Audio** — no manual HTML required.

### 🌐 Data-Driven Link-in-Bio Engine
A JSON-driven hub mapping 30+ internal/external nodes with dynamic inline SVG icons that auto-adapt to the Dark-Amber theme.

### ⏱️ Self-Aware Timeline
The milestone timeline uses `new Date().getFullYear()` to auto-highlight the current active phase with a glowing amber radar pulse (extends to 2035).

### 🔍 Max-Level SEO
`react-helmet-async` drives per-route metadata injection: Canonical URLs, OpenGraph/Twitter cards, and `Schema.org` JSON-LD (Person, FAQPage, SoftwareApplication). A server-rendered HTML shell also injects the correct title/description/image for shared links, so WhatsApp, Twitter/X, Discord, and other unfurlers can read page-specific metadata before the SPA hydrates. Journal posts automatically use a random uploaded post image for share cards, with `/assets/images/myphoto.png` as the fallback when a post has no uploaded images. All routes including `/search`, `/user`, `/feedback`, and `/journal/comment` are included in the XML sitemap.

### 🌍 12-Language i18n
Full UI translated across EN · BN · HI · ES · FR · DE · AR · RU · PT · JA · KO · ZH via a custom React Context provider.

### 💬 Journal Comment System
Readers can leave comments on any journal post using Google Sign-In — no password needed. Supports threaded replies, likes, and direct comment permalinks (`/journal/view/:id/comment/:commentId`). A full comment thread view (`/journal/view/:id/comments`) shows all comments with sort (top/new/old) and pagination. The `/journal/comment` community guide now covers both comments and feedback, including small preview demos showing how each content type appears on the website.

### ⭐ Professional Feedback Management System
Dedicated public feedback page at `/feedback` with rating distribution bars, interactive 5-star submission, subject/sub-subject taxonomy, strict one-feedback-per-subject-sub-subject enforcement, and blacklist filtering that reuses the same `comment_blacklist` source as the journal comment system. Feedback text is only censored when a blacklist match is found; clean feedback stays unchanged. Owner dashboard includes full moderation (edit/delete), unlimited pinning, feedback category/sub-subject CRUD, and visibility of the original uncensored text for feedback entries flagged by blacklist filtering.

### 🛡️ Owner User Moderation & Destructive Controls
Dashboard user management now supports password-confirmed temporary deactivation for full account visibility, comments, profile, or feedback separately. Full deactivation hides profile/comments/replies/feedback and blocks new community activity, while scoped modes can independently hide comments, profile visibility, or feedback submission/listing. The owner can also delete a user's comments+feedback while keeping the profile, or permanently erase the user's profile, comments, replies, feedback, and moderation records — all from the existing dashboard/backend flow without adding a new API route file.

### 🔐 Security Hardening & Soft Rate Limiting
- Owner dashboard login now has in-memory IP-based attempt throttling with escalation: 5 failures/minute, then lockouts of 2m, 5m, 10m, 15m... capped at 60m for subsequent cycles.
- Community posting now enforces minimum 100 characters for comments, replies, and feedback.
- Posting cooldowns are now in-memory and per-IP with independent 2-minute windows for comment, reply, and feedback scopes (no database writes for rate-limit state).
- Search now includes substring/character-token fallback matching so embedded tokens (e.g. `hfxyzjw` containing `xyz`) can still surface relevant results.

### 👥 Community User Profiles
Every reader who signs in gets a public profile at `/user/:userId`. Profiles show a customizable title, bio, social links (GitHub, Twitter, LinkedIn, Instagram, YouTube, Website, Custom with Google Favicon auto-detection), a 52-week contribution heatmap, and tabbed views for Overview, Comments, and Activity Log. The `/user` page lists all contributors with the owner card pinned at the top — styled with a **glowing gradient-border frame, `myphoto.png` avatar with an amber halo, and a 👑 Owner badge** for a visually distinct king-vibe presence. Verified tick and crown badges are now rendered as frontend vector icons (not public image files) for a cleaner professional UI. The owner's `/user/owner` profile page carries the same premium styling.  
When a user is logged into their own profile, they also get a private identity panel (not public): Google email plus a private 16-digit service key shown masked by default with reveal/hide, copy, and rotate controls.

### 🗺️ Dynamic XML Sitemap with RAM Cache
`/api/sitemap` auto-generates a valid XML sitemap scoped exclusively to `deepdey.vercel.app`. It covers all static routes (excluding `/dashboard` and `/journal/embed`) including `/feedback`, dynamically fetches published journals and emits **slug-based** journal URLs, comment-thread pages, comment permalink routes, and user profile URLs from MongoDB. Results are stored in-memory and refreshed every 6 hours (`Cache-Control: s-maxage=21600`). Subsequent requests within the TTL window are served instantly from RAM (`X-Sitemap-Cache: HIT`).

### ⚙️ Vercel Free Plan Compliance (Function Limit)
Feedback and moderation features are implemented by extending existing handlers (`/api/journal`, `/api/categories`) instead of creating new API files, keeping the deployment within the Vercel Free Plan serverless function limit.

### 🚀 Key Features of New Dashboard

* **Advanced Project Ecosystem:** Manage portfolio projects through a custom dashboard. Switch seamlessly between static data files and a dynamic MongoDB database.
* **Overpowered Screenshot Bot:** A custom 3-Layer backend architecture that automatically captures live website screenshots. 
  * Uses Google's PageSpeed API, Global Geo-Proxies, and rotating Human-Agent headers to completely bypass bot protection (Cloudflare, CAPTCHAs) and Vercel's strict serverless timeout limits.
* **Smart UI Previews:** Auto-crops and formats dynamic Base64 images directly on the client side to maintain perfect aspect ratios without overloading the backend.
* **Media Embeds:** Insert images, YouTube iframes, MP4 videos, and audio tracks directly into journal posts via toolbar prompt buttons.
* **Owner User Monitoring:** The Dashboard Users tab lists all registered commenters. Clicking a user reveals a detail panel with their full metadata including **account creation datetime + IP + country**, **last activity datetime + IP + country**, Google email (when available), a private 16-digit service key (masked by default with reveal/copy/rotate controls), comment history with abuse flags, quick-block controls, and a link to their public profile.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **UI Framework** | React | `19.x` | Component-driven UI with concurrent rendering |
| **Language** | TypeScript | `5.x` | Static typing across all components and data |
| **Build Tool** | Vite | `6.x` | Sub-second HMR, tree-shaking, chunked bundles |
| **Styling** | Tailwind CSS | `4.x` | Utility-first Dark-Amber glassmorphism system |
| **Animation** | Motion | `12.x` | Physics-based transitions, 3D flips, scroll reveals |
| **Routing** | React Router DOM | `7.x` | Lazy-loaded SPA with wildcard 404 handling |
| **PDF Renderer** | react-pdf | `10.x` | Client-side A4 portfolio document renderer |
| **SEO** | react-helmet-async | `3.x` | Async head tag injection for rich snippets |
| **Database** | MongoDB Atlas | — | Journal, category, status, health snapshot, and rate-limit persistence |
| **CDN / Storage** | static.qlynk.me | — | Proxied secure image upload and hosting |
| **Hosting** | Vercel | — | Global edge CDN, CI/CD, SPA rewrites |

---

## 📂 Project Structure

```text
📦 My-Portfolio
 ┣ 📜 .env.example                # Environment variable template
 ┣ 📜 README.md                  # You are here
 ┣ 📜 LICENSE                    # Custom Restricted (View-Only) license
 ┣ 📜 SECURITY.md                # Vulnerability reporting policy
 ┣ 📜 CONTRIBUTING.md            # Contribution guidelines
 ┣ 📜 CONTRIBUTOR.md             # Contributor acknowledgements
 ┣ 📜 CHANGELOG.md               # Release notes and version history
 ┣ 📜 PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md # Setup/deploy/ownership transfer guide
 ┣ 📜 CODE_OF_CONDUCT.md         # Community behavior standards
 ┣ 📜 SUPPORT.md                 # Support channels
 ┣ 📜 package.json               # Scripts and dependency manifest
 ┣ 📜 package-lock.json          # Exact npm dependency lockfile
 ┣ 📜 tsconfig.json              # TypeScript compiler configuration
 ┣ 📜 tailwind.config.js         # Tailwind theme customization
 ┣ 📜 vite.config.ts             # Vite build and dev configuration
 ┣ 📜 vercel.json                # Vercel routing rules and redirects
 ┣ 📜 metadata.json              # Repository metadata
 ┣ 📜 index.html                 # Vite HTML entry point
 ┣ 📂 api                        # Vercel serverless API routes
 ┃ ┣ 📜 package.json             # API runtime metadata for serverless context
 ┃ ┣ 📜 auth.js                  # Session authentication handler
 ┃ ┣ 📜 categories.js            # Journal + feedback category/sub-subject CRUD
 ┃ ┣ 📜 contact.js               # Contact form handler
 ┃ ┣ 📜 faqs.js                  # FAQ data endpoint
 ┃ ┣ 📜 journal.js               # Journal + feedback APIs · health · rate-limited refresh
 ┃ ┣ 📜 links.js                 # Links data endpoint
 ┃ ┣ 📜 live.js                  # YouTube live/videos/shorts aggregator with API-key + no-key fallback
 ┃ ┣ 📜 logger.js                # Lightweight server logger helper
 ┃ ┣ 📜 projects.js              # Projects CRUD endpoint
 ┃ ┣ 📜 sitemap.js               # Dynamic XML sitemap generator
 ┃ ┣ 📜 timeline.js              # Timeline milestones endpoint
 ┃ ┗ 📜 upload-image.js          # CDN image upload proxy
 ┣ 📂 public                     # Static assets (served as-is)
 ┃ ┣ 📂 .well-known
 ┃ ┃ ┗ 📜 discord                # Discord domain verification file
 ┃ ┣ 📂 assets/docs              # Portfolio PDF documents
 ┃ ┣ 📂 assets/images            # Static image files
 ┃ ┣ 📜 verified.svg             # Verified badge icon source
 ┃ ┣ 📜 crown.svg                # Crown badge icon source
 ┃ ┣ 📜 robots.txt               # Crawl directives
 ┃ ┗ 📜 sitemap.xml.txt          # Static sitemap snapshot
 ┣ 📂 src
 ┃ ┣ 📂 components               # Reusable UI components
 ┃ ┃ ┣ 📜 CommentSection.tsx     # Journal comments + replies + moderation UI
 ┃ ┃ ┣ 📜 ContactForm.tsx        # Contact form UI block
 ┃ ┃ ┣ 📜 FAQ.tsx                # Shared FAQ component
 ┃ ┃ ┣ 📜 FeedbackAdminPanel.tsx # Owner feedback moderation + category manager
 ┃ ┃ ┣ 📜 Footer.tsx             # Global footer with legal links
 ┃ ┃ ┣ 📜 Header.tsx             # Responsive navigation header
 ┃ ┃ ┣ 📜 IdentityBadges.tsx     # Inline SVG verified/crown badge renderer
 ┃ ┃ ┣ 📜 JourneyMarquee.tsx     # GPU-accelerated timeline marquee
 ┃ ┃ ┣ 📜 Layout.tsx             # Page layout wrapper (skips for embeds)
 ┃ ┃ ┣ 📜 LoadingScreen.tsx      # Cinematic intro loading screen
 ┃ ┃ ┣ 📜 ProjectPlaceholder.tsx # Project fallback card
 ┃ ┃ ┣ 📜 ScrollToTop.tsx        # Scroll-to-top floating button
 ┃ ┃ ┣ 📜 SEO.tsx                # JSON-LD + OpenGraph meta manager
 ┃ ┃ ┣ 📜 SocialProof.tsx        # Dynamic feedback metrics + pinned testimonial scroller
 ┃ ┃ ┣ 📜 StatusWidget.tsx       # Floating live-status popup widget
 ┃ ┃ ┗ 📜 TechGalaxy.tsx         # Animated tech stack visual
 ┃ ┣ 📂 context
 ┃ ┃ ┗ 📜 LanguageContext.tsx    # 12-language i18n context provider
 ┃ ┣ 📂 data                     # Static typed data models
 ┃ ┃ ┣ 📜 contentData.ts         # Home/about copy blocks and UI content
 ┃ ┃ ┣ 📜 faqData.ts             # FAQ questions and answers
 ┃ ┃ ┣ 📜 linksData.ts           # Link hub node definitions
 ┃ ┃ ┣ 📜 nowData.ts             # "Now" page structured updates
 ┃ ┃ ┣ 📜 proofData.ts           # Proof page structured evidence blocks
 ┃ ┃ ┣ 📜 projectsData.ts        # Project cards and detail data
 ┃ ┃ ┗ 📜 timelineData.ts        # Life milestone timeline data
 ┃ ┣ 📂 pages                    # Route-level page components
 ┃ ┃ ┣ 📜 About.tsx              # About / philosophy page
 ┃ ┃ ┣ 📜 AllUsers.tsx           # Community user listing (/user)
 ┃ ┃ ┣ 📜 CommentGuide.tsx       # Step-by-step comment instructions (/journal/comment)
 ┃ ┃ ┣ 📜 CommentPermalink.tsx   # Standalone comment permalink view
 ┃ ┃ ┣ 📜 Contact.tsx            # Smart contact routing page
 ┃ ┃ ┣ 📜 Copyright.tsx          # Copyright information
 ┃ ┃ ┣ 📜 Dashboard.tsx          # Owner-only CMS dashboard
 ┃ ┃ ┣ 📜 DMCA.tsx               # DMCA takedown policy
 ┃ ┃ ┣ 📜 FAQ.tsx                # Searchable FAQ with accordion
 ┃ ┃ ┣ 📜 Feedback.tsx           # Public feedback submission + listing page
 ┃ ┃ ┣ 📜 Home.tsx               # Hero / landing page
 ┃ ┃ ┣ 📜 Journal.tsx            # Journal listing page
 ┃ ┃ ┣ 📜 JournalAllComments.tsx # Full comment thread for a post (/journal/view/:id/comments)
 ┃ ┃ ┣ 📜 JournalEmbed.tsx       # Embeddable journal (no chrome)
 ┃ ┃ ┣ 📜 JournalView.tsx        # Full journal detail page
 ┃ ┃ ┣ 📜 LegalHub.tsx           # Legal hub index
 ┃ ┃ ┣ 📜 Links.tsx              # Link-in-bio hub
 ┃ ┃ ┣ 📜 Live.tsx               # YouTube Live & video hub
 ┃ ┃ ┣ 📜 Me.tsx                 # Personal / creative profile
 ┃ ┃ ┣ 📜 NotFound.tsx           # 404 fallback page
 ┃ ┃ ┣ 📜 Now.tsx                # "What I'm doing now" page
 ┃ ┃ ┣ 📜 Portfolio.tsx          # 3D PDF portfolio viewer
 ┃ ┃ ┣ 📜 Privacy.tsx            # Privacy policy
 ┃ ┃ ┣ 📜 Projects.tsx           # Projects listing
 ┃ ┃ ┣ 📜 ProjectDetail.tsx      # Individual project deep-dive
 ┃ ┃ ┣ 📜 Proof.tsx              # Proof of work page
 ┃ ┃ ┣ 📜 SearchResults.tsx      # Global search results page
 ┃ ┃ ┣ 📜 Status.tsx             # Real-time system status & server health
 ┃ ┃ ┣ 📜 Terms.tsx              # Terms of service
 ┃ ┃ ┗ 📜 UserProfile.tsx        # Public user profile with heatmap & social links (/user/:userId)
 ┃ ┣ 📜 App.tsx                  # Root router + animated routes
 ┃ ┣ 📜 index.css                # Global CSS + Tailwind directives
 ┃ ┣ 📜 main.tsx                 # React application entry point
 ┃ ┣ 📜 vite-env.d.ts            # Vite ambient type declarations
 ┃ ┗ 📂 utils
 ┃   ┗ 📜 iconMap.ts             # Dashboard icon registry and render helpers
 ┣ 📂 .github
 ┃ ┣ 📂 ISSUE_TEMPLATE           # Structured GitHub issue templates
 ┃ ┃ ┣ 📜 api_backend.yml        # API/backend issue form
 ┃ ┃ ┣ 📜 bug_report.yml         # Bug report form
 ┃ ┃ ┣ 📜 performance.yml        # Performance issue form
 ┃ ┃ ┣ 📜 feature_request.yml    # Feature request form
 ┃ ┃ ┣ 📜 documentation.yml      # Documentation improvement form
 ┃ ┃ ┣ 📜 question.yml           # Question / discussion form
 ┃ ┃ ┣ 📜 user_profile.yml       # User profile/community issue form
 ┃ ┃ ┗ 📜 config.yml             # Issue template chooser + contact links
 ┃ ┣ 📂 workflows
 ┃ ┃ ┣ 📜 ci.yml                 # GitHub Actions CI (type-check + build)
 ┃ ┃ ┗ 📜 keep-alive.yml         # Scheduled keep-alive workflow
 ┃ ┣ 📜 CODEOWNERS               # Code ownership declarations
 ┃ ┣ 📜 FUNDING.yml              # Sponsorship links
 ┃ ┣ 📜 dependabot.yml           # Automated dependency updates
 ┃ ┗ 📜 pull_request_template.md # Standardized PR template
 ┗ 📂 dist                       # Production build output (git-ignored)
```

---

## 🧭 Routes Reference

| Route | Description |
| :--- | :--- |
| `/` | Hero landing page with timeline, journal spotlight, community section, and CTA |
| `/about` | Background, philosophy, and approach |
| `/me` | Personal creative profile and current status |
| `/now` | What I'm working on right now |
| `/projects` | Full project listing grid |
| `/projects/:id` | Individual project deep-dive detail |
| `/feature` | Dynamic feature atlas with summary cards |
| `/feature/:slug` | Detailed feature page (auto-discovered from feature content folder) |
| `/portfolio` | 3D PDF architectural blueprint viewer |
| `/proof` | Proof of work and achievements |
| `/links` | Link-in-bio ecosystem hub (30+ nodes) |
| `/contact` | Smart 15-category contact routing form |
| `/journal` | Journal listing with metadata (likes, views, read time) |
| `/journal/view/:id` | Full journal article with engagement actions |
| `/journal/view/:id/comments` | Full paginated comment thread for a post |
| `/journal/comment/:commentId` | Legacy/short permalink route for a specific comment |
| `/journal/view/:id/comment/:commentId` | Standalone comment permalink |
| `/journal/comment` | Step-by-step guide for commenting and community rules |
| `/journal/embed/:id` | Embeddable journal view (no header/footer), generated using journal `_id` |
| `/feedback` | Public feedback page with rating summary, filters, sorting, and pagination |
| `/user` | Community user listing — owner pinned at top, contributors below |
| `/user/:userId` | Public user profile with bio, social links, contribution heatmap, and activity tabs |
| `/live` | YouTube live stream + All/Stream/Video/Shorts hub |
| `/search` | Full-stack global search with trending queries and easter eggs |
| `/status` | Real-time API status, server health, and system specifications |
| `/faq` | Searchable FAQ with accordion interface |
| `/dashboard` | Owner-only content management dashboard |
| `/legal` | Legal hub index |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/dmca` | DMCA takedown policy |
| `/copyright` | Copyright information |

---

## 📋 Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for a full version history and release notes.
For full ownership transfer and deployment instructions, see [`PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md`](./PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md).

---

## 🚀 Local Development

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/deepdeyiitgn/My-Portfolio.git
cd My-Portfolio

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

### Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `vite` | Start local dev server with HMR |
| `build` | `vite build` | Production build to `./dist` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `tsc --noEmit` | TypeScript type-check (no emit) |

### Environment Variables

Set the following in your Vercel project settings (or a `.env.local` for local development — **never commit this file**):

```env
# MongoDB connection string for Journal + Category storage
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio

# CDN upload password for the static.qlynk.me proxy
SPACE_PASSWORD=your_space_password_here

# Optional but recommended: enforce audience check on Google identity token verification
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Where to find each value:
- `MONGODB_URI`: MongoDB Atlas → **Database** → **Connect** → **Drivers** connection string URI.
- `SPACE_PASSWORD`: from your `static.qlynk.me`/storage provider account credentials (the upload API secret you configure for `/api/upload-image`).
- `GOOGLE_CLIENT_ID`: Google Cloud Console → **APIs & Services** → **Credentials** → OAuth 2.0 Client IDs.
- `YOUTUBE_API_KEY` / `GOOGLE_API_KEY` (optional): Google Cloud Console → **APIs & Services** → **Credentials** → API key.  
  Also enable **YouTube Data API v3** in the same project under **Library**.

> **Note:** The app runs in read-only mode without these variables. Journal CRUD and image upload require valid credentials.

---

## 🧩 Make This Your Own Portfolio (Complete Customization Guide)

If you want to turn this project into your own portfolio site, follow this checklist.

### 1) Personal Branding and Core Identity

- Replace avatar/media assets in:
  - `public/assets/images/`
  - `public/assets/docs/` (portfolio PDF)
- Update name/title/identity copy across route pages:
  - `src/pages/Home.tsx`
  - `src/pages/About.tsx`
  - `src/pages/Me.tsx`
  - `src/pages/Portfolio.tsx`
- Update owner metadata and badges where owner identity is rendered:
  - `src/pages/AllUsers.tsx`
  - `src/pages/UserProfile.tsx`
  - `src/components/CommentSection.tsx`

### 2) Content and Data You Can Edit Quickly

- Projects: `src/data/projectsData.ts`
- Feature pages (dynamic): `src/features/content/*.json`
- Timeline/Journey: `src/data/timelineData.ts`
- Links hub: `src/data/linksData.ts`
- FAQ: `src/data/faqData.ts`
- “Now” content: `src/data/nowData.ts`

These files are the fastest path for non-backend customization.

### 3) SEO, Domain, and Public Metadata

- Global/per-page SEO component: `src/components/SEO.tsx`
- App route registration: `src/App.tsx`
- Static crawler files:
  - `public/robots.txt`
  - `public/sitemap.xml` (plus dynamic API sitemap via `/api/sitemap`)
- Update canonical domain references if you deploy to a new domain.

### 4) Dashboard and CMS Behavior

- Owner dashboard UI: `src/pages/Dashboard.tsx`
- Journal/feedback/user moderation APIs: `api/journal.js`
- Categories and feedback taxonomy APIs: `api/categories.js`
- Auth/session API: `api/auth.js`
- Image upload proxy API: `api/upload-image.js`

For changes in admin workflows, prefer extending existing API files instead of creating new route files.

### 5) Identity, Privacy, and Community System

- Public profile/community pages:
  - `src/pages/AllUsers.tsx`
  - `src/pages/UserProfile.tsx`
- Privacy/legal pages:
  - `src/pages/Privacy.tsx`
  - `src/pages/Terms.tsx`
  - `src/pages/DMCA.tsx`
  - `src/pages/Copyright.tsx`

Current identity behavior:
- Google-authenticated users can have private identity fields in account records (email + private 16-digit service key).
- Service key is masked by default, reveal/copy/rotate-capable, and intended for support-side identity verification.

### 6) Verify Your Customized Build

```bash
npm ci
npm run lint
npm run build
```

If both checks pass, your customized portfolio is production-ready for Vercel deployment.

---

## 🔐 Security

Security issues must **not** be reported via public GitHub issues. See [`SECURITY.md`](./SECURITY.md) for the full responsible disclosure policy and response timeline.

- Email `a@qlynk.me` or `team.deepdey@gmail.com`
- Subject: `[SECURITY REPORT] <Brief Description>`
- Critical patches deployed within **24 hours** of triage

---

## 🤝 Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.

**Quick rules:**
1. Fork → branch → PR (small, focused changes only)
2. Run `npm run lint` and `npm run build` before submitting
3. Maintain visual consistency with the Dark-Amber design system
4. No secrets or private credentials in any commit

---

## ⏸️ Academic Hiatus Notice

> **Effective: April 9, 2026**

All major external software projects (**DEQLYNK**, **QuickLink**, **Transparent Clock**) are on strict hiatus. Bandwidth is 100% reallocated to **JEE Advanced 2027** preparation targeting **IIT KGP CSE**. Routine feature updates resume post-examination.

Bug fixes, security patches, and documentation improvements remain active.

---

## ©️ License & Copyright

**Designed and Architected by Deep Dey**
© 2020–2026 Deep Dey · All Rights Reserved

This repository is published under a **Custom Restricted (View-Only) License**. See [`LICENSE`](./LICENSE) for full terms.

For collaboration or architectural consultation, use the [Contact Hub](https://deepdey.vercel.app/contact).
