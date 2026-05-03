import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Clock, Server, Database, Cpu, HardDrive, MemoryStick,
  Globe, Wifi, ChevronDown, ChevronUp, Zap, Radio,
} from 'lucide-react';
import SEO from '../components/SEO';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EndpointDef {
  id: string;
  path: string;
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
  totalMemory: number;
  freeMemory: number;
  cpus: { model: string; speedMHz: number; times: { user: number; nice: number; sys: number; idle: number; irq: number } }[];
  cpuCount: number;
  processMemory: { rss: number; heapUsed: number; heapTotal: number; external: number };
  dbPingMs: number;
  loadAverage: number[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ENDPOINTS: EndpointDef[] = [
  { id: 'journal-list',     path: '/api/journal?page=1&limit=1',       method: 'GET',  label: 'Journal List',        description: 'Paginated journal entries',              heavy: false },
  { id: 'journal-status',   path: '/api/journal?action=status',        method: 'GET',  label: 'Live Status',         description: 'Current personal status widget',         heavy: false },
  { id: 'journal-health',   path: '/api/journal?action=health',        method: 'GET',  label: 'Health Check',        description: 'Server & database health probe',         heavy: false },
  { id: 'categories',       path: '/api/categories',                   method: 'GET',  label: 'Categories',          description: 'Journal category list',                  heavy: false },
  { id: 'projects',         path: '/api/projects',                     method: 'GET',  label: 'Projects',            description: 'Portfolio project index',                heavy: false },
  { id: 'timeline',         path: '/api/timeline',                     method: 'GET',  label: 'Timeline',            description: 'Journey timeline milestones',             heavy: false },
  { id: 'links',            path: '/api/links',                        method: 'GET',  label: 'Links',               description: 'Curated link collection',                heavy: false },
  { id: 'faqs',             path: '/api/faqs',                         method: 'GET',  label: 'FAQs',                description: 'Frequently asked questions',             heavy: false },
  { id: 'live',             path: '/api/live',                         method: 'GET',  label: 'YouTube Live',        description: 'Live stream & recent videos feed',       heavy: true  },
  { id: 'contact',          path: '/api/contact',                      method: 'GET',  label: 'Contact Engine',      description: 'Contact form handler',                   heavy: false },
  { id: 'sitemap',          path: '/api/sitemap',                      method: 'GET',  label: 'Sitemap',             description: 'XML sitemap generator',                  heavy: true  },
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

  // Countdown to next light refresh
  const [lightCountdown, setLightCountdown] = useState(LIGHT_INTERVAL_MS / 1000);
  const [heavyCountdown, setHeavyCountdown] = useState(HEAVY_INTERVAL_MS / 1000);
  const [cpuExpanded, setCpuExpanded] = useState(false);

  // Client-side connection timing
  const [clientPing, setClientPing] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<string>('—');

  const lightRef = useRef<number>(LIGHT_INTERVAL_MS / 1000);
  const heavyRef = useRef<number>(HEAVY_INTERVAL_MS / 1000);

  // ── Probe a single endpoint ────────────────────────────────────────────────
  const probeEndpoint = useCallback(async (ep: EndpointDef) => {
    const t0 = performance.now();
    try {
      const r = await fetch(ep.path, { method: ep.method === 'GET' ? 'GET' : 'POST', cache: 'no-store' });
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
  }, []);

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
    setHealthLoading(true);
    try {
      const r = await fetch('/api/journal?action=health', { cache: 'no-store' });
      const d = await r.json();
      if (d.ok) setHealth(d as ServerHealth);
    } catch { /* ignore */ }
    finally { setHealthLoading(false); }
  }, []);

  // ── Measure client-side ping ───────────────────────────────────────────────
  const measureClientPing = useCallback(async () => {
    const t0 = performance.now();
    try {
      await fetch('/api/journal?action=health', { method: 'GET', cache: 'no-store' });
      setClientPing(Math.round(performance.now() - t0));
    } catch { setClientPing(null); }

    // Connection type (if available)
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    if (nav.connection?.effectiveType) setConnectionType(nav.connection.effectiveType);
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    probeLight();
    probeHeavy();
    fetchHealth();
    measureClientPing();
  }, [probeLight, probeHeavy, fetchHealth, measureClientPing]);

  // ── Light interval ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      probeLight();
      measureClientPing();
      lightRef.current = LIGHT_INTERVAL_MS / 1000;
    }, LIGHT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [probeLight, measureClientPing]);

  // ── Heavy interval ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      probeHeavy();
      fetchHealth();
      heavyRef.current = HEAVY_INTERVAL_MS / 1000;
    }, HEAVY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [probeHeavy, fetchHealth]);

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
  const handleManualRefresh = () => {
    setResults(initResults());
    setHealth(null);
    probeLight();
    probeHeavy();
    fetchHealth();
    measureClientPing();
    setLightCountdown(LIGHT_INTERVAL_MS / 1000);
    setHeavyCountdown(HEAVY_INTERVAL_MS / 1000);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const allValues = Object.values(results) as EndpointResult[];
  const operationalCount = allValues.filter((r: EndpointResult) => r.status === 'operational').length;
  const degradedCount = allValues.filter((r: EndpointResult) => r.status === 'degraded').length;
  const downCount = allValues.filter((r: EndpointResult) => r.status === 'down').length;
  const checkedLatencies = allValues.filter((r: EndpointResult) => r.latencyMs !== null).map((r: EndpointResult) => r.latencyMs as number);
  const avgLatency = checkedLatencies.length ? Math.round(checkedLatencies.reduce((a: number, b: number) => a + b, 0) / checkedLatencies.length) : null;
  const overallStatus: EndpointResult['status'] = downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : operationalCount === ENDPOINTS.length ? 'operational' : 'pending';

  const memUsedPct = health ? Math.round(((health.totalMemory - health.freeMemory) / health.totalMemory) * 100) : 0;
  const heapPct = health ? Math.round((health.processMemory.heapUsed / health.processMemory.heapTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
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
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 rounded-xl transition-all text-sm font-bold"
          >
            <RefreshCw size={14} />
            Refresh Now
          </button>
        </div>

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
              {overallStatus === 'operational' && 'All Systems Operational'}
              {overallStatus === 'degraded'    && 'Partial Service Degradation'}
              {overallStatus === 'down'        && 'Service Disruption Detected'}
              {overallStatus === 'pending'     && 'Running checks…'}
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
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Globe size={18} className="text-amber-500" />
              API Endpoints
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <Clock size={10} />
              Light: {lightCountdown}s · Heavy: {heavyCountdown}s
            </div>
          </div>
          <div className="grid gap-3">
            {ENDPOINTS.map((ep, i) => {
              const r = results[ep.id];
              return (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors"
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
                      <p className="text-zinc-600 text-xs font-mono truncate">{ep.path}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{ep.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 sm:shrink-0">
                    <div className="text-center">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest mb-0.5">Latency</p>
                      <LatencyBar ms={r.latencyMs} />
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest mb-0.5">Status</p>
                      <StatusBadge status={r.status} />
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
                    { label: 'Uptime',     value: fmtUptime(health.uptime) },
                    { label: 'DB Latency', value: `${health.dbPingMs}ms` },
                    { label: 'Load 1m',    value: health.loadAverage[0]?.toFixed(2) ?? '—' },
                    { label: 'Load 5m',    value: health.loadAverage[1]?.toFixed(2) ?? '—' },
                  ].map(s => (
                    <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                      <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">{s.label}</p>
                      <p className="text-zinc-300 font-bold text-sm mt-0.5 font-mono">{s.value}</p>
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
            Light endpoints refresh every 60s · Heavy endpoints every 5min
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
