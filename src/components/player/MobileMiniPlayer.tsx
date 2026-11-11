import React from 'react';
import { Track } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { Play, Pause, SkipForward } from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';

interface MobileMiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onOpenFullPlayer: () => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onOpenFullPlayer,
  accentColorHex = '#FA2D48',
  theme,
}) => {
  if (!currentTrack) return null;

  const isLight = theme?.category === 'light';
  const bgColor = isLight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(18, 18, 18, 0.3)';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.18)');

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onPrevTrack();
    } else if (info.offset.x < -100) {
      onNextTrack();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(8); } catch {}
        }
        onOpenFullPlayer();
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="md:hidden fixed bottom-20 inset-x-3 z-40 max-w-md mx-auto h-14 rounded-2xl backdrop-blur-[24px] bg-gradient-to-r from-black/80 via-[#181822]/80 to-black/80 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex items-center justify-between px-3.5 cursor-pointer select-none active:scale-[0.98] transition-all overflow-hidden"
      style={{
        color: textColor,
      }}
    >
      {/* Top Specular Highlight */}
      <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Track Info */}
      <motion.div
        className="flex items-center gap-3 min-w-0 flex-1"
        whileDrag={{ opacity: 0.5 }}
      >
        <img
          src={currentTrack.thumbnailUrl}
          alt={currentTrack.title}
          className="w-10 h-10 rounded-xl object-cover shadow-md shrink-0 border"
          style={{ borderColor }}
        />
        <div className="min-w-0">
          <h4 className="text-xs font-bold truncate" style={{ color: textColor }}>{currentTrack.title}</h4>
          <p className="text-[11px] truncate mt-0.5 font-medium" style={{ color: textMuted }}>{currentTrack.artist}</p>
        </div>
      </motion.div>

      {/* Buttons */}
      <div
        className="flex items-center gap-2 shrink-0 ml-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: accentColorHex, color: '#FFFFFF' }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={onNextTrack}
          className="p-2 transition-colors"
          style={{ color: textMuted }}
          title="Next Track"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
