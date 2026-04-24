import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { projectsData } from '../data/projectsData';
import { ExternalLink, ArrowRight } from 'lucide-react';
// import ProjectPlaceholder from '../components/ProjectPlaceholder';
import SEO from '../components/SEO';

export default function Projects() {
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
    </div>
  );
}
