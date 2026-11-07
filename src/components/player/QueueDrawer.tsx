import React, { useState } from 'react';
import { Track } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  ListMusic, X, Play, Trash2, ArrowUp, ArrowDown, 
  Sparkles, Radio, RefreshCw, Plus, History, Disc3 
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userQueue: Track[];
  radioQueue: Track[];
  historyQueue?: Track[];
  autoplayRadio: boolean;
  onToggleAutoplayRadio: () => void;
  onRefreshRadio?: () => void;
  isLoadingRadio?: boolean;
  currentTrack: Track | null;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onMoveQueueItem: (fromIdx: number, toIdx: number) => void;
  onOpenCredits?: (track: Track) => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(i * 0.025, 0.25),
      type: 'spring' as const,
      stiffness: 400,
      damping: 28,
    },
  }),
};

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  userQueue,
  radioQueue,
  historyQueue = [],
  autoplayRadio,
  onToggleAutoplayRadio,
  onRefreshRadio,
  isLoadingRadio = false,
  currentTrack,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onMoveQueueItem,
  onOpenCredits,
  accentColorHex = '#FF0000',
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  const isLight = theme?.category === 'light';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)');

  const totalNextCount = userQueue.length + (autoplayRadio ? radioQueue.length : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Frosted Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Frosted Acrylic Slide Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 backdrop-blur-3xl border-l shadow-2xl flex flex-col"
            style={{
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(18, 18, 20, 0.94)',
              borderColor: borderColor,
              color: textColor,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor }}>
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5" style={{ color: accentColorHex }} />
                <div>
                  <h3 className="text-sm font-bold">Player Queue & History</h3>
                  <span className="text-[10px]" style={{ color: textMuted }}>Dynamic Spotify & YT Music Queue</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'queue' && userQueue.length > 0 && (
                  <button
                    onClick={onClearQueue}
                    className="text-xs hover:text-red-400 px-2 py-1 transition-colors"
                    style={{ color: textMuted }}
                  >
                    Clear User Queue
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  style={{ color: textMuted }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Tab Switcher: Up Next vs Recently Played */}
            <div className="flex items-center p-2 border-b gap-1 shrink-0" style={{ borderColor }}>
              <button
                onClick={() => setActiveTab('queue')}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: activeTab === 'queue' ? accentColorHex : 'transparent',
                  color: activeTab === 'queue' ? '#FFFFFF' : textMuted,
                }}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>Up Next ({totalNextCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: activeTab === 'history' ? accentColorHex : 'transparent',
                  color: activeTab === 'history' ? '#FFFFFF' : textMuted,
                }}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({historyQueue.length})</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
              {/* Now Playing Header Section */}
              {currentTrack && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: accentColorHex }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColorHex }} />
                    Now Playing
                  </span>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border" style={{ borderColor }}>
                    <img
                      src={currentTrack.thumbnailUrl}
                      alt={currentTrack.title}
                      className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0 bg-neutral-900"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate">{currentTrack.title}</h4>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>{currentTrack.artist}</p>
                      <span className="text-[9px]" style={{ color: textMuted }}>{currentTrack.genre || 'Playing Stream'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onOpenCredits && (
                        <button
                          onClick={() => onOpenCredits(currentTrack)}
                          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ color: textMuted }}
                          title="Credits & Audio Specs"
                        >
                          <Disc3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-xs font-mono tabular-nums" style={{ color: textMuted }}>
                        {formatTime(currentTrack.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: QUEUE & UP NEXT */}
              {activeTab === 'queue' && (
                <>
                  {/* User Enqueued Songs (Explicit Queue) */}
                  {userQueue.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textColor }}>
                          Next in Your Queue ({userQueue.length})
                        </span>
                      </div>

                      <div className="space-y-1">
                        {userQueue.map((track, idx) => (
                          <motion.div
                            key={`user-${track.id}-${idx}`}
                            custom={idx}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border transition-all"
                            style={{ borderColor }}
                          >
                            <div
                              onClick={() => onPlayTrack(track)}
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                            >
                              <span className="w-4 text-center text-[10px] font-mono tabular-nums shrink-0" style={{ color: textMuted }}>
                                {idx + 1}
                              </span>
                              <img
                                src={track.thumbnailUrl}
                                alt={track.title}
                                className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-900"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-semibold truncate">
                                  {track.title}
                                </h5>
                                <p className="text-[10px] truncate" style={{ color: textMuted }}>{track.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                              {idx > 0 && (
                                <button
                                  onClick={() => onMoveQueueItem(idx, idx - 1)}
                                  className="p-1 hover:text-white"
                                  style={{ color: textMuted }}
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {idx < userQueue.length - 1 && (
                                <button
                                  onClick={() => onMoveQueueItem(idx, idx + 1)}
                                  className="p-1 hover:text-white"
                                  style={{ color: textMuted }}
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onRemoveFromQueue(idx)}
                                className="p-1 hover:text-red-400"
                                style={{ color: textMuted }}
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Infinite Radio Queue (Continuous Similar Vibe) */}
                  <div className="space-y-2.5 pt-1 border-t" style={{ borderColor }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] font-bold tracking-tight">
                          Infinite Vibe Radio
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onRefreshRadio && (
                          <button
                            onClick={onRefreshRadio}
                            disabled={isLoadingRadio}
                            className="p-1 rounded transition-colors disabled:opacity-50"
                            style={{ color: textMuted }}
                            title="Find fresh similar songs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRadio ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        {/* Autoplay Toggle Switch */}
                        <button
                          onClick={onToggleAutoplayRadio}
                          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                          style={{ backgroundColor: autoplayRadio ? accentColorHex : 'rgba(150,150,150,0.3)' }}
                          title={autoplayRadio ? 'Autoplay similar songs is ON' : 'Autoplay is OFF'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              autoplayRadio ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px]" style={{ color: textMuted }}>
                      {autoplayRadio
                        ? 'Automatically plays cohesive songs matching this vibe when the current song finishes.'
                        : 'Autoplay is paused. Playback will stop when queue finishes.'}
                    </p>

                    {autoplayRadio && (
                      <div className="space-y-1">
                        {radioQueue.length === 0 ? (
                          <div className="py-6 text-center text-xs" style={{ color: textMuted }}>
                            {isLoadingRadio ? 'Tuning dynamic radio...' : 'Finding songs with this vibe...'}
                          </div>
                        ) : (
                          radioQueue.map((track, idx) => (
                            <motion.div
                              key={`radio-${track.id}-${idx}`}
                              custom={idx}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              onClick={() => onPlayTrack(track)}
                              className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border transition-all cursor-pointer"
                              style={{ borderColor }}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <img
                                  src={track.thumbnailUrl}
                                  alt={track.title}
                                  className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-900"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs font-semibold truncate">
                                    {track.title}
                                  </h5>
                                  <p className="text-[10px] truncate" style={{ color: textMuted }}>{track.artist}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] font-mono" style={{ color: textMuted }}>
                                  {formatTime(track.duration)}
                                </span>
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ backgroundColor: accentColorHex }}
                                >
                                  <Play className="w-3 h-3 fill-white ml-0.5" />
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB 2: RECENTLY PLAYED HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                    Played in this session ({historyQueue.length})
                  </span>

                  {historyQueue.length === 0 ? (
                    <div className="py-12 text-center text-xs" style={{ color: textMuted }}>
                      No listening history yet. Play some tracks to build your session history!
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {historyQueue.map((track, idx) => (
                        <motion.div
                          key={`hist-${track.id}-${idx}`}
                          custom={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => onPlayTrack(track)}
                          className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border transition-all cursor-pointer"
                          style={{ borderColor }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-4 text-center text-[10px] font-mono shrink-0" style={{ color: textMuted }}>
                              {idx + 1}
                            </span>
                            <img
                              src={track.thumbnailUrl}
                              alt={track.title}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-900"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-semibold truncate">{track.title}</h5>
                              <p className="text-[10px] truncate" style={{ color: textMuted }}>{track.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {onOpenCredits && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenCredits(track);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white"
                                title="View Credits"
                              >
                                <Disc3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className="text-[9px] font-mono" style={{ color: textMuted }}>
                              {formatTime(track.duration)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
