export type ViewerReaction = 'like' | 'dislike' | null;

export interface FeedbackReactionSummary {
  likes: number;
  dislikes: number;
  total: number;
}

interface FeedbackReactionTarget {
  _id: string;
  viewerReaction?: ViewerReaction;
  reactionSummary?: FeedbackReactionSummary;
  reactionTotal?: number;
}

const FEEDBACK_SESSION_KEY = 'feedback-session-id';

export function getOrCreateFeedbackSessionId() {
  const existing = sessionStorage.getItem(FEEDBACK_SESSION_KEY);
  if (existing) return existing;
  const generated = `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(FEEDBACK_SESSION_KEY, generated);
  return generated;
}

export function patchFeedbackReactionInList<T extends FeedbackReactionTarget>(
  list: T[],
  feedbackId: string,
  nextReaction: ViewerReaction,
  summary: FeedbackReactionSummary,
) {
  return list.map((item) => (
    item._id === feedbackId ? { ...item, viewerReaction: nextReaction, reactionSummary: summary, reactionTotal: summary.total } : item
  ));
}

export function patchFeedbackReactionInItem<T extends FeedbackReactionTarget>(
  item: T | null,
  feedbackId: string,
  nextReaction: ViewerReaction,
  summary: FeedbackReactionSummary,
) {
  if (!item || item._id !== feedbackId) return item;
  return { ...item, viewerReaction: nextReaction, reactionSummary: summary, reactionTotal: summary.total };
}
