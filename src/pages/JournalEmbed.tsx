import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Eye, Heart, ExternalLink, Calendar } from 'lucide-react';
import { marked } from 'marked';

// Configure marked for GitHub-flavored markdown
marked.setOptions({ gfm: true, breaks: true });

function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}

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

const CONTENT_CLASSES =
  'w-full overflow-x-auto break-words [word-break:normal]' +
  ' [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-zinc-300' +
  ' [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3' +
  ' [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-amber-500 [&_h2]:mt-5 [&_h2]:mb-2' +
  ' [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2' +
  ' [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-white [&_h4]:mt-3 [&_h4]:mb-1' +
  ' [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3' +
  ' [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3' +
  ' [&_li]:mb-1 [&_li]:text-zinc-300' +
  ' [&_strong]:text-white [&_em]:italic [&_del]:line-through' +
  ' [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_blockquote]:my-3' +
  ' [&_img]:rounded-xl [&_img]:my-3 [&_img]:max-w-full' +
  ' [&_a]:text-amber-400 [&_a]:underline [&_a:hover]:text-amber-300' +
  ' [&_code]:bg-zinc-800 [&_code]:text-amber-400 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm' +
  ' [&_pre]:bg-zinc-800 [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-3' +
  ' [&_pre_code]:bg-transparent [&_pre_code]:text-zinc-300 [&_pre_code]:p-0' +
  ' [&_table]:w-full [&_table]:border-collapse [&_table]:my-3' +
  ' [&_th]:border [&_th]:border-zinc-700 [&_th]:p-2 [&_th]:text-left [&_th]:bg-zinc-800' +
  ' [&_td]:border [&_td]:border-zinc-700 [&_td]:p-2' +
  ' [&_hr]:border-zinc-700 [&_hr]:my-4' +
  ' [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:my-3 [&_iframe]:min-h-[200px]' +
  ' [&_video]:w-full [&_video]:rounded-xl [&_video]:my-3' +
  ' [&_audio]:w-full [&_audio]:my-3';

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
          <div className="border-t border-zinc-800 pt-5 text-zinc-300 prose prose-invert max-w-none text-sm">
            {journal.contentType === 'html' || journal.contentType === 'richtext' ? (
              <div
                className={CONTENT_CLASSES}
                dangerouslySetInnerHTML={{ __html: journal.content }}
              />
            ) : (
              <div
                className={CONTENT_CLASSES}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(journal.content) }}
              />
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
