export interface ArticleItem {
  id: string;
  title: string;
  type: 'Build Log' | 'Engineering Journal' | 'JEE + Systems';
  date: string;
  summary: string;
  readMinutes: number;
}

export const contentData: ArticleItem[] = [
  {
    id: 'designing-high-signal-portfolio',
    title: 'Designing a High-Signal Portfolio System',
    type: 'Build Log',
    date: '2026-04-22',
    summary: 'How I restructured static pages into measurable case studies and proof layers — turning a personal site into a credibility machine.',
    readMinutes: 6,
  },
  {
    id: 'jee-discipline-as-engineering',
    title: 'JEE Discipline as an Engineering Framework',
    type: 'JEE + Systems',
    date: '2026-04-18',
    summary: 'Mapping consistency, constraints, and long-range planning from JEE preparation into software architecture and shipping cadence.',
    readMinutes: 5,
  },
  {
    id: 'from-mailto-to-lead-pipeline',
    title: 'From mailto to Structured Lead Pipeline',
    type: 'Engineering Journal',
    date: '2026-04-15',
    summary: 'Why contact forms need validation, anti-spam, priority routing, and response SLAs for serious developer collaboration.',
    readMinutes: 7,
  },
  {
    id: 'building-qlynk-url-shortener',
    title: 'Building qlynk.me — A Production URL Shortener',
    type: 'Build Log',
    date: '2026-04-10',
    summary: 'Architecture decisions behind a full-stack URL shortener: custom slugs, analytics tracking, rate limiting, and zero-downtime deploys.',
    readMinutes: 9,
  },
  {
    id: 'rate-limiting-without-redis',
    title: 'Rate Limiting Serverless APIs Without Redis',
    type: 'Engineering Journal',
    date: '2026-04-07',
    summary: 'Using in-memory maps on Vercel serverless functions for lightweight IP-based rate limiting — trade-offs, edge cases, and alternatives.',
    readMinutes: 5,
  },
  {
    id: 'transparent-clock-desktop-app',
    title: 'Shipping the Transparent Clock — Desktop Utility Design',
    type: 'Build Log',
    date: '2026-03-20',
    summary: 'From idea to distribution: building an always-on-top transparent clock app and the platform-specific challenges of shipping a desktop utility.',
    readMinutes: 6,
  },
  {
    id: 'jee-time-blocking-productivity',
    title: 'Time Blocking for JEE + Dev: A Dual-Track Schedule',
    type: 'JEE + Systems',
    date: '2026-03-10',
    summary: 'The exact schedule I use to balance 8-hour JEE prep sessions with weekly software shipping targets — without burning out on either side.',
    readMinutes: 4,
  },
  {
    id: 'vercel-serverless-cold-start',
    title: 'Understanding Vercel Serverless Cold Starts',
    type: 'Engineering Journal',
    date: '2026-03-01',
    summary: 'A deep dive into cold start latency, warm instance reuse, and strategies to keep API response times under 200ms on free-tier Vercel.',
    readMinutes: 7,
  },
  {
    id: 'react-vite-portfolio-architecture',
    title: 'Why I Chose React + Vite for a Static Portfolio',
    type: 'Build Log',
    date: '2026-02-20',
    summary: 'Comparing Next.js, Astro, and Vite+React for a developer portfolio: SEO, bundle size, deploy complexity, and long-term maintainability.',
    readMinutes: 6,
  },
  {
    id: 'problem-solving-jee-to-coding',
    title: 'How JEE Problem-Solving Sharpened My Debugging Instincts',
    type: 'JEE + Systems',
    date: '2026-02-12',
    summary: 'The mental models from JEE Physics and Maths — constraint analysis, reducing unknowns, working backwards — applied directly to debugging hard bugs.',
    readMinutes: 5,
  },
  {
    id: 'seo-for-developer-portfolios',
    title: 'Technical SEO for Developer Portfolios in 2026',
    type: 'Engineering Journal',
    date: '2026-02-05',
    summary: 'Meta tags, Open Graph, sitemap generation, semantic HTML, and Core Web Vitals — the complete SEO checklist for a high-signal developer portfolio.',
    readMinutes: 8,
  },
  {
    id: 'maintenance-mode-engineering',
    title: 'Engineering in Maintenance Mode — How to Stay Sharp',
    type: 'Build Log',
    date: '2026-01-20',
    summary: 'What it looks like to run a software project in low-energy maintenance mode: minimal deploys, documentation-first, and avoiding technical debt accumulation.',
    readMinutes: 5,
  },
  {
    id: 'typescript-strict-mode-portfolio',
    title: 'Going Strict: TypeScript in a Real Portfolio Codebase',
    type: 'Engineering Journal',
    date: '2026-01-10',
    summary: 'Enabling strict mode in TypeScript mid-project: what broke, what it caught, and why strict null checks are non-negotiable in production code.',
    readMinutes: 6,
  },
  {
    id: 'jee-systems-thinking-algorithms',
    title: 'Systems Thinking from JEE: Algorithms and Data Structures',
    type: 'JEE + Systems',
    date: '2025-12-28',
    summary: 'How studying JEE Maths deeply — combinatorics, probability, sequences — builds the intuition needed for algorithm design and complexity analysis.',
    readMinutes: 7,
  },
  {
    id: 'tailwind-design-system-portfolio',
    title: 'Building a Design System with Tailwind CSS',
    type: 'Build Log',
    date: '2025-12-15',
    summary: 'How I used Tailwind utilities to create a consistent dark-mode design language across 15+ pages without a single line of custom CSS.',
    readMinutes: 5,
  },
];
