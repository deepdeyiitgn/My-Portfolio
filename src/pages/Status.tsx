import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Clock, Server, Database, Cpu, HardDrive, MemoryStick,
  Globe, Wifi, ChevronDown, ChevronUp, Zap, Radio, ExternalLink,
} from 'lucide-react';
import SEO from '../components/SEO';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EndpointDef {
  id: string;
  path: string;
  probePath?: string;
  method: 'GET' | 'POST';
  label: string;
  description: string;
  heavy: boolean; // true = 5-min refresh; false = 60-sec refresh
}

interface EndpointResult {
  latencyMs: number | null;
  status: 'operational' | 'degraded' | 'down' | 'pending';
  httpStatus: number | null;
  lastChecked: number | null;
}

interface ServerHealth {
  ok: boolean;
  timestamp: number;
  uptime: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  osType: string;
  osRelease: string;
  hostname: string;
  serverRegion: string;
  diskInfo: { total: number; free: number; available: number } | null;
  totalMemory: number;
  freeMemory: number;
  cpus: { model: string; speedMHz: number; times: { user: number; nice: number; sys: number; idle: number; irq: number } }[];
  cpuCount: number;
  processMemory: { rss: number; heapUsed: number; heapTotal: number; external: number };
  dbPingMs: number;
  loadAverage: number[];
  globalUsed?: number;
  globalLimit?: number;
  ipUsed?: number;
  ipLimit?: number;
}

interface ThirdPartyProviderStatus {
  id: string;
  name: string;
  mainEndpoint: string;
  statusPageUrl?: string | null;
  status: EndpointResult['status'];
  indicator: string;
  description: string;
  providerMessage?: string;
  httpStatus: number | null;
  latencyMs: number | null;
  lastUpdated: string | null;
  hasOngoingIncident?: boolean;
  hasOngoingMaintenance?: boolean;
  latestIncident?: { title?: string; message?: string; severity?: string; updatedAt?: string | null; moreInfoUrl?: string | null } | null;
  latestMaintenance?: { title?: string; message?: string; severity?: string; updatedAt?: string | null; moreInfoUrl?: string | null } | null;
  serverHost?: string | null;
  serverIp?: string | null;
  hostingProvider?: string | null;
  ownHostingProvider?: string | null;
  isLikelyOwnInfrastructure?: boolean;
}

type StatusMonitorMode = 'live' | 'stop' | 'maintenance' | 'hiatus';

// ─── Constants ───────────────────────────────────────────────────────────────

