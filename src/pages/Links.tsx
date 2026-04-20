import { motion } from 'motion/react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { linksData, LinkItem } from '../data/linksData';

export default function Links() {
  // Group links by category
  const groupedLinks = linksData.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const categories = Object.keys(groupedLinks) as (keyof typeof groupedLinks)[];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-20 px-6 space-y-16 overflow-x-hidden relative">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-amber-500/5 blur-[120px] rounded-full -z-10"></div>

      {/* Header Profile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center space-y-6 text-center"
      >
        <div className="relative group">
          <div className="absolute -inset-2 bg-amber-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative w-32 h-32 rounded-full border border-zinc-800 p-1 bg-zinc-900 shadow-2xl overflow-hidden">
            <img
              src="/assets/images/myphoto.png"
              alt="Deep Dey"
              className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
              onError={(e) => {
                e.currentTarget.src = "https://qlynk.vercel.app/wiki-images/Deep_Dey_portrait_2025.png";
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tighter">Deep Dey</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-4 bg-amber-500/50"></span>
            <p className="text-amber-500 font-mono text-[10px] uppercase tracking-[0.4em]">Infrastructure Architect</p>
            <span className="h-[1px] w-4 bg-amber-500/50"></span>
          </div>
          <p className="text-zinc-500 max-w-[320px] text-sm leading-relaxed mx-auto font-light">
            Software Architect | JEE 2027 Aspirant <br />
            Building digital ecosystems at scale.
          </p>
        </div>
      </motion.div>

      {/* Link Stack */}
      <div className="w-full max-w-[450px] space-y-12">
        {categories.map((category, catIndex) => (
          <div key={category} className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -10 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: catIndex * 0.2 }}
               className="flex items-center gap-3"
            >
              <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] pl-2">{category}</h2>
              <div className="h-[1px] flex-grow bg-zinc-900"></div>
            </motion.div>

            <div className="space-y-4">
              {groupedLinks[category].map((link, index) => {
                const styles = {
                  Discontinued: {
                    container: 'border-zinc-800 bg-zinc-950/40 grayscale opacity-80 hover:opacity-100 hover:grayscale-0 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
                    icon: 'text-zinc-700 group-hover:text-amber-500',
                    title: 'text-zinc-500 group-hover:text-amber-500',
                    desc: 'text-zinc-600 group-hover:text-zinc-400',
                    arrow: 'text-zinc-800 group-hover:text-amber-500'
                  },
                  'On Hiatus': {
                    container: 'border-red-500/30 bg-red-950/10 hover:border-red-500/60',
                    icon: 'text-red-500',
                    title: 'text-red-500',
                    desc: 'text-red-400/40 group-hover:text-red-400/60',
                    arrow: 'text-red-500'
                  },
                  Active: {
                    container: 'border-amber-500/40 bg-zinc-900/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500 hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]',
                    icon: 'text-amber-500',
                    title: 'text-amber-500 font-bold',
                    desc: 'text-amber-400/40 group-hover:text-amber-400/60',
                    arrow: 'text-amber-500 animate-pulse'
                  },
                  Default: {
                    container: 'border-amber-500/10 bg-zinc-900/30 hover:border-amber-500/40',
                    icon: 'text-amber-500/60 group-hover:text-amber-500',
                    title: 'text-amber-500/80 group-hover:text-amber-500',
                    desc: 'text-zinc-500 group-hover:text-zinc-400',
                    arrow: 'text-zinc-700 group-hover:text-amber-500'
                  }
                };

                const currentStyle = link.status ? (styles[link.status] || styles.Default) : styles.Default;

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (catIndex * 0.2) + (index * 0.1) }}
                  >
                    {link.url.startsWith('/') ? (
                      <Link
                        to={link.url}
                        className={`group relative w-full flex items-center justify-between p-5 backdrop-blur-md border rounded-3xl transition-all duration-500 ${currentStyle.container}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 flex items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-900 transition-all p-3 overflow-hidden ${currentStyle.icon}`}>
                            {link.isSvg ? (
                              <div className="w-full h-full flex items-center justify-center transition-colors" dangerouslySetInnerHTML={{ __html: link.logoUrlOrSvgCode }} />
                            ) : (
                              <img src={link.logoUrlOrSvgCode} alt="" className="w-full h-full object-contain" />
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className={`transition-colors tracking-tight ${currentStyle.title}`}>{link.title}</span>
                            <span className={`text-[10px] font-medium transition-colors ${currentStyle.desc}`}>{link.description}</span>
                          </div>
                        </div>
                        <ArrowRight size={18} className={`transition-all group-hover:translate-x-1 ${currentStyle.arrow}`} />
                      </Link>
                    ) : (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative w-full flex items-center justify-between p-5 backdrop-blur-md border rounded-3xl transition-all duration-500 ${currentStyle.container}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 flex items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-900 transition-all p-3 overflow-hidden ${currentStyle.icon}`}>
                            {link.isSvg ? (
                              <div className="w-full h-full flex items-center justify-center transition-colors" dangerouslySetInnerHTML={{ __html: link.logoUrlOrSvgCode }} />
                            ) : (
                              <img src={link.logoUrlOrSvgCode} alt="" className="w-full h-full object-contain" />
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className={`transition-colors tracking-tight ${currentStyle.title}`}>{link.title}</span>
                            <span className={`text-[10px] font-medium transition-colors ${currentStyle.desc}`}>{link.description}</span>
                          </div>
                        </div>
                        <ExternalLink size={18} className={`transition-all group-hover:translate-x-1 ${currentStyle.arrow}`} />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Link Architecture Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-[450px] p-6 bg-zinc-900/20 border border-zinc-900 rounded-3xl"
      >
        <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] mb-6 text-center">Status Protocol Legend</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Discontinued</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">On Hiatus</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Default</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse"></div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-20 text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-8 bg-zinc-900"></div>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Neural Link ID: QLYNK-99X</p>
          <div className="h-[1px] w-8 bg-zinc-900"></div>
        </div>
        <p className="text-[10px] text-zinc-800 uppercase tracking-widest leading-relaxed">
          Platform Architecture by Deep Dey <br />
          &copy; {new Date().getFullYear()} Persistent Feed // qlynk.me
        </p>
      </motion.div>
    </div>
  );
}
