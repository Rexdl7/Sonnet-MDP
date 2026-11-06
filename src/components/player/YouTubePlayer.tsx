import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2, X, Film, Volume2, VolumeX } from 'lucide-react';
import { Track } from '../../types/media';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  seekTime: number | null;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  mode: 'theatre' | 'pip' | 'hidden';
  onModeChange: (mode: 'theatre' | 'pip' | 'hidden') => void;
  accentColorHex?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  seekTime,
  onTimeUpdate,
  onStateChange,
  onEnded,
  mode,
  onModeChange,
  accentColorHex = '#FA2D48',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const pollTimerRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  const youtubeId = currentTrack?.youtubeId || (
    currentTrack?.mediaUrl?.includes('youtube.com') 
      ? new URLSearchParams(new URL(currentTrack.mediaUrl).search).get('v')
      : null
  );

  // Initialize YT Player API
  const initPlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player) return;
    if (playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player('youtube-iframe-target', {
        height: '100%',
        width: '100%',
        videoId: youtubeId || 'fHI8X4OXluQ',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            const player = event.target;
            player.setVolume(isMuted ? 0 : Math.round(volume * 100));
            if (isPlaying) {
              player.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
            if (event.data === 1) {
              onStateChange(true);
            } else if (event.data === 2) {
              onStateChange(false);
            } else if (event.data === 0) {
              onEnded();
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player error code:', err?.data);
          },
        },
      });
    } catch (e) {
      console.warn('YT Player init error:', e);
    }
  }, [youtubeId, isMuted, volume, isPlaying, onStateChange, onEnded]);

  // Load API script if not yet loaded
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isApiReadyRef.current = true;
      initPlayer();
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      isApiReadyRef.current = true;
      initPlayer();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, [initPlayer]);

  // Handle videoId change
  useEffect(() => {
    if (!youtubeId || !playerRef.current || !isPlayerReady) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;
      try {
        if (typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById({
            videoId: youtubeId,
            startSeconds: 0,
          });
          if (isPlaying) {
            playerRef.current.playVideo();
          }
        }
      } catch (err) {
        console.warn('loadVideoById error:', err);
      }
    }
  }, [youtubeId, isPlayerReady, isPlaying]);

  // Handle Play / Pause sync
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      const state = playerRef.current.getPlayerState ? playerRef.current.getPlayerState() : -1;
      if (isPlaying && state !== 1 && state !== 3) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo();
      }
    } catch (err) {
      console.warn('Play/pause error:', err);
    }
  }, [isPlaying, isPlayerReady]);

  // Handle seek
  useEffect(() => {
    if (seekTime === null || !playerRef.current || !isPlayerReady) return;
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seekTime, true);
      }
    } catch (err) {
      console.warn('Seek error:', err);
    }
  }, [seekTime, isPlayerReady]);

  // Handle volume / mute
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(Math.round(volume * 100));
      }
    } catch (err) {
      console.warn('Volume sync error:', err);
    }
  }, [volume, isMuted, isPlayerReady]);

  const lastReportedSecRef = useRef<number>(-1);

  // Poll current time & duration for scrubber and lyrics synchronization (throttled for high FPS)
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    if (!isPlaying) return;

    pollTimerRef.current = setInterval(() => {
      if (!playerRef.current || !isPlayerReady) return;
      try {
        if (typeof playerRef.current.getCurrentTime === 'function') {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          const curSec = Math.floor(cur);
          if (dur > 0 && curSec !== lastReportedSecRef.current) {
            lastReportedSecRef.current = curSec;
            onTimeUpdate(cur, dur);
          }
        }
      } catch {
        // ignore
      }
    }, 500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isPlayerReady, isPlaying, onTimeUpdate]);

  if (!youtubeId) return null;

  // Render PiP or offscreen background audio
  const isPip = mode === 'pip';

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 z-50 ${
        isPip
          ? 'fixed bottom-24 right-6 w-80 h-48 md:w-96 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black'
          : 'fixed -left-[9999px] -top-[9999px] w-1 h-1 opacity-0 pointer-events-none'
      }`}
    >
      {/* PiP Floating Controls Bar */}
      {isPip && (
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
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Expand to Video Theatre"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onModeChange('hidden')}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Hide video (Audio only)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Target iframe DOM */}
      <div className="w-full h-full">
        <div id="youtube-iframe-target" className="w-full h-full" />
      </div>
    </div>
  );
};
