import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
const PROGRESS_UPDATE_INTERVAL_MS = 120;
const COMMENT_USER_STORAGE_KEY = 'dd_comment_user';
const GOOGLE_OAUTH_CTX_STORAGE_KEY = 'dd_google_oauth_ctx';

/**
 * AnimatedRoutes Component
 * Handles the page transitions and Suspense boundary.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const isJournalEmbedRoute = location.pathname.startsWith('/journal/embed/');
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showSessionIntro, setShowSessionIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.sessionStorage.getItem('dd_session_intro_seen');
  });
  const pendingRequestsRef = useRef(0);
  const previousPathnameRef = useRef(location.pathname);
  const processedShortcutSearchRef = useRef<string | null>(null);

  useEffect(() => {
    pendingRequestsRef.current = pendingRequests;
  }, [pendingRequests]);

  useEffect(() => {
    if (location.pathname !== '/') return;
    const params = new URLSearchParams(location.search);
    const shortcutSignature = [
      params.has('signup') ? '1' : '0',
      params.has('login') ? '1' : '0',
      params.has('logout') ? '1' : '0',
      params.get('password') || '',
    ].join('|');
    if (processedShortcutSearchRef.current === shortcutSignature) return;
    processedShortcutSearchRef.current = shortcutSignature;

    if (params.has('logout')) {
      let cancelled = false;
      const runGlobalLogout = async () => {
        try {
          await fetch('/api/auth', { method: 'DELETE' });
        } catch {
          // Ignore network failures and still clear local auth state.
        } finally {
          if (!cancelled) {
            localStorage.removeItem(COMMENT_USER_STORAGE_KEY);
            navigate('/', { replace: true });
          }
        }
      };
      runGlobalLogout();
      return () => { cancelled = true; };
    }

    if (params.has('signup') || params.has('login')) {
      const intent = params.has('signup') ? 'signup' : 'login';
      let cancelled = false;
      const runGoogleAuthShortcut = async () => {
        try {
          const response = await fetch(
            `/api/auth?action=google-url&intent=${intent}`,
          );
          const payload = await response.json().catch(() => ({}));
          if (cancelled) return;
          if (response.ok && payload?.ok && payload?.url) {
            if (payload?.state && payload?.nonce) {
              window.sessionStorage.setItem(
                GOOGLE_OAUTH_CTX_STORAGE_KEY,
                JSON.stringify({
                  state: String(payload.state),
                  nonce: String(payload.nonce),
                  intent,
                  createdAt: Date.now(),
                }),
              );
            }
            window.location.assign(String(payload.url));
            return;
          }
          navigate(`/contact?${intent}`, { replace: true });
        } catch {
          if (!cancelled) navigate(`/contact?${intent}`, { replace: true });
        }
      };
      runGoogleAuthShortcut();
      return () => { cancelled = true; };
    }

    const ownerPassword = params.get('password');
    if (!ownerPassword) return;

    let cancelled = false;
    const runOwnerAutoLogin = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: ownerPassword }),
        });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && payload?.ok) {
          // Clear community Google session state to avoid owner/contact identity overlap.
          localStorage.removeItem(COMMENT_USER_STORAGE_KEY);
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        if (!cancelled) navigate('/dashboard', { replace: true });
      }
    };
    runOwnerAutoLogin();
    return () => { cancelled = true; };
  }, [location.pathname, location.search, navigate]);

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
      w.__ddOriginalFetch = w.fetch.bind(w);

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
    const isRouteChange = previousPathnameRef.current !== location.pathname;
    previousPathnameRef.current = location.pathname;
    setIsNavigating(true);
    setLoadingProgress(0);
    const initialScrollY = window.scrollY;

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
        if (isRouteChange) {
          const userAlreadyScrolled = Math.abs(window.scrollY - initialScrollY) > 8;
          if (!userAlreadyScrolled) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          }
        }
      });
    };

    const updateProgress = () => {
      const elapsed = Date.now() - startedAt;
      const inFlight = pendingRequestsRef.current;
      const beforeMinElapsedProgress = Math.min(96, Math.floor((elapsed / MIN_LOADER_MS) * 96));
      let nextProgress = beforeMinElapsedProgress;

      if (elapsed >= MIN_LOADER_MS) {
        if (pageLoaded && inFlight === 0) {
          const settleProgress = 96 + Math.floor((elapsed - MIN_LOADER_MS) / PROGRESS_UPDATE_INTERVAL_MS);
          nextProgress = Math.min(99, settleProgress);
        } else {
          nextProgress = 96;
        }
      }

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
    }, PROGRESS_UPDATE_INTERVAL_MS);

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
    {!isJournalEmbedRoute && <StatusWidget />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}
