import { useState, FormEvent, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { GoogleLogin } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, MessageSquare, Globe, Mail, Github, Instagram, Youtube, MessageCircle, ExternalLink, MapPin, Wrench, Phone, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

interface TicketTemplate {
  key: string;
  label: string;
  targetEmail: string;
  subjectTemplate: string;
  messageTemplate: string;
}

const TICKET_TYPES: TicketTemplate[] = [
  {
    key: 'QuickLink / qlynk.me Support',
    label: 'QuickLink / qlynk.me Support',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[QuickLink Support] <Feature or Module Name>',
    messageTemplate: 'Hello Team,\n\nRequest Type: <Bug / Support / Clarification>\nFeature or Module: <Name>\nEnvironment: <Web / Mobile / Browser + OS>\nAffected URL: <https://...>\nExpected Outcome: <What should happen>\nActual Outcome: <What is happening>\nBusiness Impact: <Low / Medium / High>\n\nAdditional Context:\n<Logs, screenshots, or notes>',
  },
  {
    key: 'Platform Bug Report',
    label: 'Platform Bug Report',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[Bug Report] <Short Bug Title>',
    messageTemplate: 'Hello Team,\n\nBug Summary: <One-line summary>\nSteps to Reproduce:\n1) <Step 1>\n2) <Step 2>\n3) <Step 3>\nExpected Result: <Expected behavior>\nActual Result: <Observed behavior>\nFrequency: <Always / Sometimes / Rare>\nBrowser/OS: <Details>\n\nEvidence:\n<Error logs, screenshots, or video links>',
  },
  {
    key: 'QLYNK Node Server Issue',
    label: 'QLYNK Node Server Issue',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[Node Server Issue] <Service Name>',
    messageTemplate: 'Hello Team,\n\nService Name: <API / Worker / Job>\nIncident Time (UTC): <YYYY-MM-DD HH:mm>\nCurrent Status: <Down / Degraded / Slow>\nError Message: <Exact message>\nFailed Endpoint or Job: <Name>\nExpected SLA: <Target uptime/latency>\n\nDiagnostics Performed:\n<Restart, rollback, trace, etc.>\n\nAttachments:\n<Logs and monitoring links>',
  },
  {
    key: 'API Access Request',
    label: 'API Access Request',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[API Access] <Project or Product Name>',
    messageTemplate: 'Hello Team,\n\nOrganization / Project: <Name>\nPrimary Use Case: <What you are building>\nRequired Endpoints: <List>\nAuthentication Preference: <API key / OAuth / Other>\nEstimated Traffic: <Requests per day>\nGo-Live Timeline: <Date or window>\n\nCompliance or Security Notes:\n<Any requirements>',
  },
  {
    key: 'Security Vulnerability Report',
    label: 'Security Vulnerability Report',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[Security Report] <Vulnerability Summary>',
    messageTemplate: 'Hello Security Team,\n\nVulnerability Type: <XSS / SQLi / Auth bypass / etc.>\nAffected Asset: <URL / endpoint / module>\nSeverity Assessment: <Low / Medium / High / Critical>\nProof of Concept: <Safe reproduction steps>\nPotential Impact: <What can be affected>\nSuggested Remediation: <Optional>\n\nDisclosure Contact:\n<Name + email>',
  },
  {
    key: 'Performance Optimization Request',
    label: 'Performance Optimization Request',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[Performance Request] <Feature or Page>',
    messageTemplate: 'Hello Team,\n\nArea Needing Optimization: <Page / API / job>\nObserved Latency: <Current load or response time>\nTarget Performance: <Desired benchmark>\nPeak Traffic Window: <Time and region>\nCurrent Constraints: <Infra, code, or budget>\n\nSupporting Metrics:\n<Profiler traces, monitoring charts, or logs>',
  },
  {
    key: 'UI/UX Review Request',
    label: 'UI/UX Review Request',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[UI/UX Review] <Feature or Flow>',
    messageTemplate: 'Hello Team,\n\nProduct or Page: <Name>\nPrimary User Flow: <Signup / Checkout / etc.>\nCurrent Pain Points: <What users struggle with>\nTarget Audience: <Who this is for>\nDesign Assets: <Figma / screenshots / links>\nDesired Outcome: <Conversion, clarity, retention, etc.>\n\nAdditional Notes:\n<Context and priorities>',
  },
  {
    key: 'Software Architecture Consultation',
    label: 'Software Architecture Consultation',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Architecture Consultation] <Project or Company>',
    messageTemplate: 'Hello Team,\n\nOrganization: <Company / Startup / Individual>\nCurrent Tech Stack: <Frontend / Backend / Infra>\nArchitecture Goal: <Scale, reliability, cost, speed>\nCurrent Challenge: <Main blocker>\nTimeline: <Delivery expectation>\nScope & Budget Range: <Optional>\n\nWhat Success Looks Like:\n<Expected outcomes>',
  },
  {
    key: 'Project Collaboration',
    label: 'Project Collaboration',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Collaboration Request] <Project Title>',
    messageTemplate: 'Hello Team,\n\nProject Name: <Title>\nCollaboration Type: <Technical / Content / Growth>\nRequested Role: <What you need from us>\nProject Stage: <Idea / MVP / Production>\nTime Commitment: <Hours per week>\nDeadline or Milestone: <Date>\n\nProject Brief:\n<Summary and links>',
  },
  {
    key: 'Mentorship Request',
    label: 'Mentorship Request',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Mentorship Request] <Topic>',
    messageTemplate: 'Hello Team,\n\nMentorship Topic: <System design / career / coding>\nCurrent Skill Level: <Beginner / Intermediate / Advanced>\nGoal in 90 Days: <Specific target>\nAvailability: <Days and time zone>\nPreferred Format: <1:1 / group / async>\n\nBackground:\n<Experience and current projects>',
  },
  {
    key: 'E-Commerce Setup',
    label: 'E-Commerce Setup',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[E-Commerce Setup] <Store Name>',
    messageTemplate: 'Hello Team,\n\nBusiness Name: <Store or brand>\nProduct Catalog Size: <Approx count>\nPreferred Platform: <Shopify / WooCommerce / Custom>\nPrimary Market: <Country/region>\nPayment & Shipping Needs: <Providers and rules>\nTarget Launch Date: <Date>\n\nFunctional Requirements:\n<Features, integrations, and design notes>',
  },
  {
    key: 'Data & Analytics Integration',
    label: 'Data & Analytics Integration',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Analytics Integration] <Project Name>',
    messageTemplate: 'Hello Team,\n\nProject Name: <Name>\nTracking Requirement: <Product analytics / dashboard / BI>\nData Sources: <App DB / APIs / third-party>\nKPIs to Measure: <Retention, conversion, revenue, etc.>\nReporting Frequency: <Daily / weekly / real-time>\nTools Preference: <GA4 / Mixpanel / custom>\n\nDelivery Expectations:\n<Milestones and timeline>',
  },
  {
    key: 'Business Inquiry',
    label: 'Business Inquiry',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Business Inquiry] <Subject>',
    messageTemplate: 'Hello Team,\n\nInquiry Category: <Partnership / Vendor / Proposal>\nOrganization Name: <Name>\nPrimary Objective: <Outcome you want>\nTimeline: <Expected start/end>\nDecision Stakeholders: <Who will review>\n\nDetailed Requirement:\n<Full details>',
  },
  {
    key: 'Speaking / Workshop Invitation',
    label: 'Speaking / Workshop Invitation',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Speaking Invitation] <Event Name>',
    messageTemplate: 'Hello Team,\n\nEvent Name: <Conference / webinar / campus>\nSession Type: <Keynote / workshop / panel>\nAudience Profile: <Developers / founders / students>\nExpected Date & Duration: <Details>\nLocation or Platform: <City / online>\nCompensation / Budget: <Optional>\n\nEvent Brief:\n<Agenda and organizer details>',
  },
  {
    key: 'General Inquiry',
    label: 'General Inquiry',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[General Inquiry] <Subject>',
    messageTemplate: 'Hello,\n\nTopic: <Main subject>\nContext: <Short background>\nQuestion or Request: <What you need>\nPreferred Reply Mode: <Email / call>\n\nAdditional Notes:\n<Anything else>',
  },
  {
    key: 'Photography / Editing Work',
    label: 'Photography / Editing Work',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Photography/Editing] <Project Name>',
    messageTemplate: 'Hello,\n\nProject Type: <Shoot / edit / both>\nContent Format: <Reel / ad / documentary / etc.>\nDeliverables Needed: <Count and format>\nDeadline: <Date>\nReference Style: <Links>\n\nProject Brief:\n<Creative direction and expectations>',
  },
  {
    key: 'YouTube / Content Creation',
    label: 'YouTube / Content Creation',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[YouTube Collaboration] <Content Topic>',
    messageTemplate: 'Hello,\n\nContent Topic: <Theme>\nFormat: <Short / long-form / live>\nCollaboration Scope: <Host / guest / production>\nTarget Publish Window: <Date range>\nAudience Goal: <Awareness / education / leads>\n\nCreative Brief:\n<Outline and references>',
  },
  {
    key: 'Career / Hiring Inquiry',
    label: 'Career / Hiring Inquiry',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Career/Hiring] <Role or Opportunity>',
    messageTemplate: 'Hello,\n\nOpportunity Type: <Full-time / contract / freelance>\nRole Title: <Position>\nCompany or Team: <Name>\nProject Domain: <Industry / product>\nExpected Start Date: <Date>\nCompensation Range: <Optional>\n\nJob or Opportunity Details:\n<Description and links>',
  },
  {
    key: 'Just saying Hi!',
    label: 'Just saying Hi!',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Hi] <Your Greeting>',
    messageTemplate: 'Hello Deep,\n\nI am writing from <City/Country>.\n\nMessage:\n<Your note>',
  },
  {
    key: 'Custom Query',
    label: 'Custom Query',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Custom Query] <Subject>',
    messageTemplate: 'Hello,\n\nCustom Query Type: <Describe the category>\nObjective: <What you want to achieve>\nTimeline: <When you need this>\n\nDetailed Message:\n<Complete details>',
  },
];

