import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type PointerPrefs = {
  customEnabled: boolean;
  nativeVisible: boolean;
};

type PointerMode = 'default' | 'action' | 'text' | 'input' | 'select' | 'click' | 'drag';

const PREF_COOKIE_KEY = 'dd_pointer_prefs_v1';
const SESSION_TIPS_KEY = 'dd_pointer_tips_seen';
const LONG_LIVED_COOKIE_SECONDS = 60 * 60 * 24 * 365 * 20;
const DRAG_THRESHOLD_PIXELS = 2;
const POINTER_VARIANT_CYCLE_INTERVAL_MS = 1200;
const SHORTCUT_MESSAGE_DISPLAY_DURATION_MS = 3200;
const DESKTOP_MIN_WIDTH_PIXELS = 768;

const POINTER_FAMILY: Record<PointerMode, string[]> = {
  default: ['comet', 'neon-needle', 'prism-arrow', 'orbit', 'pulse-core'],
  action: ['vector-wing', 'quantum-tip', 'flare-triangle'],
  text: ['scribe', 'input-beam'],
  input: ['input-beam', 'scribe'],
  select: ['selection-ring', 'anchor-grid'],
  click: ['click-burst', 'pulse-core'],
  drag: ['drag-node', 'anchor-grid'],
};

function parsePrefsCookie(): PointerPrefs {
  if (typeof document === 'undefined') return { customEnabled: true, nativeVisible: true };
  const raw = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${PREF_COOKIE_KEY}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  if (!raw) return { customEnabled: true, nativeVisible: true };
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<PointerPrefs>;
    return {
      customEnabled: parsed.customEnabled ?? true,
      nativeVisible: parsed.nativeVisible ?? true,
    };
  } catch {
    return { customEnabled: true, nativeVisible: true };
  }
}

