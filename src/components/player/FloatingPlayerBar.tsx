import React from 'react';
import { Track, PlaybackRepeatMode } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Repeat1, Volume2, VolumeX, Mic2, ListMusic, Heart, 
  Sliders, Film, Download, Disc3
} from 'lucide-react';

import { ThemeConfig } from '../../utils/themeConfig';
import { motion } from 'framer-motion';
import { CustomScrubber } from '../common/CustomScrubber';
import { triggerHaptic } from '../../utils/haptics';
import { AmbientArtworkGlowCanvas } from './AmbientArtworkGlowCanvas';

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
  onOpenCredits?: (track: Track) => void;
  qualityBadge?: string;
  isVideoActive?: boolean;
  hapticFeedback: boolean;
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
  onOpenCredits,
  qualityBadge = 'LOSSLESS 24-BIT',
  isVideoActive,
  hapticFeedback,
  accentColorHex = '#D97736',
  theme,
}) => {
  const isLight = theme?.category === 'light';
  const themeId = theme?.id || 'youtube-music';
  
  const isApple = themeId === 'apple-music' || themeId === 'cupertino-light';
  const isSpotify = themeId === 'spotify';
  const isYouTube = themeId === 'youtube-music' || themeId === 'red-black';

  const bgColor = isLight ? 'rgba(255, 255, 255, 0.92)' : isSpotify ? '#121212' : isYouTube ? '#0A0A0A' : 'rgba(18, 18, 18, 0.88)';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)');

  if (!currentTrack) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-6xl mx-auto z-40">
        <div 
          className="h-16 px-6 backdrop-blur-3xl rounded-3xl border flex items-center justify-between text-xs shadow-xl transition-colors"
          style={{ backgroundColor: bgColor, borderColor, color: textMuted }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border" style={{ borderColor }} />
            <span className="font-medium">Select any track to begin playing</span>
          </div>
          <div className="flex items-center gap-4">
            <SpectrumVisualizer isPlaying={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* --------------------------------------------------------------------------
          LAYOUT 1: SPOTIFY CANVAS UI (Display Block / None Toggle)
          -------------------------------------------------------------------------- */}
      <div 
        style={{ display: isSpotify ? 'block' : 'none' }}
        className="fixed bottom-0 inset-x-0 z-40 bg-[#000000] border-t border-white/10 px-4 py-2 pointer-events-auto transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 h-16 select-none">
          {/* Left: Artwork, Track Title, Artist, Heart Icon */}
          <div className="flex items-center gap-3.5 min-w-0 w-1/4">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
                <AmbientArtworkGlowCanvas
                  thumbnailUrl={currentTrack.thumbnailUrl}
                  isPlaying={isPlaying}
                  accentColorHex="#1DB954"
                  className="w-16 h-16"
                  glowScale={1.6}
                />
              </div>
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="relative z-10 w-14 h-14 rounded-xl object-cover shadow-md shrink-0 border border-white/10"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#B3B3B3] truncate mt-0.5">{currentTrack.artist}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleLike}
              className="p-1.5 shrink-0 ml-1 transition-colors"
              style={{ color: isLiked ? '#1DB954' : '#B3B3B3' }}
              title={isLiked ? 'Saved to Your Library' : 'Save to Your Library'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Center: Stacked Transport Controls & Apple-Style Frosted Scrubber */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
            <div className="flex items-center gap-5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleShuffle}
                className="transition-colors"
                style={{ color: isShuffle ? '#1DB954' : '#B3B3B3' }}
                title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPrevTrack}
                className="text-[#B3B3B3] hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onNextTrack}
                className="text-[#B3B3B3] hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleRepeat}
                className="transition-colors"
                style={{ color: repeatMode !== 'off' ? '#1DB954' : '#B3B3B3' }}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* Spotify Frosted Scrubber Bar */}
            <div className="w-full flex items-center gap-2.5">
              <span className="text-[11px] font-mono text-[#B3B3B3] tabular-nums w-9 text-right shrink-0">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
                <CustomScrubber
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={onSeek}
                  accentColorHex="#1DB954"
                  trackBgColor="rgba(255, 255, 255, 0.2)"
                  trackHeight="normal"
                  hapticFeedback={hapticFeedback}
                />
              </div>
              <span className="text-[11px] font-mono text-[#B3B3B3] tabular-nums w-9 shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Lyrics, Queue, Equalizer & Volume */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleLyrics}
              className="p-1.5 transition-colors"
              style={{ color: isLyricsOpen ? '#1DB954' : '#B3B3B3' }}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleQueue}
              className="p-1.5 transition-colors"
              style={{ color: isQueueOpen ? '#1DB954' : '#B3B3B3' }}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenEqualizer}
              className="p-1.5 text-[#B3B3B3] hover:text-white transition-colors"
              title="Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2">
              <button onClick={onToggleMute} className="text-[#B3B3B3] hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  triggerHaptic('scrub', hapticFeedback);
                  onVolumeChange(Number(e.target.value));
                }}
                className="w-20 h-1.5 rounded-full bg-white/20 cursor-pointer accent-[#1DB954]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------
          LAYOUT 2: YOUTUBE MUSIC STUDIO UI (Display Block / None Toggle)
          -------------------------------------------------------------------------- */}
      <div 
        style={{ display: isYouTube ? 'block' : 'none' }}
        className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-r from-black/85 via-[#121218]/85 to-black/85 backdrop-blur-[24px] border-t border-white/10 pointer-events-auto transition-all shadow-2xl"
      >
        {/* Full-width Top Frosted Scrubber Line */}
        <div className="w-full -mt-2 px-0">
          <CustomScrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
            accentColorHex={accentColorHex}
            trackBgColor="rgba(255, 255, 255, 0.15)"
            trackHeight="thin"
            showTimeTooltips={true}
            hapticFeedback={hapticFeedback}
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 h-16 px-4 select-none">
          {/* Left: Track Details */}
          <div className="flex items-center gap-3 min-w-0 w-1/3">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
                <AmbientArtworkGlowCanvas
                  thumbnailUrl={currentTrack.thumbnailUrl}
                  isPlaying={isPlaying}
                  accentColorHex={accentColorHex}
                  className="w-16 h-16"
                  glowScale={1.6}
                />
              </div>
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="relative z-10 w-12 h-12 rounded-xl object-cover shadow border border-white/10"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-[#AAAAAA] truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button 
                onClick={onToggleLike} 
                className="p-1.5 text-[#AAAAAA] hover:text-white transition-colors"
                style={{ color: isLiked ? accentColorHex : undefined }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              {onOpenCredits && (
                <button onClick={() => onOpenCredits(currentTrack)} className="p-1.5 text-[#AAAAAA] hover:text-white">
                  <Disc3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center justify-center gap-6">
            <button onClick={onPrevTrack} className="p-2 text-white hover:opacity-80">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg hover:brightness-110"
              style={{ backgroundColor: accentColorHex }}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </motion.button>
            <button onClick={onNextTrack} className="p-2 text-white hover:opacity-80">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
            <span className="text-xs font-mono text-[#AAAAAA]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Song/Video Pill, Queue, Volume */}
          <div className="flex items-center justify-end gap-3 w-1/3">
            {onOpenVideo && (
              <div className="flex items-center p-0.5 rounded-full bg-[#1F1F1F] border border-[#333333] text-xs shrink-0">
                <button
                  onClick={() => isVideoActive && onOpenVideo()}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: !isVideoActive ? accentColorHex : 'transparent',
                    color: !isVideoActive ? '#FFFFFF' : '#AAAAAA',
                    fontWeight: !isVideoActive ? 700 : 500,
                  }}
                >
                  Song
                </button>
                <button
                  onClick={() => !isVideoActive && onOpenVideo()}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isVideoActive ? accentColorHex : 'transparent',
                    color: isVideoActive ? '#FFFFFF' : '#AAAAAA',
                    fontWeight: isVideoActive ? 700 : 500,
                  }}
                >
                  Video
                </button>
              </div>
            )}
            <button 
              onClick={onToggleLyrics}
              className="p-2 transition-colors hover:text-white"
              style={{ color: isLyricsOpen ? accentColorHex : '#AAAAAA' }}
            >
              <Mic2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onToggleQueue}
              className="p-2 transition-colors hover:text-white"
              style={{ color: isQueueOpen ? accentColorHex : '#AAAAAA' }}
            >
              <ListMusic className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={onToggleMute} className="text-[#AAAAAA] hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-20 h-1.5 rounded-full bg-white/20 cursor-pointer"
                style={{ accentColor: accentColorHex }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------
          LAYOUT 3: APPLE MUSIC GLASS / DEFAULT UNIVERSAL FLOATING UI (Display Block / None Toggle)
          -------------------------------------------------------------------------- */}
      <div 
        style={{ display: (!isSpotify && !isYouTube) ? 'block' : 'none' }}
        className="fixed bottom-4 left-4 right-4 max-w-6xl mx-auto z-40 pointer-events-auto transition-all"
      >
        <div 
          className="h-20 px-4 md:px-8 flex items-center justify-between gap-4 select-none transition-all duration-300 relative rounded-3xl backdrop-blur-[24px] bg-gradient-to-r from-black/80 via-[#181822]/80 to-black/80 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{
            color: textColor,
          }}
        >
          {/* Liquid Glass Top Specular Sheen */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Integrated Apple-Style Frosted Scrubber Line */}
          <div className="absolute top-0 inset-x-0 -mt-1.5 z-50">
            <CustomScrubber
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
              accentColorHex={accentColorHex}
              trackBgColor={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}
              trackHeight="thin"
              showTimeTooltips={true}
              hapticFeedback={hapticFeedback}
            />
          </div>

          {/* Left: Track Details */}
          <div className="flex items-center gap-3.5 min-w-0 w-1/4">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
                <AmbientArtworkGlowCanvas
                  thumbnailUrl={currentTrack.thumbnailUrl}
                  isPlaying={isPlaying}
                  accentColorHex={accentColorHex}
                  className="w-16 h-16"
                  glowScale={1.6}
                />
              </div>
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="relative z-10 w-12 h-12 rounded-2xl object-cover shadow-lg border"
                style={{ borderColor }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 
                  className="text-xs md:text-sm font-bold truncate hover:underline cursor-pointer"
                  style={{ color: textColor }}
                >
                  {currentTrack.title}
                </h4>
                {isApple && (
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
                )}
              </div>
              <p className="text-[11px] truncate mt-0.5 font-medium" style={{ color: textMuted }}>{currentTrack.artist}</p>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleLike}
                className="p-1.5 transition-colors"
                style={{ color: isLiked ? accentColorHex : textMuted }}
                title={isLiked ? 'Loved' : 'Love this track'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              {onOpenCredits && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onOpenCredits(currentTrack)}
                  className="p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
                  style={{ color: textMuted }}
                  title="Song Credits & Specs"
                >
                  <Disc3 className="w-3.5 h-3.5" />
                </motion.button>
              )}

              {onOpenDownload && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onOpenDownload(currentTrack)}
                  className="p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
                  style={{ color: textMuted }}
                  title="Download Audio"
                >
                  <Download className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Center: Playback Controls & Apple-Style Frosted Scrubber */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleShuffle}
                className="p-1.5 rounded-full transition-colors"
                style={{ color: isShuffle ? accentColorHex : textMuted }}
                title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPrevTrack}
                className="p-1.5 transition-colors"
                style={{ color: textColor }}
                title="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  triggerHaptic('click', hapticFeedback);
                  onTogglePlay();
                }}
                className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xl transition-transform"
                style={{ backgroundColor: accentColorHex }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onNextTrack}
                className="p-1.5 transition-colors"
                style={{ color: textColor }}
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleRepeat}
                className="p-1.5 rounded-full transition-colors"
                style={{ color: repeatMode !== 'off' ? accentColorHex : textMuted }}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* Apple Frosted Scrubber Progress Bar */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[11px] font-mono tabular-nums w-10 text-right shrink-0" style={{ color: textMuted }}>
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
                <CustomScrubber
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={onSeek}
                  accentColorHex={accentColorHex}
                  trackBgColor={isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)'}
                  trackHeight="normal"
                  hapticFeedback={hapticFeedback}
                />
              </div>
              <span className="text-[11px] font-mono tabular-nums w-10 shrink-0" style={{ color: textMuted }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Tools & Volume */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            <div className="hidden lg:block">
              <SpectrumVisualizer isPlaying={isPlaying} className="w-20 h-6" barColor={accentColorHex} />
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleLyrics}
              className="p-2 rounded-xl transition-all"
              style={{
                backgroundColor: isLyricsOpen ? accentColorHex : undefined,
                color: isLyricsOpen ? '#FFFFFF' : textMuted,
              }}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </motion.button>

            {onOpenVideo && (
              <div className="hidden sm:flex items-center p-0.5 rounded-full border text-xs shrink-0" style={{ borderColor, backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => isVideoActive && onOpenVideo()}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    !isVideoActive
                      ? 'bg-white text-black shadow-sm font-bold'
                      : ''
                  }`}
                  style={{ color: isVideoActive ? textMuted : undefined }}
                >
                  Song
                </button>
                <button
                  onClick={() => !isVideoActive && onOpenVideo()}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    isVideoActive
                      ? 'bg-white text-black shadow-sm font-bold'
                      : ''
                  }`}
                  style={{ color: !isVideoActive ? textMuted : undefined }}
                >
                  Video
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenEqualizer}
              className="p-2 rounded-xl transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              style={{ color: textMuted }}
              title="10-Band Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleQueue}
              className="p-2 rounded-xl transition-all hover:bg-black/10 dark:hover:bg-white/10"
              style={{
                backgroundColor: isQueueOpen ? `${accentColorHex}20` : undefined,
                color: isQueueOpen ? accentColorHex : textMuted,
              }}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </motion.button>

            <div className="relative flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="p-1.5 transition-colors"
                style={{ color: textMuted }}
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
                onChange={(e) => {
                  triggerHaptic('scrub', hapticFeedback);
                  onVolumeChange(Number(e.target.value));
                }}
                className="w-20 h-1.5 rounded-full bg-black/10 dark:bg-white/15 cursor-pointer"
                style={{ accentColor: accentColorHex }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
