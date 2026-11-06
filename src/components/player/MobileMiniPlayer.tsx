import React from 'react';
import { Track } from '../../types/media';
import { Play, Pause, SkipForward } from 'lucide-react';

interface MobileMiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onOpenFullPlayer: () => void;
  accentColorHex?: string;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onOpenFullPlayer,
}) => {
  if (!currentTrack) return null;

  return (
    <div
      onClick={onOpenFullPlayer}
      className="md:hidden mx-3 mb-2 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-3xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex items-center justify-between px-3.5 cursor-pointer select-none active:scale-[0.99] transition-transform"
    >
      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={currentTrack.thumbnailUrl}
          alt={currentTrack.title}
          className="w-10 h-10 rounded-xl object-cover shadow-md shrink-0 border border-white/10"
        />
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Buttons */}
      <div
        className="flex items-center gap-2 shrink-0 ml-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-slate-900" />
          ) : (
            <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
          )}
        </button>

        <button
          onClick={onNextTrack}
          className="p-2 text-slate-300 hover:text-white transition-colors"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
