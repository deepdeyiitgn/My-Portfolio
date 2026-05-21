import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, Lightbulb, GraduationCap, ArrowRight, Zap, History, Milestone, Lock, Activity, BookOpen, Heart, Eye, Clock, Tag, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import TechGalaxy from '../components/TechGalaxy';
import JourneyMarquee from '../components/JourneyMarquee';
import SEO from '../components/SEO';
import { timelineData, type TimelineItem } from '../data/timelineData';
import { projectsData } from '../data/projectsData';
import SocialProof from '../components/SocialProof';
import { useLanguage } from '../context/LanguageContext';
import { renderIcon } from '../utils/iconMap';

interface TopJournal {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  categoryName: string;
  readMinutes: number;
  likes: number;
  views: number;
  publishedAt: string | null;
  publishedAtIST: string | null;
}

interface HomeCountdownContent {
  heading: string;
  quote: string;
  targetDate: number | null;
  quotes: string[];
  quoteStartDate: number;
}

interface CountdownBorderTheme {
  gradient: string;
  accent: string;
  glow: string;
}

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProgressState {
  percentage: number;
  remainingMs: number;
}

const DEFAULT_HOME_COUNTDOWN_TARGET = new Date('June 30, 2027 23:59:59').getTime();
const DEFAULT_HOME_COUNTDOWN_QUOTE_START = new Date('2025-03-31').getTime();
const DEFAULT_HOME_COUNTDOWN_QUOTES = ['Dream big, work hard, stay focused.'];

const extractDateLiteral = (source: string, variableName: string) => {
  const match = source.match(new RegExp(`(?:const|let|var)\\s+${variableName}\\s*=\\s*new Date\\("([^"]+)"\\)`, 'm'));
  return match?.[1] || null;
};

const extractQuotes = (source: string) => {
  const match = source.match(/(?:const|let|var)\s+quotes\s*=\s*\[([\s\S]*?)\];/m);
  if (!match) return null;

  try {
    const parsed = JSON.parse(`[${match[1]}]`);
    return Array.isArray(parsed) ? parsed.filter((quote): quote is string => typeof quote === 'string') : null;
  } catch {
    return null;
  }
};

const normalizeToDayStart = (value: number) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const getCountdownDayIndex = (startDate: number) => {
  const today = normalizeToDayStart(Date.now());
  const safeStartDate = normalizeToDayStart(startDate);
  return Math.max(Math.floor((today - safeStartDate) / (1000 * 60 * 60 * 24)), 0);
};

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const s = saturation / 100;
  const l = lightness / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return `rgba(245, 158, 11, ${alpha})`;

  const numericValue = Number.parseInt(normalized, 16);
  const red = (numericValue >> 16) & 255;
  const green = (numericValue >> 8) & 255;
  const blue = numericValue & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const buildCountdownTheme = (dayIndex: number): CountdownBorderTheme => {
  const baseHue = (dayIndex * 41) % 360;
  const accent = hslToHex(baseHue, 88, 62);
  const midTone = hslToHex((baseHue + 74) % 360, 84, 58);
  const endTone = hslToHex((baseHue + 148) % 360, 82, 60);

  return {
    gradient: `linear-gradient(135deg, ${accent}, ${midTone}, ${endTone})`,
    accent,
    glow: hexToRgba(midTone, 0.35),
  };
};

