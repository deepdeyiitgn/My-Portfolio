import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Eye, Heart, Share2, Code2, X, ChevronLeft, ChevronRight, Link2, ArrowLeft, Calendar } from 'lucide-react';
import SEO from '../components/SEO';

interface Journal {
  _id: string;
  title: string;
  summary: string;
  content: string;
  contentType?: string; // NAYA: Content Type yaha add hua
  categoryName: string;
  publishedAt: string | null;
  publishedAtIST: string | null;
  readMinutes: number;
  likes?: number;
  views?: number;
  images?: string[];
}

function sessionLikeKey(id: string) {
  return `journal-liked-${id}`;
}

function getSessionId() {
  const key = 'journal-session-id';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const generated = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(key, generated);
  return generated;
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
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black text-amber-500 mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black text-white mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-800 text-amber-400 px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-zinc-300 leading-relaxed mb-4">')
    .replace(/\n/g, '<br />');
}

function sanitizeImageUrl(value: string) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    // 👇 YAHAN BHI DONO DOMAIN ALLOW KAR DE 👇
    if ((parsed.hostname === 'static.qlynk.me' || parsed.hostname === 'deydeep-static-files.hf.space') && /^\/f\//.test(parsed.pathname)) return parsed.toString();
    if (/\.(png|jpe?g)(\?.*)?$/i.test(parsed.toString())) return parsed.toString();
    return '';
  } catch {
    return '';
  }
}

