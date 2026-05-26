import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const BANNER_KEY = 'dd_cookie_ack';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(BANNER_KEY)) {
        setVisible(true);
      }
    } catch {
      // Private browsing / storage disabled — skip banner.
    }
  }, []);

  if (!visible) return null;

  const handleAck = () => {
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch { /* noop */ }
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700 px-4 py-3 md:px-6"
      role="region"
      aria-label="Cookie and tracking notice"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie size={18} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-zinc-300 text-xs leading-relaxed flex-1">
          This site uses internal-only page analytics, external-link tracking, and session cookies to improve reliability and prevent abuse. Tracking is always on.{' '}
          <Link to="/cookies" className="text-amber-400 underline hover:text-amber-300 transition-colors">
            Cookie &amp; Tracking Policy
          </Link>
        </p>
        <button
          onClick={handleAck}
          className="shrink-0 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black text-xs font-bold rounded-lg transition-colors"
        >
          Accept &amp; Continue
        </button>
      </div>
    </div>
  );
}
