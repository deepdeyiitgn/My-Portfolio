import { useState, useEffect, useCallback, useRef, type FormEvent, type ReactNode, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, LogIn, Eye, EyeOff, Plus, Trash2, Edit3, Send, X,
  ChevronLeft, ChevronRight, LogOut, Tag, BookOpen, Settings,
  ToggleLeft, ToggleRight, Clock, Loader2, AlertCircle, CheckCircle2, Upload, ImagePlus, Clipboard, Layers
} from 'lucide-react';
import SEO from '../components/SEO';
import { timelineData } from '../data/timelineData';
import { ICON_NAMES, renderIcon } from '../utils/iconMap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// ── types ────────────────────────────────────────────────────────────────────

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Journal {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  contentType?: string;
  categorySlug: string;
  categoryName: string;
  published: boolean;
  publishedAt: string | null;
  publishedAtIST: string | null;
  createdAt: string;
  updatedAt: string;
  readMinutes: number;
  likes?: number;
  views?: number;
  images?: string[];
}

type Tab = 'journals' | 'categories' | 'settings' | 'journey' | 'projects';

// ── Projects types ────────────────────────────────────────────────────────────
export interface ProjectDB {
  _id?: string;
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  liveUrl: string;
  githubUrl?: string;
  logoUrl: string;
  category: string;
  problem: string;
  solution: string;
  impact: string;
  metrics: Array<{ label: string; value: string }>;
  architectureLayers: string[];
  screenshotUrl?: string;
}

// ── Journey (Timeline) types ──────────────────────────────────────────────────

interface TimelineItemDB {
  _id: string;
  year: number;
  dateStr: string;
  title: string;
  school: string;
  description: string;
  iconName: string;
  iconSize: number;
  sortOrder: number;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm';

const btnCls =
  'px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 right-6 z-[999] flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl ${
        type === 'success'
          ? 'bg-emerald-900 border border-emerald-700 text-emerald-200'
          : 'bg-red-900 border border-red-700 text-red-200'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </motion.div>
  );
}

// ── Simple markdown preview renderer ─────────────────────────────────────────

