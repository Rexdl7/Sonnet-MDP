import React, { useState } from 'react';
import { Track, PlaybackRepeatMode } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { SyncedLyricsView } from './SyncedLyricsView';
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, Mic2, 
  Heart, Sliders
} from 'lucide-react';

interface MobileNowPlayingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: PlaybackRepeatMode;
  isShuffle: boolean;
  isLiked: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleLike: () => void;
  onOpenEqualizer: () => void;
  accentColorHex?: string;
}

export const MobileNowPlayingSheet: React.FC<MobileNowPlayingSheetProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  isLiked,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleLike,
  onOpenEqualizer,
  accentColorHex = '#FA2D48',
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics'>('cover');

  if (!isOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] flex flex-col md:hidden animate-in slide-in-from-bottom duration-300 select-none">
      {/* Ambient Blur Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/80 via-[#0d0d0d]/95 to-[#0d0d0d] pointer-events-none" />

      {/* Top Drag Handle & Dismiss Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe py-3">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Grab Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'cover' : 'lyrics')}
            className={`p-2 rounded-full transition-all ${
              activeTab === 'lyrics' ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
            style={{
              backgroundColor: activeTab === 'lyrics' ? accentColorHex : undefined,
            }}
            title="Lyrics"
          >
            <Mic2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenEqualizer();
            }}
            className="p-2 rounded-full text-slate-300 hover:text-white"
            title="Equalizer"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Stage: Artwork or Synced Lyrics */}
      <div className="relative z-10 flex-1 overflow-hidden flex flex-col justify-center px-5 sm:px-6 py-2">
        {activeTab === 'lyrics' ? (
          <div className="h-full rounded-2xl overflow-hidden">
            <SyncedLyricsView
              track={currentTrack}
              currentTime={currentTime}
              onSeek={onSeek}
              isMobile={true}
              accentColorHex={accentColorHex}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full max-h-[50vh]">
            <div className="max-w-[260px] max-h-[33vh] w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 mb-3 sm:mb-4 bg-neutral-900 shrink-0">
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Track Info */}
            <div className="w-full max-w-sm flex items-center justify-between px-1">
              <div className="min-w-0 pr-3">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{currentTrack.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
              </div>

              <button
                onClick={onToggleLike}
                className="p-2 sm:p-2.5 text-slate-400 hover:text-white shrink-0"
              >
                <Heart
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiked ? 'fill-current' : ''}`}
                  style={{ color: isLiked ? accentColorHex : undefined }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: Scrubber, Transports, Volume */}
      <div className="relative z-10 px-5 sm:px-6 pt-3 pb-safe space-y-3 sm:space-y-4 bg-[#141414]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_0_rgba(0,0,0,0.5)]">
        {/* Scrubber */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1.5 cursor-pointer"
            style={{ accentColor: accentColorHex }}
          />
          <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center justify-between px-2 sm:px-4">
          <button
            onClick={onToggleShuffle}
            className={`p-2 transition-colors ${
              isShuffle ? '' : 'text-slate-400 hover:text-white'
            }`}
            style={{ color: isShuffle ? accentColorHex : undefined }}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-2 sm:p-3 text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-900" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-900 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="p-2 sm:p-3 text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? '' : 'text-slate-400 hover:text-white'
            }`}
            style={{ color: repeatMode !== 'off' ? accentColorHex : undefined }}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <button onClick={onToggleMute} className="text-slate-400">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-1 accent-white"
          />
        </div>
      </div>
    </div>
  );
};
