import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/Layout';
import StatusWidget from './components/StatusWidget';
import LoadingScreen from './components/LoadingScreen';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const About = lazy(() => import('./pages/About'));
const Me = lazy(() => import('./pages/Me'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Links = lazy(() => import('./pages/Links'));
const Proof = lazy(() => import('./pages/Proof'));
const Journal = lazy(() => import('./pages/Journal'));
const JournalView = lazy(() => import('./pages/JournalView'));
const JournalEmbed = lazy(() => import('./pages/JournalEmbed'));
const Now = lazy(() => import('./pages/Now'));
const LegalHub = lazy(() => import('./pages/LegalHub'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Copyright = lazy(() => import('./pages/Copyright'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Live = lazy(() => import('./pages/Live'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * AnimatedRoutes Component
 * Handles the page transitions and Suspense boundary.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Instant trigger on route change
    setIsNavigating(true);
    
    // Smooth transition delay to ensure Loader is seen and page content is hidden
    const timer = setTimeout(() => {
      setIsNavigating(false);
      window.scrollTo(0, 0);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200]"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: isNavigating ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<LoadingScreen />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/me" element={<Me />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/links" element={<Links />} />
            <Route path="/proof" element={<Proof />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/view/:id" element={<JournalView />} />
            <Route path="/journal/embed/:id" element={<JournalEmbed />} />
            <Route path="/now" element={<Now />} />
            <Route path="/legal" element={<LegalHub />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/copyright" element={<Copyright />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live" element={<Live />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
        <StatusWidget />
      </Layout>
    </BrowserRouter>
  );
}
