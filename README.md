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
- Home page section flow is ordered as: Hero → Journey Marquee → Tech Galaxy → Projects → Timeline → Top Reads → Feedback → Community → Countdown → Collaboration CTA → System Status & Owner Access.
- Full self-setup documentation is available in **[`PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md`](./PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md)**.

---

## 🖱️ Cursor SVG Exports

All cursor SVG assets are now exported in the public folder:

- `public/cursors/visual/` → custom floating cursor variants used by the pointer renderer
- `public/cursors/system/` → SVGs used in CSS system cursor mode by interaction type
- `public/cursors/manifest.json` → export index

### Custom Cursor Variants (`public/cursors/visual`)

| SVG | Preview | Purpose |
| :-- | :--: | :-- |
| `comet.svg` | <img src="public/cursors/visual/comet.svg" width="26" /> | Default pointer style with amber comet gradient |
| `neon-needle.svg` | <img src="public/cursors/visual/neon-needle.svg" width="26" /> | Default precision-style pointer |
| `prism-arrow.svg` | <img src="public/cursors/visual/prism-arrow.svg" width="26" /> | Default prism/glass pointer |
| `orbit.svg` | <img src="public/cursors/visual/orbit.svg" width="26" /> | Default pointer with orbit ring accent |
| `pulse-core.svg` | <img src="public/cursors/visual/pulse-core.svg" width="26" /> | Default pointer with core glow |
| `aurora-dart.svg` | <img src="public/cursors/visual/aurora-dart.svg" width="26" /> | Default pointer with aurora cyan highlight |
| `glass-arrow.svg` | <img src="public/cursors/visual/glass-arrow.svg" width="26" /> | Default semi-glass arrow style |
| `vector-wing.svg` | <img src="public/cursors/visual/vector-wing.svg" width="26" /> | Action/hover state pointer |
| `quantum-tip.svg` | <img src="public/cursors/visual/quantum-tip.svg" width="26" /> | Action state dark-tech pointer |
| `flare-triangle.svg` | <img src="public/cursors/visual/flare-triangle.svg" width="26" /> | Action state with flare accent |
| `spark-lance.svg` | <img src="public/cursors/visual/spark-lance.svg" width="26" /> | Action state with spark burst |
| `scribe.svg` | <img src="public/cursors/visual/scribe.svg" width="26" /> | Text/input editing state |
| `input-beam.svg` | <img src="public/cursors/visual/input-beam.svg" width="26" /> | Text/input I-beam style |
| `ink-beam.svg` | <img src="public/cursors/visual/ink-beam.svg" width="26" /> | Text/input beam with accent node |
| `selection-ring.svg` | <img src="public/cursors/visual/selection-ring.svg" width="26" /> | Selection state ring cursor |
| `anchor-grid.svg` | <img src="public/cursors/visual/anchor-grid.svg" width="26" /> | Selection/drag anchor marker |
| `click-burst.svg` | <img src="public/cursors/visual/click-burst.svg" width="26" /> | Click feedback state |
| `nova-click.svg` | <img src="public/cursors/visual/nova-click.svg" width="26" /> | Click state with pulse orb |
| `drag-node.svg` | <img src="public/cursors/visual/drag-node.svg" width="26" /> | Drag movement indicator |
| `magnet-drag.svg` | <img src="public/cursors/visual/magnet-drag.svg" width="26" /> | Drag state with magnet cross lines |

### System Cursor SVGs (`public/cursors/system`)

| SVG | Preview | Used for |
| :-- | :--: | :-- |
| `default.svg` | <img src="public/cursors/system/default.svg" width="26" /> | Normal resting pointer |
| `action.svg` | <img src="public/cursors/system/action.svg" width="26" /> | Hovering interactive elements |
| `text.svg` | <img src="public/cursors/system/text.svg" width="26" /> | Text caret areas |
| `input.svg` | <img src="public/cursors/system/input.svg" width="26" /> | Input-focused form fields |
| `select.svg` | <img src="public/cursors/system/select.svg" width="26" /> | Active text selection |
| `click.svg` | <img src="public/cursors/system/click.svg" width="26" /> | Mouse down / click state |
| `drag.svg` | <img src="public/cursors/system/drag.svg" width="26" /> | Dragging interactions |

## 🧩 Project SVG Export Folder

All project SVGs are now also exported under `public/project-svg/`.

- `public/project-svg/brand/` → core brand SVG icons used around the app
- `public/project-svg/cursors/` → mirrored cursor SVG exports
- `public/project-svg/manifest.json` → export index

### Brand SVGs (`public/project-svg/brand`)

| SVG | Preview | Purpose |
| :-- | :--: | :-- |
| `quicklink-logo.svg` | <img src="public/project-svg/brand/quicklink-logo.svg" width="26" /> | QuickLink branding mark |
| `crown.svg` | <img src="public/project-svg/brand/crown.svg" width="26" /> | Owner/crown identity icon |
| `verified.svg` | <img src="public/project-svg/brand/verified.svg" width="26" /> | Verified badge icon |

---

## 📚 Complete SVG Inventory (All Files)

This is the full list of all tracked project SVG files (**60 files**).

