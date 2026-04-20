import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decorative 404 */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none select-none">
        <h1 className="text-[20rem] md:text-[30rem] font-black text-white/[0.03] leading-none tracking-tighter">
          404
        </h1>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 relative z-10"
      >
        <div className="inline-flex p-4 bg-amber-500/10 rounded-full text-amber-500 mb-4">
          <AlertTriangle size={48} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">System Route Not Found.</h2>
          <p className="text-zinc-500 max-w-md mx-auto text-lg leading-relaxed">
            The architectural blueprint you are looking for does not exist in this domain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="flex items-center space-x-3 px-8 py-4 bg-amber-500 text-black font-bold rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-colors"
            >
              <Home size={20} />
              <span>Return to Base</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/contact"
              className="flex items-center space-x-3 px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors"
            >
              <MessageSquare size={20} />
              <span>Report Issue</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Aesthetic Accents */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full"></div>
    </div>
  );
}
