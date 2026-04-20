import { motion } from 'motion/react';
import { LucideIcon, Code, Server, Globe, Cpu, Layout } from 'lucide-react';

interface ProjectPlaceholderProps {
  iconType?: 'code' | 'server' | 'globe' | 'cpu' | 'layout';
  title?: string;
}

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  server: Server,
  globe: Globe,
  cpu: Cpu,
  layout: Layout,
};

export default function ProjectPlaceholder({ iconType = 'code', title }: ProjectPlaceholderProps) {
  const Icon = iconMap[iconType] || Code;

  return (
    <div className="relative w-full h-full bg-zinc-900 overflow-hidden flex items-center justify-center group">
      {/* Blueprint Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '20px 20px' 
        }}
      ></div>

      {/* Decorative Radial Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -z-10 group-hover:bg-amber-500/10 transition-colors duration-700"></div>

      {/* Abstract Code Blocks Decoration */}
      <div className="absolute top-6 left-6 space-y-1 opacity-20">
        <div className="flex gap-1">
          <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
          <div className="w-4 h-1 bg-zinc-700 rounded-full"></div>
        </div>
        <div className="flex gap-1 pl-2">
          <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
          <div className="w-6 h-1 bg-amber-500/50 rounded-full"></div>
        </div>
        <div className="flex gap-1">
          <div className="w-4 h-1 bg-zinc-700 rounded-full"></div>
          <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 opacity-10 font-mono text-[8px] text-amber-500 tracking-widest uppercase">
        System_Blueprint_v4.0
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center space-y-4"
      >
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden group-hover:border-amber-500/30 transition-colors duration-500">
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Icon size={48} className="text-amber-500/80" />
        </div>
        {title && (
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">{title}</p>
        )}
      </motion.div>

      {/* Frame Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
    </div>
  );
}
