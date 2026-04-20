import { motion } from 'motion/react';

const SVG_LOGOS = {
  chatgpt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 7.507c-.092-2.313-1.574-4.295-3.834-5.111-2.45-.884-5.18-.088-6.732 1.933a5.558 5.558 0 0 0-4.01-1.89c-2.373-.047-4.484 1.488-5.263 3.73-.852 2.447-.075 5.163 1.91 6.702a5.565 5.565 0 0 0-1.865 4.02c-.048 2.373 1.487 4.485 3.729 5.264 2.448.851 5.164.075 6.703-1.91a5.561 5.561 0 0 0 4.02 1.865c2.373.048 4.484-1.487 5.263-3.73.852-2.448.075-5.163-1.91-6.701a5.564 5.564 0 0 0 1.865-4.02c.048-2.373-1.487-4.484-3.729-5.263-.122-.042-.244-.082-.369-.118.113-.037.228-.073.344-.105zm-9.043-4.093l.01.01.01-.01zm.02.02l-.01.01-.01-.01z"/></svg>',
  gemini: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 0 1 1 1v2.5a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm6.364 2.636a1 1 0 0 1 0 1.414l-1.768 1.768a1 1 0 0 1-1.414-1.414l1.768-1.768a1 1 0 0 1 1.414 0zM22 12a1 1 0 0 1-1 1h-2.5a1 1 0 0 1 0-2H21a1 1 0 0 1 1 1zm-2.636 6.364a1 1 0 0 1-1.414 0l-1.768-1.768a1 1 0 0 1 1.414-1.414l1.768 1.768a1 1 0 0 1 0 1.414zM12 22a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 2 0V21a1 1 0 0 1-1 1zm-6.364-2.636a1 1 0 0 1 0-1.414l1.768-1.768a1 1 0 0 1 1.414 1.414l-1.768 1.768a1 1 0 0 1-1.414 0zM2 12a1 1 0 0 1 1-1h2.5a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm2.636-6.364a1 1 0 0 1 1.414 0l1.768 1.768a1 1 0 0 1-1.414 1.414l-1.768-1.768a1 1 0 0 1 0-1.414z"/></svg>',
  copilot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3.5 18c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zm7 0c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"/></svg>',
  vscode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-5.53-4.19c-.3-.23-.72-.18-.97.11L.17 6.187c-.23.23-.23.6 0 .83l4.33 4.33-4.33 4.33c-.23.23-.23.6 0 .83l.37.37c.25.3.67.35.97.12l5.53-4.22 9.46 8.63c.43.4 1.06.51 1.59.26l5.05-2.45c.53-.25.86-.78.86-1.37V3.957c0-.59-.33-1.12-.86-1.37zM18 19.832L8.5 11.202l9.5-8.63v17.26z"/></svg>',
  python: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.29.38-.38.31-.47.23-.53.15-.6.09-.67.03H10.5l-.6.03-.54.09-.47.15-.39.21-.31.28-.22.36-.14.43-.07.51-.02.58v4.5l.02.58.07.51.14.43.22.36.31.28.39.21.47.15.54.09.6.03h6l.6-.03.54-.09.47-.15.39-.21.31-.28.22-.36.14-.43.07-.51.02-.58v-1.5h-3.75v-1.125h5.625l.6-.03.54-.09.47-.15.39-.21.31-.28.22-.36.14-.43.07-.51.02-.58v-4.5l-.02-.58-.07-.51-.14-.43-.22-.36-.31-.28-.39-.21-.47-.15-.54-.09-.6-.03h-1.5v-1.5l.01-.13.02-.2.04-.26.1-.3.16-.33.25-.34.34-.34.45-.32.59-.3.73-.26.9-.2.98-.13h1.5l.98.13.9.2zM8.25 23.82l-.9-.2-.73-.26-.59-.3-.45-.32-.34-.34-.25-.34-.16-.33-.1-.3-.04-.26-.02-.2.01-.13V15.5l.05-.63.13-.55.21-.46.29-.38.38-.31.47-.23.53-.15.6-.09.67-.03H13.5l.6-.03.54-.09.47-.15.39-.21.31-.28.22-.36.14-.43.07-.51.02-.58v-4.5l-.02-.58-.07-.51-.14-.43-.22-.36-.31-.28-.39-.21-.47-.15-.54-.09-.6-.03h-6l-.6.03-.54.09-.47.15-.39.21-.31.28-.22.36-.14.43-.07.51-.02.58v1.5h3.75v1.125H5.625l-.6.03-.54.09-.47.15-.39.21-.31.28-.22.36-.14.43-.07.51-.02.58v4.5l.02.58.07.51.14.43.22.36.31.28.39.21.47.15.54.09.6.03h1.5v1.5l-.01.13-.02.2-.04.26-.1.3-.16.33-.25.34-.34.34-.45.32-.59.3-.73.26-.9.2-.98.13h-1.5l-.98-.13-.9-.2z"/></svg>',
  typescript: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 17.308c.612 0 1.142.037 1.587.111v2.148c-.433-.12-.968-.185-1.611-.185-.816 0-1.295.307-1.295.935 0 .426.24.704.846.945.613.24 1.458.502 2.221.741 1.074.334 1.638.936 1.638 1.94 0 1.54-1.295 2.508-3.376 2.508-1.037 0-1.926-.148-2.66-.444v-2.147c.814.407 1.83.611 2.813.611.89 0 1.258-.28 1.258-.704 0-.427-.297-.668-.908-.927-.611-.259-1.39-.537-2.148-.834-.843-.333-1.332-.87-1.332-1.74 0-1.426 1.111-2.408 3.321-2.408zM6.91 17.308h2.093v1.834H6.91V24H4.558v-4.858H2.464l-.018-1.834h4.464z"/></svg>',
  react: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><path d="M12 7c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm0-2c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0-2c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"/></svg>',
  mongodb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.193 9.555c-1.134-4.503-4.437-8.125-5.193-8.917-.756.792-4.059 4.414-5.193 8.917C5.414 15.013 8.5 19.5 12 19.5c3.5 0 6.586-4.487 5.193-9.945zM12 18.06c-2.316 0-4.42-3.045-3.418-6.938.61-2.378 2.373-4.664 3.418-5.637 1.045.973 2.808 3.259 3.418 5.637 1.002 3.893-1.102 6.938-3.418 6.938zM11.25 21.75h1.5v1.5h-1.5v-1.5z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186c-.273-1.018-1.07-1.815-2.088-2.088C19.585 3.5 12 3.5 12 3.5s-7.585 0-9.41.598c-1.018.273-1.815 1.07-2.088 2.088C0 8.011 0 12 0 12s0 3.989.502 5.814c.273 1.018 1.07 1.815 2.088 2.088 1.825.598 9.41.598 9.41.598s7.585 0 9.41-.598c1.018-.273 1.815-1.07 2.088-2.088.502-1.825.502-5.814.502-5.814s0-3.989-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.76 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  canva: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6 6z"/></svg>',
  premiere: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 0v24H0V0h24zm-14.896 16.711v-4.144h.02c.312.441.745.82 1.3 1.137.555.317 1.11.476 1.666.476.994 0 1.831-.383 2.511-1.15.68-.767 1.02-1.782 1.02-3.045 0-1.291-.326-2.327-.978-3.109-.652-.782-1.458-1.173-2.417-1.173-.555 0-1.077.125-1.564.375s-.96.673-1.417 1.269H8.72V6.666H6.104v10.045h3.0zM12.5 9.176c.414 0 .736.147.967.441.23.294.346.726.346 1.296 0 .583-.11.986-.328 1.209-.219.223-.558.334-1.018.334-.414 0-.773-.131-1.078-.393-.305-.262-.457-.654-.457-1.177 0-.583.13-.996.391-1.238.261-.242.653-.363 1.176-.372z"/></svg>',
};

