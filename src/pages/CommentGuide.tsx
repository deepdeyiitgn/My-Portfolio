import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquare, LogIn, Send, Heart, Reply, ArrowRight, BookOpen, Star } from 'lucide-react';
import SEO from '../components/SEO';

const commentSteps = [
  {
    icon: BookOpen,
    title: 'Find a Journal Post',
    body: 'Head to the Journal section and open any published post that interests you.',
    cta: { label: 'Browse Journal', to: '/journal' },
  },
  {
    icon: LogIn,
    title: 'Sign in with Google',
    body: 'At the bottom of every post there\'s a comment section. Click "Sign in with Google" — one tap, no password.',
  },
  {
    icon: Send,
    title: 'Write & Submit',
    body: 'Type your thoughts (up to 2,000 characters) in the text box, or pick Klipy media from the composer, then press "Post". Your name and avatar from Google will be shown.',
  },
  {
    icon: Reply,
    title: 'Reply to Others',
    body: 'Hit the reply icon on any comment to start a threaded conversation.',
  },
  {
    icon: Heart,
    title: 'Like Comments',
    body: 'Tap the heart on any comment to appreciate it — one like per session.',
  },
];

const feedbackSteps = [
  {
    icon: Star,
    title: 'Open the Feedback Page',
    body: 'Visit the dedicated feedback page to share structured thoughts about projects, platform quality, or collaboration experience.',
    cta: { label: 'Open Feedback', to: '/feedback' },
  },
  {
    icon: LogIn,
    title: 'Sign in with Google',
    body: 'You can submit feedback after Google sign-in, or the owner can submit directly from the owner session.',
  },
  {
    icon: Star,
    title: 'Pick Subject + Rating',
    body: 'Choose the correct subject and sub-subject, then set a 1–5 star rating before writing your feedback.',
  },
  {
    icon: Send,
    title: 'Write Detailed Feedback',
    body: 'Add a short subject line and detailed feedback text. Blacklisted words are only censored if they are actually found.',
  },
];

export default function CommentGuide() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title="Community Guide | Deep Dey Journal"
        description="Learn how comments and feedback work on the website, with step-by-step instructions and live-style preview demos."
        route="/journal/comment"
      />
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
            <MessageSquare size={28} className="text-amber-500" />
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">Community Guide</h1>
          <p className="text-zinc-500 text-base max-w-2xl mx-auto">
            This page shows how both comments and feedback work on the website, plus small previews of how each one appears on the real UI.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-500" />
              <h2 className="text-white font-bold text-lg">How Comments Work</h2>
            </div>
            {commentSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex gap-4 items-start"
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <step.icon size={16} className="text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black text-amber-500/60 font-mono">0{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-white font-bold text-sm">{step.title}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.body}</p>
                  {step.cta && (
                    <Link
                      to={step.cta.to}
                      className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors mt-1"
                    >
                      {step.cta.label} <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <h2 className="text-white font-bold text-lg">How Feedback Works</h2>
            </div>
            {feedbackSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex gap-4 items-start"
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <step.icon size={16} className="text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black text-amber-500/60 font-mono">0{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-white font-bold text-sm">{step.title}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.body}</p>
                  {step.cta && (
                    <Link
                      to={step.cta.to}
                      className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors mt-1"
                    >
                      {step.cta.label} <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </section>
        </div>

        {/* Preview Demos */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <MessageSquare size={14} className="text-amber-500" />
                Comment preview demo
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Website style preview</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">R</div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold">Reader Demo</p>
                  <p className="text-zinc-600 text-[11px]">2m ago</p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                This journal post was super useful. The architecture breakdown and step-by-step explanation made the idea easy to follow.
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1"><Heart size={12} /> 12</span>
                <span className="inline-flex items-center gap-1"><Reply size={12} /> Reply</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Star size={14} className="text-amber-500" />
                Feedback preview demo
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Website style preview</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">Portfolio UX felt premium on mobile</p>
                  <p className="text-zinc-500 text-[11px]">Reader Demo · Website / Mobile Experience</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Navigation felt smooth, sections were easy to understand, and the structured feedback flow makes it clear where to share useful suggestions.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Rules */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-3"
        >
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-[10px] font-black">!</span>
            Community guidelines
          </h2>
          <ul className="space-y-1.5 text-zinc-500 text-sm list-none">
            {[
              'Be respectful — no personal attacks or hate speech.',
              'Stay on topic — comments and feedback should match the correct page or subject.',
              'No spam or self-promotion.',
              'Blacklist words are only censored when they are actually detected.',
              'Repeated violations may result in temporary deactivation of comments, feedback, or full account visibility.',
            ].map(rule => (
              <li key={rule} className="flex items-start gap-2">
                <span className="text-amber-500/50 shrink-0 mt-0.5">›</span>
                {rule}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <div className="text-center space-y-3 sm:space-x-3 sm:space-y-0">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            <BookOpen size={15} /> Browse Journal Posts
          </Link>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-bold rounded-xl hover:border-zinc-700 transition-colors"
          >
            <Star size={15} className="text-amber-500" /> Open Feedback Page
          </Link>
        </div>
      </div>
    </div>
  );
}
