import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, History, Clock, ArrowRight, Loader2, X,
  ChevronLeft, ChevronRight, Activity, TrendingUp, Sparkles, Zap
} from 'lucide-react';
import SEO from '../components/SEO';
import { faqData } from '../data/faqData';
import { projectsData } from '../data/projectsData';
import { renderIcon } from '../utils/iconMap';

// ── Types ────────────────────────────────────────────────────────────────────
interface SearchResult {
  _id: string;
  type: 'Journal' | 'Project' | 'FAQ' | 'System' | 'Social';
  title: string;
  url: string;
  category?: string;
  snippets: string[];
  createdAtIST?: string;
  isMl?: boolean; // true if found via ML fallback
}

// ── Typewriter configuration ──────────────────────────────────────────────────
const TYPEWRITER_FORWARD_DELAY = 110;   // ms per character when typing forward
const TYPEWRITER_PAUSE_DURATION = 2400; // ms to pause when fully typed
const TYPEWRITER_BACKWARD_DELAY = 55;   // ms per character when erasing

// ── ML configuration ──────────────────────────────────────────────────────────
/** Minimum cosine-similarity score for an ML result to be included */
const ML_SIMILARITY_THRESHOLD = 0.08;
/** When keyword search finds fewer than this many local results, ML fallback kicks in */
const MIN_KEYWORD_RESULTS_THRESHOLD = 2;

// ── Animation configuration ───────────────────────────────────────────────────
const RESULT_STAGGER_DELAY = 0.04;  // seconds between each result card entering
const RESULT_ANIM_DURATION = 0.25;  // seconds for each card fade-in

// ── Scroll configuration ──────────────────────────────────────────────────────
/** Pixels offset from top when scrolling to an element, accounts for the fixed header */
const HEADER_SCROLL_OFFSET = 120;

// ── Social triggers ───────────────────────────────────────────────────────────
const SOCIAL_TRIGGERS = ['insta', 'instagram', 'github', 'twitter', 'x', 'social', 'contact', 'youtube', 'linkedin', 'links'];

// ── Typewriter suggestions ────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Deep's current status",
  "IIT KGP 2027 goals",
  "Physics study journals",
  "Magic Bite business",
  "AI coding projects",
  "QuickLink SaaS",
  "my resume",
  "about deep dey",
];

// ── ML: Stop words ────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'of', 'and',
  'or', 'but', 'not', 'with', 'as', 'by', 'from', 'that', 'this', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i',
  'my', 'your', 'we', 'our', 'you', 'he', 'she', 'they', 'their', 'me',
  'what', 'how', 'why', 'when', 'who', 'which', 'so', 'just', 'also',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function buildVector(tokens: string[], vocab: string[]): number[] {
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return vocab.map(w => freq[w] || 0);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

/** TF-IDF cosine-similarity ML fallback — runs on local FAQ + Projects corpus */
function mlFallbackSearch(query: string, existingIds: Set<string>): SearchResult[] {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];

  type Candidate = { id: string; text: string; result: SearchResult };
  const corpus: Candidate[] = [];

  faqData.forEach(item => {
    if (existingIds.has(`faq-${item.id}`)) return;
    corpus.push({
      id: `faq-${item.id}`,
      text: `${item.question} ${item.answer}`,
      result: {
        _id: `faq-${item.id}`,
        type: 'FAQ',
        title: item.question,
        url: `/faq#faq-${item.id}`,
        snippets: [item.answer.substring(0, 140) + '...'],
        isMl: true,
      }
    });
  });

  projectsData.forEach(p => {
    if (existingIds.has(`proj-${p.id}`)) return;
    corpus.push({
      id: `proj-${p.id}`,
      text: `${p.title} ${p.shortDescription} ${p.category} ${p.techStack.join(' ')}`,
      result: {
        _id: `proj-${p.id}`,
        type: 'Project',
        title: p.title,
        url: `/projects/${p.id}`,
        category: p.category,
        snippets: [p.shortDescription.substring(0, 140) + '...'],
        isMl: true,
      }
    });
  });

  if (!corpus.length) return [];

  // Build shared vocabulary
  const allTokenSets = corpus.map(c => tokenize(c.text));
  const vocabSet = new Set<string>(qTokens);
  allTokenSets.forEach(t => t.forEach(w => vocabSet.add(w)));
  const vocab = Array.from(vocabSet);

  const qVec = buildVector(qTokens, vocab);

  return corpus
    .map((c, i) => ({ result: c.result, score: cosine(qVec, buildVector(allTokenSets[i], vocab)) }))
    .filter(x => x.score > ML_SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.result);
}

