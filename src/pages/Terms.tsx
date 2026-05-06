import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="Terms of Service | Deep Dey Infrastructure"
        description="Official Terms of Service for Deep Dey digital assets including QuickLink, Transparent Clock, and the Journal platform."
        route="/terms"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Legal Framework</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Terms of <span className="text-amber-500 italic">Service.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: May 5, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Acceptance of Architecture</h2>
          <p>
            By accessing the Deep Dey Digital Infrastructure, including but not limited to the QLYNK ecosystem, QuickLink URL Suite, the Transparent Clock application, the Journal platform, and associated comment and user profile systems, you agree to be bound by these Terms of Service. This infrastructure is a high-fidelity digital environment designed and maintained by Deep Dey. If you do not agree with any part of these terms, you are prohibited from utilizing these assets.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Asset Utilization & Licenses</h2>
          <p>
            All software products, including "Transparent Clock" and "QuickLink", are provided under a strict View-Only/Restricted Use license. You are granted a limited, non-exclusive, non-transferable license to utilize these tools for personal productivity. Any attempt to reverse-engineer, redistribute, or monetize these individual assets without explicit written authorization is a violation of these terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Journal & Comment System</h2>
          <p>
            The Deep Dey Journal platform allows authenticated users to post public comments on journal entries using Google Sign-In. By using the comment system, you agree to post only lawful, respectful, and non-abusive content. Comments containing profanity, spam, harassment, or illegal material will be automatically censored or removed. Repeat violators may be temporarily or permanently blocked from the platform. You retain ownership of your comments but grant Deep Dey a non-exclusive, royalty-free license to display and moderate your content on this platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. User Profiles</h2>
          <p>
            When you sign in with Google to leave a comment, a public user profile is created at <span className="text-amber-500/80">/user/[your-id]</span>. This profile displays your display name, Google profile picture, comment activity, contribution graph showing your commenting history by year, and any bio or social links you voluntarily add. You may edit your profile at any time using the same Google account. Profile information is publicly visible to all visitors of this site. The owner of this site also has a public profile accessible at <span className="text-amber-500/80">/user/owner</span>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Academic & Development Hiatus</h2>
          <p>
            Please note that as of April 9, 2026, many active development nodes are in a state of academic hiatus due to the primary developer's commitment to JEE Advanced 2027 preparation. Support latency is expected and systems are provided "as-is" during this period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. Prohibited Conduct</h2>
          <p>
            Users must not attempt to breach the security of the QLYNK node ecosystem or disrupt the performance of the hosted tools. Targeted scraping, automated account creation on QuickLink, or any form of DDoS attack will result in immediate termination of access and potential legal escalation. Posting abusive, defamatory, or spam content in the journal comment system is strictly prohibited.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">7. Limitation of Liability</h2>
          <p>
            Deep Dey Infrastructure is not liable for data loss or system instability resulting from the use of experimental software components (Transparent Clock Windows builds). These tools are engineered for performance but are subject to local system environmental factors. The journal and comment platform is a personal project and may experience downtime without notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">8. Governing Law</h2>
          <p>
            These terms are governed by the digital laws of the Republic of India, specifically within the jurisdiction of Tripura, where the core system coordinates are established.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-TOS-V3</p>
      </div>
    </div>
  );
}
