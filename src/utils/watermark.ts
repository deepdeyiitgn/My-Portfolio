export type WatermarkStatus = 'pending' | 'approved' | 'declined';

export const DEFAULT_WATERMARK_SCRIPT_URL = 'https://deepdey.vercel.app/assets/js/footer-extras.js';

export function getWatermarkStatusBadgeClass(status?: WatermarkStatus) {
  if (status === 'approved') return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30';
  if (status === 'declined') return 'bg-red-500/10 text-red-300 border border-red-500/30';
  return 'bg-amber-500/10 text-amber-300 border border-amber-500/30';
}

export function getGoogleFaviconUrl(value?: string, size = 32) {
  const raw = String(value || '').trim();
  if (!raw) return `https://www.google.com/s2/favicons`;
  let domainUrl = raw;
  try {
    domainUrl = new URL(raw).origin;
  } catch {
    try {
      domainUrl = new URL(`https://${raw}`).origin;
    } catch {
      domainUrl = raw;
    }
  }
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(domainUrl)}`;
}
