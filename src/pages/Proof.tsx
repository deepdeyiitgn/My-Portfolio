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
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">Proof of Work</h1>
        <p className="text-zinc-500 max-w-2xl">A single dashboard for activity credibility, shipped versions, uptime health, and verified milestones.</p>
      </div>

      <section className="grid md:grid-cols-3 gap-4">
        {proofData.githubActivity.map((item) => (
          <article key={item.label} className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20">
            <p className="text-zinc-500 text-xs uppercase tracking-[0.25em]">{item.label}</p>
            <p className="text-2xl font-bold text-amber-500 mt-3">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <article className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
          <h2 className="text-xl font-bold text-white">Shipped Versions</h2>
          {proofData.releases.map((item) => (
            <div key={item.name} className="flex justify-between gap-4 border-b border-zinc-800 pb-3 last:border-none last:pb-0">
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
              <p className="text-amber-500 text-sm font-semibold">{item.status} • {item.uptime}</p>
            </div>
          ))}
        </article>
      </section>

      <section className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
        <h2 className="text-xl font-bold text-white">Verified Achievements</h2>
        <ul className="space-y-3 list-disc pl-5 text-zinc-400">
          {proofData.achievements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
