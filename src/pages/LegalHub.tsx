import { motion } from 'motion/react';
import { Shield, FileText, Lock, Copyright, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const LEGAL_NODES = [
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'System utilization protocols and user conduct obligations.',
    icon: <FileText className="text-amber-500" />,
    path: '/terms'
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'Data sovereignty, encryption, and e-commerce migration logs.',
    icon: <Lock className="text-amber-500" />,
    path: '/privacy'
  },
  {
    id: 'dmca',
    title: 'DMCA Takedown',
    description: 'Intellectual property protection and rights management.',
    icon: <Shield className="text-amber-500" />,
    path: '/dmca'
  },
  {
    id: 'copyright',
    title: 'Copyright & License',
    description: 'Ownership of the Dark-Amber architecture and View-Only source code.',
    icon: <Copyright className="text-amber-500" />,
    path: '/copyright'
  }
];

export default function LegalHub() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
      <SEO 
        title="Legal Hub | Deep Dey Infrastructure"
        description="Centralized compliance portal for all Deep Dey digital assets, software, and systems."
        route="/legal"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-xs">Compliance Engine</h2>
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
          LEGAL <br /> <span className="text-amber-500 italic">ARCHITECTURE.</span>
        </h1>
        <p className="text-zinc-500 max-w-2xl mx-auto text-lg md:text-xl font-light">
          Formalizing the governance of our digital ecosystems and architectural integrity.
        </p>
      </motion.div>

      {/* Legal Node Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        {LEGAL_NODES.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={node.path}
              className="group block p-10 bg-zinc-900/40 border border-zinc-800 rounded-[3rem] hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col items-start space-y-6">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform duration-500">
                  {node.icon}
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{node.title}</h3>
                  <p className="text-zinc-500 text-sm font-light leading-relaxed">{node.description}</p>
                </div>
                <div className="flex items-center gap-2 text-amber-500/60 font-mono text-[10px] uppercase tracking-widest pt-4">
                  <span>Enter Documentation</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* System Status Section */}
      <section className="bg-zinc-900/20 border border-zinc-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-amber-500">
              <AlertTriangle size={20} />
              <span className="text-xs font-mono uppercase tracking-widest font-bold">System Status Log</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-[0.9]">
              Infrastructure <br /> <span className="text-amber-500 underline underline-offset-8 decoration-2">Migrations.</span>
            </h2>
            <div className="space-y-6">
              <div className="p-6 bg-zinc-950/50 border-l-4 border-amber-500 rounded-r-3xl space-y-2">
                <p className="text-white font-bold tracking-tight">Portfolio V1 Transition</p>
                <p className="text-sm text-zinc-500">Legacy ecosystem preserved at <a href="https://qlynk.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">qlynk.vercel.app</a>. [Discontinued Version]</p>
              </div>
              <div className="p-6 bg-zinc-950/50 border-l-4 border-zinc-700 rounded-r-3xl space-y-2 opacity-80">
                <p className="text-white font-bold tracking-tight">Store Node: Expired Domain</p>
                <p className="text-sm text-zinc-500 italic">deepdeyiitk.com has been officially decommissioned following its maintenance expiration.</p>
              </div>
              <div className="p-6 bg-zinc-950/50 border-l-4 border-amber-500 rounded-r-3xl space-y-2">
                <p className="text-white font-bold tracking-tight font-mono text-sm uppercase tracking-widest">Active Store Node: ODOO</p>
                <p className="text-sm text-zinc-400">All commercial transactions migrated to <span className="text-amber-500 underline">https://deepdeyiit.odoo.com/</span> for increased enterprise stability.</p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-[3rem] space-y-8 shadow-2xl">
            <h3 className="text-white font-bold text-xl flex items-center gap-3 italic">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Live Architecture Registry
            </h3>
            
            <div className="space-y-4">
              {[
                { name: 'Transparent Clock', status: 'Ver. 4.2 Stable', color: 'bg-zinc-800' },
                { name: 'QuickLink URL Suite', status: 'Active Service', color: 'bg-amber-500/10 text-amber-500' },
                { name: 'DEQLYNK Core', status: 'Discontinued', color: 'bg-zinc-900 text-red-500/50' }
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-5 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                  <span className="text-zinc-300 font-medium">{item.name}</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-zinc-900 flex justify-center">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Archived Effective Date: April 20, 2026</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
