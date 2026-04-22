import SEO from '../components/SEO';
import { nowData } from '../data/nowData';

export default function Now() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <SEO title="Now / Roadmap / Changelog | Deep Dey" description="Current focus, roadmap, and change history." route="/now" />

      <div className="space-y-3">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">Now • Roadmap • Changelog</h1>
        <p className="text-zinc-500 max-w-2xl">Transparent updates for current priorities, future direction, and what changed recently.</p>
      </div>

      <section className="grid lg:grid-cols-3 gap-6">
        <article className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <h2 className="text-xl font-bold text-white">Now</h2>
          <ul className="space-y-2 list-disc pl-5 text-zinc-400">
            {nowData.now.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <h2 className="text-xl font-bold text-white">Roadmap</h2>
          <ul className="space-y-2 list-disc pl-5 text-zinc-400">
            {nowData.roadmap.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <h2 className="text-xl font-bold text-white">Changelog</h2>
          <ul className="space-y-3 text-zinc-400">
            {nowData.changelog.map((item) => (
              <li key={item.version}>
                <p className="text-amber-500 font-bold">{item.version}</p>
                <p className="text-xs text-zinc-500">{item.date}</p>
                <p className="text-sm">{item.notes}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
