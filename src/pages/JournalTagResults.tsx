import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Tag, Hash, Clock, Heart, Eye } from 'lucide-react';
import SEO from '../components/SEO';

interface JournalItem {
  _id: string;
  slug?: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  readMinutes: number;
  likes?: number;
  views?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function JournalTagResults() {
  const { tag = '', hashtag = '' } = useParams();
  const isHashtagPage = Boolean(hashtag);
  const rawToken = String(isHashtagPage ? hashtag : tag).trim().toUpperCase();
  const [journals, setJournals] = useState<JournalItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJournals = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ published: 'true', page: String(page), limit: '20' });
      params.set(isHashtagPage ? 'hashtag' : 'tag', rawToken);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d?.message || 'Failed to load journals');
      } else {
        setJournals(Array.isArray(d.journals) ? d.journals : []);
        setPagination(d.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch {
      setError('Failed to load journals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rawToken) {
      setJournals([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
      setLoading(false);
      return;
    }
    fetchJournals(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawToken, isHashtagPage]);

  const pageTitle = isHashtagPage ? `#${rawToken}` : rawToken;
  const pageRoute = isHashtagPage
    ? `/journal/hastags/${encodeURIComponent(rawToken)}`
    : `/journal/tags/${encodeURIComponent(rawToken)}`;

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-8">
      <SEO
        title={`${isHashtagPage ? 'Hashtag' : 'Tag'}: ${pageTitle} | Journal`}
        description={`Journal posts tagged with ${pageTitle}`}
        route={pageRoute}
      />

      <div className="space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-500">
          {isHashtagPage ? 'Journal Hashtag' : 'Journal Tag'}
        </p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight flex items-center gap-3">
          {isHashtagPage ? <Hash size={30} className="text-fuchsia-400" /> : <Tag size={30} className="text-emerald-400" />}
          {pageTitle}
        </h1>
        <p className="text-zinc-500 text-sm">Total posts: {pagination.total}</p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      )}

      {!loading && error && <div className="text-red-400 text-sm">{error}</div>}

      {!loading && !error && journals.length === 0 && (
        <div className="text-zinc-600 text-sm border border-zinc-800 rounded-2xl p-6 bg-zinc-900/20">
          No journal posts found for this {isHashtagPage ? 'hashtag' : 'tag'}.
        </div>
      )}

      {!loading && journals.length > 0 && (
        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {journals.map((item) => (
            <article key={item._id} className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
              {item.summary && <p className="text-zinc-400 text-sm line-clamp-3">{item.summary}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1"><Clock size={10} /> {item.readMinutes} min</span>
                <span className="flex items-center gap-1"><Heart size={10} /> {Number(item.likes || 0)}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {Number(item.views || 0)}</span>
                <span className="col-span-2">
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
                </span>
              </div>
              <Link
                to={`/journal/view/${encodeURIComponent(item.slug || item._id)}`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-colors"
              >
                Read Journal
              </Link>
            </article>
          ))}
        </section>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchJournals(pagination.page - 1)}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-zinc-600 text-xs font-mono">Page {pagination.page} / {pagination.totalPages}</span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchJournals(pagination.page + 1)}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
