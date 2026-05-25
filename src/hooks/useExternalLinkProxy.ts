import { useCallback } from 'react';

const INTERNAL_HOSTS = new Set([
  'deepdey.vercel.app',
  'qlynk.vercel.app',
  'localhost',
  '127.0.0.1',
]);

export function isExternalUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const currentHost = window.location.hostname.toLowerCase();
    const host = parsed.hostname.toLowerCase();
    if (host === currentHost) return false;
    if (INTERNAL_HOSTS.has(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export function useExternalLinkProxy() {
  const getCredential = () => {
    try {
      const raw = localStorage.getItem('dd_comment_user');
      if (!raw) return '';
      const parsed = JSON.parse(raw) as { credential?: string };
      return String(parsed?.credential || '').trim();
    } catch {
      return '';
    }
  };

  const buildProxyRedirectUrl = useCallback((targetUrl: string, sourcePage: string) => {
    const params = new URLSearchParams({
      action: 'proxy-redirect',
      target: targetUrl,
      sourcePage,
    });
    const credential = getCredential();
    if (credential) params.set('credential', credential);
    return `/api/journal?${params.toString()}`;
  }, []);

  const buildProxyFetchUrl = useCallback((targetUrl: string, media: 'image' | 'audio' | 'og' = 'image') => {
    const params = new URLSearchParams({
      action: 'proxy-fetch',
      target: targetUrl,
      media,
    });
    return `/api/journal?${params.toString()}`;
  }, []);

  const openExternal = useCallback((targetUrl: string, sourcePage: string) => {
    if (!isExternalUrl(targetUrl)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const proxyUrl = buildProxyRedirectUrl(targetUrl, sourcePage);
    window.open(proxyUrl, '_blank', 'noopener,noreferrer');
  }, [buildProxyRedirectUrl]);

  return {
    isExternalUrl,
    buildProxyRedirectUrl,
    buildProxyFetchUrl,
    openExternal,
  };
}
