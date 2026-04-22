import SEO from '../components/SEO';
import { proofData } from '../data/proofData';

export default function Proof() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <SEO
        title="Proof of Work | Deep Dey"
        description="Verified activity, releases, uptime, and achievement dashboard."
        route="/proof"
      />

      <div className="space-y-3">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Credibility Dashboard</h2>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">Proof of Work</h1>
        <p className="text-zinc-500 max-w-2xl">A single dashboard for activity credibility, shipped versions, uptime health, verified milestones, and the full tech stack.</p>
      </div>

      {/* GitHub Activity */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">GitHub Activity</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {proofData.githubActivity.map((item) => (
            <article key={item.label} className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20">
              <p className="text-zinc-500 text-xs uppercase tracking-[0.25em]">{item.label}</p>
              <p className="text-2xl font-bold text-amber-500 mt-3">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Shipped Versions + Uptime */}
      <section className="grid lg:grid-cols-2 gap-6">
        <article className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
          <h2 className="text-xl font-bold text-white">Shipped Versions</h2>
          {proofData.releases.map((item) => (
            <div key={item.name + item.version} className="flex justify-between gap-4 border-b border-zinc-800 pb-3 last:border-none last:pb-0">
              <div>
                <p className="text-zinc-200 font-medium">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-500 text-sm font-bold">{item.version}</p>
                <p className="text-xs text-zinc-500">{item.status}</p>
              </div>
            </div>
          ))}
        </article>

        <article className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
          <h2 className="text-xl font-bold text-white">Uptime + Status</h2>
          {proofData.uptime.map((item) => (
            <div key={item.service} className="flex justify-between gap-4 border-b border-zinc-800 pb-3 last:border-none last:pb-0">
              <p className="text-zinc-300">{item.service}</p>
              <p className="text-amber-500 text-sm font-semibold text-right">{item.status} • {item.uptime}</p>
            </div>
          ))}
        </article>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">Tech Stack</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofData.techStack.map((group) => (
            <article key={group.category} className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
              <h3 className="text-amber-500 text-xs uppercase tracking-[0.2em] font-bold">{group.category}</h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item} className="text-zinc-300 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Career Milestones */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">Career Milestones</h2>
        <div className="relative border-l border-zinc-800 pl-6 space-y-6">
          {proofData.milestones.map((item) => (
            <div key={item.year} className="relative">
              <span className="absolute -left-[1.65rem] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-zinc-950" />
              <p className="text-amber-500 text-xs font-mono uppercase tracking-widest">{item.year}</p>
              <p className="text-zinc-300 text-sm mt-0.5">{item.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
        <h2 className="text-xl font-bold text-white">Verified Achievements</h2>
        <ul className="space-y-3">
          {proofData.achievements.map((item) => (
            <li key={item} className="flex items-start gap-3 text-zinc-400 text-sm">
              <span className="text-amber-500 mt-0.5 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
