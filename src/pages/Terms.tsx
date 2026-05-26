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
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Acceptance of Terms</h2>
          <p>
            By accessing the Deep Dey platform, including the QLYNK ecosystem, QuickLink tools, Transparent Clock application, Journal, community areas, and related profile systems, you agree to these Terms of Service. If you do not agree, please do not use these services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Software Use and License Boundaries</h2>
          <p>
            Software published through this ecosystem is provided under a limited, non-exclusive, non-transferable license for personal and non-commercial use unless a separate written agreement states otherwise. You may not redistribute, sublicense, reverse-engineer, or commercialize these assets without prior written permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Attribution and Watermark Requirements</h2>
          <p>
            For projects delivered using this ecosystem, attribution requirements (including the Powered by Deep watermark system where applicable) must be followed unless the owner provides a written exemption. Removing or intentionally hiding required attribution is a policy violation.
          </p>
          <p>
            Approved project deliveries may be shown in portfolio and showcase records for proof of delivery and architecture credit.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Journal, Community, and Comment Use</h2>
          <p>
            Google-authenticated users may post comments and participate in eligible community features. You must post lawful, respectful, and non-abusive content. Spam, harassment, illegal content, hate speech, and malicious links may be filtered, moderated, or removed. Repeated violations may result in temporary or permanent access restrictions.
          </p>
          <p>
            You retain ownership of your submitted content, but grant Deep Dey a non-exclusive license to host, display, and moderate that content on this platform. IP and country metadata may be recorded for moderation, abuse prevention, and account security. This metadata is owner-access only and is not sold to third parties.
          </p>
          <p>
            Community broadcasts, updates, and notification channels may include owner announcements and user-specific operational notices. Internal analytics and UTM attribution metadata are also processed as documented in the Cookies and Privacy pages.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. User Profiles</h2>
          <p>
            Signing in with Google creates a public profile at <span className="text-amber-500/80">/user/[your-id]</span>. Depending on your settings, this may display your name, avatar, activity history, and optional profile fields. You can edit your profile using the same Google account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. Academic & Development Hiatus</h2>
          <p>
            Please note that as of April 9, 2026, many active development nodes are in a state of academic hiatus due to the primary developer's commitment to JEE Advanced 2027 preparation. Support latency is expected and systems are provided "as-is" during this period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">7. Prohibited Conduct</h2>
          <p>
            You must not disrupt service availability, attempt unauthorized access, perform abusive automation, scrape protected data, create fake accounts, or launch denial-of-service activity. Attempts to bypass moderation, authentication, or security controls may result in immediate suspension and further action where legally required.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">8. Limitation of Liability</h2>
          <p>
            Deep Dey Infrastructure is not liable for data loss or system instability resulting from the use of experimental software components (Transparent Clock Windows builds). These tools are engineered for performance but are subject to local system environmental factors. The journal and comment platform is a personal project and may experience downtime without notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">9. Governing Law</h2>
          <p>
            These terms are governed by applicable laws of India. For legal and operational purposes, services are operated from Tripura, India.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-TOS-V5</p>
      </div>
    </div>
  );
}
