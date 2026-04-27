import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Eye, Heart, ExternalLink, Calendar } from 'lucide-react';

interface Journal {
  _id: string;
  title: string;
  summary: string;
  content: string;
  contentType?: string;
  publishedAt?: string | null;
  publishedAtIST?: string | null;
  readMinutes: number;
  likes?: number;
  views?: number;
}

function timeAgo(dateString?: string | null) {
  if (!dateString) return '';
  const past = new Date(dateString);
  const diffMs = Date.now() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
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

  const journalUrl = `${window.location.origin}/journal/view/${id}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 md:p-6">
      <article className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">{journal.title}</h1>
        
        {/* PURANA CODE (Jisme error tha, comment kar diya hai)
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1"><Clock size={12} /> {journal.readMinutes} min read</span>
            <span className="flex items-center gap-1"><Heart size={12} /> {Number(journal.likes || 0)} likes</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {Number(journal.views || 0)} views</span>
            <span className="uppercase text-amber-500/50 border border-amber-500/20 px-1.5 rounded">{journal.contentType || 'markdown'}</span>
            </div>
          </div>
        */}

        {/* NAYA CODE (Extra </div> hata diya) */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-500">
            {journal.publishedAtIST && (
              <span className="flex items-center gap-1 w-full sm:w-auto">
                <Calendar size={12} /> {journal.publishedAtIST} ({timeAgo(journal.publishedAt)})
              </span>
            )}
            <span className="flex items-center gap-1"><Clock size={12} /> {journal.readMinutes} min read</span>
            <span className="flex items-center gap-1"><Heart size={12} /> {Number(journal.likes || 0)} likes</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {Number(journal.views || 0)} views</span>
            <span className="uppercase text-amber-500/50 border border-amber-500/20 px-1.5 rounded">{journal.contentType || 'markdown'}</span>
        </div>

        {journal.summary && <p className="text-zinc-400 text-sm">{journal.summary}</p>}

        {isCompact ? (
          <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/30 text-sm text-zinc-400">
            {journal.summary || journal.content.slice(0, 240)}
          </div>
        ) : (
          <div className="border-t border-zinc-800 pt-5 text-zinc-300 prose prose-invert max-w-none">
            {journal.contentType === 'html' || journal.contentType === 'richtext' ? (
              <div className="text-sm w-full overflow-x-auto break-words [word-break:normal]" dangerouslySetInnerHTML={{ __html: journal.content }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: `<p class="text-zinc-300 text-sm mb-3">${renderMarkdown(journal.content)}</p>` }} />
            )}
          </div>
        )}
      </article>

      {/* Transparent go-to-journal button in bottom-right corner */}
      <a
        href={journalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-700/40 text-zinc-400 hover:text-amber-500 hover:border-amber-500/40 text-xs font-mono transition-all backdrop-blur-sm"
        title="Open full journal"
      >
        <ExternalLink size={12} />
        Open
      </a>
    </div>
  );
}