| File Path | Preview | What work it does | How to use |
| :-- | :--: | :-- | :-- |
| `public/crown.svg` | <img src="public/crown.svg" width="24" /> | Primary crown icon used for owner/identity branding. | `<img src="/crown.svg" alt="..." />` |
| `public/cursors/system/action.svg` | <img src="public/cursors/system/action.svg" width="24" /> | System-cursor SVG for `action` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/action.svg" alt="..." />` |
| `public/cursors/system/click.svg` | <img src="public/cursors/system/click.svg" width="24" /> | System-cursor SVG for `click` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/click.svg" alt="..." />` |
| `public/cursors/system/default.svg` | <img src="public/cursors/system/default.svg" width="24" /> | System-cursor SVG for `default` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/default.svg" alt="..." />` |
| `public/cursors/system/drag.svg` | <img src="public/cursors/system/drag.svg" width="24" /> | System-cursor SVG for `drag` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/drag.svg" alt="..." />` |
| `public/cursors/system/input.svg` | <img src="public/cursors/system/input.svg" width="24" /> | System-cursor SVG for `input` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/input.svg" alt="..." />` |
| `public/cursors/system/select.svg` | <img src="public/cursors/system/select.svg" width="24" /> | System-cursor SVG for `select` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/select.svg" alt="..." />` |
| `public/cursors/system/text.svg` | <img src="public/cursors/system/text.svg" width="24" /> | System-cursor SVG for `text` interaction mode in CSS cursor mapping. | `<img src="/cursors/system/text.svg" alt="..." />` |
| `public/cursors/visual/anchor-grid.svg` | <img src="public/cursors/visual/anchor-grid.svg" width="24" /> | Custom floating pointer variant (`anchor-grid`) used by the runtime pointer renderer. | `<img src="/cursors/visual/anchor-grid.svg" alt="..." />` |
| `public/cursors/visual/aurora-dart.svg` | <img src="public/cursors/visual/aurora-dart.svg" width="24" /> | Custom floating pointer variant (`aurora-dart`) used by the runtime pointer renderer. | `<img src="/cursors/visual/aurora-dart.svg" alt="..." />` |
| `public/cursors/visual/click-burst.svg` | <img src="public/cursors/visual/click-burst.svg" width="24" /> | Custom floating pointer variant (`click-burst`) used by the runtime pointer renderer. | `<img src="/cursors/visual/click-burst.svg" alt="..." />` |
| `public/cursors/visual/comet.svg` | <img src="public/cursors/visual/comet.svg" width="24" /> | Custom floating pointer variant (`comet`) used by the runtime pointer renderer. | `<img src="/cursors/visual/comet.svg" alt="..." />` |
| `public/cursors/visual/drag-node.svg` | <img src="public/cursors/visual/drag-node.svg" width="24" /> | Custom floating pointer variant (`drag-node`) used by the runtime pointer renderer. | `<img src="/cursors/visual/drag-node.svg" alt="..." />` |
| `public/cursors/visual/flare-triangle.svg` | <img src="public/cursors/visual/flare-triangle.svg" width="24" /> | Custom floating pointer variant (`flare-triangle`) used by the runtime pointer renderer. | `<img src="/cursors/visual/flare-triangle.svg" alt="..." />` |
| `public/cursors/visual/glass-arrow.svg` | <img src="public/cursors/visual/glass-arrow.svg" width="24" /> | Custom floating pointer variant (`glass-arrow`) used by the runtime pointer renderer. | `<img src="/cursors/visual/glass-arrow.svg" alt="..." />` |
| `public/cursors/visual/ink-beam.svg` | <img src="public/cursors/visual/ink-beam.svg" width="24" /> | Custom floating pointer variant (`ink-beam`) used by the runtime pointer renderer. | `<img src="/cursors/visual/ink-beam.svg" alt="..." />` |
| `public/cursors/visual/input-beam.svg` | <img src="public/cursors/visual/input-beam.svg" width="24" /> | Custom floating pointer variant (`input-beam`) used by the runtime pointer renderer. | `<img src="/cursors/visual/input-beam.svg" alt="..." />` |
| `public/cursors/visual/magnet-drag.svg` | <img src="public/cursors/visual/magnet-drag.svg" width="24" /> | Custom floating pointer variant (`magnet-drag`) used by the runtime pointer renderer. | `<img src="/cursors/visual/magnet-drag.svg" alt="..." />` |
| `public/cursors/visual/neon-needle.svg` | <img src="public/cursors/visual/neon-needle.svg" width="24" /> | Custom floating pointer variant (`neon-needle`) used by the runtime pointer renderer. | `<img src="/cursors/visual/neon-needle.svg" alt="..." />` |
| `public/cursors/visual/nova-click.svg` | <img src="public/cursors/visual/nova-click.svg" width="24" /> | Custom floating pointer variant (`nova-click`) used by the runtime pointer renderer. | `<img src="/cursors/visual/nova-click.svg" alt="..." />` |
| `public/cursors/visual/orbit.svg` | <img src="public/cursors/visual/orbit.svg" width="24" /> | Custom floating pointer variant (`orbit`) used by the runtime pointer renderer. | `<img src="/cursors/visual/orbit.svg" alt="..." />` |
| `public/cursors/visual/prism-arrow.svg` | <img src="public/cursors/visual/prism-arrow.svg" width="24" /> | Custom floating pointer variant (`prism-arrow`) used by the runtime pointer renderer. | `<img src="/cursors/visual/prism-arrow.svg" alt="..." />` |
| `public/cursors/visual/pulse-core.svg` | <img src="public/cursors/visual/pulse-core.svg" width="24" /> | Custom floating pointer variant (`pulse-core`) used by the runtime pointer renderer. | `<img src="/cursors/visual/pulse-core.svg" alt="..." />` |
| `public/cursors/visual/quantum-tip.svg` | <img src="public/cursors/visual/quantum-tip.svg" width="24" /> | Custom floating pointer variant (`quantum-tip`) used by the runtime pointer renderer. | `<img src="/cursors/visual/quantum-tip.svg" alt="..." />` |
| `public/cursors/visual/scribe.svg` | <img src="public/cursors/visual/scribe.svg" width="24" /> | Custom floating pointer variant (`scribe`) used by the runtime pointer renderer. | `<img src="/cursors/visual/scribe.svg" alt="..." />` |
| `public/cursors/visual/selection-ring.svg` | <img src="public/cursors/visual/selection-ring.svg" width="24" /> | Custom floating pointer variant (`selection-ring`) used by the runtime pointer renderer. | `<img src="/cursors/visual/selection-ring.svg" alt="..." />` |
| `public/cursors/visual/spark-lance.svg` | <img src="public/cursors/visual/spark-lance.svg" width="24" /> | Custom floating pointer variant (`spark-lance`) used by the runtime pointer renderer. | `<img src="/cursors/visual/spark-lance.svg" alt="..." />` |
| `public/cursors/visual/vector-wing.svg` | <img src="public/cursors/visual/vector-wing.svg" width="24" /> | Custom floating pointer variant (`vector-wing`) used by the runtime pointer renderer. | `<img src="/cursors/visual/vector-wing.svg" alt="..." />` |
| `public/project-svg/brand/crown.svg` | <img src="public/project-svg/brand/crown.svg" width="24" /> | Mirrored export copy of the crown brand icon. | `<img src="/project-svg/brand/crown.svg" alt="..." />` |
| `public/project-svg/brand/quicklink-logo.svg` | <img src="public/project-svg/brand/quicklink-logo.svg" width="24" /> | Mirrored export copy of the QuickLink brand logo. | `<img src="/project-svg/brand/quicklink-logo.svg" alt="..." />` |
| `public/project-svg/brand/verified.svg` | <img src="public/project-svg/brand/verified.svg" width="24" /> | Mirrored export copy of the verified badge icon. | `<img src="/project-svg/brand/verified.svg" alt="..." />` |
| `public/project-svg/cursors/system/action.svg` | <img src="public/project-svg/cursors/system/action.svg" width="24" /> | Mirrored export of system cursor `action` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/action.svg" alt="..." />` |
| `public/project-svg/cursors/system/click.svg` | <img src="public/project-svg/cursors/system/click.svg" width="24" /> | Mirrored export of system cursor `click` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/click.svg" alt="..." />` |
| `public/project-svg/cursors/system/default.svg` | <img src="public/project-svg/cursors/system/default.svg" width="24" /> | Mirrored export of system cursor `default` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/default.svg" alt="..." />` |
| `public/project-svg/cursors/system/drag.svg` | <img src="public/project-svg/cursors/system/drag.svg" width="24" /> | Mirrored export of system cursor `drag` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/drag.svg" alt="..." />` |
| `public/project-svg/cursors/system/input.svg` | <img src="public/project-svg/cursors/system/input.svg" width="24" /> | Mirrored export of system cursor `input` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/input.svg" alt="..." />` |
| `public/project-svg/cursors/system/select.svg` | <img src="public/project-svg/cursors/system/select.svg" width="24" /> | Mirrored export of system cursor `select` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/select.svg" alt="..." />` |
| `public/project-svg/cursors/system/text.svg` | <img src="public/project-svg/cursors/system/text.svg" width="24" /> | Mirrored export of system cursor `text` for centralized project SVG listing. | `<img src="/project-svg/cursors/system/text.svg" alt="..." />` |
| `public/project-svg/cursors/visual/anchor-grid.svg` | <img src="public/project-svg/cursors/visual/anchor-grid.svg" width="24" /> | Mirrored export of visual cursor `anchor-grid` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/anchor-grid.svg" alt="..." />` |
| `public/project-svg/cursors/visual/aurora-dart.svg` | <img src="public/project-svg/cursors/visual/aurora-dart.svg" width="24" /> | Mirrored export of visual cursor `aurora-dart` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/aurora-dart.svg" alt="..." />` |
| `public/project-svg/cursors/visual/click-burst.svg` | <img src="public/project-svg/cursors/visual/click-burst.svg" width="24" /> | Mirrored export of visual cursor `click-burst` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/click-burst.svg" alt="..." />` |
| `public/project-svg/cursors/visual/comet.svg` | <img src="public/project-svg/cursors/visual/comet.svg" width="24" /> | Mirrored export of visual cursor `comet` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/comet.svg" alt="..." />` |
| `public/project-svg/cursors/visual/drag-node.svg` | <img src="public/project-svg/cursors/visual/drag-node.svg" width="24" /> | Mirrored export of visual cursor `drag-node` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/drag-node.svg" alt="..." />` |
| `public/project-svg/cursors/visual/flare-triangle.svg` | <img src="public/project-svg/cursors/visual/flare-triangle.svg" width="24" /> | Mirrored export of visual cursor `flare-triangle` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/flare-triangle.svg" alt="..." />` |
| `public/project-svg/cursors/visual/glass-arrow.svg` | <img src="public/project-svg/cursors/visual/glass-arrow.svg" width="24" /> | Mirrored export of visual cursor `glass-arrow` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/glass-arrow.svg" alt="..." />` |
| `public/project-svg/cursors/visual/ink-beam.svg` | <img src="public/project-svg/cursors/visual/ink-beam.svg" width="24" /> | Mirrored export of visual cursor `ink-beam` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/ink-beam.svg" alt="..." />` |
| `public/project-svg/cursors/visual/input-beam.svg` | <img src="public/project-svg/cursors/visual/input-beam.svg" width="24" /> | Mirrored export of visual cursor `input-beam` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/input-beam.svg" alt="..." />` |
| `public/project-svg/cursors/visual/magnet-drag.svg` | <img src="public/project-svg/cursors/visual/magnet-drag.svg" width="24" /> | Mirrored export of visual cursor `magnet-drag` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/magnet-drag.svg" alt="..." />` |
| `public/project-svg/cursors/visual/neon-needle.svg` | <img src="public/project-svg/cursors/visual/neon-needle.svg" width="24" /> | Mirrored export of visual cursor `neon-needle` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/neon-needle.svg" alt="..." />` |
| `public/project-svg/cursors/visual/nova-click.svg` | <img src="public/project-svg/cursors/visual/nova-click.svg" width="24" /> | Mirrored export of visual cursor `nova-click` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/nova-click.svg" alt="..." />` |
| `public/project-svg/cursors/visual/orbit.svg` | <img src="public/project-svg/cursors/visual/orbit.svg" width="24" /> | Mirrored export of visual cursor `orbit` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/orbit.svg" alt="..." />` |
| `public/project-svg/cursors/visual/prism-arrow.svg` | <img src="public/project-svg/cursors/visual/prism-arrow.svg" width="24" /> | Mirrored export of visual cursor `prism-arrow` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/prism-arrow.svg" alt="..." />` |
| `public/project-svg/cursors/visual/pulse-core.svg` | <img src="public/project-svg/cursors/visual/pulse-core.svg" width="24" /> | Mirrored export of visual cursor `pulse-core` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/pulse-core.svg" alt="..." />` |
| `public/project-svg/cursors/visual/quantum-tip.svg` | <img src="public/project-svg/cursors/visual/quantum-tip.svg" width="24" /> | Mirrored export of visual cursor `quantum-tip` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/quantum-tip.svg" alt="..." />` |
| `public/project-svg/cursors/visual/scribe.svg` | <img src="public/project-svg/cursors/visual/scribe.svg" width="24" /> | Mirrored export of visual cursor `scribe` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/scribe.svg" alt="..." />` |
| `public/project-svg/cursors/visual/selection-ring.svg` | <img src="public/project-svg/cursors/visual/selection-ring.svg" width="24" /> | Mirrored export of visual cursor `selection-ring` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/selection-ring.svg" alt="..." />` |
| `public/project-svg/cursors/visual/spark-lance.svg` | <img src="public/project-svg/cursors/visual/spark-lance.svg" width="24" /> | Mirrored export of visual cursor `spark-lance` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/spark-lance.svg" alt="..." />` |
| `public/project-svg/cursors/visual/vector-wing.svg` | <img src="public/project-svg/cursors/visual/vector-wing.svg" width="24" /> | Mirrored export of visual cursor `vector-wing` for centralized project SVG listing. | `<img src="/project-svg/cursors/visual/vector-wing.svg" alt="..." />` |
| `public/quicklink-logo.svg` | <img src="public/quicklink-logo.svg" width="24" /> | Primary QuickLink brand logo used in public branding contexts. | `<img src="/quicklink-logo.svg" alt="..." />` |
| `public/verified.svg` | <img src="public/verified.svg" width="24" /> | Primary verified badge icon used for verification visuals. | `<img src="/verified.svg" alt="..." />` |


