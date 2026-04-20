import React from 'react';

const ROW_1 = [
  "QuickLink", "StudyBot", "GitHub", "Transparent Clock", "TypeScript", 
  "Python", "qlynk.me", "FastAPI", "React", "MongoDB", "Framer Motion", 
  "Qlynk Node Server", "Video Editing", "Tailwind CSS", "System Architecture", 
  "100k+ Lines of Code", "Vercel Deployments", "Vite + React", "FastAPI Backend", "OpenAI APIs"
];

const ROW_2 = [
  "YouTube Hustle 2020-2023", "93% in Mathematics", "System Architecture", 
  "100k+ Lines of Code", "JEE 2027 Target", "IIT KGP CSE", "Problem Solver", 
  "Persistent Feed", "Software Architect", "Continuous Iteration", "Performance First"
];

export default function JourneyMarquee() {
  return (
    <div className="w-full py-12 overflow-hidden bg-zinc-950 flex flex-col gap-6 relative">
      {/* Side Fades */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>

      {/* Row 1: Fast, Left */}
      <div className="flex overflow-hidden group">
        <div className="flex animate-marquee whitespace-nowrap gap-4">
          {[...ROW_1, ...ROW_1, ...ROW_1, ...ROW_1].map((item, i) => (
            <div 
              key={i}
              className="px-8 py-3 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl flex items-center gap-3 group-hover:border-amber-500/30 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-zinc-400 font-mono text-sm uppercase tracking-widest">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Slower, Right */}
      <div className="flex overflow-hidden group">
        <div className="flex animate-marquee-reverse whitespace-nowrap gap-4">
          {[...ROW_2, ...ROW_2, ...ROW_2, ...ROW_2].map((item, i) => (
            <div 
              key={i}
              className="px-10 py-4 bg-zinc-900/20 backdrop-blur-sm border border-zinc-900 rounded-3xl flex items-center gap-4 group-hover:bg-zinc-900/40 transition-all"
            >
              <span className="text-zinc-500 font-bold italic tracking-tight text-lg">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-reverse {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
          will-change: transform;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 55s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee, .animate-marquee-reverse {
            animation-play-state: paused;
          }
        }
        .group:hover .animate-marquee,
        .group:hover .animate-marquee-reverse {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
