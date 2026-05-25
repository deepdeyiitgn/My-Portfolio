import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import { usePushNotifications } from '../hooks/usePushNotifications';
import type { NotificationItem } from '../types/community';

export default function Notification() {
  const { identity } = useGoogleIdentity();
  const { supported, permission, subscribed, subscribe, unsubscribe } = usePushNotifications(identity);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!identity?.credential) return;
    setLoading(true);
    try {
      const response = await fetch('/api/journal?action=notification-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: identity.credential }),
      });
      const payload = await response.json().catch(() => ({}));
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.credential]);

  const markRead = async (id: string) => {
    if (!identity?.credential) return;
    await fetch('/api/journal?action=notification-mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: identity.credential, id }),
    });
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <SEO
        title="Notifications | Deep Dey"
        description="Private notification hub for your community activity and admin alerts."
        route="/notification"
      />
      <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Notification Hub</h2>
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Personal Alerts</h1>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
        <p className="text-zinc-300 text-sm">Browser push status: {supported ? `${permission}${subscribed ? ' • subscribed' : ''}` : 'unsupported'}</p>
        <div className="flex gap-2">
          <button onClick={() => subscribe()} className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black">Enable Push</button>
          <button onClick={() => unsubscribe()} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs">Disable Push</button>
        </div>
      </section>

      {loading ? <p className="text-zinc-500">Loading notifications...</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item._id} className={`rounded-2xl border p-4 space-y-2 ${item.read ? 'border-zinc-800 bg-zinc-900/20' : 'border-amber-500/40 bg-amber-500/5'}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-white font-semibold">{item.title}</h3>
              <span className="text-zinc-500 text-xs">{new Date(item.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-zinc-300 text-sm">{item.message}</p>
            <div className="flex gap-2">
              {!item.read && <button onClick={() => markRead(item._id)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs">Mark Read</button>}
              {item.link && <a href={item.link} className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold">Open</a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
