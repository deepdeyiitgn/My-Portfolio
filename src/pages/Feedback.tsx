import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleLogin } from '@react-oauth/google';
import { Star, Filter, ChevronLeft, ChevronRight, Loader2, MessageSquare, Send, X } from 'lucide-react';
import SEO from '../components/SEO';

interface GoogleUser {
  userId: string;
  name: string;
  picture: string;
  credential: string;
  exp: number;
}

interface FeedbackCategory {
  _id: string;
  subject: string;
  subjectSlug: string;
  subSubjects: Array<{ name: string; slug: string }>;
}

interface FeedbackItem {
  _id: string;
  userName: string;
  userPic: string;
  subject: string;
  subjectSlug: string;
  subSubject: string;
  subSubjectSlug: string;
  title: string;
  text: string;
  rating: number;
  isPinned: boolean;
  isOwner?: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STORAGE_KEY = 'dd_comment_user';
const MAX_TEXT = 3000;
const MIN_FEEDBACK_TEXT = 100;

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function timeAgo(d?: string | null) {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  return new Date(d).toLocaleDateString('en-IN');
}

export default function Feedback() {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [ownerAuthed, setOwnerAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);

  const [formSubject, setFormSubject] = useState('');
  const [formSubSubject, setFormSubSubject] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [feedbackAccess, setFeedbackAccess] = useState<{ blocked: boolean; message: string | null }>({ blocked: false, message: null });

  const [subjectFilter, setSubjectFilter] = useState('');
  const [subSubjectFilter, setSubSubjectFilter] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'relevant'>('newest');
  const [page, setPage] = useState(1);

  const [loadingList, setLoadingList] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [ratingSummary, setRatingSummary] = useState<Array<{ star: number; count: number }>>([
    { star: 5, count: 0 },
    { star: 4, count: 0 },
    { star: 3, count: 0 },
    { star: 2, count: 0 },
    { star: 1, count: 0 },
  ]);

  const [expandedFeedback, setExpandedFeedback] = useState<FeedbackItem | null>(null);

  const totalSummaryCount = useMemo(
    () => ratingSummary.reduce((sum, row) => sum + Number(row.count || 0), 0),
    [ratingSummary],
  );

  const averageRating = useMemo(() => {
    if (totalSummaryCount <= 0) return 0;
    const weighted = ratingSummary.reduce((sum, row) => sum + row.star * Number(row.count || 0), 0);
    return weighted / totalSummaryCount;
  }, [ratingSummary, totalSummaryCount]);

  const selectedFormCategory = useMemo(
    () => categories.find((c) => c.subjectSlug === formSubject),
    [categories, formSubject],
  );

  const selectedFilterCategory = useMemo(
    () => categories.find((c) => c.subjectSlug === subjectFilter),
    [categories, subjectFilter],
  );

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const r = await fetch('/api/categories?type=feedback');
      const d = await r.json();
      if (d.ok) {
        const next = Array.isArray(d.categories) ? d.categories : [];
        setCategories(next);
        if (!formSubject && next[0]?.subjectSlug) {
          setFormSubject(next[0].subjectSlug);
          setFormSubSubject(next[0]?.subSubjects?.[0]?.slug || '');
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingCategories(false);
    }
  }, [formSubject]);

