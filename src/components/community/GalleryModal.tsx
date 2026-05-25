import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryModal({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!images[index]) return null;
  return (
    <div className="fixed inset-0 z-[500] bg-black/90 p-4 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/70 text-white"><X size={20} /></button>
      <button onClick={onPrev} className="absolute left-5 p-2 rounded-full bg-zinc-800/70 text-white"><ChevronLeft size={20} /></button>
      <img src={images[index]} alt={`Gallery ${index + 1}`} className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl" />
      <button onClick={onNext} className="absolute right-5 p-2 rounded-full bg-zinc-800/70 text-white"><ChevronRight size={20} /></button>
      <p className="absolute bottom-6 text-zinc-300 text-sm font-mono">{index + 1} / {images.length}</p>
    </div>
  );
}
