import React, { useState } from 'react';
import { Track, PlaybackRepeatMode } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Repeat1, Volume2, VolumeX, Mic2, ListMusic, Heart, 
  Sliders, Film, Download, Disc3
} from 'lucide-react';

import { ThemeConfig } from '../../utils/themeConfig';

interface FloatingPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: PlaybackRepeatMode;
  isShuffle: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  isLiked: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onToggleLike: () => void;
  onOpenEqualizer: () => void;
  onOpenVideo?: () => void;
  onOpenDownload?: (track: Track) => void;
  qualityBadge?: string;
  isVideoActive?: boolean;
  accentColorHex?: string;
  theme?: ThemeConfig;
}

export const FloatingPlayerBar: React.FC<FloatingPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  isLyricsOpen,
  isQueueOpen,
  isLiked,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleLyrics,
  onToggleQueue,
  onToggleLike,
  onOpenEqualizer,
  onOpenVideo,
  onOpenDownload,
  qualityBadge = 'LOSSLESS 24-BIT',
  isVideoActive,
  accentColorHex = '#FF0000',
  theme,
}) => {
  const isLight = theme?.category === 'light';
  if (!currentTrack) {
    return (
      <div className="h-16 px-6 bg-slate-900/60 backdrop-blur-3xl border-t border-white/10 flex items-center justify-between text-xs text-slate-500 shadow-[0_-8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5" />
          <span>Select any track to begin playing</span>
        </div>
        <div className="flex items-center gap-4">
          <SpectrumVisualizer isPlaying={false} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-20 px-4 md:px-8 flex items-center justify-between gap-4 z-40 select-none transition-colors duration-300 relative border-t bg-[#0a0a0a]"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
      }}
    >
      {/* YouTube Music Full-Width Top Progress Scrubber Line */}
      <div 
        className="absolute -top-[2px] inset-x-0 h-1 bg-white/10 cursor-pointer group hover:h-2 transition-all z-50"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          onSeek(pos * (duration || 100));
        }}
        title="Seek Position"
      >
        <div 
          className="h-full relative transition-all duration-150"
          style={{ 
            width: `${Math.min(100, Math.max(0, ((currentTime || 0) / (duration || 1)) * 100))}%`,
            backgroundColor: accentColorHex,
          }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-md transition-opacity" />
        </div>
      </div>

      {/* Left: Track Details */}
      <div className="flex items-center gap-3 min-w-0 w-1/4">
        <div className="relative shrink-0">
          <img
            src={currentTrack.thumbnailUrl}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-xl object-cover shadow-lg border border-white/10"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-xs md:text-sm font-semibold text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </h4>
            <span 
              className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 border"
              style={{
                backgroundColor: `${accentColorHex}15`,
                color: accentColorHex,
                borderColor: `${accentColorHex}30`,
              }}
              title="Current Listening Audio Fidelity"
            >
              {qualityBadge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          <button
            onClick={onToggleLike}
            className="p-1.5 transition-colors text-slate-400 hover:text-white"
            title={isLiked ? 'Loved' : 'Love this track'}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
              style={{ color: isLiked ? accentColorHex : undefined }}
            />
          </button>

          {onOpenDownload && (
            <button
              onClick={() => onOpenDownload(currentTrack)}
              className="p-1.5 transition-colors text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              title="Download Master Audio in High Quality"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Playback Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffle ? '' : 'text-slate-400 hover:text-white'
            }`}
            style={{ color: isShuffle ? accentColorHex : undefined }}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-slate-900 hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-900" />
            ) : (
              <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? '' : 'text-slate-400 hover:text-white'
            }`}
            style={{ color: repeatMode !== 'off' ? accentColorHex : undefined }}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono tabular-nums text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="flex-1 h-1 cursor-pointer"
            style={{ accentColor: accentColorHex }}
          />
          <span className="text-[11px] font-mono tabular-nums text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Tools & Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        {/* Live Spectrum Visualizer */}
        <div className="hidden lg:block">
          <SpectrumVisualizer isPlaying={isPlaying} className="w-20 h-6" barColor={accentColorHex} />
        </div>

        {/* Lyrics Button */}
        <button
          onClick={onToggleLyrics}
          className={`p-2 rounded-xl transition-all ${
            isLyricsOpen
              ? 'text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          style={{
            backgroundColor: isLyricsOpen ? accentColorHex : undefined,
          }}
          title="Synchronized Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* OuterTune / YouTube Music Song | Video Switch Pill */}
        {onOpenVideo && (
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 text-xs shrink-0">
            <button
              onClick={() => isVideoActive && onOpenVideo()}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                !isVideoActive
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Song
            </button>
            <button
              onClick={() => !isVideoActive && onOpenVideo()}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                isVideoActive
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Video
            </button>
          </div>
        )}

        {/* Equalizer Button */}
        <button
          onClick={onOpenEqualizer}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="10-Band Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Queue Button */}
        <button
          onClick={onToggleQueue}
          className={`p-2 rounded-xl transition-all ${
            isQueueOpen
              ? 'bg-white/20 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title="Up Next Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Slider */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-20 h-1 cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
};
