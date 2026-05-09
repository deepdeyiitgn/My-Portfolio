# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- **Professional Feedback Management System (`/feedback`):** Added a dedicated feedback page with interactive 5-star submissions, rating-distribution summary bars, subject/sub-subject taxonomy, strict one-feedback-per-subject-sub-subject enforcement, blacklist-filtered text persistence, sorting/filtering, 20-per-page pagination, and long-text see-more modal flow.
- **Feedback APIs without new serverless files:** Extended existing handlers only:
  - `GET /api/journal?action=feedback-list|feedback-stats|feedback-pinned|feedback-admin-list`
  - `POST /api/journal?action=feedback|feedback-pin`
  - `PUT /api/journal?action=feedback-admin`
  - `DELETE /api/journal?action=feedback-admin&id=<id>`
  - `GET/POST/PUT/DELETE /api/categories?type=feedback` for subject and sub-subject CRUD.
- **Owner Dashboard Feedback Tab:** Added owner-facing feedback moderation panel with unlimited pinning, admin edit/delete of any feedback, and feedback subject/sub-subject management.
- **Homepage Dynamic Feedback Integration:** Replaced static social-proof content with real-time global metrics (Total Users, Total Feedbacks, Average Rating with safe zero-feedback handling) and a horizontal infinite pinned-feedback scroller that shuffles on reload, pauses on hover, supports see-more modal, closes on overlay/X, and resumes smoothly.
- **Global Navigation Enhancements:** Header now includes direct links to **All Users** and **Feedback**, plus globally accessible owner logout action.
- **All Users Self-Priority Behavior:** Logged-in community users now see their own profile card auto-prioritized at the top of `/user` with highlight styling.
- **Sitemap coverage update:** Added static `/feedback` route to `api/sitemap.js` for indexing.

- **Sitemap Slug-First Dynamic URLs:** `/api/sitemap` now emits journal routes using journal slugs (fallback to ID), including slug-based `/journal/view/:slug`, `/journal/view/:slug/comments`, and `/journal/view/:slug/comment/:commentId` entries while preserving `/journal/comment/:commentId` permalinks and 6-hour in-memory cache behavior.
- **Community Search Expansion:** Global search API (`GET /api/journal?action=search`) now indexes community users and comment permalinks in addition to journal posts, enabling `/search` to return user profile and comment results.
- **Frontend-rendered Identity Badges:** Replaced public image-based verification/crown badge rendering (`/verified.svg`, `/crown.svg`) with reusable React vector icons (`IdentityBadges.tsx`). Applied across comment UI, user pages, and dashboard user moderation views.
- **Expanded `/status` Endpoint Matrix:** Status page API endpoint panel now includes the complete website-critical route set and method coverage (auth, journal public actions, users/profile/activity, categories/projects/timeline/links/faqs/live, contact GET+POST, sitemap, upload proxy metadata).
- **Double API Probe on Status Page:** Each endpoint on `/status` is now called **twice** per check cycle — a warm-up call that absorbs Vercel cold-start overhead, followed by the real latency measurement. This ensures the displayed latency reflects an active (warm) serverless instance rather than a cold-boot spike.
- **Comment Abuse Detection (`hasAbuse` + `originalText`):** When a new comment or edited comment contains blacklisted words, the API now stores the **censored text** in `text`, the **original uncensored text** in `originalText`, and sets `hasAbuse: true`. Only stored when abuse is actually detected — clean comments leave `originalText: null`.
- **User Block System:** New `blocked_users` MongoDB collection and admin API actions:
  - `POST /api/journal?action=block` — Block a user with type `all` (all posts), `post` (specific post), or `temp` (time-limited with hours/minutes/days). All blocks are persisted to MongoDB.
  - `DELETE /api/journal?action=block&id=<blockId>` — Remove a specific block.
  - `GET /api/journal?action=blocks` — Paginated list of active blocks (admin only).
  - Block check runs on every comment submission — blocked users receive a descriptive error message.
- **User Profiles Collection:** Every comment submission upserts the commenter's profile (`userId`, `userName`, `userPic`, `firstCommentAt`, `lastCommentAt`, `totalComments`, `lastJournalId`) into a new `users` MongoDB collection. This powers the dashboard Users tab and public profile pages.
- **Dashboard — Comments Sub-tab in Storage:**
  - Summary card showing total comments collection size (docs count + on-disk bytes).
  - Posts list with per-post comment count, flagged abuse count, and approximate text size. Paginated (10 per page).
  - Click a post → per-comment view with: commenter avatar/name, timestamp, censored text, "Tap to see original" reveal for abused comments, **Delete** button, **Block** button.
  - Full pagination on the per-comment view (10 per page).
- **Dashboard — Block User Modal:** Accessible from both the comments sub-tab and the Users tab. Supports block type selection (All Posts / This Post / Temporary), duration pickers (days / hours / minutes for temp blocks), and an optional reason field.
- **Dashboard — Users Tab:** New tab listing all registered commenters (from the `users` collection), sorted by most recent comment. Shows avatar, name, comment count, first/last comment dates. Paginated (10 per page). Click a user to see:
  - Profile card with all metadata.
  - Full comment history with journal links, abuse flags, original text reveal, permalink links, and delete buttons.
  - Quick Block button on the profile card.
  - Link to the public user profile page.
