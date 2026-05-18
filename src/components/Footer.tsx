import { Link } from 'react-router-dom';
import { Github, Instagram, Youtube, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const INDIA_TIME_ZONE = 'Asia/Kolkata';
const INDIA_GMT_LABEL = 'GMT +05:30';
const TIME_ZONE_TO_REGION: Record<string, string> = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
};

type FooterNavItem = {
  name: string;
  path: string;
  external?: boolean;
};

const ARCHITECTURE_LINKS: ReadonlyArray<FooterNavItem> = [
  { name: 'Home Node', path: '/' },
  { name: 'Projects Ledger', path: '/projects' },
  { name: 'Proof Dashboard', path: '/proof' },
  { name: 'Build Journal', path: '/journal' },
  { name: 'Now / Roadmap', path: '/now' },
  { name: 'System Status', path: '/status' },
  { name: 'Contact Engine', path: '/contact' },
  { name: 'Portfolio V2', path: 'https://qlynk.vercel.app/v2/portfolio', external: true },
];

const COMPLIANCE_LINKS = [
  { name: 'Legal Hub', path: '/legal' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'DMCA Policy', path: '/dmca' },
  { name: 'License Documentation', path: '/copyright' },
];

const SOCIAL_LINKS = [
  { name: 'Insta', icon: Instagram, path: 'https://instagram.com/deepdey.official' },
  { name: 'GitHub', icon: Github, path: 'https://github.com/deepdeyiitgn' },
  { name: 'YouTube', icon: Youtube, path: 'https://youtube.com/@deepdeyiit' },
  { name: 'Discord', icon: MessageCircle, path: 'https://discord.com/invite/t6ZKNw556n' },
];

const pad2 = (value: number) => String(value).padStart(2, '0');

const formatGmtOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `GMT ${sign}${pad2(hours)}:${pad2(minutes)}`;
};

const extractTimeZoneRegionName = (timeZone: string) => {
  const regionCode = timeZone.split('/')[1]?.split('_').join(' ') || timeZone;
  return regionCode;
};

const getTimeZoneRegionCode = (timeZone: string) => TIME_ZONE_TO_REGION[timeZone] || null;

const getLocalCountryLabel = (timeZone: string) => {
  const fallbackLabel = extractTimeZoneRegionName(timeZone);
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
    const displayName = new Intl.DisplayNames([locale], { type: 'region' });
    const timezoneRegion = getTimeZoneRegionCode(timeZone);
    if (timezoneRegion) {
      return displayName.of(timezoneRegion) || fallbackLabel;
    }

    const localeRegion = new Intl.Locale(locale).region;
    if (localeRegion) {
      return displayName.of(localeRegion) || fallbackLabel;
    }
  } catch {
    // Ignore and fallback to timezone segment.
  }
  return fallbackLabel;
};

const createClockFormatters = (timeZone: string) => ({
  date: new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
  day: new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
  }),
  time12h: new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }),
  time24h: new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }),
});

