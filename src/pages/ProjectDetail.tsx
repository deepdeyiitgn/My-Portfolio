import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { projectsData } from '../data/projectsData';
import { ExternalLink, Github, ArrowLeft, ShieldAlert, Layers, BarChart3, Workflow } from 'lucide-react';
import SEO from '../components/SEO';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projectsData.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Architectural blueprint not found.</h1>
        <Link to="/projects" className="text-amber-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Ecosystem
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-16"
    >
      <SEO 
        title={`${project.title} | Project Detail`}
        description={project.shortDescription}
        keywords={`${project.title}, Deep Dey Projects, Software Architecture`}
        route={`/projects/${project.id}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": project.title,
          "description": project.fullDescription,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web",
          "author": {
            "@type": "Person",
            "name": "Deep Dey"
          }
        }}
      />
      <Link to="/projects" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold">
        <ArrowLeft size={16} />
        <span>Back to Ecosystem</span>
      </Link>

      {/* Global Hiatus Synchronization Alert */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border-l-4 border-amber-500 bg-amber-500/10 p-6 rounded-r-3xl flex flex-col md:flex-row items-center gap-6"
      >
        <div className="bg-amber-500 p-3 rounded-2xl text-black">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-amber-500 font-black uppercase tracking-widest text-xs">System Alert: Development Paused</h3>
          <p className="text-amber-200/80 text-sm leading-relaxed">
            Project Status: <span className="font-bold underline">Delayed / On Hiatus.</span> Active development is paused due to technical restructuring and academic priorities (JEE Advanced 2027). All core updates were suspended on April 9, 2026.
          </p>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl p-4 border border-zinc-800">
              <img src={project.logoUrl} alt={project.title} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">{project.title}</h1>
            <div className="flex flex-wrap gap-3">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
              <Layers size={20} />
              Architectural Overview
            </h2>
            <p className="text-zinc-400 leading-relaxed text-lg">
              {project.fullDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Problem</p>
              <p className="text-sm text-zinc-300 mt-2">{project.problem}</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Solution</p>
              <p className="text-sm text-zinc-300 mt-2">{project.solution}</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Impact</p>
              <p className="text-sm text-zinc-300 mt-2">{project.impact}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-6">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-amber-500 text-black font-bold rounded-2xl flex items-center gap-3 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <ExternalLink size={20} />
              Visit Live Platform
            </a>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl flex items-center gap-3 hover:bg-zinc-800 transition-colors"
              >
                <Github size={20} />
                View Repository
              </a>
            )}
          </div>
        </div>

          {/* Interactive Case Study */}
          <div className="space-y-8">
            <div className="relative group">
              <div className="absolute -inset-2 bg-amber-500/20 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden aspect-[16/10] shadow-2xl p-8 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-zinc-400 text-xs uppercase tracking-widest">
                  <Workflow size={16} className="text-amber-500" />
                  Architecture Layers
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {project.architectureLayers.map((layer) => (
                    <div key={layer} className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs text-zinc-300">
                      {layer}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={16} className="text-amber-500" />
                Measurable Outcomes
              </h3>
              <div className="space-y-3">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-none last:pb-0">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">{metric.label}</span>
                    <span className="text-sm font-bold text-amber-500">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
  );
}
