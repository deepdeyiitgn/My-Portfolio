import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function DMCA() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <SEO 
        title="DMCA Policy | Deep Dey Infrastructure"
        description="Official DMCA notice and takedown policy for Deep Dey digital assets."
        route="/dmca"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Rights Management</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">DMCA <span className="text-amber-500 italic">Policy.</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Effective Date: April 20, 2026</p>
      </motion.div>

      <div className="space-y-10 text-zinc-400 leading-relaxed font-light">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">1. Policy Overview</h2>
          <p>
            Deep Dey Infrastructure respects intellectual property rights and expects users to do the same. We respond to valid infringement notices in accordance with applicable copyright laws, including the DMCA where relevant.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">2. Infringement Notification</h2>
          <p>
            If you are a copyright owner or authorized representative, you may submit an infringement notice. After receiving a valid notice, we will review the claim and may remove or restrict access to challenged material where appropriate.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">3. Required Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identify the copyrighted work that you claim has been infringed.</li>
            <li>Identify the material that you claim is infringing and its location (URL or specific tool).</li>
            <li>Provide your contact information (address, telephone number, and email).</li>
            <li>A statement of "good faith belief" that use of the material is not authorized.</li>
            <li>A statement that the information in the notification is accurate.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">4. Counter Notification</h2>
          <p>
            If you believe content was removed or restricted in error, you may submit a counter notification with supporting details and a good-faith statement. Valid counter notices will be reviewed and handled under applicable law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">5. Designated Contact</h2>
          <p>
            Legal copyright notices and counter notifications should be sent to: <span className="text-amber-500 font-mono">a@qlynk.me</span>.
          </p>
        </section>
      </div>

      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">System Node: LEG-DMCA-V2</p>
      </div>
    </div>
  );
}
