import React, { useRef, useState, useCallback, useEffect } from 'react';
import { formatTime } from '../../utils/lyricsParser';

interface CustomScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  accentColorHex?: string;
  className?: string;
  trackHeight?: 'thin' | 'normal' | 'thick';
  showTimeTooltips?: boolean;
  alwaysShowThumb?: boolean;
  disabled?: boolean;
  trackBgColor?: string;
}

/**
 * CustomScrubber - High-fidelity Apple & Spotify style progress scrubber
 * - Dynamically colors the played portion (currentTime / duration) with vibrant accentColor
 * - Unplayed portion remains a muted translucent background
 * - High-fidelity spring thumb slider that smoothly expands on hover and drag
 * - Flawless drag & pointer seeking across desktop mouse and mobile touch
 */
export const CustomScrubber: React.FC<CustomScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  accentColorHex = '#FF0000',
  className = '',
  trackHeight = 'normal',
  showTimeTooltips = true,
  alwaysShowThumb = false,
  disabled = false,
  trackBgColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragProgressPercent, setDragProgressPercent] = useState<number>(0);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const safeDuration = duration > 0 ? duration : 100;
  const currentPercent = Math.min(
    100,
    Math.max(0, ((currentTime || 0) / safeDuration) * 100)
  );

  const displayPercent = isDragging ? dragProgressPercent : currentPercent;
  const displayTime = isDragging
    ? (dragProgressPercent / 100) * safeDuration
    : currentTime;

  // Calculate percentage from pointer event
  const calculatePercentFromPointer = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const offsetX = clientX - rect.left;
    const clampedRatio = Math.max(0, Math.min(1, offsetX / rect.width));
    return clampedRatio * 100;
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    const newPercent = calculatePercentFromPointer(e.clientX);
    setDragProgressPercent(newPercent);
    const targetTime = (newPercent / 100) * safeDuration;
    onSeek(targetTime);

    // Capture pointer to continue receiving drag events even if cursor leaves bounds
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const percent = calculatePercentFromPointer(e.clientX);
    setHoverPosition(percent);

    if (isDragging) {
      setDragProgressPercent(percent);
      const targetTime = (percent / 100) * safeDuration;
      onSeek(targetTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (isDragging) {
      const finalPercent = calculatePercentFromPointer(e.clientX);
      setDragProgressPercent(finalPercent);
      const targetTime = (finalPercent / 100) * safeDuration;
      onSeek(targetTime);
      setIsDragging(false);
    }
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // safe fallback
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setHoverPosition(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onSeek(Math.min(safeDuration, currentTime + 5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    }
  };

  const heightClasses = {
    thin: 'h-1 group-hover:h-1.5',
    normal: 'h-1.5 group-hover:h-2',
    thick: 'h-2 group-hover:h-2.5',
  }[trackHeight];

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Audio scrubber"
      aria-valuemin={0}
      aria-valuemax={safeDuration}
      aria-valuenow={Math.round(displayTime)}
      aria-valuetext={formatTime(displayTime)}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-center cursor-pointer select-none touch-none py-2 ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={() => setHoverPosition(null)}
    >
      {/* Background Track (Unplayed Portion) */}
      <div
        ref={containerRef}
        className={`w-full rounded-full transition-all duration-150 relative overflow-visible ${heightClasses}`}
        style={{
          backgroundColor: trackBgColor || 'rgba(255, 255, 255, 0.16)',
        }}
      >
        {/* Subtle Hover Scrub Preview Bar */}
        {hoverPosition !== null && !isDragging && (
          <div
            className="absolute left-0 top-0 bottom-0 rounded-full bg-white/20 pointer-events-none transition-all duration-75"
            style={{ width: `${hoverPosition}%` }}
          />
        )}

        {/* Dynamically Colored Played Portion */}
        <div
          className="h-full rounded-full relative transition-all duration-75"
          style={{
            width: `${displayPercent}%`,
            backgroundColor: accentColorHex,
            boxShadow: isDragging ? '0 1px 4px rgba(0,0,0,0.3)' : undefined,
          }}
        />

        {/* High-Fidelity Apple/Spotify Spring Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-150 ${
            alwaysShowThumb || isDragging
              ? 'opacity-100 scale-100'
              : 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
          }`}
          style={{
            left: `${displayPercent}%`,
          }}
        >
          <div
            className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] ring-2 ring-black/20 flex items-center justify-center transform active:scale-125 transition-transform"
          >
            {/* Inner accent dot on active drag */}
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                isDragging ? 'scale-100' : 'scale-0'
              }`}
              style={{ backgroundColor: accentColorHex }}
            />
          </div>
        </div>

        {/* Floating Tooltip with Time Preview on Hover/Drag */}
        {showTimeTooltips && (isDragging || hoverPosition !== null) && (
          <div
            className="absolute bottom-full mb-2 -translate-x-1/2 pointer-events-none z-50 bg-[#181818] border border-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xl backdrop-blur-md"
            style={{
              left: `${isDragging ? displayPercent : hoverPosition}%`,
            }}
          >
            {formatTime(
              ((isDragging ? displayPercent : hoverPosition || 0) / 100) *
                safeDuration
            )}
          </div>
        )}
      </div>
    </div>
  );
};
