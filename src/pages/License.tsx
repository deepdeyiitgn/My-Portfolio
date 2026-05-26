import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function License() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO
        title="License Terms | Deep Dey Infrastructure"
        description="License terms covering permitted use, attribution/watermark obligations, and restrictions."
        route="/license"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Usage Authorization</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">License <span className="text-amber-500 italic">Terms.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: May 19, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Grant of Limited Use</h2>
          <p>
            You may use eligible components of this ecosystem within the boundaries defined by the owner. Eligible components include public scripts, templates, frontend systems, watermark integrations, and related UI assets that are intentionally published for use. All rights not explicitly granted remain reserved.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Attribution and Watermark Requirements</h2>
          <p>
            Attribution is required for personal, free, and community usage where this work is reused. For commercial or custom agreements, attribution/watermark placement can be adjusted, removed, or replaced only through written approval. Unauthorized removal, tampering, or misleading attribution is not allowed.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Showcase Listing Rights</h2>
          <p>
            Approved works may be listed in the public portfolio showcase with site logo/favicon, domain/origin, and an owner-approved tagline for proof of delivery and architecture credit.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Restricted Actions</h2>
          <p>
            You may not resell source code as your own product, remove required attribution without approval, falsely claim authorship of visual/system architecture, or create deceptive derivatives implying owner endorsement.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-LIC-V2</p>
      </div>
    </div>
  );
}
