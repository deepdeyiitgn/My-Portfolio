import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="Privacy Policy | Deep Dey Infrastructure"
        description="Official Privacy Policy detailing local-first data approach and store migration to Odoo."
        route="/privacy"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Data Sovereignty</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Privacy <span className="text-amber-500 italic">Policy.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: April 20, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Local-First Philosophy</h2>
          <p>
            The Deep Dey Digital Infrastructure operates on a "Local-First" data protocol. Applications such as "Transparent Clock" store configuration data exclusively on your local machine. We do not maintain a cloud-synchronized shadow of your personal productivity logs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Odoo Store Migration</h2>
          <p>
            Our e-commerce portal has migrated from its legacy domain to <span className="text-amber-500 underline">https://deepdeyiit.odoo.com/</span>. This migration ensures enhanced security and enterprise-grade data encryption for all transactional metadata. When you interact with the DDJEESTORE, your billing data is processed through Odoo's secure cloud infrastructure, decoupled from our primary developer nodes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. QuickLink Analytics</h2>
          <p>
            The QuickLink URL Suite collects minimal telemetry—strictly limited to redirection counts and source headers. We do not track individual IP addresses or sell browsing behavior to third-party advertisers. Your digital trail within our redirection engine is ephemeral by design.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Data Security</h2>
          <p>
            We utilize high-fidelity encryption for all API transmissions within the QLYNK node ecosystem. However, as certain nodes are maintained by a single developer, we recommend using unique credentials not shared with sensitive financial or government platforms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Third-Party Integration</h2>
          <p>
            This infrastructure may integrate with services like Google Analytics or Vercel Insights for platform health monitoring. Use of these services is subject to their respective privacy protocols.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-PRIV-V2</p>
      </div>
    </div>
  );
}
