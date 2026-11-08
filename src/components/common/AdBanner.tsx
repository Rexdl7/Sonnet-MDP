import React, { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * Reusable Google AdSense Banner Component
 * Requires a valid Publisher ID in index.html
 */
export const AdBanner: React.FC<AdBannerProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = "" 
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden rounded-xl bg-white/5 border border-white/5 flex items-center justify-center min-h-[90px] ${className}`}>
      {/* 
          In development, this will show a placeholder or be blank.
          Real ads only show on approved domains with a valid Publisher ID.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      
      {/* Dev Hint */}
      <span className="absolute text-[8px] font-mono text-white/20 pointer-events-none uppercase tracking-widest">
        Sponsored Space
      </span>
    </div>
  );
};
