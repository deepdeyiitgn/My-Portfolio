import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleLogin } from '@react-oauth/google';
import {
  MessageSquare, Heart, Reply, Trash2, Edit3, Pin, PinOff, Send,
  ChevronDown, ChevronUp, AlertTriangle, X, LogOut, ExternalLink,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, ArrowDownUp,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GoogleUser {
  userId: string;
  name: string;
  picture: string;
  credential: string;
  exp: number; // token expiry epoch seconds
}

interface Comment {
  _id: string;
  journalId: string;
  userId: string;
  userName: string;
  userPic: string;
  text: string;
  likes: number;
  likedSessions: string[];
  parentId: string | null;
  isPinned: boolean;
  pinnedOrder: number;
  isDeleted: boolean;
  editedAt: string | null;
  createdAt: string;
  createdAtIST: string;
  replyCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Storage key ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'dd_comment_user';

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

function getSessionId(): string {
  const key = 'journal-session-id';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const generated = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(key, generated);
  return generated;
}

function commentLikeKey(id: string) { return `comment-liked-${id}`; }

function timeAgo(dateString?: string | null): string {
  if (!dateString) return '';
  const past = new Date(dateString);
  const diffMs = Date.now() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN');
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// ── Link Warning Modal ────────────────────────────────────────────────────────

function LinkWarningModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl shrink-0">
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">External Link Warning</h3>
            <p className="text-zinc-400 text-sm mt-1">
              This link was shared by a community member — it was not written by the owner or team of this website. Proceed at your own risk.
            </p>
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 break-all text-xs text-zinc-400 font-mono">
          {url}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} /> Open Anyway
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ── Render comment text with clickable links ──────────────────────────────────

function CommentText({ text, onLinkClick }: { text: string; onLinkClick: (url: string) => void }) {
  const parts: Array<{ type: 'text' | 'link'; value: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(URL_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: text.slice(last, match.index) });
    parts.push({ type: 'link', value: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((p, i) =>
        p.type === 'link' ? (
          <button
            key={i}
            onClick={() => onLinkClick(p.value)}
            className="text-amber-400 underline hover:text-amber-300 transition-colors break-all"
          >
            {p.value}
          </button>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </span>
  );
}

// ── Single Comment Item ───────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUser,
  isOwner,
  journalId,
  isReply,
  onLinkClick,
  onDelete,
  onEdit,
  onLike,
  onPin,
  onReplyPosted,
}: {
  comment: Comment;
  currentUser: GoogleUser | null;
  isOwner: boolean;
  journalId: string;
  isReply?: boolean;
  onLinkClick: (url: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onLike: (id: string) => void;
  onPin: (id: string, pin: boolean) => void;
  onReplyPosted: (reply: Comment) => void;
}) {
  const [liked, setLiked] = useState(() => sessionStorage.getItem(commentLikeKey(comment._id)) === '1');
  const [likes, setLikes] = useState(comment.likes);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [editLoading, setEditLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyPage, setReplyPage] = useState(1);
  const [replyPagination, setReplyPagination] = useState<Pagination | null>(null);

  const canEdit = isOwner || (currentUser && currentUser.userId === comment.userId);
  const canDelete = isOwner || (currentUser && currentUser.userId === comment.userId);

  const handleLike = async () => {
    if (liked) return;
    const session = getSessionId();
    try {
      const r = await fetch(`/api/journal?action=comment-like&id=${encodeURIComponent(comment._id)}&session=${encodeURIComponent(session)}`, { method: 'POST' });
      const d = await r.json();
      if (d.ok) {
        setLiked(true);
        setLikes(d.likes);
        sessionStorage.setItem(commentLikeKey(comment._id), '1');
        onLike(comment._id);
      }
    } catch { /* ignore */ }
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText.trim() === comment.text) { setEditing(false); return; }
    setEditLoading(true);
    try {
      const body: Record<string, string> = { commentId: comment._id, text: editText.trim() };
      if (!isOwner && currentUser) body.credential = currentUser.credential;
      const r = await fetch('/api/journal?action=comment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        onEdit(comment._id, editText.trim());
        setEditing(false);
      }
    } catch { /* ignore */ } finally { setEditLoading(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!currentUser && !isOwner) return;
    setReplyLoading(true);
    try {
      const body: Record<string, string> = {
        journalId,
        text: replyText.trim(),
        parentId: comment._id,
      };
      if (!isOwner && currentUser) body.credential = currentUser.credential;
      const r = await fetch('/api/journal?action=comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        setReplyText('');
        setReplying(false);
        onReplyPosted(d.comment);
        setReplies(prev => [d.comment, ...prev]);
        setShowReplies(true);
      } else if (d.message?.includes('expired') || d.message?.includes('Invalid')) {
        alert('Your sign-in has expired. Please sign in with Google again.');
      }
    } catch { /* ignore */ } finally { setReplyLoading(false); }
  };

  const loadReplies = useCallback(async (page = 1) => {
    setRepliesLoading(true);
    try {
      const r = await fetch(`/api/journal?action=comments&journalId=${encodeURIComponent(journalId)}&parentId=${encodeURIComponent(comment._id)}&page=${page}&sort=old`);
      const d = await r.json();
      if (d.ok) {
        setReplies(d.comments);
        setReplyPagination(d.pagination);
        setReplyPage(page);
      }
    } catch { /* ignore */ } finally { setRepliesLoading(false); }
  }, [journalId, comment._id]);

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) loadReplies(1);
    setShowReplies(!showReplies);
  };

  const isOwnerComment = comment.userId === 'owner';

  return (
    <div className={`space-y-3 ${comment.isPinned ? 'border-l-2 border-amber-500 pl-3' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {comment.userPic ? (
            <img
              src={comment.userPic}
              alt={comment.userName}
              className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isOwnerComment ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-bold ${isOwnerComment ? 'text-amber-400' : 'text-white'}`}>
              {comment.userName}
            </span>
            {isOwnerComment && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono uppercase tracking-wider">Owner</span>
            )}
            {comment.isPinned && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono uppercase tracking-wider flex items-center gap-1">
                <Pin size={8} /> Pinned
              </span>
            )}
            <span className="text-xs text-zinc-600">{timeAgo(comment.createdAt)}</span>
            {comment.editedAt && <span className="text-[10px] text-zinc-600 italic">(edited)</span>}
          </div>

          {/* Comment text or edit box */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                rows={3}
                maxLength={2000}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  disabled={editLoading || !editText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {editLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditText(comment.text); }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-300 text-sm leading-relaxed">
              <CommentText text={comment.text} onLinkClick={onLinkClick} />
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'}`}
            >
              <Heart size={12} fill={liked ? 'currentColor' : 'none'} /> {likes}
            </button>

            {!isReply && (currentUser || isOwner) && (
              <button
                onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
              >
                <Reply size={12} /> Reply
              </button>
            )}

            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
              >
                <Edit3 size={12} /> Edit
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDelete(comment._id)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}

            {isOwner && !isReply && (
              <button
                onClick={() => onPin(comment._id, !comment.isPinned)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
              >
                {comment.isPinned ? <><PinOff size={12} /> Unpin</> : <><Pin size={12} /> Pin</>}
              </button>
            )}

            {!isReply && comment.replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 text-xs text-amber-500/80 hover:text-amber-400 transition-colors ml-auto"
              >
                {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply input */}
          {replying && (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                rows={2}
                maxLength={2000}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={replyLoading || !replyText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {replyLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Post Reply
                </button>
                <button
                  onClick={() => { setReplying(false); setReplyText(''); }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && !isReply && (
            <div className="mt-3 ml-4 space-y-4 border-l border-zinc-800 pl-4">
              {repliesLoading ? (
                <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-amber-500" /></div>
              ) : (
                <>
                  {replies.map((reply) => (
                    <Fragment key={reply._id}>
                      <CommentItem
                        comment={reply}
                        currentUser={currentUser}
                        isOwner={isOwner}
                        journalId={journalId}
                        isReply
                        onLinkClick={onLinkClick}
                        onDelete={onDelete}
                        onEdit={(id, text) => setReplies(prev => prev.map(r => r._id === id ? { ...r, text } : r))}
                        onLike={() => {}}
                        onPin={() => {}}
                        onReplyPosted={() => {}}
                      />
                    </Fragment>
                  ))}
                  {replyPagination && replyPagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => loadReplies(replyPage - 1)}
                        disabled={replyPage <= 1}
                        className="p-1 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs text-zinc-600">{replyPage}/{replyPagination.totalPages}</span>
                      <button
                        onClick={() => loadReplies(replyPage + 1)}
                        disabled={replyPage >= replyPagination.totalPages}
                        className="p-1 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main CommentSection Component ─────────────────────────────────────────────

export default function CommentSection({ journalId }: { journalId: string }) {
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [pinnedComments, setPinnedComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<'top' | 'new' | 'old'>('top');
  const [page, setPage] = useState(1);

  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const [warnUrl, setWarnUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load user from localStorage and check owner status on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: GoogleUser = JSON.parse(stored);
        if (parsed.exp * 1000 > Date.now()) {
          setCurrentUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch { localStorage.removeItem(STORAGE_KEY); }
    }

    fetch('/api/auth')
      .then(r => r.json())
      .then(d => { if (d.authenticated) setIsOwner(true); })
      .catch(() => {});
  }, []);

  const fetchComments = useCallback(async (pg = 1, sortMode = sort) => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/journal?action=comments&journalId=${encodeURIComponent(journalId)}&page=${pg}&sort=${sortMode}`);
      const d = await r.json();
      if (d.ok) {
        setComments(d.comments);
        setPinnedComments(d.pinnedComments || []);
        setPagination(d.pagination);
      } else {
        setError(d.message || 'Failed to load comments');
      }
    } catch {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [journalId, sort]);

  useEffect(() => {
    fetchComments(1, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId]);

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    const payload = decodeJwt(credentialResponse.credential);
    if (!payload) return;
    const user: GoogleUser = {
      userId: String(payload.sub || ''),
      name: String(payload.name || payload.given_name || 'Anonymous'),
      picture: String(payload.picture || ''),
      credential: credentialResponse.credential,
      exp: Number(payload.exp || 0),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  const handlePost = async () => {
    if (!commentText.trim()) return;
    if (!currentUser && !isOwner) return;
    setPosting(true);
    try {
      const body: Record<string, string> = { journalId, text: commentText.trim() };
      if (!isOwner && currentUser) body.credential = currentUser.credential;
      const r = await fetch('/api/journal?action=comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        setCommentText('');
        setComments(prev => sort === 'new' ? [d.comment, ...prev] : [...prev, d.comment]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      } else if (d.message?.includes('expired') || d.message?.includes('Invalid')) {
        alert('Your sign-in has expired. Please sign in with Google again.');
        handleSignOut();
      } else {
        alert(d.message || 'Failed to post comment');
      }
    } catch {
      alert('Failed to post comment');
    } finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const body: Record<string, string> = {};
      if (!isOwner && currentUser) body.credential = currentUser.credential;
      const r = await fetch(`/api/journal?action=comment&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        setComments(prev => prev.filter(c => c._id !== id));
        setPinnedComments(prev => prev.filter(c => c._id !== id));
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch { /* ignore */ }
  };

  const handleEdit = (id: string, text: string) => {
    setComments(prev => prev.map(c => c._id === id ? { ...c, text, editedAt: new Date().toISOString() } : c));
    setPinnedComments(prev => prev.map(c => c._id === id ? { ...c, text, editedAt: new Date().toISOString() } : c));
  };

  const handlePin = async (id: string, pin: boolean) => {
    try {
      const r = await fetch('/api/journal?action=comment-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, pin }),
      });
      const d = await r.json();
      if (d.ok) {
        fetchComments(page, sort);
      } else {
        alert(d.message || 'Failed to pin comment');
      }
    } catch { /* ignore */ }
  };

  const handleSortChange = (newSort: 'top' | 'new' | 'old') => {
    setSort(newSort);
    setPage(1);
    fetchComments(1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchComments(newPage, sort);
    document.getElementById('comment-section-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalCount = pagination.total;

  return (
    <div id="comment-section-top" className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <MessageSquare className="text-amber-500" size={18} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Comments</h3>
            <p className="text-zinc-500 text-xs">{totalCount} {totalCount === 1 ? 'comment' : 'comments'}</p>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <ArrowDownUp size={12} className="text-zinc-500" />
          {(['top', 'new', 'old'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                sort === s
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {s === 'top' ? 'Top' : s === 'new' ? 'Newest' : 'Oldest'}
            </button>
          ))}
        </div>
      </div>

      {/* Auth section */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-4">
        {isOwner ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">D</div>
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 text-sm font-bold">Deep Dey (Owner)</p>
              <p className="text-zinc-600 text-xs">Posting as owner</p>
            </div>
          </div>
        ) : currentUser ? (
          <div className="flex items-center gap-3">
            {currentUser.picture ? (
              <img src={currentUser.picture} alt={currentUser.name} className="w-8 h-8 rounded-full border border-zinc-700 shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{currentUser.name}</p>
              <p className="text-zinc-600 text-xs">Signed in with Google</p>
            </div>
            <button onClick={handleSignOut} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-800 transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">Sign in with Google to leave a comment.</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Google sign-in failed. Please try again.')}
              theme="filled_black"
              shape="rectangular"
              size="medium"
              text="signin_with"
            />
          </div>
        )}

        {/* Comment input */}
        {(currentUser || isOwner) && (
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment... (plain text, links are supported)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none transition-all"
              rows={3}
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost();
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">{commentText.length}/2000 · Ctrl+Enter to post</span>
              <button
                onClick={handlePost}
                disabled={posting || !commentText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post Comment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-amber-500" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Pinned comments */}
      {!loading && pinnedComments.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1">
            <Pin size={10} /> Pinned Comments
          </p>
          {pinnedComments.map((c) => (
            <Fragment key={c._id}>
              <CommentItem
                comment={c}
                currentUser={currentUser}
                isOwner={isOwner}
                journalId={journalId}
                onLinkClick={setWarnUrl}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onLike={() => {}}
                onPin={handlePin}
                onReplyPosted={() => {
                  fetchComments(page, sort);
                }}
              />
            </Fragment>
          ))}
        </div>
      )}

      {/* Comments list */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {comments.length === 0 && pinnedComments.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 space-y-2">
                <MessageSquare size={32} className="mx-auto opacity-20" />
                <p className="text-sm">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((c) => (
                <Fragment key={c._id}>
                  <CommentItem
                    comment={c}
                    currentUser={currentUser}
                    isOwner={isOwner}
                    journalId={journalId}
                    onLinkClick={setWarnUrl}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onLike={() => {}}
                    onPin={handlePin}
                    onReplyPosted={() => {
                      fetchComments(page, sort);
                    }}
                  />
                </Fragment>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold"
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pagination.totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {!loading && pagination.total > 0 && (
        <p className="text-center text-zinc-700 text-[10px] font-mono">
          {pagination.total} comment{pagination.total !== 1 ? 's' : ''} · Page {page} of {pagination.totalPages}
        </p>
      )}

      {/* External link warning modal */}
      <AnimatePresence>
        {warnUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LinkWarningModal url={warnUrl} onClose={() => setWarnUrl(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
