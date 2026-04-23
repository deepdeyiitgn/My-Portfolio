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

## 🎯 Feature Highlights

### 🎬 Cinematic Loading Engine
A system-parsing intro screen with a live progress bar and 50-quote rotating archive. Masks lazy-loaded asset hydration with an AAA-grade first impression.

### �� Kinetic 3D PDF Portfolio Viewer
Custom `react-pdf` viewer wrapped in a Motion 3D physics engine (`rotateY`). Includes A4 aspect-ratio lock, zoom controls, and an external-URL fallback chain.

### 📬 Smart Contact Routing Matrix
Backend-less intelligent intake. Routes 15 inquiry categories to the right email node with pre-filled mailto tickets and auto-generated ticket IDs.

### �� Journal CMS with Embed Support
Full markdown journal system backed by MongoDB. Features per-visit view counting, one-like-per-session enforcement, native share API, image galleries, and embeddable iframe output (`/journal/embed/:id`).

### 📺 YouTube Live Hub
Auto-loads the current live stream. Sidebar shows all channel content filtered by **All / Stream / Video / Shorts** tabs with newest-first sorting, views count, and Prev/Next pagination (20 per page).

### 🖼️ CDN Image Upload (Dashboard)
Owner-only dashboard uploads images to `static.qlynk.me` via `/api/upload-image` proxy. Supports file picker, drag-and-drop, clipboard paste, and URL links — one image at a time, unlimited per post.

### 🌐 Data-Driven Link-in-Bio Engine
A JSON-driven hub mapping 30+ internal/external nodes with dynamic inline SVG icons that auto-adapt to the Dark-Amber theme.

### ⏱️ Self-Aware Timeline
The milestone timeline uses `new Date().getFullYear()` to auto-highlight the current active phase with a glowing amber radar pulse (extends to 2035).

### 🔍 Max-Level SEO
`react-helmet-async` drives per-route metadata injection: Canonical URLs, OpenGraph/Twitter cards, and `Schema.org` JSON-LD (Person, FAQPage, SoftwareApplication).

### 🌍 12-Language i18n
Full UI translated across EN · BN · HI · ES · FR · DE · AR · RU · PT · JA · KO · ZH via a custom React Context provider.

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
| **PDF Renderer** | react-pdf | `9.x` | Client-side A4 portfolio document renderer |
| **SEO** | react-helmet-async | `2.x` | Async head tag injection for rich snippets |
| **Database** | MongoDB Atlas | — | Journal and category persistence |
| **CDN / Storage** | static.qlynk.me | — | Proxied secure image upload and hosting |
| **Hosting** | Vercel | — | Global edge CDN, CI/CD, SPA rewrites |

---

## 📂 Project Structure

