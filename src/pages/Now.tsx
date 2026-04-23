import SEO from '../components/SEO';
import { nowData } from '../data/nowData';

export default function Now() {
  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-12">
      <SEO title="Now / Roadmap / Changelog | Deep Dey" description="Current focus, roadmap, and change history." route="/now" />

      <div className="space-y-3">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Live Status</h2>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">Now • Roadmap • Changelog</h1>
        <p className="text-zinc-500 max-w-2xl">Transparent updates for current priorities, future direction, what changed recently, and what I am actively learning.</p>
      </div>

      {/* Now + Roadmap + Learning */}
      <section className="grid lg:grid-cols-3 gap-6">
        <article className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <h2 className="text-xl font-bold text-white">Now</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Last updated: April 2026</p>
          <ul className="space-y-2">
            {nowData.now.map((item) => (
              <li key={item} className="flex items-start gap-2 text-zinc-400 text-sm">
                <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <h2 className="text-xl font-bold text-white">Roadmap</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Planned milestones</p>
          <ul className="space-y-2">
            {nowData.roadmap.map((item) => (
              <li key={item} className="flex items-start gap-2 text-zinc-400 text-sm">
                <span className="text-zinc-600 mt-0.5 shrink-0">◦</span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <h2 className="text-xl font-bold text-white">Currently Learning</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active study queue</p>
          <ul className="space-y-2">
            {nowData.learning.map((item) => (
              <li key={item} className="flex items-start gap-2 text-zinc-400 text-sm">
                <span className="text-amber-500/60 mt-0.5 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Changelog */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">Version Changelog</h2>
        <div className="relative border-l border-zinc-800 pl-6 space-y-8">
          {nowData.changelog.map((item) => (
            <div key={item.version} className="relative">
              <span className="absolute -left-[1.65rem] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-zinc-950" />
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <p className="text-amber-500 font-bold font-mono">{item.version}</p>
                <p className="text-xs text-zinc-500">{item.date}</p>
              </div>
              <p className="text-zinc-400 text-sm">{item.notes}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
