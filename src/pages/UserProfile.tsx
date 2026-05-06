import { useEffect, useState, useCallback, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, MessageSquare, Loader2, AlertCircle, User, Calendar,
  Heart, ChevronLeft, ChevronRight, ExternalLink, Edit3, Check, X,
  Plus, Trash2, Globe, Github, Twitter, Linkedin, Instagram, Youtube,
  Link2, Activity,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import SEO from '../components/SEO';

interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

interface UserInfo {
  userId: string;
  userName: string;
  userPic: string;
  firstCommentAt: string;
  lastCommentAt?: string;
  totalComments: number;
  profileTitle?: string;
  bio?: string;
  description?: string;
  socialLinks?: SocialLink[];
}

interface Comment {
  _id: string;
  text: string;
  likes: number;
  parentId: string | null;
  createdAt: string;
  editedAt: string | null;
  journalInfo: { title: string; slug: string } | null;
}

interface Pagination {
  page: number;
  total: number;
  totalPages: number;
}

interface ActivityDay {
  day: string;
  count: number;
}

interface GoogleUser {
  userId: string;
  name: string;
  picture: string;
  credential: string;
  exp: number;
}

const STORAGE_KEY = 'dd_comment_user';

const PLATFORMS = [
  { key: 'github', label: 'GitHub', Icon: Github },
  { key: 'twitter', label: 'Twitter / X', Icon: Twitter },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'website', label: 'Website', Icon: Globe },
  { key: 'custom', label: 'Custom Link', Icon: Link2 },
];

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

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

function getUrlHostname(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch { return ''; }
}

function getPlatformIcon(platform: string, url: string) {
  const found = PLATFORMS.find(p => p.key === platform);
  if (found) return found.Icon;
  const host = getUrlHostname(url);
  if (host === 'github.com') return Github;
  if (host === 'twitter.com' || host === 'x.com') return Twitter;
  if (host === 'linkedin.com') return Linkedin;
  if (host === 'instagram.com') return Instagram;
  if (host === 'youtube.com') return Youtube;
  return Globe;
}

function SocialLinkButton({ link }: { link: SocialLink }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const isPlatform = PLATFORMS.some(p => p.key === link.platform && p.key !== 'custom');
  const Icon = getPlatformIcon(link.platform, link.url);
  const href = link.url.startsWith('http') ? link.url : `https://${link.url}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition-colors text-xs font-bold"
    >
      {isPlatform ? (
        <Icon size={13} />
      ) : faviconFailed ? (
        <Globe size={13} />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=16`}
          alt=""
          className="w-4 h-4 rounded"
          onError={() => setFaviconFailed(true)}
        />
      )}
      {link.label || PLATFORMS.find(p => p.key === link.platform)?.label || 'Link'}
    </a>
  );
}