const LOGO_NODES = [
  { name: 'ChatGPT', key: 'chatgpt', x: '-28%', y: '-35%', duration: 6 },
  { name: 'Gemini', key: 'gemini', x: '25%', y: '-38%', duration: 7 },
  { name: 'Github Copilot', key: 'copilot', x: '-15%', y: '-20%', duration: 5 },
  { name: 'VS Code', key: 'vscode', x: '35%', y: '10%', duration: 8 },
  { name: 'Python', key: 'python', x: '-40%', y: '5%', duration: 7.5 },
  { name: 'TypeScript', key: 'typescript', x: '15%', y: '-20%', duration: 6.5 },
  { name: 'React', key: 'react', x: '10%', y: '35%', duration: 7 },
  { name: 'MongoDB', key: 'mongodb', x: '-30%', y: '25%', duration: 5.5 },
  { name: 'YouTube', key: 'youtube', x: '42%', y: '-20%', duration: 6.2 },
  { name: 'Instagram', key: 'instagram', x: '-42%', y: '-15%', duration: 5.8 },
  { name: 'Canva', key: 'canva', x: '30%', y: '28%', duration: 6.8 },
  { name: 'Premiere', key: 'premiere', x: '-18%', y: '38%', duration: 8.2 },
];

export default function TechGalaxy() {
  const stars = Array.from({ length: 60 });

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-visible select-none">
      {/* Background Stars Layer */}
      <div className="absolute inset-0 z-0">
        {stars.map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.1,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.2, 1],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute rounded-full"
            style={{ 
              width: `${Math.random() * 2 + 1}px`, 
              height: `${Math.random() * 2 + 1}px`,
              backgroundColor: Math.random() > 0.8 ? '#f59e0b' : '#ffffff',
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Atmospheric Glows */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>

      {/* Central Core Identity */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 text-center space-y-2"
      >
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full inline-block">
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.5em]">Neural Network</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase italic">
          My Ecosystem
        </h2>
        <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)]"></div>
      </motion.div>

      {/* Floating Logo Nodes */}
      {LOGO_NODES.map((node, index) => (
        <motion.div
          key={node.name}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={{
            x: [0, Math.random() * 20 - 10, 0],
            y: [0, Math.random() * 30 - 15, 0],
          }}
          transition={{
            x: { duration: node.duration + 1, repeat: Infinity, ease: "easeInOut" },
            y: { duration: node.duration, repeat: Infinity, ease: "easeInOut" },
            delay: index * 0.1,
          }}
          className="absolute z-20 group flex flex-col items-center"
          style={{ 
            left: `calc(50% + ${node.x})`, 
            top: `calc(50% + ${node.y})` 
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Logo Sphere */}
            <div className="w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl transition-all duration-500 group-hover:border-amber-500/50 group-hover:scale-110 group-hover:shadow-amber-500/20 group-hover:-translate-y-2 p-3">
              <div 
                className="w-full h-full text-zinc-400 group-hover:text-amber-500 transition-colors"
                dangerouslySetInnerHTML={{ __html: SVG_LOGOS[node.key as keyof typeof SVG_LOGOS] }}
              />
            </div>
            
            {/* Label - Permanent for Mobile, Elegant for All */}
            <span className="text-[9px] md:text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-3 transition-colors group-hover:text-amber-500">
              {node.name}
            </span>
          </div>
        </motion.div>
      ))}
      
      {/* Interaction Ripple Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[0.5px] border-zinc-900/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-[0.5px] border-zinc-900/10 rounded-full"></div>
      </div>
    </div>
  );
}
