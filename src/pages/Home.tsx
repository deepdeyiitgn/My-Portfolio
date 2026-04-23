import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Lightbulb, GraduationCap, ArrowRight, Zap, History, Milestone, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import TechGalaxy from '../components/TechGalaxy';
import JourneyMarquee from '../components/JourneyMarquee';
import SEO from '../components/SEO';
import { timelineData } from '../data/timelineData';
import SocialProof from '../components/SocialProof';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [isHoverable, setIsHoverable] = useState(true);
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  useEffect(() => {
    // Detect if device has a precise pointing device (mouse)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsHoverable(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHoverable(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

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
          className="relative group"
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
          {timelineData.map((item, index) => {
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

      <SocialProof />

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
