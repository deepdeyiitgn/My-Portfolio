import { useCallback, useEffect, useState } from 'react';

export interface GoogleUser {
  userId: string;
  name: string;
  picture: string;
  credential: string;
  exp: number;
}

export const COMMUNITY_AUTH_STORAGE_KEY = 'dd_comment_user';
const COMMUNITY_AUTH_EVENT = 'dd-community-auth-changed';

export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function getStoredGoogleUser(): GoogleUser | null {
  const stored = localStorage.getItem(COMMUNITY_AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed: GoogleUser = JSON.parse(stored);
    if (parsed.exp * 1000 > Date.now()) return parsed;
  } catch {
    // ignore parse failure and clear below
  }

  localStorage.removeItem(COMMUNITY_AUTH_STORAGE_KEY);
  return null;
}

function emitAuthChange() {
  window.dispatchEvent(new Event(COMMUNITY_AUTH_EVENT));
}

export function persistGoogleUser(user: GoogleUser) {
  localStorage.setItem(COMMUNITY_AUTH_STORAGE_KEY, JSON.stringify(user));
  emitAuthChange();
}

export function clearGoogleUser() {
  localStorage.removeItem(COMMUNITY_AUTH_STORAGE_KEY);
  emitAuthChange();
}

export function createGoogleUserFromCredential(credential: string): GoogleUser | null {
  const payload = decodeJwt(credential);
  if (!payload) return null;

  return {
    userId: String(payload.sub || ''),
    name: String(payload.name || payload.given_name || 'Anonymous'),
    picture: String(payload.picture || ''),
    credential,
    exp: Number(payload.exp || 0),
  };
}

export function ownerAvatarSrc(userId?: string | null, fallback?: string | null) {
  if (userId === 'owner') return '/assets/images/myphoto.png';
  return fallback || '';
}

export function useCommunityAuth() {
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    const storedUser = getStoredGoogleUser();
    setCurrentUser(storedUser);

    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      const ownerLoggedIn = Boolean(data?.authenticated);
      setIsOwner(ownerLoggedIn);

      if (ownerLoggedIn) {
        localStorage.removeItem(COMMUNITY_AUTH_STORAGE_KEY);
        setCurrentUser(null);
      }
    } catch {
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === COMMUNITY_AUTH_STORAGE_KEY) refreshAuth();
    };
    const handleFocus = () => { refreshAuth(); };
    const handleAuthEvent = () => { refreshAuth(); };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    window.addEventListener(COMMUNITY_AUTH_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener(COMMUNITY_AUTH_EVENT, handleAuthEvent);
    };
  }, [refreshAuth]);

  const signOutGoogle = useCallback(() => {
    clearGoogleUser();
    setCurrentUser(null);
    setIsOwner(false);
  }, []);

  const signOutOwner = useCallback(async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    emitAuthChange();
    setIsOwner(false);
    setCurrentUser(getStoredGoogleUser());
  }, []);

  return {
    currentUser,
    isOwner,
    loading,
    refreshAuth,
    setGoogleUser(user: GoogleUser) {
      persistGoogleUser(user);
      setCurrentUser(user);
      setIsOwner(false);
    },
    signOutGoogle,
    signOutOwner,
  };
}