type SupportType = (typeof TICKET_TYPES)[number]['key'];
const STORAGE_KEY = 'dd_comment_user';
const GOOGLE_OAUTH_CTX_STORAGE_KEY = 'dd_google_oauth_ctx';
const NON_LOGIN_SERVICE_KEY = 'NON LOGIN USER';

interface GoogleUser {
  userId?: string;
  name?: string;
  email?: string;
  credential: string;
  exp?: number;
}

interface PrivateIdentity {
  email: string | null;
  serviceKey: string | null;
}

interface ContactFormData {
  name: string;
  email: string;
  country: string;
  whatsapp: string;
  supportType: SupportType;
  customType: string;
  subject: string;
  message: string;
  companyWebsite: string;
}

function generateClientTicketId() {
  const random = `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`.toUpperCase();
  return `DD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${random}`;
}

function getDisplayNameFromEmail(email?: string | null): string {
  const normalized = String(email || '').trim();
  if (!normalized.includes('@')) return '';
  return normalized
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(window.atob(padded));
    return payload && typeof payload === 'object' ? payload : null;
  } catch (error) {
    console.warn('Unable to parse Google ID token payload:', error);
    return null;
  }
}

function buildGoogleUserFromToken(credential: string): GoogleUser {
  const payload = parseJwtPayload(credential);
  const userId = String(payload?.sub || '').trim();
  const name = String(payload?.name || payload?.given_name || '').trim();
  const email = String(payload?.email || '').trim();
  const expRaw = Number(payload?.exp || 0);
  return {
    credential,
    userId,
    name,
    email,
    exp: Number.isFinite(expRaw) && expRaw > 0 ? expRaw : undefined,
  };
}

