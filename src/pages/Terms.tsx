import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="Terms of Service | Deep Dey Infrastructure"
        description="Official Terms of Service for Deep Dey digital assets including QuickLink and Transparent Clock."
        route="/terms"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Legal Framework</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Terms of <span className="text-amber-500 italic">Service.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: April 20, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Acceptance of Architecture</h2>
          <p>
            By accessing the Deep Dey Digital Infrastructure, including but not limited to the QLYNK ecosystem, QuickLink URL Suite, and the Transparent Clock application, you agree to be bound by these Terms of Service. This infrastructure is a high-fidelity digital environment designed and maintained by Deep Dey. If you do not agree with any part of these terms, you are prohibited from utilizing these assets.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Asset Utilization & Licenses</h2>
          <p>
            All software products, including "Transparent Clock" and "QuickLink", are provided under a strict View-Only/Restricted Use license. You are granted a limited, non-exclusive, non-transferable license to utilize these tools for personal productivity. Any attempt to reverse-engineer, redistribute, or monetize these individual assets without explicit written authorization is a violation of these terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Academic & Development Hiatus</h2>
          <p>
            Please note that as of April 9, 2026, many active development nodes are in a state of academic hiatus due to the primary developer's commitment to JEE Advanced 2027 preparation. Support latency is expected and systems are provided "as-is" during this period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Prohibited Conduct</h2>
          <p>
            Users must not attempt to breach the security of the QLYNK node ecosystem or disrupt the performance of the hosted tools. Targeted scraping, automated account creation on QuickLink, or any form of DDoS attack will result in immediate termination of access and potential legal escalation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Limitation of Liability</h2>
          <p>
            Deep Dey Infrastructure is not liable for data loss or system instability resulting from the use of experimental software components (Transparent Clock Windows builds). These tools are engineered for performance but are subject to local system environmental factors.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. Governing Law</h2>
          <p>
            These terms are governed by the digital laws of the Republic of India, specifically within the jurisdiction of Tripura, where the core system coordinates are established.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-TOS-V2</p>
      </div>
    </div>
  );
}
