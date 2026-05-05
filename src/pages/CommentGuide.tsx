import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquare, LogIn, Send, Heart, Reply, ArrowRight, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

const steps = [
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
    body: 'Type your thoughts (up to 2 000 characters) in the text box and press "Post". Your name and avatar from Google will be shown.',
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

export default function CommentGuide() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4">
      <SEO
        title="How to Comment | Deep Dey Journal"
        description="Learn how to leave comments on journal posts — sign in with Google, write your thoughts, reply to others, and more."
        route="/journal/comment"
      />
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
            <MessageSquare size={28} className="text-amber-500" />
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">How to Comment</h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Joining the conversation on any journal post is quick. Here's how it works.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
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
              'Stay on topic — comments should be relevant to the post.',
              'No spam or self-promotion.',
              'Profanity is automatically filtered.',
              'Repeated violations may result in a temporary block.',
            ].map(rule => (
              <li key={rule} className="flex items-start gap-2">
                <span className="text-amber-500/50 shrink-0 mt-0.5">›</span>
                {rule}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            <BookOpen size={15} /> Browse Journal Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
