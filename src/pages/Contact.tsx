import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, MessageSquare, Globe, Mail, Github, Instagram, Youtube, MessageCircle, ExternalLink, MapPin, Wrench, Phone, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const SUPPORT_EMAIL_MAPPING = {
  'QuickLink / qlynk.me Support': 'a@qlynk.me',
  'Platform Bug Report': 'a@qlynk.me',
  'QLYNK Node Server Issue': 'a@qlynk.me',
  'API Access Request': 'a@qlynk.me',
  'Software Architecture Consultation': 'team.deepdey@gmail.com',
  'Project Collaboration': 'team.deepdey@gmail.com',
  'Mentorship Request': 'team.deepdey@gmail.com',
  'E-Commerce Setup': 'team.deepdey@gmail.com',
  'Business Inquiry': 'team.deepdey@gmail.com',
  'General Inquiry': 'thedeeparise@gmail.com',
  'Photography / Editing Work': 'thedeeparise@gmail.com',
  'YouTube / Content Creation': 'thedeeparise@gmail.com',
  'Just saying Hi!': 'thedeeparise@gmail.com',
};

type SupportType = keyof typeof SUPPORT_EMAIL_MAPPING;

interface ContactFormData {
  name: string;
  email: string;
  country: string;
  whatsapp: string;
  supportType: SupportType;
  subject: string;
  message: string;
  companyWebsite: string;
}

export default function Contact() {
  const inputClassName =
    'w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all';

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    country: '',
    whatsapp: '',
    supportType: 'General Inquiry',
    subject: '',
    message: '',
    companyWebsite: '',
  });

  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

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
          targetEmail: SUPPORT_EMAIL_MAPPING[formData.supportType],
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || 'Failed to submit inquiry.');
      }

      setIsSent(true);
      setStatusMessage(
        `Ticket ${payload.autoReply.ticketId} created. ${payload.autoReply.sla}`,
      );
      setFormData((prev) => ({ ...prev, subject: '', message: '', companyWebsite: '' }));
      setTimeout(() => setIsSent(false), 5000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-20 overflow-hidden">
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
            <div className="hidden">
              <label htmlFor="companyWebsite">Leave this field empty</label>
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
                Inquiry Classification *
              </label>
                <select
                  id="supportType"
                  required
                  value={formData.supportType}
                  onChange={(e) => setFormData({ ...formData, supportType: e.target.value as SupportType })}
                  className={`${inputClassName} appearance-none cursor-pointer`}
                >
                <optgroup label="Platform & Technical">
                  <option value="QuickLink / qlynk.me Support">QuickLink / qlynk.me Support</option>
                  <option value="Platform Bug Report">Platform Bug Report</option>
                  <option value="QLYNK Node Server Issue">QLYNK Node Server Issue</option>
                  <option value="API Access Request">API Access Request</option>
                </optgroup>
                <optgroup label="Architecture & Business">
                  <option value="Software Architecture Consultation">Software Architecture Consultation</option>
                  <option value="Project Collaboration">Project Collaboration</option>
                  <option value="Mentorship Request">Mentorship Request</option>
                  <option value="E-Commerce Setup">E-Commerce Setup</option>
                  <option value="Business Inquiry">Business Inquiry</option>
                </optgroup>
                <optgroup label="Creative & Social">
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Photography / Editing Work">Photography / Editing Work</option>
                  <option value="YouTube / Content Creation">YouTube / Content Creation</option>
                  <option value="Just saying Hi!">Just saying Hi!</option>
                </optgroup>
              </select>
            </div>

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
              <textarea id="message" required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`${inputClassName} resize-none`} />
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
                    <span>Inquiry Synchronized</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Submit Inquiry</span>
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
