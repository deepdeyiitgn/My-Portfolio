import type { ReactNode } from 'react';

export type PointerMode = 'default' | 'action' | 'text' | 'input' | 'select' | 'click' | 'drag';

const buildCursorUrl = (svg: string, x: number, y: number, fallback: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${fallback}`;

export const POINTER_FAMILY: Record<PointerMode, string[]> = {
  default: ['comet', 'neon-needle', 'prism-arrow', 'orbit', 'pulse-core', 'aurora-dart', 'glass-arrow'],
  action: ['vector-wing', 'quantum-tip', 'flare-triangle', 'spark-lance'],
  text: ['scribe', 'input-beam', 'ink-beam'],
  input: ['input-beam', 'scribe'],
  select: ['selection-ring', 'anchor-grid'],
  click: ['click-burst', 'pulse-core', 'nova-click'],
  drag: ['drag-node', 'anchor-grid', 'magnet-drag'],
};

export const POINTER_SYSTEM_CURSORS: Record<PointerMode, string> = {
  default: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#f97316"/></linearGradient></defs><path d="M5 4L26 17L15.7 19.7L18 31L5 4Z" fill="url(#g)" stroke="#fff7d6" stroke-width="1.4" stroke-linejoin="round"/><path d="M16.8 20.3L24.5 28" stroke="#fde68a" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    5,
    4,
    'default',
  ),
  action: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M5 4L27 16L15.2 19L17.4 31L5 4Z" fill="#f59e0b" stroke="#fff7d6" stroke-width="1.5" stroke-linejoin="round"/><path d="M24 6.5H31M27.5 3V10M23.5 11.5L30.5 14.5" stroke="#fde68a" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    5,
    4,
    'pointer',
  ),
  text: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="15.4" y="4" width="5.2" height="28" rx="2.6" fill="#f59e0b"/><rect x="9" y="4.5" width="18" height="3" rx="1.5" fill="#fde68a"/><rect x="9" y="28.5" width="18" height="3" rx="1.5" fill="#fde68a"/></svg>`,
    18,
    18,
    'text',
  ),
  input: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect x="15.4" y="4" width="5.2" height="28" rx="2.6" fill="#f59e0b"/><rect x="9" y="4.5" width="18" height="3" rx="1.5" fill="#fde68a"/><rect x="9" y="28.5" width="18" height="3" rx="1.5" fill="#fde68a"/><circle cx="29" cy="9" r="3" fill="#fbbf24" opacity="0.9"/></svg>`,
    18,
    18,
    'text',
  ),
  select: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="9" fill="rgba(245,158,11,0.16)" stroke="#f59e0b" stroke-width="2"/><path d="M18 6V10M18 26V30M6 18H10M26 18H30" stroke="#fde68a" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    18,
    18,
    'crosshair',
  ),
  click: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M5 4L26 17L15.5 19.5L17.5 31L5 4Z" fill="#f59e0b" stroke="#fff7d6" stroke-width="1.5" stroke-linejoin="round"/><path d="M25 6L27.5 2.5M29 9.5L33 8.5M27 14L31 17" stroke="#fde68a" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    5,
    4,
    'pointer',
  ),
  drag: buildCursorUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M5 4L26 17L15.5 19.5L17.5 31L5 4Z" fill="#f59e0b" stroke="#fff7d6" stroke-width="1.5" stroke-linejoin="round"/><path d="M22.5 10.5L30 18M25.2 21.5H33M29 14V29" stroke="#fde68a" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    5,
    4,
    'grab',
  ),
};

export function renderPointerSvg(variant: string, isClicking: boolean): ReactNode {
  const sharedClass = `w-[36px] h-[36px] drop-shadow-[0_0_20px_rgba(251,191,36,0.45)] ${isClicking ? 'scale-[0.86]' : 'scale-100'} transition-transform duration-100`;

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
    case 'aurora-dart':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <defs>
            <linearGradient id="dd-ptr-aurora" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path d="M5 4L26 16.2L15.6 19L17.4 30L5 4Z" fill="url(#dd-ptr-aurora)" stroke="#fff7d6" strokeWidth="1.2" />
          <circle cx="24.8" cy="9.2" r="1.5" fill="#67e8f9" />
        </svg>
      );
    case 'glass-arrow':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L25.5 16L15 18.8L16.8 30L5 4Z" fill="#ffffff" fillOpacity="0.2" stroke="#fde68a" strokeWidth="1.2" />
          <path d="M8.5 8.5L22.5 16.5L14.8 18.7L15.9 25.8L8.5 8.5Z" fill="#fbbf24" fillOpacity="0.38" />
        </svg>
      );
    case 'spark-lance':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M4.8 4L25.4 15.6L14.8 18.8L16.8 30L4.8 4Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.1" />
          <path d="M24.8 7.2L28.5 4.1M27.8 11L32.5 11M25.5 14.5L29.2 17.8" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'ink-beam':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <rect x="15.2" y="4" width="3.3" height="26" rx="1.6" fill="#f59e0b" />
          <rect x="8.7" y="4.8" width="16" height="2.1" rx="1" fill="#fde68a" />
          <rect x="8.7" y="27.1" width="16" height="2.1" rx="1" fill="#fde68a" />
          <circle cx="25.8" cy="8.8" r="1.8" fill="#22d3ee" />
        </svg>
      );
    case 'nova-click':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L25.5 16L15.2 18.9L17 30L5 4Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.1" />
          <circle cx="25.5" cy="9.2" r="3.3" fill="#fbbf24" opacity="0.24" />
          <circle cx="25.5" cy="9.2" r="1.4" fill="#fde68a" />
        </svg>
      );
    case 'magnet-drag':
      return (
        <svg viewBox="0 0 34 34" className={sharedClass}>
          <path d="M5 4L24.6 15.8L15 18.8L16.9 30L5 4Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.1" />
          <path d="M23.5 17.5H30.5M27 14V21M24.4 14.8L29.6 20.2" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
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
