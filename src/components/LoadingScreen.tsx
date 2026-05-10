import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const LOADING_QUOTES = [
  "Code is read more than it is written.",
  "System thinking is the ultimate superpower.",
  "Discipline equals freedom.",
  "Compiling the future...",
  "Simplicity is the soul of efficiency.",
  "The best way to predict the future is to invent it.",
  "Architecture is the art of what to leave out.",
  "Talk is cheap. Show me the code.",
  "Clean code always looks like it was written by someone who cares.",
  "Optimizing for the user, not the machine.",
  "Abstraction is the key to managing complexity.",
  "JEE is not just an exam; it's a test of resilience.",
  "Physics is the poetry of logic.",
  "Mathematics is the language of the universe.",
  "IIT Kharagpur: The destination of dreams.",
  "Prompting is the new programming language.",
  "Every bug is a lesson in disguise.",
  "Consistent effort beats sporadic genius.",
  "Scale is the ultimate test of architecture.",
  "Refining the structure, perfecting the flow.",
  "Deep work leads to high-fidelity output.",
  "The coordinate of success is persistence.",
  "Modular roots, industrial branches.",
  "Debugging your life, one step at a time.",
  "Focus is a muscle. Train it every day.",
  "Calculus: The study of change and motion.",
  "Chemistry is the logic of existence.",
  "Secure your foundation before building the skyscraper.",
  "Code is a creative medium, not just a technical one.",
  "The future belongs to the architects of AI.",
  "IIT KGP CSE: Where engineering meets excellence.",
  "Iterate. Refine. Deploy.",
  "Aesthetics reinforce functionality.",
  "Precision in thought, clarity in execution.",
  "The algorithm of success requires constant iteration.",
  "Stay hungry. Stay foolish.",
  "Don't comment bad code—rewrite it.",
  "The only way to go fast is to go well.",
  "Software is a great combination of artistry and engineering.",
  "Mastering the intersection of human and machine.",
  "Logic will get you from A to B. Imagination will take you everywhere.",
  "Building systems that breathe and scale.",
  "Solving for X, architecting for N.",
  "The grind of JEE is the furnace of success.",
  "One line at a time. One problem at a time.",
  "Stay focused on the long-term vision.",
  "Consistency is the companion of architectural integrity.",
  "Engineering the path to 2027.",
  "The digital ghost in the machine.",
  "Initializing technical sovereignty.",
  "Great systems are grown, not guessed.",
  "Small commits, massive outcomes.",
  "Latency is a user feeling.",
  "Clarity is a performance feature.",
  "Design for failure, then for scale.",
  "Ideas become products through execution.",
  "Resilience is engineered, not hoped for.",
  "Model the domain, then code the model.",
  "Data tells the truth if you listen.",
  "Consistency creates compounding returns.",
  "Think in systems, deliver in increments.",
  "APIs are contracts, honor them.",
  "Craft over chaos, always.",
  "Every deployment is a promise.",
  "Readability is future velocity.",
  "Fast feedback beats perfect planning.",
  "Ship value, then optimize.",
  "Healthy abstractions unlock speed.",
  "Careful naming prevents hidden bugs.",
  "One architecture, many evolutions.",
  "Constraint breeds creativity.",
  "Secure defaults save real teams.",
  "Observability is operational confidence.",
  "The roadmap rewards focus.",
  "Progress is built on routines.",
  "Elegance survives refactors.",
  "Strong fundamentals outlast trends.",
  "Intentional practice creates mastery.",
  "Measure twice, deploy once.",
  "From prototype to platform.",
  "Code with empathy for maintainers.",
  "Reliable systems are quietly heroic.",
  "Less friction, more flow.",
  "Thoughtful UX is invisible power.",
  "Momentum comes from daily discipline.",
  "Automation protects creativity.",
  "Great products respect user time.",
  "Quality is everyone’s job.",
  "Make complexity legible.",
  "Future-proof by simplifying today.",
  "Strong teams write clear interfaces.",
  "Execution turns goals into history.",
  "Stay curious, stay precise.",
  "Depth over noise.",
  "Habits are the engine of excellence.",
  "Architecture is strategy made visible.",
  "Own the details, win the outcome.",
  "Long-term thinking compounds.",
  "The best optimization is understanding.",
  "Build trust with predictable systems."
];

type LoadingScreenMode = 'intro' | 'normal';

interface LoadingScreenProps {
  mode?: LoadingScreenMode;
  onIntroComplete?: () => void;
  progress?: number;
}

const INTRO_SLIDES = [
  { title: "Deep Dey's Portfolio", subtitle: 'A website by Deep' },
  { title: 'A QLYNK Production', subtitle: 'An app by Deep' },
];

export default function LoadingScreen({ mode = 'normal', onIntroComplete, progress = 0 }: LoadingScreenProps) {
  const reduceMotion = useReducedMotion();
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * LOADING_QUOTES.length));
  const [introIndex, setIntroIndex] = useState(0);
  const [lastProgress, setLastProgress] = useState(0);
  const safeProgress = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));

  // Random quote cycling
  useEffect(() => {
    if (mode !== 'normal') return;
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => {
        if (LOADING_QUOTES.length <= 1) return prev;
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * LOADING_QUOTES.length);
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(quoteInterval);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'intro') return;
    if (introIndex >= INTRO_SLIDES.length) {
      onIntroComplete?.();
      return;
    }
    const timer = setTimeout(() => setIntroIndex((prev) => prev + 1), 2200);
    return () => clearTimeout(timer);
  }, [introIndex, mode, onIntroComplete]);

  useEffect(() => {
    if (mode !== 'normal') return;
    setLastProgress((prev) => Math.max(prev, safeProgress));
  }, [mode, safeProgress]);

  if (mode === 'intro') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[300] px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_55%)]" />
        <AnimatePresence mode="wait">
          {introIndex < INTRO_SLIDES.length && (
            <motion.div
              key={INTRO_SLIDES[introIndex].title}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white">{INTRO_SLIDES[introIndex].title}</h1>
              <p className="text-zinc-400 uppercase text-[11px] md:text-xs tracking-[0.35em]">{INTRO_SLIDES[introIndex].subtitle}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[100] px-6">
      <div className="w-full max-w-md space-y-12">
        {/* Loading Display */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-[0.08em]"
          >
            LOADING<span className="text-amber-500">...</span>
          </motion.div>
          
          <p className="text-zinc-400 font-mono text-xs tracking-[0.3em]">{Math.round(lastProgress)}%</p>
          <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <motion.div
              className="absolute inset-y-0 left-0 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
              initial={{ width: '0%' }}
              animate={{ width: `${lastProgress}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Dynamic Quotes */}
        <div className="h-20 flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-zinc-500 font-mono text-xs md:text-sm uppercase tracking-[0.2em] leading-relaxed"
            >
              "{LOADING_QUOTES[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative pulse */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-12 text-[10px] font-mono text-zinc-800 uppercase tracking-[1em]"
      >
        Initializing System Core
      </motion.div>
    </div>
  );
}