const formatClockLine = (date: Date, zoneLabel: string, formatters: ReturnType<typeof createClockFormatters>) => {
  const datePart = formatters.date.format(date);
  const dayPart = formatters.day.format(date).toUpperCase();
  const time12h = formatters.time12h.format(date);
  const time24h = formatters.time24h.format(date);

  return `${datePart} | ${dayPart} | ${time12h} | ${time24h} | (${zoneLabel})`;
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  const [activeModal, setActiveModal] = useState<'quicklink' | 'deep' | null>(null);
  const localTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    [],
  );
  const localCountry = useMemo(() => getLocalCountryLabel(localTimeZone), [localTimeZone]);
  const indiaClockFormatters = useMemo(() => createClockFormatters(INDIA_TIME_ZONE), []);
  const localClockFormatters = useMemo(() => createClockFormatters(localTimeZone), [localTimeZone]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setActiveModal(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  const indiaTimeLine = formatClockLine(now, `IST [${INDIA_GMT_LABEL}]`, indiaClockFormatters);
  const localOffsetMinutes = -now.getTimezoneOffset();
  const localZoneLabel = `${localCountry} [${formatGmtOffset(localOffsetMinutes)}]`;
  const localTimeLine = formatClockLine(now, localZoneLabel, localClockFormatters);

  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md pt-24 pb-12 px-6 overflow-hidden relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-black tracking-tighter text-amber-500 hover:opacity-80 transition-opacity">
              DEEP DEY.
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed font-light">
              Architecting high-performance digital ecosystems. <br /> Dedicated to structural integrity and innovative execution.
            </p>
            <div className="pt-4 p-4 border border-zinc-900 rounded-2xl bg-zinc-950/50">
              <p className="text-zinc-400 italic text-sm font-light leading-snug">
                "100% effort + extra 1% = <br /> <span className="text-amber-500 font-bold tracking-tight">Dream Achieved</span>"
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-[0.4em] font-black">Architecture</h4>
            <ul className="space-y-4">
              {ARCHITECTURE_LINKS.map((item) => (
                <li key={item.name}>
                  {item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-amber-500 transition-colors text-sm font-light flex items-center gap-2 group"
                    >
                      {item.name}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <Link to={item.path} className="text-zinc-500 hover:text-amber-500 transition-colors text-sm font-light">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-[0.4em] font-black">Compliance</h4>
            <ul className="space-y-4">
              {COMPLIANCE_LINKS.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-zinc-500 hover:text-amber-500 transition-colors text-sm font-light">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-amber-500/40" />
              <span>Verified Identity Node</span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-[0.4em] font-black">Network Nodes</h4>
            <div className="grid grid-cols-2 gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-amber-500/40 text-zinc-500 hover:text-amber-500 transition-all"
                  title={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
            <a
              href="https://en.uptodown.com/developer/deep-dey"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-center rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20"
            >
              Uptodown Profile
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
          <button
            type="button"
            onClick={() => setActiveModal('quicklink')}
            aria-label="Learn more about QuickLink"
            className="flex-1 max-w-sm mx-auto sm:mx-0 p-4 border border-zinc-800 rounded-2xl bg-zinc-900/50 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 transition-all text-left"
          >
            <p className="text-sm font-black tracking-tight">Powered by QuickLink™</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.2em] mt-1">Smart URL &amp; QR Platform</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('deep')}
            aria-label="Learn more about Deep"
            className="flex-1 max-w-sm mx-auto sm:mx-0 p-4 border border-zinc-800 rounded-2xl bg-zinc-900/50 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 transition-all text-left"
          >
            <p className="text-sm font-black tracking-tight">Powered by Deep™</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.2em] mt-1">AI &amp; Web Development Solutions</p>
          </button>
        </div>

        <div className="pt-12 border-t border-zinc-900 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">
                © 2020 - {currentYear} Deep Dey | All Right Reserved.
              </p>
              <p className="text-[10px] text-zinc-800 uppercase tracking-widest leading-relaxed">
                Architecting solutions across India & the Digital Frontier.
              </p>
              <div className="pt-2 space-y-1">
                <p className="text-[10px] font-mono text-zinc-500 tracking-wide break-all">
                  {indiaTimeLine}
                </p>
                <p className="text-[10px] font-mono text-zinc-600 tracking-wide break-all">
                  {localTimeLine}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 group cursor-help">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-amber-200 transition-colors">Core Systems Operational</span>
              </div>
              <div className="h-4 w-px bg-zinc-900" />
              <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest italic">Ver 13.05.2026.💞.02.55.PM</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="px-5 py-3 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-colors text-center"
            >
              {t('footer.book', 'Book post-2027 collaboration')}
            </Link>
            <Link
              to="/journal"
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-500 transition-colors text-center"
            >
              {t('footer.subscribe', 'Subscribe for updates')}
            </Link>
          </div>
        </div>
      </div>

      {activeModal === 'quicklink' && (
        <div
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setActiveModal(null);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quicklink-modal-title"
            tabIndex={-1}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Powered by</p>
                <h3 id="quicklink-modal-title" className="text-xl font-black text-amber-400 mt-1">QuickLink™</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-zinc-500 hover:text-amber-300 text-xl leading-none"
                aria-label="Close QuickLink popup"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mt-4">
              QuickLink is a smart URL and dynamic QR platform built for clean sharing, controlled redirects, and performance tracking.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed mt-3">
              Founder &amp; Creator: <span className="text-zinc-200 font-semibold">Deep Dey</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <a
                href="https://qlynk.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-colors"
              >
                Website
              </a>
              <a
                href="https://github.com/deepdeyiitgn"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-widest text-center hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://youtube.com/channel/UCrh1Mx5CTTbbkgW5O6iS2Tw/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-widest text-center hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://clock.qlynk.me"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-widest text-center hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              >
                Study Clock
              </a>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'deep' && (
        <div
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setActiveModal(null);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deep-modal-title"
            tabIndex={-1}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Powered by</p>
                <h3 id="deep-modal-title" className="text-xl font-black text-amber-400 mt-1">Deep™</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-zinc-500 hover:text-amber-300 text-xl leading-none"
                aria-label="Close Deep popup"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mt-4">
              I&apos;m Deep, a self-taught AI and web developer building high-performance digital systems for creators, students, and founders.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed mt-3">
              I also created <span className="text-zinc-200 font-semibold">Transparent Clock</span>, a minimal always-on-top focus companion for Windows.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <a
                href="https://qlynk.vercel.app/wiki"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-colors"
              >
                More Info
              </a>
              <a
                href="https://www.instagram.com/deepdey.official"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-widest text-center hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://github.com/deepdeyiitgn"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-widest text-center hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://discord.com/invite/t6ZKNw556n"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-widest text-center hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