const ENDPOINTS: EndpointDef[] = [
  { id: 'auth-session',      path: '/api/auth',                            method: 'GET',  label: 'Auth Session',       description: 'Dashboard session validation',            heavy: false },
  { id: 'auth-google-login', path: '/api/auth?action=google-url&intent=login', method: 'GET', label: 'Google Sign-In',  description: 'Google OAuth login URL generator',        heavy: false },
  { id: 'auth-google-signup', path: '/api/auth?action=google-url&intent=signup', method: 'GET', label: 'Google Sign-Up', description: 'Google OAuth signup URL generator',       heavy: false },
  { id: 'journal-list',     path: '/api/journal?page=1&limit=1',       method: 'GET',  label: 'Journal List',        description: 'Paginated journal entries',              heavy: false },
  { id: 'journal-render-page', path: '/api/journal?action=render-page&path=/status', method: 'GET', label: 'Rendered Page', description: 'Vercel serverless rendered page metadata pipeline', heavy: true  },
  { id: 'journal-top',      path: '/api/journal?action=top-journals&limit=1', method: 'GET', label: 'Top Journals',     description: 'Homepage journal spotlight query',        heavy: false },
  { id: 'journal-search',   path: '/api/journal?action=search&q=',      method: 'GET',  label: 'Search Engine',       description: 'Global search API (empty query probe)',   heavy: false },
  { id: 'journal-count',    path: '/api/journal?action=comment-count&journalIds=sample', method: 'GET', label: 'Comment Count', description: 'Bulk journal comment counts',          heavy: false },
  { id: 'journal-users',    path: '/api/journal?action=all-users&page=1', method: 'GET', label: 'All Users',          description: 'Public contributors listing API',         heavy: false },
  { id: 'journal-profile',  path: '/api/journal?action=user-profile&userId=owner&page=1', method: 'GET', label: 'User Profile', description: 'Public user profile data API',       heavy: false },
  { id: 'journal-activity', path: '/api/journal?action=user-activity&userId=owner', method: 'GET', label: 'User Activity', description: 'Contribution heatmap activity API',   heavy: false },
  { id: 'journal-status',   path: '/api/journal?action=status',        method: 'GET',  label: 'Live Status',         description: 'Current personal status widget',         heavy: false },
  { id: 'journal-health',   path: '/api/journal?action=health',        method: 'GET',  label: 'Health Check',        description: 'Server & database health probe',         heavy: false },
  { id: 'journal-dbstats',  path: '/api/journal?action=dbstats',       method: 'GET',  label: 'MongoDB Stats',       description: 'Authenticated MongoDB storage stats endpoint', heavy: true  },
  { id: 'categories',       path: '/api/categories',                   method: 'GET',  label: 'Categories',          description: 'Journal category list',                  heavy: false },
  { id: 'feedback-categories', path: '/api/categories?type=feedback',  method: 'GET',  label: 'Feedback Categories', description: 'Feedback module category taxonomy API',   heavy: false },
  { id: 'projects',         path: '/api/projects',                     method: 'GET',  label: 'Projects',            description: 'Portfolio project index',                heavy: false },
  { id: 'timeline',         path: '/api/timeline',                     method: 'GET',  label: 'Timeline',            description: 'Journey timeline milestones',             heavy: false },
  { id: 'links',            path: '/api/links',                        method: 'GET',  label: 'Links',               description: 'Curated link collection',                heavy: false },
  { id: 'faqs',             path: '/api/faqs',                         method: 'GET',  label: 'FAQs',                description: 'Frequently asked questions',             heavy: false },
  { id: 'live',             path: '/api/live',                         method: 'GET',  label: 'YouTube Live',        description: 'Live stream & recent videos feed',       heavy: true  },
  { id: 'contact',          path: '/api/contact',                      method: 'GET',  label: 'Contact Engine',      description: 'Contact form handler',                   heavy: false },
  { id: 'contact-submit',   path: '/api/contact',                      method: 'POST', label: 'Contact Submit',      description: 'Contact intake submission endpoint',      heavy: false },
  { id: 'sitemap',          path: '/api/sitemap',                      method: 'GET',  label: 'Sitemap',             description: 'XML sitemap generator',                  heavy: true  },
  { id: 'upload-image',     path: '/api/upload-image',                 method: 'POST', label: 'Upload Proxy',        description: 'Dashboard media upload proxy route',      heavy: true  },
  { id: 'third-party-status', path: '/api/journal?action=third-party-status', probePath: '/api/journal?action=health', method: 'GET', label: 'Third-Party Status Aggregator', description: 'Aggregated external provider status monitoring (ping measured from home server health)', heavy: true  },
];

const LIGHT_INTERVAL_MS = 60_000;   // 60 s for light endpoints
const HEAVY_INTERVAL_MS = 300_000;  // 5 min for heavy endpoints
const HEALTH_INTERVAL_MS = 300_000; // 5 min for server health

// ─── Helpers ─────────────────────────────────────────────────────────────────

function latencyStatus(ms: number | null): EndpointResult['status'] {
  if (ms === null) return 'down';
  if (ms < 600) return 'operational';
  if (ms < 2000) return 'degraded';
  return 'down';
}

