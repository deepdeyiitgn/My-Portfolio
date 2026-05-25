import type { CommunityPost } from '../../types/community';
import MediaCards from './MediaCards';
import PollCard from './PollCard';
import ReactionBar from './ReactionBar';

export default function MessageCard({
  post,
  onReact,
  onPollVote,
  onImageClick,
}: {
  post: CommunityPost;
  onReact: (emoji: string) => void;
  onPollVote: (pollId: string, optionId: string) => void;
  onImageClick: (index: number) => void;
}) {
  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 md:p-5 space-y-3">
      <div className="flex items-center gap-3">
        {post.createdBy.userPic ? (
          <img src={post.createdBy.userPic} className="w-9 h-9 rounded-full border border-zinc-700" alt={post.createdBy.userName} />
        ) : (
          <div className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-300 text-sm">
            {post.createdBy.userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-white text-sm font-semibold">{post.createdBy.userName} {post.createdBy.isOwner ? '• Admin' : ''}</p>
          <p className="text-zinc-500 text-xs">{post.createdAtIST || new Date(post.createdAt).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {post.text && <p className="text-zinc-200 whitespace-pre-wrap break-words">{post.text}</p>}

      {post.attachments.length > 0 && <MediaCards attachments={post.attachments} onImageClick={onImageClick} />}

      {post.poll && <PollCard poll={post.poll} onVote={(optionId) => onPollVote(post.poll!.id, optionId)} />}

      <ReactionBar reactions={post.reactions} onReact={onReact} />
    </article>
  );
}
