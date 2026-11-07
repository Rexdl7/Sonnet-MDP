import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, X, Film } from 'lucide-react';
import { Track } from '../../types/media';

interface YouTubePlayerProps {
  currentTrack: Track | null;
  nextTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  seekTime: number | null;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  onYTError?: (youtubeId: string) => void;
  mode: 'theatre' | 'pip' | 'hidden';
  onModeChange: (mode: 'theatre' | 'pip' | 'hidden') => void;
  accentColorHex?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentTrack,
  nextTrack,
  isPlaying,
  volume,
  isMuted,
  seekTime,
  onTimeUpdate,
  onStateChange,
  onEnded,
  onYTError,
  mode,
  onModeChange,
  accentColorHex = '#FA2D48',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const elapsedRef = useRef<number>(0);

  const youtubeId = currentTrack?.youtubeId || (
    currentTrack?.mediaUrl?.includes('youtube.com') 
      ? new URLSearchParams(new URL(currentTrack.mediaUrl).search).get('v')
      : null
  );

  const nextYoutubeId = nextTrack?.youtubeId || (
    nextTrack?.mediaUrl?.includes('youtube.com') 
      ? new URLSearchParams(new URL(nextTrack.mediaUrl).search).get('v')
      : null
  );

  // Handle seekTime changes by updating startSeconds
  useEffect(() => {
    if (seekTime !== null) {
      setStartSeconds(Math.floor(seekTime));
      elapsedRef.current = seekTime;
    }
  }, [seekTime]);

  // Reset elapsed time when track changes
  useEffect(() => {
    elapsedRef.current = 0;
    setStartSeconds(0);
  }, [youtubeId]);

  // Simulated time progress ticker when playing
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isPlaying || !youtubeId) return;

    const duration = currentTrack?.duration || 180;

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      if (elapsedRef.current >= duration) {
        elapsedRef.current = duration;
        onEnded();
      }
      onTimeUpdate(elapsedRef.current, duration);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, youtubeId, currentTrack?.duration, onTimeUpdate, onEnded]);

  if (!youtubeId || mode === 'theatre') return null;

  const isPip = mode === 'pip';

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 z-50 ${
        isPip
          ? 'fixed bottom-24 right-6 w-80 h-48 md:w-96 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black'
          : 'fixed bottom-2 right-2 w-32 h-32 opacity-[0.01] pointer-events-none z-[-50] overflow-hidden rounded-lg bg-black border border-white/5'
      }`}
    >
      {isPip && (
        <div className="absolute top-0 inset-x-0 h-9 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 flex items-center justify-between px-3 text-white">
          <div className="flex items-center gap-1.5 min-w-0">
            <Film className="w-3.5 h-3.5 text-red-500 shrink-0" style={{ color: accentColorHex }} />
            <span className="text-[11px] font-medium truncate drop-shadow">
              {currentTrack?.title || 'YouTube Video'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onModeChange('theatre')}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
              title="Expand to Video Theatre"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onModeChange('hidden')}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
              title="Hide video (Audio only)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Current Track Iframe & Next Track Pre-buffer */}
      <div className="w-full h-full">
        <iframe
          key={`${youtubeId}-${startSeconds}`}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0&playsinline=1&start=${startSeconds}`}
          title={currentTrack?.title || 'YouTube Video'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        
        {nextYoutubeId && (
          <iframe
            key={`next-${nextYoutubeId}`}
            src={`https://www.youtube-nocookie.com/embed/${nextYoutubeId}?autoplay=0&controls=0&modestbranding=1&rel=0&playsinline=1`}
            title="Next Track Pre-buffer"
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};
