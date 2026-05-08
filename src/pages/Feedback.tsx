import { useEffect, useMemo, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'motion/react';
import { MessageSquareQuote, Send, Star, Loader2, ShieldCheck, BarChart3 } from 'lucide-react';
import SEO from '../components/SEO';
import FeedbackCard from '../components/FeedbackCard';
import FeedbackModal from '../components/FeedbackModal';
import { createGoogleUserFromCredential, ownerAvatarSrc, useCommunityAuth } from '../hooks/useCommunityAuth';
import type { FeedbackEntry, FeedbackPublicPayload, FeedbackSubject } from '../types/feedback';

function InteractiveStars({ rating, onChange }: { rating: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const active = value <= rating;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-2xl border p-3 transition-all ${active ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-zinc-800 bg-zinc-950 text-zinc-600 hover:border-zinc-700 hover:text-zinc-300'}`}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
          >
            <Star size={18} className={active ? 'fill-current' : ''} />
          </button>
        );
      })}
    </div>
  );
}

export default function Feedback() {
  const { currentUser, isOwner, setGoogleUser, signOutGoogle } = useCommunityAuth();
  const [payload, setPayload] = useState<FeedbackPublicPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [rating, setRating] = useState(5);
  const [subjectSlug, setSubjectSlug] = useState('');
  const [subSubjectId, setSubSubjectId] = useState('');
  const [headline, setHeadline] = useState('');
  const [message, setMessage] = useState('');
  const [activeFeedback, setActiveFeedback] = useState<FeedbackEntry | null>(null);

  const loadFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentUser?.userId) params.set('userId', currentUser.userId);
      const response = await fetch(`/api/feedback${params.toString() ? `?${params.toString()}` : ''}`);
      const data = await response.json();
      if (!data.ok) {
        setError(data.message || 'Failed to load feedback.');
        return;
      }
      setPayload(data);
      if (!subjectSlug && data.subjects?.[0]?.slug) setSubjectSlug(data.subjects[0].slug);
    } catch {
      setError('Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.userId]);

  const subjects = payload?.subjects || [];
  const selectedSubject = useMemo<FeedbackSubject | undefined>(() => subjects.find((subject) => subject.slug === subjectSlug), [subjects, subjectSlug]);

  useEffect(() => {
    if (!selectedSubject) return;
    if (!selectedSubject.subSubjects.some((item) => item.id === subSubjectId)) {
      setSubSubjectId(selectedSubject.subSubjects[0]?.id || '');
    }
  }, [selectedSubject, subSubjectId]);

  const userKey = subjectSlug && subSubjectId ? `${subjectSlug}:${subSubjectId}` : '';
  const alreadySubmitted = Boolean(userKey && payload?.userSubmissionKeys.includes(userKey));
  const remainingCharacters = 800 - message.length;

  const handleSubmit = async () => {
    setFormError('');
    setFormSuccess('');

    if (!subjectSlug || !subSubjectId || !headline.trim() || !message.trim()) {
      setFormError('Please complete the subject, sub-subject, headline, and message.');
      return;
    }
    if (!currentUser && !isOwner) {
      setFormError('Sign in with Google before posting feedback.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: currentUser?.credential,
          subjectSlug,
          subSubjectId,
          rating,
          headline: headline.trim(),
          message: message.trim(),
        }),
      });
      const data = await response.json();
      if (!data.ok) {
        setFormError(data.message || 'Unable to submit feedback.');
        return;
      }

      setHeadline('');
      setMessage('');
      setRating(5);
      setFormSuccess('Feedback submitted successfully. It is now locked and cannot be edited later.');
      await loadFeedback();
    } catch {
      setFormError('Unable to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-20 pt-28">
      <SEO
        title="Feedback | Deep Dey"
        description="Share focused feedback about Deep Dey's projects, architecture, and digital ecosystem."
        route="/feedback"
      />

      <div className="mx-auto max-w-7xl space-y-10">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-amber-500">Professional feedback system</p>
            <h1 className="mt-4 text-4xl font-black tracking-tighter text-white md:text-6xl">Give precise feedback on the work that matters.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Pick a project area, select the exact sub-subject, rate the experience, and leave concise feedback. Each user can post only one feedback per specific area, and every post is automatically filtered against the global blacklist.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.2em]">
              {['One post per area', 'No edits after posting', 'Auto blacklist filtering'].map((item) => (
                <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-400">{item}</span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500"><BarChart3 size={20} /></div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Rating summary</p>
                <h2 className="text-2xl font-black tracking-tight text-white">Community score</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-amber-500" /></div>
            ) : payload ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-5xl font-black tracking-tight text-white">{payload.summary.average.toFixed(1)}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Average rating</p>
                  </div>
                  <p className="text-sm text-zinc-500">{payload.summary.total} total feedback{payload.summary.total === 1 ? '' : 's'}</p>
                </div>
                {payload.summary.distribution.map((bucket) => {
                  const width = payload.summary.total === 0 ? 0 : (bucket.count / payload.summary.total) * 100;
                  return (
                    <div key={bucket.rating} className="grid grid-cols-[32px_1fr_48px] items-center gap-3 text-sm">
                      <span className="font-bold text-white">{bucket.rating}★</span>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-right text-zinc-500">{bucket.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500"><MessageSquareQuote size={20} /></div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Submit feedback</p>
                <h2 className="text-2xl font-black tracking-tight text-white">Focused, one area at a time</h2>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {isOwner ? (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <img src="/assets/images/myphoto.png" alt="Deep Dey" className="h-11 w-11 rounded-full border border-amber-500/40 object-cover" />
                  <div>
                    <p className="font-bold text-amber-300">Posting as owner</p>
                    <p className="text-xs text-amber-200/70">Owner identity always uses myphoto.png.</p>
                  </div>
                </div>
              ) : currentUser ? (
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <img src={ownerAvatarSrc(currentUser.userId, currentUser.picture)} alt={currentUser.name} className="h-11 w-11 rounded-full border border-zinc-700 object-cover" referrerPolicy="no-referrer" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-zinc-500">Signed in with Google</p>
                  </div>
                  <button onClick={signOutGoogle} className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-red-400">Logout</button>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Sign in to leave feedback.</p>
                  <GoogleLogin
                    onSuccess={(response) => {
                      if (!response.credential) return;
                      const user = createGoogleUserFromCredential(response.credential);
                      if (user) setGoogleUser(user);
                    }}
                    onError={() => setFormError('Google sign-in failed. Please try again.')}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="signin_with"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Subject</label>
                <select value={subjectSlug} onChange={(event) => setSubjectSlug(event.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
                  {subjects.map((subject) => <option key={subject.slug} value={subject.slug}>{subject.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Sub-subject</label>
                <select value={subSubjectId} onChange={(event) => setSubSubjectId(event.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
                  {(selectedSubject?.subSubjects || []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
                {alreadySubmitted && <p className="mt-2 text-xs text-amber-400">You already submitted feedback for this exact area.</p>}
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Rating</label>
                <InteractiveStars rating={rating} onChange={setRating} />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Short subject line</label>
                <input
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value.slice(0, 120))}
                  maxLength={120}
                  placeholder="What stood out most?"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Detailed feedback</label>
                  <span className={`text-[11px] font-mono ${remainingCharacters < 80 ? 'text-amber-400' : 'text-zinc-600'}`}>{message.length}/800</span>
                </div>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value.slice(0, 800))}
                  maxLength={800}
                  rows={6}
                  placeholder="Keep it concise, specific, and professional."
                  className="w-full resize-none rounded-[1.5rem] border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-7 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}
              {formSuccess && <p className="text-sm text-emerald-400">{formSuccess}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || alreadySubmitted}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit feedback
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Rules snapshot</p>
                <h2 className="text-2xl font-black tracking-tight text-white">How this stays high quality</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['Auto-detected subjects', 'Subjects sync from the existing project ecosystem, so submissions stay relevant.'],
                ['Single-area lock', 'One user can only post once per subject + sub-subject combination.'],
                ['No post-editing', 'Feedback becomes immutable after posting to preserve trust.'],
                ['Blacklist filtering', 'Blacklisted words are automatically filtered before storage.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-amber-500">Latest feedback</p>
              <h2 className="mt-2 text-3xl font-black tracking-tighter text-white">Recent submissions</h2>
            </div>
            {payload && <p className="text-sm text-zinc-500">{payload.metrics.totalFeedbacks} total entries · {payload.metrics.pinnedFeedbacks} pinned to homepage</p>}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
          ) : error ? (
            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5 text-sm text-red-300">{error}</div>
          ) : payload && payload.feedbacks.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {payload.feedbacks.map((feedback) => (
                <div key={feedback._id}>
                  <FeedbackCard feedback={feedback} onSeeMore={setActiveFeedback} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/30 p-10 text-center text-zinc-500">No feedback yet. Be the first to share a thoughtful review.</div>
          )}
        </section>
      </div>

      <FeedbackModal feedback={activeFeedback} onClose={() => setActiveFeedback(null)} />
    </div>
  );
}
