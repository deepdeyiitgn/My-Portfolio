import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Command, Cpu, HardDrive, Sparkles, Terminal } from 'lucide-react';
import { linksData, type LinkItem } from '../data/linksData';

type RouteEntry = {
  path: string;
  label: string;
  group: 'main' | 'utility' | 'journal' | 'account';
  listInLs?: boolean;
};

type Tone = 'system' | 'success' | 'warning' | 'error' | 'muted' | 'accent';

type TerminalLink = {
  title: string;
  url: string;
  description?: string;
  status?: string;
  category?: string;
};

type TerminalLine =
  | { id: number; type: 'input'; value: string }
  | { id: number; type: 'text'; tone: Tone; value: string; pre?: boolean }
  | { id: number; type: 'divider'; value?: string }
  | { id: number; type: 'links'; title: string; items: TerminalLink[] };

type CommandMeta = {
  category: 'NAVIGATION' | 'SYSTEM' | 'LORE' | 'SECRETS';
  description: string;
  hidden?: boolean;
};

type UseTerminalReturn = {
  input: string;
  setInput: (value: string) => void;
  lines: TerminalLine[];
  submitCurrentInput: () => void;
  triggerCommand: (command: string) => void;
  handleHistoryNav: (direction: 'up' | 'down') => void;
  isMatrixActive: boolean;
  isShaking: boolean;
};

const OWNER_STORAGE_KEY = 'dd_comment_user';
const JEE_TARGET_DATE = new Date('2027-01-01T00:00:00+05:30');

const ROUTES: RouteEntry[] = [
  { path: '/', label: 'home', group: 'main', listInLs: true },
  { path: '/projects', label: 'projects', group: 'main', listInLs: true },
  { path: '/about', label: 'about', group: 'main', listInLs: true },
  { path: '/me', label: 'me', group: 'main' },
  { path: '/contact', label: 'contact', group: 'main', listInLs: true },
  { path: '/faq', label: 'faq', group: 'main' },
  { path: '/portfolio', label: 'portfolio', group: 'main' },
  { path: '/links', label: 'links', group: 'main', listInLs: true },
  { path: '/proof', label: 'proof', group: 'utility' },
  { path: '/journal', label: 'journal', group: 'main', listInLs: true },
  { path: '/now', label: 'now', group: 'main' },
  { path: '/legal', label: 'legal', group: 'utility' },
  { path: '/terms', label: 'terms', group: 'utility' },
  { path: '/privacy', label: 'privacy', group: 'utility' },
  { path: '/dmca', label: 'dmca', group: 'utility' },
  { path: '/copyright', label: 'copyright', group: 'utility' },
  { path: '/dashboard', label: 'dashboard', group: 'utility' },
  { path: '/live', label: 'live', group: 'main' },
  { path: '/search', label: 'search', group: 'main' },
  { path: '/status', label: 'status', group: 'main', listInLs: true },
  { path: '/journal/comment', label: 'journal-comment-guide', group: 'journal' },
  { path: '/user', label: 'user-directory', group: 'account', listInLs: true },
];

const ROUTE_ALIASES: Record<string, string> = {
  '/home': '/',
};

const NEOFETCH_ASCII = String.raw`
██████╗ ███████╗███████╗██████╗
██╔══██╗██╔════╝██╔════╝██╔══██╗
██║  ██║█████╗  █████╗  ██████╔╝
██║  ██║██╔══╝  ██╔══╝  ██╔═══╝
██████╔╝███████╗███████╗██║
╚═════╝ ╚══════╝╚══════╝╚═╝
`;

