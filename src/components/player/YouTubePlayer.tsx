import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, X, Film, AlertCircle, RefreshCw } from 'lucide-react';
import { Track } from '../../types/media';

interface YouTubePlayerProps {
  currentTrack: Track | null;
  nextTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  seekTime: number | null;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  onYTError?: (youtubeId: string) => void;
  mode: 'theatre' | 'pip' | 'hidden';
  onModeChange: (mode: 'theatre' | 'pip' | 'hidden') => void;
  accentColorHex?: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const YouTubePlayer = ({
  currentTrack,
  nextTrack,
  isPlaying,
  volume,
  isMuted,
  seekTime,
  onTimeUpdate,
  onStateChange,
  onEnded,
  onYTError,
  mode,
  onModeChange,
  accentColorHex = '#FA2D48',
}: YouTubePlayerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const youtubeId = currentTrack?.youtubeId || (
    currentTrack?.mediaUrl?.includes('youtube.com') 
      ? new URLSearchParams(new URL(currentTrack.mediaUrl).search).get('v')
      : null
  );

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
  }, []);

  // Instantiate or update player when ID changes
  useEffect(() => {
    if (!isApiReady || !youtubeId || !containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.loadVideoById({
        videoId: youtubeId,
        startSeconds: 0
      });
      if (!isPlaying) {
        playerRef.current.pauseVideo();
      }
      setLoadError(null);
    } else {
      playerRef.current = new window.YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        videoId: youtubeId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(isMuted ? 0 : volume * 100);
            if (isPlaying) event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            const state = event.data;
            if (state === 1) {
              onStateChange(true);
              setIsBuffering(false);
            } else if (state === 2) {
              onStateChange(false);
              setIsBuffering(false);
            } else if (state === 0) {
              onEnded();
            } else if (state === 3) {
              setIsBuffering(true);
            }
          },
          onError: (event: any) => {
            const errCode = event.data;
            let msg = 'Playback error';
            if (errCode === 2) msg = 'Invalid video ID';
            if (errCode === 5) msg = 'HTML5 player error';
            if (errCode === 100) msg = 'Video not found or removed';
            if (errCode === 101 || errCode === 150) msg = 'Embed restricted by uploader';
            
            setLoadError(msg);
            if (onYTError) onYTError(youtubeId);
            
            // Auto-skip on restricted videos after a short delay
            if (errCode === 101 || errCode === 150 || errCode === 100) {
              setTimeout(() => onEnded(), 2000);
            }
          }
        }
      });
    }

    return () => {
      // Don't destroy immediately to allow smooth transitions, 
      // but clean up if necessary
    };
  }, [isApiReady, youtubeId]);

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.playVideo) return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.setVolume) return;
    playerRef.current.setVolume(isMuted ? 0 : volume * 100);
  }, [volume, isMuted]);

  // Sync seek
  useEffect(() => {
    if (seekTime !== null && playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seekTime, true);
    }
  }, [seekTime]);

  // Time progress monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (current > 0) {
          onTimeUpdate(current, duration);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  if (!youtubeId || mode === 'theatre') return null;

  const isPip = mode === 'pip';

  return (
    <div
      className={`transition-all duration-300 z-50 ${
        isPip
          ? 'fixed bottom-24 right-6 w-80 h-48 md:w-96 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black'
          : 'fixed bottom-2 right-2 w-32 h-32 opacity-[0.01] pointer-events-none z-[-50] overflow-hidden rounded-lg bg-black border border-white/5'
      }`}
    >
      {isPip && (
        <>
          <div className="absolute top-0 inset-x-0 h-9 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 flex items-center justify-between px-3 text-white">
            <div className="flex items-center gap-1.5 min-w-0">
              <Film className="w-3.5 h-3.5 text-red-500 shrink-0" style={{ color: accentColorHex }} />
              <span className="text-[11px] font-medium truncate drop-shadow">
                {currentTrack?.title || 'YouTube Video'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onModeChange('theatre')}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
                title="Expand to Video Theater"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => onModeChange('hidden')}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
                title="Hide video (Audio only)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-white text-xs font-medium mb-1">{loadError}</p>
              <p className="text-white/60 text-[10px]">Skipping to next track...</p>
            </div>
          )}

          {isBuffering && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20">
              <RefreshCw className="w-6 h-6 text-white animate-spin opacity-60" />
            </div>
          )}
        </>
      )}

      <div ref={containerRef} className="w-full h-full">
        <div id="yt-player-iframe" className="w-full h-full"></div>
      </div>
    </div>
  );
};