function MarkdownPreview({ content }: { content: string }) {
  const html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-amber-500 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-zinc-300 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-800 text-amber-400 px-1 rounded text-xs">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-zinc-400 text-sm ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-zinc-400 text-sm ml-4 list-decimal">$1</li>')
    .replace(/^---$/gm, '<hr class="border-zinc-800 my-4" />')
    .replace(/\n\n/g, '</p><p class="text-zinc-400 text-sm mb-3">')
    .replace(/\n/g, '<br />');

  return (
    <div
      className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="text-zinc-400 text-sm mb-3">${html}</p>` }}
    />
  );
}

// ── Journal Preview Modal ─────────────────────────────────────────────────────

function JournalPreview({
  journal,
  onClose,
  onPublish,
  publishing,
}: {
  journal: Partial<Journal>;
  onClose: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-3xl my-8 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <span className="text-xs font-mono text-amber-500 uppercase tracking-widest">Preview — How it will look</span>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {journal.categoryName && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-amber-500/30 text-amber-500 bg-amber-500/5">
              {journal.categoryName}
            </span>
          )}
          <h1 className="text-3xl font-black text-white tracking-tight">{journal.title || 'Untitled Journal'}</h1>
          {journal.summary && <p className="text-zinc-400 text-base">{journal.summary}</p>}
          <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {now} IST</span>
            <span>{journal.readMinutes || 1} min read</span>
            <span className="uppercase text-amber-500/70 border border-amber-500/30 px-2 py-0.5 rounded-md text-[9px]">{journal.contentType || 'richtext'}</span>
          </div>
          <div className="border-t border-zinc-800 pt-6">
            {journal.contentType === 'markdown' ? (
              <MarkdownPreview content={journal.content || ''} />
            ) : (
              <div className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: journal.content || '' }} />
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 flex gap-3 justify-end">
          <button onClick={onClose} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>
            Back to Edit
          </button>
          <button
            onClick={onPublish}
            disabled={publishing}
            className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2 disabled:opacity-60`}
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Journal Editor ────────────────────────────────────────────────────────────

function JournalEditor({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: Partial<Journal>;
  categories: Category[];
  onSave: (data: Partial<Journal>, publish: boolean) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [content, setContent] = useState(initial?.content || '');
  // Purana: const [contentType, setContentType] = useState(initial?.contentType || 'richtext');
  const [contentType, setContentType] = useState(initial?.contentType || 'markdown');
  const [images, setImages] = useState<string[]>(Array.isArray(initial?.images) ? initial.images : []);
  const [singleLinkInput, setSingleLinkInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug || '');
  const [categoryName, setCategoryName] = useState(initial?.categoryName || '');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const cat = categories.find((c) => c.slug === slug);
    setCategoryName(cat?.name || '');
  };

  // Naya logic: 110 words per minute ke hisaab se realistic reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 110));

  const sanitizeImageUrl = (value: string) => {
    const raw = value.trim();
    if (!raw) return '';
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) return '';
      // 👇 YEH LINE UPDATE KARNI HAI (Dono domain allow karne hain) 👇
      if ((parsed.hostname === 'static.qlynk.me' || parsed.hostname === 'deydeep-static-files.hf.space') && /^\/f\//.test(parsed.pathname)) return parsed.toString();
      if (/\.(png|jpe?g)(\?.*)?$/i.test(parsed.toString())) return parsed.toString();
      return '';
    } catch {
      return '';
    }
  };

  const mergeImages = (list: string[]) => {
    const merged = Array.from(new Set(list.map((i) => sanitizeImageUrl(i)).filter(Boolean)));
    setImages(merged);
  };

  useEffect(() => {
    if (Array.isArray(initial?.images)) {
      mergeImages(initial.images);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isImageUrl = (value: string) => Boolean(sanitizeImageUrl(value));

  const addSingleLink = () => {
    const link = singleLinkInput.trim();
    if (!link) return;
    // 👇 YEH LINE UPDATE KARNI HAI 👇
    if (!isImageUrl(link) && !link.includes('static.qlynk.me/f/') && !link.includes('deydeep-static-files.hf.space/f/')) {
      setUploadError('Invalid image URL. Only JPG/PNG or static.qlynk.me/f/ links are supported.');
      return;
    }
    setUploadError('');
    mergeImages([...images, link]);
    setSingleLinkInput('');
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const uploadSingleImage = async (file: File) => {
    if (!/^image\/(png|jpeg|jpg)$/i.test(file.type)) {
      throw new Error('Only JPG and PNG are supported');
    }
    const dataUrl = await fileToDataUrl(file);
    const slugSafe = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'journal';
    // slug capped at 30 chars so buildSlug() keeps total well under 40+6=46 chars,
    // safely below the upstream API's slug uniqueness-check window
    const r = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl,
        slug: slugSafe,
        title: title || 'Journal Image',
      }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok || !d.url) throw new Error(d.message || 'Image upload failed');
    setUploadError('');
    mergeImages([...images, d.url]);
  };

  const handlePickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadError('');
    try {
      await uploadSingleImage(file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadError('');
    try {
      await uploadSingleImage(file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    if (!navigator.clipboard?.read) {
      setUploadError('Clipboard image paste is not supported on this browser');
      return;
    }
    setUploadingImage(true);
    setUploadError('');
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((type) => /^image\/(png|jpeg|jpg)$/i.test(type));
        if (!imgType) continue;
        const blob = await item.getType(imgType);
        const file = new File([blob], `clipboard-${Date.now()}.${imgType.includes('png') ? 'png' : 'jpg'}`, { type: imgType });
        await uploadSingleImage(file);
        setUploadingImage(false);
        return;
      }
      setUploadError('No JPG/PNG image found in clipboard');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Clipboard paste failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await onSave({ title, summary, content, contentType, categorySlug, categoryName, readMinutes, images }, false);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onSave({ title, summary, content, contentType, categorySlug, categoryName, readMinutes, images }, true);
      setShowPreview(false);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Journal title..."
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Summary / Excerpt</label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary shown in listings..."
            className={inputCls}
          />
        </div>

        <div className="space-y-2 border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>Content Editor *</span>
            </label>
            <span className="text-zinc-600 text-[10px] font-mono">{readMinutes} min read · {content.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>

          {/* Teeno Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContentType('richtext')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${contentType === 'richtext' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              Normal Text
            </button>
            <button
              type="button"
              onClick={() => setContentType('markdown')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${contentType === 'markdown' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setContentType('html')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${contentType === 'html' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              Custom HTML
            </button>
          </div>

          {/* Dynamic Editors */}
          <div className="mt-2 min-h-[300px]">
            {contentType === 'richtext' && (
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="bg-zinc-950/50 text-white rounded-xl overflow-hidden [&_.ql-toolbar]:bg-zinc-900 [&_.ql-toolbar]:border-zinc-800 [&_.ql-container]:border-zinc-800 [&_.ql-editor]:min-h-[300px]"
                placeholder="Write your journal directly here. Use toolbar for bold, italic, etc..."
              />
            )}
            {contentType === 'markdown' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="# Heading&#10;&#10;Write your journal in **Markdown**..."
                className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              />
            )}
            {contentType === 'html' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="<div>&#10;  <h1>Custom HTML</h1>&#10;  <style> h1 { color: red; } </style>&#10;</div>"
                className={`${inputCls} resize-y font-mono text-xs leading-relaxed text-blue-300`}
              />
            )}
          </div>
        </div>

        <div
          className="space-y-2 border border-zinc-800 rounded-2xl p-4 bg-zinc-900/20"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Journal Images (Optional)</label>

          {/* One-at-a-time link input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={singleLinkInput}
              onChange={(e) => setSingleLinkInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSingleLink(); } }}
              placeholder="Paste image link (jpg/png or static.qlynk.me/f/...)..."
              className={`${inputCls} text-xs flex-1`}
            />
            <button
              type="button"
              onClick={addSingleLink}
              disabled={!singleLinkInput.trim()}
              className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-2 disabled:opacity-40 shrink-0`}
            >
              <ImagePlus size={14} /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-2 disabled:opacity-50`}
            >
              {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload Photo
            </button>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={uploadingImage}
              className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-2 disabled:opacity-50`}
            >
              <Clipboard size={14} /> Paste from Clipboard
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handlePickImage}
          />
          <p className="text-[11px] text-zinc-600">
            Add one image at a time — unlimited per post. Supports file upload, URL link, drag-drop, and clipboard paste.
          </p>
          {uploadError && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError('')} className="ml-auto shrink-0 text-red-600 hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {images.map((img, idx) => {
                const safeImg = sanitizeImageUrl(img);
                if (!safeImg) return null;
                return (
                  <div key={`${safeImg}-${idx}`} className="relative border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
                    <img src={safeImg} alt={`Uploaded ${idx + 1}`} className="w-full h-24 object-cover" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => mergeImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded text-zinc-200 hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={onCancel} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving || !title}
            className={`${btnCls} bg-zinc-700 text-zinc-200 hover:bg-zinc-600 flex items-center gap-2 disabled:opacity-50`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            Save as Draft
          </button>
          <button
            onClick={() => setShowPreview(true)}
            disabled={!title || !content}
            className={`${btnCls} bg-zinc-900 border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 flex items-center gap-2 disabled:opacity-40`}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || !title || !content}
            className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2 disabled:opacity-50`}
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <JournalPreview
            journal={{ title, summary, content, contentType, categoryName, readMinutes, images }} // NAYA: yaha sirf "contentType," add hua hai
            onClose={() => setShowPreview(false)}
            onPublish={handlePublish}
            publishing={publishing}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Screenshot Validation Helper ──────────────────────────────────────────────
const validateScreenshotUrl = (url: string) => {
  if (!url) return false;
  // Base64 valid hai
  if (url.startsWith('data:image/')) return true;

  // QLYNK CDN ke liye extension bypass
  const isMyCDN = url.includes('static.qlynk.me') || url.includes('deydeep-static-files.hf.space');
  if (isMyCDN) return true;

  // Baaki links ke liye image extension check
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url);
};

// ── Timeline Card Preview (mirrors Home.tsx timeline card exactly) ────────────

function TimelineCardPreview({
  year, dateStr, title, school, description, iconName, iconSize,
}: {
  year: number; dateStr: string; title: string; school: string;
  description: string; iconName: string; iconSize: number;
}) {
  const isActive = new Date().getFullYear() === year;
  return (
    <div className={`relative w-full p-8 bg-zinc-900/30 border rounded-[2.5rem] backdrop-blur-md transition-all mt-6 ${
      isActive
        ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-zinc-900/50'
        : 'border-zinc-800/50'
    }`}>
      {/* Date badge */}
      <div className={`absolute -top-4 left-8 px-4 py-1.5 font-black text-[10px] rounded-lg shadow-xl transform -rotate-1 z-30 ${
        isActive ? 'bg-amber-500 text-black shadow-amber-500/30' : 'bg-zinc-800 text-zinc-400 shadow-black'
      }`}>
        {dateStr || String(year)}
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 bg-zinc-950 border rounded-2xl ${
          isActive ? 'border-amber-500 text-amber-500' : 'border-zinc-800 text-zinc-500'
        }`}>
          {renderIcon(iconName, iconSize)}
        </div>
        <h3 className={`text-xl font-bold tracking-tight ${
          isActive ? 'text-amber-500' : 'text-white'
        }`}>{title || 'Title...'}</h3>
      </div>

      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800/50 pb-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-zinc-800'}`}></span>
        {school || 'Phase / School...'}
      </p>
      <p className="text-zinc-400 font-light leading-relaxed text-sm">{description || 'Description will appear here...'}</p>

      {isActive && (
        <div className="absolute top-4 right-8 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-tighter text-amber-500/80">Active Phase</span>
        </div>
      )}
    </div>
  );
}

// ── Journey Item Editor ───────────────────────────────────────────────────────

function JourneyEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<TimelineItemDB>;
  onSave: (data: Omit<TimelineItemDB, '_id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [year, setYear] = useState<number>(initial?.year ?? new Date().getFullYear());
  const [dateStr, setDateStr] = useState(initial?.dateStr ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [school, setSchool] = useState(initial?.school ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [iconName, setIconName] = useState(initial?.iconName ?? 'Milestone');
  const [iconSize, setIconSize] = useState<number>(initial?.iconSize ?? 20);
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !year) return;
    setSaving(true);
    try {
      await onSave({
        year: Number(year),
        dateStr: dateStr.trim() || String(year),
        title: title.trim(),
        school: school.trim(),
        description: description.trim(),
        iconName,
        iconSize: Number(iconSize) || 20,
        sortOrder: Number(sortOrder) || 0,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ── Form ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Year *</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputCls}
              placeholder="2026"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Date String</label>
            <input
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className={inputCls}
              placeholder="April 9, 2026"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="The Academic Hiatus"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">School / Phase Label</label>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className={inputCls}
            placeholder="JEE Advanced Focus"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputCls} resize-y`}
            placeholder="Paused active software engineering to dedicate 100% bandwidth..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Icon (Lucide)</label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {ICON_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Icon Size (px)</label>
            <input
              type="number"
              min={12}
              max={48}
              value={iconSize}
              onChange={(e) => setIconSize(Number(e.target.value))}
              className={inputCls}
              placeholder="20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sort Order (lower = first)</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={inputCls}
            placeholder="0"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !year}
            className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2 disabled:opacity-50`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {initial?._id ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Eye size={12} />
          Live Preview — how it looks on homepage
        </p>
        <p className="text-[10px] text-zinc-700 font-mono">
          {new Date().getFullYear() === year
            ? '⚡ Glowing amber (current year active phase)'
            : 'Normal card style'}
        </p>
        <TimelineCardPreview
          year={year}
          dateStr={dateStr || String(year)}
          title={title}
          school={school}
          description={description}
          iconName={iconName}
          iconSize={Number(iconSize) || 20}
        />
      </div>
    </div>
  );
}


// ── Project Editor ────────────────────────────────────────────────────────────

function ProjectEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<ProjectDB>;
  onSave: (data: Omit<ProjectDB, '_id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ProjectDB>>({
    id: initial?.id || '',
    title: initial?.title || '',
    shortDescription: initial?.shortDescription || '',
    fullDescription: initial?.fullDescription || '',
    techStack: initial?.techStack || [],
    liveUrl: initial?.liveUrl || '',
    githubUrl: initial?.githubUrl || '',
    logoUrl: initial?.logoUrl || '',
    category: initial?.category || '',
    problem: initial?.problem || '',
    solution: initial?.solution || '',
    impact: initial?.impact || '',
    metrics: initial?.metrics || [{ label: 'Metric', value: 'Value' }],
    architectureLayers: initial?.architectureLayers || [],
    screenshotUrl: initial?.screenshotUrl || '',
  });

  const [saving, setSaving] = useState(false);
  const [generatingScreenshot, setGeneratingScreenshot] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [layerInput, setLayerInput] = useState('');

  const updateField = (field: keyof ProjectDB, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  const generateScreenshot = async () => {
    if (!formData.liveUrl) {
      alert("Please enter a Live URL first!");
      return;
    }
    setGeneratingScreenshot(true);
    try {
      const r = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'screenshot', url: formData.liveUrl }),
      });
      const d = await r.json();
      if (d.ok && d.image) {
        updateField('screenshotUrl', d.image);
      } else {
        alert(d.message || "Failed to capture screenshot. Site might be blocking bots.");
      }
    } catch (err) {
      alert("Network error while generating screenshot.");
    } finally {
      setGeneratingScreenshot(false);
    }
  };