- **Comment Permalink Page (`/journal/comment/:commentId`):** Public shareable link for any comment. Shows:
  - The originating journal post's title/summary with a link to the full post.
  - If the target is a reply: the parent comment is shown above.
  - The highlighted target comment (amber accent border).
  - All direct replies (for top-level comments).
  - CTA button linking back to the full comment section on the journal post.
- **User Profile Page (`/user/:userId`):** Public page showing a commenter's profile:
  - Avatar, display name, total comment count, "first comment" date.
  - Paginated list of all their comments (10 per page), each showing the journal post title as a link, comment text, timestamp, like count, and a permalink link.
- **Clickable Comment Author Names:** In `CommentSection.tsx`, commenter names now link to `/user/:userId`. Owner comments remain non-linked. A small permalink icon (🔗) is added to each comment header linking to `/journal/comment/:commentId`.
- **New API Actions:**
  - `GET ?action=comment-by-id&id=<id>` — Returns a single comment, its journal info, replies (if top-level), and parent comment (if a reply).
  - `GET ?action=journals-comment-stats` — Paginated list of journal posts with per-post comment count, abuse count, and total text size (admin only).
  - `GET ?action=comment-admin-list&journalId=<id>` — Paginated top-level comments for a specific journal, including `originalText` and `hasAbuse` fields (admin only).
  - `GET ?action=user-profile&userId=<id>` — Public user profile with paginated comment history and journal titles.
  - `GET ?action=user-comments&userId=<id>` — Admin-only paginated comment history for a user, enriched with journal info.
  - `GET ?action=users` — Admin-only paginated list of all users from the `users` collection.
  - `GET ?action=blocks` — Admin-only paginated list of all active user blocks.
- **dbstats Extended:** The `?action=dbstats` endpoint now includes `comments`, `blocked_users`, and `users` in the per-collection breakdown.
- **IP & Country Tracking in User Profiles:** The `users` collection now stores `registrationIp`, `registrationCountry`, `lastActivityIp`, and `lastActivityCountry`. These are captured on every comment submission using the request IP resolved through `x-forwarded-for` and geo-looked up via a lightweight country-code mapping. Owner dashboard user detail card displays all four values grouped with their respective timestamps.
- **Dashboard — Enhanced User Detail Card:** The user detail panel in the Dashboard Users tab now shows two clearly labelled sections — **Account Created** (full datetime + registration IP + country) and **Last Activity** (full datetime + last-activity IP + country) — replacing the previous date-only display and loose IP lines.
- **Terms of Service Updated:** Section 3 now explicitly discloses that IP address and country of origin are recorded at the time of account creation and most recent activity for moderation purposes (see `Terms.tsx`).
- **New GitHub Issue Templates:** Added `performance.yml` (performance / SEO issue reports), `user_profile.yml` (user profile / community feature area), and `api_backend.yml` (API / backend issues) to `.github/ISSUE_TEMPLATE/`. Updated `feature_request.yml` with new feature-area options covering all current site features.
- **Owner Comment Avatar (`CommentSection.tsx`):** Owner's past and new comments now always display `myphoto.png` with an amber ring, replacing any stale or missing Google-profile-URL. Applied to both the comment list and the "posting as owner" auth row.
- **AllUsers Owner Card — King-Vibe Upgrade (`AllUsers.tsx`):** Owner card on `/user` upgraded with gradient-border glow frame, pulsing amber blur halo around `myphoto.png`, golden name with glow drop-shadow, radial amber overlay, and 👑 Owner badge.
- **UserProfile Owner Page — Glowing King Style (`UserProfile.tsx`):** `/user/owner` profile card now features the same gradient-border glow frame, glowing photo halo, amber-gold name text, and 👑 Owner badge — visually distinct from regular community profiles.

