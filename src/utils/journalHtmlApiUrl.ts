export function buildJournalHtmlApiUrl(ref: string): string {
  const token = String(ref || '').trim();
  if (!token) return '/api/journal?action=html-file';
  const isObjectId = /^[a-f\d]{24}$/i.test(token);
  return isObjectId
    ? `/api/journal?action=html-file&id=${encodeURIComponent(token)}`
    : `/api/journal?action=html-file&slug=${encodeURIComponent(token)}`;
}
