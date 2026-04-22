import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronLeft, ChevronRight, Clock, Tag, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';

interface JournalItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categorySlug: string;
  categoryName: string;
  published: boolean;
  publishedAt: string | null;
  publishedAtIST: string | null;
  createdAt: string;
  readMinutes: number;
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
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/categories');
      const d = await r.json();
      if (d.ok) setCategories(d.categories);
    } catch { /* ignore */ }
  }, []);

  const fetchJournals = useCallback(async (page = 1, catFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', published: 'true' });
      if (catFilter) params.set('category', catFilter);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (d.ok) {
        setJournals(d.journals);
        setPagination(d.pagination);
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

  const handleCategoryChange = (slug: string) => {
    setFilterCategory(slug);
    fetchJournals(1, slug);
  };

  const handlePageChange = (newPage: number) => {
    fetchJournals(newPage, filterCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <SEO
        title="Build Journal | Deep Dey"
        description="Articles, build logs, and engineering notes from Deep Dey."
        route="/journal"
      />

      <div className="space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Content Engine</h2>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">JOURNAL.</h1>
        <p className="text-zinc-500 max-w-2xl">
          Articles, build logs, and engineering notes — published thoughts on systems, code, and building in public.
        </p>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
              filterCategory === ''
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-zinc-900/20 text-zinc-400 border-zinc-800 hover:border-amber-500/40'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                filterCategory === cat.slug
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-900/20 text-zinc-400 border-zinc-800 hover:border-amber-500/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-5 bg-red-900/20 border border-red-800 rounded-2xl text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => fetchJournals(pagination.page, filterCategory)}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-800/30 rounded-xl text-xs hover:bg-red-800/50 transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && journals.length === 0 && (
        <div className="text-center py-20 text-zinc-600 space-y-3">
          <BookOpen size={36} className="mx-auto opacity-30" />
          <p className="text-sm">No journals published yet. Check back soon.</p>
        </div>
      )}

      {/* Journal list */}
      {!loading && journals.length > 0 && (
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((item, i) => (
            <motion.article
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4 hover:border-zinc-700 transition-all cursor-pointer"
              onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
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
              {item.summary && <p className="text-zinc-400 text-sm">{item.summary}</p>}
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {item.publishedAtIST
                    ? item.publishedAtIST.slice(0, 16) + ' IST'
                    : item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
                      : ''}
                </span>
                <span>{item.readMinutes} min read</span>
              </div>

              {/* Expanded content */}
              {expandedId === item._id && item.content && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-zinc-800 pt-4 text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap overflow-hidden"
                >
                  {item.content.slice(0, 1200)}{item.content.length > 1200 ? '…' : ''}
                </motion.div>
              )}
            </motion.article>
          ))}
        </section>
      )}

      {/* Pagination */}
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
    </div>
  );
}
