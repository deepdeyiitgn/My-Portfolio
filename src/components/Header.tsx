import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Me', path: '/me' },
  { name: 'Projects', path: '/projects' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Links', path: '/links' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Contact', path: '/contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
      <nav className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between bg-zinc-950/70 backdrop-blur-md rounded-2xl border border-zinc-900/50 px-6 py-3">
          {/* Logo */}
          <Link to="/" className="text-xl font-black tracking-tighter text-amber-500 hover:opacity-80 transition-opacity">
            DEEP DEY.
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${
                  location.pathname === link.path ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-zinc-400 hover:text-amber-500 transition-colors p-2 z-[110] relative"
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
                {isOpen ? <X size={24} /> : <Menu size={24} />}
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
              className="fixed inset-0 bg-zinc-950/90 backdrop-blur-2xl md:hidden z-[100] flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center space-y-8">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.path}
                      className="group flex flex-col items-center"
                    >
                      <span className={`text-4xl font-black tracking-tighter transition-all duration-300 ${
                        location.pathname === link.path 
                          ? 'text-amber-500 scale-110' 
                          : 'text-zinc-700 hover:text-amber-500'
                      }`}>
                        {link.name}
                      </span>
                      <motion.div 
                        className="h-1 bg-amber-500 rounded-full mt-2" 
                        initial={{ width: 0 }}
                        animate={{ width: location.pathname === link.path ? "100%" : 0 }}
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
                transition={{ delay: 0.8 }}
                className="absolute bottom-12 text-center space-y-2"
              >
                <div className="w-8 h-8 mx-auto border-2 border-zinc-800 rounded-lg transform rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                </div>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">IIT KGP 2027 Aspirant</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