export default function JournalView() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    setLiked(sessionStorage.getItem(sessionLikeKey(id)) === '1');
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        // If id looks like a MongoDB ObjectId (24 hex chars) use ?id=, otherwise
        // the value is a human-readable slug — use ?slug= so the API resolves it.
        const isObjectId = /^[a-f\d]{24}$/i.test(id);
        const apiUrl = isObjectId
          ? `/api/journal?id=${encodeURIComponent(id)}&countView=true`
          : `/api/journal?slug=${encodeURIComponent(id)}&countView=true`;
        const r = await fetch(apiUrl);
        const d = await r.json();
        if (!mounted) return;
        if (!r.ok || !d.ok) {
          setError(d.message || 'Journal not found');
        } else {
          setJournal(d.journal);
        }
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

  const embedCode = useMemo(() => {
    const src = `${window.location.origin}/journal/embed/${id}`;
    return `<iframe src="${src}" width="100%" height="600" style="border:0;max-width:100%;" loading="lazy" title="${journal?.title || 'Journal'}"></iframe>`;
  }, [id, journal?.title]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = journal?.title || 'Journal';
    const text = journal?.summary || 'Read this journal post';
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  const handleLike = async () => {
    if (!journal || liked) return;
    try {
      const session = getSessionId();
      const r = await fetch(`/api/journal?action=like&id=${encodeURIComponent(journal._id)}&session=${encodeURIComponent(session)}`, {
        method: 'POST',
      });
      const d = await r.json();
      if (d.ok) {
        setLiked(true);
        sessionStorage.setItem(sessionLikeKey(journal._id), '1');
        setJournal((prev) => (prev ? { ...prev, likes: Number(d.likes || prev.likes || 0) } : prev));
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-20 text-zinc-500">Loading journal...</div>;
  }

  if (error || !journal) {
    return <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-20 text-red-400">{error || 'Not found'}</div>;
  }

  const images = (Array.isArray(journal.images) ? journal.images : [])
    .map((img) => sanitizeImageUrl(img))
    .filter(Boolean);

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-8">
      <SEO title={`${journal.title} | Journal`} description={journal.summary || 'Journal post'} route={`/journal/view/${id}`} />

      {/* Go Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/40 text-sm font-bold transition-all"
      >
        <ArrowLeft size={14} /> Go Back
      </button>

      <article className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
          {journal.categoryName && <span className="px-3 py-1 rounded-full border border-amber-500/30 text-amber-500">{journal.categoryName}</span>}
          {journal.publishedAtIST && (
            <span className="flex items-center gap-1 normal-case tracking-normal">
              <Calendar size={12} /> {journal.publishedAtIST} ({timeAgo(journal.publishedAt)})
            </span>
          )}
          <span className="flex items-center gap-1"><Clock size={12} /> {journal.readMinutes} min read</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {Number(journal.views || 0)} views</span>
          <span className="flex items-center gap-1"><Heart size={12} /> {Number(journal.likes || 0)} likes</span>
          <span className="px-2 py-0.5 rounded-md border border-amber-500/20 text-amber-500/70">{journal.contentType || 'markdown'}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">{journal.title}</h1>
        {journal.summary && <p className="text-zinc-400 max-w-4xl">{journal.summary}</p>}

        <div className="flex flex-wrap gap-3">
          <button onClick={handleShare} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-500/40 hover:text-amber-500 text-sm font-bold flex items-center gap-2">
            <Share2 size={14} /> Share
          </button>
          <button onClick={handleLike} disabled={liked} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-500/40 hover:text-amber-500 text-sm font-bold flex items-center gap-2 disabled:opacity-50">
            <Heart size={14} /> {liked ? 'Liked' : 'Like'}
          </button>
          <button onClick={() => setEmbedOpen(true)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-500/40 hover:text-amber-500 text-sm font-bold flex items-center gap-2">
            <Code2 size={14} /> Embed
          </button>
          <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-bold flex items-center gap-2">
            <Eye size={14} /> {Number(journal.views || 0)} total views
          </button>
        </div>

        {images.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-white font-bold">Images ({images.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.slice(0, 5).map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => setGalleryIndex(index)}
                  className="relative group overflow-hidden rounded-2xl border border-zinc-800"
                >
                  <img src={img} alt={`Journal image ${index + 1}`} className="w-full h-44 object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  {index === 4 && images.length > 5 && (
                    <span className="absolute inset-0 bg-black/60 text-white font-black text-2xl flex items-center justify-center">+{images.length - 5}</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-zinc-800 pt-8 text-zinc-300 prose prose-invert max-w-none">
          {journal.contentType === 'html' || journal.contentType === 'richtext' ? (
            // Rich Text aur HTML direct render honge taaki tags/iframes mast chalein
            <div className="w-full overflow-x-auto break-words [word-break:normal]" dangerouslySetInnerHTML={{ __html: journal.content }} />
          ) : (
            // Purane posts aur Markdown wale posts tere custom renderer se chalenge
            <div dangerouslySetInnerHTML={{ __html: `<p class="text-zinc-300 leading-relaxed mb-4">${renderMarkdown(journal.content)}</p>` }} />
          )}
        </div>
      </article>

      <AnimatePresence>
        {embedOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] bg-black/70 p-4 flex items-center justify-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2"><Code2 size={16} /> Embed Code</h3>
                <button onClick={() => setEmbedOpen(false)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"><X size={16} /></button>
              </div>
              <p className="text-zinc-500 text-sm">Use this iframe to embed this journal:</p>
              <textarea readOnly value={embedCode} className="w-full h-36 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono" />
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(embedCode);
                    alert('Embed code copied');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black text-sm font-black"
                >
                  Copy Code
                </button>
                <a href={`${window.location.origin}/journal/embed/${id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-bold inline-flex items-center gap-2">
                  <Link2 size={14} /> Open Embed URL
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {galleryIndex !== null && images[galleryIndex] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black/90 p-4 flex items-center justify-center">
            <button onClick={() => setGalleryIndex(null)} className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/70 text-white"><X size={20} /></button>
            <button
              onClick={() => setGalleryIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length))}
              className="absolute left-5 p-2 rounded-full bg-zinc-800/70 text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <img src={images[galleryIndex]} alt={`Journal image ${galleryIndex + 1}`} className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl" />
            <button
              onClick={() => setGalleryIndex((prev) => (prev === null ? null : (prev + 1) % images.length))}
              className="absolute right-5 p-2 rounded-full bg-zinc-800/70 text-white"
            >
              <ChevronRight size={20} />
            </button>
            <p className="absolute bottom-6 text-zinc-300 text-sm font-mono">{galleryIndex + 1} / {images.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
