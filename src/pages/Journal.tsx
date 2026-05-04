import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronLeft, ChevronRight, Clock, Tag, Loader2, AlertCircle, RefreshCw, Eye, Heart, X, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

interface JournalItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  published: boolean;
  publishedAt: string | null;
  publishedAtIST: string | null;
  readMinutes: number;
  likes?: number;
  views?: number;
  commentCount?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Journal() {
  const [journals, setJournals] = useState<JournalItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  
  // Modal ke andar use hone wale temp states (jab tak Apply na ho)
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempSortBy, setTempSortBy] = useState('recent');
  const [quickCategories, setQuickCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/categories');
      const d = await r.json();
      if (d.ok) {
        setCategories(d.categories);
        // Randomly 3-4 categories pick karna quick filter ke liye
        const shuffled = [...d.categories].sort(() => 0.5 - Math.random());
        setQuickCategories(shuffled.slice(0, 4));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchJournals = useCallback(async (page = 1, catsFilter: string[] = [], sortParam = 'recent') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', published: 'true' });
      if (catsFilter.length > 0) {
        params.set('categories', catsFilter.join(','));
      }
      params.set('sort', sortParam);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (d.ok) {
        setJournals(d.journals);
        setPagination(d.pagination);
        // Fetch comment counts for loaded journals
        const ids = d.journals.map((j: JournalItem) => j._id).filter(Boolean).join(',');
        if (ids) {
          fetch(`/api/journal?action=comment-count&journalIds=${encodeURIComponent(ids)}`)
            .then(r2 => r2.json())
            .then(d2 => { if (d2.ok) setCommentCounts(d2.counts || {}); })
            .catch(() => {});
        }
      } else {
        setError(d.message || 'Failed to load journals');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchJournals(1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchJournals(1, [], 'recent');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickCategoryToggle = (slug: string) => {
    let newCats;
    if (filterCategories.includes(slug)) {
      newCats = filterCategories.filter(c => c !== slug); // Remove if selected
    } else {
      newCats = [...filterCategories, slug]; // Add if not selected
    }
    setFilterCategories(newCats);
    fetchJournals(1, newCats, sortBy);
  };

  const handlePageChange = (newPage: number) => {
    fetchJournals(newPage, filterCategories, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-12">
      <SEO
        title="Build Journal | Deep Dey"
        description="Articles, build logs, and engineering notes from Deep Dey."
        route="/journal"
      />

      <div className="space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Content Engine</h2>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">JOURNAL.</h1>
        <p className="text-zinc-500 max-w-3xl">
          Articles, build logs, and engineering notes — open any entry to view full content, share it, embed it, and react with likes.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setFilterCategories([]);
              fetchJournals(1, [], sortBy);
            }}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
              filterCategories.length === 0
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-zinc-900/20 text-zinc-400 border-zinc-800 hover:border-amber-500/40'
            }`}
          >
            All
          </button>
          {quickCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleQuickCategoryToggle(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                filterCategories.includes(cat.slug)
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-900/20 text-zinc-400 border-zinc-800 hover:border-amber-500/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
          
          <button
            onClick={() => {
              setTempCategories(filterCategories);
              setTempSortBy(sortBy);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-full flex items-center gap-2 text-xs uppercase tracking-widest border bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 transition-colors ml-auto"
          >
            <Tag size={12} /> Filters & Sort
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-5 bg-red-900/20 border border-red-800 rounded-2xl text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => fetchJournals(pagination.page, filterCategories, sortBy)}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-800/30 rounded-xl text-xs hover:bg-red-800/50 transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && journals.length === 0 && (
        <div className="text-center py-20 text-zinc-600 space-y-3">
          <BookOpen size={36} className="mx-auto opacity-30" />
          <p className="text-sm">No journals published yet. Check back soon.</p>
        </div>
      )}

      {!loading && journals.length > 0 && (
        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {journals.map((item, i) => (
            <motion.article
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {item.categoryName && (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-amber-500">
                    <Tag size={9} />
                    {item.categoryName}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
              {item.summary && <p className="text-zinc-400 text-sm line-clamp-3">{item.summary}</p>}

              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {item.readMinutes} min read
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={10} /> {Number(item.likes || 0)} likes
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={10} /> {Number(item.views || 0)} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={10} /> {commentCounts[item._id] || 0} comments
                </span>
                <span className="col-span-2">
                  {item.publishedAtIST
                    ? item.publishedAtIST.slice(0, 10)
                    : item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
                      : ''}
                </span>
              </div>

              <Link
                to={`/journal/view/${item._id}`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-colors"
              >
                Read Journal
              </Link>
            </motion.article>
          ))}
        </section>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-bold"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    page === pagination.page
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-bold"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {!loading && pagination.total > 0 && (
        <p className="text-center text-zinc-700 text-xs font-mono">
          Showing {journals.length} of {pagination.total} entries · Page {pagination.page} of {pagination.totalPages}
        </p>
      )}
{/* FILTER & SORT MODAL */}
      {isModalOpen && (
        // Mobile pe bottom se attach hoga (justify-end), Desktop pe center (sm:justify-center)
        <div className="fixed inset-0 z-[100] flex items-center justify-end sm:justify-center bg-black/80 backdrop-blur-sm sm:p-4">
          
          <div className="bg-zinc-900 border border-zinc-800 sm:rounded-3xl rounded-t-3xl p-6 w-full max-w-md max-h-[85vh] sm:h-auto flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-bold text-white">Filter & Sort</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-white p-2 bg-zinc-800/50 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Scrollable Middle Content */}
            <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-8 min-h-0">
              
              {/* Sort Options */}
              <div>
                <h4 className="text-[10px] font-mono text-amber-500 tracking-widest uppercase mb-3">Sort By</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'recent', label: 'Most Recent' },
                    { id: 'old', label: 'Oldest' },
                    { id: 'most-liked', label: 'Most Liked' },
                    { id: 'most-viewed', label: 'Most Viewed' },
                    { id: 'relevant', label: 'Relevant (Random)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTempSortBy(opt.id)}
                      className={`p-3 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider border transition-all ${
                        tempSortBy === opt.id 
                          ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multiple Categories with internal scrolling */}
              <div className="flex flex-col h-full pb-2">
                <h4 className="text-[10px] font-mono text-amber-500 tracking-widest uppercase mb-3 shrink-0">
                  Categories (Multi-Select)
                </h4>
                
                {/* Specific scroll area for tags */}
                <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto custom-scrollbar p-1">
                  
                  {/* "All" Option */}
                  <button
                    onClick={() => setTempCategories([])}
                    className={`px-4 py-2.5 rounded-xl text-xs transition-all border ${
                      tempCategories.length === 0 
                        ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    All Categories
                  </button>

                  {/* Fetched Categories */}
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        if (tempCategories.includes(cat.slug)) {
                          setTempCategories(tempCategories.filter(c => c !== cat.slug));
                        } else {
                          setTempCategories([...tempCategories, cat.slug]);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs transition-all border ${
                        tempCategories.includes(cat.slug) 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-5 mt-2 border-t border-zinc-800 shrink-0">
              <button
                onClick={() => {
                  setTempCategories([]);
                  setTempSortBy('recent');
                }}
                className="flex-[1] py-3.5 rounded-xl border border-zinc-700 text-zinc-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  setFilterCategories(tempCategories);
                  setSortBy(tempSortBy);
                  setIsModalOpen(false);
                  fetchJournals(1, tempCategories, tempSortBy); 
                }}
                className="flex-[2] py-3.5 rounded-xl bg-amber-500 text-black text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}     
    </div>
  );
}
