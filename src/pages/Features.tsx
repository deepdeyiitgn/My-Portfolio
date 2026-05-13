import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import featureLinks from '../features/feature-links.json';
import type { FeatureListItem } from '../features/types';

function truncateSummary(text: string, maxLen = 138): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}.......`;
}

const links = featureLinks as FeatureListItem[];

export default function Features() {
  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-16">
      <SEO
        title="Feature Atlas | Deep Dey"
        description="Explore all custom feature pages with deep diagrams, workflow, visualizations, implementation points, and animated sections."
        keywords="feature page, deep dey features, architecture, workflow, visualizations, animations"
        route="/feature"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Feature Atlas',
          itemListElement: links.map((feature, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `https://deepdey.vercel.app${feature.link}`,
            name: feature.title,
          })),
        }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Feature System</h2>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Feature Atlas</h1>
        <p className="text-zinc-500 max-w-3xl">
          Custom TSX-based feature pages. Every feature has independent implementation, animations, SVG diagram section,
          visualization cards, workflow blocks, and full route-level SEO metadata.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {links.map((feature, index) => (
          <motion.div
            key={feature.link}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.02 }}
            className="group relative bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-7 hover:border-amber-500/50 hover:bg-zinc-900/60 transition-all duration-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <h3 className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight">{feature.title}</h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Custom TSX Feature</p>
              </div>
              <svg width="56" height="56" viewBox="0 0 56 56" className="rounded-2xl border border-zinc-700 shrink-0" aria-hidden>
                <rect x="0" y="0" width="56" height="56" rx="16" fill="#19191d" />
                <circle cx="28" cy="28" r="16" fill="#f59e0b" fillOpacity="0.18" />
                <text x="28" y="33" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f59e0b">FX</text>
              </svg>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed mt-5 min-h-[78px]">{truncateSummary(feature.summary)}</p>

            <div className="mt-6 flex items-center justify-between">
              <Link to={feature.link} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-amber-500 transition-colors">
                <span>Open Feature</span>
                <ArrowRight size={14} />
              </Link>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                <Layers size={12} /> Detailed
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
