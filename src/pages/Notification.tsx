import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import { usePushNotifications } from '../hooks/usePushNotifications';
import type { NotificationItem } from '../types/community';

export default function Notification() {
  const { identity } = useGoogleIdentity();
  const [ownerAuthed, setOwnerAuthed] = useState(false);
  const { supported, permission, subscribed, subscribe, unsubscribe } = usePushNotifications(identity);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [targetUserId, setTargetUserId] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushLink, setPushLink] = useState('/notification');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/auth')
      .then((response) => response.json())
      .then((payload) => setOwnerAuthed(Boolean(payload?.authenticated)))
      .catch(() => setOwnerAuthed(false));
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = ownerAuthed
        ? await fetch(`/api/journal?action=notification-admin-feed&page=${adminPage}&limit=20`)
        : await fetch('/api/journal?action=notification-feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: identity?.credential }),
        });
      const payload = await response.json().catch(() => ({}));
      setItems(Array.isArray(payload.items) ? payload.items : []);
      if (ownerAuthed) setAdminTotalPages(Math.max(1, Number(payload.totalPages || 1)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ownerAuthed && !identity?.credential) return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.credential, ownerAuthed, adminPage]);

  const markRead = async (id: string) => {
    if (ownerAuthed) return;
    if (!identity?.credential) return;
    await fetch('/api/journal?action=notification-mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: identity.credential, id }),
    });
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
  };

  const sendNotification = async () => {
    if (!ownerAuthed || !targetUserId.trim() || !pushTitle.trim() || !pushMessage.trim()) return;
    setSending(true);
    try {
      const response = await fetch('/api/journal?action=push-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId.trim(),
          title: pushTitle.trim(),
          message: pushMessage.trim(),
          link: pushLink.trim() || '/notification',
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || 'Failed to send notification');
      setPushTitle('');
      setPushMessage('');
      fetchNotifications();
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error instanceof Error ? error.message : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <SEO
        title="Notifications | Deep Dey"
        description="Private notification hub for your community activity and admin alerts."
        route="/notification"
      />
      <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Notification Hub</h2>
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">{ownerAuthed ? 'Owner Notification Console' : 'Personal Alerts'}</h1>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
        <p className="text-zinc-300 text-sm">Browser push status: {supported ? `${permission}${subscribed ? ' • subscribed' : ''}` : 'unsupported'}</p>
        <div className="flex gap-2">
          <button onClick={() => subscribe()} className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black">Enable Push</button>
          <button onClick={() => unsubscribe()} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs">Disable Push</button>
        </div>
      </section>

      {ownerAuthed && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-mono">Send User-Specific Notification</p>
          <div className="grid md:grid-cols-2 gap-2">
            <input value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} placeholder="Target userId" className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
            <input value={pushLink} onChange={(event) => setPushLink(event.target.value)} placeholder="Link (e.g. /updates)" className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
          </div>
          <input value={pushTitle} onChange={(event) => setPushTitle(event.target.value)} placeholder="Title" className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
          <textarea value={pushMessage} onChange={(event) => setPushMessage(event.target.value)} placeholder="Message" className="w-full min-h-20 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-200 text-sm" />
          <button onClick={sendNotification} disabled={sending || !targetUserId.trim() || !pushTitle.trim() || !pushMessage.trim()} className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black disabled:opacity-50">
            {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </section>
      )}

      {loading ? <p className="text-zinc-500">Loading notifications...</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item._id} className={`rounded-2xl border p-4 space-y-2 ${item.read ? 'border-zinc-800 bg-zinc-900/20' : 'border-amber-500/40 bg-amber-500/5'}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-white font-semibold">{item.title}</h3>
              <span className="text-zinc-500 text-xs">{new Date(item.createdAt).toLocaleString('en-IN')}</span>
            </div>
            {ownerAuthed && (
              <div className="text-[11px] text-zinc-400">
                User: <a href={item.userProfileLink || `/user/${encodeURIComponent(item.userId)}`} className="text-amber-400 underline">{item.userName || item.userId}</a>
              </div>
            )}
            <p className="text-zinc-300 text-sm">{item.message}</p>
            <div className="flex gap-2">
              {!item.read && <button onClick={() => markRead(item._id)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs">Mark Read</button>}
              {item.link && <a href={item.link} className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold">Open</a>}
            </div>
          </article>
        ))}
      </div>
      {ownerAuthed && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setAdminPage((prev) => Math.max(1, prev - 1))} disabled={adminPage <= 1} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-40">Prev</button>
          <span className="text-zinc-500 text-sm">Page {adminPage} / {adminTotalPages}</span>
          <button onClick={() => setAdminPage((prev) => Math.min(adminTotalPages, prev + 1))} disabled={adminPage >= adminTotalPages} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
