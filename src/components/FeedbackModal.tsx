import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';
import type { FeedbackEntry } from '../types/feedback';
import { ownerAvatarSrc } from '../hooks/useCommunityAuth';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={16} className={index < rating ? 'fill-current' : 'text-zinc-700'} />
      ))}
    </div>
  );
}

export default function FeedbackModal({ feedback, onClose }: { feedback: FeedbackEntry | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md p-4 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-2xl rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {feedback.userPic ? (
                    <img
                      src={ownerAvatarSrc(feedback.userId, feedback.userPic)}
                      alt={feedback.userName}
                      className="h-12 w-12 rounded-full border border-zinc-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-bold text-zinc-300">
                      {feedback.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-black tracking-tight text-white">{feedback.userName}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{feedback.subjectName} · {feedback.subSubjectName}</p>
                  </div>
                </div>
                <Stars rating={feedback.rating} />
              </div>
              <button onClick={onClose} className="rounded-xl border border-zinc-800 p-2 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.35em] text-amber-500">Subject line</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{feedback.headline}</h3>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{feedback.message}</p>
              <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4 text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-600">
                <span>{feedback.createdAtIST} IST</span>
                {feedback.isPinned && <span className="text-amber-500">Pinned on homepage</span>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
