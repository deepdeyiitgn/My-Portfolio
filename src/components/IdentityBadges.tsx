import { useEffect, useState } from 'react';

interface IconProps {
  className?: string;
}

const SVG_ROOT_CLASS = 'w-full h-full block';
const svgCache = new Map<string, string>();
const svgPromiseCache = new Map<string, Promise<string>>();

function normalizeSvgMarkup(markup: string) {
  const withoutXmlHeader = markup
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .trim();

  return withoutXmlHeader.replace(/<svg\b([^>]*)>/i, (_match, rawAttrs: string) => {
    const attrs = rawAttrs
      .replace(/\s(?:width|height|class|style|aria-hidden|focusable|role)=("[^"]*"|'[^']*')/gi, '')
      .trim();
    const normalizedAttrs = attrs ? ` ${attrs}` : '';
    return `<svg${normalizedAttrs} class="${SVG_ROOT_CLASS}" aria-hidden="true" focusable="false">`;
  });
}

function loadSvgMarkup(path: string) {
  const cached = svgCache.get(path);
  if (cached) return Promise.resolve(cached);

  const existingPromise = svgPromiseCache.get(path);
  if (existingPromise) return existingPromise;

  const promise = fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      return response.text();
    })
    .then((markup) => {
      const normalized = normalizeSvgMarkup(markup);
      svgCache.set(path, normalized);
      svgPromiseCache.delete(path);
      return normalized;
    })
    .catch((error) => {
      svgPromiseCache.delete(path);
      throw error;
    });

  svgPromiseCache.set(path, promise);
  return promise;
}

function InlineSvgBadge({
  path,
  className = 'w-3 h-3',
}: {
  path: string;
  className?: string;
}) {
  const [svgMarkup, setSvgMarkup] = useState<string>(() => svgCache.get(path) || '');

  useEffect(() => {
    let cancelled = false;

    loadSvgMarkup(path)
      .then((markup) => {
        if (!cancelled) setSvgMarkup(markup);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup('');
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!svgMarkup) {
    return <span aria-hidden="true" className={`inline-block shrink-0 ${className}`} />;
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export function VerifiedTickIcon({ className = 'w-3 h-3' }: IconProps) {
  return <InlineSvgBadge path="/verified.svg" className={className} />;
}

export function CrownBadgeIcon({ className = 'w-3 h-3' }: IconProps) {
  return <InlineSvgBadge path="/crown.svg" className={className} />;
}
