# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/deepdeyiitgn/My-Portfolio/releases/tag/v1.0.0
