import { useEffect, useState } from 'react';

type Props = {
  endpoint: string;
  title: string;
  className?: string;
};

export default function JournalHtmlBlobRenderer({ endpoint, title, className = '' }: Props) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    let localBlobUrl = '';
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const r = await fetch(endpoint, { headers: { Accept: 'text/html' } });
        if (!r.ok) throw new Error('Failed to load HTML');
        const html = await r.text();
        if (!mounted) return;
        const blob = new Blob([html], { type: 'text/html' });
        localBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(localBlobUrl);
      } catch {
        if (mounted) setError('Failed to load HTML content');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
  }, [endpoint]);

  if (loading) {
    return <div className="w-full min-h-[420px] rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500 grid place-items-center">Loading HTML…</div>;
  }

  if (error || !blobUrl) {
    return <div className="w-full min-h-[240px] rounded-2xl border border-red-900/50 bg-red-950/20 text-red-400 grid place-items-center px-4 text-center">{error || 'Unable to render HTML content'}</div>;
  }

  return (
    <object
      data={blobUrl}
      type="text/html"
      aria-label={title}
      className={`w-full min-h-[640px] rounded-2xl border border-zinc-800 bg-zinc-950 ${className}`.trim()}
    >
      <a href={blobUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">
        Open HTML content
      </a>
    </object>
  );
}
