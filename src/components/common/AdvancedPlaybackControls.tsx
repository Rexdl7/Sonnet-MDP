import React, { useState } from 'react';
import { Gauge, Sliders, Activity, Sparkles, Check, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AdvancedPlaybackControlsProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  equalizerPreset: string;
  onPresetChange: (preset: string) => void;
  isAudioOnly?: boolean;
  resolution?: string;
  className?: string;
}

export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
export const EQ_PRESETS = [
  { id: 'flat', label: 'Flat / Studio Direct', description: 'Neutral audio response' },
  { id: 'bass_boost', label: 'Bass Boost', description: 'Enhanced sub-bass frequencies' },
  { id: 'acoustic', label: 'Acoustic', description: 'Warm acoustics & vocal clarity' },
  { id: 'vocal', label: 'Vocal Booster', description: 'Crisp dialogue & vocal focus' },
  { id: 'rock', label: 'Rock / Dynamic', description: 'Punchy highs & elevated kick' },
  { id: 'electronic', label: 'Electronic', description: 'Deep bass & sparkling synth' },
];

export const AdvancedPlaybackControls: React.FC<AdvancedPlaybackControlsProps> = ({
  playbackSpeed,
  onSpeedChange,
  equalizerPreset,
  onPresetChange,
  isAudioOnly = false,
  resolution = '1080p HD',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'none' | 'speed' | 'eq' | 'codec'>('none');

  const toggleTab = (tab: 'speed' | 'eq' | 'codec') => {
    setActiveTab((prev) => (prev === tab ? 'none' : tab));
  };

  const getCodecBadge = () => {
    if (isAudioOnly) {
      return { label: 'HI-RES AAC 320k', sub: '24-bit / 48kHz' };
    }
    return { label: `${resolution} Opus`, sub: '60fps Standard' };
  };

  const currentCodec = getCodecBadge();

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      {/* Action Buttons Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl">
        {/* Speed Button */}
        <button
          onClick={() => toggleTab('speed')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            activeTab === 'speed' || playbackSpeed !== 1.0
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-zinc-700 dark:text-zinc-200 hover:bg-white/10 dark:hover:bg-white/5'
          }`}
          title="Playback Speed"
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{playbackSpeed === 1.0 ? '1.0x' : `${playbackSpeed}x`}</span>
        </button>

        {/* Equalizer Button */}
        <button
          onClick={() => toggleTab('eq')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            activeTab === 'eq' || equalizerPreset !== 'flat'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-zinc-700 dark:text-zinc-200 hover:bg-white/10 dark:hover:bg-white/5'
          }`}
          title="Audio Equalizer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="capitalize">{equalizerPreset.replace('_', ' ')}</span>
        </button>

        {/* Codec / Telemetry Badge */}
        <button
          onClick={() => toggleTab('codec')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider transition-all ${
            activeTab === 'codec'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-black/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40'
          }`}
          title="Stream Quality & Codec"
        >
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{currentCodec.label}</span>
        </button>
      </div>

      {/* Floating Glass Popover Panel */}
      <AnimatePresence>
        {activeTab !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full mb-3 right-0 z-50 w-72 p-3.5 rounded-2xl bg-zinc-950/90 dark:bg-zinc-900/95 backdrop-blur-3xl border border-white/15 shadow-2xl text-white"
          >
            {/* Speed Selector View */}
            {activeTab === 'speed' && (
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-rose-400" />
                    Playback Rate
                  </span>
                  <span className="text-zinc-400 text-[11px]">VLC-Style Precision</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        onSpeedChange(speed);
                        setActiveTab('none');
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                        playbackSpeed === speed
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-white/5 hover:bg-white/15 text-zinc-300'
                      }`}
                    >
                      {speed === 1.0 ? '1.0x Normal' : `${speed}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Equalizer View */}
            {activeTab === 'eq' && (
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-rose-400" />
                    Equalizer Presets
                  </span>
                  <span className="text-zinc-400 text-[11px]">Audio DSP</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {EQ_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onPresetChange(preset.id);
                        setActiveTab('none');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                        equalizerPreset === preset.id
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium">{preset.label}</div>
                        <div className="text-[10px] text-zinc-400">{preset.description}</div>
                      </div>
                      {equalizerPreset === preset.id && (
                        <Check className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Codec & Stream Info View */}
            {activeTab === 'codec' && (
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Stream & Codec Telemetry
                  </span>
                  <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Live</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-zinc-400">Audio Container</span>
                    <span className="font-mono text-emerald-300 font-semibold">WebM / Opus 48kHz</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-zinc-400">Bitrate & Depth</span>
                    <span className="font-mono text-emerald-300 font-semibold">320kbps Variable</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-zinc-400">Video Resolution</span>
                    <span className="font-mono text-white font-semibold">{resolution}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-zinc-400">Buffer Health</span>
                    <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> 24.5s Optimal
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
