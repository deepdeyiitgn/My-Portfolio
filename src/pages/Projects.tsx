import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectsData } from '../data/projectsData';
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight, Clipboard } from 'lucide-react';
// import ProjectPlaceholder from '../components/ProjectPlaceholder';
import SEO from '../components/SEO';

type WatermarkSite = {
  _id: string;
  url: string;
  domain: string;
  favicon?: string;
  title?: string;
  source?: string;
  hits?: number;
};

export default function Projects() {
  const [watermarkSites, setWatermarkSites] = useState<WatermarkSite[]>([]);
  const [watermarkPage, setWatermarkPage] = useState(1);
  const [watermarkTotalPages, setWatermarkTotalPages] = useState(1);
  const [loadingWatermarks, setLoadingWatermarks] = useState(false);
  const [copied, setCopied] = useState(false);

  const watermarkEmbedSnippet = `<!-- Powered by Deep watermark -->\n<script src="https://deepdey.vercel.app/assets/js/footer-extras.js" defer></script>`;

  useEffect(() => {
    const fetchSites = async () => {
      setLoadingWatermarks(true);
      try {
        const r = await fetch(`/api/projects?action=watermark-sites&status=approved&page=${watermarkPage}&limit=10`);
        const d = await r.json();
        if (d?.ok) {
          setWatermarkSites(Array.isArray(d.sites) ? d.sites : []);
          setWatermarkTotalPages(Math.max(1, Number(d?.pagination?.totalPages || 1)));
        }
      } catch {
        setWatermarkSites([]);
      } finally {
        setLoadingWatermarks(false);
      }
    };
    fetchSites();
  }, [watermarkPage]);

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(watermarkEmbedSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-16">
      <SEO 
        title="Project Ecosystem | Deep Dey"
        description="A list of architectural software projects built by Deep Dey, including qlynk.me, StudyBot, and more."
        keywords="Portfolio, React Projects, AI Projects, Software Engineering Projects"
        route="/projects"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Software Projects by Deep Dey",
          "itemListElement": projectsData.map((p, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://deepdey.vercel.app/projects/${p.id}`,
            "name": p.title
          }))
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">The Ecosystem</h2>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Practical Work</h1>
        <p className="text-zinc-500 max-w-2xl">
          Real-world projects built while learning web development, automation, and SEO fundamentals. 
          Architected with <span className="text-zinc-300">Advanced Prompt Engineering</span> systems.
        </p>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {projectsData.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-amber-500/50 hover:bg-zinc-900/50 transition-all duration-500 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-colors"></div>
            
            <div className="flex flex-col h-full space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 p-2 group-hover:border-amber-500/30 transition-colors overflow-hidden flex items-center justify-center">
                  <img src={project.logoUrl} alt={project.title} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">
                  {project.category}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight">
                  {project.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                  {project.shortDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[10px] text-zinc-500 font-medium px-2 py-0.5 bg-zinc-950/50 rounded-md">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-white group/btn hover:text-amber-500 transition-colors"
                >
                  <span>View Architecture</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-amber-500 transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border border-zinc-800 rounded-3xl p-8 bg-zinc-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-xl">Want deeper proof and delivery history?</p>
          <p className="text-zinc-500 text-sm">Explore metrics, uptime, releases, and timeline updates before collaboration.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/proof" className="px-4 py-3 bg-amber-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-colors">Proof</Link>
          <Link to="/now" className="px-4 py-3 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-500 transition-colors">Roadmap</Link>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-3xl p-6 md:p-8 bg-zinc-900/20 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-xl">Top 10 Projects Using Deep Watermark</h3>
            <p className="text-zinc-500 text-sm">Websites using the Powered by Deep watermark (approved list only).</p>
          </div>
          <button
            onClick={handleCopySnippet}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
          >
            <Clipboard size={14} />
            {copied ? 'Copied' : 'Copy Script'}
          </button>
        </div>

        <pre className="text-[11px] text-zinc-300 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-all">
          {watermarkEmbedSnippet}
        </pre>

        {loadingWatermarks ? (
          <p className="text-zinc-500 text-sm">Loading maintained websites…</p>
        ) : watermarkSites.length === 0 ? (
          <p className="text-zinc-600 text-sm">No approved websites yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {watermarkSites.map((site) => (
              <a
                key={site._id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 hover:border-amber-500/40 transition-colors"
              >
                <img
                  src={site.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(site.domain || '')}`}
                  alt={site.domain}
                  className="w-6 h-6 rounded"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-zinc-200 text-sm font-semibold truncate">{site.domain || site.url}</p>
                  <p className="text-zinc-500 text-[11px] truncate">{site.title || site.url}</p>
                </div>
                <span className="ml-auto text-[10px] text-amber-500 font-mono uppercase tracking-wider">Uses Deep Watermark</span>
              </a>
            ))}
          </div>
        )}

        {watermarkTotalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setWatermarkPage((p) => Math.max(1, p - 1))}
              disabled={watermarkPage <= 1}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-zinc-500 text-sm">Page {watermarkPage} / {watermarkTotalPages}</span>
            <button
              onClick={() => setWatermarkPage((p) => Math.min(watermarkTotalPages, p + 1))}
              disabled={watermarkPage >= watermarkTotalPages}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1 text-sm"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
