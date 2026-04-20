import { motion } from 'motion/react';
import { Cpu, Cloud, Target, Zap, Blocks, Globe, Lightbulb } from 'lucide-react';
import FAQ from '../components/FAQ';
import SEO from '../components/SEO';

const METHODOLOGY_CARDS = [
  {
    id: 'ai-dev',
    title: 'AI-Assisted Development',
    icon: <Cpu className="text-amber-500" size={32} />,
    description: '3 years of elite experience in structured Prompt Engineering. I act as an architect, using AI models like GPT-4o, Gemini 1.5 Pro, and Claude 3.5 as development partners to iterate through complex logic and build production-ready systems.',
    points: ['Systematic logic decomposition', 'Loop-based iteration for reliability', 'Debugging complex AI outputs'],
  },
  {
    id: 'cloud-native',
    title: 'Cloud-Native Architecture',
    icon: <Cloud className="text-amber-500" size={32} />,
    description: 'Specializing in scalable full-stack deployments. Expertise in architecting high-performance backends with Node.js and Python (FastAPI), managing databases with MongoDB, and deploying hyper-fast frontends via Vercel.',
    points: ['Hyper-performance SPAs', 'Secure API integration', 'Modular system design'],
  },
  {
    id: 'jee-mission',
    title: 'The JEE 2027 Mission',
    icon: <Target className="text-amber-500" size={32} />,
    description: 'Disciplined pursuit of IIT Kharagpur CSE Class of 2031. Balancing rigorous 12+ hour academic sessions with elite coding milestones. My target is the absolute top tier of Indian engineering excellence.',
    points: ['Physics, Chem, Math mastery', 'Architectural problem-solving', 'Unwavering goal focus'],
  }
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-40">
      <SEO 
        title="Cinematic Biography & Methodology | Deep Dey"
        description="Born in Dharmanagar, Tripura. Scored 80%+ in Boards. Transitioned to CBSE at Golden Valley High School. Targeting IIT Kharagpur, IIT Kanpur, or IIT Gandhinagar (JEE 2027)."
        keywords="Deep Dey Biography, New Shishu Bihar school, Golden Valley High School, JEE Advanced 2027, IIT Kharagpur CSE target, Physics Wallah Arjuna batch"
        route="/about"
        schema={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": "Deep Dey",
            "birthPlace": "Dharmanagar, Tripura",
            "description": "Expert in AI-assisted development and modular system thinking, targeting IIT KGP CSE 2027."
          }
        }}
      />

      {/* Cinematic Biography Hero */}
      <section className="space-y-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Portrait Image Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-4 bg-amber-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] border border-zinc-800 shadow-2xl">
              <img 
                src="/assets/images/myphoto.png" 
                alt="Deep Dey Cinematic Portrait"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-[0.4em]">Est. 2008</p>
                <h3 className="text-white text-3xl font-black tracking-tighter">DEEP DEY.</h3>
              </div>
            </div>
          </motion.div>

          {/* Biography Content Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-xs">The Digital Pioneer</h2>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                AN ARCHITECT'S <br /> <span className="italic font-light">JOURNEY.</span>
              </h1>
            </div>

            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed font-light max-w-2xl">
              <p>
                Born on <span className="text-white font-medium">October 21, 2008</span>, in the serene landscape of <span className="text-white font-medium">Dharmanagar, Tripura</span>, my foundation was built on analytical rigor and a fascination with systems. 
              </p>
              <p>
                After scoring over <span className="text-white font-medium">80% in Madhyamik</span> from New Shishu Bihar H.S. School, I made a strategic transition to CBSE at <span className="text-white font-medium">Golden Valley High School</span> to align my academic path with national engineering standards.
              </p>
              <p>
                Currently, I am navigating the intense waters of <span className="text-amber-500 font-bold uppercase tracking-tight">JEE Advanced 2027</span>. My mission is singular: to enter the halls of <span className="text-zinc-200">IIT Kharagpur, Kanpur, or Gandhinagar</span>.
              </p>
              <p>
                My lifestyle is defined by extreme discipline—starting every day at <span className="text-zinc-200">6:00 AM</span> and training under the <span className="italic">Physics Wallah "Arjuna" and "Manzil"</span> batches to reach the elite percentile.
              </p>
            </div>

            {/* Life Motto & Signature */}
            <div className="pt-8 space-y-12">
              <div className="relative pl-8 border-l-4 border-amber-500 bg-amber-500/5 p-8 rounded-r-3xl max-w-xl">
                 <p className="text-xl md:text-2xl text-white font-light italic leading-snug">
                   "Remember: <span className="text-amber-500 font-bold">100% effort</span> + extra <span className="text-amber-500 font-bold">1%</span> = Dream Achieved"
                 </p>
              </div>

              <div className="flex flex-col items-start gap-4">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Personal Endorsement</p>
                <div className="relative w-48 h-20 group">
                   <img 
                    src="https://qlynk.vercel.app/wiki-images/Deep_Dey_IITK_Image1.jpg" 
                    alt="Deep Dey Signature" 
                    className="w-full h-full object-contain invert grayscale brightness-200 contrast-125 opacity-30 group-hover:opacity-60 transition-opacity duration-700 mix-blend-screen"
                    referrerPolicy="no-referrer"
                   />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-900 to-transparent"></div>

      {/* Hero Header (Transition to Methodology) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-6"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Professional Core</h2>
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
          METHODOLOGY & <br /> <span className="text-amber-500">SYSTEMS.</span>
        </h1>
      </motion.div>

      {/* Methodology Dashboard */}
      <section className="grid lg:grid-cols-3 gap-8">
        {METHODOLOGY_CARDS.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="group relative p-8 md:p-10 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[3rem] hover:border-amber-500/40 transition-all duration-500 overflow-hidden"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 rounded-3xl bg-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500 border border-zinc-800">
                {card.icon}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">{card.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm md:text-base font-light">
                  {card.description}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                {card.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs md:text-sm text-zinc-400 font-mono">
                    <Zap size={14} className="text-amber-500 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Advanced System Breakdown */}
      <section className="bg-zinc-900/20 border border-zinc-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="grid md:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-amber-500">
              <Lightbulb size={20} />
              <span className="text-xs font-mono uppercase tracking-widest font-black">Strategy</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-none">
              Engineering with <br /> <span className="text-amber-500">Intention.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-light">
              My approach isn't just about building fast; it's about building right. I use system-level thinking to anticipate edge cases and modularize code for future-proof scalability.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {['Vercel SPA', 'C# Hybrid', 'Python FastAPI', 'MongoDB Atlas'].map(item => (
                <div key={item} className="px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-zinc-300 font-mono tracking-tighter group-hover:border-amber-500/30 transition-colors">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-square bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 flex items-center justify-center relative group"
          >
            <div className="absolute inset-0 bg-amber-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-center space-y-6 relative z-10">
              <Blocks size={80} className="text-amber-500 mx-auto opacity-20 group-hover:opacity-100 transition-opacity duration-1000" />
              <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Modular Pattern v4.2</h4>
              <div className="w-48 h-1 bg-zinc-900 mx-auto rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-amber-500" 
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Knowledge Base */}
      <FAQ />
    </div>
  );
}
