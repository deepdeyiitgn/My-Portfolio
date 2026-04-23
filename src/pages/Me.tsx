import { motion } from 'motion/react';
import { Camera, Video, Brush, Compass, Heart, Instagram, Laptop, Layers } from 'lucide-react';
import SEO from '../components/SEO';

export default function Me() {
  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 space-y-32">
      <SEO 
        title="Persona & Vision | Beyond the Code"
        description="Explore the personal side of Deep Dey: Visual storytelling through photography, video editing, and the disciplined vision of a JEE Advanced 2027 aspirant."
        keywords="Deep Dey Photography, Creative Storytelling, Visual Aesthetics, Discipline and Vision, @captivatedeep"
        route="/me"
      />

      {/* Hero Narrative */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden rounded-[4rem]">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img
            src="https://picsum.photos/seed/visionary/1920/1080?blur=10"
            alt="Atmospheric vision"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950"></div>
        
        <div className="relative z-10 text-center space-y-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-mono uppercase tracking-[0.2em]"
          >
            <Compass size={14} />
            <span>The Human Archive</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-[10rem] font-black text-white tracking-tighter leading-none"
          >
            BEYOND <br /> THE <span className="text-amber-500 italic">CODE.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-500 max-w-lg mx-auto text-lg md:text-xl font-light"
          >
            A storyteller in the digital age, documenting the intersection of aesthetics, hardware, and engineering.
          </motion.p>
        </div>
      </section>

      {/* Section 1: The Visual Eye */}
      <section className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">The Visual Eye.</h2>
            <p className="text-zinc-500 text-lg leading-relaxed font-light">
              Photography is how I process the world. Under the handles <span className="text-zinc-200">@captivatedeep</span> and <span className="text-zinc-200">@justdeepdey</span>, I curate visual narratives that focus on timing, composition, and mood—the same principles I apply to interface design.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl space-y-3">
              <Camera className="text-amber-500" size={24} />
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Photography</h4>
              <p className="text-zinc-500 text-xs">Capturing raw moments through a high-contrast lens.</p>
            </div>
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl space-y-3">
              <Video className="text-amber-500" size={24} />
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Videography</h4>
              <p className="text-zinc-500 text-xs">Cinematic storytelling powered by structured editing.</p>
            </div>
          </div>

          <a 
            href="https://instagram.com/justdeepdey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-amber-500 hover:text-amber-400 transition-colors font-black uppercase tracking-widest text-xs"
          >
            <Instagram size={20} />
            <span>Follow the Gallery</span>
          </a>
        </div>

        {/* Masonry-style Photography Placeholder */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { id: 'p1', h: 'h-64', seed: 'urban' },
            { id: 'p2', h: 'h-48', seed: 'nature' },
            { id: 'p3', h: 'h-80', seed: 'architecture' },
            { id: 'p4', h: 'h-56', seed: 'tech' },
            { id: 'p5', h: 'h-64', seed: 'abstract' },
            { id: 'p6', h: 'h-48', seed: 'workspace' }
          ].map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative ${img.h} rounded-3xl overflow-hidden group border border-zinc-900 hover:border-amber-500/50 transition-colors`}
            >
              <img
                src={`https://picsum.photos/seed/${img.id+img.seed}/600/800`}
                alt="Photography piece"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: Discipline & Digital Roots */}
      <section className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="order-2 lg:order-1 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-zinc-900/40 p-1 rounded-[4rem] aspect-square flex items-center justify-center"
          >
            <div className="bg-zinc-950 w-full h-full rounded-[3.8rem] border border-zinc-900 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
               <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
               <Laptop size={120} className="text-amber-500 opacity-20" />
               <div className="text-center space-y-2">
                 <h4 className="text-white font-black uppercase tracking-[0.3em] text-sm">System Root</h4>
                 <p className="text-zinc-600 font-mono text-xs uppercase">Bedrock Server Node v1.02</p>
               </div>
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Discipline & Minecraft.</h2>
            <p className="text-zinc-500 text-lg leading-relaxed font-light">
              My technical journey didn't start with professional projects. It started with <span className="text-zinc-300">Minecraft Bedrock Servers</span>. Managing hardware, hosting local worlds for my family, and troubleshooting networking at age 16 shaped my systematic way of thinking. And Also I started with an youtube channel and on 205 after 10th Board, I started making website on Google Sites then i come on Odoo.com then started making website and tools with the help of ai and code the website!
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 border-l-2 border-amber-500 bg-zinc-900/20 rounded-r-3xl space-y-4">
              <h3 className="text-xl font-bold text-white">The Family CTO</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Whether it's managing home networking or configuring server kernels for lag-free gameplay, high-pressure troubleshooting has been my playground since the beginning.
              </p>
            </div>
            
            <div className="p-8 border-l-2 border-amber-500 bg-zinc-900/20 rounded-r-3xl space-y-4">
              <h3 className="text-xl font-bold text-white">Academic Rigor</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                That same "server management" discipline now fuels my JEE Advanced preparation. The ability to sit and debug a system is the same ability I use to solve complex Physics and Mathematics problems for 12 hours a day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Reflection */}
      <section className="text-center py-20 border-t border-zinc-900 space-y-8 max-w-3xl mx-auto">
        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black mx-auto shadow-2xl shadow-amber-500/20">
          <Heart size={24} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight italic">Persistence is the fuel of vision.</h2>
        <p className="text-zinc-500 font-light leading-relaxed">
          I don't just build websites; I map the coordinates of my future. From local Minecraft servers to targeting the halls of IIT Kharagpur, the mission remains the same: <span className="text-zinc-300">architecting a life of excellence.</span>
        </p>
        <div className="pt-8">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Current Coordinate</p>
          <p className="text-amber-500 font-bold uppercase tracking-widest mt-1">Dharmanagar, Tripura 2026</p>
        </div>
      </section>
    </div>
  );
}
