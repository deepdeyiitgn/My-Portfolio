import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Terminal, Sparkles } from 'lucide-react';

type HistoryKind = 'input' | 'output' | 'error';
type HistoryEntry = { id: number; kind: HistoryKind; text: string };

const APP_ROUTES = [
  '/',
  '/projects',
  '/about',
  '/me',
  '/contact',
  '/faq',
  '/portfolio',
  '/links',
  '/proof',
  '/journal',
  '/now',
  '/legal',
  '/terms',
  '/privacy',
  '/dmca',
  '/copyright',
  '/dashboard',
  '/live',
  '/search',
  '/status',
  '/journal/comment',
  '/user',
] as const;

const ROUTE_ALIASES: Record<string, string> = {
  '/home': '/',
};

const ROUTE_DIRECTORY_LIST = ['/home', '/projects', '/journal', '/about', '/contact', '/status'];

function PromptPrefix() {
  return (
    <span className="font-mono">
      <span className="text-emerald-400">deep-os</span>
      <span className="text-zinc-500">@</span>
      <span className="text-amber-400">portfolio</span>
      <span className="text-zinc-500">:~$ </span>
    </span>
  );
}

export default function NotFound() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 1, kind: 'output', text: '404: Route not found. Welcome to Arch-Terminal Void.' },
    { id: 2, kind: 'output', text: "Type 'help' to view available commands." },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const nextIdRef = useRef(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 13) % 100}%`,
        top: `${(i * 29) % 100}%`,
        delay: (i % 7) * 0.4,
        duration: 4 + (i % 5),
      })),
    [],
  );

  const appendHistory = useCallback((kind: HistoryKind, text: string) => {
    setHistory((prev) => [...prev, { id: nextIdRef.current++, kind, text }]);
  }, []);

  const runCommand = useCallback(
    (rawValue: string) => {
      const command = rawValue.trim();
      if (!command) return;

      appendHistory('input', command);

      if (command === 'clear') {
        setHistory([]);
        return;
      }

      if (command === 'help') {
        appendHistory(
          'output',
          [
            'Available commands:',
            '• cd <path>      -> Navigate to a valid route',
            '• ls | dir        -> List major route directories',
            '• whoami          -> Identify current entity',
            '• ping deep       -> Check Deep Dey status',
            '• clear           -> Clear terminal output',
            '',
            'Hint: Hidden commands exist in this void...',
          ].join('\n'),
        );
        return;
      }

      if (command === 'ls' || command === 'dir') {
        appendHistory('output', ROUTE_DIRECTORY_LIST.join('\n'));
        return;
      }

      if (command === 'whoami') {
        appendHistory('output', 'Unidentified Entity roaming the void. (Login system bypassed).');
        return;
      }

      if (command === 'ping deep') {
        appendHistory('output', 'Request Timeout. Reason: Busy solving Irodov for JEE 2027.');
        return;
      }

      if (command === 'solve jee') {
        appendHistory(
          'error',
          'Warning: You are procrastinating. IIT KGP CSE target slipping by 0.01%. Redirection to study table initiated!',
        );
        window.setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (command === 'sudo rm -rf /') {
        setIsShaking(true);
        appendHistory('error', 'UNAUTHORIZED ACCESS DETECTED! INITIATING SYSTEM KICK!');
        window.setTimeout(() => setIsShaking(false), 700);
        window.setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (command.startsWith('cd ')) {
        const targetRaw = command.slice(3).trim();
        if (!targetRaw) {
          appendHistory('error', 'Usage: cd <path>');
          return;
        }
        const normalized = targetRaw.startsWith('/') ? targetRaw : `/${targetRaw}`;
        const target = ROUTE_ALIASES[normalized] || normalized;
        if (APP_ROUTES.includes(target as (typeof APP_ROUTES)[number])) {
          appendHistory('output', `Routing to ${target} ...`);
          navigate(target);
          return;
        }
        appendHistory('error', `Path not found: ${normalized}`);
        return;
      }

      appendHistory('error', "Command not found. My NanoGPT model wasn't trained on this. Type 'help'.");
    },
    [appendHistory, navigate],
  );

  const submitCommand = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setCommandHistory((prev) => [...prev, trimmed]);
      setCommandHistoryIndex(null);
      setInput('');
      runCommand(trimmed);
    },
    [runCommand],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [history, input]);

  return (
    <div className="relative min-h-[75vh] overflow-hidden bg-zinc-950 px-3 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/40 blur-[0.5px]"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [-8, 10, -8], opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.04)_1px,transparent_1px)] bg-[size:42px_42px]"
          animate={{ opacity: [0.08, 0.22, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, x: isShaking ? [0, -12, 12, -9, 9, -5, 5, 0] : 0 }}
        transition={{ duration: isShaking ? 0.55 : 0.45, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-[95%] max-w-3xl rounded-2xl border border-amber-500/30 bg-zinc-900/60 shadow-[0_0_50px_rgba(245,158,11,0.08)] backdrop-blur-xl"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center justify-between rounded-t-2xl border-b border-zinc-700/70 bg-zinc-950/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-amber-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300">Arch-Terminal Void</p>
          </div>
          <div className="text-[10px] text-zinc-500">status: signal-lost</div>
        </div>

        <div ref={outputRef} className="h-[420px] overflow-y-auto p-4 font-mono text-xs text-zinc-200 sm:text-sm">
          <div className="space-y-2.5">
            {history.map((entry) => (
              <div key={entry.id} className="whitespace-pre-wrap break-words leading-relaxed">
                {entry.kind === 'input' ? (
                  <div>
                    <PromptPrefix />
                    <span className="text-zinc-100">{entry.text}</span>
                  </div>
                ) : (
                  <span className={entry.kind === 'error' ? 'text-red-400' : 'text-zinc-300'}>{entry.text}</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-start">
            <PromptPrefix />
            <span className="break-all text-zinc-100">{input}</span>
            <motion.span
              className="ml-0.5 inline-block h-4 w-2 rounded-[2px] bg-amber-400/90"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submitCommand(input);
              return;
            }

            if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (commandHistory.length === 0) return;
              setCommandHistoryIndex((prev) => {
                const next = prev === null ? commandHistory.length - 1 : Math.max(prev - 1, 0);
                setInput(commandHistory[next] || '');
                return next;
              });
              return;
            }

            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCommandHistoryIndex((prev) => {
                if (prev === null) return null;
                const next = prev + 1;
                if (next >= commandHistory.length) {
                  setInput('');
                  return null;
                }
                setInput(commandHistory[next] || '');
                return next;
              });
            }
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-label="Arch terminal command input"
        />
      </motion.div>

      <div className="relative z-10 mx-auto mt-5 w-[95%] max-w-3xl">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => submitCommand('help')}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-zinc-900/70 px-4 py-2.5 font-mono text-xs text-amber-300 shadow-[0_0_22px_rgba(245,158,11,0.22)] transition-colors hover:bg-zinc-800/80 sm:text-sm"
        >
          <Sparkles size={14} />
          <span>[ ? ] System Manual</span>
        </motion.button>
      </div>
    </div>
  );
}
