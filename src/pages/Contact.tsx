import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, MessageSquare, Globe, Phone, Mail, Instagram, Twitter } from 'lucide-react';
import SEO from '../components/SEO';

const SUPPORT_EMAIL_MAPPING = {
  // a@qlynk.me
  'QuickLink / qlynk.me Support': 'a@qlynk.me',
  'Platform Bug Report': 'a@qlynk.me',
  'QLYNK Node Server Issue': 'a@qlynk.me',
  'API Access Request': 'a@qlynk.me',
  // team.deepdey@gmail.com
  'Software Architecture Consultation': 'team.deepdey@gmail.com',
  'Project Collaboration': 'team.deepdey@gmail.com',
  'Mentorship Request': 'team.deepdey@gmail.com',
  'E-Commerce Setup': 'team.deepdey@gmail.com',
  'Business Inquiry': 'team.deepdey@gmail.com',
  // thedeeparise@gmail.com
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
  phone: string;
  whatsapp: string;
  supportType: SupportType;
  subject: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    country: '',
    phone: '',
    whatsapp: '',
    supportType: 'General Inquiry',
    subject: '',
    message: '',
  });

  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const targetEmail = SUPPORT_EMAIL_MAPPING[formData.supportType];

    const body = `INQUIRY DETAILS:
Name: ${formData.name}
Country: ${formData.country}
Phone: ${formData.phone || 'Not Provided'}
WhatsApp: ${formData.whatsapp || 'Not Provided'}
Support Type: ${formData.supportType}

MESSAGE:
${formData.message}`;

    const encodedSubject = encodeURIComponent(`[${formData.supportType}] ${formData.subject}`);
    const encodedBody = encodeURIComponent(body.trim());

    // Trigger Native Mail App
    window.location.href = `mailto:${targetEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 py-12 space-y-16"
    >
      <SEO 
        title="Get in Touch | Deep Dey"
        description="Contact Deep Dey for software architecture consultation, project collaborations, or general inquiries. Available for high-end technical discussions."
        keywords="Contact Deep Dey, Hire Software Architect, Business Inquiry Tripura, Collaboration"
        route="/contact"
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Deep Dey",
          "description": "Intake form for software architecture and project inquiries."
        }}
      />
      <div className="text-center space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs">Architectural Intake</h2>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Contact Engine</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Automated routing based on inquiry classification. Choose your support type for instant prioritization.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-12">
        {/* Contact Form Section */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 p-8 md:p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Support Type Selection */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2">
                <MessageSquare size={16} className="text-amber-500" />
                Select Inquiry Classification *
              </label>
              <select
                required
                value={formData.supportType}
                onChange={(e) => setFormData({ ...formData, supportType: e.target.value as SupportType })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
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

            <div className="space-y-3">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Architect Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Email Address *</label>
              <input
                required
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Globe size={14} className="text-zinc-600" />
                Origin Country *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Phone size={14} className="text-zinc-600" />
                WhatsApp No
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765..."
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Transmission Subject *</label>
              <input
                required
                type="text"
                placeholder="Requesting Architectural Deployment Analysis"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Detailed Message *</label>
              <textarea
                required
                rows={6}
                placeholder="Synchronize your vision with our system architecture..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
              />
            </div>

            <div className="md:col-span-2 pt-6 flex justify-center">
              <button
                type="submit"
                className="group relative px-12 py-5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-amber-500/20"
              >
                {isSent ? (
                  <>
                    <CheckCircle2 size={24} />
                    <span>Inquiry Synchronized</span>
                  </>
                ) : (
                  <>
                    <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    <span>Deploy via Email Client</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info & Social Section */}
        <div className="space-y-8">
          <div className="p-8 bg-zinc-900/60 border border-zinc-800 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight">System Node Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-400">
                <Mail size={18} className="text-amber-500" />
                <span className="text-sm">Response Time: 24-48h</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <Globe size={18} className="text-amber-500" />
                <span className="text-sm">Location: Tripura, India</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-zinc-900/60 border border-zinc-800 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Direct Access Nodes</h3>
            <div className="grid grid-cols-1 gap-4">
              <a 
                href="https://x.com/depdeyofficial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-amber-500/40 transition-all group"
              >
                <div className="flex items-center gap-3 text-zinc-400 group-hover:text-amber-500 transition-colors">
                  <Twitter size={18} />
                  <span className="text-sm font-medium">Twitter / X</span>
                </div>
                <Send size={14} className="text-zinc-700 group-hover:text-amber-500 transition-colors" />
              </a>
              <a 
                href="https://instagram.com/deepdey.official" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-amber-500/40 transition-all group"
              >
                <div className="flex items-center gap-3 text-zinc-400 group-hover:text-amber-500 transition-colors">
                  <Instagram size={18} />
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <Send size={14} className="text-zinc-700 group-hover:text-amber-500 transition-colors" />
              </a>
            </div>
          </div>

          <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem]">
            <p className="text-xs leading-relaxed text-zinc-500 italic">
              "Note: All architecture consultation requests are currently processed with high-priority. General inquiries might experience slight latency due to JEE 2027 preparation phases."
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
