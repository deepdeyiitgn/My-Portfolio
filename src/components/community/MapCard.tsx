export default function MapCard({ latitude, longitude }: { latitude: number; longitude: number }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
      <p className="text-xs text-zinc-400">📍 Location shared ({latitude.toFixed(5)}, {longitude.toFixed(5)})</p>
      <iframe
        src={mapUrl}
        className="w-full h-52 rounded-xl border border-zinc-800"
        loading="lazy"
        title="Shared location"
      />
    </div>
  );
}
