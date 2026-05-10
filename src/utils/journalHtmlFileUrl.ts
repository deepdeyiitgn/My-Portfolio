export function buildJournalHtmlFileUrl(ref: string): string {
  const token = String(ref || '').trim();
  if (!token) return '';
  const isObjectId = /^[a-f\d]{24}$/i.test(token);
  return isObjectId
    ? `/api/journal-html?id=${encodeURIComponent(token)}`
    : `/api/journal-html?slug=${encodeURIComponent(token)}`;
}