const COMMANDS: Record<string, CommandMeta> = {
  help: { category: 'SYSTEM', description: 'Display categorized command manual.' },
  ls: { category: 'NAVIGATION', description: 'List core route directories.' },
  dir: { category: 'NAVIGATION', description: 'Alias of ls.' },
  'cd <path>': { category: 'NAVIGATION', description: 'Navigate instantly to a route.' },
  status: { category: 'SYSTEM', description: 'Fetch live Deep status via portfolio API.' },
  'ping deep': { category: 'SYSTEM', description: 'Alias for status command.' },
  links: { category: 'SYSTEM', description: 'Fetch and render live links registry.' },
  whoami: { category: 'SYSTEM', description: 'Resolve active identity context.' },
  history: { category: 'SYSTEM', description: 'Print terminal command history.' },
  clear: { category: 'SYSTEM', description: 'Clear terminal viewport.' },
  date: { category: 'SYSTEM', description: 'Print current date/time stamp.' },
  uptime: { category: 'SYSTEM', description: 'Show session uptime.' },
  neofetch: { category: 'SYSTEM', description: 'Render Deep-OS system signature.' },
  matrix: { category: 'SYSTEM', description: 'Activate matrix rain mode for 5s.' },
  'sudo su': { category: 'SYSTEM', description: 'Attempt elevated shell access.' },
  target: { category: 'LORE', description: 'Reveal locked mission objective.' },
  class: { category: 'LORE', description: 'Reveal current student parameters.' },
  irodov: { category: 'LORE', description: 'A dangerous physics joke.' },
  'solve jee': { category: 'LORE', description: 'Force anti-procrastination redirect.' },
  'jee status': { category: 'LORE', description: 'Countdown to JEE 2027 horizon.' },
  qlynk: { category: 'LORE', description: 'Boot QLYNK lore node.' },
  magicbite: { category: 'LORE', description: 'Engage Tech Developer mode.' },
  deqlynk: { category: 'LORE', description: 'Inspect DEQLYNK model status.' },
  'sudo rm -rf /': { category: 'LORE', description: 'Trigger security protocol (danger).' },
  didi: { category: 'SECRETS', description: 'Secret family protocol.', hidden: true },
  driptanill: { category: 'SECRETS', description: 'Secret friend protocol.', hidden: true },
  nandini: { category: 'SECRETS', description: 'Secret birthday protocol.', hidden: true },
  thamma: { category: 'SECRETS', description: 'Secret media protocol.', hidden: true },
  minecraft: { category: 'SECRETS', description: 'Secret gaming protocol.', hidden: true },
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    days > 0 ? `${days}d` : '',
    hours > 0 || days > 0 ? `${hours}h` : '',
    minutes > 0 || hours > 0 || days > 0 ? `${minutes}m` : '',
    `${seconds}s`,
  ].filter(Boolean);
  return parts.join(' ');
}