// 👇 YAHAN SE NAYA CODE ADD KRNA HAI 👇
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target 16:10 ratio (Desktop View preview ke liye)
        canvas.width = 1280;
        canvas.height = 800;

        if (ctx) {
          // Cover & Top align (Portrait image ko top se landscape me fit karne ke liye)
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = 0; 
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          // Compress with 70% quality to save DB space
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          updateField('screenshotUrl', compressedBase64); // Form data update
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };
  // 👆 YAHAN TAK 👆
  
  const handleSubmit = async () => {
    if (!formData.title || !formData.id) return;
    setSaving(true);
    try {
      await onSave(formData as Omit<ProjectDB, '_id'>);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* ── Form Left Side ── */}
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Project ID (URL slug) *</label>
            <input value={formData.id} onChange={(e) => updateField('id', e.target.value.toLowerCase())} className={inputCls} placeholder="my-project" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Category</label>
            <input value={formData.category} onChange={(e) => updateField('category', e.target.value)} className={inputCls} placeholder="SaaS / Tool" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title *</label>
          <input value={formData.title} onChange={(e) => updateField('title', e.target.value)} className={inputCls} placeholder="Project Title" />
        </div>

        {/* Live URL */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live URL</label>
          <input value={formData.liveUrl} onChange={(e) => updateField('liveUrl', e.target.value)} className={inputCls} placeholder="https://project.com" />
        </div>

        {/* Screenshot Control Center */}
        <div className="space-y-2 p-3 border border-zinc-800 rounded-xl bg-zinc-900/30">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Screenshot (Auto / Upload / Manual)</label>
          <div className="flex flex-col xl:flex-row gap-2">
            <input
              type="text"
              placeholder="Paste Base64 or Image URL..."
              className={`${inputCls} flex-1`}
              value={formData.screenshotUrl || ''}
              onChange={(e) => updateField('screenshotUrl', e.target.value)}
            />
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={generateScreenshot}
                disabled={generatingScreenshot || !formData.liveUrl}
                className={`${btnCls} bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1 disabled:opacity-50`}
              >
                {generatingScreenshot ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Auto
              </button>
              <label className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer flex items-center gap-1`}>
                <Upload size={14} /> Upload
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
          {formData.screenshotUrl && !validateScreenshotUrl(formData.screenshotUrl) && (
            <p className="text-red-400 text-[10px] flex items-center gap-1">
              <AlertCircle size={10} /> Warning: URL must have extension (unless using QLYNK CDN)
            </p>
          )}
        </div>

        <div className="space-y-1">
           <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Logo URL</label>
           <input value={formData.logoUrl} onChange={(e) => updateField('logoUrl', e.target.value)} className={inputCls} placeholder="https://..." />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Short Description</label>
          <input value={formData.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} className={inputCls} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Full Architecture Description</label>
          <textarea value={formData.fullDescription} onChange={(e) => updateField('fullDescription', e.target.value)} rows={3} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Problem Solved</label>
             <textarea value={formData.problem} onChange={(e) => updateField('problem', e.target.value)} rows={2} className={inputCls} />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Solution</label>
             <textarea value={formData.solution} onChange={(e) => updateField('solution', e.target.value)} rows={2} className={inputCls} />
           </div>
        </div>

        {/* Arrays (Tech Stack & Layers) simplified for this editor */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tech Stack (comma separated)</label>
          <input value={formData.techStack?.join(', ')} onChange={(e) => updateField('techStack', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} className={inputCls} placeholder="React, Node.js, MongoDB" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Architecture Layers (comma separated)</label>
          <input value={formData.architectureLayers?.join(', ')} onChange={(e) => updateField('architectureLayers', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} className={inputCls} placeholder="API Gateway, Storage Layer" />
        </div>

        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <button onClick={onCancel} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !formData.title || !formData.id} className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2 disabled:opacity-50`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {initial?._id ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </div>

      {/* ── Live Preview Right Side ── */}
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
          <Eye size={12} /> Live Preview Card & JSON
        </p>
        
        {/* Visual Card Preview */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6 space-y-4 relative">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-zinc-800 p-2 overflow-hidden flex items-center justify-center">
                {formData.logoUrl ? <img src={formData.logoUrl} alt="logo" className="w-full h-full object-contain" /> : <div className="text-zinc-600 text-xs text-center leading-tight font-mono">No Logo</div>}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-950 px-2 py-1 rounded-full border border-zinc-800">{formData.category || 'Category'}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{formData.title || 'Project Title'}</h3>
              <p className="text-zinc-500 text-xs mt-1">{formData.shortDescription || 'Short description will appear here...'}</p>
            </div>
            {formData.screenshotUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-zinc-800 aspect-video relative">
                  <img src={formData.screenshotUrl} alt="Screenshot" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] uppercase tracking-widest text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} /> Auto-Captured
                  </div>
              </div>
            )}
        </div>

        {/* JSON Preview */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
           <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Raw JSON Data</p>
           <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap">
             {JSON.stringify(formData, null, 2)}
           </pre>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────────────────
export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState<null | boolean>(null); // null = loading
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>('journals');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const [journals, setJournals] = useState<Journal[]>([]);
  const [journalPage, setJournalPage] = useState(1);
  const [journalTotal, setJournalTotal] = useState(0);
  const [journalTotalPages, setJournalTotalPages] = useState(1);
  const [filterCategory, setFilterCategory] = useState('');
  const [loadingJournals, setLoadingJournals] = useState(false);

  const [editorMode, setEditorMode] = useState<'none' | 'create' | 'edit'>('none');
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

  // ── Journey state ───────────────────────────────────────────────────────
  const [journeyMode, setJourneyMode] = useState<'default' | 'custom'>('default');
  const [journeyItems, setJourneyItems] = useState<TimelineItemDB[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(false);
  const [savingJourneyMode, setSavingJourneyMode] = useState(false);
  const [journeyEditorMode, setJourneyEditorMode] = useState<'none' | 'create' | 'edit'>('none');
  const [editingJourneyItem, setEditingJourneyItem] = useState<TimelineItemDB | null>(null);

  // ── Projects state ──────────────────────────────────────────────────────
  const [projectMode, setProjectMode] = useState<'default' | 'custom'>('default');
  const [projects, setProjects] = useState<ProjectDB[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [savingProjectMode, setSavingProjectMode] = useState(false);
  const [projectEditorMode, setProjectEditorMode] = useState<'none' | 'create' | 'edit'>('none');
  const [editingProject, setEditingProject] = useState<ProjectDB | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Auth check on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  // ── Fetch categories ────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/categories');
      const d = await r.json();
      if (d.ok) setCategories(d.categories);
    } catch { /* ignore */ }
  }, []);

  // ── Fetch journey data ──────────────────────────────────────────────────
  const fetchJourneyData = useCallback(async () => {
    setLoadingJourney(true);
    try {
      const r = await fetch('/api/timeline');
      const d = await r.json();
      if (d.ok) {
        setJourneyMode(d.mode === 'custom' ? 'custom' : 'default');
        setJourneyItems(Array.isArray(d.items) ? d.items : []);
      }
    } catch { /* ignore */ }
    finally { setLoadingJourney(false); }
  }, []);

  // ── Fetch projects data ─────────────────────────────────────────────────
  const fetchProjectsData = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const r = await fetch('/api/projects');
      const d = await r.json();
      if (d.ok) {
        setProjectMode(d.mode === 'custom' ? 'custom' : 'default');
        setProjects(Array.isArray(d.items) ? d.items : []);
      }
    } catch { /* ignore */ }
    finally { setLoadingProjects(false); }
  }, []);

  // ── Fetch journals ──────────────────────────────────────────────────────
  const fetchJournals = useCallback(async (page = 1, catFilter = '') => {
    setLoadingJournals(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (catFilter) params.set('category', catFilter);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (d.ok) {
        setJournals(d.journals);
        setJournalTotal(d.pagination.total);
        setJournalTotalPages(d.pagination.totalPages);
        setJournalPage(d.pagination.page);
      }
    } catch { /* ignore */ }
    finally { setLoadingJournals(false); }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchCategories();
      fetchJournals(1, filterCategory);
      fetchJourneyData();
      fetchProjectsData(); // <-- YE LINE ADD KARO
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  // ── Login ───────────────────────────────────────────────────────────────
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (d.ok) {
        setAuthenticated(true);
      } else {
        setLoginError(d.message || 'Incorrect password');
      }
    } catch {
      setLoginError('Network error — please try again');
    } finally {
      setLoggingIn(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthenticated(false);
  };

  // ── Add category ────────────────────────────────────────────────────────
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const r = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const d = await r.json();
      if (d.ok) {
        setNewCatName('');
        fetchCategories();
        showToast('Category added!');
      } else {
        showToast(d.message || 'Error adding category', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const r = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.ok) { fetchCategories(); showToast('Category deleted'); }
      else showToast(d.message || 'Error', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  // ── Journal save (create / update) ──────────────────────────────────────
  const handleJournalSave = async (data: Partial<Journal>, publish: boolean) => {
    const isEdit = editorMode === 'edit' && editingJournal;
    const payload = { ...data, publish };
    if (isEdit) (payload as Record<string, unknown>)['_id'] = editingJournal!._id;

    const r = await fetch('/api/journal', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (d.ok) {
      showToast(publish ? 'Journal published!' : 'Draft saved!');
      setEditorMode('none');
      setEditingJournal(null);
      fetchJournals(journalPage, filterCategory);
    } else {
      showToast(d.message || 'Error saving journal', 'error');
      throw new Error(d.message);
    }
  };

  const handleTogglePublish = async (j: Journal) => {
    const r = await fetch('/api/journal', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: j._id, publish: !j.published }),
    });
    const d = await r.json();
    if (d.ok) {
      showToast(j.published ? 'Unpublished' : 'Published!');
      fetchJournals(journalPage, filterCategory);
    } else showToast(d.message || 'Error', 'error');
  };

  const handleDeleteJournal = async (id: string) => {
    if (!confirm('Delete this journal entry? This cannot be undone.')) return;
    const r = await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.ok) { showToast('Deleted'); fetchJournals(journalPage, filterCategory); }
    else showToast(d.message || 'Error', 'error');
  };

  // ── Journey handlers ────────────────────────────────────────────────────
  const handleJourneyModeChange = async (newMode: 'default' | 'custom') => {
    setSavingJourneyMode(true);
    try {
      const r = await fetch('/api/timeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
      const d = await r.json();
      if (d.ok) {
        setJourneyMode(newMode);
        showToast(`Timeline switched to ${newMode === 'custom' ? 'Custom (MongoDB)' : 'Default (Local file)'}`);
        if (newMode === 'custom') fetchJourneyData();
      } else {
        showToast(d.message || 'Error updating mode', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSavingJourneyMode(false);
    }
  };

  const handleJourneyItemSave = async (data: Omit<TimelineItemDB, '_id'>) => {
    const isEdit = journeyEditorMode === 'edit' && editingJourneyItem;
    const method = isEdit ? 'PUT' : 'POST';
    const body = isEdit ? { ...data, _id: editingJourneyItem!._id } : data;
    const r = await fetch('/api/timeline', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.ok) {
      showToast(isEdit ? 'Journey item updated!' : 'Journey item added!');
      setJourneyEditorMode('none');
      setEditingJourneyItem(null);
      fetchJourneyData();
    } else {
      showToast(d.message || 'Error saving item', 'error');
      throw new Error(d.message);
    }
  };

  const handleJourneyItemDelete = async (id: string) => {
    if (!confirm('Delete this journey item? This cannot be undone.')) return;
    const r = await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.ok) { showToast('Journey item deleted'); fetchJourneyData(); }
    else showToast(d.message || 'Error', 'error');
  };

  // ── Project handlers ────────────────────────────────────────────────────
  const handleProjectModeChange = async (newMode: 'default' | 'custom') => {
    setSavingProjectMode(true);
    try {
      const r = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
      const d = await r.json();
      if (d.ok) {
        setProjectMode(newMode);
        showToast(`Projects switched to ${newMode === 'custom' ? 'Custom' : 'Default'}`);
        if (newMode === 'custom') fetchProjectsData();
      } else showToast(d.message || 'Error', 'error');
    } catch { showToast('Network error', 'error'); } 
    finally { setSavingProjectMode(false); }
  };

  const handleProjectSave = async (data: Omit<ProjectDB, '_id'>) => {
    const isEdit = projectEditorMode === 'edit' && editingProject;
    const method = isEdit ? 'PUT' : 'POST';
    const body = isEdit ? { ...data, _id: editingProject!._id } : data;
    const r = await fetch('/api/projects', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.ok) {
      showToast(isEdit ? 'Project updated!' : 'Project added!');
      setProjectEditorMode('none'); setEditingProject(null); fetchProjectsData();
    } else throw new Error(d.message);
  };

  const handleProjectDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const r = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.ok) { showToast('Project deleted'); fetchProjectsData(); }
    else showToast(d.message || 'Error', 'error');
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  // ── Login screen ────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SEO title="Dashboard Login | Deep Dey" description="Dashboard login" route="/dashboard" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <Lock size={22} />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">Dashboard</h1>
              <p className="text-zinc-500 text-xs">Protected area — enter password</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter SPACE_PASSWORD"
                className={`${inputCls} pr-10`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {loginError && (
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle size={12} /> {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn || !password}
              className={`w-full ${btnCls} bg-amber-500 text-black hover:bg-amber-400 py-3 flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loggingIn ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Login
            </button>
          </form>

          <p className="text-zinc-700 text-[10px] text-center font-mono">
            Session cookie stored permanently after login.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-4 py-8 space-y-6">
      <SEO title="Dashboard | Deep Dey" description="Content management dashboard" route="/dashboard" />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Content Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage journals, categories, journey timeline, and settings</p>
        </div>
        <button
          onClick={handleLogout}
          className={`${btnCls} bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center gap-2`}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Journals', value: journalTotal },
          { label: 'Published', value: journals.filter((j) => j.published).length },
          { label: 'Ecosystem', value: projectMode === 'custom' ? projects.length : 'Default' }, // <-- YE NAYA HAI
          { label: 'Drafts', value: journals.filter((j) => !j.published).length },
          { label: 'Categories', value: categories.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">{stat.label}</p>
            <p className="text-amber-500 text-2xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-0 overflow-x-auto">
        {([
          { id: 'journals', label: 'Journals', icon: <BookOpen size={14} /> },
          { id: 'projects', label: 'Projects', icon: <Layers size={14} /> }, // <-- YE NAYA TAB HAI
          { id: 'categories', label: 'Categories', icon: <Tag size={14} /> },
          { id: 'journey', label: 'Journey', icon: <Clock size={14} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
        ] as { id: Tab; label: string; icon: ReactNode }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === t.id
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Journals Tab ─────────────────────────────────────────────────── */}
      {tab === 'journals' && (
        <div className="space-y-6">
          {editorMode === 'none' ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => { setEditorMode('create'); setEditingJournal(null); }}
                  className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2`}
                >
                  <Plus size={14} />
                  New Journal
                </button>
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); fetchJournals(1, e.target.value); }}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
                </select>
                <button
                  onClick={() => fetchJournals(journalPage, filterCategory)}
                  className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}
                >
                  Refresh
                </button>
              </div>

              {/* Journal list */}
              {loadingJournals ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-amber-500" />
                </div>
              ) : journals.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No journals yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {journals.map((j) => (
                    <motion.div
                      key={j._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                              j.published
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}>
                              {j.published ? 'Published' : 'Draft'}
                            </span>
                            {j.categoryName && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {j.categoryName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-bold text-base truncate">{j.title}</h3>
                          {j.summary && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{j.summary}</p>}
                          <p className="text-zinc-700 text-[10px] font-mono mt-1.5">
                            {j.published && j.publishedAtIST
                              ? `Published: ${j.publishedAtIST} IST`
                              : `Created: ${new Date(j.createdAt).toLocaleDateString('en-IN')}`}
                            {' · '}{j.readMinutes} min read
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTogglePublish(j)}
                            title={j.published ? 'Unpublish' : 'Publish'}
                            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-amber-500"
                          >
                            {j.published ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => { setEditorMode('edit'); setEditingJournal(j); }}
                            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-amber-500"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteJournal(j._id)}
                            className="p-2 rounded-xl hover:bg-red-900/30 transition-colors text-zinc-600 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {journalTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => { const p = journalPage - 1; setJournalPage(p); fetchJournals(p, filterCategory); }}
                    disabled={journalPage <= 1}
                    className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="text-zinc-500 text-sm">
                    Page {journalPage} / {journalTotalPages}
                  </span>
                  <button
                    onClick={() => { const p = journalPage + 1; setJournalPage(p); fetchJournals(p, filterCategory); }}
                    disabled={journalPage >= journalTotalPages}
                    className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditorMode('none'); setEditingJournal(null); }}
                  className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <h2 className="text-white font-bold text-lg">
                  {editorMode === 'create' ? 'New Journal Entry' : `Editing: ${editingJournal?.title}`}
                </h2>
              </div>
              <JournalEditor
                initial={editingJournal || undefined}
                categories={categories}
                onSave={handleJournalSave}
                onCancel={() => { setEditorMode('none'); setEditingJournal(null); }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Projects Tab ─────────────────────────────────────────────────── */}
      {tab === 'projects' && (
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
             <div>
               <h3 className="text-white font-bold text-base">Ecosystem Source</h3>
               <p className="text-zinc-500 text-xs mt-1">Default (File) vs Custom (MongoDB)</p>
             </div>
             <div className="flex gap-3">
               <button onClick={() => handleProjectModeChange('default')} disabled={savingProjectMode} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${projectMode === 'default' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>Default (File)</button>
               <button onClick={() => handleProjectModeChange('custom')} disabled={savingProjectMode} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${projectMode === 'custom' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>Custom (MongoDB)</button>
             </div>
          </div>

          {projectMode === 'custom' && (
             <div className="space-y-4">
               {projectEditorMode === 'none' ? (
                 <>
                   <div className="flex items-center gap-3">
                     <button onClick={() => { setProjectEditorMode('create'); setEditingProject(null); }} className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2`}><Plus size={14}/> Add Project</button>
                     <button onClick={fetchProjectsData} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>Refresh</button>
                   </div>
                   
                   {loadingProjects ? (
                     <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
                   ) : projects.length === 0 ? (
                     <div className="text-center py-16 text-zinc-600 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
                       <Layers size={32} className="mx-auto mb-3 opacity-40" />
                       <p className="text-sm">No custom projects yet.</p>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {projects.map(p => (
                         <div key={p._id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex justify-between items-center gap-4">
                           <div className="flex gap-4 items-center min-w-0">
                             <div className="w-12 h-12 bg-zinc-950 rounded-xl overflow-hidden p-2 border border-zinc-800 shrink-0">
                               {p.logoUrl ? <img src={p.logoUrl} className="w-full h-full object-contain" /> : <Layers className="w-full h-full text-zinc-700 p-1"/>}
                             </div>
                             <div className="min-w-0">
                               <p className="text-white font-bold text-base truncate">{p.title}</p>
                               <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{p.category}</p>
                             </div>
                           </div>
                           <div className="flex gap-2 shrink-0">
                             <button onClick={() => { setProjectEditorMode('edit'); setEditingProject(p); }} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"><Edit3 size={16} /></button>
                             <button onClick={() => handleProjectDelete(p._id!)} className="p-2 hover:bg-red-900/30 rounded-xl text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </>
               ) : (
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setProjectEditorMode('none'); setEditingProject(null); }} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400"><ChevronLeft size={18} /></button>
                      <h2 className="text-white font-bold text-lg">{projectEditorMode === 'create' ? 'New Project' : `Editing: ${editingProject?.title}`}</h2>
                    </div>
                    <ProjectEditor initial={editingProject || undefined} onSave={handleProjectSave} onCancel={() => setProjectEditorMode('none')} />
                 </div>
               )}
             </div>
          )}

          {projectMode === 'default' && (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 text-center">
              <p className="text-zinc-500 text-sm">Showing default projects from <code className="text-amber-500/70 bg-black/50 px-1 rounded">src/data/projectsData.ts</code>.<br/> Switch to Custom to edit and add screenshots dynamically.</p>
            </div>
          )}
        </div>
      )}
      
      {/* ── Categories Tab ───────────────────────────────────────────────── */}
      {tab === 'categories' && (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name..."
              className={`${inputCls} flex-1`}
            />
            <button
              type="submit"
              disabled={addingCat || !newCatName.trim()}
              className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap`}
            >
              {addingCat ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </form>

          {categories.length === 0 ? (
            <p className="text-zinc-600 text-sm">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{cat.name}</p>
                    <p className="text-zinc-600 text-[10px] font-mono">{cat.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-2 rounded-xl hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Journey Tab ──────────────────────────────────────────────────── */}
      {tab === 'journey' && (
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-white font-bold text-base">Timeline Source</h3>
              <p className="text-zinc-500 text-xs mt-1">
                Choose whether the homepage shows the built-in local timeline or your custom MongoDB entries.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleJourneyModeChange('default')}
                disabled={savingJourneyMode || journeyMode === 'default'}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all disabled:cursor-not-allowed ${
                  journeyMode === 'default'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {savingJourneyMode && journeyMode === 'custom' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ToggleLeft size={16} />
                )}
                Default (Local File)
              </button>
              <button
                onClick={() => handleJourneyModeChange('custom')}
                disabled={savingJourneyMode || journeyMode === 'custom'}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all disabled:cursor-not-allowed ${
                  journeyMode === 'custom'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {savingJourneyMode && journeyMode === 'default' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ToggleRight size={16} />
                )}
                Custom (MongoDB)
              </button>
            </div>
            {journeyMode === 'default' && (
              <p className="text-zinc-600 text-xs font-mono">
                ↳ Homepage reads from <code className="text-amber-500/70">src/data/timelineData.ts</code> — {timelineData.length} default items
              </p>
            )}
            {journeyMode === 'custom' && (
              <p className="text-zinc-600 text-xs font-mono">
                ↳ Homepage reads custom items from MongoDB — {journeyItems.length} item{journeyItems.length !== 1 ? 's' : ''} stored
              </p>
            )}
          </div>

          {/* Custom mode — editor */}
          {journeyMode === 'custom' && (
            <div className="space-y-4">
              {journeyEditorMode === 'none' ? (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setJourneyEditorMode('create'); setEditingJourneyItem(null); }}
                      className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2`}
                    >
                      <Plus size={14} />
                      Add Journey Item
                    </button>
                    <button
                      onClick={fetchJourneyData}
                      className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}
                    >
                      Refresh
                    </button>
                  </div>

                  {loadingJourney ? (
                    <div className="flex justify-center py-12">
                      <Loader2 size={24} className="animate-spin text-amber-500" />
                    </div>
                  ) : journeyItems.length === 0 ? (
                    <div className="text-center py-16 text-zinc-600 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
                      <Clock size={32} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No custom journey items yet.</p>
                      <p className="text-xs mt-1">Click "Add Journey Item" to create your first milestone.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {journeyItems.map((item) => {
                        const isActive = new Date().getFullYear() === item.year;
                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`bg-zinc-900/40 border rounded-2xl p-5 hover:border-zinc-700 transition-all ${
                              isActive ? 'border-amber-500/50' : 'border-zinc-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 bg-zinc-950 border rounded-xl shrink-0 ${
                                  isActive ? 'border-amber-500 text-amber-500' : 'border-zinc-800 text-zinc-500'
                                }`}>
                                  {renderIcon(item.iconName, item.iconSize)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-mono text-zinc-600 uppercase">
                                      {item.dateStr}
                                    </span>
                                    {isActive && (
                                      <span className="text-[9px] font-black uppercase tracking-tighter text-amber-500/80 flex items-center gap-1">
                                        <span className="relative flex h-1.5 w-1.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                        </span>
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <h3 className={`font-bold text-sm truncate ${isActive ? 'text-amber-500' : 'text-white'}`}>
                                    {item.title}
                                  </h3>
                                  <p className="text-zinc-600 text-[10px] font-mono">{item.school}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => { setJourneyEditorMode('edit'); setEditingJourneyItem(item); }}
                                  className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-amber-500"
                                  title="Edit"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => handleJourneyItemDelete(item._id)}
                                  className="p-2 rounded-xl hover:bg-red-900/30 transition-colors text-zinc-600 hover:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setJourneyEditorMode('none'); setEditingJourneyItem(null); }}
                      className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <h2 className="text-white font-bold text-lg">
                      {journeyEditorMode === 'create' ? 'New Journey Item' : `Editing: ${editingJourneyItem?.title}`}
                    </h2>
                  </div>
                  <JourneyEditor
                    initial={editingJourneyItem || undefined}
                    onSave={handleJourneyItemSave}
                    onCancel={() => { setJourneyEditorMode('none'); setEditingJourneyItem(null); }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Default mode — read-only preview of local data */}
          {journeyMode === 'default' && (
            <div className="space-y-3">
              <p className="text-zinc-600 text-xs font-mono px-1">
                Read-only — showing default local timeline entries. Switch to Custom to edit.
              </p>
              {timelineData.map((item) => {
                const isActive = new Date().getFullYear() === item.year;
                return (
                  <div
                    key={item.id}
                    className={`bg-zinc-900/20 border rounded-2xl p-4 opacity-70 ${
                      isActive ? 'border-amber-500/30' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-zinc-950 border rounded-xl shrink-0 ${
                        isActive ? 'border-amber-500/40 text-amber-500/70' : 'border-zinc-800 text-zinc-600'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-zinc-600">{item.dateStr}</p>
                        <p className={`font-bold text-sm ${isActive ? 'text-amber-500/70' : 'text-zinc-300'}`}>{item.title}</p>
                        <p className="text-zinc-600 text-[10px] font-mono">{item.school}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Settings Tab ─────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="space-y-4 max-w-lg">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2"><Settings size={16} /> Dashboard Settings</h3>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-zinc-600 uppercase text-[10px] tracking-widest self-center">Auth Method</span>
                <span>Password (SPACE_PASSWORD env)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-zinc-600 uppercase text-[10px] tracking-widest self-center">Session Storage</span>
                <span>Permanent HTTP-only cookie</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-zinc-600 uppercase text-[10px] tracking-widest self-center">Database</span>
                <span>MongoDB (MONGODB_URI env)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-zinc-600 uppercase text-[10px] tracking-widest self-center">API Files</span>
                <span>7 / 12 (Vercel free tier)</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full ${btnCls} bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50 flex items-center justify-center gap-2 py-3`}
            >
              <LogOut size={14} />
              Sign Out of Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
