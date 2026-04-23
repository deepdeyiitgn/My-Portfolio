import { useState, useEffect, useCallback, useRef, type FormEvent, type ReactNode, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, LogIn, Eye, EyeOff, Plus, Trash2, Edit3, Send, X,
  ChevronLeft, ChevronRight, LogOut, Tag, BookOpen, Settings,
  ToggleLeft, ToggleRight, Clock, Loader2, AlertCircle, CheckCircle2, Upload, ImagePlus, Clipboard,
} from 'lucide-react';
import SEO from '../components/SEO';
import { timelineData } from '../data/timelineData';
import { ICON_NAMES, renderIcon } from '../utils/iconMap';

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

type Tab = 'journals' | 'categories' | 'settings' | 'journey';

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
          </div>
          <div className="border-t border-zinc-800 pt-6">
            <MarkdownPreview content={journal.content || ''} />
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

  const readMinutes = Math.max(1, Math.ceil((content.trim().split(/\s+/).length) / 200));

  const sanitizeImageUrl = (value: string) => {
    const raw = value.trim();
    if (!raw) return '';
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) return '';
      if (parsed.hostname === 'static.qlynk.me' && /^\/f\//.test(parsed.pathname)) return parsed.toString();
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
    if (!isImageUrl(link) && !link.includes('static.qlynk.me/f/')) {
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
      await onSave({ title, summary, content, categorySlug, categoryName, readMinutes, images }, false);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onSave({ title, summary, content, categorySlug, categoryName, readMinutes, images }, true);
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

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center justify-between">
            <span>Content (Markdown) *</span>
            <span className="text-zinc-600">{readMinutes} min read · {content.trim().split(/\s+/).filter(Boolean).length} words</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="# Heading&#10;&#10;Write your journal in **Markdown**..."
            className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
          />
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
            journal={{ title, summary, content, categoryName, readMinutes, images }}
            onClose={() => setShowPreview(false)}
            onPublish={handlePublish}
            publishing={publishing}
          />
        )}
      </AnimatePresence>
    </>
  );
}

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
