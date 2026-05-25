import { useMemo, useState } from 'react';
import { Loader2, Mic, Video, MapPin, BarChart3, Paperclip } from 'lucide-react';
import type { CommunityAttachment, CommunityPoll } from '../../types/community';
import { useExternalLinkProxy } from '../../hooks/useExternalLinkProxy';

const MAX_LOCAL_FILE_SIZE = 100 * 1024 * 1024;

function normalizeYoutubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    }
  } catch {
    return '';
  }
  return '';
}

export default function Composer({
  disabled,
  onSend,
  uploading,
}: {
  disabled?: boolean;
  onSend: (payload: { text: string; attachments: CommunityAttachment[]; poll: CommunityPoll | null }) => Promise<void>;
  uploading: boolean;
}) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<CommunityAttachment[]>([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptionA, setPollOptionA] = useState('');
  const [pollOptionB, setPollOptionB] = useState('');
  const [error, setError] = useState('');
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const { buildProxyFetchUrl } = useExternalLinkProxy();

  const localImageUrls = useMemo(
    () => attachments.filter((item) => item.kind === 'image' && item.url).map((item) => item.url as string),
    [attachments],
  );

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: CommunityAttachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_LOCAL_FILE_SIZE) {
        setError(`File ${file.name} exceeds 100MB. Use URL upload instead.`);
        continue;
      }
      const kind = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('audio/')
          ? 'audio'
          : file.type.startsWith('video/')
            ? 'video'
            : 'document';
      next.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      });
    }
    setAttachments((prev) => [...prev, ...next]);
  };

  const addLinkPreview = async (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) return;
    const youtube = normalizeYoutubeEmbed(url);
    if (youtube) {
      setAttachments((prev) => [...prev, {
        id: `yt-${Date.now()}`,
        kind: 'youtube',
        url: youtube,
        name: 'YouTube',
      }]);
      return;
    }

    try {
      const response = await fetch(buildProxyFetchUrl(url, 'og'));
      const payload = await response.json().catch(() => ({}));
      const attachment: CommunityAttachment = {
        id: `link-${Date.now()}`,
        kind: 'link-preview',
        url,
        ogTitle: String(payload?.title || url),
        ogDescription: String(payload?.description || ''),
        ogImage: payload?.image ? buildProxyFetchUrl(String(payload.image), 'image') : '',
      };
      setAttachments((prev) => [...prev, attachment]);
    } catch {
      setAttachments((prev) => [...prev, { id: `link-${Date.now()}`, kind: 'link-preview', url }]);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setAttachments((prev) => [...prev, {
        id: `loc-${Date.now()}`,
        kind: 'location',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }]);
    }, () => setError('Unable to fetch location.'));
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAttachments((prev) => [...prev, {
          id: `audio-record-${Date.now()}`,
          kind: 'audio',
          name: 'Recorded audio',
          mimeType: 'audio/webm',
          size: blob.size,
          url: URL.createObjectURL(blob),
        }]);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecordingAudio(true);
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
        setRecordingAudio(false);
      }, 15000);
    } catch {
      setError('Microphone permission denied.');
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setAttachments((prev) => [...prev, {
          id: `video-record-${Date.now()}`,
          kind: 'video',
          name: 'Recorded video',
          mimeType: 'video/webm',
          size: blob.size,
          url: URL.createObjectURL(blob),
        }]);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecordingVideo(true);
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
        setRecordingVideo(false);
      }, 15000);
    } catch {
      setError('Camera permission denied.');
    }
  };

  const handleSubmit = async () => {
    const poll = pollQuestion.trim() && pollOptionA.trim() && pollOptionB.trim()
      ? {
          id: `poll-${Date.now()}`,
          question: pollQuestion.trim(),
          options: [
            { id: 'a', label: pollOptionA.trim(), votes: 0 },
            { id: 'b', label: pollOptionB.trim(), votes: 0 },
          ],
        }
      : null;

    await onSend({ text: text.trim(), attachments, poll });
    setText('');
    setAttachments([]);
    setPollQuestion('');
    setPollOptionA('');
    setPollOptionB('');
    setError('');
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 md:p-5 space-y-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a broadcast update or paste a URL..."
        className="w-full min-h-24 bg-zinc-950/60 rounded-2xl border border-zinc-800 p-3 text-zinc-100"
        onPaste={(event) => {
          const maybeUrl = event.clipboardData.getData('text');
          if (/^https?:\/\//i.test(maybeUrl.trim())) {
            addLinkPreview(maybeUrl);
          }
        }}
      />

      {localImageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {localImageUrls.map((img, index) => (
            <img key={`${img}-${index}`} src={img} className="w-full h-20 object-cover rounded-xl border border-zinc-800" />
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-2">
        <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll question (optional)" className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200" />
        <input value={pollOptionA} onChange={(e) => setPollOptionA(e.target.value)} placeholder="Option A" className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200" />
        <input value={pollOptionB} onChange={(e) => setPollOptionB(e.target.value)} placeholder="Option B" className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="px-3 py-2 rounded-xl border border-zinc-800 text-zinc-300 text-xs cursor-pointer inline-flex items-center gap-1">
          <Paperclip size={14} /> Attach
          <input type="file" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} />
        </label>
        <button onClick={startAudioRecording} className={`px-3 py-2 rounded-xl border text-xs inline-flex items-center gap-1 ${recordingAudio ? 'border-blue-500 text-blue-300' : 'border-zinc-800 text-zinc-300'}`}>
          <Mic size={14} /> {recordingAudio ? 'Recording audio...' : 'Record Audio'}
        </button>
        <button onClick={startVideoRecording} className={`px-3 py-2 rounded-xl border text-xs inline-flex items-center gap-1 ${recordingVideo ? 'border-orange-500 text-orange-300' : 'border-zinc-800 text-zinc-300'}`}>
          <Video size={14} /> {recordingVideo ? 'Recording video...' : 'Record Video'}
        </button>
        <button onClick={handleGeolocation} className="px-3 py-2 rounded-xl border border-zinc-800 text-zinc-300 text-xs inline-flex items-center gap-1"><MapPin size={14} /> Share Location</button>
        <button onClick={() => {
          const found = text.match(/https?:\/\/[^\s]+/i);
          if (found?.[0]) addLinkPreview(found[0]);
        }} className="px-3 py-2 rounded-xl border border-zinc-800 text-zinc-300 text-xs inline-flex items-center gap-1"><BarChart3 size={14} /> Preview Link</button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        disabled={disabled || uploading || (!text.trim() && attachments.length === 0)}
        onClick={handleSubmit}
        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-sm font-black disabled:opacity-50 inline-flex items-center gap-2"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : null}
        Send
      </button>
    </div>
  );
}
