<div align="center">
  <img src="public/assets/images/myphoto.png" alt="Deep Dey Logo" width="120" height="120" style="border-radius: 50%; border: 2px solid #f59e0b;" />

  # 🌌 Deep Dey | Cinematic Portfolio & System Architecture

  **Software Architect | AI Prompt Engineer | JEE 2027 Aspirant**

  [![Deploy to Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](#)
  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-0055FF?style=for-the-badge&logo=framer&logoColor=white)](#)

  > *"100% effort + extra 1% = Dream Achieved"*

  [Live Production Build](https://justdeepdey.vercel.app) • [Contact Hub](https://justdeepdey.vercel.app/contact) • [My Link Ecosystem](https://justdeepdey.vercel.app/links)
</div>

---

## 📖 The Vision

Welcome to the central repository of my digital identity. This is not just a standard web portfolio; it is a **High-Fidelity Architectural Dashboard** built from scratch. It perfectly balances my 3 years of experience as a self-taught AI developer and my current intense academic focus as a Class 12 student targeting **IIT Kharagpur CSE (JEE Advanced 2027)**.

Designed with a custom **"Dark-Amber"** aesthetic (`zinc-950` backgrounds with `amber-500` glowing accents), this ecosystem is built for maximum performance, AAA-grade user experience, and future-proof scalability.

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
| **Core Engine** | `React 18` + `TypeScript` | Type-safe, component-driven UI architecture. |
| **Build Tool** | `Vite` | Lightning-fast HMR and optimized production bundling. |
| **Styling** | `Tailwind CSS v3` | Utility-first styling for the Dark-Amber glassmorphism aesthetic. |
| **Animation** | `Framer Motion` | Physics-based animations, 3D flips, and scroll-triggered reveals. |
| **Routing** | `React Router DOM v6` | Seamless SPA navigation with wildcard 404 handling. |
| **Document Processing**| `react-pdf` | Client-side rendering of the architectural blueprint PDF. |
| **SEO & Meta** | `react-helmet-async` | Asynchronous head tag management for rich snippets. |
| **Hosting & Edge** | `Vercel` | Global CDN, CI/CD pipelines, and `vercel.json` SPA rewrites/308 redirects. |

---

## 📂 Project Structure

```text
📦 src
 ┣ 📂 components        # Reusable UI Blocks
 ┃ ┣ 📜 ContactForm.tsx # Legacy form (migrated)
 ┃ ┣ 📜 FAQ.tsx         # Searchable knowledge base
 ┃ ┣ 📜 Footer.tsx      # Dynamic temporal footer
 ┃ ┣ 📜 Header.tsx      # Mobile-responsive smart nav
 ┃ ┣ 📜 JourneyMarquee  # 120fps infinite film roll
 ┃ ┣ 📜 Layout.tsx      # App shell wrapper
 ┃ ┣ 📜 LoadingScreen   # AAA quote-rotating loader
 ┃ ┣ 📜 ProjectPlaceholder # CSS-only aesthetic fallback
 ┃ ┣ 📜 SEO.tsx         # Helmet meta-tag engine
 ┃ ┗ 📜 TechGalaxy.tsx  # Interactive floating SVG node ecosystem
 ┣ 📂 data              # JSON Architecture (Data-Driven Logic)
 ┃ ┣ 📜 faqData.ts      # 10+ Deep Q&A mapping
 ┃ ┣ 📜 linksData.ts    # Massive Linktree ecosystem
 ┃ ┣ 📜 projectsData.ts # Blueprint details (QuickLink, Transparent Clock)
 ┃ ┗ 📜 timelineData.ts # 2020-2035 self-updating milestones
 ┣ 📂 pages             # Application Routes
 ┃ ┣ 📜 About.tsx       # Cinematic Biography & Methodology
 ┃ ┣ 📜 Contact.tsx     # The Smart Intake Dashboard
 ┃ ┣ 📜 FAQ.tsx         # Advanced Search Page
 ┃ ┣ 📜 Home.tsx        # Hero, Marquee & Timeline
 ┃ ┣ 📜 Links.tsx       # The Custom qlynk.me Hub
 ┃ ┣ 📜 Me.tsx          # Photography & Personal Vision
 ┃ ┣ 📜 NotFound.tsx    # 404 System Error State
 ┃ ┣ 📜 Portfolio.tsx   # 3D Kinetic PDF Flipper
 ┃ ┣ 📜 ProjectDetail   # Deep-dive specs & Hiatus alerts
 ┃ ┗ 📜 Projects.tsx    # App Ecosystem Grid
 ┣ 📜 App.tsx           # Suspense/Lazy Loading Router
 ┣ 📜 index.css         # Global utilities & scrollbar hiding
 ┗ 📜 main.tsx          # React DOM entry & HelmetProvider
````

-----

## 🚀 Local Deployment & Development

To clone and run this architecture locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/deepdeyiitgn/My-Portfolio.git](https://github.com/deepdeyiitgn/My-Portfolio.git)
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

-----

## ⏸️ The Academic Hiatus (System Notice)

**Effective Date: April 9, 2026**
All major software development projects (including DEQLYNK, QuickLink node servers, and active feature updates to Transparent Clock) are currently on a strict **Hiatus**.

My bandwidth is now 100% reallocated towards academic preparation for the **Joint Entrance Examination (JEE) Advanced 2027**. The immediate target is securing admission to **Computer Science Engineering at IIT Kharagpur**. Routine updates will resume post-examination.

-----

## ©️ Copyright & Licensing

**Designed & Architected by Deep Dey**
© 2020 - 2026 Deep Dey | All Rights Reserved.

The conceptual design, UI architecture, and custom components (like the Tech Galaxy and 3D Flipper) are the intellectual property of Deep Dey. Please reach out via the [Contact Hub](https://www.google.com/url?sa=E&source=gmail&q=https://justdeepdey.vercel.app/contact) for collaboration or architectural consultation post-2027.