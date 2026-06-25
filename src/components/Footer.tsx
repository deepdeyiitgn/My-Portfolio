import { Link } from 'react-router-dom';
import { Github, Instagram, Youtube, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
  { name: 'Security Policy', path: '/security' },
  { name: 'License Terms', path: '/license' },
  { name: 'DMCA Policy', path: '/dmca' },
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
  const [qlOpen, setQlOpen] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);
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
            {/* Uptodown Button */}
            {/* Uptodown Button */}
            <a
              href="https://en.uptodown.com/developer/deep-dey"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-center rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20"
            >
              Uptodown Profile
            </a>
            
            {/* ── Unified Support Box ── */}
            <div className="mt-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] text-center mb-1">
                Support The Build
              </span>
              
              {/* 1. GitHub Sponsor Button (Small) */}
              <div className="flex justify-center">
                <iframe 
                  src="https://github.com/sponsors/deepdeyiitgn/button" 
                  title="Sponsor deepdeyiitgn" 
                  height="32" 
                  width="114" 
                  style={{ border: 0, borderRadius: '6px' }}
                ></iframe>
              </div>

              <div className="flex gap-2 w-full">
                {/* 2. Razorpay Link */}
                <a
                  href="https://razorpay.com/payment-button/pl_RKb4InVhkRbYOd/view/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-500 font-bold text-center rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center"
                >
                  Razorpay
                </a>

                {/* 3. Personal UPI (Click to Copy) */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText('pujadey200314@okhdfcbank');
                    const btn = e.currentTarget;
                    btn.innerText = 'COPIED!';
                    btn.classList.add('text-green-400', 'border-green-500/50');
                    setTimeout(() => {
                      btn.innerText = 'COPY UPI';
                      btn.classList.remove('text-green-400', 'border-green-500/50');
                    }, 2000);
                  }}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-center rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-95 flex items-center justify-center"
                >
                  Copy UPI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Powered-by watermarks ── */}

        {/* ── Powered-by watermarks ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
          {/* QuickLink trigger */}
          <button
            onClick={() => setQlOpen(true)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
          >
            <img src="https://qlynk.vercel.app/quicklink-logo.svg" alt="QuickLink" className="h-6" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[13px] font-semibold text-zinc-300">
                Powered by QuickLink<span className="text-[9px] align-super">™</span>
              </span>
              <span className="text-[11px] text-zinc-500">#1 URL Shortening Platform</span>
            </div>
          </button>

          <div className="hidden sm:block h-8 w-px bg-zinc-800" />

          {/* Deep trigger */}
          <button
            onClick={() => setDeepOpen(true)}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer hover:scale-[1.03] transition-transform"
          >
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#27272a,#52525b)' }}>
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white">
                <path d="M12 2L15 8H9L12 2ZM4 10H20L12 22L4 10Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-zinc-300">
                Powered by Deep<span className="text-[9px] align-super">™</span>
              </span>
              <span className="text-[11px] text-zinc-500">AI &amp; Web Development Solutions</span>
            </div>
          </button>
        </div>

        {/* ── QuickLink Modal ── */}
        {qlOpen && createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/55 backdrop-blur-[4px] px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setQlOpen(false); }}
          >
            <div className="relative w-[90%] max-w-[420px] rounded-3xl text-center shadow-[0_40px_100px_rgba(0,0,0,.6)]"
              style={{ background: '#18181b', padding: '28px 22px 22px' }}>
              <button
                onClick={() => setQlOpen(false)}
                className="absolute top-3 right-4 bg-transparent border-none text-[18px] cursor-pointer text-zinc-500 hover:text-zinc-100 transition-colors"
              >✕</button>
              <div className="mb-3">
                <img src="https://qlynk.vercel.app/quicklink-logo.svg" alt="QuickLink" className="h-9 mx-auto mb-2.5" />
                <h2 className="m-0 text-[18px] font-bold text-zinc-100">QuickLink<span className="text-[8px] align-super">™</span></h2>
                <p className="text-[12px] text-zinc-400 mt-1">Smart URL &amp; QR Platform</p>
              </div>
              <div className="text-left">
                <p className="text-[12px] text-zinc-400 leading-[1.6] my-2">QuickLink is an all-in-one smart link shortening and QR platform designed for speed, clarity, and control.</p>
                <p className="text-[12px] text-zinc-400 leading-[1.6] my-2">Create short links, generate dynamic QR codes, manage redirects, and track performance — all in one place.</p>
                <p className="text-[12px] text-zinc-400 leading-[1.6] my-2">Built for creators, developers, students and modern businesses who value simplicity and efficiency.</p>
                <p className="text-[12px] text-zinc-300 mt-2"><strong>Founder &amp; Creator:</strong> Deep Dey</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  {
                    url: 'https://qlynk.vercel.app',
                    label: 'Website',
                    style: { background: 'linear-gradient(135deg,#38bdf8,#6366f1)' },
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
                  },
                  {
                    url: 'https://github.com/deepdeyiitgn',
                    label: 'GitHub',
                    style: { background: 'linear-gradient(135deg,#1e293b,#334155)' },
                    icon: <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.4 2.9 8.2 6.9 9.5.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.3.9 1.3.9.8 1.4 2 1 2.6.8.1-.6.3-1 .6-1.3-2.2-.3-4.5-1.2-4.5-5.2 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c2-.1 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.8 1 1.7 1 2.8 0 4-2.3 4.9-4.5 5.2.3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.5C22 6.6 17.5 2 12 2z" fill="white"/></svg>,
                  },
                  {
                    url: 'https://youtube.com/channel/UCrh1Mx5CTTbbkgW5O6iS2Tw/',
                    label: 'YouTube',
                    style: { background: 'linear-gradient(135deg,#ef4444,#db2777)' },
                    icon: <svg viewBox="0 0 24 24" width="15" height="15"><path d="M23 12s0-3.5-.4-5c-.2-.8-.8-1.4-1.6-1.6C19.5 5 12 5 12 5s-7.5 0-9 .4c-.8.2-1.4.8-1.6 1.6C1 8.5 1 12 1 12s0 3.5.4 5c.2.8.8 1.4 1.6 1.6 1.5.4 9 .4 9 .4s7.5 0 9-.4c.8-.2 1.4-.8 1.6-1.6.4-1.5.4-5 .4-5zM10 15V9l6 3-6 3z" fill="white"/></svg>,
                  },
                  {
                    url: 'https://clock.qlynk.me',
                    label: 'Study Clock',
                    style: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
                    icon: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
                  },
                ].map(({ url, label, style, icon }) => (
                  <button
                    key={label}
                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    style={style}
                    className="flex items-center justify-center gap-1.5 py-2.5 border-none rounded-xl text-[12px] font-semibold cursor-pointer text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.35)] transition-all"
                  >
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}

        {/* ── Deep Modal ── */}
        {deepOpen && createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/60 backdrop-blur-[5px] px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setDeepOpen(false); }}
          >
            <div className="relative w-full max-w-[350px] rounded-[18px] text-center shadow-[0_20px_40px_rgba(0,0,0,.7)]"
              style={{ background: '#18181b', padding: '26px 18px' }}>
              <button
                onClick={() => setDeepOpen(false)}
                className="absolute top-2.5 right-3.5 text-[22px] font-bold cursor-pointer bg-transparent border-none text-zinc-500 hover:text-zinc-100 transition-colors leading-none"
              >&times;</button>
              <img
                src="https://qlynk.me/wiki-images/Deep_Dey_New.png"
                alt="Deep Dey"
                className="w-[72px] h-[72px] rounded-full object-cover border-2 border-zinc-700 shadow-[0_0_16px_rgba(245,158,11,0.35)] mb-3 mx-auto"
              />
              <div className="text-[18px] font-extrabold mb-2 text-zinc-100">Hello, I&apos;m Deep!</div>
              <p className="text-[12px] text-zinc-400 mb-4 leading-[1.55]">
                I&apos;m a <strong className="text-zinc-200">Class 12 Student</strong> and a self-taught{' '}
                <strong className="text-zinc-200">Software Architect &amp; AI Engineer</strong> (3+ Years). 🚀
                <br /><br />
                I architect <span className="text-amber-500 font-bold">high-performance digital systems</span> —
                from AI-powered tools to full-stack platforms — dedicated to structural integrity and innovative execution. ⚡
                <br /><em className="text-zinc-500">Open-Source · Performance-First · System Thinking</em>
              </p>
              <p className="text-[10px] text-zinc-600 mt-3 border-t border-zinc-800 pt-2.5">
                &copy; {currentYear} Deep Dey | All Rights Reserved | QuickLink &amp; Deep Dey Portfolio
              </p>
              <div className="flex gap-1.5 justify-center flex-wrap mb-2 mt-2.5">
                {[
                  { key: 'portfolio', label: 'My Portfolio', style: { background: 'linear-gradient(135deg,#27272a,#52525b)' }, url: 'https://deepdey.vercel.app/' },
                  { key: 'insta', label: 'Instagram', style: { background: 'linear-gradient(45deg,#f09433 0%,#dc2743 50%,#bc1888 100%)' }, url: 'https://www.instagram.com/deepdey.official' },
                ].map(({ key, label, style, url }) => (
                  <button
                    key={key}
                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    style={style}
                    className="inline-flex items-center justify-center text-white px-4 py-2 rounded-full text-[11px] font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all min-w-[102px] cursor-pointer border-none"
                  >{label}</button>
                ))}
              </div>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {[
                  { key: 'github', label: 'GitHub', style: { background: '#24292e' }, url: 'https://github.com/deepdeyiitgn' },
                  { key: 'discord', label: 'Discord', style: { background: '#5865F2' }, url: 'https://discord.com/invite/t6ZKNw556n' },
                ].map(({ key, label, style, url }) => (
                  <button
                    key={key}
                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    style={style}
                    className="inline-flex items-center justify-center text-white px-4 py-2 rounded-full text-[11px] font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all min-w-[102px] cursor-pointer border-none"
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}

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
         {/*  <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest italic">Ver 13.05.2026.💞.02.55.PM</p> */}
              <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest italic">Ver 25.06.2026.💞.07.31.PM</p>
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
            <a
              href="/static-pages.html"
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-500 transition-colors text-center"
            >
              Static Pages
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
