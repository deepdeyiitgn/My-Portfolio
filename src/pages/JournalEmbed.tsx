import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Eye, Heart, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import { marked } from 'marked';
import SEO from '../components/SEO';
import { buildJournalHtmlApiUrl } from '../utils/journalHtmlApiUrl';

// Configure marked for GitHub-flavored markdown
marked.setOptions({ gfm: true, breaks: true });

function renderMarkdown(text: string): string {
  try {
    return marked.parse(String(text || '')) as string;
  } catch {
    return '';
  }
}

function extractEmbedHtmlWithoutImages(rawHtml: string): string {
  try {
    const doc = new DOMParser().parseFromString(String(rawHtml || ''), 'text/html');
    doc.querySelectorAll('img, picture, source, figure, script, noscript').forEach((el) => el.remove());
    return String(doc.body?.innerHTML || '').trim();
  } catch {
    return '';
  }
}

interface Journal {
  _id: string;
  slug?: string;
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
  ' [&_img]:hidden' +
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlLoading, setHtmlLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      setJournal(null);
      setCommentCount(0);
      setHtmlContent('');
      setHtmlLoading(false);
      try {
        const isObjectId = /^[a-f\d]{24}$/i.test(id);
        const primaryUrl = isObjectId
          ? `/api/journal?id=${encodeURIComponent(id)}&countView=true`
          : `/api/journal?slug=${encodeURIComponent(id)}&countView=true`;
        const fallbackUrl = isObjectId
          ? `/api/journal?slug=${encodeURIComponent(id)}&countView=true`
          : `/api/journal?id=${encodeURIComponent(id)}&countView=true`;

        const fetchJournal = async (url: string): Promise<Journal | null> => {
          const r = await fetch(url);
          const d = await r.json().catch(() => ({}));
          if (!r.ok || !d?.ok || !d?.journal) return null;
          return d.journal as Journal;
        };

        const found = await fetchJournal(primaryUrl) || await fetchJournal(fallbackUrl);
        if (!mounted) return;
        if (!found) {
          setError('Journal not found');
          return;
        }
        setJournal(found);
      } catch {
        if (mounted) setError('Failed to load journal');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const normalizedContentType = useMemo(
    () => String(journal?.contentType || 'markdown').trim().toLowerCase(),
    [journal?.contentType],
  );

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!journal?._id) {
        if (mounted) setCommentCount(0);
        return;
      }
      try {
        const r = await fetch(`/api/journal?action=comment-count&journalIds=${encodeURIComponent(journal._id)}`);
        const d = await r.json().catch(() => ({}));
        if (!mounted) return;
        if (r.ok && d?.ok) {
          setCommentCount(Number(d?.counts?.[journal._id] || 0));
        }
      } catch {
        if (mounted) setCommentCount(0);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [journal?._id]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!journal || normalizedContentType !== 'html') {
        if (mounted) {
          setHtmlContent('');
          setHtmlLoading(false);
        }
        return;
      }
      const htmlRef = journal._id || journal.slug || id;
      const endpoint = buildJournalHtmlApiUrl(String(htmlRef || ''));
      if (mounted) {
        setHtmlLoading(true);
        setHtmlContent('');
      }
      try {
        const r = await fetch(endpoint, { headers: { Accept: 'text/html' } });
        const html = await r.text();
        if (!mounted) return;
        if (!r.ok) {
          setHtmlContent('');
          return;
        }
        setHtmlContent(extractEmbedHtmlWithoutImages(html));
      } catch {
        if (mounted) setHtmlContent('');
      } finally {
        if (mounted) setHtmlLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id, journal, normalizedContentType]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-500 p-4">Loading…</div>;
  }

  if (error || !journal) {
    return <div className="min-h-screen bg-zinc-950 text-red-400 p-4">{error || 'Journal not found'}</div>;
  }
  const journalUrl = `${window.location.origin}/journal/view/${encodeURIComponent(journal._id || journal.slug || id)}`;
  const publishedDateObj = journal.publishedAt ? new Date(journal.publishedAt) : null;
  const hasValidPublishedDate = Boolean(publishedDateObj && !Number.isNaN(publishedDateObj.getTime()));
  const publishedDate = hasValidPublishedDate
    ? publishedDateObj!.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    : String(journal.publishedAtIST || '').split(',')[0] || '';
  const publishedTime = hasValidPublishedDate
    ? publishedDateObj!.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 md:p-6 relative">
      <SEO
        title={`${journal.title} | Journal Embed`}
        description={journal.summary || 'Embedded journal post'}
        route={`/journal/embed/${encodeURIComponent(journal._id || journal.slug || id)}`}
        type="article"
      />
      <article className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">{journal.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-500">
          {publishedDate && (
            <span className="flex items-center gap-1 w-full sm:w-auto">
              <Calendar size={12} /> {publishedDate}
            </span>
          )}
          {publishedTime && <span className="flex items-center gap-1"><Clock size={12} /> {publishedTime}</span>}
          <span className="flex items-center gap-1">{timeAgo(journal.publishedAt)}</span>
          <span className="flex items-center gap-1"><Heart size={12} /> {Number(journal.likes || 0)} likes</span>
          <span className="flex items-center gap-1"><MessageSquare size={12} /> {commentCount} comments</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {Number(journal.views || 0)} views</span>
        </div>

        {journal.summary && <p className="text-zinc-400 text-sm">{journal.summary}</p>}

        <div className="border-t border-zinc-800 pt-5 text-zinc-300 prose prose-invert max-w-none text-sm">
          {normalizedContentType === 'html' ? (
            htmlLoading ? (
              <div className="w-full min-h-[420px] rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500 grid place-items-center">Loading HTML…</div>
            ) : (
              <div
                className={CONTENT_CLASSES}
                dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-zinc-500">No HTML content available.</p>' }}
              />
            )
          ) : normalizedContentType === 'richtext' ? (
            <div
              className={CONTENT_CLASSES}
              dangerouslySetInnerHTML={{ __html: String(journal.content || '') }}
            />
          ) : (
            <div
              className={CONTENT_CLASSES}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(String(journal.content || '')) }}
            />
          )}
        </div>
      </article>

      {/* go-to-journal button in bottom-right corner */}
      <a
        href={journalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-700/40 text-zinc-400 hover:text-amber-500 hover:border-amber-500/40 text-xs font-mono transition-all backdrop-blur-sm"
        title="Visit full journal page"
      >
        <ExternalLink size={12} />
        Visit page
      </a>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-mono text-zinc-600/90 pointer-events-none select-none text-center">
        from deepdey.vercel.app · a website by deep dey
      </div>
    </div>
  );
}
