import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useEffect, Suspense, lazy, useRef } from 'react';
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
const SearchResults = lazy(() => import('./pages/SearchResults')); // <-- NAYA
const Status = lazy(() => import('./pages/Status'));
const CommentPermalink = lazy(() => import('./pages/CommentPermalink'));
const CommentGuide = lazy(() => import('./pages/CommentGuide'));
const JournalAllComments = lazy(() => import('./pages/JournalAllComments'));
const AllUsers = lazy(() => import('./pages/AllUsers'));
const Feedback = lazy(() => import('./pages/Feedback'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MIN_LOADER_MS = 3000;

/**
 * AnimatedRoutes Component
 * Handles the page transitions and Suspense boundary.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showSessionIntro, setShowSessionIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.sessionStorage.getItem('dd_session_intro_seen');
  });
  const pendingRequestsRef = useRef(0);

  useEffect(() => {
    pendingRequestsRef.current = pendingRequests;
  }, [pendingRequests]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & {
      __ddFetchTrackerInstalled?: boolean;
      __ddPendingFetches?: number;
      __ddOriginalFetch?: typeof fetch;
    };

    if (!w.__ddFetchTrackerInstalled) {
      w.__ddFetchTrackerInstalled = true;
      w.__ddPendingFetches = 0;
      w.__ddOriginalFetch = window.fetch.bind(window);

      window.fetch = async (...args) => {
        w.__ddPendingFetches = (w.__ddPendingFetches || 0) + 1;
        window.dispatchEvent(new Event('dd:fetch-pending-change'));
        try {
          return await (w.__ddOriginalFetch as typeof fetch)(...args);
        } finally {
          w.__ddPendingFetches = Math.max(0, (w.__ddPendingFetches || 0) - 1);
          window.dispatchEvent(new Event('dd:fetch-pending-change'));
        }
      };
    }

    const syncPending = () => {
      setPendingRequests(Math.max(0, w.__ddPendingFetches || 0));
    };
    syncPending();
    window.addEventListener('dd:fetch-pending-change', syncPending);
    return () => {
      window.removeEventListener('dd:fetch-pending-change', syncPending);
    };
  }, []);

  useEffect(() => {
    setIsNavigating(true);
    setLoadingProgress(0);

    let cancelled = false;
    let raf = 0;
    let progressInterval = 0;
    let loadListenerAdded = false;
    let pageLoaded = document.readyState === 'complete';
    const startedAt = Date.now();

    const completeNavigation = () => {
      raf = window.requestAnimationFrame(() => {
        if (cancelled) return;
        setLoadingProgress(100);
        setIsNavigating(false);
        window.scrollTo(0, 0);
      });
    };

    const updateProgress = () => {
      const elapsed = Date.now() - startedAt;
      const timeProgress = Math.min(80, Math.floor((elapsed / MIN_LOADER_MS) * 80));

      let networkProgress = timeProgress;
      if (pageLoaded) {
        const inFlight = pendingRequestsRef.current;
        networkProgress = inFlight > 0 ? Math.max(86, 98 - Math.min(inFlight, 10) * 2) : 99;
      }

      const nextProgress = Math.max(timeProgress, networkProgress);
      setLoadingProgress((prev) => {
        if (prev >= 99) return prev;
        return Math.min(99, Math.max(prev, nextProgress));
      });
    };

    const tryFinish = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      const ready = pageLoaded && pendingRequestsRef.current === 0 && elapsed >= MIN_LOADER_MS;
      if (ready) {
        completeNavigation();
      }
    };

    const onPageLoad = () => {
      pageLoaded = true;
      tryFinish();
    };

    if (!pageLoaded) {
      window.addEventListener('load', onPageLoad, { once: true });
      loadListenerAdded = true;
    }

    progressInterval = window.setInterval(() => {
      updateProgress();
      tryFinish();
    }, 120);

    updateProgress();
    tryFinish();

    return () => {
      cancelled = true;
      if (raf) window.cancelAnimationFrame(raf);
      if (progressInterval) window.clearInterval(progressInterval);
      if (loadListenerAdded) {
        window.removeEventListener('load', onPageLoad);
      }
    };
  }, [location.pathname]);

  const handleIntroComplete = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('dd_session_intro_seen', '1');
    }
    setShowSessionIntro(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSessionIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[300]"
          >
            <LoadingScreen mode="intro" onIntroComplete={handleIntroComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showSessionIntro && isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200]"
          >
            <LoadingScreen progress={loadingProgress} />
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
          <Suspense fallback={<LoadingScreen mode="normal" progress={loadingProgress} />}>
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
            <Route path="/search" element={<SearchResults />} /> {/* <-- NAYA ROUTE */}
            <Route path="/status" element={<Status />} />
            <Route path="/journal/comment" element={<CommentGuide />} />
            <Route path="/journal/comment/:commentId" element={<CommentPermalink />} />
            <Route path="/journal/view/:id/comments" element={<JournalAllComments />} />
            <Route path="/journal/view/:id/comment/:commentId" element={<CommentPermalink />} />
            <Route path="/user" element={<AllUsers />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/user/:userId" element={<UserProfile />} />
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
