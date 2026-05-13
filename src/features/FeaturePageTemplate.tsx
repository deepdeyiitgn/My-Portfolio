import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Activity, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { FeaturePageContent } from './types';

export default function FeaturePageTemplate({ content }: { content: FeaturePageContent }) {
  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-10">
      <SEO
        title={`${content.title} | Deep Dey Feature`}
        description={content.description}
        keywords={content.keywords}
        route={content.route}
        schema={{
          '@context': 'https://schema.org',
          '@type': content.schemaType || 'TechArticle',
          headline: content.title,
          description: content.description,
          about: content.category,
          author: { '@type': 'Person', name: 'Deep Dey' },
        }}
      />

      <Link to="/feature" className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold">
        <ArrowLeft size={16} /> Back to Feature Page
      </Link>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-amber-500 font-mono tracking-[0.35em] uppercase text-xs">{content.category}</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{content.title}</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">{content.summary}</p>
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
        <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2"><Route size={14} className="text-amber-500" /> Workflow</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {content.workflow.map((step) => (
            <div key={step} className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300 leading-relaxed">{step}</div>
          ))}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">Architecture Diagram (SVG)</h2>
          <svg viewBox="0 0 680 280" className="w-full h-auto rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <defs>
              <linearGradient id="featureNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            {content.diagramNodes.slice(0, -1).map((node, idx) => {
              const next = content.diagramNodes[idx + 1];
              return <line key={`${node.id}-${next.id}`} x1={node.x} y1={node.y} x2={next.x} y2={next.y} stroke="#52525b" strokeWidth="2" strokeDasharray="6 4" />;
            })}
            {content.diagramNodes.map((node) => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="34" fill="url(#featureNodeGradient)" stroke="#f59e0b" strokeWidth="1.5" />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="11" fill="#fafafa" fontWeight="700">{node.id}</text>
                <text x={node.x} y={node.y + 54} textAnchor="middle" fontSize="10" fill="#a1a1aa">{node.label}</text>
              </g>
            ))}
          </svg>
          <p className="text-zinc-400 text-sm leading-relaxed">{content.description}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> Key Points</h2>
          <ul className="space-y-2">
            {content.highlights.map((point) => (
              <li key={point} className="text-zinc-300 text-sm leading-relaxed flex gap-2"><span className="text-amber-500 mt-1">•</span><span>{point}</span></li>
            ))}
          </ul>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid lg:grid-cols-2 gap-6">
        {content.visualizations.map((viz) => (
          <div key={viz.title} className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
            <h3 className="text-xl text-white font-bold tracking-tight">{viz.title}</h3>
            <p className="text-amber-500 text-lg font-black">{viz.metric}</p>
            <p className="text-zinc-400 text-sm leading-relaxed">{viz.detail}</p>
          </div>
        ))}
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
        <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2"><Activity size={14} className="text-amber-500" /> Implementation + Animation Notes</h2>
        <ul className="space-y-2">
          {content.implementationPoints.map((item) => (
            <li key={item} className="text-zinc-300 text-sm leading-relaxed flex gap-2"><span className="text-amber-500 mt-1">•</span><span>{item}</span></li>
          ))}
        </ul>
      </motion.section>

      <Link to="/feature" className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold">
        <ArrowLeft size={16} /> Back to Feature Page
      </Link>
    </div>
  );
}
