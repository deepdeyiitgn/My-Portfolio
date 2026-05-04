import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Loader2, AlertCircle, User, Calendar, Heart, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';

interface Comment {
  _id: string;
  text: string;
  likes: number;
  parentId: string | null;
  createdAt: string;
  createdAtIST: string;
  editedAt: string | null;
  journalInfo: { title: string; slug: string } | null;
}

interface UserInfo {
  userId: string;
  userName: string;
  userPic: string;
  firstCommentAt: string;
  totalComments: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function timeAgo(dateString?: string | null): string {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return new Date(dateString).toLocaleDateString('en-IN');
}

export default function UserProfile() {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  const loadPage = useCallback(async (p: number) => {
    if (!userId) return;
    if (p === 1) setLoading(true); else setPageLoading(true);
    try {
      const r = await fetch(`/api/journal?action=user-profile&userId=${encodeURIComponent(userId)}&page=${p}`);
      const d = await r.json();
      if (!d.ok) { setError(d.message || 'User not found'); return; }
      setUserInfo(d.user);
      setComments(d.comments);
      setPagination(d.pagination);
      setPage(p);
    } catch { setError('Failed to load profile'); }
    finally { setLoading(false); setPageLoading(false); }
  }, [userId]);

  useEffect(() => { loadPage(1); }, [loadPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-white font-bold text-lg">{error || 'User not found'}</p>
          <button onClick={() => navigate(-1)} className="text-amber-500 text-sm hover:underline">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title={`${userInfo.userName}'s Profile | Deep Dey Journal`}
        description={`${userInfo.userName} has commented ${userInfo.totalComments} time${userInfo.totalComments !== 1 ? 's' : ''} on journal posts.`}
        route={`/user/${userId}`}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex items-center gap-5"
        >
          {userInfo.userPic ? (
            <img
              src={userInfo.userPic}
              alt={userInfo.userName}
              className="w-16 h-16 rounded-full border-2 border-zinc-700 object-cover shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shrink-0">
              <User size={28} className="text-zinc-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-black text-2xl tracking-tight">{userInfo.userName}</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
                <MessageSquare size={12} />
                {userInfo.totalComments} comment{userInfo.totalComments !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
                <Calendar size={12} />
                First comment {timeAgo(userInfo.firstCommentAt)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Comments list */}
        <div className="space-y-3">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-500" />
            Comments ({pagination?.total ?? userInfo.totalComments})
          </h2>

          {pageLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-amber-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No comments yet.</p>
            </div>
          ) : (
            <>
              {comments.map((c, idx) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {c.journalInfo && (
                        <Link
                          to={`/journal/view/${c.journalInfo.slug}`}
                          className="text-amber-500 text-xs font-bold hover:text-amber-400 transition-colors flex items-center gap-1 mb-1.5 truncate"
                        >
                          <ExternalLink size={10} />
                          {c.journalInfo.title}
                        </Link>
                      )}
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap break-words">{c.text}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-zinc-600 text-[10px] font-mono">{timeAgo(c.createdAt)}</span>
                      {c.editedAt && <p className="text-zinc-700 text-[9px] font-mono">(edited)</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-zinc-600 text-xs">
                      <Heart size={11} /> {c.likes}
                      {c.parentId && <span className="ml-2 text-zinc-700 text-[9px] font-mono uppercase tracking-widest">Reply</span>}
                    </span>
                    <Link
                      to={`/journal/comment/${c._id}`}
                      className="text-zinc-600 hover:text-amber-500 text-[10px] font-mono transition-colors flex items-center gap-1"
                    >
                      <ExternalLink size={10} /> Permalink
                    </Link>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => loadPage(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="text-zinc-500 text-sm">Page {page} / {pagination.totalPages}</span>
                  <button
                    onClick={() => loadPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
