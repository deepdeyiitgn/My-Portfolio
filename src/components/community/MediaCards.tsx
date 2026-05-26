import type { CommunityAttachment } from '../../types/community';
import MapCard from './MapCard';

export default function MediaCards({
  attachments,
  onImageClick,
}: {
  attachments: CommunityAttachment[];
  onImageClick: (index: number) => void;
}) {
  const images = attachments.filter((item) => item.kind === 'image' && item.url);

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => onImageClick(index)}
              className="rounded-2xl border border-zinc-800 overflow-hidden"
            >
              <img src={img.url} alt={img.name || 'image'} className="w-full h-48 object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {attachments.filter((item) => item.kind === 'youtube' && item.url).map((item) => (
        <div key={item.id} className="rounded-2xl border border-zinc-800 overflow-hidden">
          <iframe
            className="w-full h-56"
            src={item.url}
            title="YouTube"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ))}

      {attachments.filter((item) => item.kind === 'video' && item.url).map((item) => (
        <div key={item.id} className="rounded-2xl border border-zinc-800 p-3 bg-zinc-950/50 text-center space-y-2">
          <video src={item.url} controls className="w-40 h-40 rounded-full object-cover mx-auto border border-zinc-700" preload="metadata" />
          <p className="text-xs text-zinc-400">Duration: {item.durationSec ? `${Math.round(item.durationSec)}s` : '—'}</p>
        </div>
      ))}

      {attachments.filter((item) => item.kind === 'audio' && item.url).map((item) => (
        <div key={item.id} className="rounded-2xl border border-zinc-800 p-3 bg-zinc-950/50 space-y-2">
          <p className="text-xs text-zinc-400">{item.name || 'Audio clip'}</p>
          <audio src={item.url} controls className="w-full" preload="metadata" />
        </div>
      ))}

      {attachments.filter((item) => item.kind === 'document').map((item) => (
        <div key={item.id} className="rounded-2xl border border-zinc-800 p-3 bg-zinc-950/50 flex items-center justify-between">
          <div>
            <p className="text-sm text-white">📄 {item.name || 'Document'}</p>
            <p className="text-xs text-zinc-500">{item.size ? `${Math.round(item.size / 1024)} KB` : ''}</p>
          </div>
          {item.url && (
            <a href={item.url} className="text-xs text-amber-400" target="_blank" rel="noopener noreferrer">Download</a>
          )}
        </div>
      ))}

      {attachments.filter((item) => item.kind === 'location' && item.latitude && item.longitude).map((item) => (
        <div key={item.id}>
          <MapCard latitude={Number(item.latitude)} longitude={Number(item.longitude)} />
        </div>
      ))}

      {attachments.filter((item) => item.kind === 'link-preview').map((item) => (
        <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
          {item.ogImage && <img src={item.ogImage} className="w-full h-40 object-cover" alt={item.ogTitle || 'preview'} loading="lazy" />}
          <div className="p-3 space-y-1">
            <p className="text-white text-sm font-semibold">{item.ogTitle || item.url}</p>
            {item.ogDescription && <p className="text-zinc-400 text-xs line-clamp-2">{item.ogDescription}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
