import { useEffect, useState, useCallback, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, MessageSquare, Heart, Loader2, AlertCircle, User,
  ExternalLink, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';
import SEO from '../components/SEO';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userPic: string;
  text: string;
  likes: number;
  parentId: string | null;
  isPinned: boolean;
  replyCount: number;
  createdAt: string;
  editedAt: string | null;
}

interface JournalInfo {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  categoryName: string;
  readMinutes: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

function CommentRow({ comment }: { comment: Comment }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const isOwner = comment.userId === 'owner';

  const loadReplies = useCallback(async () => {
    if (repliesOpen) { setRepliesOpen(false); return; }
    setLoadingReplies(true);
    try {
      const r = await fetch(`/api/journal?action=comments&journalId=${comment._id.split('').slice(0, 0).join('')}&parentId=${comment._id}&page=1`);
      // Actually fetch using the parentId approach
      const r2 = await fetch(`/api/journal?action=comments&journalId=${encodeURIComponent((comment as unknown as { journalId: string }).journalId || '')}&parentId=${comment._id}&page=1`);
      const d = await r2.json();
      if (d.ok) setReplies(d.comments || []);
    } catch { /* ignore */ }
    finally { setLoadingReplies(false); setRepliesOpen(true); }
  }, [repliesOpen, comment]);

  return (
    <div className={`border rounded-2xl p-4 space-y-3 ${comment.isPinned ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
      <div className="flex items-start gap-3">
        {comment.userPic ? (
          <img src={comment.userPic} alt={comment.userName} className="w-8 h-8 rounded-full border border-zinc-700 object-cover shrink-0" />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOwner ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-800 border border-zinc-700'}`}>
            <User size={14} className={isOwner ? 'text-amber-500' : 'text-zinc-500'} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isOwner ? (
              <span className="text-amber-500 font-bold text-sm">{comment.userName}</span>
            ) : (
              <Link to={`/user/${encodeURIComponent(comment.userId)}`} className="text-white font-bold text-sm hover:text-amber-400 transition-colors">
                {comment.userName}
              </Link>
            )}
            {comment.isPinned && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-widest">Pinned</span>}
            {isOwner && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-widest">Owner</span>}
            <span className="text-zinc-600 text-[10px] font-mono">{timeAgo(comment.createdAt)}</span>
            {comment.editedAt && <span className="text-zinc-700 text-[9px] font-mono">(edited)</span>}
          </div>
          <p className="text-zinc-300 text-sm mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-zinc-600 text-xs"><Heart size={11} /> {comment.likes}</span>
          {comment.replyCount > 0 && (
            <button onClick={loadReplies} disabled={loadingReplies} className="flex items-center gap-1 text-zinc-500 hover:text-amber-500 text-xs transition-colors">
              {loadingReplies ? <Loader2 size={10} className="animate-spin" /> : <ChevronDown size={11} className={`transition-transform ${repliesOpen ? 'rotate-180' : ''}`} />}
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
        <Link to={`/journal/comment/${comment._id}`} className="text-zinc-600 hover:text-amber-500 text-[10px] font-mono transition-colors flex items-center gap-1">
          <ExternalLink size={10} /> Permalink
        </Link>
      </div>
      {repliesOpen && replies.length > 0 && (
        <div className="pl-4 border-l-2 border-zinc-800 space-y-2">
          {replies.map(r => (
            <Fragment key={r._id}>
              <div className="border border-zinc-800/60 rounded-xl p-3 bg-zinc-950/40 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {r.userPic ? (
                    <img src={r.userPic} alt={r.userName} className="w-6 h-6 rounded-full border border-zinc-700 object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center"><User size={10} className="text-zinc-500" /></div>
                  )}
                  <span className="text-zinc-300 font-bold text-xs">{r.userName}</span>
                  <span className="text-zinc-600 text-[10px] font-mono">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-zinc-400 text-xs whitespace-pre-wrap break-words">{r.text}</p>
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JournalAllComments() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadingJournal, setLoadingJournal] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [journal, setJournal] = useState<JournalInfo | null>(null);
  const [journalId, setJournalId] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [pinned, setPinned] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('top');

  // Load journal info first
  useEffect(() => {
    if (!id) return;
    const isObjectId = /^[0-9a-f]{24}$/i.test(id);
    const param = isObjectId ? `id=${id}` : `slug=${id}`;
    fetch(`/api/journal?${param}`)
      .then(r => r.json())
      .then(d => {
        if (!d.ok || !d.journal) { setError('Journal not found'); return; }
        setJournal(d.journal);
        setJournalId(String(d.journal._id));
      })
      .catch(() => setError('Failed to load journal'))
      .finally(() => setLoadingJournal(false));
  }, [id]);

  const fetchComments = useCallback(async (p: number, s: string) => {
    if (!journalId) return;
    setLoadingComments(true);
    try {
      const r = await fetch(`/api/journal?action=comments&journalId=${journalId}&page=${p}&sort=${s}`);
      const d = await r.json();
      if (d.ok) {
        // Annotate with journalId for reply loading
        const annotate = (c: Comment) => ({ ...c, journalId } as Comment & { journalId: string });
        setComments((d.comments || []).map(annotate));
        setPinned((d.pinnedComments || []).map(annotate));
        setPagination(d.pagination);
        setPage(p);
      }
    } catch { /* ignore */ }
    finally { setLoadingComments(false); }
  }, [journalId]);

  useEffect(() => {
    if (journalId) fetchComments(1, sort);
  }, [journalId, fetchComments, sort]);

  if (loadingJournal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-white font-bold text-lg">{error || 'Journal not found'}</p>
          <button onClick={() => navigate(-1)} className="text-amber-500 text-sm hover:underline">← Go back</button>
        </div>
      </div>
    );
  }

  const total = pagination?.total ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title={`Comments on "${journal.title}" | Deep Dey Journal`}
        description={`${total} comment${total !== 1 ? 's' : ''} on "${journal.title}".${journal.summary ? ' ' + journal.summary.slice(0, 100) : ''}`}
        route={`/journal/view/${id}/comments`}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Journal card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">All comments on</p>
          <h1 className="text-white font-black text-xl leading-tight">{journal.title}</h1>
          {journal.summary && <p className="text-zinc-500 text-sm">{journal.summary}</p>}
          <div className="flex items-center gap-3">
            {journal.categoryName && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{journal.categoryName}</span>}
            <span className="text-zinc-600 text-xs font-mono">{journal.readMinutes} min read</span>
          </div>
          <Link to={`/journal/view/${journal.slug}`} className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors mt-1">
            <ExternalLink size={13} /> Read full post
          </Link>
        </motion.div>

        {/* Sort + count */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm font-bold flex items-center gap-1.5">
            <MessageSquare size={14} className="text-amber-500" /> {total} comment{total !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-1.5">
            {(['top', 'new', 'old'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSort(s); fetchComments(1, s); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${sort === s ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
              >
                {s === 'top' ? 'Top' : s === 'new' ? 'Newest' : 'Oldest'}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        {loadingComments ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="space-y-3">
                {pinned.map(c => (
                  <Fragment key={c._id}><CommentRow comment={c} /></Fragment>
                ))}
              </div>
            )}
            {comments.length === 0 && pinned.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No comments yet. Be the first!</p>
                <Link to={`/journal/view/${journal.slug}`} className="text-amber-500 text-sm hover:underline mt-2 inline-block">Go to post →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <Fragment key={c._id}><CommentRow comment={c} /></Fragment>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={() => fetchComments(page - 1, sort)} disabled={page <= 1} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors">
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-zinc-500 text-sm">Page {page} / {pagination.totalPages}</span>
                <button onClick={() => fetchComments(page + 1, sort)} disabled={page >= pagination.totalPages} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
          <p className="text-zinc-400 text-sm">Join the conversation</p>
          <Link to={`/journal/view/${journal.slug}`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors">
            <MessageSquare size={14} /> Comment on this post
          </Link>
        </div>
      </div>
    </div>
  );
}