### Changed
- **Community guide upgraded:** `/journal/comment` now explains both commenting and feedback submission, and includes small preview demos showing how comment cards and feedback cards appear on the website.
- **Owner user moderation controls:** Dashboard Users management now supports password-confirmed temporary deactivation for full account, comments only, profile only, or feedback only — with either manual reactivation or a scheduled end date/time.
- **Password-confirmed destructive user actions:** Owner dashboard can now delete only a user's comments/replies/feedback while keeping the user profile, or permanently delete the user profile and all related comments, replies, feedback, and moderation records.
- **Public visibility respects moderation:** Public comments, feedback, contributor list, search results, user profiles, comment counts, and comment permalinks now hide content/profile visibility based on active user moderation scopes.
- **Feedback blacklist linkage & conditional censoring:** Feedback creation and owner feedback edits now reuse the same `comment_blacklist` source as the journal comment system, and feedback text is censored only when a blacklist match is actually detected.
- **Feedback abuse audit fields (`hasAbuse` + `originalText`):** Feedback documents now persist the original uncensored text only when blacklist abuse is detected, while clean feedback keeps `originalText: null`.
- **Owner dashboard feedback moderation visibility:** Feedback moderation cards now show the original user-written text for censored feedback entries, and edit opens using the uncensored source text when available.
- **Mobile menu usability refinements:** Mobile overlay navigation now uses tighter sizing, larger tap targets, and a scroll-safe layout so all items remain visible/watchable and easily clickable on small screens.
- **Comments API Slug Support:** `GET /api/journal?action=comments` and `POST /api/journal?action=comment` now accept journal ID or journal slug, fixing invalid-id errors when pages are opened with slug/title-based journal URLs.
- **Status Endpoint Layout Fix:** `/status` endpoint cards now wrap long endpoint paths safely (`break-all`, wrapped metrics, overflow protection) to prevent small-screen width/zoom-out issues.
- Dashboard Settings tab now shows updated serverless function count text (`12 files`, including 11 route handlers + shared logger helper).
- Comment creation and edit now use `censorTextWithFlag()` (returns `{ text, hasAbuse }`) instead of `censorText()`.
- Comment creation adds a non-critical upsert to the `users` collection after every successful comment insert.

---

## [3.4.0] — 2026-05-04

### Added
- **Rate-Limited Manual Refresh (`POST /api/journal?action=refresh`):** The "Refresh Now" button on `/status` now calls a dedicated server-side endpoint that enforces two independent rate limits: **global 20 refreshes/min** (across all IPs) and **per-IP 2 refreshes/min**. Limits are tracked in a new `refresh_rate_limits` MongoDB collection with a 60-second sliding window and automatic cleanup of records older than 2 minutes.
- **Health Snapshot Persistence:** Every allowed manual refresh writes a full server health snapshot to a new `health_snapshots` MongoDB collection, including all OS metrics, CPU, memory, disk, DB ping, and the caller's IP address with an IST timestamp.
- **Extended Health API Fields:** Both `GET ?action=health` and `POST ?action=refresh` now return `osType` (`os.type()`), `osRelease` (`os.release()`), `hostname` (`os.hostname()`), `serverRegion` (from `VERCEL_REGION` / `AWS_REGION` / `FLY_REGION` environment variables), and `diskInfo` (`{ total, free, available }` from `fs.statfsSync('/tmp')`, `null` on unsupported runtimes).
- **System Specifications Card:** A new amber-highlighted card at the top of the Server Health section on `/status` lists all key server specs: **RAM** (total & free), **Storage** (/tmp disk), **Processor** (full CPU model string), **CPU Cores**, **CPU Speed**, **Operating System**, **OS Kernel**, **Architecture**, **Runtime** (Node.js version), **Server Region**, and **Hostname**.
- **Refresh Button UX:** The "Refresh Now" button shows a spinning icon while the request is in flight, is disabled to prevent double-submission, and displays the 429 rate-limit error message inline below the button.

### Changed
- `ServerHealth` TypeScript interface extended with `osType`, `osRelease`, `hostname`, `serverRegion`, `diskInfo`, and optional rate-limit counter fields.
- `handleManualRefresh` in `Status.tsx` refactored to `async`, now calls `POST action=refresh` and updates health state from the response rather than re-running `GET action=health` separately.
- System Details card on `/status` extended with OS Type, OS Release, and Region rows.

---

## [3.3.0] — 2026-05-01

### Added
- **Dynamic Projects Dashboard:** Added a fully functional "Projects" tab in the admin dashboard to manage portfolio projects directly via MongoDB. Includes a live split-screen visual and JSON preview.
- **3-Layer Auto-Screenshot Architecture:** Engineered a highly resilient serverless screenshot generator to bypass Vercel timeouts and Cloudflare bot-protections:
  - **Layer 1:** Google PageSpeed Insights API (official Google servers for 0% CAPTCHA block and high compression).
  - **Layer 2:** Site-Shot API with Global Geolocation Proxies (Brazil/Tokyo) to bypass regional blocks.
  - **Layer 3:** Thum.io API with massive rotating human-like headers as a fail-safe raw image fallback.
- **Default vs Custom Ecosystem Mode:** Added a global toggle to seamlessly switch between static file-based projects (`projectsData.ts`) and dynamic MongoDB-driven projects.
- **Smart Client-Side Image Formatting:** Added CSS-based `object-fit` handling on the frontend to automatically stretch or crop heavily portrait screenshots into perfect 16:10 landscape preview cards.

### Changed
- Transitioned serverless architecture to Node.js 22 (`engines` field updated in `package.json`).
- Optimized Vercel deployment by shifting from heavy local headless browsers to lightweight Cloud APIs, eliminating 502 memory crashes.

### Removed
- Removed `@sparticuz/chromium` to reduce build size and prevent Vercel 10-second timeout limits.

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

[Unreleased]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.4.0...HEAD
[3.4.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.1.5...v3.2.0
[3.1.5]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.1.0...v3.1.5
[3.1.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/releases/tag/v1.0.0
