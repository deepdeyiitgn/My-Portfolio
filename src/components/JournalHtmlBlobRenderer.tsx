import { useEffect, useRef, useState } from 'react';

type Props = {
  endpoint: string;
  title: string;
  className?: string;
};

export default function JournalHtmlBlobRenderer({ endpoint, title, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [htmlText, setHtmlText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const r = await fetch(endpoint, { headers: { Accept: 'text/html' } });
        if (!r.ok) throw new Error(`Failed to load HTML (${r.status})`);
        const html = await r.text();
        if (!mounted) return;
        setHtmlText(html);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load HTML content');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  useEffect(() => {
    if (!htmlText || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const hostDoc = container.ownerDocument;

    const appendNode = (node: ChildNode) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === 'script') {
        const oldScript = node as HTMLScriptElement;
        const newScript = hostDoc.createElement('script');
        for (const attr of Array.from(oldScript.attributes)) {
          newScript.setAttribute(attr.name, attr.value);
        }
        newScript.text = oldScript.textContent || '';
        container.appendChild(newScript);
        return;
      }

      container.appendChild(hostDoc.importNode(node, true));
    };

    const headNodes = doc.head ? Array.from(doc.head.childNodes).filter((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const tag = (node as Element).tagName.toLowerCase();
      return tag === 'style' || tag === 'link' || tag === 'script';
    }) : [];

    const bodyNodes = doc.body ? Array.from(doc.body.childNodes) : [];

    for (const node of [...headNodes, ...bodyNodes]) {
      appendNode(node);
    }

    return () => {
      container.innerHTML = '';
    };
  }, [htmlText]);

  if (loading) {
    return <div className="w-full min-h-[420px] rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500 grid place-items-center">Loading HTML…</div>;
  }

  if (error || !htmlText) {
    return <div role="alert" className="w-full min-h-[240px] rounded-2xl border border-red-900/50 bg-red-950/20 text-red-400 grid place-items-center px-4 text-center">{error || 'Unable to render HTML content'}</div>;
  }

  return (
    <div
      ref={containerRef}
      aria-label={title}
      className={`w-full min-h-[640px] rounded-2xl border border-zinc-800 bg-zinc-950 p-4 overflow-x-auto ${className}`.trim()}
    />
  );
}
