import { useMemo, useState } from 'react';
import SEO from '../components/SEO';
import { contentData, ArticleItem } from '../data/contentData';

const filters: Array<ArticleItem['type'] | 'All'> = ['All', 'Build Log', 'Engineering Journal', 'JEE + Systems'];

export default function Journal() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');

  const items = useMemo(
    () => contentData.filter((item) => activeFilter === 'All' || item.type === activeFilter),
    [activeFilter],
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <SEO
        title="Build Journal | Deep Dey"
        description="Articles, build logs, and engineering notes."
        route="/journal"
      />

      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">Content Engine</h1>
        <p className="text-zinc-500 max-w-2xl">Articles, build logs, and JEE + engineering journal notes to keep the portfolio high-signal and SEO-strong.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
              activeFilter === filter
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-zinc-900/20 text-zinc-400 border-zinc-800 hover:border-amber-500/40'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article key={item.id} className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500">{item.type}</p>
            <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
            <p className="text-zinc-400 text-sm">{item.summary}</p>
            <p className="text-xs text-zinc-500">{item.date} • {item.readMinutes} min read</p>
          </article>
        ))}
      </section>
    </div>
  );
}
