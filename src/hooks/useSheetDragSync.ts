import { useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { useCallback, useEffect } from 'react';

export interface UseSheetDragSyncReturn {
  dragY: MotionValue<number>;
  sheetOpacity: MotionValue<number>;
  miniPlayerOpacity: MotionValue<number>;
  miniPlayerScale: MotionValue<number>;
  overlayOpacity: MotionValue<number>;
  handleDragEnd: (event: any, info: { offset: { y: number }; velocity: { y: number } }) => void;
  resetDrag: () => void;
}

export function useSheetDragSync(
  isOpen: boolean,
  onClose: () => void,
  activeDrawer: string | null,
  setActiveDrawer: (drawer: any) => void
): UseSheetDragSyncReturn {
  const dragY = useMotionValue(0);

  // When dragY goes from 0 (fully open) to 500 (swiped down towards mini player):
  // 1. Overlay opacity fades from 1 -> 0
  const overlayOpacity = useTransform(dragY, [0, 400], [1, 0]);

  // 2. Sheet content opacity fades gracefully near the bottom
  const sheetOpacity = useTransform(dragY, [0, 350, 500], [1, 0.9, 0.4]);

  // 3. Mini player opacity scales continuously from 0 (hidden when sheet open) up to 1 (full when swiped down)
  const miniPlayerOpacity = useTransform(dragY, [100, 450], [0, 1]);

  // 4. Mini player scale morphs smoothly from 0.92 -> 1.0
  const miniPlayerScale = useTransform(dragY, [100, 450], [0.92, 1.0]);

  useEffect(() => {
    if (isOpen) {
      dragY.set(0);
    }
  }, [isOpen, dragY]);

  const resetDrag = useCallback(() => {
    dragY.set(0);
  }, [dragY]);

  const handleDragEnd = useCallback(
    (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
      const thresholdY = 120;
      const velocityThreshold = 350;

      if (info.offset.y > thresholdY || info.velocity.y > velocityThreshold) {
        // Tactile haptic feedback on snap dismiss
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(12);
          } catch {
            // ignore
          }
        }

        if (activeDrawer) {
          setActiveDrawer(null);
          dragY.set(0);
        } else {
          onClose();
        }
      } else {
        // Snap back to top (open position)
        dragY.set(0);
      }
    },
    [activeDrawer, setActiveDrawer, onClose, dragY]
  );

  return {
    dragY,
    sheetOpacity,
    miniPlayerOpacity,
    miniPlayerScale,
    overlayOpacity,
    handleDragEnd,
    resetDrag,
  };
}
