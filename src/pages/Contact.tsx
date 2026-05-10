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
    subjectTemplate: '[QuickLink Support] [Fill product/feature name]',
    messageTemplate: 'Hello Team,\n\nIssue Type: [Fill bug/support/query]\nPlatform URL: [Fill URL]\nExpected Result: [Fill expected behavior]\nActual Result: [Fill current behavior]\nPriority: [Fill Low/Medium/High]\n\nAdditional Details:\n[Fill details here]',
  },
  {
    key: 'Platform Bug Report',
    label: 'Platform Bug Report',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[Bug Report] [Fill bug title]',
    messageTemplate: 'Hello Team,\n\nBug Title: [Fill bug title]\nSteps to Reproduce: [Fill steps]\nExpected Result: [Fill expected result]\nActual Result: [Fill actual result]\nAffected Browser/OS: [Fill browser and OS]\n\nAdditional Logs:\n[Fill logs/screenshots details]',
  },
  {
    key: 'QLYNK Node Server Issue',
    label: 'QLYNK Node Server Issue',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[Node Server Issue] [Fill service name]',
    messageTemplate: 'Hello Team,\n\nNode/Service: [Fill node/service]\nError Time: [Fill time]\nError Message: [Fill exact error]\nExpected Uptime: [Fill expectation]\nCurrent Status: [Fill status]\n\nDiagnostics:\n[Fill diagnostics details]',
  },
  {
    key: 'API Access Request',
    label: 'API Access Request',
    targetEmail: 'a@qlynk.me',
    subjectTemplate: '[API Access] [Fill project/app name]',
    messageTemplate: 'Hello Team,\n\nProject Name: [Fill project]\nUse Case: [Fill use case]\nRequested Endpoints: [Fill endpoints]\nTraffic Estimate: [Fill estimate]\nTimeline: [Fill timeline]\n\nAdditional Information:\n[Fill details here]',
  },
  {
    key: 'Software Architecture Consultation',
    label: 'Software Architecture Consultation',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Architecture Consultation] [Fill project/company]',
    messageTemplate: 'Hello Team,\n\nProject/Company: [Fill name]\nCurrent Stack: [Fill stack]\nPrimary Challenge: [Fill challenge]\nTimeline: [Fill timeline]\nBudget/Scope: [Fill scope]\n\nConsultation Goals:\n[Fill goals here]',
  },
  {
    key: 'Project Collaboration',
    label: 'Project Collaboration',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Collaboration Request] [Fill project title]',
    messageTemplate: 'Hello Team,\n\nProject Title: [Fill title]\nCollaboration Type: [Fill type]\nYour Role Expectation: [Fill role]\nProject Stage: [Fill stage]\nDeadline: [Fill deadline]\n\nProject Brief:\n[Fill brief here]',
  },
  {
    key: 'Mentorship Request',
    label: 'Mentorship Request',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Mentorship Request] [Fill topic]',
    messageTemplate: 'Hello Team,\n\nMentorship Topic: [Fill topic]\nCurrent Level: [Fill level]\nGoal: [Fill goal]\nAvailability: [Fill availability]\nPreferred Format: [Fill online/offline]\n\nExtra Context:\n[Fill details here]',
  },
  {
    key: 'E-Commerce Setup',
    label: 'E-Commerce Setup',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[E-Commerce Setup] [Fill store name]',
    messageTemplate: 'Hello Team,\n\nStore Name: [Fill name]\nProducts Count: [Fill count]\nPlatform Preference: [Fill preference]\nPayments/Shipping Region: [Fill region]\nLaunch Date: [Fill date]\n\nRequirements:\n[Fill requirements here]',
  },
  {
    key: 'Business Inquiry',
    label: 'Business Inquiry',
    targetEmail: 'team.deepdey@gmail.com',
    subjectTemplate: '[Business Inquiry] [Fill subject]',
    messageTemplate: 'Hello Team,\n\nInquiry Type: [Fill type]\nOrganization: [Fill organization]\nObjective: [Fill objective]\nTimeline: [Fill timeline]\n\nDetailed Message:\n[Fill message here]',
  },
  {
    key: 'General Inquiry',
    label: 'General Inquiry',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[General Inquiry] [Fill subject]',
    messageTemplate: 'Hello,\n\nInquiry Subject: [Fill subject]\nContext: [Fill context]\nQuestion: [Fill question]\n\nAdditional Notes:\n[Fill notes here]',
  },
  {
    key: 'Photography / Editing Work',
    label: 'Photography / Editing Work',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Photography/Editing] [Fill project name]',
    messageTemplate: 'Hello,\n\nProject Type: [Fill type]\nShoot/Edit Requirement: [Fill requirement]\nDelivery Deadline: [Fill deadline]\nReference Style: [Fill style]\n\nProject Details:\n[Fill details here]',
  },
  {
    key: 'YouTube / Content Creation',
    label: 'YouTube / Content Creation',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[YouTube Collaboration] [Fill content topic]',
    messageTemplate: 'Hello,\n\nContent Topic: [Fill topic]\nFormat: [Fill short/long/live]\nCollaboration Type: [Fill type]\nExpected Publish Window: [Fill timeline]\n\nCreative Brief:\n[Fill brief here]',
  },
  {
    key: 'Just saying Hi!',
    label: 'Just saying Hi!',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Hi] [Fill your greeting]',
    messageTemplate: 'Hello Deep,\n\nI wanted to say hi from [Fill your location].\n\nMessage:\n[Fill your message here]',
  },
  {
    key: 'Custom Query',
    label: 'Custom Query',
    targetEmail: 'thedeeparise@gmail.com',
    subjectTemplate: '[Custom Query] [Fill your subject]',
    messageTemplate: 'Hello,\n\nQuery Type: [Fill custom query type]\nObjective: [Fill objective]\nDetails:\n[Fill your full message here]',
  },
];

type SupportType = (typeof TICKET_TYPES)[number]['key'];
const STORAGE_KEY = 'dd_comment_user';
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
    if (!ownerAuthChecked) return;
    const params = new URLSearchParams(location.search);
    const wantsSignup = params.has('signup');
    const wantsLogin = params.has('login');
    if (!wantsSignup && !wantsLogin) return;

    if (wantsSignup) {
      setGoogleIntentText('signup_with');
      if (!ownerAuthed) {
        const popup = window.open('https://accounts.google.com/signup', 'google-signup', 'width=600,height=700');
        if (!popup) {
          setStatusMessage('Popup blocked. Open https://accounts.google.com/signup and then continue with Google below.');
        } else {
          setStatusMessage('Google signup page opened. After creating account, continue with Google below.');
        }
      }
    } else {
      setGoogleIntentText('signin_with');
      if (!ownerAuthed) {
        setStatusMessage('Continue with Google below to complete login on this website.');
      }
    }

    navigate('/contact', { replace: true });
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
    if (!currentUser?.credential) {
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
          body: JSON.stringify({ credential: currentUser.credential, userId: currentUser.userId }),
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
        setCurrentUser((prev) => ({
          credential: prev?.credential || currentUser.credential,
          userId: String(payload?.user?.userId || prev?.userId || ''),
          email: resolvedEmail || prev?.email || '',
          name: displayName || prev?.name || '',
        }));
        setFormData((prev) => ({
          ...prev,
          name: displayName || prev.name,
          email: resolvedEmail || currentUser.email || prev.email,
        }));
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
  }, [currentUser]);

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    const user: GoogleUser = {
      credential: credentialResponse.credential,
    };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
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
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-12 md:py-24 space-y-20 overflow-hidden">
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
