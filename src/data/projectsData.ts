export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  liveUrl: string;
  githubUrl?: string;
  logoUrl: string;
  category: string;
}

export const projectsData: Project[] = [
  {
    id: 'quicklink',
    title: 'QuickLink',
    shortDescription: 'Enterprise-grade SaaS URL shortening and productivity platform.',
    fullDescription: 'QuickLink is an all-in-one web platform designed to simplify link sharing through URL shortening, QR code generation, and productivity tools. The project focuses on high performance, clean UI, security, and SEO visibility. It includes features like custom alias support, browser-based QR tools, and a Pomodoro focus tracker.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'SEO Optimization', 'Frontend UI/UX'],
    liveUrl: 'https://qlynk.vercel.app/',
    githubUrl: 'https://github.com/deepdeyiitgn',
    logoUrl: 'https://qlynk.vercel.app/quicklink-logo.svg',
    category: 'SaaS / Productivity',
  },
  {
    id: 'studybot',
    title: 'StudyBot',
    shortDescription: 'Focus & Productivity Discord Bot for student communities.',
    fullDescription: 'StudyBot is a modular Discord bot built to help students stay focused and consistent. It provides study utilities, reminders, streak tracking, and interactive commands to support disciplined study habits. Features include AI-assisted study support and hybrid command systems (slash + prefix).',
    techStack: ['Node.js', 'Discord.js', 'Automation', 'Feature Planning'],
    liveUrl: 'https://studybots.vercel.app/',
    githubUrl: 'https://github.com/deepdeyiitgn',
    logoUrl: 'https://qlynk.vercel.app/quicklink-logo.svg',
    category: 'Automation / Discord',
  },
  {
    id: 'transparent-clock',
    title: 'Transparent Clock',
    shortDescription: 'A highly customizable Windows desktop overlay for focus tracking.',
    fullDescription: 'A privacy-first, completely offline Windows desktop application designed for students and creators. It provides a transparent clock overlay that stays on top of other windows, bundled with productivity tools like a dedicated Pomodoro timer and deep analytics with 24-hour heatmaps.',
    techStack: ['C#', '.NET', 'Windows SDK', 'JSON Storage', 'Inno Setup'],
    liveUrl: 'https://qlynk-clock.vercel.app/',
    githubUrl: 'https://github.com/deepdeyiitgn/Clock-Overlays',
    logoUrl: 'https://clock.qlynk.me/assets/images/logo.png',
    category: 'Windows Utility',
  },
  {
    id: 'qlynk-node-server',
    title: 'QLYNK Node Server',
    shortDescription: 'Highly secure private cloud storage and streaming datacenter.',
    fullDescription: 'Engineered to run entirely on Hugging Face Spaces (Free Tier), it acts as a self-sustaining media vault with an integrated Telegram ingestion bot, dynamic anti-hacker defenses (Tarpit/Honeypot), and a cinematic web player with cryptographic token vault security.',
    techStack: ['Python', 'FastAPI', 'Docker', 'Hugging Face Spaces', 'Cryptographic Security'],
    liveUrl: 'https://deydeep-deqlynk.hf.space/',
    githubUrl: 'https://github.com/deepdeyiitgn/static-files',
    logoUrl: 'https://qlynk.vercel.app/quicklink-logo.svg',
    category: 'Cloud Storage / CDN',
  },
];
