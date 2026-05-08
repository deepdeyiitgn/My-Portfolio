import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Loader2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import SEO from '../components/SEO';

interface FeedbackCategory {
  _id: string;
  name: string;
  slug: string;
  source: string;
  subSubjects: string[];
}

interface FeedbackItem {
  _id: string;
  userId: string;
  userName: string;
  userPic: string;
  subjectName: string;
  subjectSlug: string;
  subSubjectName: string;
  subSubjectSlug: string;
  shortSubject: string;
  text: string;
  rating: number;
  isPinned: boolean;
  createdAt: string;
  createdAtIST: string;
}

interface FeedbackSummary {
  totalFeedbacks: number;
  averageRating: number;
  distribution: Record<string, number>;
}

interface Pagination {
  page: number;
  total: number;
  totalPages: number;
  limit: number;
}

interface GoogleUser {
  userId: string;
  name: string;
  picture: string;
  credential: string;
  exp: number;
}

const STORAGE_KEY = 'dd_comment_user';

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function normalizeDistribution(dist?: Record<string, number>) {
  return {
    5: Number(dist?.['5'] || 0),
    4: Number(dist?.['4'] || 0),
    3: Number(dist?.['3'] || 0),
    2: Number(dist?.['2'] || 0),
    1: Number(dist?.['1'] || 0),
  };
}

