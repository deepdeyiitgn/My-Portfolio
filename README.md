<div align="center">
  <img src="public/assets/images/myphoto.png" alt="Deep Dey Logo" width="120" height="120" style="border-radius: 50%; border: 2px solid #f59e0b;" />

  # 🌌 Deep Dey | Cinematic Portfolio & System Architecture

  **Software Architect | AI Prompt Engineer | JEE 2027 Aspirant**

  [![Deploy to Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](#)
  [![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Motion](https://img.shields.io/badge/Motion-12.x-0055FF?style=for-the-badge)](#)
  
  [![License](https://img.shields.io/badge/License-Custom%20Restricted%20%F0%9F%94%92-ef4444?style=for-the-badge)](./LICENSE)
  [![Contributing](https://img.shields.io/badge/Contributing-Guidelines-f59e0b?style=for-the-badge)](./CONTRIBUTING.md)
  [![Code of Conduct](https://img.shields.io/badge/Code_of_Conduct-Policy-8b5cf6?style=for-the-badge)](./CODE_OF_CONDUCT.md)
  [![Security](https://img.shields.io/badge/Security-Policy-ef4444?style=for-the-badge)](./SECURITY.md)
  [![Support](https://img.shields.io/badge/Support-Guide-0ea5e9?style=for-the-badge)](./SUPPORT.md)

  > *"100% effort + extra 1% = Dream Achieved"*

  [Live Production Build](https://deepdey.vercel.app) • [Contact Hub](https://deepdey.vercel.app/contact) • [My Link Ecosystem](https://deepdey.vercel.app/links)
</div>

---

## 📖 The Vision

Welcome to the central repository of my digital identity. This is not just a standard web portfolio; it is a **High-Fidelity Architectural Dashboard** built from scratch. It perfectly balances my 3 years of experience as a self-taught AI developer and my current intense academic focus as a Class 12 student targeting **IIT Kharagpur CSE (JEE Advanced 2027)**.

Designed with a custom **"Dark-Amber"** aesthetic (`zinc-950` backgrounds with `amber-500` glowing accents), this ecosystem is built for maximum performance, AAA-grade user experience, and future-proof scalability.

---

## 🎯 What This Project Is

This repository contains the full source code of Deep Dey’s personal portfolio platform. It is designed as:

- A **professional profile website** (About, Contact, Projects, FAQ, Legal pages).
- A **showcase engine** for project work, architecture thinking, and technical writing.
- A **smart routing hub** that guides different contact intents to the correct channel.
- A **single deployable React + Vite app** with static hosting support through Vercel.

In short: this project is a production portfolio + system-design themed personal brand platform.

---

## ⚡ Core Architecture & Engineering Feats

### 1. AAA Loading Engine
A cinematic loading experience featuring a realistic system-parsing progress bar and a rotating database of 50 architect/academic quotes. It masks the asynchronous loading of heavy 3D assets while keeping the user deeply engaged.

### 2. Kinetic 3D PDF Flipper
Bypassed standard, boring PDF iframes. Engineered a custom `react-pdf` viewer wrapped in a Framer Motion 3D physics engine (`rotateY`). Includes an A4 aspect-ratio lock, dynamic scaling (zoom in/out), and a fallback routing mechanism.

### 3. Advanced Contact Routing Matrix
A backend-less, smart intake dashboard. It dynamically routes inquiries to specific nodes based on a 15-category "Support Type" dropdown:
- `a@qlynk.me` (Platform bugs, Node Servers, APIs)
- `team.deepdey@gmail.com` (Architecture consultation, Collabs)
- `thedeeparise@gmail.com` (General outreach, Photography)

### 4. Data-Driven "Link-in-Bio" Engine
A highly scalable, JSON-driven ecosystem hub (`linksData.ts`). It maps 30+ internal/external nodes (Projects, Socials, Study Resources) with dynamic inline SVG injections that automatically adapt to the Dark-Amber theme. 

### 5. 120fps Cinematic Marquee
An infinitely scrolling, dual-directional "Film Roll" timeline. Fully GPU-accelerated (`will-change: transform`, `translate3d`) for zero-stutter performance, showcasing the duality of my coding milestones and academic journey.

### 6. Max-Level Technical SEO
Implemented `react-helmet-async` for deep, page-specific metadata injection. Features dynamic Canonical URLs, OpenGraph previews, and `Schema.org` JSON-LD data (Person, FAQPage, SoftwareApplication) for elite Google Search Indexing.

### 7. Future-Proof Temporal Logic
The vertical timeline component is self-aware. It actively scans the current system year (`new Date().getFullYear()`) and automatically applies a glowing "Live/Active" radar pulse to the milestone matching the current year (Extends to 2035).

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Engine** | `React 19` + `TypeScript` | Type-safe, component-driven UI architecture. |
| **Build Tool** | `Vite` | Lightning-fast HMR and optimized production bundling. |
| **Styling** | `Tailwind CSS v4` | Utility-first styling for the Dark-Amber glassmorphism aesthetic. |
| **Animation** | `Motion` | Physics-based animations, 3D flips, and scroll-triggered reveals. |
| **Routing** | `React Router DOM v7` | Seamless SPA navigation with wildcard 404 handling. |
| **Document Processing**| `react-pdf` | Client-side rendering of the architectural blueprint PDF. |
| **SEO & Meta** | `react-helmet-async` | Asynchronous head tag management for rich snippets. |
| **Hosting & Edge** | `Vercel` | Global CDN, CI/CD pipelines, and `vercel.json` SPA rewrites/308 redirects. |

---

## 📂 Project Structure

```text
📦 My-Portfolio
 ┣ 📜 README.md                 # Project overview and setup guide
 ┣ 📜 LICENSE                   # MIT license text
 ┣ 📜 SECURITY.md               # Vulnerability reporting policy
 ┣ 📜 CONTRIBUTING.md           # Contribution guidelines
 ┣ 📜 CONTRIBUTOR.md            # Contributor acknowledgement
 ┣ 📜 CODE_OF_CONDUCT.md        # Community behavior policy
 ┣ 📜 SUPPORT.md                # Help and support channels
 ┣ 📜 package.json              # Scripts and dependency definitions
 ┣ 📜 package-lock.json         # Locked dependency graph
 ┣ 📜 tsconfig.json             # TypeScript compiler configuration
 ┣ 📜 tailwind.config.js        # Tailwind customization
 ┣ 📜 vite.config.ts            # Vite build/dev configuration
 ┣ 📜 vercel.json               # Vercel routing and deploy config
 ┣ 📜 metadata.json             # Project metadata
 ┣ 📜 index.html                # Vite HTML entry template
 ┣ 📂 public                    # Static assets served as-is
 ┃ ┣ 📂 assets/docs             # Portfolio PDF/document assets
 ┃ ┣ 📂 assets/images           # Static images
 ┃ ┣ 📜 robots.txt              # Crawl directives
 ┃ ┗ 📜 sitemap.xml             # Search engine sitemap
 ┣ 📂 src
 ┃ ┣ 📂 components              # Reusable UI blocks
 ┃ ┃ ┣ 📜 ContactForm.tsx       # Contact form component
 ┃ ┃ ┣ 📜 FAQ.tsx               # FAQ accordion/search UI
 ┃ ┃ ┣ 📜 Footer.tsx            # Footer and legal quick links
 ┃ ┃ ┣ 📜 Header.tsx            # Primary navigation/header
 ┃ ┃ ┣ 📜 JourneyMarquee.tsx    # Animated timeline marquee
 ┃ ┃ ┣ 📜 Layout.tsx            # Shared page layout wrapper
 ┃ ┃ ┣ 📜 LoadingScreen.tsx     # Intro loading experience
 ┃ ┃ ┣ 📜 ProjectPlaceholder.tsx# Placeholder/fallback project card
 ┃ ┃ ┣ 📜 ScrollToTop.tsx       # Scroll reset on route change
 ┃ ┃ ┣ 📜 SEO.tsx               # Meta and SEO tag manager
 ┃ ┃ ┗ 📜 TechGalaxy.tsx        # Animated tech visual section
 ┃ ┣ 📂 data                    # Static data models/content
 ┃ ┃ ┣ 📜 faqData.ts            # FAQ dataset
 ┃ ┃ ┣ 📜 linksData.ts          # Links page dataset
 ┃ ┃ ┣ 📜 projectsData.ts       # Projects and details dataset
 ┃ ┃ ┗ 📜 timelineData.ts       # Timeline milestones dataset
 ┃ ┣ 📂 pages                   # Route-level pages
 ┃ ┃ ┣ 📜 About.tsx             # About/profile page
 ┃ ┃ ┣ 📜 Contact.tsx           # Contact and routing page
 ┃ ┃ ┣ 📜 Copyright.tsx         # Copyright policy page
 ┃ ┃ ┣ 📜 DMCA.tsx              # DMCA page
 ┃ ┃ ┣ 📜 FAQ.tsx               # FAQ route page
 ┃ ┃ ┣ 📜 Home.tsx              # Home/landing page
 ┃ ┃ ┣ 📜 LegalHub.tsx          # Legal index page
 ┃ ┃ ┣ 📜 Links.tsx             # Link hub page
 ┃ ┃ ┣ 📜 Me.tsx                # Personal/creative page
 ┃ ┃ ┣ 📜 NotFound.tsx          # 404 route page
 ┃ ┃ ┣ 📜 Portfolio.tsx         # PDF portfolio viewer page
 ┃ ┃ ┣ 📜 Privacy.tsx           # Privacy policy page
 ┃ ┃ ┣ 📜 ProjectDetail.tsx     # Individual project page
 ┃ ┃ ┣ 📜 Projects.tsx          # Projects listing page
 ┃ ┃ ┗ 📜 Terms.tsx             # Terms and conditions page
 ┃ ┣ 📜 App.tsx                 # Router + lazy loaded app shell
 ┃ ┣ 📜 index.css               # Global styles
 ┃ ┗ 📜 main.tsx                # React bootstrap entry
 ┣ 📂 .github
 ┃ ┣ 📂 ISSUE_TEMPLATE          # Structured issue templates
 ┃ ┗ 📜 pull_request_template.md # Pull request template
 ┗ 📂 dist                      # Production build output (generated)
```

---

## 🧭 Key Routes & Purpose

- `/` → Home + intro sections + timeline
- `/about` → Background, philosophy, and approach
- `/projects` and `/projects/:id` → Project list and deep-dive details
- `/portfolio` → PDF-based visual portfolio
- `/links` → Link-in-bio ecosystem
- `/contact` → Contact routing by inquiry category
- `/faq` → Frequently asked questions
- `/legal`, `/privacy`, `/terms`, `/dmca`, `/copyright` → Legal information pages

-----

## 🚀 Local Deployment & Development

To clone and run this architecture locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/deepdeyiitgn/My-Portfolio.git
    ```
2.  **Navigate into the directory:**
    ```bash
    cd My-Portfolio
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the local development server:**
    ```bash
    npm run dev
    ```
5.  **Build for production:**
    ```bash
    npm run build
    ```
6. **Run type checks (lint script):**
   ```bash
   npm run lint
   ```

-----

## ⏸️ The Academic Hiatus (System Notice)

**Effective Date: April 9, 2026**
All major software development projects (including DEQLYNK, QuickLink node servers, and active feature updates to Transparent Clock) are currently on a strict **Hiatus**.

My bandwidth is now 100% reallocated towards academic preparation for the **Joint Entrance Examination (JEE) Advanced 2027**. The immediate target is securing admission to **Computer Science Engineering at IIT Kharagpur**. Routine updates will resume post-examination.

-----

## ©️ Copyright & Licensing

**Designed & Architected by Deep Dey**
© 2020 - 2026 Deep Dey | All Rights Reserved.

The conceptual design, UI architecture, and custom components (like the Tech Galaxy and 3D Flipper) are the intellectual property of Deep Dey. Please reach out via the [Contact Hub](https://www.google.com/url?sa=E&source=gmail&q=https://deepdey.vercel.app/contact) for collaboration or architectural consultation post-2027.
