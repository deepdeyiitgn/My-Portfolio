import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, MessageSquare, Calendar, Loader2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import SEO from '../components/SEO';
import { useCommunityAuth } from '../hooks/useCommunityAuth';

interface Contributor {
  _id?: string;
  userId: string;
  userName: string;
  userPic: string;
  totalComments: number;
  firstCommentAt: string;
  lastCommentAt: string;
  profileTitle?: string;
  verified?: boolean;
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
  const mon = Math.floor(day / 30);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  if (mon < 12) return `${mon}mo ago`;
  return new Date(d).toLocaleDateString('en-IN');
}

export default function AllUsers() {
  const { currentUser } = useCommunityAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Contributor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  const fetchPage = useCallback(async (p: number) => {
    if (p === 1) setLoading(true); else setPageLoading(true);
    try {
      const r = await fetch(`/api/journal?action=all-users&page=${p}`);
      const d = await r.json();
      if (d.ok) {
        setUsers(d.users || []);
        setPagination(d.pagination);
        setPage(p);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); setPageLoading(false); }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const total = pagination?.total ?? 0;
  const pinnedUser = currentUser
    ? users.find((user) => user.userId === currentUser.userId) || {
        userId: currentUser.userId,
        userName: currentUser.name,
        userPic: currentUser.picture,
        totalComments: 0,
        firstCommentAt: new Date().toISOString(),
        lastCommentAt: new Date().toISOString(),
      }
    : null;
  const visibleUsers = pinnedUser ? users.filter((user) => user.userId !== pinnedUser.userId) : users;

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title="Contributors | Deep Dey Journal"
        description={`${total} contributor${total !== 1 ? 's' : ''} who have joined the conversation on Deep Dey's journal.`}
        route="/user"
      />
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
            <Users size={24} className="text-amber-500" />
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">Contributors</h1>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">Everyone who has joined the conversation on this journal.</p>
        </motion.div>

        {/* Owner card — always at the top */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-amber-400 via-amber-500/60 to-amber-900/40 shadow-[0_0_32px_rgba(245,158,11,0.25)]">
            <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-5 flex items-center gap-4">
              {/* Radial glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.12)_0%,_transparent_65%)] pointer-events-none rounded-[calc(1rem-1px)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.06)_0%,_transparent_60%)] pointer-events-none rounded-[calc(1rem-1px)]" />
              {/* Photo with glow ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-md scale-125" />
                <img
                  src="/assets/images/myphoto.png"
                  alt="Deep Dey"
                  className="relative w-14 h-14 rounded-full object-cover border-2 border-amber-400/70 ring-4 ring-amber-500/20 shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                />
              </div>
              <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-amber-400 font-black text-lg tracking-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Deep Dey</span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Owner</span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">Founder · Software Architect · JEE 2027</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-zinc-500 text-[11px] flex items-center gap-1"><MessageSquare size={10} /> Writes all journal posts</span>
                </div>
              </div>
              <Link to="/user/owner" className="shrink-0 z-10 px-4 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/25 hover:border-amber-400/70 transition-all shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Contributors */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No contributors yet. Be the first to comment!</p>
            <Link to="/journal" className="text-amber-500 text-sm hover:underline mt-2 inline-block">Browse Journal →</Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{total} contributor{total !== 1 ? 's' : ''} · sorted by recent activity</p>
            </div>
            {pinnedUser && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.35em] text-amber-400">Your profile</p>
                <Link
                  to={`/user/${encodeURIComponent(pinnedUser.userId)}`}
                  className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-zinc-950/60 p-4 transition-all hover:border-amber-500/40"
                >
                  {pinnedUser.userPic ? (
                    <img src={pinnedUser.userPic} alt={pinnedUser.userName} className="h-11 w-11 rounded-full border border-zinc-700 object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 shrink-0">
                      <User size={18} className="text-zinc-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{pinnedUser.userName}</p>
                    <p className="text-[11px] text-zinc-500">Pinned to the top while you are logged in.</p>
                  </div>
                </Link>
              </motion.div>
            )}
            {pageLoading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleUsers.map((u, i) => (
                  <motion.div
                    key={u.userId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/user/${encodeURIComponent(u.userId)}`}
                      className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
                    >
                      {u.userPic ? (
                        <img src={u.userPic} alt={u.userName} className="w-11 h-11 rounded-full border border-zinc-700 object-cover shrink-0 group-hover:border-amber-500/40 transition-colors" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                          <User size={18} className="text-zinc-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate group-hover:text-amber-400 transition-colors">{u.userName}</p>
                        {u.profileTitle && <p className="text-zinc-500 text-[11px] truncate">{u.profileTitle}</p>}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-zinc-600 text-[11px]">
                            <MessageSquare size={9} /> {u.totalComments}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-700 text-[10px]">
                            <Calendar size={9} /> {timeAgo(u.lastCommentAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={() => fetchPage(page - 1)} disabled={page <= 1} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors">
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-zinc-500 text-sm">Page {page} / {pagination.totalPages}</span>
                <button onClick={() => fetchPage(page + 1)} disabled={page >= pagination.totalPages} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
