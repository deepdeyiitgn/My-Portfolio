import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
  "Initializing technical sovereignty."
];

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Realistic Progress Bar Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Fast to 85%
    if (progress < 85) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 85));
      }, 150);
    } 
    // Slow to 99%
    else if (progress < 99) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 0.5, 99.5));
      }, 500);
    }

    return () => clearInterval(interval);
  }, [progress]);

  // Quote Cycling Logic
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
    }, 2500);
    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[100] px-6">
      <div className="w-full max-w-md space-y-12">
        {/* Progress Display */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter"
          >
            {Math.floor(progress)}<span className="text-amber-500">%</span>
          </motion.div>
          
          <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.5 }}
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