export default function Feedback() {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary>({ totalFeedbacks: 0, averageRating: 0, distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterSubSubject, setFilterSubSubject] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'relevant'>('newest');

  const [rating, setRating] = useState(5);
  const [subjectSlug, setSubjectSlug] = useState('');
  const [subSubject, setSubSubject] = useState('');
  const [shortSubject, setShortSubject] = useState('');
  const [text, setText] = useState('');

  const [openModal, setOpenModal] = useState<FeedbackItem | null>(null);

  const selectedSubject = useMemo(
    () => categories.find((c) => c.slug === subjectSlug) || null,
    [categories, subjectSlug],
  );

  const selectedFilterSubject = useMemo(
    () => categories.find((c) => c.slug === filterSubject) || null,
    [categories, filterSubject],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/categories?type=feedback');
      const d = await r.json();
      if (d.ok) setCategories(d.categories || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchFeedbacks = useCallback(async (page = 1, subject = filterSubject, sub = filterSubSubject, sort = sortBy) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ action: 'feedbacks', page: String(page), sort });
      if (subject) params.set('subject', subject);
      if (sub) params.set('subSubject', sub);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (!d.ok) {
        setError(d.message || 'Failed to load feedbacks');
        return;
      }
      setFeedbacks(d.feedbacks || []);
      setSummary({
        totalFeedbacks: Number(d.summary?.totalFeedbacks || 0),
        averageRating: Number(d.summary?.averageRating || 0),
        distribution: d.summary?.distribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      });
      setPagination(d.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 });
    } catch {
      setError('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterSubSubject, sortBy]);

  useEffect(() => {
    fetchCategories();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: GoogleUser = JSON.parse(stored);
        if (parsed.exp * 1000 > Date.now()) setCurrentUser(parsed);
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setIsOwner(true);
          localStorage.removeItem(STORAGE_KEY);
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, [fetchCategories]);

  useEffect(() => {
    fetchFeedbacks(1, filterSubject, filterSubSubject, sortBy);
  }, [fetchFeedbacks, filterSubject, filterSubSubject, sortBy]);

  const handlePost = async () => {
    if (!subjectSlug || !subSubject || !shortSubject.trim() || !text.trim()) {
      alert('Please complete all required fields.');
      return;
    }
    if (!currentUser && !isOwner) {
      alert('Please sign in first.');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        subjectSlug,
        subjectName: selectedSubject?.name || subjectSlug,
        subSubjectSlug: subSubject.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'),
        subSubjectName: subSubject,
        shortSubject: shortSubject.trim(),
        text: text.trim(),
        rating,
      };
      if (!isOwner && currentUser) body.credential = currentUser.credential;
      const r = await fetch('/api/journal?action=feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.ok) {
        alert(d.message || 'Failed to submit feedback');
        return;
      }
      setShortSubject('');
      setText('');
      setRating(5);
      await fetchFeedbacks(1, filterSubject, filterSubSubject, sortBy);
      alert('Feedback submitted successfully. It cannot be edited/deleted by users.');
    } catch {
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const distribution = normalizeDistribution(summary.distribution);
  const distributionTotal = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-8">
      <SEO
        title="Feedback | Deep Dey"
        description="Professional public feedback system for projects, platform quality, and Deep Dey."
        route="/feedback"
      />

      <div className="space-y-3">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Community Voice</h2>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">FEEDBACK.</h1>
        <p className="text-zinc-500 max-w-3xl">Share structured feedback by subject and sub-subject. One feedback per subject/sub-subject pair per user.</p>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-white font-black text-xl">Rating Summary</h3>
          <p className="text-zinc-400 text-sm">Average: <span className="text-amber-500 font-bold">{summary.totalFeedbacks > 0 ? summary.averageRating.toFixed(1) : '0.0'}</span> / 5 · {summary.totalFeedbacks} feedbacks</p>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = distributionTotal > 0 ? (count / distributionTotal) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-12">{star} star</span>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-zinc-500 w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h3 className="text-white font-bold text-lg">Submit Feedback</h3>

          {!currentUser && !isOwner && (
            <div className="space-y-2">
              <p className="text-zinc-500 text-xs">Sign in with Google to submit feedback.</p>
              <GoogleLogin
                onSuccess={(cr) => {
                  if (!cr.credential) return;
                  const payload = decodeJwt(cr.credential);
                  if (!payload) return;
                  const user: GoogleUser = {
                    userId: String(payload.sub || ''),
                    name: String(payload.name || payload.given_name || 'Anonymous'),
                    picture: String(payload.picture || ''),
                    credential: cr.credential,
                    exp: Number(payload.exp || 0),
                  };
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
                  setCurrentUser(user);
                }}
                onError={() => {}}
                theme="filled_black"
                shape="pill"
                size="large"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className={`p-1.5 rounded-lg transition-colors ${s <= rating ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                  <Star size={20} fill={s <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <select value={subjectSlug} onChange={(e) => { setSubjectSlug(e.target.value); setSubSubject(''); }} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300">
              <option value="">Select Subject</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>

            <select value={subSubject} onChange={(e) => setSubSubject(e.target.value)} disabled={!selectedSubject} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 disabled:opacity-50">
              <option value="">Select Sub-subject</option>
              {(selectedSubject?.subSubjects || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <input value={shortSubject} onChange={(e) => setShortSubject(e.target.value.slice(0, 160))} placeholder="Short subject line" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300" />

            <div className="space-y-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 3000))}
                placeholder="Write your detailed feedback..."
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 resize-none"
              />
              <p className="text-[10px] text-zinc-600 text-right">{text.length}/3000</p>
            </div>

            <button
              onClick={handlePost}
              disabled={submitting || (!currentUser && !isOwner)}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />} Submit Feedback
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-wrap items-center gap-3">
            <span className="text-zinc-500 text-xs flex items-center gap-1"><Filter size={12} /> Filter</span>
            <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setFilterSubSubject(''); }} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300">
              <option value="">All Subjects</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <select value={filterSubSubject} onChange={(e) => setFilterSubSubject(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300" disabled={!selectedFilterSubject}>
              <option value="">All Sub-subjects</option>
              {(selectedFilterSubject?.subSubjects || []).map((s) => <option key={s} value={s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 ml-auto">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="relevant">Most Relevant</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
          ) : error ? (
            <div className="text-red-400 text-sm border border-red-900/50 rounded-2xl bg-red-950/20 p-4">{error}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-zinc-600 text-center py-16 border border-zinc-800 rounded-2xl bg-zinc-900/20">No feedback found.</div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((item) => {
                const isLong = item.text.length > 220;
                return (
                  <article key={item._id} className="border border-zinc-800 bg-zinc-900/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.userPic ? <img src={item.userPic} alt={item.userName} className="w-10 h-10 rounded-full object-cover border border-zinc-700" /> : <div className="w-10 h-10 rounded-full bg-zinc-800" />}
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{item.userName}</p>
                          <p className="text-zinc-500 text-[10px]">{item.subjectName} · {item.subSubjectName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < item.rating ? 'currentColor' : 'none'} />)}
                        </div>
                        <p className="text-zinc-600 text-[10px] mt-1">{item.createdAtIST || new Date(item.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <h4 className="text-zinc-200 text-sm font-semibold">{item.shortSubject}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{isLong ? `${item.text.slice(0, 220)}...` : item.text}</p>
                    {isLong && (
                      <button onClick={() => setOpenModal(item)} className="text-amber-500 hover:text-amber-400 text-xs font-bold">See More</button>
                    )}
                  </article>
                );
              })}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => fetchFeedbacks(pagination.page - 1)} disabled={pagination.page <= 1} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold flex items-center gap-1"><ChevronLeft size={14} /> Prev</button>
                  <span className="text-zinc-500 text-sm">Page {pagination.page} / {pagination.totalPages}</span>
                  <button onClick={() => fetchFeedbacks(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold flex items-center gap-1">Next <ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
          >
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-2xl border border-zinc-700 bg-zinc-900 rounded-3xl p-6 space-y-4 relative">
              <button onClick={() => setOpenModal(null)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"><X size={16} /></button>
              <div className="flex items-center gap-3">
                {openModal.userPic ? <img src={openModal.userPic} alt={openModal.userName} className="w-10 h-10 rounded-full object-cover border border-zinc-700" /> : <div className="w-10 h-10 rounded-full bg-zinc-800" />}
                <div>
                  <p className="text-white font-bold text-sm">{openModal.userName}</p>
                  <p className="text-zinc-500 text-[10px]">{openModal.subjectName} · {openModal.subSubjectName}</p>
                </div>
              </div>
              <h3 className="text-zinc-100 font-semibold">{openModal.shortSubject}</h3>
              <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{openModal.text}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
