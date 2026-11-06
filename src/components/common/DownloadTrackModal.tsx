import React, { useState } from 'react';
import { Download, X, Check, Loader2, Disc3, Sparkles } from 'lucide-react';
import { Track } from '../../types/media';

interface DownloadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  accentColorHex?: string;
}

export const DownloadTrackModal: React.FC<DownloadTrackModalProps> = ({
  isOpen,
  onClose,
  track,
  accentColorHex = '#FA2D48',
}) => {
  const [quality, setQuality] = useState<'lossless' | '320k' | '192k'>('lossless');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen || !track) return null;

  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    // Trigger download via anchor
    const url = `/api/music/download?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}&quality=${quality}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${track.title} - ${track.artist}.wav`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1400);
    }, 800);
  };

  const qualityOptions = [
    {
      id: 'lossless' as const,
      name: 'Studio FLAC / WAV Master',
      specs: '24-bit · 96.0 kHz · Uncompressed PCM',
      badge: 'Lossless',
      size: '~8.4 MB',
    },
    {
      id: '320k' as const,
      name: 'High Fidelity MP3',
      specs: '320 kbps CBR · 44.1 kHz Stereo',
      badge: '320k',
      size: '~3.6 MB',
    },
    {
      id: '192k' as const,
      name: 'Standard Fidelity MP3',
      specs: '192 kbps VBR · Optimized for mobile storage',
      badge: '192k',
      size: '~2.1 MB',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl p-6 border shadow-2xl overflow-hidden transition-all text-white select-none"
        style={{
          backgroundColor: '#0F121C',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: accentColorHex }}
            >
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Download Master Audio
              </h3>
              <p className="text-[11px] text-slate-400">
                Offline high-resolution audio export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Preview Card */}
        <div className="flex items-center gap-3 p-3 my-4 rounded-2xl bg-white/5 border border-white/10">
          <img
            src={track.thumbnailUrl}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
              <span>{track.album}</span>
              <span>·</span>
              <span>Source: {track.source.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Quality Options */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColorHex }} />
            Select Output Fidelity
          </label>

          <div className="space-y-1.5">
            {qualityOptions.map((opt) => {
              const isSelected = quality === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setQuality(opt.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/10 border-white/30 shadow-md'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-slate-400'
                  }`}
                  style={{
                    borderColor: isSelected ? `${accentColorHex}80` : undefined,
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{opt.name}</span>
                      <span 
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold"
                        style={{
                          backgroundColor: `${accentColorHex}25`,
                          color: accentColorHex,
                        }}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{opt.specs}</p>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {opt.size}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartDownload}
          disabled={isDownloading || downloadSuccess}
          className="w-full py-3.5 rounded-2xl font-bold text-xs md:text-sm text-white shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          style={{
            backgroundColor: accentColorHex,
            boxShadow: `0 8px 24px ${accentColorHex}50`,
          }}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Packaging Master Audio...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Downloaded Successfully!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download High Quality Audio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