export default function Home() {
  const [isHoverable, setIsHoverable] = useState(true);
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const [topJournals, setTopJournals] = useState<TopJournal[]>([]);
  const [homeCountdown, setHomeCountdown] = useState<HomeCountdownContent>({
    heading: 'JEE 2027 Ke Liye Time Hai...',
    quote: 'Dream big, work hard, stay focused.',
    targetDate: null,
    quotes: DEFAULT_HOME_COUNTDOWN_QUOTES,
    quoteStartDate: DEFAULT_HOME_COUNTDOWN_QUOTE_START,
  });
  const [countdownParts, setCountdownParts] = useState<CountdownParts | null>(null);
  const [countdownProgress, setCountdownProgress] = useState<CountdownProgressState>({ percentage: 0, remainingMs: 0 });
  const [countdownTheme, setCountdownTheme] = useState<CountdownBorderTheme>(() => buildCountdownTheme(getCountdownDayIndex(DEFAULT_HOME_COUNTDOWN_QUOTE_START)));

  // Timeline — default is local data; replaced with MongoDB items when mode='custom'
  const [activeTimeline, setActiveTimeline] = useState<TimelineItem[]>(timelineData);
  const infiniteProjectItems = useMemo(() => [...projectsData, ...projectsData], []);

  useEffect(() => {
    // Detect if device has a precise pointing device (mouse)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsHoverable(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHoverable(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch timeline mode & custom items on mount
  useEffect(() => {
    fetch('/api/timeline')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.mode === 'custom' && Array.isArray(d.items) && d.items.length > 0) {
          const converted: TimelineItem[] = d.items.map(
            (item: { _id: string; year: number; dateStr: string; title: string; school: string; description: string; iconName: string; iconSize: number }, idx: number) => ({
              id: idx + 1,
              year: item.year,
              dateStr: item.dateStr,
              title: item.title,
              school: item.school,
              description: item.description,
              icon: renderIcon(item.iconName, item.iconSize),
            })
          );
          setActiveTimeline(converted);
        }
        // If default mode or fetch empty → keep local timelineData
      })
      .catch(() => { /* keep default */ });
  }, []);

  // Fetch top 6 most-liked journals for home page section
  useEffect(() => {
    fetch('/api/journal?action=top-journals&limit=6')
      .then(r => r.json())
      .then(d => { if (d.ok && Array.isArray(d.journals)) setTopJournals(d.journals); })
      .catch(() => {});
  }, []);

  // Load countdown content from public/countdown.html and render natively (no iframe)
  useEffect(() => {
    fetch('/countdown.html')
      .then((response) => response.text())
      .then((htmlText) => {
        const documentFromHtml = new DOMParser().parseFromString(htmlText, 'text/html');
        const heading = documentFromHtml.getElementById('heading')?.textContent?.trim() || 'JEE 2027 Ke Liye Time Hai...';
        const scriptContent = Array.from(documentFromHtml.querySelectorAll('script'))
          .map((script) => script.textContent || '')
          .join('\n');

        const targetDateSource = extractDateLiteral(scriptContent, 'targetDate');
        const quoteStartDateSource = extractDateLiteral(scriptContent, 'startDate');
        const parsedQuotes = extractQuotes(scriptContent) || DEFAULT_HOME_COUNTDOWN_QUOTES;
        const parsedTargetDate = targetDateSource
          ? new Date(targetDateSource).getTime()
          : DEFAULT_HOME_COUNTDOWN_TARGET;
        const parsedQuoteStartDate = quoteStartDateSource
          ? new Date(quoteStartDateSource).getTime()
          : DEFAULT_HOME_COUNTDOWN_QUOTE_START;

        setHomeCountdown({
          heading,
          quote: parsedQuotes[0] || DEFAULT_HOME_COUNTDOWN_QUOTES[0],
          targetDate: parsedTargetDate && !Number.isNaN(parsedTargetDate) ? parsedTargetDate : DEFAULT_HOME_COUNTDOWN_TARGET,
          quotes: parsedQuotes,
          quoteStartDate: parsedQuoteStartDate && !Number.isNaN(parsedQuoteStartDate) ? parsedQuoteStartDate : DEFAULT_HOME_COUNTDOWN_QUOTE_START,
        });
      })
      .catch(() => {
        setHomeCountdown((previous) => ({
          ...previous,
          targetDate: DEFAULT_HOME_COUNTDOWN_TARGET,
        }));
      });
  }, []);

  useEffect(() => {
    if (!homeCountdown.quotes.length) return;

    const applyDailyCountdownContent = () => {
      const dayIndex = getCountdownDayIndex(homeCountdown.quoteStartDate);
      const nextQuote = homeCountdown.quotes[dayIndex % homeCountdown.quotes.length] || DEFAULT_HOME_COUNTDOWN_QUOTES[0];
      const nextTheme = buildCountdownTheme(dayIndex);

      setHomeCountdown((previous) => (previous.quote === nextQuote ? previous : { ...previous, quote: nextQuote }));
      setCountdownTheme((previous) => (
        previous.gradient === nextTheme.gradient && previous.accent === nextTheme.accent && previous.glow === nextTheme.glow
          ? previous
          : nextTheme
      ));
    };

    applyDailyCountdownContent();
    const intervalId = window.setInterval(applyDailyCountdownContent, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [homeCountdown.quoteStartDate, homeCountdown.quotes]);

  useEffect(() => {
    if (!homeCountdown.targetDate) {
      setCountdownParts(null);
      return;
    }
    const targetDate = homeCountdown.targetDate;

    const updateCountdown = () => {
      const distance = targetDate - Date.now();
      const safeDistance = Math.max(distance, 0);
      const effectiveStartDate = Math.min(homeCountdown.quoteStartDate || Date.now(), targetDate - 1);
      const totalDuration = Math.max(targetDate - effectiveStartDate, 1);
      const rawPercentage = (safeDistance / totalDuration) * 100;
      const days = Math.floor(safeDistance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((safeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((safeDistance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((safeDistance % (1000 * 60)) / 1000);

      setCountdownParts({ days, hours, minutes, seconds });
      setCountdownProgress({
        percentage: Number(Math.max(0, Math.min(100, rawPercentage)).toFixed(1)),
        remainingMs: safeDistance,
      });
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [homeCountdown.quoteStartDate, homeCountdown.targetDate]);

  return (
    <div className="space-y-32 mb-20 overflow-hidden">
      <SEO 
        title="Deep Dey | Software Architect & JEE 2027 Aspirant"
        description="Official portfolio of Deep Dey. Software Architect specializing in AI prompting, system thinking, and web development. Targeting IIT Kharagpur CSE Class of 2031."
        keywords="Deep Dey, Software Architect, JEE Aspirant, AI Prompt Engineer, IIT Kharagpur CSE target, Web Developer Tripura, Dharmanagar"
        route="/"
        schema={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Deep Dey",
          "url": "https://deepdey.vercel.app",
          "image": "https://deepdey.vercel.app/assets/images/myphoto.png",
          "jobTitle": "Software Architect",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dharmanagar",
            "addressRegion": "Tripura",
            "addressCountry": "India"
          },
          "alumniOf": "IIT Kharagpur",
          "description": "Software Architect and JEE 2027 Aspirant specializing in AI-integrated systems."
        }}
      />
      {/* Hero Section */}
      <section className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-amber-500 font-mono tracking-widest text-sm uppercase">Welcome to my world</h2>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-none">
              DEEP <br /> DEY.
            </h1>
          </div>
          
          <div className="space-y-4">
            <p className="text-2xl md:text-3xl text-zinc-400 font-light tracking-tight">
              Software Architect & <br />
              <span className="text-amber-500 font-medium">JEE 2027 Aspirant</span>
            </p>
            <p className="text-zinc-500 max-w-md leading-relaxed">
              Targeting <span className="text-zinc-300 font-medium">IIT KGP CSE</span>. 
              Engineering solutions with code while preparing for the elite path.
            </p>
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center space-x-3">
              <Lightbulb className="text-amber-500" size={24} />
              <p className="text-xs text-zinc-400 max-w-[150px]">
                "100% effort + extra 1% = Dream Achieved."
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.4 }}
          className="relative group max-w-[500px] mx-auto"
        >
          <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-amber-500/30 aspect-square max-w-[450px] mx-auto shadow-2xl">
            <motion.img
              src="/assets/images/myphoto.png"
              alt="Deep Dey"
              className="w-full h-full object-cover transition-all duration-700"
              initial={{ filter: "grayscale(100%)" }}
              whileHover={isHoverable ? { filter: "grayscale(0%)", scale: 1.05 } : {}}
              whileInView={!isHoverable ? { filter: "grayscale(0%)" } : {}}
              viewport={{ once: false, amount: 0.5 }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://qlynk.vercel.app/wiki-images/Deep_Dey_portrait_2025.png";
              }}
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-amber-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg transform -rotate-12">
            IIT KGP 2027
          </div>
        </motion.div>
      </section>

      {/* Tech Galaxy Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <TechGalaxy />
      </motion.section>

      {/* Infinite Journey Marquee */}
      <section className="py-10 border-y border-zinc-900 bg-zinc-950/20">
        <JourneyMarquee />
      </section>

      {/* ── Projects Horizontal Showcase ───────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Projects</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">BUILT SYSTEMS.</h3>
              <p className="text-zinc-500 max-w-xl text-sm">
                Explore practical projects in a quick horizontal feed before opening the full projects page.
              </p>
            </div>
            <Link
              to="/projects"
              className="shrink-0 px-6 py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 text-xs flex items-center gap-2"
            >
              All Projects <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/40">
            <style>{`@keyframes ddProjectsInfinite { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
            <div
              className="flex gap-5 w-max px-5 py-5"
              style={{
                animation: 'ddProjectsInfinite 80s linear infinite',
              }}
            >
            {infiniteProjectItems.map((project, index) => (
              <motion.article
                key={`${project.id}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % projectsData.length) * 0.05 }}
                className="group min-w-[280px] md:min-w-[340px] snap-start p-6 rounded-3xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-amber-500/30 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 bg-zinc-950 rounded-2xl border border-zinc-800 p-2 overflow-hidden flex items-center justify-center">
                    <img src={project.logoUrl} alt={project.title} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">
                    {project.category}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">{project.title}</h4>
                <p className="text-zinc-400 text-sm line-clamp-3">{project.shortDescription}</p>
                <div className="flex items-center justify-between pt-2">
                  <Link to={`/projects/${project.id}`} className="text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors">
                    View More
                  </Link>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors"
                  >
                    Live
                  </a>
                </div>
              </motion.article>
            ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 border border-amber-500/30 text-amber-500 text-sm font-bold rounded-2xl hover:bg-amber-500/10 transition-colors"
            >
              Go to Projects Page <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-4xl mx-auto px-6 relative"
      >
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase italic">The Origin Timeline</h2>
          <div className="h-1.5 w-32 bg-amber-500 mx-auto rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] pt-4">Milestones & Pivot Points</p>
        </div>

        <div className="absolute left-1/2 md:left-1/2 w-0.5 bg-zinc-900 h-full -translate-x-1/2 z-0 hidden md:block opacity-50"></div>

        <div className="space-y-24">
          {activeTimeline.map((item, index) => {
            const isActive = currentYear === item.year;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`relative flex items-center justify-between w-full z-10 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                } flex-col`}
              >
                <div className="hidden md:block w-5/12"></div>
                
                <div className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-zinc-950 border-2 rounded-full z-20 hidden md:block ${
                  isActive ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse' : 'border-zinc-800'
                }`}></div>
                
                <div className={`w-full md:w-5/12 p-10 bg-zinc-900/30 border rounded-[2.5rem] backdrop-blur-md transition-all group group relative ${
                  isActive 
                    ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-zinc-900/50' 
                    : 'border-zinc-800/50 hover:border-amber-500/30'
                }`}>
                   {/* Date Badge */}
                  <div className={`absolute -top-4 left-8 px-4 py-1.5 font-black text-[10px] rounded-lg shadow-xl transform -rotate-1 z-30 transition-colors ${
                    isActive ? 'bg-amber-500 text-black shadow-amber-500/30' : 'bg-zinc-800 text-zinc-400 shadow-black'
                  }`}>
                    {item.dateStr}
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 bg-zinc-950 border rounded-2xl transition-transform group-hover:scale-110 ${
                      isActive ? 'border-amber-500 text-amber-500' : 'border-zinc-800 text-zinc-500'
                    }`}>
                      {item.icon}
                    </div>
                    <h3 className={`text-2xl font-bold tracking-tight transition-colors ${
                      isActive ? 'text-amber-500' : 'text-white group-hover:text-amber-500'
                    }`}>{item.title}</h3>
                  </div>
                  
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800/50 pb-2 flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-zinc-800'}`}></span>
                     {item.school}
                  </p>
                  <p className="text-zinc-400 font-light leading-relaxed text-sm">{item.description}</p>
                  
                  {isActive && (
                    <div className="absolute top-4 right-8 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-amber-500/80">Active Phase</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Journal Spotlight Section ─────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <div className="space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Build Journal</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                TOP READS.
              </h3>
              <p className="text-zinc-500 max-w-xl text-sm">
                Engineering notes, build logs &amp; deep dives — a new post drops every week.
              </p>
            </div>
            <Link
              to="/journal"
              className="shrink-0 px-6 py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 text-xs flex items-center gap-2"
            >
              <BookOpen size={14} /> Visit Journal
            </Link>
          </div>

          {/* Cards */}
          {topJournals.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {topJournals.map((item, i) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3 hover:border-amber-500/30 hover:bg-zinc-900/40 transition-all"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.categoryName && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-amber-500">
                        <Tag size={9} /> {item.categoryName}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-amber-100 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  {item.summary && (
                    <p className="text-zinc-400 text-xs line-clamp-2">{item.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-[10px] text-zinc-600 font-mono">
                    <span className="flex items-center gap-1"><Heart size={9} /> {Number(item.likes || 0)}</span>
                    <span className="flex items-center gap-1"><Eye size={9} /> {Number(item.views || 0)}</span>
                    <span className="flex items-center gap-1"><Clock size={9} /> {item.readMinutes}m</span>
                  </div>
                  <Link
                    to={`/journal/view/${item._id}`}
                    className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-bold transition-colors"
                  >
                    Read post <ArrowRight size={12} />
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-700">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Journal posts are loading…</p>
            </div>
          )}

          {/* Footer CTA */}
          <div className="text-center">
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 px-6 py-3 border border-amber-500/30 text-amber-500 text-sm font-bold rounded-2xl hover:bg-amber-500/10 transition-colors"
            >
              <BookOpen size={16} /> See All Journal Posts <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── Feedback Spotlight ──────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Community Feedback</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">WHAT PEOPLE ARE SAYING.</h3>
            <p className="text-zinc-500 max-w-xl text-sm">
              Real feedback from community members, pinned highlights, and rolling reactions from recent contributors.
            </p>
          </div>
          <SocialProof />
        </div>
      </motion.section>

      {/* Community Section — All Users & Comment Guide */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Community</h2>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
              JOIN THE CONVERSATION.
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {/* All Users card */}
            <Link
              to="/user"
              className="group relative overflow-hidden bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 hover:border-amber-500/30 hover:bg-zinc-900/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 w-fit">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">All Community Users</h4>
                  <p className="text-zinc-500 text-sm mt-1">See everyone who has engaged with the journal — profiles, contributions, and activity.</p>
                </div>
                <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  Explore users <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Comment Guide card */}
            <Link
              to="/journal/comment"
              className="group relative overflow-hidden bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 hover:border-amber-500/30 hover:bg-zinc-900/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 w-fit">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">Comment Guide</h4>
                  <p className="text-zinc-500 text-sm mt-1">Learn how to comment on journal posts, reply to threads, and follow community rules.</p>
                </div>
                <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  Read guide <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Countdown Section loaded from /countdown.html */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <div className="relative rounded-[26px] p-[1.5px]">
          <motion.div
            className="absolute -inset-[1.5px] rounded-[27.5px]"
            style={{
              backgroundImage: countdownTheme.gradient,
              backgroundSize: '260% 260%',
              boxShadow: `0 0 55px ${countdownTheme.glow}`,
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-3 rounded-[30px] opacity-45 blur-2xl pointer-events-none"
            style={{ backgroundImage: countdownTheme.gradient }}
            animate={{ opacity: [0.26, 0.45, 0.28], scale: [0.98, 1.03, 0.99] }}
            transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
          />
          <div className="relative overflow-hidden bg-zinc-950/95 rounded-[24px] border border-white/10 px-6 py-7 md:px-9 md:py-10">
            <motion.div
              className="absolute -left-10 top-[-10%] h-40 w-40 rounded-full blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${hexToRgba(countdownTheme.accent, 0.34)} 0%, transparent 72%)` }}
              animate={{ x: ['0%', '28%', '4%'], y: ['0%', '14%', '8%'], opacity: [0.38, 0.62, 0.4] }}
              transition={{ duration: 16, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-[-18%] right-[-4%] h-48 w-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${hexToRgba(countdownTheme.accent, 0.24)} 0%, transparent 72%)` }}
              animate={{ x: ['0%', '-16%', '-4%'], y: ['0%', '-10%', '-4%'], opacity: [0.2, 0.42, 0.24] }}
              transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(circle at 10% 10%, ${hexToRgba(countdownTheme.accent, 0.2)}, transparent 58%)` }}
            />
            <svg
              className="absolute right-4 top-4 h-16 w-16 md:h-20 md:w-20 opacity-35 pointer-events-none"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="countdown-badge-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={countdownTheme.accent} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" stroke="url(#countdown-badge-gradient)" strokeWidth="6" />
              <path d="M60 26V60L83 74" stroke={countdownTheme.accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: countdownTheme.accent }}
                >
                  Student Mission Timer
                </p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">{homeCountdown.heading}</h3>
              </div>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/70 px-3.5 py-1.5 text-[11px] font-medium text-zinc-200"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.22 }}
              >
                <Clock size={14} style={{ color: countdownTheme.accent }} />
                Focus • Practice • Progress
              </motion.div>
            </div>

            <motion.p
              key={homeCountdown.quote}
              initial={{ opacity: 0.35, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative z-10 mt-5 text-zinc-200/95 text-sm md:text-base leading-relaxed font-medium"
            >
              “{homeCountdown.quote}”
            </motion.p>

            <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Days', value: countdownParts?.days ?? 0 },
                { label: 'Hours', value: countdownParts?.hours ?? 0 },
                { label: 'Minutes', value: countdownParts?.minutes ?? 0 },
                { label: 'Seconds', value: countdownParts?.seconds ?? 0 },
              ].map((unit) => (
                <motion.div
                  key={unit.label}
                  className="rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-center"
                  whileHover={{ y: -3, borderColor: hexToRgba(countdownTheme.accent, 0.55) }}
                  transition={{ duration: 0.2 }}
                >
                  <p
                    className="text-2xl md:text-3xl font-extrabold tabular-nums"
                    style={{ color: countdownTheme.accent }}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-zinc-400 font-medium">{unit.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 mt-5 rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <span className="text-zinc-400">Time remaining</span>
                <span style={{ color: countdownTheme.accent }}>{countdownProgress.percentage.toFixed(1)}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="relative h-full rounded-full"
                  style={{
                    width: `${countdownProgress.percentage}%`,
                    backgroundImage: countdownTheme.gradient,
                    boxShadow: `0 0 18px ${hexToRgba(countdownTheme.accent, 0.4)}`,
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
                >
                  <motion.span
                    className="absolute inset-y-0 right-0 w-10 bg-white/30 blur-sm"
                    animate={{ x: ['-240%', '260%'] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity }}
                  />
                </motion.div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span>100% at start</span>
                <span>{countdownProgress.remainingMs === 0 ? '0% means time is up' : 'Realtime countdown percentage'}</span>
              </div>
            </div>

            <div className="relative z-10 mt-5 flex items-center gap-2 text-zinc-400 text-xs md:text-sm">
              <Target size={14} style={{ color: countdownTheme.accent }} />
              Professional yet friendly daily tracker for every student.
            </div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-20"
      >
        <div className="relative group overflow-hidden bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-12 md:p-24 text-center space-y-10">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 relative z-10"
          >
            <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Collaboration</h2>
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
              Ready to build <br /> the future?
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto text-lg">
              Architecting scalable solutions through advanced prompt engineering and system thinking.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex justify-center"
          >
            <Link
              to="/contact"
              className="group relative px-12 py-6 bg-amber-500 text-black font-black text-xl rounded-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/20"
            >
              <div className="absolute -inset-1 bg-amber-400 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <span>{t('home.cta.contact', 'Get in Touch')}</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
          <div className="relative z-10 flex flex-wrap justify-center gap-4">
            <Link to="/proof" className="px-6 py-3 border border-zinc-700 rounded-xl text-zinc-200 hover:border-amber-500/50 hover:text-amber-500 transition-colors text-xs font-black uppercase tracking-widest">
              {t('home.cta.proof', 'View Proof of Work')}
            </Link>
            <Link to="/journal" className="px-6 py-3 border border-zinc-700 rounded-xl text-zinc-200 hover:border-amber-500/50 hover:text-amber-500 transition-colors text-xs font-black uppercase tracking-widest">
              {t('home.cta.journal', 'Read Build Journal')}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* System Status + Owner Access */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 pb-20"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Operations & Access</h2>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-white">SYSTEM STATUS & OWNER DASHBOARD.</h3>
            <p className="text-zinc-500 max-w-xl text-sm">
              Track live API health and quickly jump to secure owner controls from one operational section.
            </p>
          </div>

          <div className="relative overflow-hidden bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shrink-0">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.4em] mb-0.5">Live Monitor</p>
                <h3 className="text-lg font-black text-white tracking-tight">System Status</h3>
                <p className="text-zinc-500 text-sm">Real-time API health, server metrics &amp; latency data</p>
              </div>
            </div>
            <Link
              to="/status"
              className="relative z-10 shrink-0 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 text-xs flex items-center gap-2"
            >
              <Activity size={14} />
              View Status
            </Link>
          </div>

          <div className="relative overflow-hidden bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-1">Owner Access</p>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Are you Deep Dey?</h3>
                <p className="text-zinc-500 text-sm mt-1">
                  Login to the content dashboard to manage journals, categories, and settings.
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="relative z-10 shrink-0 px-8 py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Lock size={16} />
              Login to Dashboard
            </Link>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
