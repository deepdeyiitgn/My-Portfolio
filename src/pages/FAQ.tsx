import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, HelpCircle, Plus, Minus, ArrowRight, MessageSquareOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { faqData, FAQItem } from '../data/faqData';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function FAQ() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>(faqData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const listTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const res = await fetch('/api/faqs');
        const data = await res.json();
        if (res.ok && Array.isArray(data.items) && data.items.length > 0) {
          setFaqItems(data.items as FAQItem[]);
        }
      } catch {
        setFaqItems(faqData);
      }
    };
    loadFaqs();
  }, []);

  // Advanced Search Logic with Match Percentage
  const filteredFaqs = useMemo(() => {
    // Reset page to 1 when searching handled by useEffect
    if (!searchQuery.trim()) {
      return faqItems.map(item => ({ ...item, match: 0 }));
    }

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/);

    return faqItems
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
  }, [searchQuery, faqItems]);

  // Use raw data if no search
  const displayData = searchQuery.trim() ? filteredFaqs : faqItems.map(item => ({ ...item, match: 0 }));

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFaqs = displayData.slice(startIndex, startIndex + itemsPerPage);

  const toggleFAQ = (id: number) => {
    setActiveIndex(activeIndex === id ? null : id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveIndex(null);
    // Smooth scroll to top of list
    if (listTopRef.current) {
      const topOffset = listTopRef.current.offsetTop - 120;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-16"
    >
      <SEO 
        title="Frequently Asked Questions | Deep Dey"
        description="Find answers to common questions about Deep Dey's projects, his JEE Advanced 2027 goals, and his AI-assisted development methodology."
        keywords="Deep Dey FAQ, JEE 2027, IIT KGP CSE, Qlynk Support, AI Development Questions"
        route="/faq"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
           "mainEntity": faqItems.map(f => ({
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
          <div className="hidden md:flex absolute inset-y-0 right-6 items-center">
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 uppercase tracking-widest">
              Shift + S
            </span>
          </div>
        </div>
      </div>

      <div ref={listTopRef} className="space-y-6 relative overflow-hidden min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + searchQuery}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {paginatedFaqs.length > 0 ? (
              paginatedFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  layout
                  className="group border border-zinc-800 bg-zinc-900/10 rounded-[2rem] overflow-hidden hover:border-amber-500/30 transition-all shadow-lg shadow-black/40"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-6 md:p-8 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                      <div className="flex flex-col items-center shrink-0">
                        <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md mb-1 ${
                          faq.match > 80 ? 'bg-amber-500 text-black' : 
                          faq.match > 50 ? 'bg-amber-500/20 text-amber-500' : 
                          faq.match > 0 ? 'bg-zinc-800 text-zinc-500' :
                          'bg-zinc-800/10 text-zinc-700'
                        }`}>
                          {faq.match > 0 ? `${faq.match}%` : "100%"}
                        </span>
                        <span className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold">Match</span>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-zinc-100 group-hover:text-amber-500 transition-colors truncate block">
                        {faq.question}
                      </span>
                    </div>
                    <div className="text-zinc-600 group-hover:text-amber-500 transition-colors shrink-0">
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
                        <div className="p-6 md:p-8 text-zinc-400 leading-relaxed text-base md:text-lg bg-zinc-950/30">
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-10 border-t border-zinc-900">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all ${
              currentPage === 1 ? 'opacity-30 pointer-events-none' : 'hover:border-amber-500 hover:text-amber-500'
            }`}
          >
            <ChevronLeft size={20} />
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Prev</span>
          </button>

          <div className="flex items-center gap-2 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show only current, first, last and surrounding pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-amber-500/50 hover:text-amber-500'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && page > 1) ||
                (page === currentPage + 2 && page < totalPages)
              ) {
                return <span key={page} className="text-zinc-700">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all ${
              currentPage === totalPages ? 'opacity-30 pointer-events-none' : 'hover:border-amber-500 hover:text-amber-500'
            }`}
          >
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Decorative Branding */}
      <div className="pt-24 text-center">
        <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[1em]">Knowledge Ecosystem v2.1</p>
        <p className="text-[8px] text-zinc-800 mt-4 uppercase tracking-widest">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, displayData.length)} of {displayData.length} records</p>
      </div>
    </motion.div>
  );
}
