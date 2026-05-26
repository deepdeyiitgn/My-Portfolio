/**
 * usePageAnalytics – batched page-view tracker.
 *
 * Behaviour:
 *  1. On every call to `trackPageView(path)` a small event object is appended to a
 *     localStorage buffer keyed "dd_pa_buf".
 *  2. The buffer is flushed (and cleared) via `navigator.sendBeacon` when:
 *     - The `visibilitychange` event fires (tab hidden / closed).
 *     - The buffer accumulates ≥ 20 events.
 *     - The user has been inactive for ≥ 5 minutes.
 *  3. Regular background flush (single `fetch`) also fires if the page stays visible.
 *  4. The component must call `registerListeners()` once after mount and
 *     `unregisterListeners()` before unmount / on SPA navigation cleanup.
 */

const BUFFER_KEY = 'dd_pa_buf';
const MAX_BUFFER_EVENTS = 20;
const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
const INGEST_URL = '/api/journal?action=analytics-bundle';

interface PageViewEvent {
  path: string;
  pathWithQuery?: string;
  ts: number;
  timeSpentMs?: number;
  referrer?: string;
  utm?: Record<string, string>;
  query?: string;
}

function readBuffer(): PageViewEvent[] {
  try {
    return JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeBuffer(events: PageViewEvent[]) {
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(events));
  } catch {
    // Quota exceeded or private browsing with storage disabled — discard silently.
  }
}

function clearBuffer() {
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch { /* noop */ }
}

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem('dd_comment_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId || parsed?.sub || null;
  } catch {
    return null;
  }
}

function flushViaBeacon(events: PageViewEvent[]) {
  if (events.length === 0) return;
  const userId = getUserId();
  const payload = JSON.stringify({ events, userId });
  const blob = new Blob([payload], { type: 'application/json' });
  try {
    const sent = navigator.sendBeacon(INGEST_URL, blob);
    if (sent) clearBuffer();
  } catch { /* sendBeacon not available */ }
}

async function flushViaFetch(events: PageViewEvent[]) {
  if (events.length === 0) return;
  const userId = getUserId();
  try {
    const response = await fetch(INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, userId }),
      keepalive: true,
    });
    if (response.ok) clearBuffer();
  } catch { /* network error — keep buffer for next flush */ }
}

// Module-level singleton state so listeners are registered only once.
let visibilityHandler: (() => void) | null = null;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let backgroundFlushInterval: ReturnType<typeof setInterval> | null = null;
let currentPageEntry: { path: string; startTs: number; eventTs: number } | null = null;

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const events = readBuffer();
    flushViaBeacon(events);
  }, INACTIVITY_MS);
}

export function trackPageView(path: string) {
  // Close out previous page entry with time-spent calculation.
  if (currentPageEntry) {
    const buf = readBuffer();
    const idx = buf.findIndex((e) => e.path === currentPageEntry.path && e.ts === currentPageEntry.eventTs);
    if (idx >= 0) {
      buf[idx].timeSpentMs = Date.now() - currentPageEntry.startTs;
      writeBuffer(buf);
    }
  }

  const search = typeof window !== 'undefined' ? window.location.search || '' : '';
  const utm: Record<string, string> = {};
  if (search) {
    const params = new URLSearchParams(search);
    for (const [key, value] of params.entries()) {
      if (!key) continue;
      if (key.toLowerCase().startsWith('utm_')) {
        utm[key] = value;
      }
    }
  }

  const event: PageViewEvent = {
    path,
    pathWithQuery: `${path}${search}`,
    ts: Date.now(),
    referrer: document.referrer || undefined,
    utm: Object.keys(utm).length ? utm : undefined,
    query: search || undefined,
  };

  const buf = readBuffer();
  buf.push(event);
  writeBuffer(buf);
  currentPageEntry = { path, startTs: Date.now(), eventTs: event.ts };

  // Flush eagerly if buffer is large enough.
  if (buf.length >= MAX_BUFFER_EVENTS) {
    flushViaFetch(buf);
    currentPageEntry = { path, startTs: Date.now(), eventTs: event.ts };
  }

  resetInactivityTimer();
}

export function registerAnalyticsListeners() {
  if (visibilityHandler) return; // Already registered.

  visibilityHandler = () => {
    if (document.visibilityState === 'hidden') {
      const events = readBuffer();
      flushViaBeacon(events);
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  // Periodic background flush every 2 minutes while the tab is visible.
  backgroundFlushInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      const events = readBuffer();
      if (events.length > 0) flushViaFetch(events);
    }
  }, 2 * 60 * 1000);

  resetInactivityTimer();
}

export function unregisterAnalyticsListeners() {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (backgroundFlushInterval) {
    clearInterval(backgroundFlushInterval);
    backgroundFlushInterval = null;
  }
  currentPageEntry = null;
}
