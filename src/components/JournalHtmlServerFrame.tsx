import { useEffect, useMemo, useState } from 'react';

type Props = {
  src: string;
  title: string;
  className?: string;
};

export default function JournalHtmlServerFrame({ src, title, className = '' }: Props) {
  const [height, setHeight] = useState(640);
  const frameStyle = useMemo(() => ({ height: `${height}px` }), [height]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event?.data || typeof event.data !== 'object') return;
      if (event.data.type !== 'journal-html-height') return;
      const nextHeight = Number(event.data.height || 0);
      if (!Number.isFinite(nextHeight)) return;
      setHeight((prev) => Math.max(prev, Math.max(320, Math.ceil(nextHeight))));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    setHeight(640);
  }, [src]);

  return (
    <iframe
      src={src}
      title={title}
      className={`w-full border border-zinc-800 rounded-2xl bg-zinc-950 ${className}`.trim()}
      style={frameStyle}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
