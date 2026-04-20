import { Link } from 'react-router-dom';
import { Github, Instagram, Youtube, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md pt-24 pb-12 px-6 overflow-hidden relative">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Column 1: Brand */}
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

          {/* Column 2: Navigation */}
          <div className="space-y-6">
            <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-[0.4em] font-black">Architecture</h4>
            <ul className="space-y-4">
               {[
                 { name: 'Home Node', path: '/' },
                 { name: 'Projects Ledger', path: '/projects' },
                 { name: 'The Biography', path: '/about' },
                 { name: 'Contact Engine', path: '/contact' },
                 { name: 'Portfolio', path: '/portfolio' },
                 { name: 'Portfolio V1', path: 'https://qlynk.vercel.app/v1/portfolio', external: true },
                 { name: 'Portfolio V2', path: 'https://qlynk.vercel.app/v2/portfolio', external: true },
               ].map((item) => (
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

          {/* Column 3: Legal */}
          <div className="space-y-6">
            <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-[0.4em] font-black">Compliance</h4>
            <ul className="space-y-4">
              {[
                { name: 'Legal Hub', path: '/legal' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'DMCA Policy', path: '/dmca' },
                { name: 'License Documentation', path: '/copyright' },
              ].map((item) => (
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

          {/* Column 4: Reach */}
          <div className="space-y-6">
            <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-[0.4em] font-black">Network Nodes</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Insta', icon: <Instagram size={18} />, path: 'https://instagram.com/justdeepdey' },
                { name: 'GitHub', icon: <Github size={18} />, path: 'https://github.com/deepdeyiitgn' },
                { name: 'YouTube', icon: <Youtube size={18} />, path: 'https://youtube.com/@deepdeyiit' },
                { name: 'Discord', icon: <MessageCircle size={18} />, path: 'https://discord.com/invite/t6ZKNw556n' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-amber-500/40 text-zinc-500 hover:text-amber-500 transition-all group"
                  title={social.name}
                >
                  {social.icon}
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

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">
              © 2018 - {currentYear} Deep Dey Digital Infrastructure.
            </p>
            <p className="text-[10px] text-zinc-800 uppercase tracking-widest leading-relaxed">
              Architecting solutions across India & the Digital Frontier.
            </p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 group cursor-help">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-amber-200 transition-colors">Core Systems Operational</span>
             </div>
             <div className="h-4 w-px bg-zinc-900"></div>
             <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest italic">Ver 2.0.4.RC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
