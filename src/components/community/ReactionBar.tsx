import type { CommunityReactionSummary } from '../../types/community';

const DEFAULT_EMOJIS = ['❤️', '🔥', '👏', '🚀', '😂', '😮', '🎉'];

export default function ReactionBar({
  reactions,
  onReact,
}: {
  reactions: CommunityReactionSummary[];
  onReact: (emoji: string) => void;
}) {
  const used = new Set(reactions.map((r) => r.emoji));
  const nextChoices = DEFAULT_EMOJIS.filter((emoji) => !used.has(emoji)).slice(0, Math.max(0, 7 - used.size));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {reactions.map((item) => (
          <button
            key={item.emoji}
            onClick={() => onReact(item.emoji)}
            className={`px-2.5 py-1 rounded-full border text-xs ${item.reacted
              ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
              : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
          >
            {item.emoji} {item.count}
          </button>
        ))}
      </div>
      {used.size < 7 && (
        <div className="flex flex-wrap gap-1">
          {nextChoices.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="px-2 py-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 text-xs"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
