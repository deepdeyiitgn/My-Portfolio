import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import { useExternalLinkProxy } from '../hooks/useExternalLinkProxy';
import type { UpdateItem } from '../types/community';

export default function Updates() {
  const { identity } = useGoogleIdentity();
  const { openExternal, isExternalUrl } = useExternalLinkProxy();
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const credential = identity?.credential ? `&credential=${encodeURIComponent(identity.credential)}` : '';
        const response = await fetch(`/api/journal?action=updates-feed&page=${page}&limit=20${credential}`);
        const payload = await response.json();
        if (!response.ok || !payload?.ok) throw new Error(payload?.message || 'Failed to load updates');
        if (cancelled) return;
        setItems(Array.isArray(payload.items) ? payload.items : []);
        setTotalPages(Math.max(1, Number(payload.totalPages || 1)));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load updates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [identity?.credential, page]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <SEO
        title="Updates Channel | Deep Dey"
        description="System alerts and admin announcements in one paginated updates channel."
        route="/updates"
      />
      <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Updates</h2>
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">System + Admin Feed</h1>

      {loading && <p className="text-zinc-500">Loading updates...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item._id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
              <span className={item.kind === 'system' ? 'text-emerald-400' : 'text-amber-400'}>{item.kind}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">{item.createdAtIST || new Date(item.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <h3 className="text-white font-bold text-lg">{item.title}</h3>
            <p className="text-zinc-300 text-sm">{item.message}</p>
            {item.ctaUrl && (
              <button
                onClick={() => {
                  if (isExternalUrl(item.ctaUrl!)) {
                    openExternal(item.ctaUrl!, '/updates');
                  } else {
                    window.location.assign(item.ctaUrl!);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 text-black text-xs font-black"
              >
                {item.ctaLabel || 'Open'}
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-zinc-500 text-sm">Page {page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
