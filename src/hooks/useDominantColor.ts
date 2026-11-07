import { useState, useEffect } from 'react';
// @ts-ignore
import * as ColorThiefModule from 'colorthief';

export const useDominantColor = (imageUrl: string | undefined) => {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setColor(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      // @ts-ignore
      const ColorThief = ColorThiefModule.default || ColorThiefModule;
      const colorThief = new ColorThief();
      const rgb = colorThief.getColor(img);
      setColor(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
    };

    img.onerror = () => {
      setColor(null);
    };
  }, [imageUrl]);

  return color;
};
