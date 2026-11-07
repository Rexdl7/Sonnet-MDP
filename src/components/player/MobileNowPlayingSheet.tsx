import React, { useState } from 'react';
import { Track, PlaybackRepeatMode } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { SyncedLyricsView } from './SyncedLyricsView';
import { AmbientArtworkGlowCanvas } from './AmbientArtworkGlowCanvas';
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, Mic2, 
  Heart, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ThemeConfig } from '../../utils/themeConfig';
import { CustomScrubber } from '../common/CustomScrubber';

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
  theme?: ThemeConfig;
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
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics'>('cover');

  const isLight = theme?.category === 'light';
  const themeId = theme?.id || 'youtube-music';
  const isSpotify = themeId === 'spotify';
  const isApple = themeId === 'apple-music' || themeId === 'cupertino-light';

  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)');

  return (
    <AnimatePresence>
      {isOpen && currentTrack && (
        <>
          {/* Dimmed Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 md:hidden"
          />

          {/* Frosted Acrylic Bottom Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="fixed inset-0 z-50 flex flex-col md:hidden select-none backdrop-blur-3xl overflow-hidden"
            style={{ 
              backgroundColor: isLight ? 'rgba(245,245,247,0.96)' : 'rgba(13,13,13,0.96)', 
              color: textColor 
            }}
          >
            {/* Ambient Blur Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${currentTrack.thumbnailUrl})` }}
            />
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                background: isLight 
                  ? 'linear-gradient(to bottom, rgba(245,245,247,0.85), rgba(245,245,247,0.95))'
                  : 'linear-gradient(to bottom, rgba(13,13,13,0.8), rgba(13,13,13,0.95))'
              }}
            />

            {/* Top Drag Handle & Dismiss Header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-safe py-3">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full transition-colors"
                style={{ color: textMuted }}
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              {/* Grab Handle / Subtitle */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-1 rounded-full mb-1" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }} />
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: textMuted }}>
                  {isSpotify ? 'PLAYING FROM SEARCH' : isApple ? 'APPLE MUSIC' : 'NOW PLAYING'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'lyrics' ? 'cover' : 'lyrics')}
                  className="p-2 rounded-full transition-all"
                  style={{
                    backgroundColor: activeTab === 'lyrics' ? accentColorHex : undefined,
                    color: activeTab === 'lyrics' ? '#FFFFFF' : textMuted,
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
                  className="p-2 rounded-full transition-colors"
                  style={{ color: textMuted }}
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
                <div className="relative flex flex-col items-center justify-center h-full max-h-[50vh]">
                  {/* Audio-Reactive Ambient Artwork Glow Canvas */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <AmbientArtworkGlowCanvas
                      thumbnailUrl={currentTrack.thumbnailUrl}
                      isPlaying={isPlaying}
                      accentColorHex={accentColorHex}
                      className="w-72 h-72 sm:w-80 sm:h-80"
                      glowScale={1.5}
                    />
                  </div>

                  <div 
                    className={`relative z-10 max-w-[260px] max-h-[33vh] w-full aspect-square overflow-hidden shadow-2xl border mb-3 sm:mb-4 shrink-0 transition-all ${
                      isSpotify ? 'rounded-md border-white/10' : 'rounded-full border-white/20'
                    } ${isPlaying ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '8s', animationTimingFunction: 'linear', animationIterationCount: 'infinite', animationPlayState: isPlaying ? 'running' : 'paused' }}
                  >
                    <img
                      src={currentTrack.thumbnailUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Track Info */}
                  <div className="w-full max-w-sm flex items-center justify-between px-1">
                    <div className="min-w-0 pr-3">
                      <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: textColor }}>
                        {currentTrack.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs sm:text-sm truncate" style={{ color: textMuted }}>
                          {currentTrack.artist}
                        </p>
                        {isApple && (
                          <span 
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                            style={{ 
                              backgroundColor: `${accentColorHex}15`, 
                              color: accentColorHex,
                              borderColor: `${accentColorHex}30`
                            }}
                          >
                            LOSSLESS
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={onToggleLike}
                      className="p-2 sm:p-2.5 shrink-0 transition-colors"
                      style={{ color: isLiked ? (isSpotify ? '#1DB954' : accentColorHex) : textMuted }}
                    >
                      <Heart
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiked ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls: Scrubber, Transports, Volume */}
            <div 
              className="relative z-10 px-5 sm:px-6 pt-3 pb-safe space-y-3 sm:space-y-4 backdrop-blur-2xl border-t shadow-2xl transition-colors"
              style={{
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 20, 20, 0.95)',
                borderColor: borderColor,
              }}
            >
              {/* Scrubber */}
              <div className="space-y-1">
                <CustomScrubber
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={onSeek}
                  accentColorHex={isSpotify ? '#1DB954' : accentColorHex}
                  trackBgColor={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}
                  trackHeight="normal"
                  alwaysShowThumb={true}
                />
                <div className="flex justify-between text-[11px] font-mono tabular-nums px-0.5" style={{ color: textMuted }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Transport Buttons */}
              <div className="flex items-center justify-between px-2 sm:px-4">
                <button
                  onClick={onToggleShuffle}
                  className="p-2 transition-colors"
                  style={{ color: isShuffle ? (isSpotify ? '#1DB954' : accentColorHex) : textMuted }}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={onPrevTrack}
                  className="p-2 sm:p-3 hover:scale-105 active:scale-95 transition-transform"
                  style={{ color: textColor }}
                >
                  <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                  style={{ 
                    backgroundColor: isSpotify ? '#1DB954' : accentColorHex, 
                    color: '#FFFFFF' 
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={onNextTrack}
                  className="p-2 sm:p-3 hover:scale-105 active:scale-95 transition-transform"
                  style={{ color: textColor }}
                >
                  <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                </button>

                <button
                  onClick={onToggleRepeat}
                  className="p-2 transition-colors"
                  style={{ color: repeatMode !== 'off' ? (isSpotify ? '#1DB954' : accentColorHex) : textMuted }}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 px-2 pt-1 pb-2">
                <button onClick={onToggleMute} style={{ color: textMuted }}>
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1 cursor-pointer"
                  style={{ accentColor: isSpotify ? '#1DB954' : accentColorHex }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
