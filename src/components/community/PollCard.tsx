import type { CommunityPoll } from '../../types/community';

export default function PollCard({ poll, onVote }: { poll: CommunityPoll; onVote: (optionId: string) => void }) {
  const total = poll.options.reduce((sum, item) => sum + Number(item.votes || 0), 0);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
      <p className="text-white font-semibold">📊 {poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((option) => {
          const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
          const active = poll.votedOptionByUser === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className={`w-full text-left rounded-xl border p-2.5 transition-colors ${active
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-zinc-800 hover:border-zinc-600'}`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className={active ? 'text-amber-300' : 'text-zinc-200'}>{option.label}</span>
                <span className="text-zinc-500">{option.votes} · {pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