function ContributionGraph({ activity }: { activity: ActivityDay[] }) {
  const actMap: Record<string, number> = {};
  for (const a of activity) actMap[a.day] = a.count;

  const today = new Date();
  const currentYear = today.getFullYear();

  // Build list of available years from activity data
  const years = Array.from(new Set(activity.map(a => a.day.slice(0, 4))))
    .map(Number)
    .sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Compute cells for selected year
  const yearStart = new Date(selectedYear, 0, 1);
  const yearEnd = selectedYear === currentYear ? today : new Date(selectedYear, 11, 31);

  // Start from Sunday of the week containing Jan 1
  const startDate = new Date(yearStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const cells: { date: string; count: number }[] = [];
  const cur = new Date(startDate);
  while (cur <= yearEnd) {
    const d = cur.toISOString().split('T')[0];
    const inYear = cur.getFullYear() === selectedYear || (selectedYear === currentYear && cur >= yearStart);
    cells.push({ date: d, count: inYear ? (actMap[d] || 0) : -1 }); // -1 = outside year
    cur.setDate(cur.getDate() + 1);
  }

  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Month labels: find which week each month starts in
  const monthLabels: { label: string; weekIndex: number }[] = [];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstValid = week.find(c => c.count !== -1);
    if (firstValid) {
      const m = new Date(firstValid.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: monthNames[m], weekIndex: wi });
        lastMonth = m;
      }
    }
  });

  function cellColor(count: number) {
    if (count < 0) return 'bg-transparent border-transparent';
    if (count === 0) return 'bg-zinc-900 border-zinc-800';
    if (count === 1) return 'bg-amber-500/20 border-amber-500/20';
    if (count <= 3) return 'bg-amber-500/50 border-amber-500/30';
    return 'bg-amber-500 border-amber-500/50';
  }

  const todayStr = today.toISOString().split('T')[0];
  const filteredActivity = activity.filter(a => a.day.startsWith(String(selectedYear)));
  const totalContribs = filteredActivity.reduce((s, a) => s + a.count, 0);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <Activity size={14} className="text-amber-500" /> Contribution Activity
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs">{totalContribs} comment{totalContribs !== 1 ? 's' : ''} in {selectedYear}</span>
          <div className="flex gap-1">
            {years.slice(0, 5).map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${selectedYear === y ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative" onMouseLeave={() => setTooltip(null)}>
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 pl-0">
          {weeks.map((_, wi) => {
            const ml = monthLabels.find(m => m.weekIndex === wi);
            return (
              <div key={wi} className="w-[10px] shrink-0 text-[8px] text-zinc-600 font-mono overflow-visible whitespace-nowrap" style={{ position: 'relative' }}>
                {ml ? <span style={{ position: 'absolute', left: 0 }}>{ml.label}</span> : null}
              </div>
            );
          })}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`w-[10px] h-[10px] rounded-[2px] border ${cellColor(cell.count)} ${cell.date === todayStr ? 'ring-1 ring-amber-500/60' : ''} ${cell.count >= 0 ? 'cursor-pointer' : ''}`}
                  onMouseEnter={(e) => {
                    if (cell.count < 0) return;
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({ date: cell.date, count: cell.count, x: rect.left, y: rect.top });
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 font-mono shadow-lg"
            style={{ left: tooltip.x + 14, top: tooltip.y - 8, transform: 'translateY(-100%)' }}
          >
            <span className="font-bold text-white">{tooltip.date}</span>
            <span className="ml-2 text-amber-400">{tooltip.count} comment{tooltip.count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
        <span>Less</span>
        {['bg-zinc-900 border-zinc-800', 'bg-amber-500/20 border-amber-500/20', 'bg-amber-500/50 border-amber-500/30', 'bg-amber-500 border-amber-500/50'].map((cls, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] border ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
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
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [tab, setTab] = useState<'overview' | 'comments' | 'activity'>('overview');

  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLinks, setEditLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const u: GoogleUser = JSON.parse(stored);
        if (u.exp * 1000 > Date.now()) setCurrentUser(u);
        else localStorage.removeItem(STORAGE_KEY);
      } catch { /* ignore */ }
    }
    // Check if owner is logged in
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setIsOwner(true);
          // Force sign out any Google user session when owner is logged in
          localStorage.removeItem(STORAGE_KEY);
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, []);

  const isOwnProfile = (currentUser?.userId === userId) || (isOwner && userId === 'owner');

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

  const loadActivity = useCallback(async () => {
    if (!userId) return;
    setActivityLoading(true);
    try {
      const r = await fetch(`/api/journal?action=user-activity&userId=${encodeURIComponent(userId)}`);
      const d = await r.json();
      if (d.ok) setActivity(d.activity || []);
    } catch { /* ignore */ }
    finally { setActivityLoading(false); }
  }, [userId]);

  useEffect(() => { loadPage(1); }, [loadPage]);
  useEffect(() => { loadActivity(); }, [loadActivity]);

  const startEdit = () => {
    setEditTitle(userInfo?.profileTitle || '');
    setEditBio(userInfo?.bio || '');
    setEditDesc(userInfo?.description || '');
    setEditLinks(userInfo?.socialLinks ? [...userInfo.socialLinks] : []);
    setSaveError('');
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!currentUser && !isOwner) return;
    setSaving(true);
    setSaveError('');
    try {
      const body: Record<string, unknown> = { profileTitle: editTitle, bio: editBio, description: editDesc, socialLinks: editLinks };
      if (!isOwner && currentUser) body.credential = currentUser.credential;
      const r = await fetch('/api/journal?action=user-profile-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.ok) { setSaveError(d.message || 'Save failed'); return; }
      setUserInfo(prev => prev ? { ...prev, profileTitle: editTitle, bio: editBio, description: editDesc, socialLinks: editLinks } : prev);
      setEditing(false);
    } catch { setSaveError('Network error'); }
    finally { setSaving(false); }
  };

  const addLink = () => setEditLinks(prev => [...prev, { platform: 'custom', url: '', label: '' }]);
  const removeLink = (i: number) => setEditLinks(prev => prev.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: keyof SocialLink, val: string) =>
    setEditLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

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

  const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder:text-zinc-600';

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title={`${userInfo.profileTitle || userInfo.userName}'s Profile | Deep Dey Journal`}
        description={userInfo.bio || userInfo.description || `${userInfo.userName} has commented ${userInfo.totalComments} time${userInfo.totalComments !== 1 ? 's' : ''} on journal posts.`}
        route={`/user/${userId}`}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={userId === 'owner' ? 'relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-400 via-amber-500/60 to-amber-900/40 shadow-[0_0_40px_rgba(245,158,11,0.22)]' : 'bg-zinc-900/40 border border-zinc-800 rounded-2xl'}>
          <div className={userId === 'owner' ? 'relative rounded-[calc(1rem-1px)] bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 space-y-4' : 'p-6 space-y-4'}>
            {userId === 'owner' && (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.11)_0%,_transparent_65%)] pointer-events-none rounded-[calc(1rem-1px)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.06)_0%,_transparent_60%)] pointer-events-none rounded-[calc(1rem-1px)]" />
              </>
            )}
          <div className="flex items-start gap-4">
            {(userId === 'owner') ? (
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-md scale-125" />
                <img src="/assets/images/myphoto.png" alt="Deep Dey" className="relative w-16 h-16 rounded-full border-2 border-amber-400/70 ring-4 ring-amber-500/20 object-cover shadow-[0_0_20px_rgba(245,158,11,0.35)]" />
              </div>
            ) : userInfo.userPic ? (
              <img src={userInfo.userPic} alt={userInfo.userName} className="w-16 h-16 rounded-full border-2 border-zinc-700 object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shrink-0">
                <User size={28} className="text-zinc-500" />
              </div>
            )}
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className={`font-black text-2xl tracking-tight ${userId === 'owner' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-white'}`}>{userInfo.userName}</h1>
                  {userId === 'owner' && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/40 font-mono uppercase tracking-wider mt-1">👑 Owner</span>
                  )}
                  {userInfo.profileTitle && <p className="text-amber-500/80 text-sm font-bold mt-0.5">{userInfo.profileTitle}</p>}
                </div>
                {isOwnProfile && !editing && (
                  <button onClick={startEdit} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition-colors">
                    <Edit3 size={12} /> Edit
                  </button>
                )}
              </div>
              {userInfo.description && <p className="text-zinc-500 text-xs mt-1">{userInfo.description}</p>}
              {userInfo.bio && <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{userInfo.bio}</p>}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-zinc-500 text-xs"><MessageSquare size={12} /> {userInfo.totalComments} comment{userInfo.totalComments !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5 text-zinc-500 text-xs"><Calendar size={12} /> Joined {timeAgo(userInfo.firstCommentAt)}</span>
              </div>
            </div>
          </div>

          {/* Social links display */}
          {!editing && userInfo.socialLinks && userInfo.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {userInfo.socialLinks.filter(l => l.url).map((link, i) => (
                <Fragment key={i}><SocialLinkButton link={link} /></Fragment>
              ))}
            </div>
          )}

          {/* Google sign-in for own profile edit */}
          {!currentUser && !isOwner && userId !== 'owner' && (
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-zinc-600 text-xs mb-2">This your profile? Sign in to edit it.</p>
              <GoogleLogin
                onSuccess={(cr) => {
                  if (!cr.credential) return;
                  const payload = decodeJwt(cr.credential);
                  if (!payload) return;
                  const u: GoogleUser = { userId: String(payload.sub || ''), name: String(payload.name || payload.given_name || 'Anonymous'), picture: String(payload.picture || ''), credential: cr.credential, exp: Number(payload.exp || 0) };
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                  setCurrentUser(u);
                }}
                onError={() => {}}
                theme="filled_black" shape="pill" size="small" text="signin_with"
              />
            </div>
          )}
          </div>
        </motion.div>

        {/* Edit form */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-sm flex items-center gap-2"><Edit3 size={14} className="text-amber-500" /> Edit Profile</h2>
                <button onClick={() => setEditing(false)} className="text-zinc-500 hover:text-zinc-300"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Title / Tagline</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={80} placeholder="e.g. Developer & Writer" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Short Description</label>
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={200} placeholder="One-line description" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Bio</label>
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={500} rows={3} placeholder="Tell something about yourself..." className={`${inputCls} resize-none`} />
                  <p className="text-zinc-700 text-[10px] mt-0.5">{editBio.length}/500</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Social Links</label>
                  {editLinks.length < 10 && (
                    <button onClick={addLink} className="flex items-center gap-1 text-amber-500 hover:text-amber-400 text-xs font-bold transition-colors">
                      <Plus size={12} /> Add Link
                    </button>
                  )}
                </div>
                {editLinks.map((link, i) => (
                  <div key={i} className="grid grid-cols-[110px_1fr_1fr_28px] gap-2 items-center">
                    <select value={link.platform} onChange={e => updateLink(i, 'platform', e.target.value)} className={`${inputCls} text-xs`}>
                      {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                    <input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="URL" className={`${inputCls} text-xs`} />
                    <input value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} placeholder="Label (optional)" className={`${inputCls} text-xs`} />
                    <button onClick={() => removeLink(i)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
              {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-bold transition-colors">Cancel</button>
                <button onClick={saveProfile} disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contribution graph */}
        {activityLoading ? (
          <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-amber-500/40" /></div>
        ) : (
          <ContributionGraph activity={activity} />
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900/40 border border-zinc-800 rounded-xl p-1">
          {([
            { key: 'overview', label: 'Overview' },
            { key: 'comments', label: `Comments (${pagination?.total ?? userInfo.totalComments})` },
            { key: 'activity', label: 'Activity Log' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.key ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-1">
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Total Comments</p>
                <p className="text-white font-black text-2xl">{userInfo.totalComments}</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-1">
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Active Days</p>
                <p className="text-white font-black text-2xl">{new Set(activity.map(a => a.day)).size}</p>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-1">
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Member Since</p>
              <p className="text-white font-bold text-sm">
                {userInfo.firstCommentAt ? new Date(userInfo.firstCommentAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab: Comments */}
        {tab === 'comments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {pageLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No comments yet.</p>
              </div>
            ) : (
              <>
                {comments.map((c, idx) => (
                  <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-2 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {c.journalInfo && (
                          <Link to={`/journal/view/${c.journalInfo.slug}`} className="text-amber-500 text-xs font-bold hover:text-amber-400 transition-colors flex items-center gap-1 mb-1.5 truncate">
                            <ExternalLink size={10} /> {c.journalInfo.title}
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
                      <Link to={`/journal/comment/${c._id}`} className="text-zinc-600 hover:text-amber-500 text-[10px] font-mono transition-colors flex items-center gap-1">
                        <ExternalLink size={10} /> Permalink
                      </Link>
                    </div>
                  </motion.div>
                ))}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button onClick={() => loadPage(page - 1)} disabled={page <= 1} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors">
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="text-zinc-500 text-sm">Page {page} / {pagination.totalPages}</span>
                    <button onClick={() => loadPage(page + 1)} disabled={page >= pagination.totalPages} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 text-sm font-bold transition-colors">
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Tab: Activity */}
        {tab === 'activity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {activityLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
            ) : activity.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <Activity size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No activity yet.</p>
              </div>
            ) : (
              <>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">{activity.length} active day{activity.length !== 1 ? 's' : ''} · all time</p>
                <div className="max-h-96 overflow-y-auto space-y-1 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
                  {[...activity].reverse().map(a => (
                    <div key={a.day} className="flex items-center justify-between py-1 border-b border-zinc-800/50 last:border-0">
                      <span className="text-zinc-400 text-xs font-mono">{a.day}</span>
                      <span className="text-amber-500 text-xs font-bold">{a.count} comment{a.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
