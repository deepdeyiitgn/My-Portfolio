import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, BookOpen, Loader2, ZoomIn, ZoomOut } from 'lucide-react';

// pdfjs worker setup for local asset loading
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PRIMARY_PDF_URL = '/assets/docs/Deep_Dey_Portfolio.pdf';
const FALLBACK_PDF_URL = 'https://qlynk.vercel.app/v2/Deep_Dey_Portfolio.pdf/';

const pageTransitionVariants: Variants = {
  enter: {
    rotateY: 90,
    opacity: 0,
  },
  center: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    transition: { duration: 0.3 }
  },
};

export default function Portfolio() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [direction, setDirection] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(PRIMARY_PDF_URL);
  const [isError, setIsError] = useState(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsError(false);
  }

  function onDocumentLoadError() {
    if (pdfUrl === PRIMARY_PDF_URL) {
      setPdfUrl(FALLBACK_PDF_URL);
    } else {
      setIsError(true);
    }
  }

  const changePage = (offset: number) => {
    if (!numPages) return;
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setDirection(offset);
      setPageNumber(newPage);
    }
  };

  const adjustScale = (delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 flex flex-col items-center space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Visual Narrative</h2>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Architecture Flipbook</h1>
        <div className="flex items-center justify-center gap-3 text-zinc-500 italic">
          <BookOpen size={18} />
          <p>Iterative learning through a physical-motion digital interface.</p>
        </div>
      </motion.div>

      {/* Reader Frame */}
      <div className="relative group w-full flex flex-col items-center">
        <div className="absolute -inset-10 bg-amber-500/5 blur-[120px] rounded-full -z-10"></div>
        
        {/* Navigation Buttons - Floating */}
        <div className="absolute inset-y-0 -left-4 md:-left-12 flex items-center z-20">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl text-zinc-400 hover:text-amber-500 disabled:opacity-0 transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            <ChevronLeft size={28} />
          </button>
        </div>

        <div className="absolute inset-y-0 -right-4 md:-right-12 flex items-center z-20">
          <button
            onClick={() => changePage(1)}
            disabled={!!numPages && pageNumber >= numPages}
            className="p-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl text-zinc-400 hover:text-amber-500 disabled:opacity-0 transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="bg-zinc-950 ring-1 ring-zinc-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px] w-full max-w-3xl border border-zinc-900">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
          
          <div className="flex-grow flex items-center justify-center p-8 overflow-hidden" style={{ perspective: '1200px' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center gap-4 text-zinc-600">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-[10px] tracking-widest font-mono">Initializing Neural Feed...</span>
                </div>
              }
              error={
                <div className="text-zinc-500 text-center italic p-12 max-w-sm">
                  The identity blueprint could not be loaded. Please ensure the assets are properly synchronized.
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageNumber}
                  variants={pageTransitionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ transformOrigin: "left center" }}
                  className="shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white aspect-[1/1.414]"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    width={Math.min(window.innerWidth - 64, 550)}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className="max-w-full h-auto"
                  />
                </motion.div>
              </AnimatePresence>
            </Document>
          </div>

          <div className="p-4 border-t border-zinc-900 w-full flex flex-col md:flex-row items-center justify-center gap-4 bg-zinc-950">
             <div className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-zinc-600">
              PAGE <span className="text-amber-500 font-bold">{pageNumber}</span> OF <span className="text-zinc-400">{numPages || '??'}</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-1 rounded-2xl">
              <button 
                onClick={() => adjustScale(-0.1)}
                disabled={scale <= 0.5}
                className="p-2 text-zinc-500 hover:text-amber-500 disabled:opacity-30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <div className="text-[10px] font-mono text-zinc-500 w-12 text-center">
                {Math.round(scale * 100)}%
              </div>
              <button 
                onClick={() => adjustScale(0.1)}
                disabled={scale >= 2.5}
                className="p-2 text-zinc-500 hover:text-amber-500 disabled:opacity-30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col items-center space-y-8">
        <a
          href={pdfUrl}
          download="Deep_Dey_Portfolio.pdf"
          className="group relative px-12 py-6 bg-amber-500 text-black font-black text-xl rounded-3xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/20"
        >
          <div className="absolute -inset-1 bg-amber-400 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
          <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
          <span>DOWNLOAD PORTFOLIO (PDF)</span>
        </a>
        
        <p className="text-[10px] text-zinc-700 uppercase tracking-[0.6em] font-mono">
          System Interface v4.5 // Persistent Identity Feed
        </p>
      </div>

      <style>{`
        /* 3D Perspective Base */
      `}</style>
    </div>
  );
}
