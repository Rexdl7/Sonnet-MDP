import React, { useEffect, useRef, useState } from 'react';
import { Track, LyricLine } from '../../types/media';
import { parseLrcLyrics, getActiveLyricIndex, formatTime } from '../../utils/lyricsParser';
import { Mic2, Music, Sparkles, ArrowLeft } from 'lucide-react';
import { AmbientArtworkGlowCanvas } from './AmbientArtworkGlowCanvas';

interface SyncedLyricsViewProps {
  track: Track | null;
  currentTime: number;
  onSeek: (timeInSeconds: number) => void;
  onClose?: () => void;
  isMobile?: boolean;
  accentColorHex?: string;
}

export const SyncedLyricsView: React.FC<SyncedLyricsViewProps> = ({
  track,
  currentTime,
  onSeek,
  onClose,
  isMobile = false,
  accentColorHex = '#FA2D48',
}) => {
  const [lyricsList, setLyricsList] = useState<LyricLine[]>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (track?.lyrics) {
      const parsed = parseLrcLyrics(track.lyrics);
      setLyricsList(parsed);
    } else {
      setLyricsList([]);
    }
  }, [track?.id, track?.lyrics]);

  const activeIndex = getActiveLyricIndex(lyricsList, currentTime);

  useEffect(() => {
    if (!autoScroll || activeIndex < 0 || !activeLineRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const activeEl = activeLineRef.current;
    const containerHeight = container.clientHeight;
    const targetScrollTop = activeEl.offsetTop - containerHeight / 2 + activeEl.clientHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });
  }, [activeIndex, autoScroll]);

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center select-none">
        <Music className="w-16 h-16 text-slate-600 mb-4 stroke-1" />
        <h3 className="text-xl font-medium text-slate-200">No Audio Playing</h3>
        <p className="text-sm mt-1">Play any track to view real-time synchronized lyrics.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 select-none">
      {/* Blurred Album Art Glass Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-125 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${track.thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95 pointer-events-none" />

      {/* Top Glass Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Lyrics"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <AmbientArtworkGlowCanvas
                thumbnailUrl={track.thumbnailUrl}
                isPlaying={true}
                accentColorHex={accentColorHex}
                className="w-20 h-20"
                glowScale={1.4}
              />
            </div>
            <img
              src={track.thumbnailUrl}
              alt={track.title}
              className="relative z-10 w-12 h-12 rounded-xl object-cover shadow-xl shrink-0 border border-white/15"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">{track.title}</h2>
            <p className="text-xs text-slate-400 truncate">{track.artist} · {track.album}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md ${
              autoScroll
                ? 'text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            style={{
              backgroundColor: autoScroll ? accentColorHex : undefined,
              boxShadow: autoScroll ? `0 4px 14px ${accentColorHex}40` : undefined,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Scroll {autoScroll ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* Lyrics Content Container */}
      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 md:px-16 py-12 space-y-6 scroll-smooth select-text"
      >
        {lyricsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
            <Mic2 className="w-14 h-14 text-slate-600 mb-3" />
            <h4 className="text-lg font-medium text-slate-200">Instrumental / No Synced Lyrics</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Enjoy the musical master recording or pick another track from the catalog.
            </p>
          </div>
        ) : (
          lyricsList.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = activeIndex !== -1 && idx < activeIndex;

            return (
              <div
                key={`${idx}-${line.time}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if (line.time >= 0) {
                    onSeek(line.time);
                  }
                }}
                className={`group cursor-pointer transition-all duration-300 rounded-2xl px-5 py-3 ${
                  isActive
                    ? 'scale-[1.02] transform backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p
                    className={`text-xl md:text-3xl font-extrabold tracking-tight transition-all duration-300 ${
                      isActive
                        ? 'text-white translate-x-1'
                        : isPast
                        ? 'text-white/40'
                        : 'text-white/25 group-hover:text-white/75'
                    }`}
                    style={{
                      textShadow: isActive ? `0 0 24px ${accentColorHex}80` : undefined,
                    }}
                  >
                    {line.text}
                  </p>
                  {line.time >= 0 && (
                    <span
                      className={`text-xs tabular-nums font-mono transition-opacity shrink-0 ${
                        isActive ? 'opacity-100 font-bold' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ color: isActive ? accentColorHex : undefined }}
                    >
                      {formatTime(line.time)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 px-6 py-2.5 bg-slate-900/60 backdrop-blur-xl border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any lyric line to jump to that timestamp</span>
        <span className="tabular-nums font-mono">{formatTime(currentTime)} / {formatTime(track.duration)}</span>
      </div>
    </div>
  );
};
