import { Star } from 'lucide-react';
import type { FeedbackEntry } from '../types/feedback';
import { ownerAvatarSrc } from '../hooks/useCommunityAuth';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={14} className={index < rating ? 'fill-current' : 'text-zinc-700'} />
      ))}
    </div>
  );
}

export default function FeedbackCard({
  feedback,
  onSeeMore,
  compact = false,
}: {
  feedback: FeedbackEntry;
  onSeeMore: (feedback: FeedbackEntry) => void;
  compact?: boolean;
}) {
  const truncated = feedback.message.length > (compact ? 120 : 220);
  const preview = truncated ? `${feedback.message.slice(0, compact ? 120 : 220).trim()}…` : feedback.message;

  return (
    <article className={`rounded-[1.75rem] border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-amber-500/30 ${compact ? 'w-[320px] shrink-0' : ''}`}>
      <div className="flex items-start gap-3">
        {feedback.userPic ? (
          <img
            src={ownerAvatarSrc(feedback.userId, feedback.userPic)}
            alt={feedback.userName}
            className="h-11 w-11 rounded-full border border-zinc-700 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-bold text-zinc-300">
            {feedback.userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{feedback.userName}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.3em] text-zinc-500">{feedback.subjectName}</p>
            </div>
            <Stars rating={feedback.rating} />
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-amber-500">{feedback.subSubjectName}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-black tracking-tight text-white">{feedback.headline}</h3>
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-400">{preview}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-600">{feedback.createdAtIST}</span>
        {truncated && (
          <button onClick={() => onSeeMore(feedback)} className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 transition-colors hover:text-amber-400">
            See More
          </button>
        )}
      </div>
    </article>
  );
}