## 🎯 Feature Highlights

### 🔭 Global Command Palette Search
Full-stack search engine at `/search` with typewriter-animated suggestions, trending query tracking, localStorage history, and a TF-IDF ML fallback. Searches journals, projects, FAQs, social links, live status, plus community users and comment permalinks. Fully indexed in the sitemap.

### 🧩 Dynamic Feature Atlas
Route family `/feature` provides a feature atlas index plus 30+ individually coded TSX feature pages. The index card list is loaded from `src/features/feature-links.json` (title/summary/link), with long summaries truncated using `.......`. Each feature page is a custom file in `src/features/pages/`, includes diagrams (SVG), points, workflow, visualization blocks, animation transitions, route-specific SEO metadata, and explicit back-to-feature actions.

### 📡 Real-Time System Status Monitor
Live status page at `/status` probes all website-critical API routes every 60 s (heavy endpoints every 5 min) and displays latency, HTTP status, and connection quality. Monitored endpoints include auth, journal listing/search/top feeds, user profile/activity/community APIs, categories, projects, timeline, links, FAQs, YouTube live feed, contact (GET + POST), sitemap, and upload proxy route metadata. To reduce serverless cold-start distortion, automatic probes/ping use a warm-up call followed by a measured second call. Includes a **Server Health** panel with a highlighted **System Specifications** card showing RAM, storage, CPU model/cores/speed, OS type and kernel, architecture, runtime version, server region, and hostname. The third-party section now renders each provider separately with latest incident/maintenance summaries, status-page deep links, dynamic provider messages, resolved endpoint IP, hosting inference, and an "our infra match" marker when hosting aligns with the current server runtime. The **Third-Party Status Aggregator** endpoint row now measures ping from home-server health so external provider outages do not degrade the main overall system banner. A rate-limited **"Refresh Now"** button (global 20/min · per-IP 2/min) triggers a full health snapshot stored in MongoDB for historical tracking. Owner dashboard also controls status-page runtime mode (`live`, `stop`, `maintenance`, `hiatus`) from the existing `/api/journal` backend flow.

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

Journal tags and hashtags now support automatic generation from title, summary, and content when missing. Owner Dashboard includes an **Auto Fill Missing** control for tags/hashtags, while still allowing manual edits. Tag and hashtag values are normalized to uppercase by default for consistent indexing and routing. Auto-generation scoring now prioritizes repeated terms, longer/unique tokens, and deterministic cryptographic tie-breaking, with additional boosts for curated internet-popular terms and project/system terms (no third-party API key required).
Tag/hashtag result pages now also expose public summary stats (total likes, views, average read time), plus the first created and latest post for the selected token.

### 📺 YouTube Live Hub
Auto-loads the current live stream. Sidebar shows all channel content filtered by **All / Stream / Video / Shorts** tabs with newest-first sorting, views count, and Prev/Next pagination (20 per page).

### 🖼️ CDN Image Upload & Media CMS (Dashboard)
Owner-only dashboard uploads images to `static.qlynk.me` via `/api/upload-image` proxy. Supports file picker, drag-and-drop, clipboard paste, and URL links. Rich text editor includes one-click embed buttons for **Images**, **YouTube/MP4 Videos**, and **Audio** — no manual HTML required.

### 🌐 Data-Driven Link-in-Bio Engine
A JSON-driven hub mapping 30+ internal/external nodes with dynamic inline SVG icons that auto-adapt to the Dark-Amber theme.

### ⏱️ Self-Aware Timeline
The milestone timeline uses `new Date().getFullYear()` to auto-highlight the current active phase with a glowing amber radar pulse (extends to 2035).

