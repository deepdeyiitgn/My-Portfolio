import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Copyright() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="Copyright & License | Deep Dey Infrastructure"
        description="Documentation of architectural ownership and restricted source code license."
        route="/copyright"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Architectural Ownership</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Copyright <span className="text-amber-500 italic">& License.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: April 20, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Intellectual Asset Ownership</h2>
          <p>
            All content in this portfolio ecosystem, including the Dark-Amber design language, QLYNK architecture assets, and source code for Transparent Clock and QuickLink, is the intellectual property of <span className="text-white font-bold">Deep Dey</span> unless stated otherwise. Reproduction or redistribution without written permission is prohibited.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Source Code Usage Scope</h2>
          <p>
            Public source repositories associated with this portfolio are shared for transparency, learning, and review under a restricted license. You may:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Review the code for educational and peer-review purposes.</li>
            <li>Fork the repository for independent, non-commercial experimentation (Private only).</li>
          </ul>
          <p>This license does not allow:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Production deployment of the code as a competing service.</li>
            <li>Claiming authorship of the "Dark-Amber" design system.</li>
            <li>Selling or licensing the code to third parties.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Brand Assets</h2>
          <p>
            The names "QLYNK", "QuickLink", and "Transparent Clock", along with their respective logos, are proprietary identifiers of the Deep Dey Digital Infrastructure. Use of these names in a way that suggests endorsement by or affiliation with Deep Dey is prohibited.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Enforcement</h2>
          <p>
            Violations of these rights may be investigated and addressed through moderation, takedown requests, and legal remedies where needed. We use operational monitoring systems to identify unauthorized mirroring of portfolio assets or core logic.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-COPY-V3</p>
      </div>
    </div>
  );
}
