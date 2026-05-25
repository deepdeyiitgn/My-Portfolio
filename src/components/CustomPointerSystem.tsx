import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { POINTER_FAMILY, POINTER_SYSTEM_CURSORS, renderPointerSvg, type PointerMode } from '../data/pointerAssets';

type PointerPrefs = {
  customEnabled: boolean;
  nativeVisible: boolean;
};

const PREF_COOKIE_KEY = 'dd_pointer_prefs_v1';
const SESSION_TIPS_KEY = 'dd_pointer_tips_seen';
const LONG_LIVED_COOKIE_SECONDS = 60 * 60 * 24 * 365 * 20;
const DRAG_THRESHOLD_PIXELS = 2;
const POINTER_VARIANT_CYCLE_INTERVAL_MS = 1200;
const SHORTCUT_MESSAGE_DISPLAY_DURATION_MS = 3200;
const DESKTOP_MIN_WIDTH_PIXELS = 768;
const POINTER_GLOW_CORE_CLASS = 'absolute left-[8px] top-[8px] w-5 h-5 rounded-full bg-amber-300/35 blur-[8px]';
const POINTER_GLOW_RING_CLASS = 'absolute left-[6px] top-[6px] w-7 h-7 rounded-full border border-amber-300/30';

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
    if (supportsDesktopPointer && customEnabled && !nativeVisible) {
      root.classList.add('dd-hide-native-cursor');
    } else {
      root.classList.remove('dd-hide-native-cursor');
    }
    return () => root.classList.remove('dd-hide-native-cursor');
  }, [nativeVisible, supportsDesktopPointer, customEnabled]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (supportsDesktopPointer && nativeVisible && customEnabled) {
      root.classList.add('dd-use-system-cursor');
      root.style.setProperty('--dd-system-cursor', POINTER_SYSTEM_CURSORS[pointerMode]);
    } else {
      root.classList.remove('dd-use-system-cursor');
      root.style.removeProperty('--dd-system-cursor');
    }

    return () => {
      root.classList.remove('dd-use-system-cursor');
      root.style.removeProperty('--dd-system-cursor');
    };
  }, [nativeVisible, pointerMode, supportsDesktopPointer, customEnabled]);

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
        setShortcutMessage('Native cursor hidden. Press Ctrl + X to show it again.');
        return;
      }
      if (key === 'x') {
        event.preventDefault();
        setNativeVisible(true);
        setShortcutMessage('Native cursor restored.');
        return;
      }
      if (key === 'b') {
        event.preventDefault();
        setCustomEnabled((prev) => {
          const next = !prev;
          if (!next && !nativeVisible) {
            setNativeVisible(true);
            setShortcutMessage('Custom pointer hidden. Native cursor restored for safety.');
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
            <span aria-hidden="true" className={POINTER_GLOW_CORE_CLASS} />
            <span aria-hidden="true" className={POINTER_GLOW_RING_CLASS} />
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
