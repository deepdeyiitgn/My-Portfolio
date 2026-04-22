import { motion } from 'motion/react';

const TESTIMONIALS = [
  {
    name: 'Early Collaborator',
    role: 'Student Builder',
    quote: 'Deep ships with clarity and thinks in systems, not just screens.',
  },
  {
    name: 'Community Peer',
    role: 'Discord Member',
    quote: 'The ecosystem quality feels premium, structured, and performance-first.',
  },
  {
    name: 'Learning Partner',
    role: 'JEE Aspirant',
    quote: 'Discipline + engineering mindset is visible in every section.',
  },
];

const STATS = [
  { label: 'Projects shipped', value: '10+' },
  { label: 'Platform nodes', value: '30+' },
  { label: 'Focus streak', value: '1000+ hrs' },
  { label: 'Deployment reliability', value: '99.9%' },
];

export default function SocialProof() {
  return (
    <section className="max-w-7xl mx-auto px-6 space-y-12" aria-label="Social proof and credibility">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <p className="text-3xl font-black text-amber-500">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((item, index) => (
          <motion.blockquote
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6"
          >
            <p className="text-zinc-300 leading-relaxed">“{item.quote}”</p>
            <footer className="mt-4">
              <p className="text-sm font-bold text-white">{item.name}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">{item.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
