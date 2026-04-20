import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, HelpCircle, Plus, Minus, ArrowRight, MessageSquareOff } from 'lucide-react';
import { faqData, FAQItem } from '../data/faqData';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Advanced Search Logic with Match Percentage
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqData.map(item => ({ ...item, match: 100 }));

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/);

    return faqData
      .map(item => {
        const question = item.question.toLowerCase();
        const answer = item.answer.toLowerCase();
        
        let score = 0;
        if (question.includes(query)) score += 60;
        if (answer.includes(query)) score += 20;

        queryWords.forEach(word => {
          if (question.includes(word)) score += 10;
          if (answer.includes(word)) score += 5;
        });

        // Cap match percentage at 100
        const match = Math.min(Math.round((score / 100) * 100), 100);
        
        return { ...item, match };
      })
      .filter(item => item.match > 0)
      .sort((a, b) => b.match - a.match);
  }, [searchQuery]);

  const toggleFAQ = (id: number) => {
    setActiveIndex(activeIndex === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-6 py-12 space-y-16"
    >
      <SEO 
        title="Frequently Asked Questions | Deep Dey"
        description="Find answers to common questions about Deep Dey's projects, his JEE Advanced 2027 goals, and his AI-assisted development methodology."
        keywords="Deep Dey FAQ, JEE 2027, IIT KGP CSE, Qlynk Support, AI Development Questions"
        route="/faq"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqData.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer
            }
          }))
        }}
      />
      <div className="text-center space-y-6">
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Knowledge Base</h2>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Common Inquiries</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-12 bg-zinc-950 border border-zinc-800 rounded-3xl p-1 shadow-2xl focus-within:ring-2 focus-within:ring-amber-500 transition-all">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-500">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-16 py-6 text-lg text-white outline-none"
          />
          <div className="absolute inset-y-0 right-6 flex items-center">
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 uppercase tracking-widest">
              Shift + S
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative">
        <AnimatePresence mode="popLayout">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group border border-zinc-800 bg-zinc-900/10 rounded-[2rem] overflow-hidden hover:border-amber-500/30 transition-all shadow-lg shadow-black/40"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-8 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-center">
                      <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md mb-1 ${
                        faq.match > 80 ? 'bg-amber-500 text-black' : 
                        faq.match > 50 ? 'bg-amber-500/20 text-amber-500' : 
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {faq.match}%
                      </span>
                      <span className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold">Match</span>
                    </div>
                    <span className="text-xl font-bold text-zinc-100 group-hover:text-amber-500 transition-colors pr-8">
                      {faq.question}
                    </span>
                  </div>
                  <div className="text-zinc-600 group-hover:text-amber-500 transition-colors">
                    {activeIndex === faq.id ? <Minus size={24} /> : <Plus size={24} />}
                  </div>
                </button>

                <AnimatePresence>
                  {activeIndex === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-zinc-800/50"
                    >
                      <div className="p-8 text-zinc-400 leading-relaxed text-lg bg-zinc-950/30">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 animate-pulse">
                <MessageSquareOff size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">System match not found.</h3>
                <p className="text-zinc-500 max-w-sm">
                  We couldn't find any common questions matching <span className="text-amber-500">"{searchQuery}"</span> in our current database.
                </p>
              </div>
              <Link
                to="/contact"
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20"
              >
                <span>Ask me directly</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Branding */}
      <div className="pt-24 text-center">
        <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[1em]">Knowledge Ecosystem v2.0</p>
      </div>
    </motion.div>
  );
}
