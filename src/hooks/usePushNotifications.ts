import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GoogleIdentity } from './useGoogleIdentity';

function base64UrlToUint8Array(base64UrlString: string) {
  const padding = '='.repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function usePushNotifications(identity: GoogleIdentity | null) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const ok = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const ensurePermission = useCallback(async () => {
    if (!supported || typeof Notification === 'undefined') return 'denied' as NotificationPermission;
    const next = await Notification.requestPermission();
    setPermission(next);
    return next;
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!identity?.credential || !supported) return { ok: false, message: 'Unsupported' };
    const permissionValue = await ensurePermission();
    if (permissionValue !== 'granted') return { ok: false, message: 'Permission denied' };

    const registration = await navigator.serviceWorker.register('/service-worker.js');
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
    if (!vapidPublicKey) return { ok: false, message: 'Missing VAPID key' };

    let sub = await registration.pushManager.getSubscription();
    if (!sub) {
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
      });
    }

    const response = await fetch('/api/journal?action=push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: identity.credential, subscription: sub.toJSON() }),
    });
    const payload = await response.json().catch(() => ({}));
    setSubscribed(Boolean(payload?.ok));
    return payload;
  }, [ensurePermission, identity?.credential, supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported || !identity?.credential) return { ok: false };
    const registration = await navigator.serviceWorker.getRegistration('/service-worker.js');
    const sub = await registration?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    const response = await fetch('/api/journal?action=push-unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: identity.credential, endpoint: sub?.endpoint || '' }),
    });
    const payload = await response.json().catch(() => ({}));
    setSubscribed(false);
    return payload;
  }, [identity?.credential, supported]);

  return useMemo(() => ({
    supported,
    permission,
    subscribed,
    ensurePermission,
    subscribe,
    unsubscribe,
  }), [ensurePermission, permission, subscribe, subscribed, supported, unsubscribe]);
}
