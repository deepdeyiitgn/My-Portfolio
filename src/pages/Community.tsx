import { useMemo, useState } from 'react';
import SEO from '../components/SEO';
import Composer from '../components/community/Composer';
import MessageCard from '../components/community/MessageCard';
import GalleryModal from '../components/community/GalleryModal';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import { useCommunityFeed } from '../hooks/useCommunityFeed';

export default function Community() {
  const { identity } = useGoogleIdentity();
  const { posts, loading, error, fetchFeed, react, votePoll } = useCommunityFeed(identity);
  const [uploading, setUploading] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const doodles = useMemo(() => (
    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none">
      <g stroke="#f59e0b" strokeOpacity="0.4" fill="none" strokeWidth="2">
        <path d="M20 100 Q140 20 260 100 T500 100 T740 100 T980 100" />
        <rect x="110" y="200" width="90" height="60" rx="10" />
        <circle cx="360" cy="250" r="28" />
        <path d="M560 220 l60 -40 l60 40 l-60 40 z" />
        <path d="M760 250 h120 m-60 -60 v120" />
        <path d="M980 220 q50 40 0 80 q-50 -40 0 -80z" />
        <path d="M180 500 h120 l20 20 h-120z" />
        <circle cx="540" cy="520" r="40" />
        <path d="M740 520 q40 -30 80 0 q-40 30 -80 0z" />
      </g>
    </svg>
  ), []);

  const handleSend = async (payload: Parameters<typeof Composer>[0] extends never ? never : { text: string; attachments: any[]; poll: any }) => {
    if (!identity?.credential) return;
    setUploading(true);
    try {
      await fetch('/api/journal?action=community-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: identity.credential,
          text: payload.text,
          attachments: payload.attachments,
          poll: payload.poll,
        }),
      });
      await fetchFeed();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-6 py-10 space-y-6 overflow-hidden">
      <SEO
        title="Community Broadcast | Deep Dey"
        description="Admin broadcast community channel with reactions, media, polls, and real-time updates."
        route="/community"
      />
      {doodles}
      <div className="relative z-10 space-y-4">
        <h2 className="text-amber-500 font-mono tracking-[0.35em] uppercase text-xs">Community Channel</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Broadcast Feed</h1>
        <p className="text-zinc-400 max-w-3xl">WhatsApp/Instagram-style broadcast space where admin posts updates and members react.</p>
      </div>

      <div className="relative z-10">
        <Composer uploading={uploading} onSend={handleSend} />
      </div>

      {loading && <p className="relative z-10 text-zinc-500">Loading feed...</p>}
      {error && <p className="relative z-10 text-red-400">{error}</p>}

      <div className="relative z-10 space-y-4">
        {posts.map((post) => (
          <MessageCard
            key={post._id}
            post={post}
            onReact={(emoji) => react(post._id, emoji)}
            onPollVote={(pollId, optionId) => votePoll(post._id, pollId, optionId)}
            onImageClick={(index) => {
              const imgs = post.attachments.filter((item) => item.kind === 'image' && item.url).map((item) => String(item.url));
              setGalleryImages(imgs);
              setGalleryIndex(index);
            }}
          />
        ))}
      </div>

      {galleryIndex !== null && galleryImages.length > 0 && (
        <GalleryModal
          images={galleryImages}
          index={galleryIndex}
          onClose={() => setGalleryIndex(null)}
          onPrev={() => setGalleryIndex((prev) => (prev === null ? 0 : (prev - 1 + galleryImages.length) % galleryImages.length))}
          onNext={() => setGalleryIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryImages.length))}
        />
      )}
    </div>
  );
}
