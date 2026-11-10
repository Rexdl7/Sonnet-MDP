import React, { useState } from 'react';
import { Track, PlaybackRepeatMode } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { SyncedLyricsView } from './SyncedLyricsView';
import { AmbientArtworkGlowCanvas } from './AmbientArtworkGlowCanvas';
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, Mic2, 
  Heart, Sliders, Users, Music2, CheckCircle2, Flame, Radio, Download
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
  onDownloadTrack?: (track: Track) => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
  relatedTracks?: Track[];
  onPlayTrack?: (track: Track) => void;
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
  onDownloadTrack,
  accentColorHex = '#FA2D48',
  theme,
  relatedTracks = [],
  onPlayTrack,
}) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const isLight = theme?.category === 'light';
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 md:hidden"
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
              if (info.offset.y > 150 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed inset-0 z-50 flex flex-col md:hidden select-none backdrop-blur-3xl overflow-hidden"
            style={{ 
              backgroundColor: isLight ? 'rgba(245,245,247,0.97)' : 'rgba(12,12,14,0.97)', 
              color: textColor 
            }}
          >
            {/* Ambient Blur Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${currentTrack.thumbnailUrl})` }}
            />
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                background: isLight 
                  ? 'linear-gradient(to bottom, rgba(245,245,247,0.85), rgba(245,245,247,0.98))'
                  : 'linear-gradient(to bottom, rgba(12,12,14,0.8), rgba(12,12,14,0.98))'
              }}
            />

            {/* Top Drag Handle & Dismiss Header */}
            <div className="relative z-20 flex items-center justify-between px-5 pt-safe py-3 shrink-0">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: textMuted }}
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center">
                <div className="w-10 h-1 rounded-full mb-1" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }} />
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono" style={{ color: textMuted }}>
                  NOW PLAYING
                </span>
              </div>

              <button
                onClick={onOpenEqualizer}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: textMuted }}
                title="Equalizer"
              >
                <Sliders className="w-5 h-5" />
              </button>
            </div>

            {/* Spotify-Style Vertically Scrollable Sheet Body */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 space-y-6 pb-20 no-scrollbar">
              {/* STAGE 1: Squircle Album Artwork + Ambient Glow + Title + Heart */}
              <div className="relative flex flex-col items-center justify-center pt-2">
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

                <div className="relative z-10 max-w-[280px] sm:max-w-[300px] w-full aspect-square overflow-hidden rounded-3xl shadow-2xl border border-white/15 mb-4 shrink-0 transition-all duration-300">
                  <img
                    src={currentTrack.thumbnailUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Track Info & Favorite Heart */}
                <div className="w-full max-w-sm flex items-center justify-between px-1">
                  <div className="min-w-0 pr-3">
                    <h3 className="text-lg sm:text-xl font-black truncate" style={{ color: textColor }}>
                      {currentTrack.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold truncate mt-0.5" style={{ color: textMuted }}>
                      {currentTrack.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onDownloadTrack && (
                      <button
                        onClick={() => onDownloadTrack(currentTrack)}
                        className="p-2 transition-transform active:scale-90 hover:text-white"
                        style={{ color: textMuted }}
                        title="Download to In-App Library"
                      >
                        <Download className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                    <button
                      onClick={onToggleLike}
                      className="p-2 transition-transform active:scale-90"
                      style={{ color: isLiked ? accentColorHex : textMuted }}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Transport Controls & Scrubber Card */}
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-3">
                <div className="space-y-1">
                  <CustomScrubber
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={onSeek}
                    accentColorHex={accentColorHex}
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
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={onToggleShuffle}
                    className="p-2 transition-colors"
                    style={{ color: isShuffle ? accentColorHex : textMuted }}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onPrevTrack}
                    className="p-2.5 hover:scale-105 active:scale-95 transition-transform"
                    style={{ color: textColor }}
                  >
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                    style={{ backgroundColor: accentColorHex, color: '#FFFFFF' }}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={onNextTrack}
                    className="p-2.5 hover:scale-105 active:scale-95 transition-transform"
                    style={{ color: textColor }}
                  >
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>

                  <button
                    onClick={onToggleRepeat}
                    className="p-2 transition-colors"
                    style={{ color: repeatMode !== 'off' ? accentColorHex : textMuted }}
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3 px-2 pt-1">
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
                    className="flex-1 h-1.5 cursor-pointer rounded-full"
                    style={{ accentColor: accentColorHex }}
                  />
                </div>
              </div>

              {/* SECTION 1: Embedded Synced Lyrics Card */}
              <div className="rounded-3xl bg-white/5 border border-white/10 shadow-xl overflow-hidden min-h-[220px]">
                <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                    <Mic2 className="w-4 h-4 text-amber-400" />
                    Synced Lyrics
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">LRCLIB Sync</span>
                </div>
                <div className="h-64 p-3">
                  <SyncedLyricsView
                    track={currentTrack}
                    currentTime={currentTime}
                    onSeek={onSeek}
                    isMobile={true}
                    accentColorHex={accentColorHex}
                  />
                </div>
              </div>

              {/* SECTION 2: Spotify-Style About the Artist Card */}
              <div className="rounded-3xl bg-white/5 border border-white/10 shadow-xl overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                    <Users className="w-4 h-4 text-cyan-400" />
                    About the Artist
                  </h4>
                  <button
                    onClick={() => setIsSubscribed((prev) => !prev)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      isSubscribed ? 'bg-white/15 text-slate-200' : 'bg-white text-black'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={currentTrack.thumbnailUrl}
                    alt={currentTrack.artist}
                    className="w-14 h-14 rounded-2xl object-cover shadow border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1 truncate">
                      {currentTrack.artist}
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">22.7M monthly listeners</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 pt-1 font-sans">
                  {currentTrack.artist} is a top recording artist streaming on Sonnetmdp with lossless studio fidelity and global hit releases.
                </p>
              </div>

              {/* SECTION 3: Related Station Tracks Shelf */}
              {relatedTracks && relatedTracks.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                      <Radio className="w-4 h-4 text-emerald-400" />
                      Related Station Tracks
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Up Next</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {relatedTracks.slice(0, 8).map((track, idx) => (
                      <div
                        key={`rel-${track.id}-${idx}`}
                        onClick={() => onPlayTrack && onPlayTrack(track)}
                        className="w-32 shrink-0 p-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-black mb-2 shadow">
                          <img src={track.thumbnailUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
