import React, { useState } from 'react';
import { Track, PlaybackRepeatMode } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { SyncedLyricsView } from './SyncedLyricsView';
import { AmbientArtworkGlowCanvas } from './AmbientArtworkGlowCanvas';
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, Mic2, 
  Heart, Sliders, Users, Music2, CheckCircle2, Radio, Download,
  ListMusic, Sparkles, X, Plus, ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeConfig } from '../../utils/themeConfig';
import { CustomScrubber } from '../common/CustomScrubber';

import { useSheetDragSync } from '../../hooks/useSheetDragSync';

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
  queue?: Track[];
  onOpenAddToPlaylist?: (track: Track) => void;
}

type DrawerTab = 'up_next' | 'lyrics' | 'related' | null;

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
  queue = [],
  onOpenAddToPlaylist,
}) => {
  const [activeDrawer, setActiveDrawer] = useState<DrawerTab>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const {
    dragY,
    sheetOpacity,
    overlayOpacity,
    handleDragEnd,
  } = useSheetDragSync(isOpen, onClose, activeDrawer, setActiveDrawer);

  const isLight = theme?.category === 'light';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)');

  if (!isOpen || !currentTrack) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 md:hidden select-none overflow-hidden">
        {/* Dimmed Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ opacity: overlayOpacity }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* YouTube Music Fullscreen Now Playing Container with Sticky Spring Physics */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.15}
          style={{
            y: dragY,
            opacity: sheetOpacity,
            backgroundColor: isLight ? '#F5F5F7' : '#0B0B0E',
            color: textColor,
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden"
        >
          {/* Ambient Artwork Glow Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-150 pointer-events-none"
            style={{ backgroundImage: `url(${currentTrack.thumbnailUrl})` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isLight
                ? 'linear-gradient(to bottom, rgba(245,245,247,0.85) 0%, rgba(245,245,247,0.98) 100%)'
                : 'linear-gradient(to bottom, rgba(11,11,14,0.75) 0%, rgba(11,11,14,0.98) 100%)',
            }}
          />

          {/* TOP BAR: Chevron Down & Title & Actions */}
          <div className="relative z-20 flex items-center justify-between px-4 pt-safe pt-2 pb-1 shrink-0">
            <button
              onClick={onClose}
              className="p-2 -ml-1 rounded-full text-slate-300 hover:text-white active:scale-90 transition-transform"
              aria-label="Minimize player"
            >
              <ChevronDown className="w-7 h-7" />
            </button>

            <div className="flex flex-col items-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold tracking-widest font-mono opacity-60">
                NOW PLAYING
              </span>
              <span className="text-xs font-semibold truncate max-w-[180px] opacity-90">
                {currentTrack.album || 'YouTube Music'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenEqualizer}
                className="p-2 rounded-full text-slate-300 hover:text-white active:scale-90 transition-transform"
                title="Audio Equalizer"
              >
                <Sliders className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN PLAYER VIEW (Single Non-Scrolling Viewport) */}
          <div className="relative z-10 flex-1 flex flex-col justify-between px-6 py-2 min-h-0">
            {/* 1. Album Artwork Container */}
            <div className="relative flex-1 flex items-center justify-center my-auto min-h-0 py-2">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AmbientArtworkGlowCanvas
                  thumbnailUrl={currentTrack.thumbnailUrl}
                  isPlaying={isPlaying}
                  accentColorHex={accentColorHex}
                  className="w-64 h-64 sm:w-72 sm:h-72"
                  glowScale={1.3}
                />
              </div>

              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="relative z-10 w-full max-w-[320px] aspect-square rounded-[28px] overflow-hidden shadow-2xl border border-white/15 bg-black/60 shrink-0"
              >
                <img
                  src={currentTrack.thumbnailUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* 2. Track Title & Artist & Actions Bar */}
            <div className="shrink-0 space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <h2 className="text-lg sm:text-xl font-bold truncate leading-tight" style={{ color: textColor }}>
                    {currentTrack.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium truncate mt-0.5" style={{ color: textMuted }}>
                    {currentTrack.artist}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onOpenAddToPlaylist && (
                    <button
                      onClick={() => onOpenAddToPlaylist(currentTrack)}
                      className="p-2.5 rounded-full text-slate-400 hover:text-white active:scale-90 transition-all"
                      title="Add to Playlist"
                    >
                      <ListPlus className="w-5 h-5" />
                    </button>
                  )}

                  {onDownloadTrack && (
                    <button
                      onClick={() => onDownloadTrack(currentTrack)}
                      className="p-2.5 rounded-full text-slate-400 hover:text-white active:scale-90 transition-all"
                      title="Save In-App"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={onToggleLike}
                    className="p-2.5 rounded-full active:scale-90 transition-all"
                    style={{ color: isLiked ? accentColorHex : textMuted }}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 3. YouTube Music Precision Scrubber & Time */}
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

              {/* 4. YouTube Music Playback Controls (Shuffle, Prev, Big Play, Next, Repeat) */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <button
                  onClick={onToggleShuffle}
                  className="p-2.5 rounded-full transition-colors active:scale-90"
                  style={{ color: isShuffle ? accentColorHex : textMuted }}
                  title="Shuffle"
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={onPrevTrack}
                  className="p-2.5 rounded-full hover:scale-105 active:scale-90 transition-transform"
                  style={{ color: textColor }}
                  title="Previous"
                >
                  <SkipBack className="w-7 h-7 fill-current" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                  style={{ backgroundColor: accentColorHex, color: '#FFFFFF' }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>

                <button
                  onClick={onNextTrack}
                  className="p-2.5 rounded-full hover:scale-105 active:scale-90 transition-transform"
                  style={{ color: textColor }}
                  title="Next"
                >
                  <SkipForward className="w-7 h-7 fill-current" />
                </button>

                <button
                  onClick={onToggleRepeat}
                  className="p-2.5 rounded-full transition-colors active:scale-90"
                  style={{ color: repeatMode !== 'off' ? accentColorHex : textMuted }}
                  title="Repeat"
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* YOUTUBE MUSIC 3-TAB BOTTOM BAR: UP NEXT | LYRICS | RELATED */}
          <div className="relative z-20 shrink-0 px-4 pb-safe pb-3 pt-2 border-t border-white/10 bg-black/40 backdrop-blur-2xl">
            <div className="flex items-center justify-around gap-2 max-w-sm mx-auto">
              <button
                onClick={() => setActiveDrawer(activeDrawer === 'up_next' ? null : 'up_next')}
                className="flex-1 py-2 px-3 rounded-full text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: activeDrawer === 'up_next' ? accentColorHex : 'rgba(255,255,255,0.08)',
                  color: activeDrawer === 'up_next' ? '#FFFFFF' : textColor,
                }}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>UP NEXT</span>
              </button>

              <button
                onClick={() => setActiveDrawer(activeDrawer === 'lyrics' ? null : 'lyrics')}
                className="flex-1 py-2 px-3 rounded-full text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: activeDrawer === 'lyrics' ? accentColorHex : 'rgba(255,255,255,0.08)',
                  color: activeDrawer === 'lyrics' ? '#FFFFFF' : textColor,
                }}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>LYRICS</span>
              </button>

              <button
                onClick={() => setActiveDrawer(activeDrawer === 'related' ? null : 'related')}
                className="flex-1 py-2 px-3 rounded-full text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: activeDrawer === 'related' ? accentColorHex : 'rgba(255,255,255,0.08)',
                  color: activeDrawer === 'related' ? '#FFFFFF' : textColor,
                }}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>RELATED</span>
              </button>
            </div>
          </div>

          {/* SLIDE-UP DRAWER FOR ACTIVE TAB (UP NEXT / LYRICS / RELATED) */}
          <AnimatePresence>
            {activeDrawer && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 300) {
                    setActiveDrawer(null);
                  }
                }}
                className="absolute inset-x-0 bottom-0 top-16 z-30 rounded-t-[32px] bg-[#141418]/95 border-t border-white/20 shadow-2xl backdrop-blur-3xl flex flex-col overflow-hidden"
              >
                {/* Drag Handle & Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="w-10 h-1 rounded-full bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                  
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 pt-1">
                    {activeDrawer === 'up_next' && (
                      <>
                        <ListMusic className="w-4 h-4 text-red-500" />
                        <span>Up Next Queue ({queue.length})</span>
                      </>
                    )}
                    {activeDrawer === 'lyrics' && (
                      <>
                        <Mic2 className="w-4 h-4 text-amber-400" />
                        <span>Synchronized Lyrics</span>
                      </>
                    )}
                    {activeDrawer === 'related' && (
                      <>
                        <Radio className="w-4 h-4 text-emerald-400" />
                        <span>Similar Songs &amp; Artist</span>
                      </>
                    )}
                  </h3>

                  <button
                    onClick={() => setActiveDrawer(null)}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* DRAWER CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {/* TAB 1: UP NEXT QUEUE */}
                  {activeDrawer === 'up_next' && (
                    <div className="space-y-2">
                      {/* Currently Playing Card */}
                      <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                        <img
                          src={currentTrack.thumbnailUrl}
                          alt={currentTrack.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 font-mono">
                            NOW PLAYING
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                      </div>

                      {/* Remaining Queue Tracks */}
                      <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Playing Next ({queue.length})
                      </div>

                      {queue.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                          <Sparkles className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                          <p>Infinite Vibe Radio active</p>
                          <p className="text-[10px] text-slate-500">Auto-generating songs similar to {currentTrack.artist}</p>
                        </div>
                      ) : (
                        queue.map((track, idx) => (
                          <div
                            key={`queue-${track.id}-${idx}`}
                            onClick={() => onPlayTrack && onPlayTrack(track)}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-5 text-center text-xs font-mono text-slate-500">
                                {idx + 1}
                              </span>
                              <img
                                src={track.thumbnailUrl}
                                alt={track.title}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                                  {track.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {formatTime(track.duration)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: SYNCHRONIZED LYRICS */}
                  {activeDrawer === 'lyrics' && (
                    <div className="h-full min-h-[350px]">
                      <SyncedLyricsView
                        track={currentTrack}
                        currentTime={currentTime}
                        onSeek={onSeek}
                        isMobile={true}
                        accentColorHex={accentColorHex}
                      />
                    </div>
                  )}

                  {/* TAB 3: RELATED & ABOUT THE ARTIST */}
                  {activeDrawer === 'related' && (
                    <div className="space-y-4">
                      {/* Artist Spotlight Card */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Artist Spotlight
                          </span>
                          <button
                            onClick={() => setIsSubscribed((prev) => !prev)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              isSubscribed ? 'bg-white/15 text-slate-200' : 'bg-white text-black'
                            }`}
                          >
                            {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
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
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Top Verified Artist</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {currentTrack.artist} streams in lossless studio audio with real-time synchronized lyrics on SonnetMDP.
                        </p>
                      </div>

                      {/* Similar Songs Shelf */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          Similar Vibe Recommendations
                        </span>

                        {relatedTracks.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            Loading similar tracks...
                          </div>
                        ) : (
                          relatedTracks.slice(0, 10).map((relTrack, idx) => (
                            <div
                              key={`rel-${relTrack.id}-${idx}`}
                              onClick={() => onPlayTrack && onPlayTrack(relTrack)}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={relTrack.thumbnailUrl}
                                  alt={relTrack.title}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                                    {relTrack.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 truncate">{relTrack.artist}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {formatTime(relTrack.duration)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
