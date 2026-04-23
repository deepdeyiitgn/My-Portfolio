import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Eye, Heart } from 'lucide-react';

interface Journal {
  _id: string;
  title: string;
  summary: string;
  content: string;
  readMinutes: number;
  likes?: number;
  views?: number;
}

function renderMarkdown(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-black text-amber-500 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-black text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\n\n/g, '</p><p class="text-zinc-300 text-sm mb-3">')
    .replace(/\n/g, '<br />');
}

export default function JournalEmbed() {
  const { id = '' } = useParams();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    setIsCompact(window.innerWidth < 520);
    const onResize = () => setIsCompact(window.innerWidth < 520);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetch(`/api/journal?id=${encodeURIComponent(id)}&countView=true`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setJournal(d.journal);
      })
      .catch(() => {
        // ignore
      });
  }, [id]);

  if (!journal) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-500 p-4">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 md:p-6">
      <article className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">{journal.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {journal.readMinutes} min read</span>
          <span className="flex items-center gap-1"><Heart size={12} /> {Number(journal.likes || 0)} likes</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {Number(journal.views || 0)} views</span>
        </div>
        {journal.summary && <p className="text-zinc-400 text-sm">{journal.summary}</p>}

        {isCompact ? (
          <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/30 text-sm text-zinc-400">
            {journal.summary || journal.content.slice(0, 240)}
          </div>
        ) : (
          <div
            className="border-t border-zinc-800 pt-5 text-zinc-300"
            dangerouslySetInnerHTML={{ __html: `<p class="text-zinc-300 text-sm mb-3">${renderMarkdown(journal.content)}</p>` }}
          />
        )}
      </article>
    </div>
  );
}