```text
📦 My-Portfolio
 ┣ 📜 README.md                  # You are here
 ┣ 📜 LICENSE                    # Custom Restricted (View-Only) license
 ┣ 📜 SECURITY.md                # Vulnerability reporting policy
 ┣ 📜 CONTRIBUTING.md            # Contribution guidelines
 ┣ 📜 CONTRIBUTOR.md             # Contributor acknowledgements
 ┣ 📜 CODE_OF_CONDUCT.md         # Community behavior standards
 ┣ 📜 SUPPORT.md                 # Support channels
 ┣ 📜 package.json               # Scripts and dependency manifest
 ┣ 📜 tsconfig.json              # TypeScript compiler configuration
 ┣ 📜 tailwind.config.js         # Tailwind theme customization
 ┣ 📜 vite.config.ts             # Vite build and dev configuration
 ┣ 📜 vercel.json                # Vercel routing rules and redirects
 ┣ 📜 metadata.json              # Repository metadata
 ┣ 📜 index.html                 # Vite HTML entry point
 ┣ 📂 api                        # Vercel serverless API routes
 ┃ ┣ 📜 auth.js                  # Session authentication handler
 ┃ ┣ 📜 categories.js            # Journal category CRUD
 ┃ ┣ 📜 contact.js               # Contact form handler
 ┃ ┣ 📜 faqs.js                  # FAQ data endpoint
 ┃ ┣ 📜 journal.js               # Journal CRUD + views/likes
 ┃ ┣ 📜 links.js                 # Links data endpoint
 ┃ ┣ 📜 live.js                  # YouTube RSS feed parser
 ┃ ┗ 📜 upload-image.js          # CDN image upload proxy
 ┣ 📂 public                     # Static assets (served as-is)
 ┃ ┣ 📂 assets/docs              # Portfolio PDF documents
 ┃ ┣ 📂 assets/images            # Static image files
 ┃ ┣ 📜 robots.txt               # Crawl directives
 ┃ ┗ 📜 sitemap.xml              # XML sitemap
 ┣ 📂 src
 ┃ ┣ 📂 components               # Reusable UI components
 ┃ ┃ ┣ 📜 Footer.tsx             # Global footer with legal links
 ┃ ┃ ┣ 📜 Header.tsx             # Responsive navigation header
 ┃ ┃ ┣ 📜 JourneyMarquee.tsx     # GPU-accelerated timeline marquee
 ┃ ┃ ┣ 📜 Layout.tsx             # Page layout wrapper (skips for embeds)
 ┃ ┃ ┣ �� LoadingScreen.tsx      # Cinematic intro loading screen
 ┃ ┃ ┣ 📜 SEO.tsx                # JSON-LD + OpenGraph meta manager
 ┃ ┃ ┗ 📜 TechGalaxy.tsx         # Animated tech stack visual
 ┃ ┣ 📂 context
 ┃ ┃ ┗ 📜 LanguageContext.tsx    # 12-language i18n context provider
 ┃ ┣ 📂 data                     # Static typed data models
 ┃ ┃ ┣ 📜 faqData.ts             # FAQ questions and answers
 ┃ ┃ ┣ 📜 linksData.ts           # Link hub node definitions
 ┃ ┃ ┣ 📜 projectsData.ts        # Project cards and detail data
 ┃ ┃ ┗ 📜 timelineData.ts        # Life milestone timeline data
 ┃ ┣ 📂 pages                    # Route-level page components
 ┃ ┃ ┣ 📜 About.tsx              # About / philosophy page
 ┃ ┃ ┣ 📜 Contact.tsx            # Smart contact routing page
 ┃ ┃ ┣ 📜 Dashboard.tsx          # Owner-only CMS dashboard
 ┃ ┃ ┣ 📜 Home.tsx               # Hero / landing page
 ┃ ┃ ┣ 📜 Journal.tsx            # Journal listing page
 ┃ ┃ ┣ 📜 JournalEmbed.tsx       # Embeddable journal (no chrome)
 ┃ ┃ ┣ 📜 JournalView.tsx        # Full journal detail page
 ┃ ┃ ┣ 📜 Live.tsx               # YouTube Live & video hub
 ┃ ┃ ┣ 📜 Me.tsx                 # Personal / creative profile
 ┃ ┃ ┣ 📜 Now.tsx                # "What I'm doing now" page
 ┃ ┃ ┣ 📜 Portfolio.tsx          # 3D PDF portfolio viewer
 ┃ ┃ ┣ 📜 Projects.tsx           # Projects listing
 ┃ ┃ ┣ 📜 ProjectDetail.tsx      # Individual project deep-dive
 ┃ ┃ ┣ 📜 Proof.tsx              # Proof of work page
 ┃ ┃ ┗ 📜 NotFound.tsx           # 404 fallback page
 ┃ ┣ 📜 App.tsx                  # Root router + animated routes
 ┃ ┣ 📜 index.css                # Global CSS + Tailwind directives
 ┃ ┗ 📜 main.tsx                 # React application entry point
 ┣ 📂 .github
 ┃ ┣ 📂 ISSUE_TEMPLATE           # Structured GitHub issue templates
 ┃ ┣ 📜 CODEOWNERS               # Code ownership declarations
 ┃ ┣ 📜 FUNDING.yml              # Sponsorship links
 ┃ ┗ 📜 pull_request_template.md # Standardized PR template
 ┗ 📂 dist                       # Production build output (git-ignored)
```

---

## 🧭 Routes Reference

| Route | Description |
| :--- | :--- |
| `/` | Hero landing page with timeline and CTA sections |
| `/about` | Background, philosophy, and approach |
| `/me` | Personal creative profile and current status |
| `/now` | What I'm working on right now |
| `/projects` | Full project listing grid |
| `/projects/:id` | Individual project deep-dive detail |
| `/portfolio` | 3D PDF architectural blueprint viewer |
| `/proof` | Proof of work and achievements |
| `/links` | Link-in-bio ecosystem hub (30+ nodes) |
| `/contact` | Smart 15-category contact routing form |
| `/journal` | Journal listing with metadata (likes, views, read time) |
| `/journal/view/:id` | Full journal article with engagement actions |
| `/journal/embed/:id` | Embeddable iframe view (no header/footer) |
| `/live` | YouTube live stream + All/Stream/Video/Shorts hub |
| `/faq` | Searchable FAQ with accordion interface |
| `/dashboard` | Owner-only content management dashboard |
| `/legal` | Legal hub index |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/dmca` | DMCA takedown policy |
| `/copyright` | Copyright information |

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
```

> **Note:** The app runs in read-only mode without these variables. Journal CRUD and image upload require valid credentials.

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
