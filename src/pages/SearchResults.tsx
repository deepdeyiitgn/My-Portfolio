import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, Clock, ArrowRight, ExternalLink, Loader2, Sparkles, X, ChevronLeft, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import { faqData } from '../data/faqData';
import { projectsData } from '../data/projectsData';import { renderIcon } from '../utils/iconMap';

// ── Types ────────────────────────────────────────────────────────────────────
interface SearchResult {
  _id: string;
  type: 'Journal' | 'Project' | 'FAQ' | 'System' | 'Social';
  title: string;
  url: string;
  category?: string;
  snippets: string[];
  createdAtIST?: string;
}

// Social link keywords that trigger the Social Profiles card
const SOCIAL_TRIGGERS = ['insta', 'instagram', 'github', 'twitter', 'x', 'social', 'contact', 'youtube', 'linkedin', 'links'];

// Escape string for safe use in RegExp constructor
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build highlighted snippet around a matched position in plaintext
const buildHighlightedSnippet = (plainText: string, matchIndex: number, matchLen: number, keywords: string[]): string => {
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(plainText.length, matchIndex + matchLen + 40);
  let snippet = plainText.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < plainText.length) snippet += '...';

  // Highlight every keyword in the snippet
  for (const kw of keywords) {
    snippet = snippet.replace(
      new RegExp(`(${escapeRegex(kw)})`, 'gi'),
      '<mark class="bg-amber-500/20 text-amber-500 rounded px-1 font-bold">$1</mark>'
    );
  }
  return snippet;
};

