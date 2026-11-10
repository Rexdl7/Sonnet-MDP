import React, { useState } from 'react';
import { Track, OfflineStoredItem } from '../../types/media';
import { 
  Download, Film, Music, HardDrive, Smartphone, 
  Check, Sparkles, X, ShieldCheck, ArrowDownToLine 
} from 'lucide-react';

interface DownloadModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToInternalStorage?: (item: OfflineStoredItem) => void;
  accentColorHex?: string;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  track,
  isOpen,
  onClose,
  onSaveToInternalStorage,
  accentColorHex = '#FF0000',
}) => {
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [quality, setQuality] = useState<string>('1080p');
  const [storageDestination, setStorageDestination] = useState<'internal' | 'device'>('internal');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !track) return null;

  const videoQualities = [
    { id: '4k', label: '4K Ultra HD', resolution: '3840x2160', size: '~120 MB', badge: 'Ultra HQ' },
    { id: '1080p', label: '1080p Full HD', resolution: '1920x1080', size: '~45 MB', badge: 'Recommended' },
    { id: '720p', label: '720p HD', resolution: '1280x720', size: '~25 MB', badge: 'Fast' },
    { id: '480p', label: '480p Standard', resolution: '854x480', size: '~12 MB', badge: 'Data Saver' },
  ];

  const audioQualities = [
    { id: 'lossless', label: '24-Bit / 96kHz Master', resolution: 'Lossless Studio WAV', size: '~28 MB', badge: 'Audiophile' },
    { id: '320k', label: '320 kbps High Quality', resolution: 'HQ Stereo Audio', size: '~8 MB', badge: 'Clear' },
    { id: '160k', label: '160 kbps Standard', resolution: 'Standard MP3', size: '~4 MB', badge: 'Lightweight' },
  ];

  const activeQualities = mediaType === 'video' ? videoQualities : audioQualities;

  const handleStartDownload = async () => {
    setIsProcessing(true);
    setIsSuccess(false);

    try {
      if (storageDestination === 'internal') {
        // Save to browser in-app offline library (IndexedDB / LocalStore)
        const offlineItem: OfflineStoredItem = {
          id: `offline-${track.id}-${Date.now()}`,
          youtubeId: track.youtubeId,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          thumbnailUrl: track.thumbnailUrl,
          mediaType,
          quality,
          storageType: 'internal',
          savedAt: new Date().toISOString(),
          sizeBytes: mediaType === 'video' ? 45000000 : 8000000,
        };

        // Persist to localStorage / in-app offline cache
        try {
          const storedRaw = localStorage.getItem('sonnet_offline_media') || '[]';
          const list: OfflineStoredItem[] = JSON.parse(storedRaw);
          const filtered = list.filter((i) => i.youtubeId !== track.youtubeId);
          filtered.unshift(offlineItem);
          localStorage.setItem('sonnet_offline_media', JSON.stringify(filtered.slice(0, 50)));
        } catch {
          // ignore
        }

        if (onSaveToInternalStorage) {
          onSaveToInternalStorage(offlineItem);
        }

        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 1500);
        }, 800);
      } else {
        // Direct file download to user's device
        const downloadUrl = `/api/music/download?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}&quality=${encodeURIComponent(quality)}&type=${encodeURIComponent(mediaType)}&format=mp3`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${track.title} [${quality}].${mediaType === 'video' ? 'mp4' : 'mp3'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 1500);
        }, 600);
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#121212] border border-white/10 shadow-2xl p-6 text-white space-y-5"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Download Media in Custom Quality
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">
                {track.title} &bull; {track.artist}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Type Switcher: Video vs Audio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Format</label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40 border border-white/10">
            <button
              onClick={() => {
                setMediaType('video');
                setQuality('1080p');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                mediaType === 'video'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video (.MP4)</span>
            </button>
            <button
              onClick={() => {
                setMediaType('audio');
                setQuality('320k');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                mediaType === 'audio'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio (.MP3)</span>
            </button>
          </div>
        </div>

        {/* Quality Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Select Quality</span>
            <span className="text-[11px] text-slate-500 font-normal">HD bitrates unlocked</span>
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {activeQualities.map((q) => {
              const isSelected = quality === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setQuality(q.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-red-500 bg-red-600' : 'border-slate-500'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{q.label}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                          {q.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{q.resolution}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{q.size}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination: Internal In-App Storage vs Device Download */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Save Location</label>
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => setStorageDestination('internal')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                storageDestination === 'internal'
                  ? 'bg-red-600/15 border-red-500/50 text-white'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold">In-App Offline Storage</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Play offline anytime inside sonnetmdp without using data
              </p>
            </div>

            <div
              onClick={() => setStorageDestination('device')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                storageDestination === 'device'
                  ? 'bg-red-600/15 border-red-500/50 text-white'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold">Device Filesystem</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Save directly to phone / PC Downloads directory
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartDownload}
          disabled={isProcessing}
          className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all text-white shadow-lg disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Downloading {quality.toUpperCase()}...</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center gap-2 text-emerald-300">
              <Check className="w-4 h-4" />
              <span>Saved Successfully!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              <span>
                Download Now ({mediaType === 'video' ? 'Video' : 'Audio'})
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