  const fetchFeedbacks = useCallback(async (nextPage = page, nextSort = sort, nextSubject = subjectFilter, nextSub = subSubjectFilter) => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        action: 'feedback-list',
        page: String(nextPage),
        limit: '20',
        sort: nextSort,
      });
      if (nextSubject) params.set('subject', nextSubject);
      if (nextSub) params.set('subSubject', nextSub);

      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (d.ok) {
        setFeedbacks(Array.isArray(d.feedbacks) ? d.feedbacks : []);
        setRatingSummary(Array.isArray(d.ratingSummary) ? d.ratingSummary : []);
        if (d.pagination) setPagination(d.pagination);
        setPage(nextPage);
      }
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  }, [page, sort, subjectFilter, subSubjectFilter]);

  useEffect(() => {
    fetchCategories();
    fetchFeedbacks(1, 'newest', '', '');

    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setOwnerAuthed(Boolean(d?.authenticated)))
      .catch(() => setOwnerAuthed(false));

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GoogleUser;
        if (parsed?.credential && parsed?.exp && Date.now() < parsed.exp * 1000) {
          setCurrentUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [fetchCategories, fetchFeedbacks]);

  useEffect(() => {
    if (selectedFormCategory && !selectedFormCategory.subSubjects.some((s) => s.slug === formSubSubject)) {
      setFormSubSubject(selectedFormCategory.subSubjects?.[0]?.slug || '');
    }
  }, [selectedFormCategory, formSubSubject]);

  useEffect(() => {
    if (selectedFilterCategory && !selectedFilterCategory.subSubjects.some((s) => s.slug === subSubjectFilter)) {
      setSubSubjectFilter('');
    }
  }, [selectedFilterCategory, subSubjectFilter]);

  useEffect(() => {
    if (ownerAuthed || !currentUser?.userId) {
      setFeedbackAccess({ blocked: false, message: null });
      return;
    }
    fetch(`/api/journal?action=user-access&userId=${encodeURIComponent(currentUser.userId)}`)
      .then((r) => r.json())
      .then((d) => {
        const blocked = Boolean(d?.access?.feedbackBlocked);
        setFeedbackAccess({ blocked, message: blocked ? d?.access?.messages?.feedback || 'Your feedback access is disabled.' : null });
      })
      .catch(() => setFeedbackAccess({ blocked: false, message: null }));
  }, [currentUser?.userId, ownerAuthed]);

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    const payload = decodeJwt(credentialResponse.credential);
    if (!payload?.sub || !payload?.name) return;
    const user: GoogleUser = {
      userId: String(payload.sub),
      name: String(payload.name),
      picture: String(payload.picture || ''),
      credential: credentialResponse.credential,
      exp: Number(payload.exp || 0),
    };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const handleLogoutGoogle = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormMessage(null);

    if (!ownerAuthed && !currentUser) {
      setFormMessage({ text: 'Please login with Google before submitting feedback.', type: 'err' });
      return;
    }
    if (feedbackAccess.blocked) {
      setFormMessage({ text: feedbackAccess.message || 'Your feedback access is currently disabled.', type: 'err' });
      return;
    }

    if (!formSubject || !formSubSubject || !formTitle.trim() || !formText.trim()) {
      setFormMessage({ text: 'Please complete subject, sub-subject, subject line, and feedback text.', type: 'err' });
      return;
    }
    if (formText.trim().length < MIN_FEEDBACK_TEXT) {
      setFormMessage({ text: `Feedback must be at least ${MIN_FEEDBACK_TEXT} characters.`, type: 'err' });
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        subject: formSubject,
        subSubject: formSubSubject,
        title: formTitle.trim(),
        text: formText.trim(),
        rating: formRating,
      };
      if (!ownerAuthed && currentUser) body.credential = currentUser.credential;

      const r = await fetch('/api/journal?action=feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        setFormTitle('');
        setFormText('');
        setFormMessage({ text: 'Feedback submitted successfully.', type: 'ok' });
        fetchFeedbacks(1, sort, subjectFilter, subSubjectFilter);
      } else {
        setFormMessage({ text: d.message || 'Submission failed.', type: 'err' });
      }
    } catch {
      setFormMessage({ text: 'Network error. Please try again.', type: 'err' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pt-28 pb-20">
      <SEO
        title="Feedback | Deep Dey"
        description="Share structured feedback for projects, platform quality, and collaboration experience."
        route="/feedback"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl text-white font-black tracking-tight">Feedback Management</h1>
          <p className="text-zinc-500 text-sm">Structured subject-wise feedback with rating analytics and moderation-ready data.</p>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Star className="text-amber-500" size={16} /> Rating Summary
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              {ratingSummary.map((row) => {
                const pct = totalSummaryCount > 0 ? (row.count / totalSummaryCount) * 100 : 0;
                return (
                  <div key={row.star} className="flex items-center gap-3">
                    <span className="text-zinc-400 text-xs w-14">{row.star} Star</span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-zinc-500 text-xs w-8 text-right">{row.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 flex flex-col justify-center">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-mono">Average Rating</p>
              <p className="text-4xl text-amber-500 font-black mt-1">{Number.isFinite(averageRating) ? averageRating.toFixed(2) : '0.00'}</p>
              <p className="text-zinc-600 text-xs mt-1">Based on {totalSummaryCount} feedback{totalSummaryCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-white font-bold flex items-center gap-2"><MessageSquare size={16} className="text-amber-500" /> Submit Feedback</h2>
            {ownerAuthed ? (
              <span className="text-emerald-400 text-xs font-mono uppercase tracking-wider">Owner Session Active</span>
            ) : currentUser ? (
              <button onClick={handleLogoutGoogle} className="text-zinc-400 hover:text-zinc-200 text-xs">Logout Google</button>
            ) : (
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {}} size="medium" theme="outline" text="signin_with" shape="pill" />
            )}
          </div>

          {feedbackAccess.blocked && (
            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3">
              <p className="text-red-300 text-sm font-bold">Feedback access disabled</p>
              <p className="text-red-200/80 text-xs mt-1">{feedbackAccess.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <select
              value={formSubject}
              onChange={(e) => { setFormSubject(e.target.value); setFormSubSubject(''); }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
              required
              disabled={loadingCategories || feedbackAccess.blocked}
            >
              <option value="">Select Subject</option>
              {categories.map((cat) => <option key={cat._id} value={cat.subjectSlug}>{cat.subject}</option>)}
            </select>

            <select
              value={formSubSubject}
              onChange={(e) => setFormSubSubject(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
              required
              disabled={!formSubject || loadingCategories || feedbackAccess.blocked}
            >
              <option value="">Select Sub-subject</option>
              {(selectedFormCategory?.subSubjects || []).map((sub) => <option key={sub.slug} value={sub.slug}>{sub.name}</option>)}
            </select>

            <div className="md:col-span-2">
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value.slice(0, 160))}
                placeholder="Short subject line"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
                required
                disabled={feedbackAccess.blocked}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-1"
                    aria-label={`Set ${star} star rating`}
                    disabled={feedbackAccess.blocked}
                  >
                    <Star size={18} className={star <= formRating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'} />
                  </button>
                ))}
              </div>
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value.slice(0, MAX_TEXT))}
                placeholder="Write detailed feedback..."
                className="w-full min-h-[130px] bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
                required
                disabled={feedbackAccess.blocked}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-zinc-600 text-xs">{formText.length}/{MAX_TEXT} · min {MIN_FEEDBACK_TEXT} chars</p>
                <button
                  type="submit"
                  disabled={submitting || loadingCategories || feedbackAccess.blocked || formText.trim().length < MIN_FEEDBACK_TEXT}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Submit
                </button>
              </div>
            </div>
          </form>

          {formMessage && (
            <p className={`text-xs ${formMessage.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
              {formMessage.text}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-white font-bold flex items-center gap-2"><Filter size={16} className="text-amber-500" /> Filter & Sort</h2>
            <p className="text-zinc-500 text-xs">{pagination.total} feedbacks</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <select
              value={subjectFilter}
              onChange={(e) => {
                const next = e.target.value;
                setSubjectFilter(next);
                setSubSubjectFilter('');
                fetchFeedbacks(1, sort, next, '');
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
            >
              <option value="">All Subjects</option>
              {categories.map((cat) => <option key={cat._id} value={cat.subjectSlug}>{cat.subject}</option>)}
            </select>

            <select
              value={subSubjectFilter}
              onChange={(e) => {
                const next = e.target.value;
                setSubSubjectFilter(next);
                fetchFeedbacks(1, sort, subjectFilter, next);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
              disabled={!subjectFilter}
            >
              <option value="">All Sub-subjects</option>
              {(selectedFilterCategory?.subSubjects || []).map((sub) => <option key={sub.slug} value={sub.slug}>{sub.name}</option>)}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                const next = e.target.value as typeof sort;
                setSort(next);
                fetchFeedbacks(1, next, subjectFilter, subSubjectFilter);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="relevant">Most Relevant</option>
            </select>
          </div>

          {loadingList ? (
            <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : feedbacks.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm">No feedback found for this filter.</div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((item) => {
                const long = item.text.length > 220;
                const preview = long ? `${item.text.slice(0, 220)}…` : item.text;
                return (
                  <motion.article
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.userPic ? (
                            <img src={item.userPic} alt={item.userName} className="w-7 h-7 rounded-full border border-zinc-700 object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700" />
                          )}
                          <p className="text-white text-sm font-bold truncate">{item.userName}</p>
                          {item.isOwner && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Owner</span>}
                          {item.isPinned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">Pinned</span>}
                        </div>
                        <p className="text-zinc-500 text-[11px] mt-1">{item.subject} · {item.subSubject} · {timeAgo(item.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={13} className={star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-zinc-200 font-semibold text-sm mt-3">{item.title}</h3>
                    <p className="text-zinc-400 text-sm mt-1 whitespace-pre-wrap break-words">{preview}</p>
                    {long && (
                      <button
                        onClick={() => setExpandedFeedback(item)}
                        className="mt-2 text-amber-400 text-xs font-bold hover:text-amber-300"
                      >
                        See More
                      </button>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => fetchFeedbacks(page - 1, sort, subjectFilter, subSubjectFilter)}
                disabled={page <= 1 || loadingList}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm inline-flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-zinc-500 text-sm">Page {page} / {pagination.totalPages}</span>
              <button
                onClick={() => fetchFeedbacks(page + 1, sort, subjectFilter, subSubjectFilter)}
                disabled={page >= pagination.totalPages || loadingList}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm inline-flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {expandedFeedback && (
          <div
            className="fixed inset-0 z-[550] bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center"
            onClick={() => setExpandedFeedback(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-2xl rounded-3xl border border-zinc-700 bg-zinc-900 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{expandedFeedback.title}</h3>
                  <p className="text-zinc-500 text-xs mt-1">{expandedFeedback.subject} · {expandedFeedback.subSubject} · {timeAgo(expandedFeedback.createdAt)}</p>
                </div>
                <button onClick={() => setExpandedFeedback(null)} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className={star <= expandedFeedback.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                ))}
                <span className="text-zinc-500 text-xs">by {expandedFeedback.userName}</span>
              </div>
              <p className="mt-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{expandedFeedback.text}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
