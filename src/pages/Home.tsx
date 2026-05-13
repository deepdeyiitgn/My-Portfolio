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
}

export default function Home() {
  const [isHoverable, setIsHoverable] = useState(true);
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const [topJournals, setTopJournals] = useState<TopJournal[]>([]);
  const [homeCountdown, setHomeCountdown] = useState<HomeCountdownContent>({
    heading: 'JEE 2027 Ke Liye Time Hei...',
    quote: 'Dream big, work hard, stay focused.',
    targetDate: null,
  });
  const [countdownText, setCountdownText] = useState('Loading countdown...');

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
        const heading = documentFromHtml.getElementById('heading')?.textContent?.trim() || 'JEE 2027 Ke Liye Time Hei...';
        const scriptContent = Array.from(documentFromHtml.querySelectorAll('script'))
          .map((script) => script.textContent || '')
          .join('\n');

        const extractDateLiteral = (source: string, variableName: string) => {
          const marker = `${variableName} = new Date("`;
          const startIndex = source.indexOf(marker);
          if (startIndex < 0) return null;
          const valueStart = startIndex + marker.length;
          const valueEnd = source.indexOf('")', valueStart);
          if (valueEnd <= valueStart) return null;
          return source.slice(valueStart, valueEnd);
        };

        const targetDateSource = extractDateLiteral(scriptContent, 'targetDate');
        const parsedTargetDate = targetDateSource
          ? new Date(targetDateSource).getTime()
          : new Date('June 30, 2027 23:59:59').getTime();

        setHomeCountdown({
          heading,
          quote: 'Dream big, work hard, stay focused.',
          targetDate: parsedTargetDate && !Number.isNaN(parsedTargetDate) ? parsedTargetDate : null,
        });
      })
      .catch(() => {
        setHomeCountdown((previous) => ({
          ...previous,
          targetDate: new Date('June 30, 2027 23:59:59').getTime(),
        }));
      });
  }, []);

  useEffect(() => {
    if (!homeCountdown.targetDate) {
      setCountdownText('Countdown unavailable right now.');
      return;
    }
    const targetDate = homeCountdown.targetDate;

    const updateCountdown = () => {
      const distance = targetDate - Date.now();
      const safeDistance = Math.max(distance, 0);
      const days = Math.floor(safeDistance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((safeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((safeDistance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((safeDistance % (1000 * 60)) / 1000);
      const label = (value: number, singular: string, plural: string) => (value === 1 ? singular : plural);
      setCountdownText(
        `Time Left: ${days} ${label(days, 'Day', 'Days')} ${hours} ${label(hours, 'Hour', 'Hours')} ${minutes} ${label(minutes, 'Minute', 'Minutes')} ${seconds} ${label(seconds, 'Second', 'Seconds')}`
      );
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [homeCountdown.targetDate]);

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

      {/* ── Feedback Spotlight (above Journal Top Post section) ───────────── */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
        <SocialProof />
      </motion.section>

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

      {/* System Status Banner */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6"
      >
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
        <div className="relative overflow-hidden bg-zinc-950 border border-amber-500/60 rounded-3xl p-8 md:p-10 space-y-4">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
          <p className="relative z-10 text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em]">Countdown</p>
          <h3 className="relative z-10 text-2xl md:text-3xl font-black text-white tracking-tight">{homeCountdown.heading}</h3>
          <p className="relative z-10 text-zinc-300 text-sm md:text-base">{homeCountdown.quote}</p>
          <p className="relative z-10 text-amber-500 text-lg md:text-2xl font-black tracking-tight">{countdownText}</p>
        </div>
      </motion.section>

      {/* Owner-only Dashboard Access */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 pb-20"
      >
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
      </motion.section>
    </div>
  );
}
