import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import { useExternalLinkProxy } from '../hooks/useExternalLinkProxy';
import type { UpdateItem } from '../types/community';

export default function Updates() {
  const { identity } = useGoogleIdentity();
  const { openExternal, isExternalUrl } = useExternalLinkProxy();
  const [ownerAuthed, setOwnerAuthed] = useState(false);
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth')
      .then((response) => response.json())
      .then((payload) => setOwnerAuthed(Boolean(payload?.authenticated)))
      .catch(() => setOwnerAuthed(false));
  }, []);

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

  const createUpdate = async () => {
    if (!ownerAuthed || !title.trim() || !message.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/journal?action=updates-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          ctaLabel: ctaLabel.trim(),
          ctaUrl: ctaUrl.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || 'Failed to publish update');
      if (payload?.item) {
        setItems((prev) => [{ ...payload.item, _id: String(payload.item._id) }, ...prev]);
      }
      setTitle('');
      setMessage('');
      setCtaLabel('');
      setCtaUrl('');
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish update');
    } finally {
      setSaving(false);
    }
  };

  const deleteUpdate = async (id: string) => {
    if (!ownerAuthed) return;
    try {
      const response = await fetch('/api/journal?action=updates-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || 'Failed to delete update');
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete update');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <SEO
        title="Updates Channel | Deep Dey"
        description="System alerts and admin announcements in one paginated updates channel."
        route="/updates"
      />
      <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Updates</h2>
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">System + Admin Feed</h1>

      {ownerAuthed && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-mono">Owner Broadcast Console</p>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Update title" className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Update message" className="w-full min-h-24 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
          <div className="grid md:grid-cols-2 gap-2">
            <input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} placeholder="CTA label (optional)" className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
            <input value={ctaUrl} onChange={(event) => setCtaUrl(event.target.value)} placeholder="CTA URL (optional)" className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
          </div>
          <button
            onClick={createUpdate}
            disabled={saving || !title.trim() || !message.trim()}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black disabled:opacity-50"
          >
            {saving ? 'Publishing…' : 'Publish Update'}
          </button>
        </section>
      )}

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
            {ownerAuthed && (
              <button
                onClick={() => deleteUpdate(item._id)}
                className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold"
              >
                Delete
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
