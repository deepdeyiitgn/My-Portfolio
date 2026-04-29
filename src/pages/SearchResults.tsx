import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, Clock, ArrowRight, ExternalLink, Loader2, Sparkles, X, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import SEO from '../components/SEO';
import { faqData } from '../data/faqData';
import { projectsData } from '../data/projectsData';
import { renderIcon } from '../utils/iconMap';

// ── Types ────────────────────────────────────────────────────────────────────
interface SearchResult {
  _id: string;
  type: 'Journal' | 'Project' | 'FAQ' | 'System';
  title: string;
  url: string;
  category?: string;
  snippets: string[];
  createdAtIST?: string;
}

// ── Typewriter Suggestions ───────────────────────────────────────────────────
const SUGGESTIONS = [
  "Deep's current status...",
  "IIT KGP 2027 Goals...",
  "Latest coding projects...",
  "Physics study journals...",
  "Magic Bite business updates...",
  "QuickLink SaaS features..."
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const [inputValue, setQuery] = useState(rawQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [easterEgg, setEasterEgg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // ── Typewriter Logic ────────────────────────────────────────────────────────
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === SUGGESTIONS[suggestionIdx].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setSuggestionIdx((prev) => (prev + 1) % SUGGESTIONS.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, suggestionIdx, reverse]);

  // ── History & Cookies Logic ──────────────────────────────────────────────────
  const [localHistory, setLocalHistory] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('dd_search_history');
    if (saved) setLocalHistory(JSON.parse(saved).slice(0, 10));
  }, []);

  const saveToHistory = (q: string) => {
    const cleanQ = q.trim();
    if (!cleanQ) return;
    const updated = [cleanQ, ...localHistory.filter(x => x !== cleanQ)].slice(0, 10);
    setLocalHistory(updated);
    localStorage.setItem('dd_search_history', JSON.stringify(updated));
  };

  // ── Search Logic (Merge Local + Backend) ────────────────────────────────────
  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    saveToHistory(q);

    try {
      // 1. Backend Search (Journals & Easter Eggs)
      const res = await fetch(`/api/journal?action=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      
      let combinedResults: SearchResult[] = [];
      if (data.ok) {
        combinedResults = [...data.results];
        setEasterEgg(data.easterEgg);
      }

      // 2. Local Search (FAQs & Projects)
      const regex = new RegExp(q, 'gi');
      
      // FAQ Search
      faqData.forEach(item => {
        if (item.question.match(regex) || item.answer.match(regex)) {
          combinedResults.push({
            _id: `faq-${item.id}`,
            type: 'FAQ',
            title: item.question,
            url: '/faq',
            snippets: [`${item.answer.substring(0, 100).replace(regex, (m) => `<mark class="bg-amber-500/20 text-amber-500 rounded px-1">${m}</mark>`)}...`]
          });
        }
      });

      // Projects Search
      projectsData.forEach(p => {
        if (p.title.match(regex) || p.shortDescription.match(regex)) {
          combinedResults.push({
            _id: `proj-${p.id}`,
            type: 'Project',
            title: p.title,
            url: `/projects/${p.id}`,
            snippets: [p.shortDescription.replace(regex, (m) => `<mark class="bg-amber-500/20 text-amber-500 rounded px-1">${m}</mark>`)]
          });
        }
      });

      setResults(combinedResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rawQuery) {
      setQuery(rawQuery);
      performSearch(rawQuery);
    } else {
      setResults([]);
      setEasterEgg(null);
    }
  }, [rawQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${inputValue.trim().replace(/\s+/g, '+')}`);
    }
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <SEO title={rawQuery ? `Results for "${rawQuery}"` : "Search Engine | Deep Dey"} description="Global search for Deep Dey's ecosystem" route="/search" />

      {/* ── Search Engine UI (Empty State or Header) ────────────────────────── */}
      <div className={`transition-all duration-700 ${!rawQuery ? 'mt-20 text-center' : 'mb-12'}`}>
        {!rawQuery && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              DEEP <span className="text-amber-500">SEARCH.</span>
            </h1>
            <div className="h-6 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-amber-500 animate-pulse" />
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em]">
                Try typing: <span className="text-zinc-200">{SUGGESTIONS[suggestionIdx].substring(0, subIndex)}</span>
                <span className="w-1.5 h-4 bg-amber-500 ml-1 inline-block animate-bounce" />
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-amber-500 animate-pulse' : 'text-zinc-500 group-focus-within:text-amber-500'}`} size={20} />
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs, projects, status, anything..."
            className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] pl-14 pr-16 py-5 text-white text-lg focus:outline-none focus:border-amber-500/50 shadow-2xl transition-all"
          />
          {inputValue && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={20} />
            </button>
          )}
        </form>

        {/* ── Top Searches (Static + Mixed) ── */}
        {!rawQuery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block w-full mb-2">Popular Searches</span>
              {["deep's status", "iit kharagpur", "magic bite", "projects", "resume"].map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => { setQuery(tag); navigate(`/search?q=${tag.replace(/\s+/g, '+')}`); }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:border-amber-500/50 hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            {localHistory.length > 0 && (
              <div className="max-w-xs mx-auto text-left pt-8">
                <h3 className="text-zinc-600 text-[10px] font-mono uppercase mb-3 flex items-center gap-2">
                  <History size={12} /> Your Past Queries
                </h3>
                <div className="space-y-2">
                  {localHistory.map((h, i) => (
                    <button key={i} onClick={() => { setQuery(h); navigate(`/search?q=${h.replace(/\s+/g, '+')}`); }} className="block text-zinc-400 hover:text-amber-500 text-sm transition-colors">
                      • {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Results Logic ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-amber-500" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Searching Deep's Ecosystem...</p>
          </motion.div>
        ) : rawQuery && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <p className="text-zinc-500 text-sm">Showing <span className="text-white font-bold">{results.length}</span> results for "<span className="text-amber-500">{rawQuery}</span>"</p>
              <span className="text-[10px] font-mono text-zinc-600">Search speed: ~240ms</span>
            </div>

            {/* 🥚 Easter Egg: Live Status Card */}
            {easterEgg && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 bg-zinc-900 border border-amber-500/30 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-amber-500/10 w-40 h-40 rounded-full blur-3xl" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    {renderIcon(easterEgg.icon, 20) || <Activity size={20} />}
                  </div>
                  <h2 className="text-white font-bold">Deep's Current Status</h2>
                  {easterEgg.glow && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
                </div>
                <p className="text-zinc-300 text-lg mb-4">{easterEgg.message}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {easterEgg.createdAtIST}</span>
                  {easterEgg.freeBy && <span className="text-amber-500/80">Free by: {easterEgg.freeBy}</span>}
                </div>
              </motion.div>
            )}

            {/* 📄 Results List */}
            {results.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
                <p className="text-zinc-600">No results found. Try broader keywords like "code", "study", or "status".</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentResults.map((res) => (
                  <Link key={res._id} to={res.url} className="block group">
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl group-hover:border-zinc-700 group-hover:bg-zinc-900/50 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          res.type === 'Journal' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' : 
                          res.type === 'Project' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 
                          'border-amber-500/30 text-amber-500 bg-amber-500/5'
                        }`}>
                          {res.type}
                        </span>
                        {res.category && <span className="text-[10px] font-mono text-zinc-600">— {res.category}</span>}
                      </div>
                      <h3 className="text-white font-bold text-xl group-hover:text-amber-500 transition-colors mb-3 flex items-center justify-between">
                        {res.title}
                        <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-amber-500" />
                      </h3>
                      <div className="space-y-2">
                        {res.snippets.map((snip, i) => (
                          <p key={i} className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: snip }} />
                        ))}
                      </div>
                      {res.createdAtIST && <p className="mt-4 text-[10px] font-mono text-zinc-600 tracking-wider"><Clock size={10} className="inline mr-1" /> {res.createdAtIST}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white disabled:opacity-30"><ChevronLeft /></button>
                <span className="text-xs font-mono text-zinc-500">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white disabled:opacity-30"><ChevronRight /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}