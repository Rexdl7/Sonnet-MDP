import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface AmbientArtworkGlowCanvasProps {
  thumbnailUrl?: string;
  isPlaying: boolean;
  accentColorHex?: string;
  className?: string;
  glowScale?: number;
}

export const AmbientArtworkGlowCanvas: React.FC<AmbientArtworkGlowCanvasProps> = ({
  thumbnailUrl,
  isPlaying,
  accentColorHex = '#FF0000',
  className = '',
  glowScale = 1.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [colors, setColors] = useState<{ primary: string; secondary: string }>({
    primary: accentColorHex,
    secondary: '#3B82F6',
  });

  // Extract dominant palette colors from artwork
  useEffect(() => {
    if (!thumbnailUrl) {
      setColors({ primary: accentColorHex, secondary: '#8B5CF6' });
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = thumbnailUrl;

    img.onload = () => {
      if (!isMounted) return;
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 16;
        offCanvas.height = 16;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 16, 16);
          const data = ctx.getImageData(0, 0, 16, 16).data;

          // Sample center & top-left pixels
          const r1 = data[0], g1 = data[1], b1 = data[2];
          const r2 = data[128], g2 = data[129], b2 = data[130];

          setColors({
            primary: `rgb(${r1}, ${g1}, ${b1})`,
            secondary: `rgb(${r2}, ${g2}, ${b2})`,
          });
        }
      } catch {
        setColors({ primary: accentColorHex, secondary: '#8B5CF6' });
      }
    };

    img.onerror = () => {
      if (isMounted) setColors({ primary: accentColorHex, secondary: '#8B5CF6' });
    };

    return () => {
      isMounted = false;
    };
  }, [thumbnailUrl, accentColorHex]);

  // Audio-reactive Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const freqData = new Uint8Array(64);

    let smoothBass = 0.2;
    let smoothMid = 0.2;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Read Web Audio FFT frequency spectrum
      audioEngine.getFrequencyData(freqData);

      let rawBassSum = 0;
      let rawMidSum = 0;

      for (let i = 0; i < 8; i++) rawBassSum += freqData[i];
      for (let i = 8; i < 28; i++) rawMidSum += freqData[i];

      let targetBass = rawBassSum / (8 * 255);
      let targetMid = rawMidSum / (20 * 255);

      // Fallback organic sine wave pulse for YouTube streams or silent feeds when playing
      if (targetBass < 0.05 && isPlaying) {
        const time = Date.now() / 450;
        targetBass = 0.35 + Math.sin(time) * 0.2 + Math.sin(time * 1.7) * 0.1;
        targetMid = 0.3 + Math.cos(time * 1.3) * 0.15;
      } else if (!isPlaying) {
        targetBass = 0.15;
        targetMid = 0.15;
      }

      // Smooth interpolation for 60fps fluidity
      smoothBass += (targetBass - smoothBass) * 0.12;
      smoothMid += (targetMid - smoothMid) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Outer Bass Bloom Radial Gradient
      const outerRadius = Math.max(10, (width / 2) * (0.6 + smoothBass * 0.6) * glowScale);
      const outerGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, outerRadius
      );
      outerGrad.addColorStop(0, colors.primary);
      outerGrad.addColorStop(0.5, colors.secondary);
      outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.globalAlpha = 0.45 + smoothBass * 0.35;
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Mid Pulse Highlight
      const innerRadius = Math.max(5, (width / 3) * (0.5 + smoothMid * 0.5) * glowScale);
      const innerGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, innerRadius
      );
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      innerGrad.addColorStop(0.4, colors.primary);
      innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.globalAlpha = 0.3 + smoothMid * 0.4;
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, colors, glowScale]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-full pointer-events-none filter blur-2xl opacity-80 transition-opacity duration-500 transform scale-125"
      />
    </div>
  );
};
