import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2 } from 'lucide-react';

type SupportType = 'General Inquiry' | 'Platform / qlynk.me Support' | 'Mentorship / E-Commerce';

interface FormData {
  name: string;
  email: string;
  country: string;
  phone?: string;
  whatsapp?: string;
  supportType: SupportType;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
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

    let targetEmail = 'thedeeparise@gmail.com';
    if (formData.supportType === 'Platform / qlynk.me Support') {
      targetEmail = 'a@qlynk.me';
    }

    const body = `
New Message from Portfolio:
---------------------------
Name: ${formData.name}
Email: ${formData.email}
Country: ${formData.country}
Phone: ${formData.phone || 'N/A'}
WhatsApp: ${formData.whatsapp || 'N/A'}
Support Type: ${formData.supportType}

Message:
${formData.message}
    `;

    const encodedSubject = encodeURIComponent(`[${formData.supportType}] ${formData.subject}`);
    const encodedBody = encodeURIComponent(body.trim());

    // Generate mailto link
    const mailtoLink = `mailto:${targetEmail}?subject=${encodedSubject}&body=${encodedBody}`;

    // Open native app
    window.location.href = mailtoLink;
    
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto p-1 bg-gradient-to-br from-amber-500/20 to-transparent rounded-[2.5rem]">
      <div className="bg-zinc-950 p-8 md:p-12 rounded-[2.4rem] space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">Get in touch</h2>
          <p className="text-zinc-500 tracking-wide">Select your primary concern and I'll route the message correctly.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Support Type */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">How can I help?</label>
            <select
              required
              value={formData.supportType}
              onChange={(e) => setFormData({ ...formData, supportType: e.target.value as SupportType })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Platform / qlynk.me Support">Platform / qlynk.me Support</option>
              <option value="Mentorship / E-Commerce">Mentorship / E-Commerce</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">Full Name</label>
            <input
              required
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">Email Address</label>
            <input
              required
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">Country</label>
            <input
              required
              type="text"
              placeholder="India"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">Phone No (Optional)</label>
            <input
              type="tel"
              placeholder="+91 ..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">Subject</label>
            <input
              required
              type="text"
              placeholder="System Architecture Inquiry"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">Message</label>
            <textarea
              required
              rows={5}
              placeholder="Tell me about your vision..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-12 py-5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-amber-500/20 group"
            >
              {isSent ? (
                <>
                  <CheckCircle2 size={24} />
                  <span>Request Loaded!</span>
                </>
              ) : (
                <>
                  <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  <span>Send via Email App</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
