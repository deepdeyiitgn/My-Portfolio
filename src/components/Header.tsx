import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.me', path: '/me' },
  { key: 'nav.projects', path: '/projects' },
  { key: 'nav.portfolio', path: '/portfolio' },
  { key: 'nav.links', path: '/links' },
  { key: 'nav.proof', path: '/proof' },
  { key: 'nav.journal', path: '/journal' },
  { key: 'nav.now', path: '/now' },
  { key: 'nav.faq', path: '/faq' },
  { key: 'nav.contact', path: '/contact' },
  { key: 'nav.live', path: '/live', isLive: true },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

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
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
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
              className="fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl lg:hidden z-[100] flex flex-col items-center justify-center overflow-y-auto"
            >
              {/* Language switcher in mobile menu */}
              <div className="absolute top-6 right-6">
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

              <div className="flex flex-col items-center gap-5 py-16">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.path}
                      className="group flex flex-col items-center"
                    >
                      <span className={`text-3xl font-black tracking-tight transition-all duration-300 flex items-center gap-2 ${
                        location.pathname === link.path
                          ? 'text-amber-500 scale-110'
                          : 'text-zinc-700 hover:text-amber-500'
                      } ${'isLive' in link && link.isLive ? '!text-red-500' : ''}`}>
                        {'isLive' in link && link.isLive && (
                          <Radio size={20} className="animate-pulse" />
                        )}
                        {t(link.key)}
                      </span>
                      <motion.div
                        className="h-0.5 bg-amber-500 rounded-full mt-1"
                        initial={{ width: 0 }}
                        animate={{ width: location.pathname === link.path ? '100%' : 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Branding in Menu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-8 text-center space-y-2"
              >
                <img
                  src="/assets/images/myphoto.png"
                  alt="Deep Dey"
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/40 mx-auto"
                />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">IIT KGP 2027 Aspirant</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
