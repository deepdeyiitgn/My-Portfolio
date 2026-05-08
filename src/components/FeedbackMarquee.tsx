import { useMemo, useState } from 'react';
import type { FeedbackEntry } from '../types/feedback';
import FeedbackCard from './FeedbackCard';
import FeedbackModal from './FeedbackModal';

function shuffle<T>(items: T[]) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

export default function FeedbackMarquee({ feedbacks }: { feedbacks: FeedbackEntry[] }) {
  const [paused, setPaused] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackEntry | null>(null);
  const shuffled = useMemo(() => shuffle(feedbacks), [feedbacks]);
  const loopItems = useMemo(() => [...shuffled, ...shuffled], [shuffled]);

  if (feedbacks.length === 0) return null;

  return (
    <>
      <section className="space-y-6 overflow-hidden">
        <div className="flex flex-col gap-3 px-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-amber-500">Testimonials</p>
          <h3 className="text-3xl font-black tracking-tighter text-white md:text-4xl">What people are saying about Deep Dey</h3>
        </div>
        <div
          className="relative overflow-hidden border-y border-zinc-900 bg-zinc-950/60 py-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { if (!activeFeedback) setPaused(false); }}
        >
          <div className={`feedback-marquee-track ${paused ? 'feedback-marquee-paused' : ''}`}>
            {loopItems.map((feedback, index) => (
              <div key={`${feedback._id}-${index}`} className="px-2">
                <FeedbackCard feedback={feedback} onSeeMore={(item) => { setActiveFeedback(item); setPaused(true); }} compact />
              </div>
            ))}
          </div>
        </div>
      </section>
      <FeedbackModal feedback={activeFeedback} onClose={() => { setActiveFeedback(null); setPaused(false); }} />
    </>
  );
}