// Generate up to maxCount highlighted snippets from plaintext for given keywords
const getLocalSnippets = (text: string, keywords: string[], maxCount = 2): string[] => {
  if (!text || !keywords.length) return [];
  const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const snippets: string[] = [];

  for (const kw of keywords) {
    if (snippets.length >= maxCount) break;
    const regex = new RegExp(escapeRegex(kw), 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(plainText)) !== null && snippets.length < maxCount) {
      snippets.push(buildHighlightedSnippet(plainText, match.index, kw.length, keywords));
    }
  }

  return snippets.length > 0
    ? snippets
    : [plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '')];
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const [inputValue, setQuery] = useState(rawQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [easterEgg, setEasterEgg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [trending, setTrending] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // ── History Logic ──────────────────────────────────────────────────────────
  const [localHistory, setLocalHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dd_search_history');
    if (saved) {
      try { setLocalHistory(JSON.parse(saved).slice(0, 10)); } catch { /* ignore */ }
    }
  }, []);

  const saveToHistory = (q: string) => {
    const cleanQ = q.trim();
    if (!cleanQ) return;
    const updated = [cleanQ, ...localHistory.filter(x => x !== cleanQ)].slice(0, 10);
    setLocalHistory(updated);
    localStorage.setItem('dd_search_history', JSON.stringify(updated));
  };

  // ── Fetch Trending on Mount ────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/journal?action=search&q=')
      .then(r => r.json())
      .then(data => {
        if (data.ok && Array.isArray(data.trending)) {
          setTrending(data.trending.map((t: { query: string }) => t.query));
        }
      })
      .catch(() => { /* silent */ });
  }, []);

  // ── Search Logic (Merge Local + Backend) ────────────────────────────────────
  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setCurrentPage(1);
    saveToHistory(q);

    try {
      // 1. Backend Search (Journals + Analytics)
      const res = await fetch(`/api/journal?action=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();

      let combinedResults: SearchResult[] = [];
      if (data.ok) {
        combinedResults = [...data.results];
        setEasterEgg(data.easterEgg);
        // Update trending from latest analytics
        if (Array.isArray(data.trending)) {
          setTrending(data.trending.map((t: { query: string }) => t.query));
        }
      }

      // 2. Loose Local Search — split query into individual keywords
      const keywords = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

      // Social Links Card: inject if any keyword matches a social trigger
      const hasSocialMatch = keywords.some(kw =>
        SOCIAL_TRIGGERS.some(trigger => trigger.includes(kw) || kw.includes(trigger))
      );
      if (hasSocialMatch) {
        combinedResults.unshift({
          _id: 'social-profiles',
          type: 'Social',
          title: 'Social Profiles & Links',
          url: '/links',
          category: 'Connect',
          snippets: ['All social media profiles, ecosystem links, and community portals for Deep Dey in one place.']
        });
      }

      // FAQ Search — loose keyword matching
      faqData.forEach(item => {
        const haystack = `${item.question} ${item.answer}`.toLowerCase();
        const matches = keywords.some(kw => haystack.includes(kw));
        if (matches) {
          combinedResults.push({
            _id: `faq-${item.id}`,
            type: 'FAQ',
            title: item.question,
            url: `/faq#faq-${item.id}`, // anchor navigation
            snippets: getLocalSnippets(item.answer, keywords)
          });
        }
      });

      // Projects Search — loose keyword matching
      projectsData.forEach(p => {
        const haystack = `${p.title} ${p.shortDescription}`.toLowerCase();
        const matches = keywords.some(kw => haystack.includes(kw));
        if (matches) {
          combinedResults.push({
            _id: `proj-${p.id}`,
            type: 'Project',
            title: p.title,
            url: `/projects/${p.id}`,
            snippets: getLocalSnippets(p.shortDescription, keywords)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // performSearch and saveToHistory are intentionally excluded: they read
    // localHistory at call-time and should only re-run when rawQuery changes.
  }, [rawQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const jumpToQuery = (q: string) => {
    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <SEO title={rawQuery ? `Results for "${rawQuery}"` : "Search Engine | Deep Dey"} description="Global search for Deep Dey's ecosystem" route="/search" />

      {/* ── Central Search Input ────────────────────────────────────────────── */}
      <div className={`transition-all duration-700 ${!rawQuery ? 'mt-20 text-center' : 'mb-12'}`}>
        {!rawQuery && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              DEEP <span className="text-amber-500">SEARCH.</span>
            </h1>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em]">
              Search journals, projects, FAQs, social links &amp; more
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-amber-500 animate-pulse' : 'text-zinc-500 group-focus-within:text-amber-500'}`} size={20} />
          <input
            ref={inputRef}
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

        {/* ── Empty State: Trending + History ── */}
        {!rawQuery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 space-y-8">

            {/* Trending from analytics DB */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 uppercase tracking-widest w-full justify-center mb-2">
                <TrendingUp size={11} /> Trending Searches
              </span>
              {(trending.length > 0
                ? trending
                : ["deep's status", "iit kharagpur", "magic bite", "projects", "resume"]
              ).map((tag) => (
                <button
                  key={tag}
                  onClick={() => jumpToQuery(tag)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:border-amber-500/50 hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Past Queries from localStorage */}
            {localHistory.length > 0 && (
              <div className="max-w-xs mx-auto text-left pt-4">
                <h3 className="text-zinc-600 text-[10px] font-mono uppercase mb-3 flex items-center gap-2">
                  <History size={12} /> Your Past Queries
                </h3>
                <div className="space-y-2">
                  {localHistory.map((h, i) => (
                    <button key={i} onClick={() => jumpToQuery(h)} className="block text-zinc-400 hover:text-amber-500 text-sm transition-colors">
                      • {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
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
                {currentResults.map((r) => (
                  <Link key={r._id} to={r.url} className="block group">
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl group-hover:border-zinc-700 group-hover:bg-zinc-900/50 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          r.type === 'Journal' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' :
                          r.type === 'Project' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' :
                          r.type === 'Social' ? 'border-purple-500/30 text-purple-500 bg-purple-500/5' :
                          'border-amber-500/30 text-amber-500 bg-amber-500/5'
                        }`}>
                          {r.type}
                        </span>
                        {r.category && <span className="text-[10px] font-mono text-zinc-600">— {r.category}</span>}
                      </div>
                      <h3 className="text-white font-bold text-xl group-hover:text-amber-500 transition-colors mb-3 flex items-center justify-between">
                        {r.title}
                        <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-amber-500" />
                      </h3>
                      <div className="space-y-2">
                        {r.snippets.map((snip, i) => (
                          <p key={i} className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: snip }} />
                        ))}
                      </div>
                      {r.createdAtIST && <p className="mt-4 text-[10px] font-mono text-zinc-600 tracking-wider"><Clock size={10} className="inline mr-1" /> {r.createdAtIST}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
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