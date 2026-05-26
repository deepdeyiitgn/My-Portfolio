import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="Privacy Policy | Deep Dey Infrastructure"
        description="Official Privacy Policy detailing data collection, Google sign-in identity handling, private service keys, and user profile controls."
        route="/privacy"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Data Sovereignty</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Privacy <span className="text-amber-500 italic">Policy.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: May 9, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Local-First Philosophy</h2>
          <p>
            The Deep Dey platform follows a local-first approach where possible. Applications such as Transparent Clock store core configuration data on your own device. We do not maintain cloud copies of your personal productivity logs unless a feature explicitly requires server-side storage.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Google Sign-In Data We Process</h2>
          <p>
            When you sign in with Google, we may process your Google account display name, profile image URL, unique Google user ID (`sub`), and email address. This data is used only for identity, account continuity, moderation, and support verification inside this platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Email Collection and Re-Login Behavior</h2>
          <p>
            For new users, email may be stored when account data is first created through Google-authenticated profile, comment, or feedback flows. For existing users, email may be refreshed when identity sync runs again after authentication. This supports account continuity, moderation, and support verification.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Private Service Key</h2>
          <p>
            Each non-owner community account may be assigned a private 16-digit service key. This key is shown masked by default, can be revealed/hidden, copied, and rotated. It is used for identity confirmation in support scenarios. The key is visible to the account owner on their own logged-in profile and to the site owner in the protected dashboard users panel.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Public vs Private Profile Data</h2>
          <p>
            Public profile pages may show your name, avatar, comment activity, contribution graph, and profile fields you choose to publish (title/bio/social links). Your email and service key are private identity fields and are not intended for public profile display.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. Journal, Feedback, and Moderation Metadata</h2>
          <p>
            Community comments, feedback, and moderation metadata are stored in MongoDB Atlas. For abuse prevention and account security, we may store first/last activity timestamps, IP metadata, and country metadata linked to account activity. This metadata is used only for moderation, abuse prevention, and account security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">7. Authentication and Tokens</h2>
          <p>
            Sign-in uses Google OAuth identity tokens. Credentials are verified server-side for protected actions. We do not store Google access tokens or refresh tokens in the database. Browser session state may be kept in localStorage and expires according to token/session validity.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">8. Third-Party Services</h2>
          <p>
            This infrastructure integrates with Google OAuth, Vercel hosting/runtime, and MongoDB Atlas database services. It may also use Google Favicon service for profile link icons. Use of these providers is subject to their own privacy terms and policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">9. Data Security and Retention</h2>
          <p>
            We apply reasonable safeguards to protect stored and transmitted data, including encrypted transit where applicable (TLS), restricted operational access, and owner-only access to sensitive moderation records. Data is retained only as needed for platform operations, moderation, and support. You may request profile/content deletion through the official support channels listed in <span className="text-amber-500/80">SUPPORT.md</span>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">10. Watermark Tracking Metadata</h2>
          <p>
            For websites that use the official Powered by Deep watermark script, we may process the submitted page URL, domain, favicon, optional tagline/title, status labels (pending/approved/declined), and visibility state (shown/hidden). This is used to verify attribution, prevent abuse, and manage showcase listings.
          </p>
          <p>
            Hidden entries are retained for moderation/audit purposes but may be excluded from public project listings.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">11. Policy Changes</h2>
          <p>
            This policy can be updated as features evolve. Material changes will be published on this page with an updated effective date.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-PRIV-V4</p>
      </div>
    </div>
  );
}