function fmtBytes(b: number): string {
  if (!b || b === 0) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(2)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function fmtUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtSince(ts: number | null): string {
  if (!ts) return '—';
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

function fmtDateTime(ts: string | null): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function normalizeMonitorMode(value: unknown): StatusMonitorMode {
  const mode = String(value || '').toLowerCase();
  if (mode === 'stop' || mode === 'maintenance' || mode === 'hiatus') return mode;
  return 'live';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EndpointResult['status'] }) {
  const cfg = {
    operational: { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', label: 'Operational' },
    degraded:    { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',       dot: 'bg-amber-400',   label: 'Degraded'    },
    down:        { cls: 'bg-red-500/20 text-red-400 border-red-500/30',             dot: 'bg-red-400',     label: 'Down'        },
    pending:     { cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-700',             dot: 'bg-zinc-500',    label: 'Checking…'   },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
      {method}
    </span>
  );
}

function LatencyBar({ ms }: { ms: number | null }) {
  if (ms === null) return <span className="text-zinc-600 text-xs font-mono">—</span>;
  const color = ms < 300 ? 'text-emerald-400' : ms < 800 ? 'text-amber-400' : 'text-red-400';
  return <span className={`text-sm font-black font-mono ${color}`}>{ms}<span className="text-[10px] font-normal text-zinc-600 ml-0.5">ms</span></span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Status() {
  const initResults = (): Record<string, EndpointResult> =>
    Object.fromEntries(ENDPOINTS.map(e => [e.id, { latencyMs: null, status: 'pending', httpStatus: null, lastChecked: null }]));

  const [results, setResults] = useState<Record<string, EndpointResult>>(initResults);
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [thirdParty, setThirdParty] = useState<ThirdPartyProviderStatus[]>([]);
  const [thirdPartyLoading, setThirdPartyLoading] = useState(false);
  const [monitorMode, setMonitorMode] = useState<StatusMonitorMode>('live');
  const [monitorUpdatedAt, setMonitorUpdatedAt] = useState<string | null>(null);

  // Countdown to next light refresh
  const [lightCountdown, setLightCountdown] = useState(LIGHT_INTERVAL_MS / 1000);
  const [heavyCountdown, setHeavyCountdown] = useState(HEAVY_INTERVAL_MS / 1000);
  const [cpuExpanded, setCpuExpanded] = useState(false);
  const [rateLimitErr, setRateLimitErr] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Client-side connection timing
  const [clientPing, setClientPing] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<string>('—');

  const lightRef = useRef<number>(LIGHT_INTERVAL_MS / 1000);
  const heavyRef = useRef<number>(HEAVY_INTERVAL_MS / 1000);

  const isStopMode = monitorMode === 'stop';
  const isMaintenanceMode = monitorMode === 'maintenance';
  const isHiatusMode = monitorMode === 'hiatus';
  const isManualRefreshAllowed = monitorMode === 'live';

  const getProbePath = useCallback((ep: EndpointDef): string => {
    return ep.probePath || ep.path;
  }, []);

  // ── Probe a single endpoint ────────────────────────────────────────────────
  // Calls twice: first call warms up Vercel cold start; second call measures real latency
  const probeEndpoint = useCallback(async (ep: EndpointDef) => {
    if (isStopMode) return;
    const probePath = getProbePath(ep);
    try {
      // Warm-up call — discard result, just wake the serverless function
      await fetch(probePath, { method: ep.method, cache: 'no-store' }).catch(() => {});
      // Actual latency measurement call
      const t0 = performance.now();
      const r = await fetch(probePath, { method: ep.method, cache: 'no-store' });
      const latencyMs = Math.round(performance.now() - t0);
      setResults(prev => ({
        ...prev,
        [ep.id]: { latencyMs, status: latencyStatus(latencyMs), httpStatus: r.status, lastChecked: Date.now() },
      }));
    } catch {
      setResults(prev => ({
        ...prev,
        [ep.id]: { latencyMs: null, status: 'down', httpStatus: null, lastChecked: Date.now() },
      }));
    }
  }, [getProbePath, isStopMode]);

  // ── Probe all light endpoints ──────────────────────────────────────────────
  const probeLight = useCallback(() => {
    ENDPOINTS.filter(e => !e.heavy).forEach(ep => probeEndpoint(ep));
  }, [probeEndpoint]);

  // ── Probe all heavy endpoints ──────────────────────────────────────────────
  const probeHeavy = useCallback(() => {
    ENDPOINTS.filter(e => e.heavy).forEach(ep => probeEndpoint(ep));
  }, [probeEndpoint]);

  // ── Fetch server health ────────────────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    if (isStopMode) return;
    setHealthLoading(true);
    try {
      // Warm-up call for cold starts, then actual response fetch
      await fetch('/api/journal?action=health', { cache: 'no-store' }).catch(() => {});
      const r = await fetch('/api/journal?action=health', { cache: 'no-store' });
      const d = await r.json();
      if (d.ok) setHealth(d as ServerHealth);
    } catch { /* ignore */ }
    finally { setHealthLoading(false); }
  }, [isStopMode]);

  // ── Fetch third-party provider statuses ────────────────────────────────────
  const fetchThirdPartyStatuses = useCallback(async () => {
    if (isStopMode) return;
    setThirdPartyLoading(true);
    try {
      // Warm-up call for cold starts, then actual response fetch
      await fetch('/api/journal?action=third-party-status', { cache: 'no-store' }).catch(() => {});
      const r = await fetch('/api/journal?action=third-party-status', { cache: 'no-store' });
      const d = await r.json();
      if (d?.ok) {
        if (d.monitorConfig) {
          setMonitorMode(normalizeMonitorMode(d.monitorConfig.mode));
          setMonitorUpdatedAt(d.monitorConfig.updatedAtIST || d.monitorConfig.updatedAt || null);
        }
        if (Array.isArray(d.providers)) setThirdParty(d.providers as ThirdPartyProviderStatus[]);
      }
    } catch {
      setThirdParty([]);
    } finally {
      setThirdPartyLoading(false);
    }
  }, [isStopMode]);

  const fetchMonitorConfig = useCallback(async () => {
    try {
      await fetch('/api/journal?action=status-monitor-config', { cache: 'no-store' }).catch(() => {});
      const r = await fetch('/api/journal?action=status-monitor-config', { cache: 'no-store' });
      const d = await r.json();
      if (d?.ok) {
        setMonitorMode(normalizeMonitorMode(d.mode));
        setMonitorUpdatedAt(d.updatedAtIST || d.updatedAt || null);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Measure client-side ping ───────────────────────────────────────────────
  const measureClientPing = useCallback(async () => {
    if (isStopMode) return;
    try {
      // Warm-up call for cold starts, then measured ping call
      await fetch('/api/journal?action=health', { method: 'GET', cache: 'no-store' }).catch(() => {});
      const t0 = performance.now();
      await fetch('/api/journal?action=health', { method: 'GET', cache: 'no-store' });
      setClientPing(Math.round(performance.now() - t0));
    } catch { setClientPing(null); }

    // Connection type (if available)
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    if (nav.connection?.effectiveType) setConnectionType(nav.connection.effectiveType);
  }, [isStopMode]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMonitorConfig();
    if (!isStopMode) {
      probeLight();
      probeHeavy();
      fetchHealth();
      fetchThirdPartyStatuses();
      measureClientPing();
    }
  }, [probeLight, probeHeavy, fetchHealth, fetchThirdPartyStatuses, measureClientPing, fetchMonitorConfig, isStopMode]);

  // ── Light interval ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isStopMode) return () => {};
    const interval = setInterval(() => {
      probeLight();
      measureClientPing();
      lightRef.current = LIGHT_INTERVAL_MS / 1000;
    }, LIGHT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [probeLight, measureClientPing, isStopMode]);

  // ── Heavy interval ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isStopMode) return () => {};
    const interval = setInterval(() => {
      probeHeavy();
      fetchHealth();
      fetchThirdPartyStatuses();
      heavyRef.current = HEAVY_INTERVAL_MS / 1000;
    }, HEAVY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [probeHeavy, fetchHealth, fetchThirdPartyStatuses, isStopMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMonitorConfig();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchMonitorConfig]);

  // ── Countdown tickers ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setLightCountdown(p => (p <= 1 ? LIGHT_INTERVAL_MS / 1000 : p - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setHeavyCountdown(p => (p <= 1 ? HEAVY_INTERVAL_MS / 1000 : p - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Manual full refresh ────────────────────────────────────────────────────
  const handleManualRefresh = async () => {
    if (isRefreshing || !isManualRefreshAllowed) return;
    setIsRefreshing(true);
    setRateLimitErr(null);
    try {
      const r = await fetch('/api/journal?action=refresh', { method: 'POST', cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) {
        setRateLimitErr(d.message || 'Rate limited. Try again shortly.');
        setIsRefreshing(false);
        return;
      }
      if (d.ok) setHealth(d as ServerHealth);
    } catch { /* ignore — still probe endpoints below */ }

    setResults(initResults());
    probeLight();
    probeHeavy();
    fetchThirdPartyStatuses();
    measureClientPing();
    setLightCountdown(LIGHT_INTERVAL_MS / 1000);
    setHeavyCountdown(HEAVY_INTERVAL_MS / 1000);
    setIsRefreshing(false);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const mapEndpointModeStatus = (status: EndpointResult['status']): EndpointResult['status'] => {
    if (isMaintenanceMode) return 'degraded';
    if (isStopMode) return 'pending';
    return status;
  };

  const mapThirdPartyModeStatus = (status: EndpointResult['status']): EndpointResult['status'] => {
    if (isStopMode) return 'pending';
    return status;
  };

  const allValues = (Object.values(results) as EndpointResult[]).map((r) => ({ ...r, status: mapEndpointModeStatus(r.status) }));
  const operationalCount = allValues.filter((r: EndpointResult) => r.status === 'operational').length;
  const degradedCount = allValues.filter((r: EndpointResult) => r.status === 'degraded').length;
  const downCount = allValues.filter((r: EndpointResult) => r.status === 'down').length;
  const checkedLatencies = allValues.filter((r: EndpointResult) => r.latencyMs !== null).map((r: EndpointResult) => r.latencyMs as number);
  const avgLatency = checkedLatencies.length ? Math.round(checkedLatencies.reduce((a: number, b: number) => a + b, 0) / checkedLatencies.length) : null;
  const overallStatus: EndpointResult['status'] = isStopMode
    ? 'pending'
    : downCount > 0
      ? 'down'
      : degradedCount > 0
        ? 'degraded'
        : operationalCount === ENDPOINTS.length
          ? 'operational'
          : 'pending';

  const memUsedPct = health ? Math.round(((health.totalMemory - health.freeMemory) / health.totalMemory) * 100) : 0;
  const heapPct = health ? Math.round((health.processMemory.heapUsed / health.processMemory.heapTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4 overflow-x-hidden">
      <SEO
        title="System Status | Deep Dey"
        description="Real-time status of all API endpoints, server health, database latency and connection quality for deepdey.vercel.app"
        keywords="system status, API health, uptime, latency, Deep Dey"
        route="/status"
      />

      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-500 font-mono text-[10px] uppercase tracking-[0.4em] mb-1">System Monitor</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
              <Activity className="text-amber-500" size={32} />
              System Status
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Real-time health check of all API endpoints and server resources</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || !isManualRefreshAllowed}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 rounded-xl transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing…' : isManualRefreshAllowed ? 'Refresh Now' : 'Refresh Disabled'}
            </button>
            {rateLimitErr && (
              <p className="text-red-400 text-[10px] font-mono max-w-[220px] text-right leading-tight">{rateLimitErr}</p>
            )}
            {!isManualRefreshAllowed && !rateLimitErr && (
              <p className="text-zinc-500 text-[10px] font-mono max-w-[240px] text-right leading-tight">
                Refresh is disabled in {monitorMode} mode.
              </p>
            )}
          </div>
        </div>

        {(isStopMode || isMaintenanceMode || isHiatusMode) && (
          <div className={`rounded-2xl border p-4 ${
            isStopMode
              ? 'bg-zinc-900/60 border-zinc-700'
              : isMaintenanceMode
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
          }`}>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Status Page Mode</p>
            <p className="text-sm font-bold text-white mt-1">
              {isStopMode && 'Stop mode: automatic pings paused and refresh disabled.'}
              {isMaintenanceMode && 'Maintenance mode: auto checks run, but status is shown as maintenance.'}
              {isHiatusMode && 'Hiatus mode: monitoring stays live, refresh is disabled, system shown as stable by default.'}
            </p>
            {monitorUpdatedAt && <p className="text-zinc-500 text-[11px] mt-1">Updated: {fmtDateTime(monitorUpdatedAt)}</p>}
          </div>
        )}

        {/* ── Overall Banner ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 border flex items-center gap-4 ${
            overallStatus === 'operational' ? 'bg-emerald-500/10 border-emerald-500/30' :
            overallStatus === 'degraded'    ? 'bg-amber-500/10 border-amber-500/30' :
            overallStatus === 'down'        ? 'bg-red-500/10 border-red-500/30' :
            'bg-zinc-900/40 border-zinc-800'
          }`}
        >
          {overallStatus === 'operational' && <CheckCircle2 className="text-emerald-400 shrink-0" size={28} />}
          {overallStatus === 'degraded'    && <AlertTriangle className="text-amber-400 shrink-0" size={28} />}
          {overallStatus === 'down'        && <XCircle className="text-red-400 shrink-0" size={28} />}
          {overallStatus === 'pending'     && <Radio className="text-zinc-400 animate-pulse shrink-0" size={28} />}
          <div className="flex-1">
            <p className="font-black text-white text-lg">
              {isStopMode && 'Monitoring Paused'}
              {!isStopMode && isMaintenanceMode && 'Maintenance Mode Active'}
              {!isStopMode && !isMaintenanceMode && isHiatusMode && 'Hiatus Mode: Stable Monitoring'}
              {!isStopMode && !isMaintenanceMode && !isHiatusMode && overallStatus === 'operational' && 'All Systems Operational'}
              {!isStopMode && !isMaintenanceMode && !isHiatusMode && overallStatus === 'degraded'    && 'Partial Service Degradation'}
              {!isStopMode && !isMaintenanceMode && !isHiatusMode && overallStatus === 'down'        && 'Service Disruption Detected'}
              {!isStopMode && !isMaintenanceMode && !isHiatusMode && overallStatus === 'pending'     && 'Running checks…'}
            </p>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">
              {operationalCount}/{ENDPOINTS.length} endpoints operational
              {avgLatency !== null && ` · avg ${avgLatency}ms`}
            </p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Next light refresh</p>
            <p className="text-zinc-400 text-sm font-mono font-bold">{lightCountdown}s</p>
          </div>
        </motion.div>

        {/* ── Quick Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Operational', value: operationalCount, color: 'text-emerald-400', icon: <CheckCircle2 size={16} /> },
            { label: 'Degraded',    value: degradedCount,    color: 'text-amber-400',   icon: <AlertTriangle size={16} /> },
            { label: 'Down',        value: downCount,        color: 'text-red-400',      icon: <XCircle size={16} /> },
            { label: 'Avg Latency', value: avgLatency !== null ? `${avgLatency}ms` : '—', color: 'text-blue-400', icon: <Zap size={16} /> },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
              <div className={`flex items-center gap-1.5 ${s.color} text-[10px] font-bold uppercase tracking-widest`}>
                {s.icon}
                {s.label}
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── API Endpoints ──────────────────────────────────────────────────── */}
        <section className="overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Globe size={18} className="text-amber-500" />
              API Endpoints
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <Clock size={10} />
              Light: {lightCountdown}s · Heavy: {heavyCountdown}s
            </div>
          </div>
          <div className="grid gap-3 min-w-0">
            {ENDPOINTS.map((ep, i) => {
              const r = results[ep.id];
              return (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 max-w-full flex flex-col sm:flex-row sm:items-center gap-3 transition-colors overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MethodBadge method={ep.method} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-200 font-bold text-sm">{ep.label}</span>
                        {ep.heavy && (
                          <span className="text-[9px] font-mono text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">5min refresh</span>
                        )}
                      </div>
                      <p className="text-zinc-600 text-xs font-mono break-all [overflow-wrap:anywhere] leading-relaxed">{ep.path}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{ep.description}</p>
                    </div>
                  </div>
                  <div className="flex w-full sm:w-auto flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 sm:shrink-0 min-w-0">
                    <div className="text-center min-w-0">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest mb-0.5">Latency</p>
                      <LatencyBar ms={r.latencyMs} />
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest mb-0.5">Status</p>
                      <StatusBadge status={mapEndpointModeStatus(r.status)} />
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest mb-0.5">Checked</p>
                      <p className="text-zinc-400 text-[11px] font-mono">{fmtSince(r.lastChecked)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Third-Party Apps Status ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Activity size={18} className="text-amber-500" />
              Third-Party Apps Status
            </h2>
            <span className="text-zinc-600 text-[10px] font-mono text-right">Per-provider status, incidents, and maintenance</span>
          </div>

          {thirdPartyLoading && thirdParty.length === 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-sm">
              Checking provider statuses…
            </div>
          )}

          {!thirdPartyLoading && thirdParty.length === 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-sm">
              Could not load provider status data. Try refreshing.
            </div>
          )}

          {thirdParty.length > 0 && (
            <div className="grid gap-3">
              {thirdParty.map((provider, i) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-colors max-w-full overflow-hidden"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-zinc-100 font-bold">{provider.name}</span>
                        <StatusBadge status={mapThirdPartyModeStatus(provider.status)} />
                        {provider.isLikelyOwnInfrastructure && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Our infra match</span>
                        )}
                        {provider.hasOngoingIncident && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30">Incident</span>
                        )}
                        {provider.hasOngoingMaintenance && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">Maintenance</span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm mt-1">{provider.description}</p>
                      {provider.providerMessage && (
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed break-words">{provider.providerMessage}</p>
                      )}
                      <p className="text-zinc-600 text-[11px] font-mono mt-1 break-all [overflow-wrap:anywhere]">{provider.mainEndpoint}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-0">
                      <div>
                        <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">Latency</p>
                        <LatencyBar ms={provider.latencyMs} />
                      </div>
                      <div>
                        <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">HTTP</p>
                        <p className="text-zinc-300 text-sm font-bold font-mono">{provider.httpStatus ?? '—'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">Updated</p>
                        <p className="text-zinc-400 text-[11px] font-mono">{fmtDateTime(provider.lastUpdated)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <p className="text-zinc-500 font-mono break-all [overflow-wrap:anywhere]">Hosting: <span className="text-zinc-300">{provider.hostingProvider || 'unknown'}</span></p>
                      <p className="text-zinc-500 font-mono break-all [overflow-wrap:anywhere]">IP: <span className="text-zinc-300">{provider.serverIp || '—'}</span></p>
                    </div>
                    {(provider.latestIncident || provider.latestMaintenance) && (
                      <div className="space-y-2">
                        {provider.latestIncident && (
                          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                            <p className="text-red-300 text-xs font-bold">Latest Incident: {provider.latestIncident.title || 'Incident'}</p>
                            <p className="text-red-100/90 text-xs mt-1 break-words">{provider.latestIncident.message || 'Provider reported an incident.'}</p>
                          </div>
                        )}
                        {provider.latestMaintenance && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                            <p className="text-amber-300 text-xs font-bold">Latest Maintenance: {provider.latestMaintenance.title || 'Maintenance'}</p>
                            <p className="text-amber-100/90 text-xs mt-1 break-words">{provider.latestMaintenance.message || 'Provider maintenance update available.'}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {provider.statusPageUrl && (
                        <a
                          href={provider.statusPageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-zinc-500 transition-colors"
                        >
                          More info
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {provider.latestIncident?.moreInfoUrl && (
                        <a
                          href={provider.latestIncident.moreInfoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 hover:border-red-400 transition-colors"
                        >
                          Incident details
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {provider.latestMaintenance?.moreInfoUrl && (
                        <a
                          href={provider.latestMaintenance.moreInfoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 hover:border-amber-400 transition-colors"
                        >
                          Maintenance details
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Connection Quality ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-white font-black text-lg flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-amber-500" />
            Connection Quality
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Client → Server RTT', value: clientPing !== null ? `${clientPing}ms` : '—', color: clientPing !== null ? (clientPing < 300 ? 'text-emerald-400' : clientPing < 800 ? 'text-amber-400' : 'text-red-400') : 'text-zinc-500' },
              { label: 'DB Ping (server)', value: health ? `${health.dbPingMs}ms` : healthLoading ? '…' : '—', color: health ? (health.dbPingMs < 50 ? 'text-emerald-400' : health.dbPingMs < 200 ? 'text-amber-400' : 'text-red-400') : 'text-zinc-500' },
              { label: 'Connection Type', value: connectionType, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">{s.label}</p>
                <p className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Server Health ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Server size={18} className="text-amber-500" />
              Server Health
            </h2>
            <span className="text-zinc-600 text-[10px] font-mono">Refreshes every 5min · {heavyCountdown}s</span>
          </div>

          {healthLoading && !health && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center">
              <Radio className="text-amber-500 animate-pulse mx-auto mb-2" size={24} />
              <p className="text-zinc-500 text-sm">Fetching server diagnostics…</p>
            </div>
          )}

          {health && (
            <div className="grid gap-4">
              {/* System Specifications */}
              <div className="bg-zinc-900/40 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-zinc-300 font-bold flex items-center gap-2 text-sm">
                  <Server size={16} className="text-amber-500" /> System Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'RAM',              value: fmtBytes(health.totalMemory),                              color: 'text-amber-400' },
                    { label: 'RAM (Free)',        value: fmtBytes(health.freeMemory),                               color: 'text-emerald-400' },
                    { label: 'Storage (/tmp)',   value: health.diskInfo ? fmtBytes(health.diskInfo.total) : 'Serverless (Ephemeral)', color: 'text-purple-400' },
                    { label: 'Processor',        value: health.cpus[0]?.model ?? '—',                              color: 'text-blue-400' },
                    { label: 'CPU Cores',        value: `${health.cpuCount} logical cores`,                        color: 'text-blue-400' },
                    { label: 'CPU Speed',        value: health.cpus[0] ? `${health.cpus[0].speedMHz} MHz` : '—',  color: 'text-yellow-400' },
                    { label: 'Operating System', value: health.osType ?? health.platform,                    color: 'text-zinc-200' },
                    { label: 'OS Kernel',        value: health.osRelease ?? '—',                                   color: 'text-zinc-400' },
                    { label: 'Architecture',     value: health.arch,                                               color: 'text-zinc-300' },
                    { label: 'Runtime',          value: health.nodeVersion,                                        color: 'text-green-400' },
                    { label: 'Server Region',    value: health.serverRegion ?? '—',                                color: 'text-cyan-400' },
                    { label: 'Hostname',         value: health.hostname ?? '—',                                    color: 'text-zinc-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">{s.label}</p>
                      <p className={`${s.color} font-bold text-sm mt-0.5 truncate`} title={String(s.value)}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Overview */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-zinc-300 font-bold flex items-center gap-2 text-sm">
                  <MemoryStick size={16} className="text-amber-500" /> Memory
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total RAM',  value: fmtBytes(health.totalMemory) },
                    { label: 'Free RAM',   value: fmtBytes(health.freeMemory) },
                    { label: 'Used RAM',   value: fmtBytes(health.totalMemory - health.freeMemory) },
                    { label: 'RAM Used %', value: `${memUsedPct}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">{s.label}</p>
                      <p className="text-amber-400 font-black text-base mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
                {/* RAM bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600 mb-1">
                    <span>System Memory Usage</span>
                    <span>{memUsedPct}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${memUsedPct > 85 ? 'bg-red-500' : memUsedPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${memUsedPct}%` }}
                    />
                  </div>
                </div>

                {/* Process memory */}
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-2">Node.js Process Memory</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'RSS',        value: fmtBytes(health.processMemory.rss) },
                      { label: 'Heap Used',  value: fmtBytes(health.processMemory.heapUsed) },
                      { label: 'Heap Total', value: fmtBytes(health.processMemory.heapTotal) },
                      { label: 'Heap Used%', value: `${heapPct}%` },
                    ].map(s => (
                      <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                        <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">{s.label}</p>
                        <p className="text-blue-400 font-bold text-sm mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600 mb-1">
                      <span>Heap Usage</span>
                      <span>{heapPct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${heapPct > 85 ? 'bg-red-500' : heapPct > 65 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${heapPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CPU & System Info */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-300 font-bold flex items-center gap-2 text-sm">
                    <Cpu size={16} className="text-amber-500" /> Processor Info
                  </h3>
                  <button
                    onClick={() => setCpuExpanded(p => !p)}
                    className="flex items-center gap-1 text-zinc-500 hover:text-amber-500 transition-colors text-xs font-mono"
                  >
                    {cpuExpanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Per Core</>}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'CPU Count',   value: `${health.cpuCount} cores` },
                    { label: 'Model',       value: health.cpus[0]?.model?.split(' ').slice(-2).join(' ') ?? '—' },
                    { label: 'Speed',       value: health.cpus[0] ? `${health.cpus[0].speedMHz} MHz` : '—' },
                    { label: 'Load Avg 1m', value: health.loadAverage[0]?.toFixed(2) ?? '—' },
                  ].map(s => (
                    <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">{s.label}</p>
                      <p className="text-amber-400 font-black text-sm mt-0.5 truncate">{s.value}</p>
                    </div>
                  ))}
                </div>

                {cpuExpanded && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Per-Core CPU Times</p>
                    <div className="grid gap-2">
                      {health.cpus.map((cpu, idx) => {
                        const total = (Object.values(cpu.times) as number[]).reduce((a: number, b: number) => a + b, 0);
                        const idlePct = total > 0 ? Math.round(((cpu.times.idle as number) / total) * 100) : 0;
                        const usedPct = 100 - idlePct;
                        return (
                          <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-zinc-400 text-[11px] font-mono">Core {idx} — {cpu.speedMHz} MHz</p>
                              <span className={`text-[10px] font-bold ${usedPct > 80 ? 'text-red-400' : usedPct > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {usedPct}% used
                              </span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : usedPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${usedPct}%` }}
                              />
                            </div>
                            <div className="flex gap-3 mt-1.5 text-[9px] font-mono text-zinc-600 flex-wrap">
                              <span>user: {(((cpu.times.user as number) / total) * 100).toFixed(1)}%</span>
                              <span>sys: {(((cpu.times.sys as number) / total) * 100).toFixed(1)}%</span>
                              <span>idle: {idlePct}%</span>
                              <span>irq: {(((cpu.times.irq as number) / total) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* System Details */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-zinc-300 font-bold flex items-center gap-2 text-sm">
                  <HardDrive size={16} className="text-amber-500" /> System Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Node.js',    value: health.nodeVersion },
                    { label: 'Platform',   value: `${health.platform}/${health.arch}` },
                    { label: 'OS Type',    value: health.osType ?? health.platform },
                    { label: 'OS Release', value: health.osRelease ?? '—' },
                    { label: 'Uptime',     value: fmtUptime(health.uptime) },
                    { label: 'DB Latency', value: `${health.dbPingMs}ms` },
                    { label: 'Region',     value: health.serverRegion ?? '—' },
                    { label: 'Load 1m',    value: health.loadAverage[0]?.toFixed(2) ?? '—' },
                    { label: 'Load 5m',    value: health.loadAverage[1]?.toFixed(2) ?? '—' },
                  ].map(s => (
                    <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">{s.label}</p>
                      <p className="text-zinc-300 font-bold text-sm mt-0.5 font-mono truncate" title={String(s.value)}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Connection */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-zinc-300 font-bold flex items-center gap-2 text-sm">
                  <Database size={16} className="text-amber-500" /> Database Connection
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${health.dbPingMs < 500 ? 'bg-emerald-400' : health.dbPingMs < 2000 ? 'bg-amber-400' : 'bg-red-400'} shadow-[0_0_8px] shadow-emerald-500/50`} />
                    <span className="text-zinc-300 text-sm font-bold">
                      {health.dbPingMs < 500 ? 'Connected' : health.dbPingMs < 2000 ? 'Slow' : 'Degraded'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">MongoDB Atlas · Ping: <span className={`font-bold ${health.dbPingMs < 100 ? 'text-emerald-400' : health.dbPingMs < 300 ? 'text-amber-400' : 'text-red-400'}`}>{health.dbPingMs}ms</span></span>
                  <span className="text-zinc-600 text-[10px] font-mono">Internal server→db latency measured per-request on serverless runtime</span>
                </div>
              </div>
            </div>
          )}

          {!healthLoading && !health && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-sm">
              Could not load server health data. Try refreshing.
            </div>
          )}
        </section>

        {/* ── Refresh Footer ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-900">
          <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
            {isStopMode ? 'Auto monitoring paused by owner control mode' : 'Light endpoints refresh every 60s · Heavy endpoints every 5min'}
          </p>
          <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-mono">
            <span className="flex items-center gap-1"><Clock size={10} /> Light: {lightCountdown}s</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={10} /> Heavy: {heavyCountdown}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
