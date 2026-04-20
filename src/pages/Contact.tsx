import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, MessageSquare, Globe, Mail, Github, Instagram, Youtube, MessageCircle, ExternalLink, MapPin, Wrench, Phone } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-20 overflow-hidden">
      <SEO 
        title="Contact Engine | Deep Dey"
        description="Connect with Deep Dey for software architecture consultations, bug reports, and academic collaborations. High-fidelity intake system."
        keywords="Contact Deep Dey, a@qlynk.me, Deep Dey Email, Software Architecture Support"
        route="/contact"
      />

      <div className="text-center space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black">Transmission Control</h2>
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">THE CONTACT <br /> <span className="text-amber-500 italic">ENGINE.</span></h1>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-light leading-relaxed">
          Synchronize your vision with our architectural nodes. All transmissions are routed through dedicated priority lanes.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: System Nodes */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h3 className="text-zinc-300 font-black uppercase tracking-[0.3em] text-xs">System Entry Points</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Card 1 */}
              <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:border-amber-500/20 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-zinc-950 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold tracking-tight text-lg">Official Support</h4>
                    <p className="text-amber-500 text-sm font-mono">a@qlynk.me</p>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed italic">"Partnerships, DMCA, and System-Level Inquiries."</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:border-amber-500/20 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-zinc-950 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                    <Wrench size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold tracking-tight text-lg">Developer Node</h4>
                    <p className="text-amber-500 text-sm font-mono">team.deepdey@gmail.com</p>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed italic">"Bug reports, Feature requests, and Technical deep-dives."</p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
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
                   target={social.path.startsWith('http') ? "_blank" : "_self"}
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all flex items-center gap-2 text-xs font-mono"
                 >
                   {social.icon}
                   {social.name}
                 </a>
               ))}
             </div>
          </div>
          
          {/* Meta Info: Address & Repo */}
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

        {/* Right Column: Restored Form & Logic */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MessageSquare size={14} className="text-amber-500" />
                Inquiry Classification *
              </label>
              <select
                required
                value={formData.supportType}
                onChange={(e) => setFormData({ ...formData, supportType: e.target.value as SupportType })}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none cursor-pointer"
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
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Architect Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Globe size={14} className="text-zinc-600" />
                  Origin Country *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone size={14} className="text-zinc-600" />
                  WhatsApp No
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765..."
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Transmission Subject *</label>
              <input
                required
                type="text"
                placeholder="Requesting Architectural Deployment Analysis"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">Detailed Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Synchronize your vision with our system architecture..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSent}
              className="w-full relative group py-5 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-xl shadow-amber-500/20"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isSent ? (
                  <>
                    <CheckCircle2 size={24} />
                    <span>Inquiry Synchronized</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Deploy via Email Client</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>
          </form>
        </motion.div>
      </div>

      <div className="pt-20 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.5em] italic">
          "Zero-latency architecture for high-priority transmissions."
        </p>
      </div>
    </div>
  );
}
