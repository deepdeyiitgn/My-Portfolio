import { useState, useEffect, useCallback, useRef, type FormEvent, type ReactNode, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Lock, LogIn, Eye, EyeOff, Plus, Trash2, Edit3, Send, X,
  ChevronLeft, ChevronRight, LogOut, Tag, BookOpen, Settings,
  ToggleLeft, ToggleRight, Clock, Loader2, AlertCircle, CheckCircle2, Upload, ImagePlus, Clipboard, Layers, Activity, History, HardDrive,
  Users, MessageSquare, ShieldBan, AlertOctagon, User, RefreshCw, Link2
} from 'lucide-react';
import SEO from '../components/SEO';
import { timelineData } from '../data/timelineData';
import { ICON_NAMES, renderIcon } from '../utils/iconMap';
import { DEFAULT_WATERMARK_SCRIPT_URL, getGoogleFaviconUrl, getWatermarkStatusBadgeClass } from '../utils/watermark';
import { VerifiedTickIcon } from '../components/IdentityBadges';
import FeedbackAdminPanel from '../components/FeedbackAdminPanel';
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
  externalVideoThumbnail?: string;
  keywords?: string[];
  hashtags?: string[];
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

type Tab = 'journals' | 'categories' | 'settings' | 'journey' | 'projects' | 'watermarks' | 'status' | 'storage' | 'users' | 'feedback' | 'analytics';
type StatusMonitorMode = 'live' | 'stop' | 'maintenance' | 'hiatus';
type WatermarkStatusFilter = 'all' | 'pending' | 'approved' | 'declined';

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

interface WatermarkSiteAdmin {
  _id: string;
  url: string;
  domain: string;
  favicon?: string;
  title?: string;
  source?: 'auto' | 'manual';
  status: 'pending' | 'approved' | 'declined';
  hidden?: boolean;
  hits?: number;
  trust?: 'trusted' | 'low';
  tokenMatched?: boolean;
  verificationState?: 'pending' | 'verified' | 'manual' | 'legacy' | 'expired';
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  lastSeenAt?: string;
  lastHeartbeatAt?: string;
  nextAllowedHeartbeatAt?: string;
  lastDomainVerificationCheckAt?: string;
  nextDomainVerificationCheckAt?: string;
}

// ── Storage types ─────────────────────────────────────────────────────────────
interface CollectionStat { count: number; size: number; storageSize: number }
interface StorageStats {
  dataSize: number;
  storageSize: number;
  indexSize: number;
  clusterTotalSize: number; // all databases on this Atlas cluster
  collections: Record<string, CollectionStat>;
}

// ── Comments & Users types ────────────────────────────────────────────────────
interface CommentDoc {
  _id: string;
  userId: string;
  userName: string;
  userPic: string;
  text: string;
  originalText: string | null;
  hasAbuse: boolean;
  likes: number;
  parentId: string | null;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  createdAtIST: string;
  journalInfo?: { _id?: string; title: string; slug: string } | null;
}

interface JournalCommentStat {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  categoryName: string;
  count: number;
  abuseCount: number;
  totalSize: number;
}

interface UserDoc {
  _id: string;
  userId: string;
  userName: string;
  userPic: string;
  verified?: boolean;
  totalComments: number;
  firstCommentAt: string;
  lastCommentAt: string;
  lastJournalId: string;
  email?: string;
  serviceKey?: string;
  registrationIp?: string;
  registrationCountry?: string;
  lastActivityIp?: string;
  lastActivityCountry?: string;
  moderation?: Partial<Record<'full' | 'comments' | 'profile' | 'feedback', {
    active?: boolean;
    until?: string | null;
    reason?: string;
    updatedAt?: string;
    updatedAtIST?: string;
  }>>;
}

interface LinkAnalyticsItem {
  _id: string;
  targetUrl: string;
  targetHost: string;
  sourcePage: string;
  ip: string;
  userId: string | null;
  loggedIn: boolean;
  createdAt: string;
}

interface PageAnalyticsItem {
  _id: string;
  path: string;
  ts: string;
  timeSpentMs: number | null;
  referrer: string | null;
  userId: string | null;
  ip: string;
}

