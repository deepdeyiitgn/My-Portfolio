import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareQuote, Users, Star, X } from 'lucide-react';
import {
  getOrCreateFeedbackSessionId,
  patchFeedbackReactionInItem,
  patchFeedbackReactionInList,
  type FeedbackReactionSummary,
} from '../utils/feedback';

interface FeedbackCard {
  _id: string;
  userName: string;
  userPic: string;
  subject: string;
  subSubject: string;
  title: string;
  text: string;
  rating: number;
  isOwner?: boolean;
  reactionSummary?: {
    likes: number;
    dislikes: number;
    total: number;
  };
  reactionTotal?: number;
  viewerReaction?: 'like' | 'dislike' | null;
}

interface FeedbackStats {
  totalUsers: number;
  totalFeedbacks: number;
  averageRating: number;
}

function shuffleArray<T>(arr: T[]) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function SocialProof() {
  const [stats, setStats] = useState<FeedbackStats>({ totalUsers: 0, totalFeedbacks: 0, averageRating: 0 });
  const [feedbacks, setFeedbacks] = useState<FeedbackCard[]>([]);
  const [paused, setPaused] = useState(false);
  const [openCard, setOpenCard] = useState<FeedbackCard | null>(null);
  const [reactingFeedbackId, setReactingFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/journal?action=feedback-stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.stats) {
          const avg = Number(d.stats.averageRating || 0);
          setStats({
            totalUsers: Number(d.stats.totalUsers || 0),
            totalFeedbacks: Number(d.stats.totalFeedbacks || 0),
            averageRating: Number.isFinite(avg) ? avg : 0,
          });
        }
      })
      .catch(() => {});

    const session = getOrCreateFeedbackSessionId();
    fetch(`/api/journal?action=feedback-pinned&limit=120&session=${encodeURIComponent(session)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.feedbacks)) {
          setFeedbacks(shuffleArray<FeedbackCard>(d.feedbacks));
        }
      })
      .catch(() => {});
  }, []);

  const marqueeItems = useMemo(() => {
    if (feedbacks.length === 0) return [];
    const minTrackItems = 12;
    const targetTrackItems = Math.max(minTrackItems, feedbacks.length);
    const track: FeedbackCard[] = [];
    while (track.length < targetTrackItems) {
      track.push(...shuffleArray<FeedbackCard>(feedbacks));
    }
    const normalizedTrack = track.slice(0, targetTrackItems);
    return [...normalizedTrack, ...normalizedTrack];
  }, [feedbacks]);
  const shouldPause = paused || Boolean(openCard);

  const applyReactionUpdate = (feedbackId: string, nextReaction: 'like' | 'dislike' | null, summary: FeedbackReactionSummary) => {
    setFeedbacks((prev) => patchFeedbackReactionInList(prev, feedbackId, nextReaction, summary));
    setOpenCard((prev) => patchFeedbackReactionInItem(prev, feedbackId, nextReaction, summary));
  };

  const handleReaction = async (feedbackId: string, next: 'like' | 'dislike') => {
    if (!feedbackId) return;
    const session = getOrCreateFeedbackSessionId();
    const current = feedbacks.find((item) => item._id === feedbackId)?.viewerReaction || null;
    const clear = current === next;
    setReactingFeedbackId(feedbackId);
    try {
      const r = await fetch('/api/journal?action=feedback-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          session,
          reaction: clear ? null : next,
          clear,
        }),
      });
      const d = await r.json();
      if (d.ok && d.reactionSummary) {
        applyReactionUpdate(feedbackId, d.viewerReaction || null, d.reactionSummary);
      }
    } catch {
      // ignore
    } finally {
      setReactingFeedbackId(null);
    }
  };

  return (
    <section className="space-y-8" aria-label="Community feedback spotlight">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: <Users size={15} className="text-amber-400" /> },
          { label: 'Total Feedbacks', value: stats.totalFeedbacks, icon: <MessageSquareQuote size={15} className="text-amber-400" /> },
          { label: 'Average Rating', value: stats.totalFeedbacks > 0 ? stats.averageRating.toFixed(2) : '0.00', icon: <Star size={15} className="text-amber-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/35 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-mono">{stat.icon}{stat.label}</div>
            <p className="mt-2 text-3xl font-black text-amber-500">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 p-10 text-center text-zinc-600 text-sm">
            No pinned feedback yet.
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70">
            <style>{`@keyframes ddFeedbackMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
            <div
              className="flex gap-4 w-max px-4 py-5"
              style={{
                animation: 'ddFeedbackMarquee 70s linear infinite',
                animationPlayState: shouldPause ? 'paused' : 'running',
              }}
            >
              {marqueeItems.map((item, idx) => {
                const long = item.text.length > 140;
                const preview = long ? `${item.text.slice(0, 140)}…` : item.text;
                return (
                  <article
                    key={`${item._id}-${idx}`}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onClick={() => {
                      setPaused(true);
                      setOpenCard(item);
                    }}
                    className="w-[310px] shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-amber-500/35 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.userPic ? (
                        <img src={item.userPic} alt={item.userName} className="w-10 h-10 rounded-full border border-zinc-700 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.userName}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{item.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} className={star <= Number(item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                      ))}
                    </div>
                    <p className="text-zinc-400 text-sm mt-2 line-clamp-4 whitespace-pre-wrap">{preview}</p>
                    {long && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaused(true);
                          setOpenCard(item);
                        }}
                        className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300"
                      >
                        See More
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openCard && (
          <div
            className="fixed inset-0 z-[560] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setOpenCard(null); setPaused(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full max-w-2xl rounded-3xl border border-zinc-700 bg-zinc-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-white font-black text-xl">{openCard.title}</h4>
                  <p className="text-zinc-500 text-xs mt-1">{openCard.subject} · {openCard.subSubject}</p>
                </div>
                <button
                  onClick={() => { setOpenCard(null); setPaused(false); }}
                  className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800"
                  aria-label="Close popup"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className={star <= Number(openCard.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                ))}
                <span className="text-zinc-500 text-xs">by {openCard.userName}</span>
              </div>
              <p className="mt-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{openCard.text}</p>
              <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReaction(openCard._id, 'like')}
                    disabled={reactingFeedbackId === openCard._id}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                      openCard.viewerReaction === 'like'
                        ? 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10'
                        : 'border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M2 21h4V9H2v12Zm20-11.2c0-1-.8-1.8-1.8-1.8h-5.7l.9-4.3.03-.3c0-.42-.17-.8-.44-1.08L13.9 1 7.6 7.3c-.36.36-.6.86-.6 1.4V19c0 1.1.9 2 2 2h7.5c.8 0 1.52-.48 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73V9.8Z" />
                    </svg>
                    Like
                  </button>
                  <button
                    onClick={() => handleReaction(openCard._id, 'dislike')}
                    disabled={reactingFeedbackId === openCard._id}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                      openCard.viewerReaction === 'dislike'
                        ? 'border-rose-500/60 text-rose-300 bg-rose-500/10'
                        : 'border-zinc-700 text-zinc-300 hover:border-rose-500/40 hover:text-rose-300'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M22 3h-4v12h4V3ZM2 14.2c0 1 .8 1.8 1.8 1.8h5.7L8.6 20.3l-.03.3c0 .42.17.8.44 1.08L10.1 23l6.3-6.3c.36-.36.6-.86.6-1.4V5c0-1.1-.9-2-2-2H7.5c-.8 0-1.52.48-1.84 1.22L2.64 11.27c-.09.23-.14.47-.14.73v2.2Z" />
                    </svg>
                    Dislike
                  </button>
                </div>
                <p className="text-zinc-500 text-xs">
                  {Number(openCard.reactionSummary?.likes || 0)} out of {Number(openCard.reactionSummary?.total || openCard.reactionTotal || 0)} liked this feedback
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