function getJeeCountdown() {
  const now = Date.now();
  const diff = JEE_TARGET_DATE.getTime() - now;
  if (diff <= 0) return 'JEE 2027 timeline reached. Execute at maximum potential.';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m remaining to JEE 2027.`;
}

function getStoredVisitor() {
  try {
    const raw = localStorage.getItem(OWNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string; userId?: string; exp?: number };
    if (!parsed?.exp || parsed.exp * 1000 <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function useTerminal(navigate: (path: string) => void): UseTerminalReturn {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 1,
      type: 'text',
      tone: 'accent',
      value: '>>> ARCH-TERMINAL VOID BOOTED // 404 ROUTE BREACH DETECTED',
      pre: false,
    },
    {
      id: 2,
      type: 'text',
      tone: 'muted',
      value: "Type 'help' to list command categories. Hidden lore exists.",
      pre: false,
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const lineIdRef = useRef(3);
  const timersRef = useRef<number[]>([]);
  const bootTimeRef = useRef(Date.now());
  const executionChainRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    },
    [],
  );

  const pushLine = useCallback((line: Omit<TerminalLine, 'id'>) => {
    const id = lineIdRef.current++;
    setLines((prev) => [...prev, { ...line, id } as TerminalLine]);
    return id;
  }, []);

  const updateTypedLine = useCallback((id: number, value: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id && line.type === 'text'
          ? {
              ...line,
              value,
            }
          : line,
      ),
    );
  }, []);

  const appendText = useCallback(
    async (value: string, tone: Tone = 'system', opts?: { typed?: boolean; cps?: number; pre?: boolean }) => {
      const typed = opts?.typed ?? true;
      const cps = opts?.cps ?? 120;
      const pre = opts?.pre ?? true;
      if (!typed || value.length < 2) {
        pushLine({ type: 'text', tone, value, pre });
        return;
      }

      const id = pushLine({ type: 'text', tone, value: '', pre });
      await new Promise<void>((resolve) => {
        let index = 0;
        const tick = Math.max(12, Math.floor(1000 / cps));
        const interval = window.setInterval(() => {
          index += 1;
          updateTypedLine(id, value.slice(0, index));
          if (index >= value.length) {
            window.clearInterval(interval);
            resolve();
          }
        }, tick);
        timersRef.current.push(interval);
      });
    },
    [pushLine, updateTypedLine],
  );

  const appendDivider = useCallback((value?: string) => {
    pushLine({ type: 'divider', value });
  }, [pushLine]);

  const appendLinks = useCallback((title: string, items: TerminalLink[]) => {
    pushLine({ type: 'links', title, items });
  }, [pushLine]);

  const runStatusCommand = useCallback(async () => {
    await appendText('Establishing secure connection...', 'muted', { cps: 100 });
    await sleep(500);
    await appendText('Handshake accepted -> /api/journal?action=status', 'muted', { cps: 100 });

    try {
      const response = await fetch('/api/journal?action=status');
      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.current) {
        await appendText('Signal unavailable. Status core did not return valid payload.', 'error');
        return;
      }

      const current = data.current as {
        message?: string;
        freeBy?: string;
        icon?: string;
        createdAt?: string;
        actionUrl?: string;
      };

      appendDivider('LIVE STATUS');
      await appendText(current.message || 'No live status message.', 'success', { cps: 130 });
      if (current.freeBy) {
        await appendText(`free-by: ${current.freeBy}`, 'accent', { cps: 120 });
      }
      if (current.icon) {
        await appendText(`icon-signal: ${current.icon}`, 'muted', { cps: 120 });
      }
      if (current.createdAt) {
        await appendText(`updated: ${new Date(current.createdAt).toLocaleString()}`, 'muted', { cps: 120 });
      }
      if (current.actionUrl) {
        appendLinks('Action Link', [{ title: 'Open live action URL', url: current.actionUrl }]);
      }
    } catch {
      await appendText('Network void encountered while reading live status.', 'error');
    }
  }, [appendDivider, appendLinks, appendText]);

  const runLinksCommand = useCallback(async () => {
    await appendText('Syncing distributed link registry...', 'muted', { cps: 110 });
    await sleep(350);
    await appendText('Fetching /api/links', 'muted', { cps: 110 });

    let items: LinkItem[] = linksData;
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      if (response.ok && Array.isArray(data?.items) && data.items.length > 0) {
        items = data.items as LinkItem[];
      }
    } catch {
      await appendText('API fallback engaged: using local linksData snapshot.', 'warning');
    }

    if (items.length === 0) {
      await appendText('No links found in registry.', 'warning');
      return;
    }

    const grouped = items.reduce<Record<string, LinkItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    appendDivider(`LINK REGISTRY (${items.length})`);

    Object.entries(grouped).forEach(([category, categoryItems]) => {
      appendLinks(
        category,
        categoryItems.map((item) => ({
          title: item.title,
          url: item.url,
          description: item.description,
          status: item.status,
          category,
        })),
      );
    });
  }, [appendDivider, appendLinks, appendText]);

  const runWhoAmI = useCallback(async () => {
    const visitor = getStoredVisitor();
    try {
      const response = await fetch('/api/auth');
      const auth = await response.json();
      if (response.ok && auth?.authenticated) {
        await appendText('Identity: Deep Dey // Owner shell authenticated.', 'success');
        return;
      }
    } catch {
      // ignore, fallback below
    }

    if (visitor?.name) {
      const uid = visitor.userId ? `${visitor.userId.slice(0, 8)}...` : 'masked';
      await appendText(`Identity: ${visitor.name} // Session token active (${uid})`, 'accent');
      return;
    }

    await appendText('Unidentified Entity roaming the void. (Login system bypassed).', 'warning');
  }, [appendText]);

  const runHelp = useCallback(async () => {
    appendDivider('SYSTEM MANUAL');

    const sections: Array<CommandMeta['category']> = ['NAVIGATION', 'SYSTEM', 'LORE'];

    for (const section of sections) {
      await appendText(`[${section}]`, 'accent', { typed: false, pre: false });
      const entries = Object.entries(COMMANDS)
        .filter(([, meta]) => meta.category === section && !meta.hidden)
        .sort(([a], [b]) => a.localeCompare(b));

      for (const [name, meta] of entries) {
        await appendText(`  ${name.padEnd(14, ' ')} :: ${meta.description}`, 'system', { typed: false, pre: false });
      }
    }

    await appendText("Hint: Void has secret commands that manual won't reveal.", 'muted', { typed: false, pre: false });
  }, [appendDivider, appendText]);

  const runNeofetch = useCallback(async () => {
    appendDivider('DEEP-OS FINGERPRINT');
    await appendText(NEOFETCH_ASCII, 'accent', { typed: false, pre: true });
    await appendText('OS        : Deep-OS Arch Terminal Void', 'system', { typed: false, pre: false });
    await appendText('Kernel    : React 19 + Vite 6', 'system', { typed: false, pre: false });
    await appendText('GPU       : Framer Motion Render Fabric', 'system', { typed: false, pre: false });
    await appendText('Theme     : Zinc-950 / Amber-500', 'system', { typed: false, pre: false });
    await appendText(`Uptime    : ${formatDuration(Date.now() - bootTimeRef.current)}`, 'system', { typed: false, pre: false });
    await appendText('CPU       : Human + Caffeine + Irodov Stack', 'system', { typed: false, pre: false });
    await appendText('Node      : IIT KGP CSE Target Lock', 'success', { typed: false, pre: false });
  }, [appendDivider, appendText]);

  const runLs = useCallback(async () => {
    const major = ROUTES.filter((route) => route.listInLs).map((route) => route.path);
    const list = ['/home', ...major.filter((route) => route !== '/')];
    appendDivider('ROUTE DIRECTORY');
    await appendText(list.join('\n'), 'system', { typed: false, pre: true });
  }, [appendDivider, appendText]);

  const executeCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      const command = trimmed.toLowerCase();
      if (!command) return;

      if (command === 'clear') {
        setLines([]);
        return;
      }

      if (command.startsWith('cd')) {
        const targetRaw = trimmed.slice(2).trim();
        if (!targetRaw) {
          await appendText('Usage: cd <route>', 'warning');
          return;
        }
        const normalized = targetRaw.startsWith('/') ? targetRaw : `/${targetRaw}`;
        const resolved = ROUTE_ALIASES[normalized] || normalized;
        const routeExists = ROUTES.some((route) => route.path === resolved);

        if (!routeExists) {
          await appendText(`Route not found: ${normalized}`, 'error');
          return;
        }

        await appendText(`Routing -> ${resolved}`, 'success', { typed: false, pre: false });
        navigate(resolved);
        return;
      }

      if (command === 'ls' || command === 'dir') {
        await runLs();
        return;
      }

      if (command === 'help') {
        await runHelp();
        return;
      }

      if (command === 'status' || command === 'ping deep') {
        await runStatusCommand();
        return;
      }

      if (command === 'links') {
        await runLinksCommand();
        return;
      }

      if (command === 'whoami') {
        await runWhoAmI();
        return;
      }

      if (command === 'history') {
        if (commandHistory.length === 0) {
          await appendText('No command history available yet.', 'muted', { typed: false, pre: false });
          return;
        }
        appendDivider('COMMAND HISTORY');
        await appendText(
          commandHistory.map((entry, index) => `${String(index + 1).padStart(2, '0')}  ${entry}`).join('\n'),
          'system',
          { typed: false, pre: true },
        );
        return;
      }

      if (command === 'date') {
        await appendText(new Date().toString(), 'system', { typed: false, pre: false });
        return;
      }

      if (command === 'uptime') {
        await appendText(`Session uptime: ${formatDuration(Date.now() - bootTimeRef.current)}`, 'system', { typed: false, pre: false });
        return;
      }

      if (command === 'neofetch') {
        await runNeofetch();
        return;
      }

      if (command === 'matrix') {
        await appendText('Matrix stream initialized for 5 seconds...', 'accent');
        setIsMatrixActive(true);
        const timer = window.setTimeout(() => setIsMatrixActive(false), 5000);
        timersRef.current.push(timer);
        return;
      }

      if (command === 'sudo su') {
        await appendText('Access Denied. Incident reported.', 'error', { typed: false, pre: false });
        return;
      }

      if (command === 'solve jee') {
        await appendText('Warning: Target IIT KGP CSE slipping by 0.01%. Redirection initiated!', 'error', {
          typed: false,
          pre: false,
        });
        await sleep(2000);
        navigate('/');
        return;
      }

      if (command === 'jee status') {
        await appendText(getJeeCountdown(), 'accent', { typed: false, pre: false });
        return;
      }

      if (command === 'target') {
        await appendText('Lock acquired on: IIT Kharagpur (CSE)', 'success', { typed: false, pre: false });
        return;
      }

      if (command === 'irodov') {
        await appendText('Irodov joke: Even photons avoid my practice sheets because momentum conservation fails there.', 'system', {
          typed: false,
          pre: false,
        });
        return;
      }

      if (command === 'class') {
        await appendText('Current parameters: Class 12 (CBSE) - PCM', 'system', { typed: false, pre: false });
        return;
      }

      if (command === 'qlynk') {
        await appendText('QLYNK - 600+ commits. Accessing qlynk.me...', 'accent', { typed: false, pre: false });
        appendLinks('QLYNK Node', [{ title: 'qlynk.me', url: 'https://qlynk.me' }]);
        return;
      }

      if (command === 'magicbite') {
        await appendText('Tech Developer mode engaged.', 'success', { typed: false, pre: false });
        return;
      }

      if (command === 'deqlynk') {
        await appendText('DEQLYNK 21M Model: Project currently POSTPONED.', 'warning', { typed: false, pre: false });
        return;
      }

      if (command === 'sudo rm -rf /') {
        setIsShaking(true);
        await appendText('UNAUTHORIZED ACCESS! SYSTEM KICK!', 'error', { typed: false, pre: false });
        const shakeTimer = window.setTimeout(() => setIsShaking(false), 650);
        timersRef.current.push(shakeTimer);
        await sleep(2000);
        navigate('/');
        return;
      }

      if (command === 'didi') {
        await appendText('Older sister protocol: Helping with IGNOU BCA projects.', 'accent', { typed: false, pre: false });
        return;
      }

      if (command === 'driptanill') {
        await appendText('Best Friend profile found.', 'accent', { typed: false, pre: false });
        return;
      }

      if (command === 'nandini') {
        await appendText('Birthday surprise deployed.', 'accent', { typed: false, pre: false });
        return;
      }

      if (command === 'thamma') {
        await appendText('Media stream server running.', 'accent', { typed: false, pre: false });
        return;
      }

      if (command === 'minecraft') {
        await appendText('GeyserMC LAN server initialized.', 'accent', { typed: false, pre: false });
        return;
      }

      await appendText("Command not found. My NanoGPT model wasn't trained on this. Type 'help'.", 'error', {
        typed: false,
        pre: false,
      });
    },
    [appendDivider, appendLinks, appendText, commandHistory, navigate, runHelp, runLinksCommand, runLs, runNeofetch, runStatusCommand, runWhoAmI],
  );

  const queueCommand = useCallback(
    (raw: string) => {
      executionChainRef.current = executionChainRef.current.then(() => executeCommand(raw)).catch(() => undefined);
    },
    [executeCommand],
  );

  const triggerCommand = useCallback(
    (command: string) => {
      const normalized = command.trim();
      if (!normalized) return;
      pushLine({ type: 'input', value: normalized });
      setCommandHistory((prev) => [...prev, normalized]);
      setHistoryCursor(null);
      queueCommand(normalized);
    },
    [pushLine, queueCommand],
  );

  const submitCurrentInput = useCallback(() => {
    const normalized = input.trim();
    if (!normalized) return;
    triggerCommand(normalized);
    setInput('');
  }, [input, triggerCommand]);

  const handleHistoryNav = useCallback(
    (direction: 'up' | 'down') => {
      if (!commandHistory.length) return;

      if (direction === 'up') {
        setHistoryCursor((prev) => {
          const next = prev === null ? commandHistory.length - 1 : Math.max(0, prev - 1);
          setInput(commandHistory[next] || '');
          return next;
        });
        return;
      }

      setHistoryCursor((prev) => {
        if (prev === null) return null;
        const next = prev + 1;
        if (next >= commandHistory.length) {
          setInput('');
          return null;
        }
        setInput(commandHistory[next] || '');
        return next;
      });
    },
    [commandHistory],
  );

  return {
    input,
    setInput,
    lines,
    submitCurrentInput,
    triggerCommand,
    handleHistoryNav,
    isMatrixActive,
    isShaking,
  };
}

