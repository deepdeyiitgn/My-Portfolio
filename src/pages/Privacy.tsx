import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="Privacy Policy | Deep Dey Infrastructure"
        description="Official Privacy Policy detailing data collection, user profiles, comments, and the Deep Dey Journal platform."
        route="/privacy"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Data Sovereignty</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Privacy <span className="text-amber-500 italic">Policy.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: May 5, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Local-First Philosophy</h2>
          <p>
            The Deep Dey Digital Infrastructure operates on a "Local-First" data protocol. Applications such as "Transparent Clock" store configuration data exclusively on your local machine. We do not maintain a cloud-synchronized shadow of your personal productivity logs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Journal Comment Data</h2>
          <p>
            When you sign in with Google to comment on a journal post, we collect and store the following data: your Google account display name, profile picture URL, and a unique Google user identifier (sub). Your comments are stored in a MongoDB database hosted on MongoDB Atlas. We also record the IP address and country of origin at the time of your first comment and most recent activity for moderation and security purposes. This data is accessible only to the site administrator and is never sold to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. User Profiles</h2>
          <p>
            A public user profile is automatically created at <span className="text-amber-500/80">/user/[your-id]</span> when you first comment. This profile displays your name, profile picture, comment activity, a contribution graph showing your per-day comment history filterable by year, and any additional bio or social links you choose to add. Your profile is publicly visible. You may update your bio, title, and social links at any time by signing in with your Google account. You may request deletion of your profile and comments by contacting the site administrator. The site owner also has a public profile at <span className="text-amber-500/80">/user/owner</span> and is listed alongside all contributors on the <span className="text-amber-500/80">/user</span> page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Google OAuth</h2>
          <p>
            Sign-in is powered by Google OAuth 2.0. We receive a short-lived JWT credential from Google which is used to verify your identity when posting comments or updating your profile. We do not store your Google access token or refresh token on the server. Your Google session data is stored locally in your browser's localStorage and expires automatically.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Odoo Store Migration</h2>
          <p>
            Our e-commerce portal has migrated from its legacy domain to <span className="text-amber-500 underline">https://deepdeyiit.odoo.com/</span>. This migration ensures enhanced security and enterprise-grade data encryption for all transactional metadata. When you interact with the DDJEESTORE, your billing data is processed through Odoo's secure cloud infrastructure, decoupled from our primary developer nodes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. QuickLink Analytics</h2>
          <p>
            The QuickLink URL Suite collects minimal telemetry—strictly limited to redirection counts and source headers. We do not sell browsing behavior to third-party advertisers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">7. Data Security</h2>
          <p>
            We utilize high-fidelity encryption for all API transmissions. All database connections use TLS and MongoDB Atlas security controls. As certain nodes are maintained by a single developer, we recommend using unique credentials not shared with sensitive financial or government platforms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">8. Third-Party Integration</h2>
          <p>
            This infrastructure integrates with Google OAuth for user authentication and may use Vercel Insights or similar tools for platform health monitoring. Use of these services is subject to their respective privacy protocols. We use Google's Favicon Service to display link icons in user profiles.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-PRIV-V3</p>
      </div>
    </div>
  );
}
