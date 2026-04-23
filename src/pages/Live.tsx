import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Youtube, Play, Radio, Clock, ExternalLink, Loader2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import SEO from '../components/SEO';

const CHANNEL_ID = 'UCrh1Mx5CTTbbkgW5O6iS2Tw';
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;
const PAGE_SIZE = 20;

interface VideoItem {
  videoId: string;
  title: string;
  publishedAt: string;
  description: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
  viewCount: number | null;
}

interface LiveData {
  liveEmbedUrl: string;
  videos: VideoItem[];
}

type VideoTab = 'all' | 'video' | 'stream' | 'short';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

function detectVideoType(video: VideoItem): 'short' | 'stream' | 'video' {
  const text = `${video.title} ${video.description}`.toLowerCase();
  if (/#shorts?\b|#ytshorts/i.test(text)) return 'short';
  if (/#live\b|#stream\b|#livestream\b|live stream|going live/i.test(text)) return 'stream';
  return 'video';
}

export default function Live() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [liveMode, setLiveMode] = useState(true);
  const [tab, setTab] = useState<VideoTab>('all');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/live');
      if (!r.ok) throw new Error('Failed to fetch');
      const d = await r.json();
      if (d.ok) {
        setData(d);
        if (d.videos.length > 0 && !selectedVideo) {
          setSelectedVideo(d.videos[0]);
        }
      } else {
        throw new Error(d.message || 'API error');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter videos by tab
  const filteredVideos = useMemo(() => {
    if (!data) return [];
    const sorted = [...data.videos].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    if (tab === 'all') return sorted;
    return sorted.filter((v) => detectVideoType(v) === tab);
  }, [data, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedVideos = filteredVideos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when tab changes
  const handleTabChange = (t: VideoTab) => {
    setTab(t);
    setPage(1);
  };

  const currentEmbedUrl = liveMode
    ? data?.liveEmbedUrl
    : selectedVideo
      ? `${selectedVideo.embedUrl}&autoplay=0`
      : null;

  const TAB_LABELS: { key: VideoTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'stream', label: 'Stream' },
    { key: 'video', label: 'Video' },
    { key: 'short', label: 'Shorts' },
  ];

  return (
    <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-4 py-10 space-y-10">
      <SEO
        title="Live Stream | Deep Dey"
        description="Watch Deep Dey's latest YouTube streams and live sessions — engineering talks, JEE sessions, and dev builds."
        route="/live"
      />

      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-amber-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black flex items-center gap-2">
          <Radio size={10} className="animate-pulse" />
          Stream Station
        </h2>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
          LIVE <span className="text-amber-500 italic">& LATEST.</span>
        </h1>
        <p className="text-zinc-500 max-w-xl text-base font-light">
          Current live stream auto-loads below. Browse latest uploads from the channel.
        </p>
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full text-red-400 text-xs font-mono hover:bg-red-600/20 transition-all"
        >
          <Youtube size={14} />
          Subscribe on YouTube
          <ExternalLink size={12} />
        </a>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 bg-red-900/20 border border-red-800 rounded-2xl text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-800/30 rounded-xl text-xs hover:bg-red-800/50 transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {!loading && data && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mode switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setLiveMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  liveMode
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-red-600/40'
                }`}
              >
                <Radio size={12} className={liveMode ? 'animate-pulse' : ''} />
                LIVE
              </button>
              <button
                onClick={() => setLiveMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !liveMode
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-amber-500/40'
                }`}
              >
                <Play size={12} />
                {selectedVideo ? 'Playing Video' : 'Latest Video'}
              </button>
            </div>

            {/* Embed */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950" style={{ paddingBottom: '56.25%' }}>
              {currentEmbedUrl ? (
                <iframe
                  key={currentEmbedUrl}
                  src={currentEmbedUrl}
                  title={liveMode ? 'YouTube Live' : (selectedVideo?.title || 'YouTube Video')}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-3">
                  <Youtube size={40} />
                  <p className="text-sm">No stream selected</p>
                </div>
              )}

              {liveMode && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-full text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </div>
              )}
            </div>

            {/* Selected video info */}
            {!liveMode && selectedVideo && (
              <motion.div
                key={selectedVideo.videoId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-2"
              >
                <h2 className="text-white font-bold text-lg">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-zinc-500 text-sm">{selectedVideo.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} /> {formatDate(selectedVideo.publishedAt)}
                  </span>
                  {selectedVideo.viewCount !== null && (
                    <span className="flex items-center gap-1.5">
                      <Eye size={11} /> {selectedVideo.viewCount.toLocaleString('en-IN')} views
                    </span>
                  )}
                  <a
                    href={selectedVideo.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Open on YouTube <ExternalLink size={11} />
                  </a>
                </div>
              </motion.div>
            )}

            {liveMode && (
              <div className="p-5 bg-red-950/20 border border-red-900/30 rounded-2xl space-y-1">
                <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                  <Radio size={14} className="animate-pulse" />
                  Auto-loading current live stream
                </p>
                <p className="text-zinc-600 text-xs">
                  If no live stream is running, YouTube will show the channel page. Switch to "Latest Video" to watch recent uploads.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar — recent videos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">Recent Uploads</h3>
              <button
                onClick={fetchData}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 flex-wrap">
              {TAB_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                    tab === key
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-amber-500/40 hover:text-zinc-300'
                  }`}
                >
                  {label}
                  {key === 'all' ? ` (${data.videos.length})` : ''}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {pagedVideos.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-6">No {tab === 'all' ? 'videos' : tab + 's'} found</p>
              ) : (
                pagedVideos.map((video, i) => (
                  <motion.button
                    key={video.videoId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { setSelectedVideo(video); setLiveMode(false); }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all group ${
                      !liveMode && selectedVideo?.videoId === video.videoId
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-zinc-800">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <Play size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 text-xs font-medium line-clamp-2 leading-snug">{video.title}</p>
                        <p className="text-zinc-600 text-[10px] mt-1 font-mono">{formatDate(video.publishedAt)}</p>
                        {video.viewCount !== null && (
                          <p className="text-zinc-600 text-[10px] font-mono flex items-center gap-1">
                            <Eye size={9} /> {video.viewCount.toLocaleString('en-IN')} views
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <span className="text-[10px] font-mono text-zinc-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Channel info footer */}
      <div className="border-t border-zinc-900 pt-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/10 rounded-xl text-red-500">
            <Youtube size={20} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Deep Dey — YouTube</p>
            <p className="text-zinc-600 text-xs font-mono">{CHANNEL_URL}</p>
          </div>
        </div>
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-500 transition-colors flex items-center gap-2"
        >
          <Youtube size={14} />
          Visit Channel
        </a>
      </div>
    </div>
  );
}