function writePrefsCookie(prefs: PointerPrefs) {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${PREF_COOKIE_KEY}=${encoded}; path=/; max-age=${LONG_LIVED_COOKIE_SECONDS}; samesite=lax`;
}

function clearPrefsCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${PREF_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

function renderPointerSvg(variant: string, isClicking: boolean) {
  const sharedClass = `w-[34px] h-[34px] drop-shadow-[0_0_16px_rgba(245,158,11,0.45)] ${isClicking ? 'scale-90' : 'scale-100'} transition-transform duration-100`;

  switch (variant) {
    case 'comet':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <defs>
            <linearGradient id="dd-ptr-comet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path d="M4 3L25 16L15 18L17 29L4 3Z" fill="url(#dd-ptr-comet)" stroke="#fde68a" strokeWidth="1.2" />
        </svg>
      );
    case 'neon-needle':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M6 5L28 14L15 19L11 30L6 5Z" fill="#18181b" stroke="#f59e0b" strokeWidth="1.6" />
          <path d="M9 9L22 14.4L13.7 17.6L11.4 24.8L9 9Z" fill="#f59e0b" />
        </svg>
      );
    case 'prism-arrow':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <defs>
            <radialGradient id="dd-ptr-prism" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#fff7d6" />
              <stop offset="45%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>
          <path d="M5 4L27 17L16 19L17 30L5 4Z" fill="url(#dd-ptr-prism)" stroke="#fef3c7" strokeWidth="1" />
          <path d="M14 20L21 27" stroke="#fef3c7" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'orbit':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 5L24 16L15 19L17 30L5 5Z" fill="#f59e0b" stroke="#fde68a" strokeWidth="1" />
          <circle cx="24.5" cy="9.5" r="4.3" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="24.5" cy="9.5" r="1.2" fill="#fde68a" />
        </svg>
      );
    case 'pulse-core':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L24 16L14.7 18.6L16.5 29.6L5 4Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.4" />
          <circle cx="24" cy="10.5" r="3.9" fill="#f59e0b" opacity="0.22" />
          <circle cx="24" cy="10.5" r="2.3" fill="#fbbf24" />
        </svg>
      );
    case 'vector-wing':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M4.5 4.5L26 15L14.6 18.2L16 29.5L4.5 4.5Z" fill="#f59e0b" stroke="#fde68a" strokeWidth="1.1" />
          <path d="M13.8 17.8L25.5 20.2L21.5 24.8L16.8 21.6Z" fill="#fde68a" opacity="0.8" />
        </svg>
      );
    case 'quantum-tip':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L25 15.8L15 18.5L16.9 30L5 4Z" fill="#111827" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M20 8.5L29 12.5L22.8 15.8Z" fill="#fbbf24" />
          <circle cx="27.7" cy="12" r="1.2" fill="#fef3c7" />
        </svg>
      );
    case 'flare-triangle':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L24.8 16.4L15 19L16.8 29.8L5 4Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.2" />
          <path d="M23 8L30 8M26.5 4.5V11.5" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'scribe':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <rect x="13.2" y="4" width="2.4" height="24" rx="1.2" fill="#f59e0b" />
          <rect x="9.2" y="6.2" width="10.4" height="2" rx="1" fill="#fde68a" />
          <path d="M15.5 29L12 24.5H19L15.5 29Z" fill="#fbbf24" />
        </svg>
      );
    case 'input-beam':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <rect x="15.2" y="4" width="3.2" height="26" rx="1.6" fill="#f59e0b" />
          <rect x="9" y="4.8" width="15.5" height="2.2" rx="1.1" fill="#fde68a" />
          <rect x="9" y="27" width="15.5" height="2.2" rx="1.1" fill="#fde68a" />
        </svg>
      );
    case 'selection-ring':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <circle cx="17" cy="17" r="9.2" fill="none" stroke="#f59e0b" strokeWidth="2.1" />
          <circle cx="17" cy="17" r="5.3" fill="#fbbf24" opacity="0.2" />
          <path d="M6 17H9.5M24.5 17H28M17 6V9.5M17 24.5V28" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'anchor-grid':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5.2 4.2L24.5 16L14.8 18.8L16.8 29.5L5.2 4.2Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.1" />
          <path d="M23 21.5H30M26.5 18V25" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="26.5" cy="21.5" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
        </svg>
      );
    case 'click-burst':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L25 16L15 18.8L16.8 30L5 4Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.1" />
          <path d="M25 7L27 3M28.4 9.6L32.2 8.7M27 13.5L30.2 16" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'drag-node':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4.5L24.2 16L14.8 18.7L16.6 29.4L5 4.5Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.1" />
          <path d="M22.8 10.4L29.6 17.2" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="29.6" cy="17.2" r="2" fill="#fbbf24" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M4 3L25 16L15 18L17 29L4 3Z" fill="#f59e0b" stroke="#fde68a" strokeWidth="1.2" />
        </svg>
      );
  }
}

export default function CustomPointerSystem({ showTipsAnchor = true }: { showTipsAnchor?: boolean }) {
  const initialPrefs = useMemo(() => parsePrefsCookie(), []);
  const [customEnabled, setCustomEnabled] = useState(initialPrefs.customEnabled);
  const [nativeVisible, setNativeVisible] = useState(initialPrefs.nativeVisible);
  const [showTips, setShowTips] = useState(false);
  const [shortcutMessage, setShortcutMessage] = useState('');
  const [supportsDesktopPointer, setSupportsDesktopPointer] = useState(false);
  const [mouseDetected, setMouseDetected] = useState(false);
  const [isInsideViewport, setIsInsideViewport] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [pointerMode, setPointerMode] = useState<PointerMode>('default');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    writePrefsCookie({ customEnabled, nativeVisible });
  }, [customEnabled, nativeVisible]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');

    const updateCapability = () => {
      const hasFinePointer = mql.matches;
      const likelyDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH_PIXELS;
      setSupportsDesktopPointer(hasFinePointer && likelyDesktop);
    };
    updateCapability();
    mql.addEventListener('change', updateCapability);
    window.addEventListener('resize', updateCapability);
    return () => {
      mql.removeEventListener('change', updateCapability);
      window.removeEventListener('resize', updateCapability);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showTipsAnchor || !supportsDesktopPointer || !mouseDetected) return;
    const hasSeen = window.sessionStorage.getItem(SESSION_TIPS_KEY);
    if (!hasSeen) setShowTips(true);
  }, [showTipsAnchor, supportsDesktopPointer, mouseDetected]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (supportsDesktopPointer && !nativeVisible) {
      root.classList.add('dd-hide-native-cursor');
    } else {
      root.classList.remove('dd-hide-native-cursor');
    }
    return () => root.classList.remove('dd-hide-native-cursor');
  }, [nativeVisible, supportsDesktopPointer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMouseMove = (event: MouseEvent) => {
      setMouseDetected(true);
      setIsInsideViewport(true);
      setPosition({ x: event.clientX, y: event.clientY });

      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      if (!element) {
        setPointerMode(isDragging ? 'drag' : 'default');
        return;
      }

      const style = window.getComputedStyle(element);
      const cursorValue = style.cursor;
      const isInputElement = Boolean(element.closest('input, textarea, select, [contenteditable="true"]'));
      const isInteractive = Boolean(element.closest('a, button, [role="button"], summary, label[for]'));

      if (isDragging) {
        setPointerMode('drag');
      } else if (isSelecting) {
        setPointerMode('select');
      } else if (isInputElement) {
        setPointerMode('input');
      } else if (cursorValue.includes('text')) {
        setPointerMode('text');
      } else if (isMouseDown) {
        setPointerMode('click');
      } else if (isInteractive || cursorValue.includes('pointer')) {
        setPointerMode('action');
      } else {
        setPointerMode('default');
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      setIsMouseDown(true);
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      setPointerMode('click');
    };

    const onMouseUp = () => {
      setIsMouseDown(false);
      setIsDragging(false);
      dragStartRef.current = null;
    };

    const onMouseLeaveWindow = () => setIsInsideViewport(false);
    const onMouseEnterWindow = () => setIsInsideViewport(true);

    const onSelectionChange = () => {
      const selectionText = window.getSelection()?.toString().trim() || '';
      setIsSelecting(selectionText.length > 0);
    };

    const onTouchStart = () => {
      setMouseDetected(false);
      setIsInsideViewport(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        setNativeVisible(false);
        setCustomEnabled(true);
        setShortcutMessage('Original cursor hidden. Press Ctrl + X to show it again.');
        return;
      }
      if (key === 'x') {
        event.preventDefault();
        setNativeVisible(true);
        setShortcutMessage('Original cursor restored.');
        return;
      }
      if (key === 'b') {
        event.preventDefault();
        setCustomEnabled((prev) => {
          const next = !prev;
          if (!next && !nativeVisible) {
            setNativeVisible(true);
            setShortcutMessage('Custom pointer hidden. Original cursor restored for safety.');
            return false;
          }
          setShortcutMessage(next ? 'Custom pointer enabled.' : 'Custom pointer disabled.');
          return next;
        });
      }
    };

    const onDragMove = (event: MouseEvent) => {
      if (!isMouseDown || !dragStartRef.current) return;
      const diffX = Math.abs(event.clientX - dragStartRef.current.x);
      const diffY = Math.abs(event.clientY - dragStartRef.current.y);
      if (diffX > DRAG_THRESHOLD_PIXELS || diffY > DRAG_THRESHOLD_PIXELS) setIsDragging(true);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('mouseout', onMouseLeaveWindow);
    window.addEventListener('mouseover', onMouseEnterWindow);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('selectionchange', onSelectionChange);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('mouseout', onMouseLeaveWindow);
      window.removeEventListener('mouseover', onMouseEnterWindow);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [isDragging, isMouseDown, isSelecting, nativeVisible]);

  useEffect(() => {
    const timer = window.setInterval(() => setCycleIndex((prev) => prev + 1), POINTER_VARIANT_CYCLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!shortcutMessage) return;
    const timer = window.setTimeout(() => setShortcutMessage(''), SHORTCUT_MESSAGE_DISPLAY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [shortcutMessage]);

  const activeVariant = useMemo(() => {
    const family = POINTER_FAMILY[pointerMode] || POINTER_FAMILY.default;
    return family[cycleIndex % family.length];
  }, [pointerMode, cycleIndex]);

  const showCustomPointer = supportsDesktopPointer && mouseDetected && customEnabled && isInsideViewport;

  const closeTips = () => {
    setShowTips(false);
    window.sessionStorage.setItem(SESSION_TIPS_KEY, '1');
  };

  const resetAllPointerPrefs = () => {
    clearPrefsCookie();
    window.sessionStorage.removeItem(SESSION_TIPS_KEY);
    setCustomEnabled(true);
    setNativeVisible(true);
    setShowTips(true);
    setShortcutMessage('Pointer settings reset.');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {showTips && showTipsAnchor && supportsDesktopPointer && (
        <div className="fixed left-6 bottom-24 w-[320px] max-w-[calc(100vw-1.5rem)] z-[2147483646] pointer-events-auto">
          <div className="relative rounded-2xl border border-zinc-700 bg-zinc-900/90 backdrop-blur-xl p-4 shadow-[0_15px_50px_rgba(0,0,0,0.55)]">
            <button
              type="button"
              onClick={closeTips}
              className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Close pointer tips"
            >
              <X size={14} />
            </button>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-400">Custom Pointer Tips</p>
            <ul className="mt-2.5 space-y-1.5 text-[12px] text-zinc-300 leading-relaxed">
              <li><span className="text-zinc-100 font-semibold">Ctrl + Z</span> → Hide original cursor</li>
              <li><span className="text-zinc-100 font-semibold">Ctrl + X</span> → Show original cursor</li>
              <li><span className="text-zinc-100 font-semibold">Ctrl + B</span> → Toggle custom pointer</li>
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/70 px-2 py-1.5 text-zinc-400">
                Native: <span className="text-zinc-100">{nativeVisible ? 'Visible' : 'Hidden'}</span>
              </div>
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/70 px-2 py-1.5 text-zinc-400">
                Custom: <span className="text-zinc-100">{customEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={resetAllPointerPrefs}
              className="mt-3 w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              Reset Pointer Settings
            </button>
          </div>
        </div>
      )}

      {shortcutMessage && supportsDesktopPointer && (
        <div className="fixed left-6 bottom-44 z-[2147483646] rounded-xl border border-amber-500/30 bg-black/85 px-3.5 py-2 text-[12px] text-amber-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {shortcutMessage}
        </div>
      )}

      {showCustomPointer && (
        <div
          aria-hidden="true"
          className="fixed pointer-events-none z-[2147483647] dd-custom-pointer"
          style={{ transform: `translate3d(${position.x - 5}px, ${position.y - 4}px, 0)` }}
        >
          <div className="relative dd-pointer-float">
            {renderPointerSvg(activeVariant, isMouseDown)}
            {(isMouseDown || isSelecting) && (
              <span
                className={`absolute left-[10px] top-[10px] w-6 h-6 rounded-full border ${isSelecting ? 'border-cyan-300/70' : 'border-amber-300/70'} animate-ping`}
              />
            )}
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
