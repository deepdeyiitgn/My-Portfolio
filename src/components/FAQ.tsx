import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Why is development paused on your projects?",
    answer: "I have officially paused active development as of April 9, 2026, to focus 100% on my JEE Advanced 2027 preparation. My target is IIT Kharagpur (KGP) for Computer Science and Engineering (CSE).",
  },
  {
    question: "Do you code everything from scratch?",
    answer: "No. I act as a Software Architect. I utilize advanced AI Prompt Engineering and System Thinking to build complex applications fast. I leverage tools like GPT-4o, Gemini 1.5 Pro, and GitHub Copilot as development partners rather than just copy-pasting code.",
  },
  {
    question: "What is qlynk.me?",
    answer: "qlynk.me is my primary SaaS platform designed for URL shortening, QR code generation, and digital productivity utilities. It serves as the hub for my ecosystem of tools.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex items-center space-x-3 mb-8">
        <HelpCircle className="text-amber-500" size={28} />
        <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div
            key={index}
            className="border border-zinc-800 bg-zinc-900/20 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
            >
              <span className="font-bold text-white tracking-tight">{faq.question}</span>
              <div className="text-amber-500 ml-4 group">
                {activeIndex === index ? (
                  <Minus size={20} className="transform transition-transform" />
                ) : (
                  <Plus size={20} className="transform transition-transform group-hover:rotate-90" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