// ── Snippet helpers ───────────────────────────────────────────────────────────
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHighlightedSnippet = (plainText: string, matchIndex: number, matchLen: number, keywords: string[]): string => {
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(plainText.length, matchIndex + matchLen + 40);
  let snippet = plainText.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < plainText.length) snippet += '...';
  for (const kw of keywords) {
    snippet = snippet.replace(
      new RegExp(`(${escapeRegex(kw)})`, 'gi'),
      '<mark class="bg-amber-500/20 text-amber-500 rounded px-1 font-bold">$1</mark>'
    );
  }
  return snippet;
};

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
  return snippets.length > 0 ? snippets : [plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '')];
};

// ── Component ─────────────────────────────────────────────────────────────────
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

  // ── Typewriter animation ───────────────────────────────────────────────────
  const [tIdx, setTIdx] = useState(0);
  const [tText, setTText] = useState('');
  const [tReverse, setTReverse] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const full = SUGGESTIONS[tIdx];
    if (!tReverse) {
      if (tText.length < full.length) {
        tRef.current = setTimeout(() => setTText(full.slice(0, tText.length + 1)), TYPEWRITER_FORWARD_DELAY);
      } else {
        tRef.current = setTimeout(() => setTReverse(true), TYPEWRITER_PAUSE_DURATION);
      }
    } else {
      if (tText.length > 0) {
        tRef.current = setTimeout(() => setTText(tText.slice(0, -1)), TYPEWRITER_BACKWARD_DELAY);
      } else {
        setTReverse(false);
        setTIdx(i => (i + 1) % SUGGESTIONS.length);
      }
    }
    return () => { if (tRef.current) clearTimeout(tRef.current); };
  }, [tText, tReverse, tIdx]);

  // ── History ────────────────────────────────────────────────────────────────
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

  // ── Fetch trending on mount ────────────────────────────────────────────────
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

  // ── Search ─────────────────────────────────────────────────────────────────
  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setCurrentPage(1);
    saveToHistory(q);

    try {
      // 1. Backend journals + analytics
      const res = await fetch(`/api/journal?action=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();

      let combinedResults: SearchResult[] = [];
      if (data.ok) {
        combinedResults = [...data.results];
        setEasterEgg(data.easterEgg);
        if (Array.isArray(data.trending)) {
          setTrending(data.trending.map((t: { query: string }) => t.query));
        }
      }

      // 2. Local keyword search
      const keywords = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

      // Social card
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

      // FAQ — keyword
      faqData.forEach(item => {
        const haystack = `${item.question} ${item.answer}`.toLowerCase();
        if (keywords.some(kw => haystack.includes(kw))) {
          combinedResults.push({
            _id: `faq-${item.id}`,
            type: 'FAQ',
            title: item.question,
            url: `/faq#faq-${item.id}`,
            snippets: getLocalSnippets(item.answer, keywords)
          });
        }
      });

      // Projects — keyword
      projectsData.forEach(p => {
        const haystack = `${p.title} ${p.shortDescription}`.toLowerCase();
        if (keywords.some(kw => haystack.includes(kw))) {
          combinedResults.push({
            _id: `proj-${p.id}`,
            type: 'Project',
            title: p.title,
            url: `/projects/${p.id}`,
            snippets: getLocalSnippets(p.shortDescription, keywords)
          });
        }
      });

      // 3. ML fallback: if keyword search found few local results, supplement with TF-IDF
      const existingIds = new Set(combinedResults.map(r => r._id));
      const keywordLocalCount = combinedResults.filter(r => r.type === 'FAQ' || r.type === 'Project').length;
      if (keywordLocalCount < MIN_KEYWORD_RESULTS_THRESHOLD) {
        const mlResults = mlFallbackSearch(q, existingIds);
        combinedResults = [...combinedResults, ...mlResults];
      }

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
    // performSearch and saveToHistory are excluded intentionally; they only need rawQuery as trigger
  }, [rawQuery]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const jumpToQuery = (q: string) => {
    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const clearHistory = () => {
    setLocalHistory([]);
    localStorage.removeItem('dd_search_history');
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const mlCount = results.filter(r => r.isMl).length;
  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <SEO
        title={rawQuery ? `Results for "${rawQuery}"` : 'Search Engine | Deep Dey'}
        description="Global search for Deep Dey's ecosystem"
        route="/search"
      />

      {/* ── Hero / Landing State ─────────────────────────────────────────────── */}
      <div className={`transition-all duration-700 ${!rawQuery ? 'mt-10 text-center' : 'mb-10'}`}>
        {!rawQuery && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-5">
            {/* Logo — same image used as the site favicon (/assets/images/myphoto.png) */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/assets/images/myphoto.png"
                  alt="Deep Dey"
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              DEEP <span className="text-amber-500">SEARCH.</span>
            </h1>

            {/* Typewriter subtitle */}
            <div className="h-7 flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-amber-500 shrink-0 animate-pulse" />
              <p className="text-zinc-500 font-mono text-sm">
                Try:{' '}
                <span className="text-zinc-200">
                  {tText}
                  <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 align-middle animate-pulse" />
                </span>
              </p>
            </div>

            <p className="text-zinc-600 text-xs font-mono uppercase tracking-[0.25em]">
              Journals · Projects · FAQs · Social Links · Status
            </p>
          </motion.div>
        )}

        {/* ── Search Form ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
          {loading ? (
            <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" size={20} />
          ) : (
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" size={20} />
          )}
          <input
            ref={inputRef}
            autoFocus
            value={inputValue}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs, projects, FAQs, status…"
            className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-[2rem] pl-14 pr-16 py-5 text-white text-lg focus:outline-none focus:border-amber-500/50 shadow-2xl transition-all placeholder:text-zinc-600"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </form>

        {/* ── Empty-state: Trending + History ─────────────────────────────── */}
        {!rawQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-12 space-y-10"
          >
            {/* Trending */}
            <div>
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">
                <TrendingUp size={10} /> Trending
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {(trending.length > 0
                  ? trending
                  : ["deep's status", "iit kharagpur", "magic bite", "projects", "resume"]
                ).map(tag => (
                  <button
                    key={tag}
                    onClick={() => jumpToQuery(tag)}
                    className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:border-amber-500/50 hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Past Queries */}
            {localHistory.length > 0 && (
              <div className="max-w-xs mx-auto text-left">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-zinc-600 text-[10px] font-mono uppercase flex items-center gap-2">
                    <History size={11} /> Past Queries
                  </h3>
                  <button onClick={clearHistory} className="text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors font-mono">clear</button>
                </div>
                <div className="space-y-2">
                  {localHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToQuery(h)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 text-sm transition-colors group w-full text-left"
                    >
                      <Clock size={11} className="text-zinc-700 group-hover:text-amber-500/60 shrink-0" />
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Results area ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-24 gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 animate-ping absolute inset-0" />
              <div className="w-14 h-14 rounded-full border-2 border-amber-500/50 flex items-center justify-center">
                <Search size={24} className="text-amber-500" />
              </div>
            </div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Searching Deep's Ecosystem…</p>
          </motion.div>
        ) : rawQuery ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-4">
              <p className="text-zinc-500 text-sm">
                <span className="text-white font-bold">{results.length}</span> results for{' '}
                "<span className="text-amber-500">{rawQuery}</span>"
                {mlCount > 0 && (
                  <span className="ml-2 text-[10px] font-mono text-zinc-600">
                    (+{mlCount} via <Zap size={9} className="inline text-amber-500/70" /> AI)
                  </span>
                )}
              </p>
              <span className="text-[10px] font-mono text-zinc-700">~240ms</span>
            </div>

            {/* 🥚 Easter egg */}
            {easterEgg && (
              <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="p-6 bg-zinc-900 border border-amber-500/30 rounded-3xl relative overflow-hidden">
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

            {/* No results */}
            {!hasResults ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed space-y-4">
                <Search size={36} className="mx-auto text-zinc-700" />
                <p className="text-zinc-500">No results for "<span className="text-amber-500">{rawQuery}</span>".</p>
                <p className="text-zinc-700 text-sm">Try broader keywords like "code", "study", or "status".</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {currentResults.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * RESULT_STAGGER_DELAY, duration: RESULT_ANIM_DURATION }}
                  >
                    <Link to={r.url} className="block group">
                      <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl group-hover:border-zinc-700 group-hover:bg-zinc-900/60 transition-all">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            r.type === 'Journal'   ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' :
                            r.type === 'Project'   ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' :
                            r.type === 'Social'    ? 'border-purple-500/30 text-purple-500 bg-purple-500/5' :
                                                     'border-amber-500/30 text-amber-500 bg-amber-500/5'
                          }`}>
                            {r.type}
                          </span>
                          {r.category && <span className="text-[10px] font-mono text-zinc-600">— {r.category}</span>}
                          {r.isMl && (
                            <span className="text-[9px] font-mono text-amber-500/60 flex items-center gap-0.5">
                              <Zap size={8} /> AI
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-lg md:text-xl group-hover:text-amber-500 transition-colors mb-3 flex items-center justify-between gap-3">
                          <span>{r.title}</span>
                          <ArrowRight size={17} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all text-amber-500 shrink-0" />
                        </h3>
                        <div className="space-y-1.5">
                          {r.snippets.map((snip, si) => (
                            <p key={si} className="text-zinc-400 text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: snip }} />
                          ))}
                        </div>
                        {r.createdAtIST && (
                          <p className="mt-3 text-[10px] font-mono text-zinc-700">
                            <Clock size={9} className="inline mr-1" />{r.createdAtIST}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white disabled:opacity-30 border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-mono text-zinc-500">Page {currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white disabled:opacity-30 border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}