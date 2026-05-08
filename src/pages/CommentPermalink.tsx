import { useEffect, useState, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, Heart, Loader2, AlertCircle, ExternalLink, User } from 'lucide-react';
import SEO from '../components/SEO';
import { CrownBadgeIcon, VerifiedTickIcon } from '../components/IdentityBadges';

interface Comment {
  _id: string;
  userId: string;
  isVerified?: boolean;
  userName: string;
  userPic: string;
  text: string;
  likes: number;
  parentId: string | null;
  isPinned: boolean;
  createdAt: string;
  createdAtIST: string;
  editedAt: string | null;
}

interface JournalInfo {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  categoryName: string;
  publishedAtIST: string;
  readMinutes: number;
}

function timeAgo(dateString?: string | null): string {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN');
}

function CommentCard({
  comment,
  isHighlight = false,
}: {
  comment: Comment;
  isHighlight?: boolean;
}) {
  const isOwner = comment.userId === 'owner';
  const isVerified = isOwner || Boolean(comment.isVerified);
  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 ${
        isHighlight
          ? 'border-amber-500/40 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
          : 'border-zinc-800 bg-zinc-900/40'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {isOwner ? (
          <img
            src="/assets/images/myphoto.png"
            alt="Deep Dey"
            className="w-8 h-8 rounded-full border-2 border-amber-500/60 object-cover shrink-0 ring-2 ring-amber-500/20"
          />
        ) : comment.userPic ? (
          <img
            src={comment.userPic}
            alt={comment.userName}
            className="w-8 h-8 rounded-full border border-zinc-700 object-cover shrink-0"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOwner ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-800 border border-zinc-700'}`}>
            <User size={14} className={isOwner ? 'text-amber-500' : 'text-zinc-500'} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={isOwner ? '/user/owner' : `/user/${encodeURIComponent(comment.userId)}`}
              className={isOwner ? 'text-amber-500 font-bold text-sm hover:text-amber-400 transition-colors' : 'text-white font-bold text-sm hover:text-amber-400 transition-colors'}
            >
              {comment.userName}
            </Link>
            {isOwner && (
              <span className="inline-flex items-center gap-0.5" title="Verified Owner">
                <VerifiedTickIcon className="w-[13px] h-[13px]" />
                <CrownBadgeIcon className="w-[13px] h-[13px]" />
              </span>
            )}
            {!isOwner && isVerified && (
              <span className="inline-flex items-center gap-0.5" title="Verified User">
                <VerifiedTickIcon className="w-[13px] h-[13px]" />
              </span>
            )}
            <span className="text-zinc-600 text-[10px] font-mono">{timeAgo(comment.createdAt)}</span>
            {comment.editedAt && <span className="text-zinc-700 text-[9px] font-mono">(edited)</span>}
          </div>
          <p className="text-zinc-300 text-sm mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-zinc-600 text-xs">
              <Heart size={12} /> {comment.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommentPermalink() {
  const { commentId = '' } = useParams<{ commentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [journal, setJournal] = useState<JournalInfo | null>(null);

  useEffect(() => {
    if (!commentId) { setError('Comment ID missing'); setLoading(false); return; }
    fetch(`/api/journal?action=comment-by-id&id=${encodeURIComponent(commentId)}`)
      .then(r => r.json())
      .then(d => {
        if (!d.ok) { setError(d.message || 'Comment not found'); return; }
        setComment(d.comment as Comment);
        setReplies((d.replies || []) as Comment[]);
        setParentComment(d.parentComment as Comment | null || null);
        setJournal(d.journal);
      })
      .catch(() => setError('Failed to load comment'))
      .finally(() => setLoading(false));
  }, [commentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !comment || !journal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-white font-bold text-lg">{error || 'Comment not found'}</p>
          <button onClick={() => navigate(-1)} className="text-amber-500 text-sm hover:underline">← Go back</button>
        </div>
      </div>
    );
  }

  const journalViewUrl = `/journal/view/${encodeURIComponent(journal.slug || journal._id)}`;

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title={`Comment by ${comment.userName} | ${journal.title}`}
        description={`"${comment.text.length > 120 ? comment.text.slice(0, 120) + '…' : comment.text}" — comment on "${journal.title}" by ${comment.userName}`}
        route={`/journal/comment/${commentId}`}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Journal info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-2"
        >
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Comment on journal post</p>
          <h1 className="text-white font-black text-xl">{journal.title}</h1>
          {journal.summary && <p className="text-zinc-500 text-sm">{journal.summary}</p>}
          <div className="flex items-center gap-3 pt-1">
            {journal.categoryName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{journal.categoryName}</span>
            )}
            <span className="text-zinc-600 text-xs font-mono">{journal.readMinutes} min read</span>
          </div>
          <Link
            to={journalViewUrl}
            className="inline-flex items-center gap-2 text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors mt-2"
          >
            <ExternalLink size={14} /> View full post & all comments
          </Link>
        </motion.div>

        {/* Parent comment (if this is a reply) */}
        <AnimatePresence>
          {parentComment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={10} /> In reply to
              </p>
              <CommentCard comment={parentComment} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The highlighted comment */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <p className="text-amber-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={10} /> {parentComment ? 'This reply' : 'This comment'}
          </p>
          <CommentCard comment={comment} isHighlight />
        </motion.div>

        {/* Replies (only shown for top-level comments) */}
        {!parentComment && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={10} /> {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </p>
            <div className="pl-4 border-l-2 border-zinc-800 space-y-2">
              {(replies as Comment[]).map((reply: Comment) => (
                <Fragment key={reply._id}>
                  <CommentCard comment={reply} />
                </Fragment>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA to full comment section */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
          <p className="text-zinc-400 text-sm">Want to join the conversation?</p>
          <Link
            to={journalViewUrl}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            <MessageSquare size={14} /> View all comments
          </Link>
        </div>
      </div>
    </div>
  );
}
