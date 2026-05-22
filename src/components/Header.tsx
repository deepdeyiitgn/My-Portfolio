import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Radio, Search, Activity, Users, MessageSquare, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.me', path: '/me' },
  { key: 'nav.projects', path: '/projects' },
  { key: 'nav.feature', path: '/feature' },
  { key: 'nav.portfolio', path: '/portfolio' },
  { key: 'nav.links', path: '/links' },
  { key: 'nav.proof', path: '/proof' },
  { key: 'nav.journal', path: '/journal' },
  { key: 'nav.now', path: '/now' },
  { key: 'nav.faq', path: '/faq' },
  { key: 'nav.contact', path: '/contact' },
  { key: 'nav.live', path: '/live', isLive: true },
  { key: 'nav.status', path: '/status', isStatus: true },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [ownerAuthed, setOwnerAuthed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // Ctrl+K / Cmd+K — navigate to the Search page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Close menu on route change

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setOwnerAuthed(Boolean(d?.authenticated)))
      .catch(() => setOwnerAuthed(false));
  }, [location.pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setOwnerAuthed(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-300">
      <nav className="mx-auto max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] px-3 py-3 md:px-6 md:py-5">
        <div className="flex items-center justify-between bg-zinc-950/70 backdrop-blur-md rounded-2xl border border-zinc-900/50 px-4 py-2.5 md:px-5 md:py-3 gap-2">

          {/* Logo + Avatar */}
          <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="/assets/images/myphoto.png"
              alt="Deep Dey"
              className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
            />
            <span className="text-base font-black tracking-tight text-amber-500 leading-none">
              DEEP DEY.
            </span>
          </Link>

          {/* Desktop Nav — overflow-hidden prevents items from spilling left under the logo
               when justify-center causes symmetric overflow on tight viewports.
               HOME is intentionally omitted here; the logo already links to '/'. */}
          <div className="hidden lg:flex items-center gap-x-3 xl:gap-x-4 2xl:gap-x-5 overflow-hidden flex-1 justify-center px-2 min-w-0">
            {NAV_LINKS.filter((link) => link.path !== '/').map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`shrink-0 flex items-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${
                  location.pathname === link.path
                    ? 'text-amber-500'
                    : 'text-zinc-500 hover:text-amber-500'
                } ${'isLive' in link && link.isLive ? 'text-red-500 hover:text-red-400' : ''}`}
              >
                {'isLive' in link && link.isLive && (
                  <Radio size={8} className="animate-pulse shrink-0" />
                )}
                {'isStatus' in link && link.isStatus && (
                  <Activity size={8} className="shrink-0" />
                )}
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              to="/user"
              className={`hidden xl:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-colors ${
                location.pathname === '/user' ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-500'
              }`}
            >
              <Users size={10} />
              All Users
            </Link>
            <Link
              to="/feedback"
              className={`hidden xl:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-colors ${
                location.pathname === '/feedback' ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-500'
              }`}
            >
              <MessageSquare size={10} />
              Feedback
            </Link>
            {ownerAuthed && (
              <button
                onClick={handleLogout}
                className="hidden xl:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={10} />
                Logout
              </button>
            )}
            {/* 🔍 Search Icon Button (Desktop) — navigates to /search, Ctrl+K */}
            <button
              onClick={() => navigate('/search')}
              aria-label="Search (Ctrl+K)"
              className="hidden xl:flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <Search size={16} />
            </button>

            <label className="sr-only" htmlFor="language-switcher">Language</label>
            <select
              id="language-switcher"
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-2 py-1 text-xs"
              aria-label="Select language"
            >
              <option value="en">EN</option>
              <option value="bn">BN</option>
              <option value="hi">HI</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="ar">AR</option>
              <option value="ru">RU</option>
              <option value="pt">PT</option>
              <option value="ja">JA</option>
              <option value="ko">KO</option>
              <option value="zh">ZH</option>
            </select>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-zinc-400 hover:text-amber-500 transition-colors p-2 z-[110] relative shrink-0"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Full-Screen Overlay Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl lg:hidden z-[100] overflow-y-auto"
            >
              {/* Language switcher in mobile menu */}
              <div className="sticky top-4 z-[101] flex justify-end px-4 pt-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as typeof language)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-2 py-1 text-xs"
                >
                  <option value="en">EN</option>
                  <option value="bn">BN</option>
                  <option value="hi">HI</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="de">DE</option>
                  <option value="ar">AR</option>
                  <option value="ru">RU</option>
                  <option value="pt">PT</option>
                  <option value="ja">JA</option>
                  <option value="ko">KO</option>
                  <option value="zh">ZH</option>
                </select>
              </div>

              <div className="w-full max-w-sm mx-auto px-4 pb-12 pt-4">
                {/* 🔍 Search Button (Mobile) — navigates to /search */}
                <button
                  onClick={() => { navigate('/search'); setIsOpen(false); }}
                  className="flex items-center gap-2 w-full justify-center mb-4 px-4 py-3 min-h-[48px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 rounded-xl transition-all duration-300 font-mono text-sm tracking-wider"
                >
                  <Search size={16} />
                  Search Anything...
                </button>
                <a
                  href="/static-pages.html"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 w-full justify-center mb-4 px-4 py-3 min-h-[48px] bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-700/60 hover:border-amber-500/40 text-zinc-200 hover:text-amber-500 rounded-xl transition-all duration-300 font-mono text-xs tracking-wider uppercase"
                >
                  Static Pages
                </a>

                <div className="space-y-2">
                  {NAV_LINKS.map((link, index) => (
                    <motion.div
                      key={link.path}
                      className="w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={link.path}
                        className="group w-full block"
                      >
                        <span className={`w-full px-4 py-3 min-h-[48px] rounded-xl border border-zinc-800/60 bg-zinc-900/30 text-base sm:text-lg font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${
                          location.pathname === link.path
                            ? 'text-amber-500 scale-105'
                            : 'text-zinc-700 hover:text-amber-500'
                        } ${'isLive' in link && link.isLive ? '!text-red-500' : ''}`}>
                          {'isLive' in link && link.isLive && (
                            <Radio size={16} className="animate-pulse" />
                          )}
                          {'isStatus' in link && link.isStatus && (
                            <Activity size={16} />
                          )}
                          {t(link.key)}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Community Quick Links */}
                <div className="w-full border-t border-zinc-800/50 pt-4 mt-4 flex flex-col items-center gap-2">
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em] mb-1">Community</p>
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to="/user"
                      className="group w-full block"
                    >
                      <span className={`w-full px-4 py-3 min-h-[48px] rounded-xl border border-zinc-800/60 bg-zinc-900/30 text-base sm:text-lg font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${
                        location.pathname === '/user' ? 'text-amber-500 scale-110' : 'text-zinc-700 hover:text-amber-500'
                      }`}>
                        <Users size={16} />
                        All Users
                      </span>
                    </Link>
                  </motion.div>
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.83, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to="/feedback"
                      className="group w-full block"
                    >
                      <span className={`w-full px-4 py-3 min-h-[48px] rounded-xl border border-zinc-800/60 bg-zinc-900/30 text-base sm:text-lg font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${
                        location.pathname === '/feedback' ? 'text-amber-500 scale-110' : 'text-zinc-700 hover:text-amber-500'
                      }`}>
                        <MessageSquare size={16} />
                        Feedback
                      </span>
                    </Link>
                  </motion.div>
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to="/journal/comment"
                      className="group w-full block"
                    >
                      <span className={`w-full px-4 py-3 min-h-[48px] rounded-xl border border-zinc-800/60 bg-zinc-900/30 text-base sm:text-lg font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${
                        location.pathname === '/journal/comment' ? 'text-amber-500 scale-110' : 'text-zinc-700 hover:text-amber-500'
                      }`}>
                        <MessageSquare size={16} />
                        Comment Guide
                      </span>
                    </Link>
                  </motion.div>
                  {ownerAuthed && (
                    <motion.button
                      className="w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      onClick={handleLogout}
                    >
                      <span className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-zinc-800/60 bg-zinc-900/30 text-base sm:text-lg font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 text-zinc-700 hover:text-red-400">
                        <LogOut size={16} />
                        Logout
                      </span>
                    </motion.button>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center space-y-2 mt-6"
                >
                  <img
                    src="/assets/images/myphoto.png"
                    alt="Deep Dey"
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/40 mx-auto"
                  />
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">IIT KGP 2027 Aspirant</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
