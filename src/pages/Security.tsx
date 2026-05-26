import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Security() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO
        title="Security Policy | Deep Dey Infrastructure"
        description="Security policy covering vulnerability reporting, abuse handling, and infrastructure hardening principles."
        route="/security"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Security Operations</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Security <span className="text-amber-500 italic">Policy.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: May 19, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Scope</h2>
          <p>
            This policy applies to publicly reachable services and APIs under Deep Dey Infrastructure, including portfolio nodes, watermark tracking, journal/comment APIs, and dashboard-protected owner interfaces.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Responsible Disclosure</h2>
          <p>
            If you discover a vulnerability, report it through the official contact channels with reproduction details, affected endpoints, and impact summary. Do not publish exploit details before a reasonable remediation window is provided.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Prohibited Security Testing</h2>
          <p>
            High-volume scanning, denial-of-service simulation, auth bypass attempts, data extraction, and account-takeover testing on production systems without explicit written authorization are prohibited. Unauthorized disruptive testing may be blocked and logged for incident response.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Operational Controls</h2>
          <p>
            Platform controls include owner-only access checks, moderation records, abuse filtering, and watermark attribution systems. Security controls are reviewed and updated as infrastructure and integrations evolve.
          </p>
          <p>
            Additional controls include batched internal analytics ingestion, UTM attribution observability, external-link proxy enforcement, and owner-auditable community/notification event records for abuse response.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Good-Faith Security Research</h2>
          <p>
            Good-faith security research is appreciated when performed responsibly and without service disruption, privacy violations, or unauthorized data access. Please use the responsible disclosure process and allow reasonable time for remediation before public disclosure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. No Warranty</h2>
          <p>
            Security measures are implemented with best effort but are provided without guarantees of uninterrupted or error-free operation. Users remain responsible for safe usage and local account/device security.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-SEC-V2</p>
      </div>
    </div>
  );
}
