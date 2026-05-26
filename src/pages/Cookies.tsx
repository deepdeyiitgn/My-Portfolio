import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Cookies() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO
        title="Cookie & Tracking Policy | Deep Dey"
        description="Full disclosure of cookies, session tokens, batched analytics, and external-link trackers used across the Deep Dey digital infrastructure."
        route="/cookies"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Transparency Engine</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
          Cookie &amp; <span className="text-amber-500 italic">Tracking Policy.</span>
        </h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: May 26, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Default-On Operational Tracking</h2>
          <p>
            This site uses a lightweight first-party analytics and security model that is <span className="text-amber-400 font-semibold">enabled by default</span>. The purpose is operational reliability, abuse prevention, and service quality monitoring. By continuing to use the site, you acknowledge this policy.
          </p>
          <p>
            We do <em>not</em> sell, rent, or monetize browsing data. We also do not provide this data to advertising networks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Login Cookies</h2>
          <p>
            When the site owner authenticates via the Dashboard, an <code className="text-amber-400 font-mono text-sm">auth</code> HTTP-only session cookie is set by the server. This cookie has no persistent state on your device if you are a regular visitor — it is only applicable to the site owner's authenticated browser session.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Google Session Token (Community &amp; Comments)</h2>
          <p>
            When you sign in with Google to use comments, the community channel, updates feed, or notifications, a session object is stored in <code className="text-amber-400 font-mono text-sm">localStorage</code> under the key <code className="text-amber-400 font-mono text-sm">dd_comment_user</code>. This stores your Google-issued display name, profile photo URL, and a verified user ID. No Google credentials or raw tokens are persisted to disk after verification.
          </p>
          <p>
            You may clear this token at any time by signing out, which removes the key from <code className="text-amber-400 font-mono text-sm">localStorage</code>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Batched Internal Page Analytics</h2>
          <p>
            Page-view events (current URL path, approximate time spent, timestamp) are buffered in <code className="text-amber-400 font-mono text-sm">localStorage</code> under the key <code className="text-amber-400 font-mono text-sm">dd_pa_buf</code>. This buffer is <span className="text-white">not transmitted on every navigation</span>. Instead, it is sent as a single batch to our first-party API endpoint (<code className="text-amber-400 font-mono text-sm">/api/journal?action=analytics-bundle</code>) when:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>The browser tab becomes hidden (background, close, or navigation away).</li>
            <li>You have been inactive on the page for more than five minutes.</li>
            <li>Twenty or more events have accumulated in the buffer.</li>
            <li>A periodic background flush fires every two minutes while the tab is visible.</li>
          </ul>
          <p>
            Transmission uses <code className="text-amber-400 font-mono text-sm">navigator.sendBeacon</code> (tab-close scenario) or a standard <code className="text-amber-400 font-mono text-sm">fetch</code> call. The data sent includes: page paths, timestamps, rough time-on-page estimates, the HTTP referrer, and — if you are signed in with Google — your user ID. Your IP address is captured server-side on ingestion.
          </p>
          <p>
            This data is stored in a private MongoDB collection (<code className="text-amber-400 font-mono text-sm">page_analytics</code>) and is only accessible to the site owner via the Dashboard. It is never exposed publicly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. External Link Redirect Tracker</h2>
          <p>
            Clicking external links (including links in Projects, Links, Journal, Community, Updates, and other dynamic content) routes through an internal redirect endpoint (<code className="text-amber-400 font-mono text-sm">/api/journal?action=proxy_redirect</code>). This endpoint logs destination URL/host, source page, login state, and user ID (if signed in), then immediately returns an HTTP 302 redirect to the target URL.
          </p>
          <p>
            This mechanism helps detect malicious links, monitor engagement trends, and identify broken destinations. Data is stored in the <code className="text-amber-400 font-mono text-sm">link_analytics_events</code> collection with owner-only dashboard access.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">6. Push Notification Subscriptions</h2>
          <p>
            If you grant notification permission on the <code className="text-amber-400 font-mono text-sm">/notification</code> page, your browser's Web Push subscription object (endpoint URL + VAPID keys) is stored in the <code className="text-amber-400 font-mono text-sm">push_subscriptions</code> MongoDB collection, indexed by your Google user ID. You may revoke this at any time by revoking notification permissions in your browser settings or by signing out. Notifications are dispatched exclusively by the site owner and are targeted to specific users.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">7. Data Security</h2>
          <p>
            We apply reasonable safeguards for tracking data, including encrypted transit where applicable (TLS), restricted dashboard access, and owner-only visibility for operational analytics collections. Tracking records are used for platform operations and abuse prevention, not advertising resale.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">8. Data Retention &amp; Your Rights</h2>
          <p>
            Analytics data is retained for operational purposes and does not contain sensitive personal information beyond what is described above. You may request deletion of data associated with your Google user ID by contacting the site owner via the <a href="/contact" className="text-amber-400 underline hover:text-amber-300">Contact page</a>. Data linked to IP addresses (guest visitors) is not attributable to individuals and is retained for up to 12 months.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">9. No Third-Party Cookies</h2>
          <p>
            This site does not use Google Analytics, Meta Pixel, or any other third-party tracking SDK. The only third-party network request during authentication is the Google OAuth token verification call, which is performed server-side and never exposes user credentials to the browser.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">10. Contact</h2>
          <p>
            For questions about this policy, contact the site owner at <a href="/contact" className="text-amber-400 underline hover:text-amber-300">deepdey.vercel.app/contact</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
