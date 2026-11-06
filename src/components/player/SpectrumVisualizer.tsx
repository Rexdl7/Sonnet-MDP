import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface SpectrumVisualizerProps {
  isPlaying: boolean;
  mode?: 'bars' | 'wave';
  className?: string;
  barColor?: string;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  isPlaying,
  mode = 'bars',
  className = 'h-10 w-36',
  barColor = '#FA2D48'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);
    let simPhase = 0;

    if (!isPlaying) {
      // Draw idle baseline once without animating
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const barCount = 18;
      const barWidth = (width / barCount) - 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        ctx.beginPath();
        ctx.roundRect(x, height - 3, barWidth, 3, 1);
        ctx.fill();
      }
      return;
    }

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      audioEngine.getFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }

      if (sum > 0) {
        if (mode === 'bars') {
          const barCount = 20;
          const barWidth = (width / barCount) - 2;

          for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
            const value = dataArray[dataIndex] || 0;
            const barHeight = Math.max(3, (value / 255) * height);
            const x = i * (barWidth + 2);
            const y = height - barHeight;

            ctx.fillStyle = barColor;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
            ctx.fill();
          }
        } else {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = barColor;

          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.stroke();
        }
      } else {
        simPhase += 0.08;
        const barCount = 18;
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const hRatio = (Math.sin(simPhase + i * 0.4) + 1) / 2;
          const barHeight = Math.max(4, hRatio * (height * 0.75) + 3);
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          ctx.fillStyle = barColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, mode, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={40}
      className={`rounded pointer-events-none ${className}`}
    />
  );
};
