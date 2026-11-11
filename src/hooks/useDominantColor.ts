import { useState, useEffect } from 'react';

export const useDominantColor = (imageUrl: string | undefined) => {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setColor(null);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 16;
        canvas.height = 16;

        ctx.drawImage(img, 0, 0, 16, 16);
        const imageData = ctx.getImageData(0, 0, 16, 16);
        const data = imageData.data;

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const alpha = data[i + 3];

          if (alpha > 128) {
            r += pr;
            g += pg;
            b += pb;
            count++;
          }
        }

        if (count > 0 && isMounted) {
          const avgR = Math.round(r / count);
          const avgG = Math.round(g / count);
          const avgB = Math.round(b / count);
          setColor(`rgb(${avgR}, ${avgG}, ${avgB})`);
        }
      } catch (err) {
        if (isMounted) setColor(null);
      }
    };

    img.onerror = () => {
      if (isMounted) setColor(null);
    };

    img.src = imageUrl;

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return color;
};
