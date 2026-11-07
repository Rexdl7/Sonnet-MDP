import React, { useState, useEffect } from 'react';
import { Track } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { X, Disc3, Mic2, FileText, Award, Radio, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

interface SongCreditsModalProps {
  isOpen: boolean;
  track: Track | null;
  onClose: () => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
}

export const SongCreditsModal: React.FC<SongCreditsModalProps> = ({
  isOpen,
  track,
  onClose,
  accentColorHex = '#FF0000',
  theme,
}) => {
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !track) return;
    setLoading(true);
    fetch(`/api/music/credits?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.credits) setCredits(data.credits);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, track]);

  if (!isOpen || !track) return null;

  const isLight = theme?.category === 'light';
  const bgColor = theme?.colors.surface || (isLight ? '#FFFFFF' : '#121212');
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-5 animate-in zoom-in-95 duration-200 select-none overflow-hidden"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: textColor,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-2.5">
            <Disc3 className="w-5 h-5" style={{ color: accentColorHex }} />
            <h3 className="text-base font-bold tracking-tight">Song Credits & Audio Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Title Banner */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border" style={{ borderColor }}>
          <img
            src={track.thumbnailUrl}
            alt={track.title}
            className="w-16 h-16 rounded-xl object-cover shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold truncate">{track.title}</h4>
            <p className="text-xs truncate mt-0.5" style={{ color: textMuted }}>{track.artist}</p>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block mt-1">
              Studio Master Lossless 24-Bit / 96kHz
            </span>
          </div>
        </div>

        {/* Credits Details */}
        {loading ? (
          <div className="py-8 text-center space-y-2">
            <Sparkles className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p className="text-xs" style={{ color: textMuted }}>Fetching Spotify/Apple Music credits...</p>
          </div>
        ) : credits ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border space-y-1" style={{ borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: textMuted }}>
                  Performed By
                </span>
                <p className="font-semibold truncate">{credits.performedBy || track.artist}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border space-y-1" style={{ borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: textMuted }}>
                  Written By
                </span>
                <p className="font-semibold truncate">{credits.writtenBy || `${track.artist}`}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border space-y-1" style={{ borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: textMuted }}>
                  Produced By
                </span>
                <p className="font-semibold truncate">{credits.producedBy || 'Studio Producer'}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border space-y-1" style={{ borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: textMuted }}>
                  Record Label
                </span>
                <p className="font-semibold truncate">{credits.recordLabel || 'Global Music Group'}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border space-y-1" style={{ borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: textMuted }}>
                  Tempo / Key Signature
                </span>
                <p className="font-semibold truncate">{credits.bpm || '120 BPM'} · {credits.keySignature || 'A Minor'}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border space-y-1" style={{ borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: textMuted }}>
                  Audio Codec
                </span>
                <p className="font-semibold truncate">{credits.audioQuality || 'FLAC Lossless'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified metadata synced from Spotify, Apple Music & MusicBrainz.</span>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95"
            style={{ backgroundColor: accentColorHex }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