### 🔍 Max-Level SEO
`react-helmet-async` drives per-route metadata injection: Canonical URLs, full OpenGraph tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:site_name`, `og:locale`), complete Twitter Card tags (`twitter:card`, `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`), and `Schema.org` JSON-LD (Person, FAQPage, SoftwareApplication). The static `index.html` entry point carries the same complete tag set as the global baseline so crawlers and unfurlers always find valid metadata even before the SPA hydrates. A server-rendered HTML shell also injects the correct title/description/image for shared links, so WhatsApp, Twitter/X, Discord, and other unfurlers can read page-specific metadata. Journal posts automatically use a random uploaded post image for share cards, with `/assets/images/myphoto.png` as the fallback when a post has no uploaded images. All routes including `/search`, `/user`, `/feedback`, and `/journal/comment` are included in the XML sitemap.

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

Sitemap now also auto-includes dynamic journal tag and hashtag listing URLs (`/journal/tags/:tag`, `/journal/hastags/:hashtag`) at priority `0.4`.

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
| `/feature/<feature-slug>` | Individually routed custom TSX feature page |
| `/portfolio` | 3D PDF architectural blueprint viewer |
| `/proof` | Proof of work and achievements |
| `/links` | Link-in-bio ecosystem hub (30+ nodes) |
| `/contact` | Smart 15-category contact routing form |
| `/journal` | Journal listing with metadata (likes, views, read time) |
| `/journal/view/:id` | Full journal article with engagement actions |
| `/journal/tags/:tag` | Journal listing filtered by tag with total post count, first created post, latest post, and public stats |
| `/journal/hastags/:hashtag` | Journal listing filtered by hashtag with total post count, first created post, latest post, and public stats |
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


NEW:

====================================================================================================
GITHUB REPOSITORY STRUCTURE REPORT
====================================================================================================
Repository  : deepdeyiitgn/My-Portfolio
Branch      : main
Root Folder : My-Portfolio/
Total Items : 306
====================================================================================================

📂 ROOT : My-Portfolio/

📁 Folder : .github/
   Path   : .github/
   Files  : 6
   ├── 📄 CODEOWNERS
   │     Type : No Extension
   │     Size : 824 bytes
   │     Path : .github/CODEOWNERS
   ├── 📄 FUNDING.yml
   │     Type : yml
   │     Size : 172 bytes
   │     Path : .github/FUNDING.yml
   ├── 📄 ISSUE_TEMPLATE
   │     Type : No Extension
   │     Size : - bytes
   │     Path : .github/ISSUE_TEMPLATE
   ├── 📄 dependabot.yml
   │     Type : yml
   │     Size : 1131 bytes
   │     Path : .github/dependabot.yml
   ├── 📄 pull_request_template.md
   │     Type : md
   │     Size : 1905 bytes
   │     Path : .github/pull_request_template.md
   ├── 📄 workflows
   │     Type : No Extension
   │     Size : - bytes
   │     Path : .github/workflows

│   📁 Folder : ISSUE_TEMPLATE/
│      Path   : .github/ISSUE_TEMPLATE/
│      Files  : 8
│      ├── 📄 api_backend.yml
│      │     Type : yml
│      │     Size : 2964 bytes
│      │     Path : .github/ISSUE_TEMPLATE/api_backend.yml
│      ├── 📄 bug_report.yml
│      │     Type : yml
│      │     Size : 3223 bytes
│      │     Path : .github/ISSUE_TEMPLATE/bug_report.yml
│      ├── 📄 config.yml
│      │     Type : yml
│      │     Size : 819 bytes
│      │     Path : .github/ISSUE_TEMPLATE/config.yml
│      ├── 📄 documentation.yml
│      │     Type : yml
│      │     Size : 1585 bytes
│      │     Path : .github/ISSUE_TEMPLATE/documentation.yml
│      ├── 📄 feature_request.yml
│      │     Type : yml
│      │     Size : 3057 bytes
│      │     Path : .github/ISSUE_TEMPLATE/feature_request.yml
│      ├── 📄 performance.yml
│      │     Type : yml
│      │     Size : 2844 bytes
│      │     Path : .github/ISSUE_TEMPLATE/performance.yml
│      ├── 📄 question.yml
│      │     Type : yml
│      │     Size : 1649 bytes
│      │     Path : .github/ISSUE_TEMPLATE/question.yml
│      ├── 📄 user_profile.yml
│      │     Type : yml
│      │     Size : 3084 bytes
│      │     Path : .github/ISSUE_TEMPLATE/user_profile.yml

│   📁 Folder : workflows/
│      Path   : .github/workflows/
│      Files  : 2
│      ├── 📄 ci.yml
│      │     Type : yml
│      │     Size : 671 bytes
│      │     Path : .github/workflows/ci.yml
│      ├── 📄 keep-alive.yml
│      │     Type : yml
│      │     Size : 1464 bytes
│      │     Path : .github/workflows/keep-alive.yml
📁 Folder : api/
   Path   : api/
   Files  : 13
   ├── 📄 auth.js
   │     Type : js
   │     Size : 7379 bytes
   │     Path : api/auth.js
   ├── 📄 categories.js
   │     Type : js
   │     Size : 14567 bytes
   │     Path : api/categories.js
   ├── 📄 contact.js
   │     Type : js
   │     Size : 2965 bytes
   │     Path : api/contact.js
   ├── 📄 faqs.js
   │     Type : js
   │     Size : 62394 bytes
   │     Path : api/faqs.js
   ├── 📄 journal.js
   │     Type : js
   │     Size : 175620 bytes
   │     Path : api/journal.js
   ├── 📄 links.js
   │     Type : js
   │     Size : 26263 bytes
   │     Path : api/links.js
   ├── 📄 live.js
   │     Type : js
   │     Size : 20086 bytes
   │     Path : api/live.js
   ├── 📄 logger.js
   │     Type : js
   │     Size : 136 bytes
   │     Path : api/logger.js
   ├── 📄 package.json
   │     Type : json
   │     Size : 25 bytes
   │     Path : api/package.json
   ├── 📄 projects.js
   │     Type : js
   │     Size : 34771 bytes
   │     Path : api/projects.js
   ├── 📄 sitemap.js
   │     Type : js
   │     Size : 18482 bytes
   │     Path : api/sitemap.js
   ├── 📄 timeline.js
   │     Type : js
   │     Size : 7834 bytes
   │     Path : api/timeline.js
   ├── 📄 upload-image.js
   │     Type : js
   │     Size : 9141 bytes
   │     Path : api/upload-image.js
📁 Folder : dist/
   Path   : dist/
   Files  : 8
   ├── 📄 69eb00ccd24c4d75c62cc04c.png
   │     Type : png
   │     Size : 488356 bytes
   │     Path : dist/69eb00ccd24c4d75c62cc04c.png
   ├── 📄 69eb01798f30a15224010404.png
   │     Type : png
   │     Size : 1460162 bytes
   │     Path : dist/69eb01798f30a15224010404.png
   ├── 📄 69eb01deef048160b7374d68.png
   │     Type : png
   │     Size : 71558 bytes
   │     Path : dist/69eb01deef048160b7374d68.png
   ├── 📄 69eb02bff3d3b01f6326a557.jpg
   │     Type : jpg
   │     Size : 71370 bytes
   │     Path : dist/69eb02bff3d3b01f6326a557.jpg
   ├── 📄 assets
   │     Type : No Extension
   │     Size : - bytes
   │     Path : dist/assets
   ├── 📄 index.html
   │     Type : html
   │     Size : 6906 bytes
   │     Path : dist/index.html
   ├── 📄 robots.txt
   │     Type : txt
   │     Size : 691 bytes
   │     Path : dist/robots.txt
   ├── 📄 sitemap.xml.txt
   │     Type : txt
   │     Size : 4403 bytes
   │     Path : dist/sitemap.xml.txt

│   📁 Folder : assets/
│      Path   : dist/assets/
│      Files  : 4
│      ├── 📄 Portfolio-QCQEGvBO.css
│      │     Type : css
│      │     Size : 9222 bytes
│      │     Path : dist/assets/Portfolio-QCQEGvBO.css
│      ├── 📄 docs
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : dist/assets/docs
│      ├── 📄 images
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : dist/assets/images
│      ├── 📄 pdf.worker.min-qwK7q_zL.mjs
│      │     Type : mjs
│      │     Size : 1046214 bytes
│      │     Path : dist/assets/pdf.worker.min-qwK7q_zL.mjs

│   │   📁 Folder : docs/
│   │      Path   : dist/assets/docs/
│   │      Files  : 1
│   │      ├── 📄 Deep_Dey_Portfolio.pdf
│   │      │     Type : pdf
│   │      │     Size : 1943075 bytes
│   │      │     Path : dist/assets/docs/Deep_Dey_Portfolio.pdf

│   │   📁 Folder : images/
│   │      Path   : dist/assets/images/
│   │      Files  : 1
│   │      ├── 📄 myphoto.png
│   │      │     Type : png
│   │      │     Size : 121296 bytes
│   │      │     Path : dist/assets/images/myphoto.png
📁 Folder : public/
   Path   : public/
   Files  : 56
   ├── 📄 .well-known
   │     Type : well-known
   │     Size : - bytes
   │     Path : public/.well-known
   ├── 📄 69eb00ccd24c4d75c62cc04c.png
   │     Type : png
   │     Size : 488356 bytes
   │     Path : public/69eb00ccd24c4d75c62cc04c.png
   ├── 📄 69eb01798f30a15224010404.png
   │     Type : png
   │     Size : 1460162 bytes
   │     Path : public/69eb01798f30a15224010404.png
   ├── 📄 69eb01deef048160b7374d68.png
   │     Type : png
   │     Size : 71558 bytes
   │     Path : public/69eb01deef048160b7374d68.png
   ├── 📄 69eb02bff3d3b01626326a557.jpg
   │     Type : jpg
   │     Size : 41744 bytes
   │     Path : public/69eb02bff3d3b01626326a557.jpg
   ├── 📄 69eb02bff3d3b01f6326a557.jpg
   │     Type : jpg
   │     Size : 71370 bytes
   │     Path : public/69eb02bff3d3b01f6326a557.jpg
   ├── 📄 accessibility-improvement-log.html
   │     Type : html
   │     Size : 789 bytes
   │     Path : public/accessibility-improvement-log.html
   ├── 📄 ads.txt
   │     Type : txt
   │     Size : 58 bytes
   │     Path : public/ads.txt
   ├── 📄 android-chrome-192x192.png
   │     Type : png
   │     Size : 66530 bytes
   │     Path : public/android-chrome-192x192.png
   ├── 📄 android-chrome-512x512.png
   │     Type : png
   │     Size : 359949 bytes
   │     Path : public/android-chrome-512x512.png
   ├── 📄 api-reliability-playbook.html
   │     Type : html
   │     Size : 781 bytes
   │     Path : public/api-reliability-playbook.html
   ├── 📄 apple-touch-icon.png
   │     Type : png
   │     Size : 59724 bytes
   │     Path : public/apple-touch-icon.png
   ├── 📄 assets
   │     Type : No Extension
   │     Size : - bytes
   │     Path : public/assets
   ├── 📄 collaboration-and-contact-workflow.html
   │     Type : html
   │     Size : 806 bytes
   │     Path : public/collaboration-and-contact-workflow.html
   ├── 📄 community-and-support-framework.html
   │     Type : html
   │     Size : 797 bytes
   │     Path : public/community-and-support-framework.html
   ├── 📄 content-strategy-manifest.html
   │     Type : html
   │     Size : 784 bytes
   │     Path : public/content-strategy-manifest.html
   ├── 📄 countdown.html
   │     Type : html
   │     Size : 22075 bytes
   │     Path : public/countdown.html
   ├── 📄 crown.svg
   │     Type : svg
   │     Size : 27153 bytes
   │     Path : public/crown.svg
   ├── 📄 cursors
   │     Type : No Extension
   │     Size : - bytes
   │     Path : public/cursors
   ├── 📄 data-model-governance.html
   │     Type : html
   │     Size : 775 bytes
   │     Path : public/data-model-governance.html
   ├── 📄 deployment-and-release-story.html
   │     Type : html
   │     Size : 796 bytes
   │     Path : public/deployment-and-release-story.html
   ├── 📄 discord-activity-bot.png
   │     Type : png
   │     Size : 67050 bytes
   │     Path : public/discord-activity-bot.png
   ├── 📄 favicon-16x16.png
   │     Type : png
   │     Size : 778 bytes
   │     Path : public/favicon-16x16.png
   ├── 📄 favicon-32x32.png
   │     Type : png
   │     Size : 2570 bytes
   │     Path : public/favicon-32x32.png
   ├── 📄 favicon.ico
   │     Type : ico
   │     Size : 15406 bytes
   │     Path : public/favicon.ico
   ├── 📄 feature-delivery-timeline.html
   │     Type : html
   │     Size : 779 bytes
   │     Path : public/feature-delivery-timeline.html
   ├── 📄 future-innovation-lab.html
   │     Type : html
   │     Size : 767 bytes
   │     Path : public/future-innovation-lab.html
   ├── 📄 journal-platform-deep-dive.html
   │     Type : html
   │     Size : 782 bytes
   │     Path : public/journal-platform-deep-dive.html
   ├── 📄 learning-roadmap-and-goals.html
   │     Type : html
   │     Size : 782 bytes
   │     Path : public/learning-roadmap-and-goals.html
   ├── 📄 legal-and-compliance-summary.html
   │     Type : html
   │     Size : 788 bytes
   │     Path : public/legal-and-compliance-summary.html
   ├── 📄 m-qlynk-me-1024x768desktop-192b9e.png
   │     Type : png
   │     Size : 134193 bytes
   │     Path : public/m-qlynk-me-1024x768desktop-192b9e.png
   ├── 📄 magicbite-odoo-com-1024x768desktop-f5cc51.png
   │     Type : png
   │     Size : 725474 bytes
   │     Path : public/magicbite-odoo-com-1024x768desktop-f5cc51.png
   ├── 📄 mobile-experience-handbook.html
   │     Type : html
   │     Size : 787 bytes
   │     Path : public/mobile-experience-handbook.html
   ├── 📄 monitoring-and-status-notes.html
   │     Type : html
   │     Size : 793 bytes
   │     Path : public/monitoring-and-status-notes.html
   ├── 📄 performance-engineering-report.html
   │     Type : html
   │     Size : 801 bytes
   │     Path : public/performance-engineering-report.html
   ├── 📄 portfolio-case-study-node-server.html
   │     Type : html
   │     Size : 790 bytes
   │     Path : public/portfolio-case-study-node-server.html
   ├── 📄 portfolio-case-study-quicklink.html
   │     Type : html
   │     Size : 784 bytes
   │     Path : public/portfolio-case-study-quicklink.html
   ├── 📄 portfolio-case-study-studybot.html
   │     Type : html
   │     Size : 781 bytes
   │     Path : public/portfolio-case-study-studybot.html
   ├── 📄 portfolio-case-study-transparent-clock.html
   │     Type : html
   │     Size : 808 bytes
   │     Path : public/portfolio-case-study-transparent-clock.html
   ├── 📄 project-architecture-blueprint.html
   │     Type : html
   │     Size : 798 bytes
   │     Path : public/project-architecture-blueprint.html
   ├── 📄 project-retrospective-2026.html
   │     Type : html
   │     Size : 782 bytes
   │     Path : public/project-retrospective-2026.html
   ├── 📄 project-svg
   │     Type : No Extension
   │     Size : - bytes
   │     Path : public/project-svg
   ├── 📄 pwa-192x192.png
   │     Type : png
   │     Size : 66530 bytes
   │     Path : public/pwa-192x192.png
   ├── 📄 quicklink-logo.svg
   │     Type : svg
   │     Size : 694 bytes
   │     Path : public/quicklink-logo.svg
   ├── 📄 robots.txt
   │     Type : txt
   │     Size : 691 bytes
   │     Path : public/robots.txt
   ├── 📄 security-hardening-notes.html
   │     Type : html
   │     Size : 784 bytes
   │     Path : public/security-hardening-notes.html
   ├── 📄 seo-and-indexing-guide.html
   │     Type : html
   │     Size : 778 bytes
   │     Path : public/seo-and-indexing-guide.html
   ├── 📄 site.webmanifest
   │     Type : webmanifest
   │     Size : 263 bytes
   │     Path : public/site.webmanifest
   ├── 📄 sitemap.xml.txt
   │     Type : txt
   │     Size : 4403 bytes
   │     Path : public/sitemap.xml.txt
   ├── 📄 static-pages-app.js
   │     Type : js
   │     Size : 4214 bytes
   │     Path : public/static-pages-app.js
   ├── 📄 static-pages-data.js
   │     Type : js
   │     Size : 8150 bytes
   │     Path : public/static-pages-data.js
   ├── 📄 static-pages.css
   │     Type : css
   │     Size : 3224 bytes
   │     Path : public/static-pages.css
   ├── 📄 static-pages.html
   │     Type : html
   │     Size : 876 bytes
   │     Path : public/static-pages.html
   ├── 📄 ui-design-system-overview.html
   │     Type : html
   │     Size : 781 bytes
   │     Path : public/ui-design-system-overview.html
   ├── 📄 user-feedback-operations.html
   │     Type : html
   │     Size : 776 bytes
   │     Path : public/user-feedback-operations.html
   ├── 📄 verified.svg
   │     Type : svg
   │     Size : 701 bytes
   │     Path : public/verified.svg

│   📁 Folder : .well-known/
│      Path   : public/.well-known/
│      Files  : 1
│      ├── 📄 discord
│      │     Type : No Extension
│      │     Size : 88 bytes
│      │     Path : public/.well-known/discord

│   📁 Folder : assets/
│      Path   : public/assets/
│      Files  : 3
│      ├── 📄 docs
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/assets/docs
│      ├── 📄 images
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/assets/images
│      ├── 📄 js
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/assets/js

│   │   📁 Folder : docs/
│   │      Path   : public/assets/docs/
│   │      Files  : 1
│   │      ├── 📄 Deep_Dey_Portfolio.pdf
│   │      │     Type : pdf
│   │      │     Size : 1943075 bytes
│   │      │     Path : public/assets/docs/Deep_Dey_Portfolio.pdf

│   │   📁 Folder : images/
│   │      Path   : public/assets/images/
│   │      Files  : 1
│   │      ├── 📄 myphoto.png
│   │      │     Type : png
│   │      │     Size : 121296 bytes
│   │      │     Path : public/assets/images/myphoto.png

│   │   📁 Folder : js/
│   │      Path   : public/assets/js/
│   │      Files  : 1
│   │      ├── 📄 footer-extras.js
│   │      │     Type : js
│   │      │     Size : 29821 bytes
│   │      │     Path : public/assets/js/footer-extras.js

│   📁 Folder : cursors/
│      Path   : public/cursors/
│      Files  : 3
│      ├── 📄 manifest.json
│      │     Type : json
│      │     Size : 703 bytes
│      │     Path : public/cursors/manifest.json
│      ├── 📄 system
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/cursors/system
│      ├── 📄 visual
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/cursors/visual

│   │   📁 Folder : system/
│   │      Path   : public/cursors/system/
│   │      Files  : 7
│   │      ├── 📄 action.svg
│   │      │     Type : svg
│   │      │     Size : 296 bytes
│   │      │     Path : public/cursors/system/action.svg
│   │      ├── 📄 click.svg
│   │      │     Type : svg
│   │      │     Size : 298 bytes
│   │      │     Path : public/cursors/system/click.svg
│   │      ├── 📄 default.svg
│   │      │     Type : svg
│   │      │     Size : 478 bytes
│   │      │     Path : public/cursors/system/default.svg
│   │      ├── 📄 drag.svg
│   │      │     Type : svg
│   │      │     Size : 296 bytes
│   │      │     Path : public/cursors/system/drag.svg
│   │      ├── 📄 input.svg
│   │      │     Type : svg
│   │      │     Size : 331 bytes
│   │      │     Path : public/cursors/system/input.svg
│   │      ├── 📄 select.svg
│   │      │     Type : svg
│   │      │     Size : 266 bytes
│   │      │     Path : public/cursors/system/select.svg
│   │      ├── 📄 text.svg
│   │      │     Type : svg
│   │      │     Size : 272 bytes
│   │      │     Path : public/cursors/system/text.svg

│   │   📁 Folder : visual/
│   │      Path   : public/cursors/visual/
│   │      Files  : 20
│   │      ├── 📄 anchor-grid.svg
│   │      │     Type : svg
│   │      │     Size : 351 bytes
│   │      │     Path : public/cursors/visual/anchor-grid.svg
│   │      ├── 📄 aurora-dart.svg
│   │      │     Type : svg
│   │      │     Size : 442 bytes
│   │      │     Path : public/cursors/visual/aurora-dart.svg
│   │      ├── 📄 click-burst.svg
│   │      │     Type : svg
│   │      │     Size : 276 bytes
│   │      │     Path : public/cursors/visual/click-burst.svg
│   │      ├── 📄 comet.svg
│   │      │     Type : svg
│   │      │     Size : 383 bytes
│   │      │     Path : public/cursors/visual/comet.svg
│   │      ├── 📄 drag-node.svg
│   │      │     Type : svg
│   │      │     Size : 312 bytes
│   │      │     Path : public/cursors/visual/drag-node.svg
│   │      ├── 📄 flare-triangle.svg
│   │      │     Type : svg
│   │      │     Size : 260 bytes
│   │      │     Path : public/cursors/visual/flare-triangle.svg
│   │      ├── 📄 glass-arrow.svg
│   │      │     Type : svg
│   │      │     Size : 276 bytes
│   │      │     Path : public/cursors/visual/glass-arrow.svg
│   │      ├── 📄 ink-beam.svg
│   │      │     Type : svg
│   │      │     Size : 327 bytes
│   │      │     Path : public/cursors/visual/ink-beam.svg
│   │      ├── 📄 input-beam.svg
│   │      │     Type : svg
│   │      │     Size : 278 bytes
│   │      │     Path : public/cursors/visual/input-beam.svg
│   │      ├── 📄 magnet-drag.svg
│   │      │     Type : svg
│   │      │     Size : 280 bytes
│   │      │     Path : public/cursors/visual/magnet-drag.svg
│   │      ├── 📄 neon-needle.svg
│   │      │     Type : svg
│   │      │     Size : 221 bytes
│   │      │     Path : public/cursors/visual/neon-needle.svg
│   │      ├── 📄 nova-click.svg
│   │      │     Type : svg
│   │      │     Size : 280 bytes
│   │      │     Path : public/cursors/visual/nova-click.svg
│   │      ├── 📄 orbit.svg
│   │      │     Type : svg
│   │      │     Size : 290 bytes
│   │      │     Path : public/cursors/visual/orbit.svg
│   │      ├── 📄 prism-arrow.svg
│   │      │     Type : svg
│   │      │     Size : 462 bytes
│   │      │     Path : public/cursors/visual/prism-arrow.svg
│   │      ├── 📄 pulse-core.svg
│   │      │     Type : svg
│   │      │     Size : 280 bytes
│   │      │     Path : public/cursors/visual/pulse-core.svg
│   │      ├── 📄 quantum-tip.svg
│   │      │     Type : svg
│   │      │     Size : 266 bytes
│   │      │     Path : public/cursors/visual/quantum-tip.svg
│   │      ├── 📄 scribe.svg
│   │      │     Type : svg
│   │      │     Size : 261 bytes
│   │      │     Path : public/cursors/visual/scribe.svg
│   │      ├── 📄 selection-ring.svg
│   │      │     Type : svg
│   │      │     Size : 321 bytes
│   │      │     Path : public/cursors/visual/selection-ring.svg
│   │      ├── 📄 spark-lance.svg
│   │      │     Type : svg
│   │      │     Size : 296 bytes
│   │      │     Path : public/cursors/visual/spark-lance.svg
│   │      ├── 📄 vector-wing.svg
│   │      │     Type : svg
│   │      │     Size : 253 bytes
│   │      │     Path : public/cursors/visual/vector-wing.svg

│   📁 Folder : project-svg/
│      Path   : public/project-svg/
│      Files  : 3
│      ├── 📄 brand
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/project-svg/brand
│      ├── 📄 cursors
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : public/project-svg/cursors
│      ├── 📄 manifest.json
│      │     Type : json
│      │     Size : 703 bytes
│      │     Path : public/project-svg/manifest.json

│   │   📁 Folder : brand/
│   │      Path   : public/project-svg/brand/
│   │      Files  : 3
│   │      ├── 📄 crown.svg
│   │      │     Type : svg
│   │      │     Size : 27153 bytes
│   │      │     Path : public/project-svg/brand/crown.svg
│   │      ├── 📄 quicklink-logo.svg
│   │      │     Type : svg
│   │      │     Size : 694 bytes
│   │      │     Path : public/project-svg/brand/quicklink-logo.svg
│   │      ├── 📄 verified.svg
│   │      │     Type : svg
│   │      │     Size : 701 bytes
│   │      │     Path : public/project-svg/brand/verified.svg

│   │   📁 Folder : cursors/
│   │      Path   : public/project-svg/cursors/
│   │      Files  : 2
│   │      ├── 📄 system
│   │      │     Type : No Extension
│   │      │     Size : - bytes
│   │      │     Path : public/project-svg/cursors/system
│   │      ├── 📄 visual
│   │      │     Type : No Extension
│   │      │     Size : - bytes
│   │      │     Path : public/project-svg/cursors/visual

│   │   │   📁 Folder : system/
│   │   │      Path   : public/project-svg/cursors/system/
│   │   │      Files  : 7
│   │   │      ├── 📄 action.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 296 bytes
│   │   │      │     Path : public/project-svg/cursors/system/action.svg
│   │   │      ├── 📄 click.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 298 bytes
│   │   │      │     Path : public/project-svg/cursors/system/click.svg
│   │   │      ├── 📄 default.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 478 bytes
│   │   │      │     Path : public/project-svg/cursors/system/default.svg
│   │   │      ├── 📄 drag.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 296 bytes
│   │   │      │     Path : public/project-svg/cursors/system/drag.svg
│   │   │      ├── 📄 input.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 331 bytes
│   │   │      │     Path : public/project-svg/cursors/system/input.svg
│   │   │      ├── 📄 select.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 266 bytes
│   │   │      │     Path : public/project-svg/cursors/system/select.svg
│   │   │      ├── 📄 text.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 272 bytes
│   │   │      │     Path : public/project-svg/cursors/system/text.svg

│   │   │   📁 Folder : visual/
│   │   │      Path   : public/project-svg/cursors/visual/
│   │   │      Files  : 20
│   │   │      ├── 📄 anchor-grid.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 351 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/anchor-grid.svg
│   │   │      ├── 📄 aurora-dart.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 442 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/aurora-dart.svg
│   │   │      ├── 📄 click-burst.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 276 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/click-burst.svg
│   │   │      ├── 📄 comet.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 383 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/comet.svg
│   │   │      ├── 📄 drag-node.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 312 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/drag-node.svg
│   │   │      ├── 📄 flare-triangle.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 260 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/flare-triangle.svg
│   │   │      ├── 📄 glass-arrow.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 276 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/glass-arrow.svg
│   │   │      ├── 📄 ink-beam.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 327 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/ink-beam.svg
│   │   │      ├── 📄 input-beam.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 278 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/input-beam.svg
│   │   │      ├── 📄 magnet-drag.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 280 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/magnet-drag.svg
│   │   │      ├── 📄 neon-needle.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 221 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/neon-needle.svg
│   │   │      ├── 📄 nova-click.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 280 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/nova-click.svg
│   │   │      ├── 📄 orbit.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 290 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/orbit.svg
│   │   │      ├── 📄 prism-arrow.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 462 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/prism-arrow.svg
│   │   │      ├── 📄 pulse-core.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 280 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/pulse-core.svg
│   │   │      ├── 📄 quantum-tip.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 266 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/quantum-tip.svg
│   │   │      ├── 📄 scribe.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 261 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/scribe.svg
│   │   │      ├── 📄 selection-ring.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 321 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/selection-ring.svg
│   │   │      ├── 📄 spark-lance.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 296 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/spark-lance.svg
│   │   │      ├── 📄 vector-wing.svg
│   │   │      │     Type : svg
│   │   │      │     Size : 253 bytes
│   │   │      │     Path : public/project-svg/cursors/visual/vector-wing.svg
📁 Folder : src/
   Path   : src/
   Files  : 10
   ├── 📄 App.tsx
   │     Type : tsx
   │     Size : 20830 bytes
   │     Path : src/App.tsx
   ├── 📄 components
   │     Type : No Extension
   │     Size : - bytes
   │     Path : src/components
   ├── 📄 context
   │     Type : No Extension
   │     Size : - bytes
   │     Path : src/context
   ├── 📄 data
   │     Type : No Extension
   │     Size : - bytes
   │     Path : src/data
   ├── 📄 features
   │     Type : No Extension
   │     Size : - bytes
   │     Path : src/features
   ├── 📄 index.css
   │     Type : css
   │     Size : 2612 bytes
   │     Path : src/index.css
   ├── 📄 main.tsx
   │     Type : tsx
   │     Size : 625 bytes
   │     Path : src/main.tsx
   ├── 📄 pages
   │     Type : No Extension
   │     Size : - bytes
   │     Path : src/pages
   ├── 📄 utils
   │     Type : No Extension
   │     Size : - bytes
   │     Path : src/utils
   ├── 📄 vite-env.d.ts
   │     Type : ts
   │     Size : 38 bytes
   │     Path : src/vite-env.d.ts

│   📁 Folder : components/
│      Path   : src/components/
│      Files  : 18
│      ├── 📄 CommentSection.tsx
│      │     Type : tsx
│      │     Size : 40739 bytes
│      │     Path : src/components/CommentSection.tsx
│      ├── 📄 ContactForm.tsx
│      │     Type : tsx
│      │     Size : 7470 bytes
│      │     Path : src/components/ContactForm.tsx
│      ├── 📄 CustomPointerSystem.tsx
│      │     Type : tsx
│      │     Size : 15906 bytes
│      │     Path : src/components/CustomPointerSystem.tsx
│      ├── 📄 FAQ.tsx
│      │     Type : tsx
│      │     Size : 3098 bytes
│      │     Path : src/components/FAQ.tsx
│      ├── 📄 FeedbackAdminPanel.tsx
│      │     Type : tsx
│      │     Size : 15071 bytes
│      │     Path : src/components/FeedbackAdminPanel.tsx
│      ├── 📄 Footer.tsx
│      │     Type : tsx
│      │     Size : 25762 bytes
│      │     Path : src/components/Footer.tsx
│      ├── 📄 Header.tsx
│      │     Type : tsx
│      │     Size : 17136 bytes
│      │     Path : src/components/Header.tsx
│      ├── 📄 IdentityBadges.tsx
│      │     Type : tsx
│      │     Size : 2597 bytes
│      │     Path : src/components/IdentityBadges.tsx
│      ├── 📄 JournalHtmlBlobRenderer.tsx
│      │     Type : tsx
│      │     Size : 3464 bytes
│      │     Path : src/components/JournalHtmlBlobRenderer.tsx
│      ├── 📄 JourneyMarquee.tsx
│      │     Type : tsx
│      │     Size : 3325 bytes
│      │     Path : src/components/JourneyMarquee.tsx
│      ├── 📄 Layout.tsx
│      │     Type : tsx
│      │     Size : 1028 bytes
│      │     Path : src/components/Layout.tsx
│      ├── 📄 LoadingScreen.tsx
│      │     Type : tsx
│      │     Size : 9297 bytes
│      │     Path : src/components/LoadingScreen.tsx
│      ├── 📄 ProjectPlaceholder.tsx
│      │     Type : tsx
│      │     Size : 2903 bytes
│      │     Path : src/components/ProjectPlaceholder.tsx
│      ├── 📄 SEO.tsx
│      │     Type : tsx
│      │     Size : 1911 bytes
│      │     Path : src/components/SEO.tsx
│      ├── 📄 ScrollToTop.tsx
│      │     Type : tsx
│      │     Size : 1992 bytes
│      │     Path : src/components/ScrollToTop.tsx
│      ├── 📄 SocialProof.tsx
│      │     Type : tsx
│      │     Size : 12442 bytes
│      │     Path : src/components/SocialProof.tsx
│      ├── 📄 StatusWidget.tsx
│      │     Type : tsx
│      │     Size : 13348 bytes
│      │     Path : src/components/StatusWidget.tsx
│      ├── 📄 TechGalaxy.tsx
│      │     Type : tsx
│      │     Size : 15250 bytes
│      │     Path : src/components/TechGalaxy.tsx

│   📁 Folder : context/
│      Path   : src/context/
│      Files  : 1
│      ├── 📄 LanguageContext.tsx
│      │     Type : tsx
│      │     Size : 5175 bytes
│      │     Path : src/context/LanguageContext.tsx

│   📁 Folder : data/
│      Path   : src/data/
│      Files  : 8
│      ├── 📄 contentData.ts
│      │     Type : ts
│      │     Size : 5328 bytes
│      │     Path : src/data/contentData.ts
│      ├── 📄 faqData.ts
│      │     Type : ts
│      │     Size : 126236 bytes
│      │     Path : src/data/faqData.ts
│      ├── 📄 linksData.ts
│      │     Type : ts
│      │     Size : 26480 bytes
│      │     Path : src/data/linksData.ts
│      ├── 📄 nowData.ts
│      │     Type : ts
│      │     Size : 3137 bytes
│      │     Path : src/data/nowData.ts
│      ├── 📄 pointerAssets.tsx
│      │     Type : tsx
│      │     Size : 12402 bytes
│      │     Path : src/data/pointerAssets.tsx
│      ├── 📄 projectsData.ts
│      │     Type : ts
│      │     Size : 11155 bytes
│      │     Path : src/data/projectsData.ts
│      ├── 📄 proofData.ts
│      │     Type : ts
│      │     Size : 4096 bytes
│      │     Path : src/data/proofData.ts
│      ├── 📄 timelineData.ts
│      │     Type : ts
│      │     Size : 2645 bytes
│      │     Path : src/data/timelineData.ts

│   📁 Folder : features/
│      Path   : src/features/
│      Files  : 4
│      ├── 📄 FeaturePageTemplate.tsx
│      │     Type : tsx
│      │     Size : 6069 bytes
│      │     Path : src/features/FeaturePageTemplate.tsx
│      ├── 📄 feature-links.json
│      │     Type : json
│      │     Size : 8567 bytes
│      │     Path : src/features/feature-links.json
│      ├── 📄 pages
│      │     Type : No Extension
│      │     Size : - bytes
│      │     Path : src/features/pages
│      ├── 📄 types.ts
│      │     Type : ts
│      │     Size : 654 bytes
│      │     Path : src/features/types.ts

│   │   📁 Folder : pages/
│   │      Path   : src/features/pages/
│   │      Files  : 32
│   │      ├── 📄 FeatureArchitectureLayers.tsx
│   │      │     Type : tsx
│   │      │     Size : 3330 bytes
│   │      │     Path : src/features/pages/FeatureArchitectureLayers.tsx
│   │      ├── 📄 FeatureAtlasNavigation.tsx
│   │      │     Type : tsx
│   │      │     Size : 3301 bytes
│   │      │     Path : src/features/pages/FeatureAtlasNavigation.tsx
│   │      ├── 📄 FeatureAuthoringStandards.tsx
│   │      │     Type : tsx
│   │      │     Size : 3331 bytes
│   │      │     Path : src/features/pages/FeatureAuthoringStandards.tsx
│   │      ├── 📄 FeatureBackNavigation.tsx
│   │      │     Type : tsx
│   │      │     Size : 3284 bytes
│   │      │     Path : src/features/pages/FeatureBackNavigation.tsx
│   │      ├── 📄 FeatureChangeImpact.tsx
│   │      │     Type : tsx
│   │      │     Size : 3272 bytes
│   │      │     Path : src/features/pages/FeatureChangeImpact.tsx
│   │      ├── 📄 FeatureCompatibilityGuard.tsx
│   │      │     Type : tsx
│   │      │     Size : 3329 bytes
│   │      │     Path : src/features/pages/FeatureCompatibilityGuard.tsx
│   │      ├── 📄 FeatureContentDensity.tsx
│   │      │     Type : tsx
│   │      │     Size : 3298 bytes
│   │      │     Path : src/features/pages/FeatureContentDensity.tsx
│   │      ├── 📄 FeatureDataOwnership.tsx
│   │      │     Type : tsx
│   │      │     Size : 3283 bytes
│   │      │     Path : src/features/pages/FeatureDataOwnership.tsx
│   │      ├── 📄 FeatureDiagramEngine.tsx
│   │      │     Type : tsx
│   │      │     Size : 3286 bytes
│   │      │     Path : src/features/pages/FeatureDiagramEngine.tsx
│   │      ├── 📄 FeatureDiagramReadability.tsx
│   │      │     Type : tsx
│   │      │     Size : 3331 bytes
│   │      │     Path : src/features/pages/FeatureDiagramReadability.tsx
│   │      ├── 📄 FeatureDynamicDiscovery.tsx
│   │      │     Type : tsx
│   │      │     Size : 3311 bytes
│   │      │     Path : src/features/pages/FeatureDynamicDiscovery.tsx
│   │      ├── 📄 FeatureFaqKnowledge.tsx
│   │      │     Type : tsx
│   │      │     Size : 3277 bytes
│   │      │     Path : src/features/pages/FeatureFaqKnowledge.tsx
│   │      ├── 📄 FeatureFutureExpansion.tsx
│   │      │     Type : tsx
│   │      │     Size : 3302 bytes
│   │      │     Path : src/features/pages/FeatureFutureExpansion.tsx
│   │      ├── 📄 FeatureHeaderEntrypoint.tsx
│   │      │     Type : tsx
│   │      │     Size : 3310 bytes
│   │      │     Path : src/features/pages/FeatureHeaderEntrypoint.tsx
│   │      ├── 📄 FeatureImplementationNotes.tsx
│   │      │     Type : tsx
│   │      │     Size : 3338 bytes
│   │      │     Path : src/features/pages/FeatureImplementationNotes.tsx
│   │      ├── 📄 FeatureMaintenanceMode.tsx
│   │      │     Type : tsx
│   │      │     Size : 3301 bytes
│   │      │     Path : src/features/pages/FeatureMaintenanceMode.tsx
│   │      ├── 📄 FeatureObservabilityHooks.tsx
│   │      │     Type : tsx
│   │      │     Size : 3328 bytes
│   │      │     Path : src/features/pages/FeatureObservabilityHooks.tsx
│   │      ├── 📄 FeaturePerformanceBudget.tsx
│   │      │     Type : tsx
│   │      │     Size : 3320 bytes
│   │      │     Path : src/features/pages/FeaturePerformanceBudget.tsx
│   │      ├── 📄 FeatureQualityGates.tsx
│   │      │     Type : tsx
│   │      │     Size : 3271 bytes
│   │      │     Path : src/features/pages/FeatureQualityGates.tsx
│   │      ├── 📄 FeatureReleaseReadiness.tsx
│   │      │     Type : tsx
│   │      │     Size : 3308 bytes
│   │      │     Path : src/features/pages/FeatureReleaseReadiness.tsx
│   │      ├── 📄 FeatureRenderPipeline.tsx
│   │      │     Type : tsx
│   │      │     Size : 3298 bytes
│   │      │     Path : src/features/pages/FeatureRenderPipeline.tsx
│   │      ├── 📄 FeatureRiskRegister.tsx
│   │      │     Type : tsx
│   │      │     Size : 3275 bytes
│   │      │     Path : src/features/pages/FeatureRiskRegister.tsx
│   │      ├── 📄 FeatureRoadmapTracks.tsx
│   │      │     Type : tsx
│   │      │     Size : 3281 bytes
│   │      │     Path : src/features/pages/FeatureRoadmapTracks.tsx
│   │      ├── 📄 FeatureRoutingContract.tsx
│   │      │     Type : tsx
│   │      │     Size : 3298 bytes
│   │      │     Path : src/features/pages/FeatureRoutingContract.tsx
│   │      ├── 📄 FeatureSchemaGovernance.tsx
│   │      │     Type : tsx
│   │      │     Size : 3321 bytes
│   │      │     Path : src/features/pages/FeatureSchemaGovernance.tsx
│   │      ├── 📄 FeatureSecurityPosture.tsx
│   │      │     Type : tsx
│   │      │     Size : 3299 bytes
│   │      │     Path : src/features/pages/FeatureSecurityPosture.tsx
│   │      ├── 📄 FeatureSeoContracts.tsx
│   │      │     Type : tsx
│   │      │     Size : 3267 bytes
│   │      │     Path : src/features/pages/FeatureSeoContracts.tsx
│   │      ├── 📄 FeatureSitemapIntegration.tsx
│   │      │     Type : tsx
│   │      │     Size : 3326 bytes
│   │      │     Path : src/features/pages/FeatureSitemapIntegration.tsx
│   │      ├── 📄 FeatureSummaryTruncation.tsx
│   │      │     Type : tsx
│   │      │     Size : 3311 bytes
│   │      │     Path : src/features/pages/FeatureSummaryTruncation.tsx
│   │      ├── 📄 FeatureSystemCore.tsx
│   │      │     Type : tsx
│   │      │     Size : 3263 bytes
│   │      │     Path : src/features/pages/FeatureSystemCore.tsx
│   │      ├── 📄 FeatureVisualizationPanels.tsx
│   │      │     Type : tsx
│   │      │     Size : 3340 bytes
│   │      │     Path : src/features/pages/FeatureVisualizationPanels.tsx
│   │      ├── 📄 FeatureWorkflowSequencer.tsx
│   │      │     Type : tsx
│   │      │     Size : 3317 bytes
│   │      │     Path : src/features/pages/FeatureWorkflowSequencer.tsx

│   📁 Folder : pages/
│      Path   : src/pages/
│      Files  : 34
│      ├── 📄 About.tsx
│      │     Type : tsx
│      │     Size : 17673 bytes
│      │     Path : src/pages/About.tsx
│      ├── 📄 AllUsers.tsx
│      │     Type : tsx
│      │     Size : 11024 bytes
│      │     Path : src/pages/AllUsers.tsx
│      ├── 📄 CommentGuide.tsx
│      │     Type : tsx
│      │     Size : 12324 bytes
│      │     Path : src/pages/CommentGuide.tsx
│      ├── 📄 CommentPermalink.tsx
│      │     Type : tsx
│      │     Size : 10574 bytes
│      │     Path : src/pages/CommentPermalink.tsx
│      ├── 📄 Contact.tsx
│      │     Type : tsx
│      │     Size : 41900 bytes
│      │     Path : src/pages/Contact.tsx
│      ├── 📄 Copyright.tsx
│      │     Type : tsx
│      │     Size : 3798 bytes
│      │     Path : src/pages/Copyright.tsx
│      ├── 📄 DMCA.tsx
│      │     Type : tsx
│      │     Size : 3425 bytes
│      │     Path : src/pages/DMCA.tsx
│      ├── 📄 Dashboard.tsx
│      │     Type : tsx
│      │     Size : 246027 bytes
│      │     Path : src/pages/Dashboard.tsx
│      ├── 📄 FAQ.tsx
│      │     Type : tsx
│      │     Size : 14411 bytes
│      │     Path : src/pages/FAQ.tsx
│      ├── 📄 Features.tsx
│      │     Type : tsx
│      │     Size : 4063 bytes
│      │     Path : src/pages/Features.tsx
│      ├── 📄 Feedback.tsx
│      │     Type : tsx
│      │     Size : 30223 bytes
│      │     Path : src/pages/Feedback.tsx
│      ├── 📄 Home.tsx
│      │     Type : tsx
│      │     Size : 47426 bytes
│      │     Path : src/pages/Home.tsx
│      ├── 📄 Journal.tsx
│      │     Type : tsx
│      │     Size : 17865 bytes
│      │     Path : src/pages/Journal.tsx
│      ├── 📄 JournalAllComments.tsx
│      │     Type : tsx
│      │     Size : 15524 bytes
│      │     Path : src/pages/JournalAllComments.tsx
│      ├── 📄 JournalEmbed.tsx
│      │     Type : tsx
│      │     Size : 9760 bytes
│      │     Path : src/pages/JournalEmbed.tsx
│      ├── 📄 JournalTagResults.tsx
│      │     Type : tsx
│      │     Size : 9683 bytes
│      │     Path : src/pages/JournalTagResults.tsx
│      ├── 📄 JournalView.tsx
│      │     Type : tsx
│      │     Size : 19950 bytes
│      │     Path : src/pages/JournalView.tsx
│      ├── 📄 LegalHub.tsx
│      │     Type : tsx
│      │     Size : 8211 bytes
│      │     Path : src/pages/LegalHub.tsx
│      ├── 📄 License.tsx
│      │     Type : tsx
│      │     Size : 2876 bytes
│      │     Path : src/pages/License.tsx
│      ├── 📄 Links.tsx
│      │     Type : tsx
│      │     Size : 12013 bytes
│      │     Path : src/pages/Links.tsx
│      ├── 📄 Live.tsx
│      │     Type : tsx
│      │     Size : 20982 bytes
│      │     Path : src/pages/Live.tsx
│      ├── 📄 Me.tsx
│      │     Type : tsx
│      │     Size : 10263 bytes
│      │     Path : src/pages/Me.tsx
│      ├── 📄 NotFound.tsx
│      │     Type : tsx
│      │     Size : 34965 bytes
│      │     Path : src/pages/NotFound.tsx
│      ├── 📄 Now.tsx
│      │     Type : tsx
│      │     Size : 3636 bytes
│      │     Path : src/pages/Now.tsx
│      ├── 📄 Portfolio.tsx
│      │     Type : tsx
│      │     Size : 9154 bytes
│      │     Path : src/pages/Portfolio.tsx
│      ├── 📄 Privacy.tsx
│      │     Type : tsx
│      │     Size : 6975 bytes
│      │     Path : src/pages/Privacy.tsx
│      ├── 📄 ProjectDetail.tsx
│      │     Type : tsx
│      │     Size : 9030 bytes
│      │     Path : src/pages/ProjectDetail.tsx
│      ├── 📄 Projects.tsx
│      │     Type : tsx
│      │     Size : 12946 bytes
│      │     Path : src/pages/Projects.tsx
│      ├── 📄 Proof.tsx
│      │     Type : tsx
│      │     Size : 5212 bytes
│      │     Path : src/pages/Proof.tsx
│      ├── 📄 SearchResults.tsx
│      │     Type : tsx
│      │     Size : 34403 bytes
│      │     Path : src/pages/SearchResults.tsx
│      ├── 📄 Security.tsx
│      │     Type : tsx
│      │     Size : 3423 bytes
│      │     Path : src/pages/Security.tsx
│      ├── 📄 Status.tsx
│      │     Type : tsx
│      │     Size : 59087 bytes
│      │     Path : src/pages/Status.tsx
│      ├── 📄 Terms.tsx
│      │     Type : tsx
│      │     Size : 7570 bytes
│      │     Path : src/pages/Terms.tsx
│      ├── 📄 UserProfile.tsx
│      │     Type : tsx
│      │     Size : 41931 bytes
│      │     Path : src/pages/UserProfile.tsx

│   📁 Folder : utils/
│      Path   : src/utils/
│      Files  : 4
│      ├── 📄 feedback.ts
│      │     Type : ts
│      │     Size : 1407 bytes
│      │     Path : src/utils/feedback.ts
│      ├── 📄 iconMap.ts
│      │     Type : ts
│      │     Size : 1067 bytes
│      │     Path : src/utils/iconMap.ts
│      ├── 📄 journalHtmlApiUrl.ts
│      │     Type : ts
│      │     Size : 374 bytes
│      │     Path : src/utils/journalHtmlApiUrl.ts
│      ├── 📄 watermark.ts
│      │     Type : ts
│      │     Size : 978 bytes
│      │     Path : src/utils/watermark.ts

Files directly inside ROOT:

📄 .env.example
   Type : example
   Size : 2729 bytes
   Path : .env.example

📄 .github
   Type : github
   Size : - bytes
   Path : .github

📄 .gitignore
   Type : gitignore
   Size : 73 bytes
   Path : .gitignore

📄 CHANGELOG.md
   Type : md
   Size : 24303 bytes
   Path : CHANGELOG.md

📄 CODE_OF_CONDUCT.md
   Type : md
   Size : 4094 bytes
   Path : CODE_OF_CONDUCT.md

📄 CONTRIBUTING.md
   Type : md
   Size : 6522 bytes
   Path : CONTRIBUTING.md

📄 CONTRIBUTOR.md
   Type : md
   Size : 1675 bytes
   Path : CONTRIBUTOR.md

📄 LICENSE
   Type : No Extension
   Size : 2068 bytes
   Path : LICENSE

📄 PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md
   Type : md
   Size : 261737 bytes
   Path : PORTFOLIO_SETUP_DEPLOYMENT_MANUAL.md

📄 README.md
   Type : md
   Size : 57326 bytes
   Path : README.md

📄 SECURITY.md
   Type : md
   Size : 5469 bytes
   Path : SECURITY.md

📄 SUPPORT.md
   Type : md
   Size : 3523 bytes
   Path : SUPPORT.md

📄 api
   Type : No Extension
   Size : - bytes
   Path : api

📄 dist
   Type : No Extension
   Size : - bytes
   Path : dist

📄 index.html
   Type : html
   Size : 7093 bytes
   Path : index.html

📄 metadata.json
   Type : json
   Size : 171 bytes
   Path : metadata.json

📄 package-lock.json
   Type : json
   Size : 208211 bytes
   Path : package-lock.json

📄 package.json
   Type : json
   Size : 1115 bytes
   Path : package.json

📄 public
   Type : No Extension
   Size : - bytes
   Path : public

📄 src
   Type : No Extension
   Size : - bytes
   Path : src

📄 tailwind.config.js
   Type : js
   Size : 659 bytes
   Path : tailwind.config.js

📄 tsconfig.json
   Type : json
   Size : 569 bytes
   Path : tsconfig.json

📄 vercel.json
   Type : json
   Size : 3096 bytes
   Path : vercel.json

📄 vite.config.ts
   Type : ts
   Size : 705 bytes
   Path : vite.config.ts

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
- Feature listing JSON: `src/features/feature-links.json`
- Feature page files: `src/features/pages/*.tsx`
- Timeline/Journey: `src/data/timelineData.ts`
- Links hub: `src/data/linksData.ts`
- FAQ: `src/data/faqData.ts`
- “Now” content: `src/data/nowData.ts`

These files are the fastest path for non-backend customization.

### 3) SEO, Domain, and Public Metadata

- Global/per-page SEO component: `src/components/SEO.tsx` — injects full OG + Twitter Card tags on every route
- Static baseline meta tags (OG + Twitter Card + JSON-LD) live in `index.html` — edit here for global fallback defaults
- App route registration: `src/App.tsx`
- Static crawler files:
  - `public/robots.txt`

### 4) How to Add a New Feature Page (Manual Flow)

1. Create a new TSX page file in `src/features/pages/` (copy any existing feature page format).
2. Add its card metadata (`title`, `summary`, `link`) to `src/features/feature-links.json`.
3. Add a lazy import in `src/App.tsx`.
4. Add a new `<Route path=\"/feature/<your-slug>\" element={<YourFeaturePage />} />` in `src/App.tsx`.
5. Ensure page includes the standard back-to-feature button (`/feature`) and SEO metadata block.
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

---

## ⚡ Offline Capabilities (PWA)
This portfolio features full offline capabilities via Service Workers. Vercel Serverless API responses are intelligently cached locally using a `StaleWhileRevalidate` strategy. Once loaded, the site and its dynamic data remain fully accessible without an internet connection on both mobile and desktop environments.
