import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, CheckCircle2, CircleDot, ShieldAlert, Workflow } from 'lucide-react';
import SEO from '../components/SEO';
import { getFeatureBySlug } from '../features';

export default function FeatureDetail() {
  const { slug } = useParams();
  const feature = getFeatureBySlug(slug);

  if (!feature) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Feature page not found.</h1>
        <Link to="/feature" className="text-amber-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Feature Atlas
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-12"
    >
      <SEO
        title={`${feature.title} | Feature Detail`}
        description={feature.summary}
        keywords={`${feature.title}, feature architecture, implementation workflow`}
        route={`/feature/${feature.slug}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: feature.title,
          description: feature.description,
          about: feature.category,
          author: {
            '@type': 'Person',
            name: 'Deep Dey',
          },
        }}
      />

      <Link to="/feature" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold">
        <ArrowLeft size={16} />
        <span>Back to Feature Atlas</span>
      </Link>

      <div className="space-y-5">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div>
            <p className="text-amber-500 font-mono tracking-[0.35em] uppercase text-xs">{feature.category}</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mt-2">{feature.title}</h1>
          </div>
          <svg width="80" height="80" viewBox="0 0 80 80" className="rounded-3xl border border-zinc-700 shrink-0" aria-hidden>
            <rect x="0" y="0" width="80" height="80" rx="24" fill={feature.logo.background} />
            <circle cx="40" cy="40" r="24" fill={feature.logo.accent} fillOpacity="0.16" />
            <text x="40" y="47" textAnchor="middle" fontSize="22" fontWeight="800" fill={feature.logo.accent}>
              {feature.logo.symbol}
            </text>
          </svg>
        </div>
        <p className="text-zinc-400 text-lg leading-relaxed">{feature.description}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2"><Workflow size={14} className="text-amber-500" /> Workflow</h2>
          <ol className="space-y-3">
            {feature.workflow.map((step) => (
              <li key={step} className="text-zinc-300 text-sm leading-relaxed flex gap-3">
                <span className="text-amber-500 mt-1"><CircleDot size={14} /></span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2"><BarChart3 size={14} className="text-amber-500" /> Key Points</h2>
          <ul className="space-y-2">
            {feature.keyPoints.map((point) => (
              <li key={point} className="text-zinc-300 text-sm leading-relaxed flex gap-2">
                <span className="text-amber-500 mt-1"><CheckCircle2 size={14} /></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
        <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">{feature.diagram.title}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {feature.diagram.nodes.map((node) => (
            <div key={node.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">{node.id}</p>
              <p className="text-white font-bold mt-1">{node.label}</p>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{node.detail}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Node Connections</p>
          <div className="grid md:grid-cols-2 gap-2">
            {feature.diagram.edges.map((edge) => (
              <div key={`${edge.from}-${edge.to}-${edge.label}`} className="text-xs text-zinc-300 border border-zinc-800 rounded-lg px-3 py-2">
                <span className="text-amber-500">{edge.from}</span> → <span className="text-amber-500">{edge.to}</span> · {edge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        {feature.visualizations.map((viz) => (
          <div key={viz.title} className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
            <h3 className="text-white text-xl font-bold tracking-tight">{viz.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{viz.summary}</p>
            <ul className="space-y-2">
              {viz.points.map((p) => (
                <li key={p} className="text-zinc-300 text-sm leading-relaxed flex gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">Architecture Layers</h3>
          <div className="grid gap-2">
            {feature.architectureLayers.map((layer) => (
              <div key={layer} className="text-sm text-zinc-300 border border-zinc-800 rounded-xl px-3 py-2 bg-zinc-950/60">{layer}</div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">Implementation Notes</h3>
          <ul className="space-y-2">
            {feature.implementationNotes.map((note) => (
              <li key={note} className="text-zinc-300 text-sm leading-relaxed flex gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">Quality Checks</h3>
          <ul className="space-y-2">
            {feature.qualityChecks.map((check) => (
              <li key={check} className="text-zinc-300 text-sm leading-relaxed">{check}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2"><ShieldAlert size={14} className="text-amber-500" /> Risks</h3>
          <ul className="space-y-2">
            {feature.risks.map((risk) => (
              <li key={risk} className="text-zinc-300 text-sm leading-relaxed">{risk}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">Roadmap</h3>
          <ul className="space-y-2">
            {feature.roadmap.map((item) => (
              <li key={item} className="text-zinc-300 text-sm leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">Narrative</h3>
        <div className="space-y-4">
          {feature.narrative.map((paragraph) => (
            <p key={paragraph} className="text-zinc-300 text-sm leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-400 font-bold">FAQs</h3>
        <div className="space-y-3">
          {feature.faqs.map((faq) => (
            <article key={faq.question} className="border border-zinc-800 rounded-2xl p-4 bg-zinc-950/70">
              <p className="text-white font-semibold">{faq.question}</p>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <Link to="/feature" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold">
        <ArrowLeft size={16} />
        <span>Back to Feature Atlas</span>
      </Link>
    </motion.div>
  );
}