function Prompt() {
  return (
    <span className="font-mono">
      <span className="text-emerald-400">deep-os</span>
      <span className="text-zinc-500">@</span>
      <span className="text-amber-400">portfolio</span>
      <span className="text-zinc-500">:~$ </span>
    </span>
  );
}

function MatrixOverlay({ active }: { active: boolean }) {
  const columns = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: `${(index / 28) * 100}%`,
        delay: (index % 9) * 0.13,
        duration: 1.4 + (index % 6) * 0.32,
        stream: Array.from({ length: 64 }, () => '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&'[Math.floor(Math.random() * 35)]).join(''),
      })),
    [],
  );

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-b-2xl bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {columns.map((column) => (
            <motion.div
              key={column.id}
              className="absolute top-[-120%] w-6 font-mono text-[10px] leading-3 text-emerald-400/80 [text-shadow:0_0_10px_rgba(34,197,94,0.7)]"
              style={{ left: column.left }}
              initial={{ y: '-120%' }}
              animate={{ y: '220%' }}
              transition={{
                duration: column.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: column.delay,
              }}
            >
              {column.stream}
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function VoidBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        size: (index % 5) + 1,
        left: `${(index * 11.3) % 100}%`,
        top: `${(index * 17.7) % 100}%`,
        duration: 3.8 + (index % 7),
        delay: (index % 8) * 0.25,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,158,11,0.12),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(245,158,11,0.09),transparent_38%)]"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"
        animate={{ opacity: [0.07, 0.18, 0.07] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-amber-400/45 blur-[1px]"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [-9, 11, -9],
            opacity: [0.2, 0.9, 0.2],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

function toneClass(tone: Tone) {
  switch (tone) {
    case 'success':
      return 'text-emerald-300';
    case 'warning':
      return 'text-amber-300';
    case 'error':
      return 'text-red-400';
    case 'muted':
      return 'text-zinc-500';
    case 'accent':
      return 'text-amber-400';
    default:
      return 'text-zinc-200';
  }
}

export default function NotFound() {
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { input, setInput, lines, submitCurrentInput, triggerCommand, handleHistoryNav, isMatrixActive, isShaking } =
    useTerminal(navigate);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines, input]);

  const terminalMotion = useMemo(
    () => ({
      initial: { opacity: 0, y: 24, scale: 0.985 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: isShaking ? [0, -15, 15, -12, 12, -7, 7, 0] : 0,
      },
      transition: {
        duration: isShaking ? 0.56 : 0.48,
        ease: 'easeOut' as const,
      },
    }),
    [isShaking],
  );

  return (
    <div className="relative min-h-[75vh] overflow-hidden bg-zinc-950 px-3 py-10 sm:px-6">
      <VoidBackground />

      <motion.div
        {...terminalMotion}
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
        className="relative z-10 mx-auto w-[95%] max-w-3xl overflow-hidden rounded-2xl border border-amber-500/35 bg-zinc-900/60 shadow-[0_0_60px_rgba(245,158,11,0.12)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-zinc-700/70 bg-zinc-950/80 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
            </div>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-amber-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-300">Arch-Terminal Void</span>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:flex">
            <span className="inline-flex items-center gap-1">
              <Cpu size={11} /> neural-shell
            </span>
            <span className="inline-flex items-center gap-1">
              <HardDrive size={11} /> route-404
            </span>
          </div>
        </div>

        <div
          ref={outputRef}
          className="relative h-[440px] overflow-y-auto px-4 py-4 font-mono text-xs sm:text-sm [scrollbar-width:thin] [scrollbar-color:rgba(245,158,11,0.45)_rgba(39,39,42,0.6)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/45 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/65"
        >
          <MatrixOverlay active={isMatrixActive} />

          <div className="relative z-10 space-y-2.5">
            {lines.map((line) => {
              if (line.type === 'input') {
                return (
                  <div key={line.id} className="break-words">
                    <Prompt />
                    <span className="text-zinc-100">{line.value}</span>
                  </div>
                );
              }

              if (line.type === 'divider') {
                return (
                  <div key={line.id} className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-zinc-700/70" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">{line.value || 'divider'}</span>
                    <span className="h-px flex-1 bg-zinc-700/70" />
                  </div>
                );
              }

              if (line.type === 'links') {
                return (
                  <div key={line.id} className="space-y-1 rounded-xl border border-zinc-800/80 bg-zinc-950/35 p-3">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300">{line.title}</p>
                    <div className="space-y-1.5">
                      {line.items.map((item) => (
                        <div key={`${item.title}-${item.url}`} className="leading-relaxed">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-300 underline decoration-emerald-500/40 underline-offset-2 transition-colors hover:text-emerald-200"
                          >
                            {item.title}
                          </a>
                          {item.status ? <span className="ml-2 text-[10px] text-amber-400/80">[{item.status}]</span> : null}
                          {item.description ? <p className="text-zinc-500">{item.description}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <p
                  key={line.id}
                  className={`whitespace-pre-wrap break-words leading-relaxed ${toneClass(line.tone)}`}
                >
                  {line.value}
                </p>
              );
            })}

            <div className="mt-2 flex items-start break-all">
              <Prompt />
              <span className="text-zinc-100">{input}</span>
              <motion.span
                className="ml-0.5 mt-[2px] inline-block h-4 w-2 rounded-[2px] bg-amber-400/95"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitCurrentInput();
              return;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              handleHistoryNav('up');
              return;
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              handleHistoryNav('down');
            }
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-label="Arch terminal input"
        />
      </motion.div>

      <div className="relative z-10 mx-auto mt-5 flex w-[95%] max-w-3xl items-center justify-between gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => triggerCommand('help')}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-zinc-900/75 px-4 py-2.5 font-mono text-xs text-amber-300 shadow-[0_0_26px_rgba(245,158,11,0.24)] transition-colors hover:bg-zinc-800/85 sm:text-sm"
        >
          <Sparkles size={14} />
          <span>[ ? ] System Manual</span>
        </motion.button>

        <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:flex">
          <Command size={12} className="text-amber-400" />
          <span>Type commands to escape the void</span>
        </div>
      </div>
    </div>
  );
}
