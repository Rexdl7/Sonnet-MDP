import React from 'react';
import { Track } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { 
  ListMusic, X, Play, Trash2, ArrowUp, ArrowDown, 
  Sparkles, Radio, RefreshCw, Plus 
} from 'lucide-react';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userQueue: Track[];
  radioQueue: Track[];
  autoplayRadio: boolean;
  onToggleAutoplayRadio: () => void;
  onRefreshRadio?: () => void;
  isLoadingRadio?: boolean;
  currentTrack: Track | null;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onMoveQueueItem: (fromIdx: number, toIdx: number) => void;
  accentColorHex?: string;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  userQueue,
  radioQueue,
  autoplayRadio,
  onToggleAutoplayRadio,
  onRefreshRadio,
  isLoadingRadio = false,
  currentTrack,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onMoveQueueItem,
  accentColorHex = '#FF0000',
}) => {
  if (!isOpen) return null;

  const totalNextCount = userQueue.length + (autoplayRadio ? radioQueue.length : 0);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 bg-[#121212] backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-red-500" style={{ color: accentColorHex }} />
          <div>
            <h3 className="text-sm font-bold text-white">Queue & Up Next ({totalNextCount})</h3>
            <span className="text-[10px] text-slate-400">Dynamic continuous autoplay</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userQueue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 transition-colors"
            >
              Clear User Queue
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        {/* Now Playing Header Section */}
        {currentTrack && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0 bg-neutral-900"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
                <span className="text-[9px] text-slate-500">{currentTrack.genre || 'Playing Stream'}</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>
        )}

        {/* User Enqueued Songs (Explicit Queue) */}
        {userQueue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                Next in Your Queue ({userQueue.length})
              </span>
            </div>

            <div className="space-y-1">
              {userQueue.map((track, idx) => (
                <div
                  key={`user-${track.id}-${idx}`}
                  className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all"
                >
                  <div
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="w-4 text-center text-[10px] font-mono tabular-nums text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-900"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {track.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={() => onMoveQueueItem(idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < userQueue.length - 1 && (
                      <button
                        onClick={() => onMoveQueueItem(idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveFromQueue(idx)}
                      className="p-1 text-slate-400 hover:text-red-400"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Infinite Radio Queue (Continuous Similar Vibe) */}
        <div className="space-y-2.5 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-white tracking-tight">
                Infinite Vibe Radio
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onRefreshRadio && (
                <button
                  onClick={onRefreshRadio}
                  disabled={isLoadingRadio}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Find fresh similar songs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRadio ? 'animate-spin' : ''}`} />
                </button>
              )}

              {/* Autoplay Toggle Switch */}
              <button
                onClick={onToggleAutoplayRadio}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoplayRadio ? 'bg-red-600' : 'bg-white/20'
                }`}
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

          <p className="text-[10px] text-slate-400">
            {autoplayRadio
              ? 'Automatically plays cohesive songs matching this vibe when the current song finishes.'
              : 'Autoplay is paused. Playback will stop when queue finishes.'}
          </p>

          {autoplayRadio && (
            <div className="space-y-1">
              {radioQueue.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  {isLoadingRadio ? 'Tuning dynamic radio...' : 'Finding songs with this vibe...'}
                </div>
              ) : (
                radioQueue.map((track, idx) => (
                  <div
                    key={`radio-${track.id}-${idx}`}
                    onClick={() => onPlayTrack(track)}
                    className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-transparent transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-900"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {track.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono text-slate-500">
                        {formatTime(track.duration)}
                      </span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity bg-red-600">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