export default function Contact() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputClassName =
    'w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all';

  const defaultType = TICKET_TYPES.find((t) => t.key === 'General Inquiry') || TICKET_TYPES[0];

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    country: '',
    whatsapp: '',
    supportType: defaultType.key as SupportType,
    customType: '',
    subject: defaultType.subjectTemplate,
    message: defaultType.messageTemplate,
    companyWebsite: '',
  });

  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [privateIdentity, setPrivateIdentity] = useState<PrivateIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [ownerAuthed, setOwnerAuthed] = useState(false);
  const [ownerAuthChecked, setOwnerAuthChecked] = useState(false);
  const [googleIntentText, setGoogleIntentText] = useState<'signin_with' | 'signup_with'>('signin_with');
  const [redirectToProfileAfterAuth, setRedirectToProfileAfterAuth] = useState(false);

  const activeType = useMemo(
    () => TICKET_TYPES.find((t) => t.key === formData.supportType) || defaultType,
    [defaultType, formData.supportType],
  );

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setOwnerAuthed(Boolean(d?.authenticated)))
      .catch(() => setOwnerAuthed(false))
      .finally(() => setOwnerAuthChecked(true));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('googleAuth')) return;

    const hashRaw = location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hashRaw);
    const idToken = String(hashParams.get('id_token') || '').trim();
    const authError = String(hashParams.get('error') || '').trim();
    const returnedState = String(hashParams.get('state') || '').trim();
    const intent = params.get('intent') === 'signup' ? 'signup' : 'login';

    setGoogleIntentText(intent === 'signup' ? 'signup_with' : 'signin_with');

    if (authError) {
      setStatusMessage(`Google auth failed: ${authError}`);
      navigate('/contact', { replace: true });
      return;
    }

    if (!idToken) {
      setStatusMessage('Google auth did not return a valid token. Please try again.');
      navigate('/contact', { replace: true });
      return;
    }

    const oauthCtxRaw = sessionStorage.getItem(GOOGLE_OAUTH_CTX_STORAGE_KEY);
    let expectedState = '';
    let expectedNonce = '';
    if (oauthCtxRaw) {
      try {
        const parsed = JSON.parse(oauthCtxRaw) as { state?: string; nonce?: string };
        expectedState = String(parsed?.state || '').trim();
        expectedNonce = String(parsed?.nonce || '').trim();
      } catch {
        expectedState = '';
        expectedNonce = '';
      }
    }
    if (!expectedState || !returnedState || expectedState !== returnedState) {
      sessionStorage.removeItem(GOOGLE_OAUTH_CTX_STORAGE_KEY);
      setStatusMessage('Google auth session validation failed. Please try login/signup again.');
      navigate('/contact', { replace: true });
      return;
    }

    const tokenPayload = parseJwtPayload(idToken);
    const tokenNonce = String(tokenPayload?.nonce || '').trim();
    if (!expectedNonce || !tokenNonce || expectedNonce !== tokenNonce) {
      sessionStorage.removeItem(GOOGLE_OAUTH_CTX_STORAGE_KEY);
      setStatusMessage('Google auth nonce validation failed. Please retry.');
      navigate('/contact', { replace: true });
      return;
    }

    const normalizedUser = buildGoogleUserFromToken(idToken);
    sessionStorage.removeItem(GOOGLE_OAUTH_CTX_STORAGE_KEY);
    setRedirectToProfileAfterAuth(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
    setCurrentUser(normalizedUser);
    setFormData((prev) => ({
      ...prev,
      name: normalizedUser.name || prev.name,
      email: normalizedUser.email || prev.email,
    }));
    navigate('/contact', { replace: true });
  }, [location.hash, location.search, navigate]);

  useEffect(() => {
    if (!ownerAuthChecked) return;
    const params = new URLSearchParams(location.search);
    const wantsSignup = params.has('signup');
    const wantsLogin = params.has('login');
    if (!wantsSignup && !wantsLogin) return;

    const redirectToGoogleAuth = async (intent: 'signup' | 'login') => {
      try {
        const response = await fetch(`/api/auth?action=google-url&intent=${intent}`);
        const payload = await response.json().catch(() => ({}));
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
          return true;
        }
      } catch {
        if (!cancelled) {
          setStatusMessage('Network issue while preparing Google auth redirect. Please try again.');
        }
      }
      return false;
    };

    let cancelled = false;
    const runIntentRouting = async () => {
      if (wantsSignup) {
        setGoogleIntentText('signup_with');
        if (!ownerAuthed) {
          setRedirectToProfileAfterAuth(true);
          const redirected = await redirectToGoogleAuth('signup');
          if (!redirected && !cancelled) {
            setStatusMessage('Unable to open Google signup redirect right now. Please continue with Google below.');
          }
        }
      } else {
        setGoogleIntentText('signin_with');
        if (!ownerAuthed) {
          setRedirectToProfileAfterAuth(true);
          const redirected = await redirectToGoogleAuth('login');
          if (!redirected && !cancelled) {
            setStatusMessage('Continue with Google below to complete login on this website.');
          }
        }
      }

      if (!cancelled) navigate('/contact', { replace: true });
    };

    runIntentRouting();
    return () => { cancelled = true; };
  }, [location.search, navigate, ownerAuthed, ownerAuthChecked]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as GoogleUser;
      if (parsed?.credential) {
        const normalizedUser: GoogleUser = {
          credential: parsed.credential,
          userId: String(parsed.userId || '').trim(),
          name: String(parsed.name || '').trim(),
          email: String(parsed.email || '').trim(),
          exp: Number(parsed.exp || 0),
        };
        setFormData((prev) => ({
          ...prev,
          name: normalizedUser.name || prev.name,
          email: normalizedUser.email || prev.email,
        }));
        setCurrentUser(normalizedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const activeCredential = String(currentUser?.credential || '').trim();
    if (!activeCredential) {
      setPrivateIdentity(null);
      setIdentityLoading(false);
      return;
    }
    let cancelled = false;
    const loadPrivateIdentity = async () => {
      setIdentityLoading(true);
      try {
        const response = await fetch('/api/journal?action=user-private', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: activeCredential, userId: currentUser?.userId }),
        });
        const payload = await response.json();
        if (!payload?.ok) {
          if (!cancelled) {
            setPrivateIdentity(null);
            setStatusMessage(payload?.message || 'Google identity sync failed. Please sign in again.');
            localStorage.removeItem(STORAGE_KEY);
            setCurrentUser(null);
          }
          return;
        }
        if (cancelled) return;
        const resolvedEmail = payload?.user?.email ? String(payload.user.email) : null;
        const backendUserName = String(payload?.user?.userName || '').trim();
        const displayName = currentUser.name || backendUserName || getDisplayNameFromEmail(resolvedEmail);
        const resolvedIdentity = {
          email: resolvedEmail,
          serviceKey: payload?.user?.serviceKey ? String(payload.user.serviceKey) : null,
        };
        setPrivateIdentity(resolvedIdentity);
        setCurrentUser((prev) => {
          const nextUser: GoogleUser = {
            credential: prev?.credential || activeCredential,
            userId: String(payload?.user?.userId || prev?.userId || ''),
            email: resolvedEmail || prev?.email || '',
            name: displayName || prev?.name || '',
            exp: prev?.exp,
          };
          if (
            prev &&
            prev.credential === nextUser.credential &&
            String(prev.userId || '') === String(nextUser.userId || '') &&
            String(prev.email || '') === String(nextUser.email || '') &&
            String(prev.name || '') === String(nextUser.name || '') &&
            Number(prev.exp || 0) === Number(nextUser.exp || 0)
          ) {
            return prev;
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
          return nextUser;
        });
        setFormData((prev) => ({
          ...prev,
          name: displayName || prev.name,
          email: resolvedEmail || currentUser.email || prev.email,
        }));
        if (redirectToProfileAfterAuth) {
          const profileUserId = String(payload?.user?.userId || currentUser.userId || '').trim();
          setRedirectToProfileAfterAuth(false);
          navigate(profileUserId ? `/user/${encodeURIComponent(profileUserId)}` : '/user', { replace: true });
        }
      } catch {
        if (!cancelled) {
          setPrivateIdentity(null);
          setStatusMessage('Unable to sync Google identity right now. You can still submit the form.');
        }
      } finally {
        if (!cancelled) setIdentityLoading(false);
      }
    };
    loadPrivateIdentity();
    return () => { cancelled = true; };
  }, [currentUser?.credential, currentUser?.userId, navigate, redirectToProfileAfterAuth]);

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    const user = buildGoogleUserFromToken(credentialResponse.credential);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleGoogleLogout = () => {
    setCurrentUser(null);
    setPrivateIdentity(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSupportTypeChange = (supportType: SupportType) => {
    const nextType = TICKET_TYPES.find((t) => t.key === supportType) || defaultType;
    setFormData((prev) => ({
      ...prev,
      supportType,
      subject: nextType.subjectTemplate,
      message: nextType.messageTemplate,
      customType: supportType === 'Custom Query' ? prev.customType : '',
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          supportType: formData.supportType === 'Custom Query' && formData.customType.trim()
            ? `Custom Query: ${formData.customType.trim()}`
            : formData.supportType,
          targetEmail: activeType.targetEmail,
          serviceKey: privateIdentity?.serviceKey || NON_LOGIN_SERVICE_KEY,
          loginEmail: privateIdentity?.email || currentUser?.email || '',
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || 'Failed to submit inquiry.');
      }

      const ticketId = payload?.autoReply?.ticketId || generateClientTicketId();
      const sla = payload?.autoReply?.sla || 'Initial response within 24-48 hours.';
      const resolvedLoginEmail = privateIdentity?.email || currentUser?.email || 'N/A';

      const formattedBody = [
        `Ticket ID: ${ticketId}`,
        `Support Type: ${formData.supportType === 'Custom Query' && formData.customType.trim() ? `Custom Query: ${formData.customType.trim()}` : formData.supportType}`,
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        `Google Login Email: ${resolvedLoginEmail}`,
        `Google Auth Status: ${currentUser ? 'Logged In' : 'Not Logged In'}`,
        `Country: ${formData.country}`,
        `WhatsApp: ${formData.whatsapp || 'N/A'}`,
        '',
        'Message:',
        formData.message,
      ].join('\n');

      const mailSubject = `[${ticketId}] ${formData.subject}`;
      const mailtoLink = `mailto:${encodeURIComponent(activeType.targetEmail)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(formattedBody)}`;
      window.location.href = mailtoLink;

      setIsSent(true);
      setStatusMessage(`Ticket ${ticketId} created. ${sla}`);
      setFormData((prev) => ({
        ...prev,
        subject: activeType.subjectTemplate,
        message: activeType.messageTemplate,
        companyWebsite: '',
      }));
      setTimeout(() => setIsSent(false), 5000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 md:py-24 space-y-20 overflow-x-hidden">
      <SEO
        title="Contact Engine | Deep Dey"
        description="Connect with Deep Dey for software architecture consultations, bug reports, and collaborations through a tracked lead pipeline."
        keywords="Contact Deep Dey, Software Architecture Support, Lead Pipeline"
        route="/contact"
      />

      <div className="text-center space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Transmission Control</h2>
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">THE CONTACT <br /> <span className="text-amber-500 italic">ENGINE.</span></h1>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-light leading-relaxed">
          Structured lead intake with priority routing, anti-spam checks, auto-reply, and response SLA.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h3 className="text-zinc-300 font-black uppercase tracking-[0.3em] text-xs">System Entry Points</h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:border-amber-500/20 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-zinc-950 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold tracking-tight text-lg">Official Support</h4>
                    <p className="text-amber-500 text-sm font-mono">a@qlynk.me</p>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed italic">"Partnerships, DMCA, and system-level inquiries."</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:border-amber-500/20 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-zinc-950 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                    <Wrench size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold tracking-tight text-lg">Developer Node</h4>
                    <p className="text-amber-500 text-sm font-mono">team.deepdey@gmail.com</p>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed italic">"Bug reports, feature requests, and technical deep-dives."</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:border-amber-500/20 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-zinc-950 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold tracking-tight text-lg">General Comm</h4>
                    <p className="text-amber-500 text-sm font-mono">thedeeparise@gmail.com</p>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed italic">"Community feedback and casual engineering talks."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-zinc-300 font-black uppercase tracking-[0.3em] text-xs">Social Grid Node</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'GitHub', path: 'https://github.com/deepdeyiitgn', icon: <Github size={14} /> },
                { name: 'Instagram', path: 'https://instagram.com/deepdey.official', icon: <Instagram size={14} /> },
                { name: 'YouTube', path: 'https://youtube.com/@deepdeyiit', icon: <Youtube size={14} /> },
                { name: 'Discord', path: 'https://discord.com/invite/t6ZKNw556n', icon: <MessageCircle size={14} /> },
                { name: 'Link Hub', path: '/links', icon: <ExternalLink size={14} /> },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.path}
                  target={social.path.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all flex items-center gap-2 text-xs font-mono"
                >
                  {social.icon}
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-3xl flex items-center gap-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-amber-500">
                <MapPin size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Base Coordinate</p>
                <p className="text-zinc-300 text-sm font-bold">Dharmanagar, Tripura, India</p>
              </div>
            </div>

            <a
              href="https://github.com/deepdeyiitgn/My-Portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-3xl flex items-center gap-4 group hover:border-amber-500/30 transition-all"
            >
              <div className="p-3 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-amber-500 transition-colors">
                <Github size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Architectural Blueprint</p>
                <p className="text-zinc-300 text-sm font-bold truncate">Portfolio Repository</p>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Identity Sync (Optional)</p>
              {ownerAuthed ? (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300">Owner session detected. Google sign-in is not required.</p>
                  <p className="text-xs text-zinc-500">You can submit tickets directly using your owner-authenticated session.</p>
                </div>
              ) : currentUser ? (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300">Signed in as <span className="text-amber-500 font-semibold">{currentUser.name || 'Google User'}</span></p>
                  <p className="text-xs text-zinc-500">Email: {privateIdentity?.email || currentUser.email || formData.email || 'N/A'}</p>
                  {identityLoading && <p className="text-xs text-zinc-500">Syncing identity...</p>}
                  <button type="button" onClick={handleGoogleLogout} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors">
                    Sign out Google
                  </button>
                </div>
              ) : (
                <div id="contact-google-entry" className="space-y-2">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setStatusMessage('Google sign-in failed. Please try again.')}
                    useOneTap={false}
                    theme="filled_black"
                    text={googleIntentText}
                    shape="pill"
                  />
                  <p className="text-xs text-zinc-600">Google sign-in auto-fills your account identity in the form.</p>
                </div>
              )}
            </div>

            <div className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true">
              <input
                id="companyWebsite"
                type="text"
                value={formData.companyWebsite}
                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supportType" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MessageSquare size={14} className="text-amber-500" />
                Ticket Type *
              </label>
              <select
                id="supportType"
                required
                value={formData.supportType}
                onChange={(e) => handleSupportTypeChange(e.target.value as SupportType)}
                className={`${inputClassName} appearance-none cursor-pointer`}
              >
                {TICKET_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
            </div>

            {formData.supportType === 'Custom Query' && (
              <div className="space-y-2">
                <label htmlFor="customType" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Custom Query Type *</label>
                <input
                  id="customType"
                  required
                  type="text"
                  value={formData.customType}
                  onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                  placeholder="Example: Sponsorship / Speaking / Custom API"
                  className={inputClassName}
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Architect Name *</label>
                <input id="name" required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Email Address *</label>
                <input id="email" required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClassName} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="country" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Globe size={14} className="text-zinc-600" />
                  Origin Country *
                </label>
                <input id="country" required type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="whatsapp" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone size={14} className="text-zinc-600" />
                  WhatsApp No
                </label>
                <input id="whatsapp" type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className={inputClassName} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Transmission Subject *</label>
              <input id="subject" required type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={inputClassName} />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Detailed Message *</label>
              <textarea id="message" required rows={7} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`${inputClassName} resize-none`} />
            </div>

            <button
              type="submit"
              disabled={isSent || isSubmitting}
              className="w-full relative group py-5 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-xl shadow-amber-500/20 disabled:opacity-80"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : isSent ? (
                  <>
                    <CheckCircle2 size={24} />
                    <span>Ticket Created</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Create Ticket & Open Mail App</span>
                  </>
                )}
              </div>
            </button>

            {statusMessage && <p className="text-xs text-zinc-400 border border-zinc-800 rounded-xl p-3">{statusMessage}</p>}
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Auto-reply + ticket ID + priority routing + anti-spam enabled.</p>
          </form>
        </motion.div>
      </div>

      <div className="pt-20 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.5em] italic">"Zero-latency architecture for high-priority transmissions."</p>
      </div>
    </div>
  );
}
