import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import { featureDocs } from '../features';

function truncateSummary(text: string, maxLen = 138): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}.......`;
}

export default function Features() {
  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-16">
      <SEO
        title="Feature Atlas | Deep Dey"
        description="Explore detailed feature pages with architecture, workflow, diagrams, implementation points, and validation strategy."
        keywords="feature pages, architecture, workflow, software systems"
        route="/feature"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Feature Atlas',
          itemListElement: featureDocs.map((feature, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `https://deepdey.vercel.app/feature/${feature.slug}`,
            name: feature.title,
          })),
        }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Feature System</h2>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Feature Atlas</h1>
        <p className="text-zinc-500 max-w-3xl">
          Dynamic index of platform capabilities. Every feature card routes to a detailed page with deep narrative,
          diagram, workflows, architecture layers, implementation notes, risks, quality gates, and roadmap.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {featureDocs.map((feature, index) => (
          <motion.div
            key={feature.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
            className="group relative bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-7 hover:border-amber-500/50 hover:bg-zinc-900/60 transition-all duration-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <h3 className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">{feature.category}</p>
              </div>
              <svg width="56" height="56" viewBox="0 0 56 56" className="rounded-2xl border border-zinc-700 shrink-0" aria-hidden>
                <rect x="0" y="0" width="56" height="56" rx="16" fill={feature.logo.background} />
                <circle cx="28" cy="28" r="16" fill={feature.logo.accent} fillOpacity="0.18" />
                <text x="28" y="33" textAnchor="middle" fontSize="14" fontWeight="800" fill={feature.logo.accent}>
                  {feature.logo.symbol}
                </text>
              </svg>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed mt-5 min-h-[78px]">{truncateSummary(feature.summary)}</p>

            <div className="mt-6 flex items-center justify-between">
              <Link
                to={`/feature/${feature.slug}`}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-amber-500 transition-colors"
              >
                <span>Open Feature</span>
                <ArrowRight size={14} />
              </Link>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                <Layers size={12} /> Deep Detail
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