interface BlockDoc {
  _id: string;
  userId: string;
  userName: string;
  blockType: 'all' | 'post' | 'temp';
  journalId: string | null;
  expiresAt: string | null;
  reason: string;
  createdAtIST: string;
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function isDashboardModerationActive(entry?: { active?: boolean; until?: string | null }) {
  if (!entry?.active) return false;
  if (!entry.until) return true;
  const until = new Date(entry.until);
  return !Number.isNaN(until.getTime()) && until > new Date();
}

function formatModerationUntil(entry?: { until?: string | null }) {
  if (!entry?.until) return 'Until reactivated';
  const until = new Date(entry.until);
  if (Number.isNaN(until.getTime())) return 'Until reactivated';
  return until.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function maskServiceKey(serviceKey?: string) {
  if (!serviceKey) return '****************';
  return '*'.repeat(serviceKey.length);
}

const MONGODB_FREE_TIER_LIMIT_BYTES = 512 * 1024 * 1024; // 512 MB

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
  const MAX_TAGS = 7;
  const MAX_HASHTAGS = 7;
  const normalizeTag = (value: string, isHash = false) => {
    const trimmed = String(value || '').trim().toUpperCase();
    if (!trimmed) return '';
    const stripped = isHash ? trimmed.replace(/^#+/, '') : trimmed;
    return stripped.replace(/[^A-Z0-9-_]/g, '');
  };
  const normalizeTagArray = (list: unknown, isHash = false, max = 7) => {
    if (!Array.isArray(list)) return [];
    const cleaned = list
      .map((item) => normalizeTag(String(item || ''), isHash))
      .filter(Boolean);
    return Array.from(new Set(cleaned)).slice(0, max);
  };
  const buildAutoTagSet = (t: string, s: string, c: string) => {
    const source = [t, s, c]
      .join(' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&amp;|&quot;|&#39;/gi, ' ')
      .replace(/\s+/g, ' ');
    const words = source
      .split(/\s+/)
      .map((word) => normalizeTag(word))
      .filter((word) => word.length >= 3);
    const tokens = Array.from(new Set(words)).slice(0, MAX_TAGS);
    return { keywords: tokens, hashtags: tokens.slice(0, MAX_HASHTAGS) };
  };
  const [title, setTitle] = useState(initial?.title || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [content, setContent] = useState(initial?.content || '');
  // Purana: const [contentType, setContentType] = useState(initial?.contentType || 'richtext');
  const [contentType, setContentType] = useState(initial?.contentType || 'markdown');
  const [externalVideoThumbnail, setExternalVideoThumbnail] = useState(initial?.externalVideoThumbnail || '');
  const [keywords, setKeywords] = useState<string[]>(
    normalizeTagArray(initial?.keywords, false, MAX_TAGS)
  );
  const [hashtags, setHashtags] = useState<string[]>(
    normalizeTagArray(initial?.hashtags, true, MAX_HASHTAGS)
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
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
      await onSave({ title, summary, content, contentType, categorySlug, categoryName, readMinutes, images, externalVideoThumbnail, keywords, hashtags }, false);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onSave({ title, summary, content, contentType, categorySlug, categoryName, readMinutes, images, externalVideoThumbnail, keywords, hashtags }, true);
      setShowPreview(false);
    } finally {
      setPublishing(false);
    }
  };

  const extractTags = (input: string, isHash = false) => (
    input
      .split(/[,\n\s]+/)
      .map((part) => normalizeTag(part, isHash))
      .filter(Boolean)
  );

  const addKeywords = () => {
    const next = extractTags(keywordInput, false);
    if (!next.length) return;
    setKeywords((prev) => Array.from(new Set([...prev, ...next])).slice(0, MAX_TAGS));
    setKeywordInput('');
  };

  const addHashtags = () => {
    const next = extractTags(hashtagInput, true);
    if (!next.length) return;
    setHashtags((prev) => Array.from(new Set([...prev, ...next])).slice(0, MAX_HASHTAGS));
    setHashtagInput('');
  };

  const autoGenerateMissingTags = () => {
    const generated = buildAutoTagSet(title, summary, content);
    if (!generated.keywords.length && !generated.hashtags.length) return;
    setKeywords((prev) => (prev.length ? prev : generated.keywords.slice(0, MAX_TAGS)));
    setHashtags((prev) => (prev.length ? prev : generated.hashtags.slice(0, MAX_HASHTAGS)));
  };

  const sanitizeHttpUrl = (value: string) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) return '';
      return parsed.toString();
    } catch {
      return '';
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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 border border-zinc-800 rounded-xl p-3 bg-zinc-900/20">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tags (Max 7)</label>
              <button
                type="button"
                onClick={autoGenerateMissingTags}
                className="px-2.5 py-1 rounded-md border border-amber-500/30 text-amber-500 text-[10px] font-mono uppercase tracking-widest hover:bg-amber-500/10"
              >
                Auto Fill Missing
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addKeywords();
                  }
                }}
                placeholder="Add tag (without #)"
                className={`${inputCls} text-xs flex-1`}
              />
              <button type="button" onClick={addKeywords} disabled={keywords.length >= MAX_TAGS} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40`}>Add</button>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono">{keywords.length}/{MAX_TAGS} tags · auto stored in UPPERCASE</p>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <button
                    type="button"
                    key={kw}
                    onClick={() => setKeywords((prev) => prev.filter((k) => k !== kw))}
                    className="px-2 py-1 rounded-md border border-emerald-500/30 text-emerald-400 text-[10px] font-mono hover:border-red-500/40 hover:text-red-300"
                  >
                    {kw} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border border-zinc-800 rounded-xl p-3 bg-zinc-900/20">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Hashtags (Max 7)</label>
            <div className="flex gap-2">
              <input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addHashtags();
                  }
                }}
                placeholder="Add hashtag (type word only)"
                className={`${inputCls} text-xs flex-1`}
              />
              <button type="button" onClick={addHashtags} disabled={hashtags.length >= MAX_HASHTAGS} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40`}>Add</button>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono">{hashtags.length}/{MAX_HASHTAGS} hashtags · '#' is added automatically · UPPERCASE</p>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                    className="px-2 py-1 rounded-md border border-fuchsia-500/30 text-fuchsia-400 text-[10px] font-mono hover:border-red-500/40 hover:text-red-300"
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Default External Video Thumbnail (Optional)</label>
          <input
            type="url"
            value={externalVideoThumbnail}
            onChange={(e) => setExternalVideoThumbnail(e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
            className={inputCls}
          />
          <p className="text-[10px] text-zinc-600 font-mono">Used as poster image for external video embeds when available.</p>
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
          <p className="text-[10px] font-mono text-zinc-500">
            Pick the format you want to publish: Rich Text editor, Markdown, or raw HTML. The website, embeds, and previews will use this selected content type.
          </p>

          {/* Media Embed Actions */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-800/50">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest self-center mr-1">Embed:</span>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Enter Image URL:');
                if (!url?.trim()) return;
                const tag = `<img src="${url.trim()}" alt="image" class="w-full rounded-xl my-4" />`;
                setContent((prev) => prev + tag);
              }}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
            >
              🖼️ Image
            </button>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Enter Video URL (YouTube/external):');
                if (!url?.trim()) return;
                const trimmed = sanitizeHttpUrl(url);
                if (!trimmed) return;
                const thumbPrompt = window.prompt('Optional thumbnail URL (leave blank to skip):', externalVideoThumbnail || '');
                const thumb = sanitizeHttpUrl(thumbPrompt || '') || '';
                let tag: string;
                const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
                const videoExtRegex = /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?.*)?$/i;
                if (ytMatch) {
                  tag = `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" width="100%" height="400" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="rounded-xl my-4"></iframe>`;
                } else if (videoExtRegex.test(trimmed)) {
                  tag = `<video controls preload="metadata" playsinline src="${trimmed}" ${thumb ? `poster="${thumb}"` : ''} class="w-full rounded-xl my-4">Unable to play this video in browser. <a href="${trimmed}" target="_blank" rel="noopener noreferrer">Open video</a>.</video>`;
                } else {
                  tag = `<iframe src="${trimmed}" width="100%" height="400" style="border:0" loading="lazy" allowfullscreen class="rounded-xl my-4"></iframe>${thumb ? `<img src="${thumb}" alt="External video thumbnail" class="w-full rounded-xl my-2" />` : ''}`;
                }
                setContent((prev) => prev + tag);
              }}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
            >
              🎬 Video
            </button>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Enter Audio URL:');
                if (!url?.trim()) return;
                const trimmed = sanitizeHttpUrl(url);
                if (!trimmed) return;
                const tag = `<audio controls preload="none" src="${trimmed}" class="w-full my-4">Unable to play this audio in browser. <a href="${trimmed}" target="_blank" rel="noopener noreferrer">Open audio</a>.</audio>`;
                setContent((prev) => prev + tag);
              }}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
            >
              🎵 Audio
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
  const [watermarkSites, setWatermarkSites] = useState<WatermarkSiteAdmin[]>([]);
  const [watermarkLoading, setWatermarkLoading] = useState(false);
  const [watermarkPage, setWatermarkPage] = useState(1);
  const [watermarkTotalPages, setWatermarkTotalPages] = useState(1);
  const [watermarkStatusFilter, setWatermarkStatusFilter] = useState<WatermarkStatusFilter>('all');
  const [manualWatermarkUrl, setManualWatermarkUrl] = useState('');
  const [manualWatermarkTitle, setManualWatermarkTitle] = useState('');
  const [addingManualWatermark, setAddingManualWatermark] = useState(false);
  const [copiedWatermarkScript, setCopiedWatermarkScript] = useState(false);
  const [watermarkDomainInput, setWatermarkDomainInput] = useState('');
  const [watermarkDomainToken, setWatermarkDomainToken] = useState('');
  const [watermarkDomainVerification, setWatermarkDomainVerification] = useState('');
  const [watermarkChallengePath, setWatermarkChallengePath] = useState('');
  const [watermarkChallengeContent, setWatermarkChallengeContent] = useState('');
  const [watermarkChallengeExpiry, setWatermarkChallengeExpiry] = useState('');
  const [watermarkTxtHost, setWatermarkTxtHost] = useState('');
  const [watermarkTxtValue, setWatermarkTxtValue] = useState('');
  const [watermarkChallengeLoading, setWatermarkChallengeLoading] = useState(false);
  const [watermarkVerifyLoading, setWatermarkVerifyLoading] = useState(false);
  const [watermarkStatusLoading, setWatermarkStatusLoading] = useState(false);
  const [watermarkVerifyPopupOpen, setWatermarkVerifyPopupOpen] = useState(false);
  const RAW_WATERMARK_SCRIPT_URL = String(import.meta.env.VITE_WATERMARK_SCRIPT_URL || '').trim();
  const WATERMARK_SCRIPT_URL = RAW_WATERMARK_SCRIPT_URL || DEFAULT_WATERMARK_SCRIPT_URL;
  const watermarkEmbedSnippet = watermarkDomainToken
    ? `<script>window.DEEP_WATERMARK_SITE_TOKEN="${watermarkDomainToken}";</script>\n<script src="${WATERMARK_SCRIPT_URL}" defer></script>`
    : `<script src="${WATERMARK_SCRIPT_URL}" defer></script>`;

  // ── Live Status state ───────────────────────────────────────────────────
  const [statusIsVisible, setStatusIsVisible] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusHexColor, setStatusHexColor] = useState('#22c55e');
  const [statusIconType, setStatusIconType] = useState('Activity');
  const [statusCustomIcon, setStatusCustomIcon] = useState('');
  const [statusActionUrl, setStatusActionUrl] = useState('');
  const [statusGlow, setStatusGlow] = useState(true);
  const [statusFreeBy, setStatusFreeBy] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusMonitorMode, setStatusMonitorMode] = useState<StatusMonitorMode>('live');
  const [savingStatusMonitorMode, setSavingStatusMonitorMode] = useState(false);

  // ── Storage state ────────────────────────────────────────────────────────
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageSubTab, setStorageSubTab] = useState<'journals' | 'projects' | 'journey' | 'comments'>('journals');
  const [storageJournals, setStorageJournals] = useState<Journal[]>([]);
  const [storageJournalPage, setStorageJournalPage] = useState(1);
  const [storageProjectPage, setStorageProjectPage] = useState(1);
  const [storageJourneyPage, setStorageJourneyPage] = useState(1);
  const STORAGE_PAGE_SIZE = 5;
  const [feedbackStorageMeta, setFeedbackStorageMeta] = useState<{ totalFeedbacks: number; pinnedCount: number; categoriesCount: number }>({
    totalFeedbacks: 0,
    pinnedCount: 0,
    categoriesCount: 0,
  });
  const [analyticsRows, setAnalyticsRows] = useState<LinkAnalyticsItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [analyticsTotalPages, setAnalyticsTotalPages] = useState(1);
  const [analyticsHostFilter, setAnalyticsHostFilter] = useState('');
  const [analyticsSourceFilter, setAnalyticsSourceFilter] = useState('');
  const [analyticsLoginFilter, setAnalyticsLoginFilter] = useState<'all' | 'true' | 'false'>('all');
  const [analyticsAggregates, setAnalyticsAggregates] = useState<{
    byHost: Array<{ host: string; total: number }>;
    bySource: Array<{ sourcePage: string; total: number }>;
    byUser: Array<{ userId: string; total: number }>;
  }>({ byHost: [], bySource: [], byUser: [] });

  // ── Page Analytics state ───────────────────────────────────────────────────
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'links' | 'pages'>('links');
  const [pageAnalyticsRows, setPageAnalyticsRows] = useState<PageAnalyticsItem[]>([]);
  const [pageAnalyticsLoading, setPageAnalyticsLoading] = useState(false);
  const [pageAnalyticsPage, setPageAnalyticsPage] = useState(1);
  const [pageAnalyticsTotalPages, setPageAnalyticsTotalPages] = useState(1);
  const [pageAnalyticsPathFilter, setPageAnalyticsPathFilter] = useState('');
  const [pageAnalyticsTimeRange, setPageAnalyticsTimeRange] = useState<'7d' | '30d' | '6m' | '1y' | 'all'>('30d');
  const [pageAnalyticsAggregates, setPageAnalyticsAggregates] = useState<{
    byPath: Array<{ path: string; total: number }>;
    byUser: Array<{ userId: string; total: number }>;
    timeline: Array<{ date: string; total: number }>;
  }>({ byPath: [], byUser: [], timeline: [] });
  const [pageAnalyticsGuestOnly, setPageAnalyticsGuestOnly] = useState(false);

  // ── Comments storage sub-tab state ────────────────────────────────────────
  const [commentPosts, setCommentPosts] = useState<JournalCommentStat[]>([]);
  const [commentPostsPage, setCommentPostsPage] = useState(1);
  const [commentPostsTotal, setCommentPostsTotal] = useState(0);
  const [commentPostsTotalPages, setCommentPostsTotalPages] = useState(1);
  const [commentPostsLoading, setCommentPostsLoading] = useState(false);
  const [selectedCommentPost, setSelectedCommentPost] = useState<JournalCommentStat | null>(null);
  const [postComments, setPostComments] = useState<CommentDoc[]>([]);
  const [postCommentsPage, setPostCommentsPage] = useState(1);
  const [postCommentsTotal, setPostCommentsTotal] = useState(0);
  const [postCommentsTotalPages, setPostCommentsTotalPages] = useState(1);
  const [postCommentsLoading, setPostCommentsLoading] = useState(false);
  const [revealedAbuse, setRevealedAbuse] = useState<Set<string>>(new Set());

  // ── Block modal state ─────────────────────────────────────────────────────
  const [blockModalUser, setBlockModalUser] = useState<{ userId: string; userName: string; userPic: string; journalId?: string } | null>(null);
  const [blockType, setBlockType] = useState<'all' | 'post' | 'temp'>('all');
  const [blockHours, setBlockHours] = useState('');
  const [blockMinutes, setBlockMinutes] = useState('');
  const [blockDays, setBlockDays] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockSaving, setBlockSaving] = useState(false);

  // ── Users tab state ───────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null);
  const [userComments, setUserComments] = useState<CommentDoc[]>([]);
  const [userCommentsPage, setUserCommentsPage] = useState(1);
  const [userCommentsTotal, setUserCommentsTotal] = useState(0);
  const [userCommentsTotalPages, setUserCommentsTotalPages] = useState(1);
  const [userCommentsLoading, setUserCommentsLoading] = useState(false);
  const [userBlocks, setUserBlocks] = useState<BlockDoc[]>([]);
  const [userBlocksLoading, setUserBlocksLoading] = useState(false);
  const [revealedServiceKeyUsers, setRevealedServiceKeyUsers] = useState<Set<string>>(new Set());
  const [rotatingServiceKeyUserId, setRotatingServiceKeyUserId] = useState('');
  const [moderationScope, setModerationScope] = useState<'full' | 'comments' | 'profile' | 'feedback'>('full');
  const [moderationReason, setModerationReason] = useState('');
  const [moderationUntilMode, setModerationUntilMode] = useState<'manual' | 'date'>('manual');
  const [moderationUntil, setModerationUntil] = useState('');
  const [userActionModal, setUserActionModal] = useState<null | {
    operation: 'deactivate' | 'reactivate' | 'delete-content' | 'delete-user';
    userId: string;
    userName: string;
    scope?: 'full' | 'comments' | 'profile' | 'feedback';
    title: string;
    description: string;
  }>(null);
  const [confirmOwnerPassword, setConfirmOwnerPassword] = useState('');
  const [userActionSaving, setUserActionSaving] = useState(false);

  // ── Blacklist state ──────────────────────────────────────────────────────
  const [blacklist, setBlacklist] = useState<Array<{ _id: string; word: string }>>([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [addingBlacklistWord, setAddingBlacklistWord] = useState(false);

  // ── Client-side pagination for Projects & Journey ────────────────────────
  const [projectPage, setProjectPage] = useState(1);
  const PROJECT_PAGE_SIZE = 10;
  const [journeyPage, setJourneyPage] = useState(1);
  const JOURNEY_PAGE_SIZE = 10;

  const fetchStatusHistory = useCallback(async () => {
    try {
      const r = await fetch('/api/journal?action=status');
      const d = await r.json();
      if (d.ok) {
        const all = d.current ? [d.current, ...d.history] : d.history;
        setStatusHistory(all);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchStatusMonitorMode = useCallback(async () => {
    try {
      const r = await fetch('/api/journal?action=status-monitor-config');
      const d = await r.json();
      if (d?.ok) {
        const mode = String(d.mode || '').toLowerCase();
        if (mode === 'stop' || mode === 'maintenance' || mode === 'hiatus') setStatusMonitorMode(mode);
        else setStatusMonitorMode('live');
      }
    } catch { /* ignore */ }
  }, []);

  const fetchStorageStats = useCallback(async () => {
    setStorageLoading(true);
    try {
      const [statsRes, journalsRes, feedbackStatsRes, feedbackCatsRes] = await Promise.all([
        fetch('/api/journal?action=dbstats'),
        fetch('/api/journal?page=1&limit=100'),
        fetch('/api/journal?action=feedback-stats'),
        fetch('/api/categories?type=feedback'),
      ]);
      const statsData = await statsRes.json();
      if (statsData.ok) setStorageStats(statsData);
      const journalsData = await journalsRes.json();
      if (journalsData.ok) setStorageJournals(journalsData.journals);
      const feedbackStatsData = await feedbackStatsRes.json();
      const feedbackCatsData = await feedbackCatsRes.json();
      setFeedbackStorageMeta({
        totalFeedbacks: Number(feedbackStatsData?.stats?.totalFeedbacks || 0),
        pinnedCount: Number(feedbackStatsData?.stats?.pinnedCount || 0),
        categoriesCount: Array.isArray(feedbackCatsData?.categories) ? feedbackCatsData.categories.length : 0,
      });
    } catch { /* ignore */ }
    finally { setStorageLoading(false); }
  }, []);

  const fetchCommentPosts = useCallback(async (p = 1) => {
    setCommentPostsLoading(true);
    try {
      const r = await fetch(`/api/journal?action=journals-comment-stats&page=${p}`);
      const d = await r.json();
      if (d.ok) {
        setCommentPosts(d.journals);
        setCommentPostsPage(d.pagination.page);
        setCommentPostsTotal(d.pagination.total);
        setCommentPostsTotalPages(d.pagination.totalPages);
      }
    } catch { /* ignore */ }
    finally { setCommentPostsLoading(false); }
  }, []);

  const fetchPostComments = useCallback(async (journalId: string, p = 1) => {
    setPostCommentsLoading(true);
    try {
      const r = await fetch(`/api/journal?action=comment-admin-list&journalId=${journalId}&page=${p}`);
      const d = await r.json();
      if (d.ok) {
        setPostComments(d.comments);
        setPostCommentsPage(d.pagination.page);
        setPostCommentsTotal(d.pagination.total);
        setPostCommentsTotalPages(d.pagination.totalPages);
      }
    } catch { /* ignore */ }
    finally { setPostCommentsLoading(false); }
  }, []);

  const fetchUsers = useCallback(async (p = 1) => {
    setUsersLoading(true);
    try {
      const r = await fetch(`/api/journal?action=users&page=${p}`);
      const d = await r.json();
      if (d.ok) {
        setUsers((d.users || []).filter((u: UserDoc) => Boolean(u?.userId) && u.userId !== 'owner'));
        setUsersPage(d.pagination.page);
        setUsersTotal(d.pagination.total);
        setUsersTotalPages(d.pagination.totalPages);
      }
    } catch { /* ignore */ }
    finally { setUsersLoading(false); }
  }, []);

  const fetchLinkAnalytics = useCallback(async (
    p = 1,
    opts?: { host?: string; sourcePage?: string; loggedIn?: 'all' | 'true' | 'false' },
  ) => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'link-analytics',
        page: String(p),
        limit: '20',
      });
      const host = String(opts?.host ?? analyticsHostFilter).trim();
      const sourcePage = String(opts?.sourcePage ?? analyticsSourceFilter).trim();
      const loggedIn = String(opts?.loggedIn ?? analyticsLoginFilter).trim() as 'all' | 'true' | 'false';
      if (host) params.set('host', host);
      if (sourcePage) params.set('sourcePage', sourcePage);
      if (loggedIn !== 'all') params.set('loggedIn', loggedIn);
      const response = await fetch(`/api/journal?${params.toString()}`);
      const payload = await response.json();
      if (payload?.ok) {
        setAnalyticsRows(Array.isArray(payload.items) ? payload.items : []);
        setAnalyticsPage(Number(payload.page || p));
        setAnalyticsTotalPages(Math.max(1, Number(payload.totalPages || 1)));
        setAnalyticsAggregates({
          byHost: Array.isArray(payload?.aggregates?.byHost) ? payload.aggregates.byHost : [],
          bySource: Array.isArray(payload?.aggregates?.bySource) ? payload.aggregates.bySource : [],
          byUser: Array.isArray(payload?.aggregates?.byUser) ? payload.aggregates.byUser : [],
        });
      }
    } catch { /* ignore */ }
    finally { setAnalyticsLoading(false); }
  }, [analyticsHostFilter, analyticsLoginFilter, analyticsSourceFilter]);

  const fetchUserComments = useCallback(async (userId: string, p = 1) => {
    setUserCommentsLoading(true);
    try {
      const r = await fetch(`/api/journal?action=user-comments&userId=${encodeURIComponent(userId)}&page=${p}`);
      const d = await r.json();
      if (d.ok) {
        setUserComments(d.comments);
        setUserCommentsPage(d.pagination.page);
        setUserCommentsTotal(d.pagination.total);
        setUserCommentsTotalPages(d.pagination.totalPages);
      }
    } catch { /* ignore */ }
    finally { setUserCommentsLoading(false); }
  }, []);

  const fetchUserBlocks = useCallback(async (userId: string) => {
    setUserBlocksLoading(true);
    try {
      const r = await fetch(`/api/journal?action=user-blocks&userId=${encodeURIComponent(userId)}`);
      const d = await r.json();
      if (d.ok) setUserBlocks(d.blocks || []);
    } catch { /* ignore */ }
    finally { setUserBlocksLoading(false); }
  }, []);

  const handleUnblockUser = async (blockId: string) => {
    try {
      const r = await fetch(`/api/journal?action=block&id=${encodeURIComponent(blockId)}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.ok) {
        showToast('Block removed');
        if (selectedUser) fetchUserBlocks(selectedUser.userId);
      } else showToast(d.message || 'Error removing block', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleToggleUserVerified = async (userId: string, nextVerified: boolean) => {
    try {
      const r = await fetch('/api/journal?action=user-verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified: nextVerified }),
      });
      const d = await r.json();
      if (!d.ok) {
        showToast(d.message || 'Failed to update verification', 'error');
        return;
      }
      setUsers(prev => prev.map(u => (u.userId === userId ? { ...u, verified: nextVerified } : u)));
      setSelectedUser(prev => (prev && prev.userId === userId ? { ...prev, verified: nextVerified } : prev));
      showToast(nextVerified ? 'User verified' : 'User unverified');
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleCopyServiceKey = async (serviceKey?: string) => {
    if (!serviceKey) return;
    try {
      await navigator.clipboard.writeText(serviceKey);
      showToast('Service key copied');
    } catch {
      showToast('Failed to copy service key', 'error');
    }
  };

  const handleRotateServiceKey = async (targetUserId: string) => {
    if (!targetUserId) return;
    setRotatingServiceKeyUserId(targetUserId);
    try {
      const r = await fetch('/api/journal?action=user-service-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const d = await r.json();
      if (!d.ok) {
        showToast(d.message || 'Failed to rotate service key', 'error');
        return;
      }
      const nextServiceKey = String(d?.user?.serviceKey || '');
      const nextEmail = String(d?.user?.email || '');
      setUsers(prev => prev.map(u => (
        u.userId === targetUserId ? { ...u, serviceKey: nextServiceKey, email: nextEmail } : u
      )));
      setSelectedUser(prev => (
        prev && prev.userId === targetUserId ? { ...prev, serviceKey: nextServiceKey, email: nextEmail } : prev
      ));
      setRevealedServiceKeyUsers(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
      showToast('Service key rotated');
    } catch {
      showToast('Network error', 'error');
    } finally {
      setRotatingServiceKeyUserId('');
    }
  };

  const openUserActionModal = (
    operation: 'deactivate' | 'reactivate' | 'delete-content' | 'delete-user',
    scope?: 'full' | 'comments' | 'profile' | 'feedback',
  ) => {
    if (!selectedUser) return;
    const scopeLabel = scope === 'full'
      ? 'full account'
      : scope === 'comments'
        ? 'comments'
        : scope === 'profile'
          ? 'profile'
          : 'feedback';
    const titleMap = {
      deactivate: `Deactivate ${scopeLabel}`,
      reactivate: `Reactivate ${scopeLabel}`,
      'delete-content': 'Delete comments + feedback',
      'delete-user': 'Permanently delete user',
    } as const;
    const descriptionMap = {
      deactivate: `This will apply a temporary ${scopeLabel} restriction to ${selectedUser.userName}.`,
      reactivate: `This will remove the current ${scopeLabel} restriction from ${selectedUser.userName}.`,
      'delete-content': `This will permanently delete all comments, replies, and feedback for ${selectedUser.userName}, while keeping the user profile.`,
      'delete-user': `This will permanently delete ${selectedUser.userName}'s profile, comments, replies, feedback, and related moderation records.`,
    } as const;
    setConfirmOwnerPassword('');
    setUserActionModal({
      operation,
      userId: selectedUser.userId,
      userName: selectedUser.userName,
      scope,
      title: titleMap[operation],
      description: descriptionMap[operation],
    });
  };

  const handleConfirmUserAction = async () => {
    if (!userActionModal) return;
    setUserActionSaving(true);
    try {
      const payload: Record<string, unknown> = {
        userId: userActionModal.userId,
        operation: userActionModal.operation,
        confirmPassword: confirmOwnerPassword,
      };
      if (userActionModal.scope) payload.scope = userActionModal.scope;
      if (userActionModal.operation === 'deactivate') {
        payload.reason = moderationReason.trim();
        payload.until = moderationUntilMode === 'date' && moderationUntil
          ? new Date(moderationUntil).toISOString()
          : null;
      }

      const r = await fetch('/api/journal?action=user-moderation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!d.ok) {
        showToast(d.message || 'Failed to update user action', 'error');
        return;
      }

      if (userActionModal.operation === 'delete-user') {
        showToast('User permanently deleted');
        setSelectedUser(null);
        setUserComments([]);
        setUserBlocks([]);
        fetchUsers(1);
      } else {
        if (d.user) {
          setSelectedUser(d.user);
          setUsers(prev => prev.map(u => (u.userId === d.user.userId ? { ...u, ...d.user } : u)));
        }
        if (userActionModal.operation === 'delete-content' && selectedUser) {
          fetchUserComments(selectedUser.userId, 1);
        }
        showToast(d.message || 'User updated');
      }

      setUserActionModal(null);
      setConfirmOwnerPassword('');
    } catch {
      showToast('Network error', 'error');
    } finally {
      setUserActionSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string, journalId?: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const r = await fetch(`/api/journal?action=comment&id=${commentId}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.ok) {
        showToast('Comment deleted');
        if (journalId) fetchPostComments(journalId, postCommentsPage);
        if (selectedUser) fetchUserComments(selectedUser.userId, userCommentsPage);
      } else showToast(d.message || 'Error', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleBlockUser = async () => {
    if (!blockModalUser) return;
    setBlockSaving(true);
    try {
      const payload: Record<string, unknown> = {
        userId: blockModalUser.userId,
        userName: blockModalUser.userName,
        userPic: blockModalUser.userPic,
        blockType,
        reason: blockReason,
      };
      if (blockType === 'post' && blockModalUser.journalId) payload.journalId = blockModalUser.journalId;
      if (blockType === 'temp') {
        payload.hours = parseFloat(blockHours) || 0;
        payload.minutes = parseFloat(blockMinutes) || 0;
        payload.days = parseFloat(blockDays) || 0;
      }
      const r = await fetch('/api/journal?action=block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.ok) {
        showToast(`User blocked (${blockType})`);
        setBlockModalUser(null);
        setBlockReason(''); setBlockHours(''); setBlockMinutes(''); setBlockDays('');
        if (selectedUser && selectedUser.userId === blockModalUser.userId) fetchUserBlocks(selectedUser.userId);
      } else showToast(d.message || 'Error blocking user', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setBlockSaving(false); }
  };

  useEffect(() => {
    if (tab === 'status' && authenticated) {
      fetchStatusHistory();
      fetchStatusMonitorMode();
    }
  }, [tab, authenticated, fetchStatusHistory, fetchStatusMonitorMode]);

  useEffect(() => {
    if (tab === 'storage' && authenticated) fetchStorageStats();
  }, [tab, authenticated, fetchStorageStats]);

  useEffect(() => {
    if (tab === 'storage' && authenticated && storageSubTab === 'comments') {
      fetchCommentPosts(1);
      setSelectedCommentPost(null);
      setPostComments([]);
    }
  }, [tab, authenticated, storageSubTab, fetchCommentPosts]);

  useEffect(() => {
    if (tab === 'users' && authenticated) fetchUsers(1);
  }, [tab, authenticated, fetchUsers]);

  useEffect(() => {
    if (tab === 'analytics' && authenticated) fetchLinkAnalytics(1);
  }, [tab, authenticated, fetchLinkAnalytics]);

  useEffect(() => {
    if (tab === 'settings' && authenticated) {
      setBlacklistLoading(true);
      fetch('/api/journal?action=blacklist')
        .then(r => r.json())
        .then(d => { if (d.ok) setBlacklist(d.blacklist || []); })
        .catch(() => {})
        .finally(() => setBlacklistLoading(false));
    }
  }, [tab, authenticated]);

  const handleAddBlacklistWord = async () => {
    const word = newBlacklistWord.trim().toLowerCase();
    if (!word) return;
    setAddingBlacklistWord(true);
    try {
      const r = await fetch('/api/journal?action=blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      const d = await r.json();
      if (d.ok && d.item) {
        setBlacklist(prev => [d.item, ...prev.filter(b => b.word !== word)]);
        setNewBlacklistWord('');
        showToast('Word added to blacklist');
      } else {
        showToast(d.message || 'Error', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setAddingBlacklistWord(false); }
  };

  const handleRemoveBlacklistWord = async (id: string) => {
    try {
      const r = await fetch(`/api/journal?action=blacklist&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.ok) {
        setBlacklist(prev => prev.filter(b => b._id !== id));
        showToast('Word removed from blacklist');
      } else {
        showToast(d.message || 'Error', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleStatusDelete = async (id: string) => {
    if (!confirm('Delete this status from history?')) return;
    try {
      const r = await fetch(`/api/journal?action=status&id=${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.ok) {
        showToast('Status deleted');
        fetchStatusHistory();
      } else {
        showToast(d.message || 'Error deleting status', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleStatusMonitorModeChange = async (mode: StatusMonitorMode) => {
    if (savingStatusMonitorMode || mode === statusMonitorMode) return;
    setSavingStatusMonitorMode(true);
    try {
      const r = await fetch('/api/journal?action=status-monitor-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const d = await r.json();
      if (d?.ok) {
        setStatusMonitorMode((String(d.mode || '').toLowerCase() as StatusMonitorMode) || mode);
        showToast('Status page mode updated');
      } else {
        showToast(d.message || 'Error updating status page mode', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSavingStatusMonitorMode(false);
    }
  };

  const startEditStatus = (s: any) => {
    setEditingStatusId(s._id);
    setStatusIsVisible(s.isVisible !== false);
    setStatusMessage(s.message);
    setStatusHexColor(s.hexColor);
    const isCustom = !['Activity', 'Coffee', 'BookOpen', 'Code', 'Monitor', 'Radio'].includes(s.icon);
    setStatusIconType(isCustom ? 'custom' : s.icon);
    if (isCustom) setStatusCustomIcon(s.icon);
    setStatusActionUrl(s.actionUrl || '');
    setStatusGlow(s.glow);
    setStatusFreeBy(s.freeBy || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingStatusId(null);
    setStatusMessage('');
    setStatusFreeBy('');
    setStatusActionUrl('');
    setStatusIsVisible(true);
  };

  const handleStatusSave = async (e: FormEvent) => {
    e.preventDefault();
    if (statusIsVisible && !statusMessage.trim()) {
      showToast('Message is required when status is visible', 'error');
      return;
    }
    setSavingStatus(true);
    try {
      const finalIcon = statusIconType === 'custom' ? statusCustomIcon.trim() : statusIconType;
      const payload = {
        isVisible: statusIsVisible,
        message: statusMessage.trim(),
        hexColor: statusHexColor,
        icon: finalIcon || 'Activity',
        actionUrl: statusActionUrl.trim(),
        glow: statusGlow,
        freeBy: statusFreeBy.trim()
      };

      const method = editingStatusId ? 'PUT' : 'POST';
      const finalPayload = editingStatusId ? { ...payload, _id: editingStatusId } : payload;

      const r = await fetch('/api/journal?action=status', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      const d = await r.json();
      if (d.ok) {
        showToast(editingStatusId ? 'Status updated!' : 'Live status pushed!');
        handleCancelEdit();
        fetchStatusHistory();
      } else {
        showToast(d.message || 'Error updating status', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSavingStatus(false); }
  };

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

  const fetchWatermarkSites = useCallback(async (page = 1, status: WatermarkStatusFilter = 'all') => {
    setWatermarkLoading(true);
    try {
      const r = await fetch(`/api/projects?action=watermark-sites&status=${encodeURIComponent(status)}&page=${page}&limit=10`);
      const d = await r.json();
      if (d.ok) {
        setWatermarkSites(Array.isArray(d.sites) ? d.sites : []);
        setWatermarkPage(Number(d?.pagination?.page || page));
        setWatermarkTotalPages(Math.max(1, Number(d?.pagination?.totalPages || 1)));
      }
    } catch {
      setWatermarkSites([]);
    } finally {
      setWatermarkLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'watermarks' && authenticated) {
      fetchWatermarkSites(1, watermarkStatusFilter);
    }
  }, [tab, authenticated, watermarkStatusFilter, fetchWatermarkSites]);

  // ── Fetch journals ──────────────────────────────────────────────────────
  const fetchJournals = useCallback(async (page = 1, catFilter = '') => {
    setLoadingJournals(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
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
        // Clear any Google user session to avoid conflicts
        localStorage.removeItem('dd_comment_user');
      } else {
        if (d.retryAfterSec) {
          const mins = Math.ceil(Number(d.retryAfterSec || 0) / 60);
          setLoginError(`${d.message || 'Too many attempts.'} Retry after ~${mins} minute(s).`);
        } else {
          setLoginError(d.message || 'Incorrect password');
        }
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

  const handleWatermarkStatusUpdate = async (id: string, status: 'pending' | 'approved' | 'declined', title?: string) => {
    try {
      const r = await fetch('/api/projects?action=watermark-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, ...(title ? { title } : {}) }),
      });
      const d = await r.json();
      if (d.ok) {
        showToast(`Watermark site marked ${status}`);
        fetchWatermarkSites(watermarkPage, watermarkStatusFilter);
      } else {
        showToast(d.message || 'Failed to update status', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleApproveWatermark = (site: WatermarkSiteAdmin) => {
    const rawTagline = window.prompt(
      'Enter button tagline for this website (example: Developer, Portfolio, Client Work):',
      site.title || site.domain || 'Developer',
    );
    if (rawTagline === null) return;
    const tagline = rawTagline.trim();
    if (!tagline) {
      showToast('Tagline is required to approve this site.', 'error');
      return;
    }
    handleWatermarkStatusUpdate(site._id, 'approved', tagline);
  };

  const handleWatermarkVisibilityToggle = async (site: WatermarkSiteAdmin) => {
    try {
      const r = await fetch('/api/projects?action=watermark-visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: site._id, hidden: !site.hidden }),
      });
      const d = await r.json();
      if (d.ok) {
        showToast(site.hidden ? 'Site unhidden' : 'Site hidden');
        fetchWatermarkSites(watermarkPage, watermarkStatusFilter);
      } else {
        showToast(d.message || 'Failed to update visibility', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleWatermarkDelete = async (id: string) => {
    if (!confirm('Delete this watermark site record?')) return;
    try {
      const r = await fetch(`/api/projects?action=watermark-site&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.ok) {
        showToast('Watermark site deleted');
        fetchWatermarkSites(watermarkPage, watermarkStatusFilter);
      } else {
        showToast(d.message || 'Failed to delete', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleManualWatermarkAdd = async () => {
    if (!manualWatermarkUrl.trim()) return;
    setAddingManualWatermark(true);
    try {
      const r = await fetch('/api/projects?action=watermark-manual-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: manualWatermarkUrl.trim(), title: manualWatermarkTitle.trim() }),
      });
      const d = await r.json();
      if (d.ok) {
        setManualWatermarkUrl('');
        setManualWatermarkTitle('');
        showToast('Manual watermark site added');
        fetchWatermarkSites(1, watermarkStatusFilter);
      } else {
        showToast(d.message || 'Failed to add site', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setAddingManualWatermark(false);
    }
  };

  const handleCopyWatermarkScript = async () => {
    try {
      await navigator.clipboard.writeText(watermarkEmbedSnippet);
      setCopiedWatermarkScript(true);
      window.setTimeout(() => setCopiedWatermarkScript(false), 1600);
    } catch {
      setCopiedWatermarkScript(false);
      showToast('Failed to copy watermark script', 'error');
    }
  };

  const handleIssueWatermarkChallenge = async () => {
    const domain = watermarkDomainInput.trim().toLowerCase();
    if (!domain) {
      showToast('Enter a domain first', 'error');
      return;
    }
    setWatermarkChallengeLoading(true);
    try {
      const r = await fetch('/api/projects?action=watermark-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, url: `https://${domain}/` }),
      });
      const d = await r.json();
      if (!d.ok) {
        showToast(d.message || 'Failed to issue challenge', 'error');
        return;
      }
      setWatermarkChallengePath(String(d?.challenge?.path || ''));
      setWatermarkChallengeContent(String(d?.challenge?.content || ''));
      setWatermarkChallengeExpiry(String(d?.challenge?.expiresAt || ''));
      setWatermarkTxtHost(String(d?.challenge?.txt?.host || ''));
      setWatermarkTxtValue(String(d?.challenge?.txt?.value || ''));
      setWatermarkDomainVerification(String(d?.verificationState || 'pending'));
      setWatermarkDomainToken('');
      showToast('Verification challenge issued');
    } catch {
      showToast('Network error', 'error');
    } finally {
      setWatermarkChallengeLoading(false);
    }
  };

  const handleVerifyWatermarkDomain = async () => {
    const domain = watermarkDomainInput.trim().toLowerCase();
    if (!domain) {
      showToast('Enter a domain first', 'error');
      return;
    }
    setWatermarkVerifyLoading(true);
    try {
      const r = await fetch('/api/projects?action=watermark-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const d = await r.json();
      if (!d.ok) {
        showToast(d.message || 'Verification failed', 'error');
        return;
      }
      setWatermarkDomainVerification(String(d.verificationState || 'verified'));
      setWatermarkDomainToken(String(d.siteToken || ''));
      showToast('Domain verified and secure token issued');
      setWatermarkChallengePath('');
      setWatermarkChallengeContent('');
      setWatermarkChallengeExpiry('');
      setWatermarkTxtHost('');
      setWatermarkTxtValue('');
      await fetchWatermarkDomainStatus(domain, { silent: true });
      fetchWatermarkSites(watermarkPage, watermarkStatusFilter);
    } catch {
      showToast('Network error', 'error');
    } finally {
      setWatermarkVerifyLoading(false);
    }
  };

  const fetchWatermarkDomainStatus = useCallback(async (domainRaw: string, opts?: { silent?: boolean }) => {
    const domain = domainRaw.trim().toLowerCase();
    if (!domain) return;
    setWatermarkStatusLoading(true);
    try {
      const r = await fetch(`/api/projects?action=watermark-status&domain=${encodeURIComponent(domain)}`);
      const d = await r.json();
      if (!d.ok) {
        if (!opts?.silent) showToast(d.message || 'Failed to load domain verification state', 'error');
        return;
      }
      const site = d.site || {};
      const challenge = site.challenge || {};
      setWatermarkDomainInput(domain);
      setWatermarkDomainVerification(String(site.verificationState || 'unknown'));
      setWatermarkDomainToken(String(site.siteToken || ''));
      setWatermarkChallengePath(String(challenge.path || ''));
      setWatermarkChallengeContent(String(challenge.content || ''));
      setWatermarkChallengeExpiry(String(challenge.expiresAt || ''));
      setWatermarkTxtHost(String(challenge?.txt?.host || ''));
      setWatermarkTxtValue(String(challenge?.txt?.value || ''));
      if (!opts?.silent) showToast('Loaded existing verification details');
    } catch {
      if (!opts?.silent) showToast('Network error', 'error');
    } finally {
      setWatermarkStatusLoading(false);
    }
  }, []);

  const openWatermarkVerifyPopup = async (domain: string) => {
    setWatermarkVerifyPopupOpen(true);
    setWatermarkDomainInput(domain);
    await fetchWatermarkDomainStatus(domain, { silent: true });
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
          <p className="text-zinc-500 text-sm mt-0.5">Manage journals, categories, feedback, journey timeline, and settings</p>
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Journals', value: journalTotal },
          { label: 'Published', value: journals.filter((j) => j.published).length },
          { label: 'Ecosystem', value: projectMode === 'custom' ? projects.length : 'Default' }, // <-- YE NAYA HAI
          { label: 'Drafts', value: journals.filter((j) => !j.published).length },
          { label: 'Categories', value: categories.length },
          { label: 'Feedbacks', value: feedbackStorageMeta.totalFeedbacks },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">{stat.label}</p>
            <p className="text-amber-500 text-2xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
        {/* Storage card — shows full cluster total */}
        <div
          className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-700 transition-colors"
          onClick={() => setTab('storage')}
          title="Click to view storage details"
        >
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono flex items-center gap-1">
            <HardDrive size={10} /> Cluster Storage
          </p>
          {storageStats ? (
            <>
              <p className="text-amber-500 text-2xl font-black mt-1">{formatBytes(storageStats.storageSize)}</p>
              <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (storageStats.storageSize / MONGODB_FREE_TIER_LIMIT_BYTES) * 100)}%` }}
                />
              </div>
              <p className="text-zinc-600 text-[9px] font-mono mt-1">{((storageStats.storageSize / MONGODB_FREE_TIER_LIMIT_BYTES) * 100).toFixed(2)}% of 512 MB</p>
            </>
          ) : (
            <p className="text-zinc-600 text-sm mt-1">—</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-0 overflow-x-auto">
        {([
          { id: 'journals', label: 'Journals', icon: <BookOpen size={14} /> },
          { id: 'projects', label: 'Projects', icon: <Layers size={14} /> },    // <-- YE NAYA TAB HAI
          { id: 'watermarks', label: 'Watermarks', icon: <Link2 size={14} /> },
          { id: 'status', label: 'Live Status', icon: <Activity size={14} /> },     // <-- YE NAYA TAB HAI v2
          { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={14} /> },
          { id: 'categories', label: 'Categories', icon: <Tag size={14} /> },
          { id: 'journey', label: 'Journey', icon: <Clock size={14} /> },
          { id: 'storage', label: 'Storage', icon: <HardDrive size={14} /> },
          { id: 'analytics', label: 'Analytics', icon: <Activity size={14} /> },
          { id: 'users', label: 'Users', icon: <Users size={14} /> },
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

      {/* ── Feedback Tab ─────────────────────────────────────────────────── */}
      {tab === 'feedback' && (
        <FeedbackAdminPanel onChanged={fetchStorageStats} />
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
                     <>
                       <div className="space-y-3">
                         {projects.slice((projectPage - 1) * PROJECT_PAGE_SIZE, projectPage * PROJECT_PAGE_SIZE).map(p => (
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
                       {Math.ceil(projects.length / PROJECT_PAGE_SIZE) > 1 && (
                         <div className="flex items-center justify-center gap-3 pt-2">
                           <button onClick={() => setProjectPage(p => Math.max(1, p - 1))} disabled={projectPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                           <span className="text-zinc-500 text-sm">Page {projectPage} / {Math.ceil(projects.length / PROJECT_PAGE_SIZE)}</span>
                           <button onClick={() => setProjectPage(p => Math.min(Math.ceil(projects.length / PROJECT_PAGE_SIZE), p + 1))} disabled={projectPage >= Math.ceil(projects.length / PROJECT_PAGE_SIZE)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                         </div>
                       )}
                     </>
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

      {/* ── Watermarks Tab ───────────────────────────────────────────────── */}
      {tab === 'watermarks' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="text-white font-bold text-base">Official Watermark Script</h3>
              <button
                onClick={handleCopyWatermarkScript}
                className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 inline-flex items-center gap-2`}
              >
                <Clipboard size={14} />
                {copiedWatermarkScript ? 'Copied' : 'Copy Script'}
              </button>
            </div>
            {!RAW_WATERMARK_SCRIPT_URL && (
              <p className="text-[11px] text-amber-500/80">
                Using default hosted script URL. Set <code className="bg-black/50 px-1 rounded">VITE_WATERMARK_SCRIPT_URL</code> to override.
              </p>
            )}
            <div className="grid md:grid-cols-[1fr_auto_auto] gap-2">
              <input
                value={watermarkDomainInput}
                onChange={(e) => setWatermarkDomainInput(e.target.value)}
                placeholder="example.com"
                className={inputCls}
              />
              <button
                onClick={handleIssueWatermarkChallenge}
                disabled={watermarkChallengeLoading || !watermarkDomainInput.trim()}
                className={`${btnCls} bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50`}
              >
                {watermarkChallengeLoading ? 'Issuing...' : 'Issue Challenge'}
              </button>
              <button
                onClick={handleVerifyWatermarkDomain}
                disabled={watermarkVerifyLoading || !watermarkDomainInput.trim()}
                className={`${btnCls} bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50`}
              >
                {watermarkVerifyLoading ? 'Verifying...' : 'Verify Domain'}
              </button>
            </div>
            <button
              onClick={() => fetchWatermarkDomainStatus(watermarkDomainInput)}
              disabled={watermarkStatusLoading || !watermarkDomainInput.trim()}
              className={`${btnCls} bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/25 disabled:opacity-50 inline-flex items-center gap-2`}
            >
              {watermarkStatusLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {watermarkStatusLoading ? 'Loading...' : 'Load Existing Codes'}
            </button>
            <p className="text-[11px] text-zinc-500">
              Verification state: <span className="uppercase text-zinc-300">{watermarkDomainVerification || 'unknown'}</span>{' '}
              {watermarkDomainToken ? '• Secure domain token ready for snippet.' : '• Run challenge + verify to issue domain token using file OR DNS method.'}
            </p>
            {watermarkChallengePath && watermarkChallengeContent && (
              <div className="text-[11px] text-zinc-400 bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-1">
                <p className="text-zinc-300">Method 1 — Create this file on your domain:</p>
                <p className="font-mono text-amber-400 break-all">{watermarkChallengePath}</p>
                <p>With exact content:</p>
                <p className="font-mono text-emerald-300 break-all">{watermarkChallengeContent}</p>
                {watermarkTxtHost && watermarkTxtValue && (
                  <>
                    <p aria-hidden="true" className="text-zinc-300 mt-2">OR</p>
                    <p className="text-zinc-300">Method 2 — Add DNS TXT record:</p>
                    <p className="font-mono text-amber-400 break-all">Host: {watermarkTxtHost}</p>
                    <p className="font-mono text-emerald-300 break-all">Value: {watermarkTxtValue}</p>
                  </>
                )}
                {watermarkChallengeExpiry && <p>Expires: {new Date(watermarkChallengeExpiry).toLocaleString()}</p>}
              </div>
            )}
            <pre className="text-[11px] text-zinc-300 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-all">
              {watermarkEmbedSnippet}
            </pre>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-base">Manually Add and Approve Site</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                value={manualWatermarkUrl}
                onChange={(e) => setManualWatermarkUrl(e.target.value)}
                placeholder="https://example.com/page"
                className={inputCls}
              />
              <input
                value={manualWatermarkTitle}
                onChange={(e) => setManualWatermarkTitle(e.target.value)}
                placeholder="Optional title"
                className={inputCls}
              />
            </div>
            <button
              onClick={handleManualWatermarkAdd}
              disabled={addingManualWatermark || !manualWatermarkUrl.trim()}
              className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 inline-flex items-center gap-2 disabled:opacity-50`}
            >
              {addingManualWatermark ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add & Approve
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={watermarkStatusFilter}
              onChange={(e) => { setWatermarkStatusFilter(e.target.value as WatermarkStatusFilter); setWatermarkPage(1); }}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
            <button
              onClick={() => fetchWatermarkSites(watermarkPage, watermarkStatusFilter)}
              className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}
            >
              Refresh
            </button>
          </div>

          {watermarkLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
          ) : watermarkSites.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
              <Link2 size={30} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No watermark sites found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {watermarkSites.map((site) => (
                <div key={site._id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={getGoogleFaviconUrl(site.url || site.domain, 64)}
                      alt={site.domain}
                      className="w-7 h-7 rounded border border-zinc-700"
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{site.domain || site.url}</p>
                      <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 text-xs truncate hover:text-amber-400 transition-colors block">{site.url}</a>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                        <span className={`uppercase px-1.5 py-0.5 rounded ${getWatermarkStatusBadgeClass(site.status)}`}>{site.status}</span>
                        <span className="text-zinc-600">Source: <span className="uppercase">{site.source || 'auto'}</span></span>
                        <span className="text-zinc-600">Trust: <span className={`uppercase ${site.trust === 'trusted' ? 'text-emerald-400' : 'text-amber-400'}`}>{site.trust || 'low'}</span></span>
                        <span className="text-zinc-600">Verify: <span className={`uppercase ${site.verificationState === 'verified' || site.verificationState === 'manual' ? 'text-emerald-400' : site.verificationState === 'expired' ? 'text-red-400' : 'text-amber-400'}`}>{site.verificationState || 'pending'}</span></span>
                        <span className="text-zinc-600">Hidden: <span className="uppercase">{site.hidden ? 'Yes' : 'No'}</span></span>
                        <span className="text-zinc-600">Hits: {site.hits || 0}</span>
                        {site.lastSeenAt && <span className="text-zinc-600">Seen: {new Date(site.lastSeenAt).toLocaleDateString()}</span>}
                        {site.nextAllowedHeartbeatAt && <span className="text-zinc-600">Next Heartbeat: {new Date(site.nextAllowedHeartbeatAt).toLocaleDateString()}</span>}
                        {site.nextDomainVerificationCheckAt && <span className="text-zinc-600">Next Verify: {new Date(site.nextDomainVerificationCheckAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button onClick={() => openWatermarkVerifyPopup(site.domain)} className={`${btnCls} bg-sky-500/10 border border-sky-500/40 text-sky-300 hover:bg-sky-500/20 text-xs px-3 py-1.5`}>
                      Verify
                    </button>
                    <button onClick={() => handleApproveWatermark(site)} className={`${btnCls} bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-xs px-3 py-1.5`}>
                      Approve
                    </button>
                    <button onClick={() => handleWatermarkStatusUpdate(site._id, 'declined')} className={`${btnCls} bg-orange-500/10 border border-orange-500/40 text-orange-300 hover:bg-orange-500/20 text-xs px-3 py-1.5`}>
                      Decline
                    </button>
                    <button onClick={() => handleWatermarkStatusUpdate(site._id, 'pending')} className={`${btnCls} bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-xs px-3 py-1.5`}>
                      Pending
                    </button>
                    <button onClick={() => handleWatermarkVisibilityToggle(site)} className={`${btnCls} bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 text-xs px-3 py-1.5`}>
                      {site.hidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button onClick={() => handleWatermarkDelete(site._id)} className={`${btnCls} bg-red-900/20 border border-red-900/50 text-red-300 hover:bg-red-900/35 text-xs px-3 py-1.5 inline-flex items-center gap-1`}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {watermarkTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => { const p = Math.max(1, watermarkPage - 1); setWatermarkPage(p); fetchWatermarkSites(p, watermarkStatusFilter); }} disabled={watermarkPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
              <span className="text-zinc-500 text-sm">Page {watermarkPage} / {watermarkTotalPages}</span>
              <button onClick={() => { const p = Math.min(watermarkTotalPages, watermarkPage + 1); setWatermarkPage(p); fetchWatermarkSites(p, watermarkStatusFilter); }} disabled={watermarkPage >= watermarkTotalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
            </div>
          )}

          {watermarkVerifyPopupOpen && (
            <div className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
              <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold">Verify Domain (Method 1 OR Method 2)</h4>
                  <button
                    type="button"
                    onClick={() => setWatermarkVerifyPopupOpen(false)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[12px] text-zinc-400">
                  Domain: <span className="text-zinc-200 font-mono">{watermarkDomainInput || '—'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleIssueWatermarkChallenge}
                    disabled={watermarkChallengeLoading || !watermarkDomainInput.trim()}
                    className={`${btnCls} bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50`}
                  >
                    {watermarkChallengeLoading ? 'Issuing...' : 'Issue Challenge'}
                  </button>
                  <button
                    onClick={handleVerifyWatermarkDomain}
                    disabled={watermarkVerifyLoading || !watermarkDomainInput.trim()}
                    className={`${btnCls} bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50`}
                  >
                    {watermarkVerifyLoading ? 'Verifying...' : 'Verify Domain'}
                  </button>
                  <button
                    onClick={() => fetchWatermarkDomainStatus(watermarkDomainInput, { silent: true })}
                    disabled={watermarkStatusLoading || !watermarkDomainInput.trim()}
                    className={`${btnCls} bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/25 disabled:opacity-50 inline-flex items-center gap-2`}
                  >
                    {watermarkStatusLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Reload Codes
                  </button>
                </div>
                {watermarkChallengePath && watermarkChallengeContent && (
                  <div className="text-[11px] text-zinc-400 bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-1">
                    <p className="text-zinc-300">Method 1 — File path:</p>
                    <p className="font-mono text-amber-400 break-all">{watermarkChallengePath}</p>
                    <p>File content:</p>
                    <p className="font-mono text-emerald-300 break-all">{watermarkChallengeContent}</p>
                    {watermarkTxtHost && watermarkTxtValue && (
                      <>
                        <p aria-hidden="true" className="text-zinc-300 mt-2">OR</p>
                        <p className="text-zinc-300">Method 2 — DNS TXT:</p>
                        <p className="font-mono text-amber-400 break-all">Host: {watermarkTxtHost}</p>
                        <p className="font-mono text-emerald-300 break-all">Value: {watermarkTxtValue}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
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
                    <>
                      <div className="space-y-3">
                        {journeyItems.slice((journeyPage - 1) * JOURNEY_PAGE_SIZE, journeyPage * JOURNEY_PAGE_SIZE).map((item) => {
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
                      {Math.ceil(journeyItems.length / JOURNEY_PAGE_SIZE) > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button onClick={() => setJourneyPage(p => Math.max(1, p - 1))} disabled={journeyPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                          <span className="text-zinc-500 text-sm">Page {journeyPage} / {Math.ceil(journeyItems.length / JOURNEY_PAGE_SIZE)}</span>
                          <button onClick={() => setJourneyPage(p => Math.min(Math.ceil(journeyItems.length / JOURNEY_PAGE_SIZE), p + 1))} disabled={journeyPage >= Math.ceil(journeyItems.length / JOURNEY_PAGE_SIZE)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                        </div>
                      )}
                    </>
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

      {/* ── Live Status Tab ──────────────────────────────────────────────── */}
      {tab === 'status' && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-white font-bold text-sm">Status Page Control</h3>
                <p className="text-zinc-500 text-[11px] mt-0.5">Control `/status` auto ping and refresh behavior.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { mode: 'live', label: 'Live' },
                  { mode: 'stop', label: 'Stop' },
                  { mode: 'maintenance', label: 'Maintenance' },
                  { mode: 'hiatus', label: 'Hiatus' },
                ] as Array<{ mode: StatusMonitorMode; label: string }>).map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    disabled={savingStatusMonitorMode}
                    onClick={() => handleStatusMonitorModeChange(item.mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 ${
                      statusMonitorMode === item.mode
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] mt-3">
              {statusMonitorMode === 'live' && 'Live: all pings and refresh stay enabled.'}
              {statusMonitorMode === 'stop' && 'Stop: auto ping and manual refresh are paused.'}
              {statusMonitorMode === 'maintenance' && 'Maintenance: auto ping runs, refresh disabled, status shows maintenance.'}
              {statusMonitorMode === 'hiatus' && 'Hiatus: auto ping runs, refresh disabled, stable mode hint shown.'}
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Update Live Status</h2>
                <p className="text-zinc-500 text-xs">Instantly update the floating widget or hide it completely.</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Widget Visibility</span>
                <button
                  type="button"
                  onClick={() => setStatusIsVisible(!statusIsVisible)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors text-xs font-bold border ${statusIsVisible ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-zinc-700 text-zinc-500 bg-zinc-800'}`}
                >
                  {statusIsVisible ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {statusIsVisible ? 'ON (Visible)' : 'OFF (Hidden)'}
                </button>
              </div>
            </div>

            <form onSubmit={handleStatusSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status Message *</label>
                <input
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="e.g., Solving Physics Limits, Coding, Free..."
                  className={inputCls}
                  disabled={!statusIsVisible}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={statusHexColor}
                      onChange={(e) => setStatusHexColor(e.target.value)}
                      disabled={!statusIsVisible}
                      className="w-12 h-[46px] bg-zinc-950/50 border border-zinc-800 rounded-xl p-1 cursor-pointer shrink-0 disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={statusHexColor}
                      onChange={(e) => setStatusHexColor(e.target.value)}
                      disabled={!statusIsVisible}
                      className={`${inputCls} font-mono uppercase`}
                      placeholder="#22C55E"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Icon Setup</label>
                  <div className="flex gap-2">
                    <select
                      value={statusIconType}
                      onChange={(e) => setStatusIconType(e.target.value)}
                      disabled={!statusIsVisible}
                      className={`${inputCls} cursor-pointer w-1/2 disabled:opacity-50`}
                    >
                      <option value="Activity">Pulse / Normal</option>
                      <option value="Coffee">Coffee Break</option>
                      <option value="BookOpen">Study / Focus</option>
                      <option value="Code">Coding</option>
                      <option value="Monitor">Computer</option>
                      <option value="Radio">Live Stream</option>
                      <option value="custom">-- Custom --</option>
                    </select>
                    {statusIconType === 'custom' && (
                      <input
                        value={statusCustomIcon}
                        onChange={(e) => setStatusCustomIcon(e.target.value)}
                        disabled={!statusIsVisible}
                        placeholder="Lucide Name"
                        className={`${inputCls} w-1/2`}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Action Link (Optional)</label>
                  <input
                    value={statusActionUrl}
                    onChange={(e) => setStatusActionUrl(e.target.value)}
                    disabled={!statusIsVisible}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Free By (Optional)</label>
                  <input
                    value={statusFreeBy}
                    onChange={(e) => setStatusFreeBy(e.target.value)}
                    disabled={!statusIsVisible}
                    placeholder="e.g., 06:00 PM"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-y border-zinc-800/50 my-4">
                <label className={`text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex-1 ${!statusIsVisible ? 'opacity-50' : ''}`}>Pulse / Glow Animation</label>
                <button
                  type="button"
                  onClick={() => setStatusGlow(!statusGlow)}
                  disabled={!statusIsVisible}
                  className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${statusGlow ? 'text-amber-500' : 'text-zinc-600'}`}
                >
                  {statusGlow ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>

              <div className="flex gap-3">
                {editingStatusId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 w-1/3`}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingStatus || (statusIsVisible && !statusMessage.trim())}
                  className={`${btnCls} flex items-center justify-center gap-2 flex-1 disabled:opacity-50 ${statusIsVisible ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {savingStatus ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {editingStatusId ? 'Update Status' : (statusIsVisible ? 'Push Live Status' : 'Save & Hide Widget')}
                </button>
              </div>
            </form>
          </div>

          {/* 🕒 Status History List */}
          <div className="mt-8 space-y-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <History size={18} className="text-zinc-500" /> Update History
            </h3>
            {statusHistory.length === 0 ? (
              <p className="text-zinc-600 text-sm">No status history found.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {statusHistory.map((s, idx) => (
                  <div key={s._id || idx} className={`bg-zinc-900/40 border rounded-2xl p-4 flex justify-between items-center transition-colors ${editingStatusId === s._id ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0 flex items-center justify-center w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl">
                        {!s.isVisible && <div className="absolute inset-0 bg-black/60 rounded-xl z-10 flex items-center justify-center backdrop-blur-[1px]"><EyeOff size={14} className="text-zinc-500" /></div>}
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.hexColor || '#22c55e' }} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${s.isVisible ? 'text-zinc-200' : 'text-zinc-600 line-through'}`}>{s.message || '(Hidden Status)'}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{s.createdAtIST}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEditStatus(s)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-amber-500 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleStatusDelete(s._id)} className="p-2 hover:bg-red-900/30 rounded-xl text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Storage Tab ──────────────────────────────────────────────────── */}
      {tab === 'storage' && (
        <div className="space-y-6">
          {storageLoading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-amber-500" /></div>
          ) : (
            <>
              {/* DB Overview Card */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><HardDrive size={20} /></div>
                  <div>
                    <h3 className="text-white font-bold text-base">MongoDB Atlas Cluster Storage</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">Free tier — 512 MB total cluster limit</p>
                  </div>
                  <button onClick={fetchStorageStats} className={`ml-auto ${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs`}>Refresh</button>
                </div>

                {storageStats ? (
                  <>
                    {/* Cluster total progress bar */}
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Database Storage Usage</p>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">Used: <span className="text-amber-500 font-bold">{formatBytes(storageStats.storageSize)}</span></span>
                        <span className="text-zinc-500">Available: <span className="text-emerald-400 font-bold">{formatBytes(Math.max(0, MONGODB_FREE_TIER_LIMIT_BYTES - storageStats.storageSize))}</span></span>
                      </div>
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (storageStats.storageSize / MONGODB_FREE_TIER_LIMIT_BYTES) * 100)}%` }}
                        />
                      </div>
                      <p className="text-zinc-500 text-xs font-mono text-right">
                        {((storageStats.storageSize / MONGODB_FREE_TIER_LIMIT_BYTES) * 100).toFixed(2)}% of 512 MB cluster limit
                      </p>
                    </div>

                    {/* DB stats split */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-800">
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1">
                        <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Storage Size (on disk)</p>
                        <p className="text-amber-500 font-black text-xl">{formatBytes(storageStats.storageSize)}</p>
                        <p className="text-zinc-600 text-[10px] font-mono">Allocated on disk</p>
                      </div>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1">
                        <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Data Size (documents)</p>
                        <p className="text-emerald-400 font-black text-xl">{formatBytes(storageStats.dataSize)}</p>
                        <p className="text-zinc-600 text-[10px] font-mono">Actual document data</p>
                      </div>
                    </div>

                    {/* Website DB detail */}
                    <div className="space-y-2 pt-1 border-t border-zinc-800">
                      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Website Database Breakdown</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Data Size', value: formatBytes(storageStats.dataSize) },
                          { label: 'Storage Size', value: formatBytes(storageStats.storageSize) },
                          { label: 'Index Size', value: formatBytes(storageStats.indexSize) },
                        ].map(s => (
                          <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
                            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">{s.label}</p>
                            <p className="text-amber-500 font-black text-base mt-1">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Collection breakdown */}
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Collection Breakdown</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(storageStats.collections).map(([name, cs]) => {
                            const stat = cs as CollectionStat;
                            return (
                              <div key={name} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                                <p className="text-zinc-500 text-[10px] font-mono uppercase truncate">{name}</p>
                                <p className="text-white text-sm font-bold mt-0.5">{stat.count} docs</p>
                                {stat.storageSize > 0 && <p className="text-zinc-600 text-[10px] font-mono">{formatBytes(stat.storageSize)}</p>}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-600 text-sm text-center py-4">No storage data available. Click Refresh to load.</p>
                )}
              </div>

              {/* Sub-tabs: per-item breakdown */}
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-zinc-800">
                  {(['journals', 'projects', 'journey', 'comments'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => { setStorageSubTab(st); setStorageJournalPage(1); setStorageProjectPage(1); setStorageJourneyPage(1); }}
                      className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors capitalize ${storageSubTab === st ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {st === 'comments' ? <span className="flex items-center gap-1"><MessageSquare size={12} /> Comments</span> : st}
                    </button>
                  ))}
                </div>

                {/* Journals sub-tab */}
                {storageSubTab === 'journals' && (
                  <div className="space-y-3">
                    <p className="text-zinc-600 text-xs font-mono">Showing approximate document size (JSON bytes) · {storageJournals.length} total</p>
                    {storageJournals.length === 0 ? (
                      <p className="text-zinc-600 text-sm text-center py-8">No journal data loaded.</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {storageJournals.slice((storageJournalPage - 1) * STORAGE_PAGE_SIZE, storageJournalPage * STORAGE_PAGE_SIZE).map(j => {
                            const approxSize = JSON.stringify(j).length;
                            const colSize = storageStats?.collections['journals']?.storageSize || 0;
                            const pct = colSize > 0 ? Math.min(100, (approxSize / colSize) * 100) : 0;
                            return (
                              <div key={j._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{j.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${j.published ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-800'}`}>{j.published ? 'Published' : 'Draft'}</span>
                                    <span className="text-zinc-600 text-[10px] font-mono">{j.categoryName || '—'}</span>
                                  </div>
                                  <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden w-full max-w-xs">
                                    <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${pct.toFixed(1)}%` }} />
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-amber-500 font-bold text-sm">{formatBytes(approxSize)}</p>
                                  <p className="text-zinc-600 text-[10px] font-mono">~est.</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {Math.ceil(storageJournals.length / STORAGE_PAGE_SIZE) > 1 && (
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <button onClick={() => setStorageJournalPage(p => Math.max(1, p - 1))} disabled={storageJournalPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                            <span className="text-zinc-500 text-sm">Page {storageJournalPage} / {Math.ceil(storageJournals.length / STORAGE_PAGE_SIZE)}</span>
                            <button onClick={() => setStorageJournalPage(p => Math.min(Math.ceil(storageJournals.length / STORAGE_PAGE_SIZE), p + 1))} disabled={storageJournalPage >= Math.ceil(storageJournals.length / STORAGE_PAGE_SIZE)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Projects sub-tab */}
                {storageSubTab === 'projects' && (
                  <div className="space-y-3">
                    <p className="text-zinc-600 text-xs font-mono">Approximate document size (JSON bytes) · {projects.length} total</p>
                    {projectMode !== 'custom' && (
                      <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-4 text-zinc-500 text-sm">Projects are on Default (local file) mode — no MongoDB data to show.</div>
                    )}
                    {projectMode === 'custom' && projects.length === 0 && (
                      <p className="text-zinc-600 text-sm text-center py-8">No projects in MongoDB.</p>
                    )}
                    {projectMode === 'custom' && projects.length > 0 && (
                      <>
                        <div className="space-y-2">
                          {projects.slice((storageProjectPage - 1) * STORAGE_PAGE_SIZE, storageProjectPage * STORAGE_PAGE_SIZE).map(p => {
                            const approxSize = JSON.stringify(p).length;
                            const colSize = storageStats?.collections['projects']?.storageSize || 0;
                            const pct = colSize > 0 ? Math.min(100, (approxSize / colSize) * 100) : 0;
                            return (
                              <div key={p._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{p.title}</p>
                                  <p className="text-zinc-600 text-[10px] font-mono uppercase mt-0.5">{p.category || '—'}</p>
                                  <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden w-full max-w-xs">
                                    <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${pct.toFixed(1)}%` }} />
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-amber-500 font-bold text-sm">{formatBytes(approxSize)}</p>
                                  <p className="text-zinc-600 text-[10px] font-mono">~est.</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {Math.ceil(projects.length / STORAGE_PAGE_SIZE) > 1 && (
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <button onClick={() => setStorageProjectPage(p => Math.max(1, p - 1))} disabled={storageProjectPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                            <span className="text-zinc-500 text-sm">Page {storageProjectPage} / {Math.ceil(projects.length / STORAGE_PAGE_SIZE)}</span>
                            <button onClick={() => setStorageProjectPage(p => Math.min(Math.ceil(projects.length / STORAGE_PAGE_SIZE), p + 1))} disabled={storageProjectPage >= Math.ceil(projects.length / STORAGE_PAGE_SIZE)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Journey sub-tab */}
                {storageSubTab === 'journey' && (
                  <div className="space-y-3">
                    <p className="text-zinc-600 text-xs font-mono">Approximate document size (JSON bytes) · {journeyItems.length} total</p>
                    {journeyMode !== 'custom' && (
                      <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-4 text-zinc-500 text-sm">Journey is on Default (local file) mode — no MongoDB data to show.</div>
                    )}
                    {journeyMode === 'custom' && journeyItems.length === 0 && (
                      <p className="text-zinc-600 text-sm text-center py-8">No custom journey items in MongoDB.</p>
                    )}
                    {journeyMode === 'custom' && journeyItems.length > 0 && (
                      <>
                        <div className="space-y-2">
                          {journeyItems.slice((storageJourneyPage - 1) * STORAGE_PAGE_SIZE, storageJourneyPage * STORAGE_PAGE_SIZE).map(item => {
                            const approxSize = JSON.stringify(item).length;
                            const colSize = storageStats?.collections['timeline']?.storageSize || 0;
                            const pct = colSize > 0 ? Math.min(100, (approxSize / colSize) * 100) : 0;
                            return (
                              <div key={item._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                  <p className="text-zinc-600 text-[10px] font-mono mt-0.5">{item.dateStr} · {item.school || '—'}</p>
                                  <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden w-full max-w-xs">
                                    <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${pct.toFixed(1)}%` }} />
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-amber-500 font-bold text-sm">{formatBytes(approxSize)}</p>
                                  <p className="text-zinc-600 text-[10px] font-mono">~est.</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {Math.ceil(journeyItems.length / STORAGE_PAGE_SIZE) > 1 && (
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <button onClick={() => setStorageJourneyPage(p => Math.max(1, p - 1))} disabled={storageJourneyPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                            <span className="text-zinc-500 text-sm">Page {storageJourneyPage} / {Math.ceil(journeyItems.length / STORAGE_PAGE_SIZE)}</span>
                            <button onClick={() => setStorageJourneyPage(p => Math.min(Math.ceil(journeyItems.length / STORAGE_PAGE_SIZE), p + 1))} disabled={storageJourneyPage >= Math.ceil(journeyItems.length / STORAGE_PAGE_SIZE)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {/* Comments sub-tab */}
                {storageSubTab === 'comments' && (
                  <div className="space-y-3">
                    {selectedCommentPost ? (
                      /* ── Per-post comments view ── */
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setSelectedCommentPost(null); setPostComments([]); }}
                            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{selectedCommentPost.title}</p>
                            <p className="text-zinc-500 text-xs">{selectedCommentPost.count} comments · {selectedCommentPost.abuseCount > 0 && <span className="text-red-400 font-bold">{selectedCommentPost.abuseCount} flagged</span>}</p>
                          </div>
                          <Link to={`/journal/view/${selectedCommentPost._id}`} className="text-amber-500 text-xs hover:underline shrink-0">View Post ↗</Link>
                        </div>

                        {postCommentsLoading ? (
                          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
                        ) : postComments.length === 0 ? (
                          <p className="text-zinc-600 text-sm text-center py-8">No comments on this post.</p>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {postComments.map(c => {
                                const approxSize = JSON.stringify(c).length;
                                const isRevealed = revealedAbuse.has(c._id);
                                return (
                                  <div key={c._id} className={`border rounded-xl p-4 space-y-2 ${c.hasAbuse ? 'border-red-900/40 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/40'}`}>
                                    <div className="flex items-start gap-3">
                                      {c.userPic ? (
                                        <img src={c.userPic} alt={c.userName} className="w-7 h-7 rounded-full border border-zinc-700 object-cover shrink-0" />
                                      ) : (
                                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0"><User size={12} className="text-zinc-500" /></div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-white text-xs font-bold">{c.userName}</span>
                                          <span className="text-zinc-600 text-[10px] font-mono">{c.createdAtIST}</span>
                                          {c.hasAbuse && <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-900/20 border border-red-900/40 px-1.5 py-0.5 rounded uppercase tracking-widest"><AlertOctagon size={8} /> Abuse</span>}
                                        </div>
                                        <p className="text-zinc-300 text-xs mt-1">{c.text}</p>
                                        {c.hasAbuse && c.originalText && (
                                          <div className="mt-1.5">
                                            {isRevealed ? (
                                              <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-2 mt-1">
                                                <p className="text-red-300 text-xs">{c.originalText}</p>
                                                <button onClick={() => setRevealedAbuse(prev => { const s = new Set(prev); s.delete(c._id); return s; })} className="text-[10px] text-red-500 hover:text-red-400 mt-1">Hide original</button>
                                              </div>
                                            ) : (
                                              <button onClick={() => setRevealedAbuse(prev => new Set([...prev, c._id]))} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-1">
                                                <AlertOctagon size={10} /> Tap to see original (contains abuse)
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right shrink-0 space-y-1">
                                        <p className="text-amber-500 font-bold text-xs">{formatBytes(approxSize)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/50">
                                      <Link to={`/journal/comment/${c._id}`} className="text-zinc-500 hover:text-amber-400 text-[10px] font-mono transition-colors">Permalink</Link>
                                      <button
                                        onClick={() => handleDeleteComment(c._id, selectedCommentPost._id)}
                                        className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 size={10} /> Delete
                                      </button>
                                      <button
                                        onClick={() => setBlockModalUser({ userId: c.userId, userName: c.userName, userPic: c.userPic, journalId: selectedCommentPost._id })}
                                        className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-orange-400 transition-colors"
                                      >
                                        <ShieldBan size={10} /> Block
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {postCommentsTotalPages > 1 && (
                              <div className="flex items-center justify-center gap-3 pt-1">
                                <button onClick={() => { fetchPostComments(selectedCommentPost._id, postCommentsPage - 1); }} disabled={postCommentsPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                                <span className="text-zinc-500 text-sm">Page {postCommentsPage} / {postCommentsTotalPages}</span>
                                <button onClick={() => { fetchPostComments(selectedCommentPost._id, postCommentsPage + 1); }} disabled={postCommentsPage >= postCommentsTotalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      /* ── Posts list with comment counts ── */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-600 text-xs font-mono">Posts with comment stats · {commentPostsTotal} total</p>
                          <button onClick={() => fetchCommentPosts(commentPostsPage)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs`}>Refresh</button>
                        </div>
                        {/* Total comments storage summary */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                          <MessageSquare size={20} className="text-amber-500 shrink-0" />
                          <div>
                            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Total Comments Collection</p>
                            <p className="text-amber-500 font-black text-xl">{storageStats?.collections['comments']?.count ?? '—'} docs</p>
                            {storageStats?.collections['comments']?.storageSize && (
                              <p className="text-zinc-600 text-[10px] font-mono">{formatBytes(storageStats.collections['comments'].storageSize)} on disk</p>
                            )}
                          </div>
                        </div>
                        {commentPostsLoading ? (
                          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
                        ) : commentPosts.length === 0 ? (
                          <p className="text-zinc-600 text-sm text-center py-8">No posts found.</p>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {commentPosts.map(p => (
                                <button
                                  key={p._id}
                                  onClick={() => { setSelectedCommentPost(p); fetchPostComments(p._id, 1); }}
                                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors text-left"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{p.title}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${p.published ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-800'}`}>{p.published ? 'Published' : 'Draft'}</span>
                                      <span className="text-zinc-600 text-[10px] font-mono">{p.count} comments</span>
                                      {p.abuseCount > 0 && <span className="flex items-center gap-1 text-[10px] text-red-400"><AlertOctagon size={9} /> {p.abuseCount} flagged</span>}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-amber-500 font-bold text-sm">{formatBytes(p.totalSize)}</p>
                                    <p className="text-zinc-600 text-[10px] font-mono">~text size</p>
                                    <ChevronRight size={14} className="text-zinc-600 ml-auto mt-1" />
                                  </div>
                                </button>
                              ))}
                            </div>
                            {commentPostsTotalPages > 1 && (
                              <div className="flex items-center justify-center gap-3 pt-1">
                                <button onClick={() => fetchCommentPosts(commentPostsPage - 1)} disabled={commentPostsPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                                <span className="text-zinc-500 text-sm">Page {commentPostsPage} / {commentPostsTotalPages}</span>
                                <button onClick={() => fetchCommentPosts(commentPostsPage + 1)} disabled={commentPostsPage >= commentPostsTotalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Block User Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {blockModalUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setBlockModalUser(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-black text-lg flex items-center gap-2"><ShieldBan size={18} className="text-orange-400" /> Block User</h3>
                <button onClick={() => setBlockModalUser(null)} className="text-zinc-500 hover:text-zinc-300"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
                {blockModalUser.userPic ? (
                  <img src={blockModalUser.userPic} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center"><User size={14} className="text-zinc-400" /></div>
                )}
                <div>
                  <p className="text-white text-sm font-bold">{blockModalUser.userName}</p>
                  <p className="text-zinc-500 text-[10px] font-mono">{blockModalUser.userId}</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Block Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'post', 'temp'] as const).map(bt => (
                    <button
                      key={bt}
                      onClick={() => setBlockType(bt)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${blockType === bt ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}
                    >
                      {bt === 'all' ? 'All Posts' : bt === 'post' ? 'This Post' : 'Temporary'}
                    </button>
                  ))}
                </div>
                {blockType === 'post' && !blockModalUser.journalId && (
                  <p className="text-amber-400 text-xs">Note: No specific post context. Block will apply from context.</p>
                )}
                {blockType === 'temp' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Days</label>
                      <input type="number" min="0" value={blockDays} onChange={e => setBlockDays(e.target.value)} className={inputCls} placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Hours</label>
                      <input type="number" min="0" max="23" value={blockHours} onChange={e => setBlockHours(e.target.value)} className={inputCls} placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Minutes</label>
                      <input type="number" min="0" max="59" value={blockMinutes} onChange={e => setBlockMinutes(e.target.value)} className={inputCls} placeholder="0" />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Total Feedbacks</p>
                <p className="text-amber-500 text-2xl font-black mt-1">{feedbackStorageMeta.totalFeedbacks}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Feedback Categories</p>
                <p className="text-amber-500 text-2xl font-black mt-1">{feedbackStorageMeta.categoriesCount}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Pinned Feedbacks</p>
                <p className="text-amber-500 text-2xl font-black mt-1">{feedbackStorageMeta.pinnedCount}</p>
              </div>
            </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Reason (optional)</label>
                  <input value={blockReason} onChange={e => setBlockReason(e.target.value)} className={inputCls} placeholder="e.g., Spam, abuse..." />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setBlockModalUser(null)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex-1`}>Cancel</button>
                <button
                  onClick={handleBlockUser}
                  disabled={blockSaving || (blockType === 'temp' && !blockHours && !blockMinutes && !blockDays)}
                  className={`${btnCls} bg-orange-500/10 border border-orange-500/40 text-orange-400 hover:bg-orange-500/20 flex-1 flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {blockSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldBan size={14} />}
                  Block User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[560] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !userActionSaving) setUserActionModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-zinc-900 border border-red-900/50 rounded-3xl p-6 w-full max-w-lg space-y-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                  <Lock size={18} className="text-red-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-black text-lg">{userActionModal.title}</h3>
                  <p className="text-zinc-400 text-sm">{userActionModal.description}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Owner Password Confirmation</label>
                <input
                  type="password"
                  value={confirmOwnerPassword}
                  onChange={(e) => setConfirmOwnerPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Enter owner password again"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setUserActionModal(null)} disabled={userActionSaving} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex-1`}>
                  Cancel
                </button>
                <button onClick={handleConfirmUserAction} disabled={userActionSaving || !confirmOwnerPassword.trim()} className={`${btnCls} bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50`}>
                  {userActionSaving ? <Loader2 size={14} className="animate-spin" /> : <AlertOctagon size={14} />}
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {tab === 'analytics' && (
        <div className="space-y-5">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="grid md:grid-cols-4 gap-3">
              <input value={analyticsHostFilter} onChange={(e) => setAnalyticsHostFilter(e.target.value)} className={inputCls} placeholder="Filter by host" />
              <input value={analyticsSourceFilter} onChange={(e) => setAnalyticsSourceFilter(e.target.value)} className={inputCls} placeholder="Filter by source page" />
              <select value={analyticsLoginFilter} onChange={(e) => setAnalyticsLoginFilter(e.target.value as 'all' | 'true' | 'false')} className={inputCls}>
                <option value="all">All visitors</option>
                <option value="true">Logged in only</option>
                <option value="false">Guests only</option>
              </select>
              <button
                onClick={() => fetchLinkAnalytics(1)}
                className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 flex items-center justify-center gap-2`}
              >
                <RefreshCw size={14} /> Apply
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Top Hosts</p>
                <div className="mt-2 space-y-1">
                  {analyticsAggregates.byHost.slice(0, 5).map((item) => <p key={item.host} className="text-zinc-300 text-xs font-mono">{item.host} · {item.total}</p>)}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Top Sources</p>
                <div className="mt-2 space-y-1">
                  {analyticsAggregates.bySource.slice(0, 5).map((item) => <p key={item.sourcePage} className="text-zinc-300 text-xs font-mono">{item.sourcePage} · {item.total}</p>)}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Top Users</p>
                <div className="mt-2 space-y-1">
                  {analyticsAggregates.byUser.slice(0, 5).map((item) => <p key={`${item.userId}-${item.total}`} className="text-zinc-300 text-xs font-mono">{item.userId || 'guest'} · {item.total}</p>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_1fr] text-[10px] uppercase tracking-widest text-zinc-500 font-mono border-b border-zinc-800 px-4 py-2">
              <span>Target URL</span>
              <span>Host</span>
              <span>Source</span>
              <span>User</span>
              <span>Time</span>
            </div>
            {analyticsLoading ? (
              <div className="p-6 text-zinc-500 text-sm">Loading analytics…</div>
            ) : analyticsRows.length === 0 ? (
              <div className="p-6 text-zinc-600 text-sm">No analytics rows found.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {analyticsRows.map((row) => (
                  <div key={row._id} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_1fr] gap-2 px-4 py-3 text-xs">
                    <span className="text-zinc-300 truncate" title={row.targetUrl}>{row.targetUrl}</span>
                    <span className="text-zinc-400">{row.targetHost}</span>
                    <span className="text-zinc-400">{row.sourcePage}</span>
                    <span className="text-zinc-400">{row.userId || 'guest'}</span>
                    <span className="text-zinc-500">{new Date(row.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={() => fetchLinkAnalytics(Math.max(1, analyticsPage - 1))} disabled={analyticsPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40`}>Prev</button>
            <span className="text-zinc-500 text-sm">Page {analyticsPage} / {analyticsTotalPages}</span>
            <button onClick={() => fetchLinkAnalytics(Math.min(analyticsTotalPages, analyticsPage + 1))} disabled={analyticsPage >= analyticsTotalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40`}>Next</button>
          </div>
        </div>
      )}

      {/* ── Users Tab ────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-6">
          {selectedUser ? (
            /* ── Selected user detail + comments ── */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedUser(null); setUserComments([]); setUserBlocks([]); setRevealedServiceKeyUsers(new Set()); }} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"><ChevronLeft size={18} /></button>
                <h2 className="text-white font-bold text-lg">User: {selectedUser.userName}</h2>
              </div>
              {/* User info card */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                {selectedUser.userPic ? (
                  <img src={selectedUser.userPic} alt={selectedUser.userName} className="w-12 h-12 rounded-full border border-zinc-700 object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0"><User size={20} className="text-zinc-500" /></div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black text-lg">{selectedUser.userName}</p>
                    {selectedUser.verified && <span className="inline-flex items-center gap-1 text-blue-300 text-[10px] font-bold"><VerifiedTickIcon className="w-3 h-3" /> Verified</span>}
                  </div>
                  <p className="text-zinc-500 text-xs font-mono">{selectedUser._id}</p>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><MessageSquare size={11} /> {selectedUser.totalComments} comments</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-zinc-600 uppercase tracking-widest text-[9px] font-mono">Email (Private)</span>
                    <span className="text-zinc-300 text-xs break-all">{selectedUser.email || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5">
                    <span className="text-zinc-600 uppercase tracking-widest text-[9px] font-mono">16-digit Service Key</span>
                    <span className="text-zinc-300 text-xs font-mono tracking-[0.2em] break-all">
                      {revealedServiceKeyUsers.has(selectedUser.userId) ? (selectedUser.serviceKey || '') : maskServiceKey(selectedUser.serviceKey)}
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => handleCopyServiceKey(selectedUser.serviceKey)} disabled={!selectedUser.serviceKey} className={`${btnCls} bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-[11px] px-3 py-1.5 flex items-center gap-1 disabled:opacity-40`}><Clipboard size={11} /> Copy</button>
                      <button onClick={() => setRevealedServiceKeyUsers(prev => {
                        const next = new Set(prev);
                        if (next.has(selectedUser.userId)) next.delete(selectedUser.userId);
                        else next.add(selectedUser.userId);
                        return next;
                      })} disabled={!selectedUser.serviceKey} className={`${btnCls} bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-[11px] px-3 py-1.5 flex items-center gap-1 disabled:opacity-40`}>
                        {revealedServiceKeyUsers.has(selectedUser.userId) ? <EyeOff size={11} /> : <Eye size={11} />}
                        {revealedServiceKeyUsers.has(selectedUser.userId) ? 'Hide' : 'Reveal'}
                      </button>
                      <button onClick={() => handleRotateServiceKey(selectedUser.userId)} disabled={!selectedUser.userId || rotatingServiceKeyUserId === selectedUser.userId} className={`${btnCls} bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 text-[11px] px-3 py-1.5 flex items-center gap-1 disabled:opacity-40`}>
                        {rotatingServiceKeyUserId === selectedUser.userId ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                        Rotate
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2 text-[10px] font-mono">
                    {/* Account created */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-600 uppercase tracking-widest text-[9px]">Account Created</span>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock size={9} className="text-zinc-600 shrink-0" />
                        {new Date(selectedUser.firstCommentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {selectedUser.registrationIp && (
                        <span className="text-zinc-500">
                          📍 IP: <span className="text-zinc-300">{selectedUser.registrationIp}</span>
                          {selectedUser.registrationCountry ? <span className="text-zinc-500"> · {selectedUser.registrationCountry}</span> : null}
                        </span>
                      )}
                    </div>
                    {/* Last activity */}
                    <div className="flex flex-col gap-0.5 border-t border-zinc-800/60 pt-1.5">
                      <span className="text-zinc-600 uppercase tracking-widest text-[9px]">Last Activity</span>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock size={9} className="text-zinc-600 shrink-0" />
                        {new Date(selectedUser.lastCommentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {selectedUser.lastActivityIp && (
                        <span className="text-zinc-500">
                          🕐 IP: <span className="text-zinc-300">{selectedUser.lastActivityIp}</span>
                          {selectedUser.lastActivityCountry ? <span className="text-zinc-500"> · {selectedUser.lastActivityCountry}</span> : null}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/user/${encodeURIComponent(selectedUser.userId)}`} className="text-amber-500 text-xs hover:underline">Public Profile ↗</Link>
                  <button
                    onClick={() => handleToggleUserVerified(selectedUser.userId, !selectedUser.verified)}
                    className={`${btnCls} ${selectedUser.verified ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-blue-500/10 border border-blue-500/40 text-blue-300 hover:bg-blue-500/20'} flex items-center gap-1 text-xs`}
                  >
                    <VerifiedTickIcon className="w-3 h-3" />
                    {selectedUser.verified ? 'Unverify' : 'Verify'}
                  </button>
                  <button onClick={() => setBlockModalUser({ userId: selectedUser.userId, userName: selectedUser.userName, userPic: selectedUser.userPic })} className={`${btnCls} bg-zinc-800 border border-zinc-700 text-orange-400 hover:bg-zinc-700 flex items-center gap-1 text-xs`}><ShieldBan size={12} /> Block</button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-zinc-400 text-sm font-bold flex items-center gap-2"><ShieldBan size={14} /> Active Blocks</h3>
                {userBlocksLoading ? (
                  <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-amber-500" /></div>
                ) : userBlocks.length === 0 ? (
                  <p className="text-zinc-600 text-xs">No active blocks.</p>
                ) : (
                  <div className="space-y-2">
                    {userBlocks.map((b) => (
                      <div key={b._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-zinc-300 text-xs font-bold">
                            {b.blockType === 'all' ? 'All posts' : b.blockType === 'post' ? 'This post only' : 'Temporary'}
                          </p>
                          <p className="text-zinc-600 text-[10px] font-mono">
                            {b.blockType === 'temp' && b.expiresAt
                              ? `Until ${new Date(b.expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
                              : b.createdAtIST}
                          </p>
                          {b.reason && <p className="text-zinc-500 text-[10px] mt-0.5 truncate">Reason: {b.reason}</p>}
                        </div>
                        <button onClick={() => handleUnblockUser(b._id)} className={`${btnCls} bg-zinc-800 border border-zinc-700 text-amber-400 hover:bg-zinc-700 text-xs px-3 py-1.5`}>Unblock</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={14} className="text-red-400" />
                  <h3 className="text-zinc-200 text-sm font-bold">Moderation & Destructive Controls</h3>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {([
                    { key: 'full', label: 'Full account', help: 'Hide profile, comments, replies, feedback, and block new activity.' },
                    { key: 'comments', label: 'Comments only', help: 'Hide comments + replies and prevent new comments.' },
                    { key: 'profile', label: 'Profile only', help: 'Hide only the public profile area and user card.' },
                    { key: 'feedback', label: 'Feedback only', help: 'Hide feedback and prevent new feedback submissions.' },
                  ] as const).map((item) => {
                    const entry = selectedUser.moderation?.[item.key];
                    const active = isDashboardModerationActive(entry);
                    return (
                      <div key={item.key} className={`rounded-2xl border p-4 ${active ? 'border-red-800/70 bg-red-950/20' : 'border-zinc-800 bg-zinc-900/35'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white text-sm font-bold">{item.label}</p>
                          <span className={`text-[10px] font-mono uppercase tracking-wider ${active ? 'text-red-300' : 'text-emerald-400'}`}>{active ? 'Active' : 'Live'}</span>
                        </div>
                        <p className="text-zinc-500 text-xs mt-1">{item.help}</p>
                        <p className="text-zinc-600 text-[10px] mt-2">{active ? formatModerationUntil(entry) : 'No active restriction'}</p>
                        {active && entry?.reason && <p className="text-red-200/80 text-[10px] mt-1">Reason: {entry.reason}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/35 p-4 space-y-4">
                  <div className="grid lg:grid-cols-[1.1fr,1fr,1fr] gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Restriction Scope</label>
                      <select value={moderationScope} onChange={(e) => setModerationScope(e.target.value as 'full' | 'comments' | 'profile' | 'feedback')} className={inputCls}>
                        <option value="full">Full account</option>
                        <option value="comments">Comments only</option>
                        <option value="profile">Profile only</option>
                        <option value="feedback">Feedback only</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Deactivate Until</label>
                      <select value={moderationUntilMode} onChange={(e) => setModerationUntilMode(e.target.value as 'manual' | 'date')} className={inputCls}>
                        <option value="manual">Until I reactivate</option>
                        <option value="date">Choose end date/time</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">End Date / Time</label>
                      <input type="datetime-local" value={moderationUntil} onChange={(e) => setModerationUntil(e.target.value)} disabled={moderationUntilMode !== 'date'} className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Reason (optional)</label>
                    <input value={moderationReason} onChange={(e) => setModerationReason(e.target.value)} className={inputCls} placeholder="Support message / moderation reason" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openUserActionModal('deactivate', moderationScope)} className={`${btnCls} bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs`}>
                      Deactivate Scope
                    </button>
                    <button onClick={() => openUserActionModal('reactivate', moderationScope)} className={`${btnCls} bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-xs`}>
                      Reactivate Scope
                    </button>
                    <button onClick={() => openUserActionModal('delete-content')} className={`${btnCls} bg-orange-500/10 border border-orange-500/40 text-orange-300 hover:bg-orange-500/20 text-xs`}>
                      Delete Comments + Feedback
                    </button>
                    <button onClick={() => openUserActionModal('delete-user')} className={`${btnCls} bg-red-950/40 border border-red-500/50 text-red-300 hover:bg-red-900/40 text-xs`}>
                      Permanent Delete User
                    </button>
                  </div>
                  <p className="text-zinc-600 text-[11px]">
                    Every moderation or destructive action asks for the owner password again for extra verification.
                  </p>
                </div>
              </div>
              {/* User comments */}
              <div className="space-y-3">
                <h3 className="text-zinc-400 text-sm font-bold flex items-center gap-2"><MessageSquare size={14} /> All Comments ({userCommentsTotal})</h3>
                {userCommentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
                ) : userComments.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-6">No comments found.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {userComments.map(c => (
                        <div key={c._id} className={`border rounded-xl p-4 space-y-2 ${c.hasAbuse ? 'border-red-900/40 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/40'}`}>
                          {c.journalInfo && (
                            <Link to={`/journal/view/${c.journalInfo._id || c.journalInfo.slug}`} className="text-amber-500/70 text-[10px] font-mono hover:text-amber-400 transition-colors truncate block">
                              ↗ {c.journalInfo.title}
                            </Link>
                          )}
                          <p className="text-zinc-300 text-sm">{c.text}</p>
                          {c.hasAbuse && c.originalText && (
                            <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-2">
                              <p className="text-[9px] text-red-400 font-mono uppercase tracking-widest mb-1 flex items-center gap-1"><AlertOctagon size={8} /> Original (censored)</p>
                              <p className="text-red-300 text-xs">{c.originalText}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 pt-1 border-t border-zinc-800/50">
                            <span className="text-zinc-600 text-[10px] font-mono">{c.createdAtIST}</span>
                            {c.hasAbuse && <span className="flex items-center gap-1 text-[9px] font-bold text-red-400"><AlertOctagon size={8} /> Abuse</span>}
                            <Link to={`/journal/comment/${c._id}`} className="text-zinc-500 hover:text-amber-400 text-[10px] font-mono transition-colors ml-auto">Permalink</Link>
                            <button onClick={() => handleDeleteComment(c._id)} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={10} /> Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {userCommentsTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-1">
                        <button onClick={() => { fetchUserComments(selectedUser.userId, userCommentsPage - 1); }} disabled={userCommentsPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                        <span className="text-zinc-500 text-sm">Page {userCommentsPage} / {userCommentsTotalPages}</span>
                        <button onClick={() => { fetchUserComments(selectedUser.userId, userCommentsPage + 1); }} disabled={userCommentsPage >= userCommentsTotalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* ── Users list ── */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg flex items-center gap-2"><Users size={18} className="text-amber-500" /> Commenters ({usersTotal})</h2>
                <button onClick={() => fetchUsers(1)} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs`}>Refresh</button>
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">
                  <Users size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No commenters yet.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {users.map(u => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all cursor-pointer"
                        onClick={() => { setSelectedUser(u); setRevealedServiceKeyUsers(new Set()); fetchUserComments(u.userId, 1); fetchUserBlocks(u.userId); }}
                      >
                        <div className="flex items-center gap-4">
                          {u.userPic ? (
                            <img src={u.userPic} alt={u.userName} className="w-10 h-10 rounded-full border border-zinc-700 object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0"><User size={16} className="text-zinc-500" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-base">{u.userName}</p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              {u.verified && <span className="inline-flex items-center gap-1 text-blue-300 text-[10px] font-bold"><VerifiedTickIcon className="w-3 h-3" /> Verified</span>}
                              <span className="text-zinc-500 text-xs flex items-center gap-1"><MessageSquare size={10} /> {u.totalComments} comments</span>
                              <span className="text-zinc-600 text-[10px] font-mono">Joined: {new Date(u.firstCommentAt).toLocaleDateString('en-IN')}</span>
                              <span className="text-zinc-600 text-[10px] font-mono">Last: {new Date(u.lastCommentAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-zinc-600 shrink-0" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {usersTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button onClick={() => fetchUsers(usersPage - 1)} disabled={usersPage <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
                      <span className="text-zinc-500 text-sm">Page {usersPage} / {usersTotalPages}</span>
                      <button onClick={() => fetchUsers(usersPage + 1)} disabled={usersPage >= usersTotalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
      {tab === 'settings' && (
        <div className="space-y-6 max-w-lg">
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
                <span className="font-mono text-zinc-600 uppercase text-[10px] tracking-widest self-center">Serverless Functions</span>
                <span>12 files in `/api` (routes + shared helpers)</span>
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

          {/* Comment Blacklist Management */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <BookOpen size={16} /> Comment Blacklist
            </h3>
            <p className="text-zinc-500 text-xs">Words in this list will be automatically censored in all new and edited comments (replaced with asterisks).</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newBlacklistWord}
                onChange={(e) => setNewBlacklistWord(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddBlacklistWord(); }}
                placeholder="Add a word to block..."
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={handleAddBlacklistWord}
                disabled={addingBlacklistWord || !newBlacklistWord.trim()}
                className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 px-4 flex items-center gap-1`}
              >
                {addingBlacklistWord ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
              </button>
            </div>

            {blacklistLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-amber-500" /></div>
            ) : blacklist.length === 0 ? (
              <p className="text-zinc-600 text-xs text-center py-4">No blacklisted words yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {blacklist.map((item) => (
                  <div key={item._id} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm">
                    <span className="text-zinc-300 font-mono">{item.word}</span>
                    <button
                      onClick={() => handleRemoveBlacklistWord(item._id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
