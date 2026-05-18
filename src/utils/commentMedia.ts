export function getSafeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function extractKlipyMediaUrl(text: string): string | null {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;
  if (/\s/.test(trimmed)) return null;
  const safeUrl = getSafeHttpUrl(trimmed);
  if (!safeUrl) return null;
  try {
    const parsed = new URL(safeUrl);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('klipy')) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
