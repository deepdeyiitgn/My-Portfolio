import { useEffect, useMemo, useState } from 'react';

export const GOOGLE_USER_STORAGE_KEY = 'dd_comment_user';

export interface GoogleIdentity {
  userId: string;
  name: string;
  email?: string;
  picture?: string;
  credential: string;
  exp?: number;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function isExpired(exp?: number) {
  if (!exp || !Number.isFinite(exp)) return false;
  return exp * 1000 <= Date.now();
}

export function useGoogleIdentity() {
  const [identity, setIdentity] = useState<GoogleIdentity | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(GOOGLE_USER_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as GoogleIdentity;
      if (!parsed?.credential || isExpired(parsed.exp)) {
        localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
        return;
      }
      setIdentity(parsed);
    } catch {
      localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
    }
  }, []);

  const refreshFromCredential = (credential: string) => {
    const payload = decodeJwt(credential);
    const nextIdentity: GoogleIdentity = {
      userId: String(payload?.sub || '').trim(),
      name: String(payload?.name || payload?.given_name || '').trim() || 'Google User',
      email: String(payload?.email || '').trim(),
      picture: String(payload?.picture || '').trim(),
      credential,
      exp: Number(payload?.exp || 0) || undefined,
    };
    if (!nextIdentity.userId) return null;
    setIdentity(nextIdentity);
    localStorage.setItem(GOOGLE_USER_STORAGE_KEY, JSON.stringify(nextIdentity));
    return nextIdentity;
  };

  const clearIdentity = () => {
    setIdentity(null);
    localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
  };

  return useMemo(() => ({
    identity,
    isAuthenticated: Boolean(identity?.credential && !isExpired(identity.exp)),
    refreshFromCredential,
    clearIdentity,
  }), [identity]);
}
