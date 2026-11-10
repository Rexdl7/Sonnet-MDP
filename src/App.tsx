/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track, ActiveView, PlaybackRepeatMode, Playlist, AppSettings, OfflineStoredItem } from './types/media';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, DEFAULT_SETTINGS } from './data/curatedTracks';
import { audioEngine } from './services/audioEngine';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useDominantColor } from './hooks/useDominantColor';
import { 
  syncUserLibrary, 
  subscribeUserLibrary, 
  subscribeUserPlaylists, 
  saveUserPlaylist 
} from './services/firebaseService';

import { generateUpNextRadio } from './services/youtubeOAuthService';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { MacOSWindowHeader } from './components/layout/MacOSWindowHeader';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { FloatingPlayerBar } from './components/player/FloatingPlayerBar';
import { MobileMiniPlayer } from './components/player/MobileMiniPlayer';
import { MobileNowPlayingSheet } from './components/player/MobileNowPlayingSheet';
import { SyncedLyricsView } from './components/player/SyncedLyricsView';
import { QueueDrawer } from './components/player/QueueDrawer';
import { YouTubePlayer } from './components/player/YouTubePlayer';

import { DownloadTrackModal } from './components/common/DownloadTrackModal';
import { SongCreditsModal } from './components/common/SongCreditsModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { SonnetmdpAuthModal } from './components/common/SonnetmdpAuthModal';
import { THEMES } from './utils/themeConfig';

import { AnimatePresence, motion } from 'framer-motion';

// Views
import { ExploreView } from './components/views/ExploreView';
import { SearchView } from './components/views/SearchView';
import { VideoTheatreView } from './components/views/VideoTheatreView';
import { EqualizerView } from './components/views/EqualizerView';
import { SettingsView } from './components/views/SettingsView';
import { LibraryView } from './components/views/LibraryView';

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // App & Audio Settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const activeTheme = THEMES[settings.appTheme] || THEMES['youtube-music'];
  const accentColorHex = activeTheme.colors.accent;

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  // Track download & credits modal states
  const [downloadTrack, setDownloadTrack] = useState<Track | null>(null);
  const [creditsTrack, setCreditsTrack] = useState<Track | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Audio Quality Badge display
  const qualityBadge = 
    settings.listeningQuality === 'lossless' ? 'LOSSLESS 24-BIT' :
    settings.listeningQuality === 'high_aac' ? 'HI-RES AAC 320K' :
    settings.listeningQuality === 'standard' ? 'MP3 192K' :
    settings.listeningQuality === 'saver' ? 'ECO 96K' :
    `CUSTOM ${settings.customBitrate}K`;

  // Playback state (boots in clean zero-state without preloaded songs)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<PlaybackRepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Video display mode: 'theatre' when in video view, 'pip' when popped out, 'hidden' for background audio
  const [videoMode, setVideoMode] = useState<'theatre' | 'pip' | 'hidden'>('hidden');

  // Dynamic Radio Queue (Infinite autoplay based on current vibe) vs User Enqueued tracks
  const [userQueue, setUserQueue] = useState<Track[]>([]);
  const [radioQueue, setRadioQueue] = useState<Track[]>([]);
  const [autoplayRadio, setAutoplayRadio] = useState<boolean>(true);
  const [isLoadingRadio, setIsLoadingRadio] = useState<boolean>(false);
  const playedTrackIdsRef = useRef<Set<string>>(new Set());

  // Lists & Collections
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Navigation & Drawer states
  const [activeView, setActiveView] = useState<ActiveView>('explore');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  
  // Track if we are currently playing from a specific playlist (to maintain that queue)
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  // Mobile Back Button Toast hint
  const [exitToast, setExitToast] = useState<string | null>(null);
  const lastBackPressRef = useRef<number>(0);
  const isPoppingStateRef = useRef<boolean>(false);

  // Firebase Authentication & YouTube Cloud Sync
  const { 
    currentUser, 
    youtubeLikedTracks, 
    isYouTubeSynced, 
    listeningHistory,
    recordTrackListen,
    loading: authLoading, 
    loginWithGoogle, 
    logout 
  } = useFirebaseAuth();

  const dominantColor = useDominantColor(currentTrack?.thumbnailUrl);

  // In-App Offline Media Storage
  const [offlineItems, setOfflineItems] = useState<OfflineStoredItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sonnet_offline_media') || '[]');
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleSaveToInternalStorage = (item: OfflineStoredItem) => {
    setOfflineItems((prev) => {
      const filtered = prev.filter((i) => i.youtubeId !== item.youtubeId);
      const updated = [item, ...filtered];
      localStorage.setItem('sonnet_offline_media', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDirectInAppDownload = (track: Track) => {
    const offlineItem: OfflineStoredItem = {
      id: `offline-${track.id}-${Date.now()}`,
      youtubeId: track.youtubeId,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      thumbnailUrl: track.thumbnailUrl,
      mediaType: track.mediaCategory === 'video' ? 'video' : 'audio',
      quality: 'lossless (320k)',
      storageType: 'internal',
      savedAt: new Date().toISOString(),
      sizeBytes: 12000000,
    };

    handleSaveToInternalStorage(offlineItem);
    showToast(`Saved "${track.title}" to Downloads in Library ✓`);
  };

  const handleRemoveOfflineItem = (id: string) => {
    setOfflineItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem('sonnet_offline_media', JSON.stringify(updated));
      return updated;
    });
  };

  // Synchronize Firestore likes, history, and playlists when user signs in
  useEffect(() => {
    if (!currentUser) return;

    const unsubLibrary = subscribeUserLibrary(currentUser.uid, ({ likedTrackIds: remoteLikes }) => {
      if (remoteLikes && remoteLikes.length > 0) {
        setLikedTrackIds(new Set(remoteLikes));
      }
    });

    const unsubPlaylists = subscribeUserPlaylists(currentUser.uid, (remotePlaylists) => {
      if (remotePlaylists && remotePlaylists.length > 0) {
        setPlaylists(remotePlaylists);
      }
    });

    return () => {
      unsubLibrary();
      unsubPlaylists();
    };
  }, [currentUser]);

  // Spotify / YouTube Web style History API management (Clean single-step back for modals and views)
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ view: 'explore', modal: null }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      isPoppingStateRef.current = true;

      // 1. Close any open modals/sheets in a single clean step
      if (downloadTrack) {
        setDownloadTrack(null);
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }
      if (isPwaModalOpen) {
        setIsPwaModalOpen(false);
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }
      if (isMobileSheetOpen) {
        setIsMobileSheetOpen(false);
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }
      if (isLyricsOpen) {
        setIsLyricsOpen(false);
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }
      if (isQueueOpen) {
        setIsQueueOpen(false);
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }

      // 2. Navigate back to previous view or explore
      const targetView = e.state?.view as ActiveView | undefined;
      if (targetView && targetView !== activeView) {
        setActiveView(targetView);
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }

      if (activeView !== 'explore') {
        setActiveView('explore');
        setTimeout(() => { isPoppingStateRef.current = false; }, 50);
        return;
      }

      setTimeout(() => { isPoppingStateRef.current = false; }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [downloadTrack, isPwaModalOpen, isMobileSheetOpen, isLyricsOpen, isQueueOpen, activeView]);

  // Safe navigation handler that pushes state into browser history
  const navigateToView = (v: ActiveView) => {
    if (isLyricsOpen) setIsLyricsOpen(false);
    if (v === activeView) return;
    setActiveView(v);
    if (!isPoppingStateRef.current) {
      window.history.pushState({ view: v, modal: null }, '');
    }
  };

  const isCurrentYouTube = currentTrack?.source === 'youtube' || !!currentTrack?.youtubeId;

  // Audio Context initialization for local files
  const initAudioDsp = useCallback(() => {
    if (audioRef.current) {
      audioEngine.init(audioRef.current);
    }
  }, []);

  // Sleep Timer listener
  useEffect(() => {
    if (settings.sleepTimerMinutes <= 0) return;
    const timer = setTimeout(() => {
      setIsPlaying(false);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setSettings((s) => ({ ...s, sleepTimerMinutes: 0 }));
    }, settings.sleepTimerMinutes * 60 * 1000);

    return () => clearTimeout(timer);
  }, [settings.sleepTimerMinutes]);

  // Sync volume with local audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Auto-fetch synchronized lyrics if track doesn't have them
  useEffect(() => {
    if (!currentTrack || currentTrack.lyrics) return;

    fetch(`/api/music/lyrics?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.lyrics) {
          setCurrentTrack((prev) => (prev?.id === currentTrack.id ? { ...prev, lyrics: data.lyrics } : prev));
        }
      })
      .catch(() => {});
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // Fetch dynamic similar vibe tracks to populate Infinite Radio buffer
  const fetchSimilarVibeTracks = useCallback(async (seedTrack: Track) => {
    if (!autoplayRadio) return;
    setIsLoadingRadio(true);
    try {
      const excluded = Array.from(playedTrackIdsRef.current).join(',');
      const res = await fetch(
        `/api/music/related?title=${encodeURIComponent(seedTrack.title)}&artist=${encodeURIComponent(
          seedTrack.artist
        )}&genre=${encodeURIComponent(seedTrack.genre || '')}&exclude=${encodeURIComponent(excluded)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const fresh = data.results.filter((t: Track) => !playedTrackIdsRef.current.has(t.id));
          setRadioQueue(fresh.length > 0 ? fresh : data.results);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingRadio(false);
    }
  }, [autoplayRadio]);

  // Automatically seed radio queue if playing and queue is empty
  useEffect(() => {
    if (currentTrack && radioQueue.length === 0 && userQueue.length === 0 && !isLoadingRadio) {
      fetchSimilarVibeTracks(currentTrack);
    }
  }, [currentTrack, radioQueue.length, userQueue.length, isLoadingRadio, fetchSimilarVibeTracks]);

  // Play a specific track
  const playTrack = useCallback((track: Track, fromPlaylistId: string | null = null, playlistTracks: Track[] = []) => {
    initAudioDsp();
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration || 180);
    setIsPlaying(true);
    setActivePlaylistId(fromPlaylistId);

    // If playing from a playlist, populate the user queue with remaining songs
    if (fromPlaylistId && playlistTracks.length > 0) {
      const trackIndex = playlistTracks.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        setUserQueue(playlistTracks.slice(trackIndex + 1));
      }
    } else {
      // If playing a single track (search/explore), clear user queue to prioritize Infinite Radio
      setUserQueue([]);
    }

    // Track played history
    playedTrackIdsRef.current.add(track.id);
    if (recordTrackListen) {
      recordTrackListen(track);
    }

    const isYT = track.source === 'youtube' || !!track.youtubeId;

    if (isYT) {
      // Pause local audio element when playing YouTube track
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }

      // Generate continuous Up Next radio queue matching the seed track
      // If we are playing from a playlist, we still fetch radio as a secondary fallback
      generateUpNextRadio(track)
        .then((upNextTracks) => {
          if (upNextTracks.length > 0) {
            setRadioQueue(upNextTracks);
          } else {
            fetchSimilarVibeTracks(track);
          }
        })
        .catch(() => {
          fetchSimilarVibeTracks(track);
        });
    } else {
      // Local audio playback
      if (audioRef.current) {
        audioRef.current.src = track.mediaUrl;
        audioRef.current.currentTime = 0;
        audioEngine.resumeContext();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Track play error:', err));
      }
    }
  }, [initAudioDsp, recordTrackListen, fetchSimilarVibeTracks]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    initAudioDsp();
    if (isCurrentYouTube) {
      setIsPlaying((prev) => !prev);
    } else if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!audioRef.current.src && currentTrack) {
          audioRef.current.src = currentTrack.mediaUrl;
        }
        audioEngine.resumeContext();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Play resume error:', err));
      }
    }
  }, [initAudioDsp, isCurrentYouTube, currentTrack]);

  // Next Track: Prioritizes explicit user queue, then dynamic continuous similar-vibe radio
  const handleNextTrack = useCallback(() => {
    // 1. Explicit user queue takes priority
    if (userQueue.length > 0) {
      const [nextTrack, ...remaining] = userQueue;
      setUserQueue(remaining);
      playTrack(nextTrack, activePlaylistId);
      return;
    }

    // 2. Continuous similar vibe radio (Infinite Radio)
    // If we are NOT playing from a playlist, or if the playlist queue is exhausted
    if (radioQueue.length > 0) {
      const nextTrack = radioQueue[0];
      const remaining = radioQueue.slice(1);
      setRadioQueue(remaining);
      playTrack(nextTrack, activePlaylistId);

      // If radio buffer is running low, replenish with more similar songs
      if (remaining.length <= 2) {
        fetchSimilarVibeTracks(nextTrack);
      }
      return;
    }

    // 3. Fallback: If absolutely nothing left, try to seed from current track
    if (currentTrack) {
      fetchSimilarVibeTracks(currentTrack);
    }
  }, [userQueue, radioQueue, currentTrack, playTrack, fetchSimilarVibeTracks, activePlaylistId]);

  // Seek handler
  const handleSeek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (isCurrentYouTube) {
      setSeekTime(seconds);
      setTimeout(() => setSeekTime(null), 100);
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  }, [isCurrentYouTube]);

  // Previous Track
  const handlePrevTrack = useCallback(() => {
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }
    const all = [...localTracks];
    const currentIndex = all.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      playTrack(all[currentIndex - 1]);
    } else if (all.length > 0) {
      playTrack(all[all.length - 1]);
    } else if (currentTrack) {
      handleSeek(0);
    }
  }, [currentTime, currentTrack, localTracks, playTrack, handleSeek]);

  // Handle Track Ended
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      handleSeek(0);
      setIsPlaying(true);
      return;
    }
    handleNextTrack();
  }, [repeatMode, handleNextTrack, handleSeek]);

  // Media Session API for background audio playback when browser/app is minimized on mobile
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'Sonnet Stream',
      artwork: [
        { src: currentTrack.thumbnailUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: currentTrack.thumbnailUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: currentTrack.thumbnailUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: currentTrack.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      handlePrevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      handleNextTrack();
    });
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handleSeek(details.seekTime);
        }
      });
    } catch {}
  }, [currentTrack, isPlaying, togglePlay, handlePrevTrack, handleNextTrack, handleSeek]);

  // Queue actions (explicit user-added queue)
  const handleAddToQueue = (track: Track) => {
    setUserQueue((prev) => [...prev, track]);
  };

  const handleRemoveFromQueue = (index: number) => {
    setUserQueue((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveQueueItem = (fromIdx: number, toIdx: number) => {
    setUserQueue((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  // Like / Heart toggle
  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      if (currentUser) {
        syncUserLibrary(currentUser.uid, Array.from(next), userQueue);
      }
      return next;
    });
  };

  // Local tracks
  const handleAddLocalTrack = (track: Track) => {
    setLocalTracks((prev) => [track, ...prev]);
    playTrack(track);
  };

  const handleRemoveLocalTrack = (trackId: string) => {
    setLocalTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Create custom playlist
  const handleCreatePlaylist = (title: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      name: title,
      description,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      trackIds: [],
      tracks: [],
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPlaylists((prev) => [newPl, ...prev]);
    if (currentUser) {
      saveUserPlaylist(currentUser.uid, newPl);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case 'KeyM':
          setIsMuted((prev) => !prev);
          break;
        case 'KeyL':
          setIsLyricsOpen((prev) => !prev);
          break;
        case 'KeyV':
          navigateToView('video');
          break;
        case 'KeyK':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            navigateToView('search');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSeek, duration, currentTime]);

  const totalQueueCount = userQueue.length + (autoplayRadio ? radioQueue.length : 0);

  return (
    <div
      className="flex h-screen min-h-[100dvh] max-h-[100dvh] w-screen overflow-hidden font-sans select-none transition-colors duration-500"
      style={{
        backgroundColor: activeTheme.colors.bg,
        color: activeTheme.colors.text,
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Samsung Sans', sans-serif",
      }}
    >
      {/* HTML5 Audio Element for Local audio files */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (!isCurrentYouTube && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 180);
          }
        }}
        onEnded={handleTrackEnded}
      />

      {/* YouTube IFrame Player (Handles both video display and background audio streaming) */}
      <YouTubePlayer
        currentTrack={currentTrack}
        nextTrack={userQueue.length > 0 ? userQueue[0] : (autoplayRadio ? radioQueue[0] : null)}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        seekTime={seekTime}
        onTimeUpdate={(cur, dur) => {
          if (isCurrentYouTube) {
            setCurrentTime(cur);
            if (dur > 0) setDuration(dur);
          }
        }}
        onStateChange={(playing) => {
          if (isCurrentYouTube) {
            setIsPlaying(playing);
          }
        }}
        onEnded={handleTrackEnded}
        onYTError={(failedId) => {
          console.warn('YouTube embed restricted for video:', failedId);
        }}
        mode={activeView === 'video' ? 'theatre' : videoMode}
        onModeChange={(newMode) => {
          if (newMode === 'theatre') {
            navigateToView('video');
            setVideoMode('hidden');
          } else {
            setVideoMode(newMode);
          }
        }}
        accentColorHex={accentColorHex}
      />

      {/* Dynamic Themed Sidebar (Desktop) */}
      <Sidebar
        activeView={activeView}
        onSelectView={navigateToView}
        playlists={playlists}
        likedCount={likedTrackIds.size}
        localCount={localTracks.length}
        accentColorHex={accentColorHex}
        theme={activeTheme}
      />

      {/* Main Workspace Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* macOS Top Window Header */}
        <MacOSWindowHeader
          activeView={activeView}
          onSelectView={navigateToView}
          currentTrack={currentTrack}
          isLyricsOpen={isLyricsOpen}
          onToggleLyrics={() => {
            setIsLyricsOpen((prev) => {
              const next = !prev;
              if (next) window.history.pushState({ view: activeView, modal: 'lyrics' }, '');
              return next;
            });
          }}
          isQueueOpen={isQueueOpen}
          onToggleQueue={() => {
            setIsQueueOpen((prev) => {
              const next = !prev;
              if (next) window.history.pushState({ view: activeView, modal: 'queue' }, '');
              return next;
            });
          }}
          queueCount={totalQueueCount}
          accentColorHex={accentColorHex}
          theme={activeTheme}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (activeView !== 'search' && q.trim().length > 0) {
              navigateToView('search');
            }
          }}
          tracks={[...INITIAL_TRACKS, ...youtubeLikedTracks, ...localTracks]}
          onPlayTrack={playTrack}
          onOpenAppModal={() => {
            setIsPwaModalOpen(true);
            window.history.pushState({ view: activeView, modal: 'pwa' }, '');
          }}
          user={currentUser}
          authLoading={authLoading}
          onLogin={loginWithGoogle}
          onLogout={logout}
          likedCount={youtubeLikedTracks.length}
        />

        {/* Viewport Content Stage with Framer Motion Fluid Tab Transitions */}
        <main 
          className="flex-1 overflow-hidden relative"
        >
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: dominantColor ? `linear-gradient(to bottom, ${dominantColor}15, ${activeTheme.colors.bg})` : activeTheme.colors.bg,
              backdropFilter: 'blur(30px)',
            }}
          />
          <div className="relative z-10 h-full w-full">
            <AnimatePresence mode="wait">
              {isLyricsOpen ? (
                <motion.div
                  key="lyrics"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full"
                >
                  <SyncedLyricsView
                    track={currentTrack}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                    onClose={() => setIsLyricsOpen(false)}
                    accentColorHex={accentColorHex}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.985 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                  }}
                  className="h-full w-full"
                >
                  {activeView === 'explore' && (
                    <ExploreView
                      onPlayTrack={playTrack}
                      onOpenLyrics={(track) => {
                        playTrack(track);
                        setIsLyricsOpen(true);
                        window.history.pushState({ view: activeView, modal: 'lyrics' }, '');
                      }}
                      onDownloadTrack={(track) => handleDirectInAppDownload(track)}
                      onOpenVideo={(track) => {
                        playTrack(track);
                        navigateToView('video');
                      }}
                      currentTrack={currentTrack}
                      currentTrackId={currentTrack?.id}
                      likedTrackIds={likedTrackIds}
                      onToggleLike={handleToggleLike}
                      onSwitchView={navigateToView}
                      accentColorHex={accentColorHex}
                      theme={activeTheme}
                      user={currentUser}
                      historyQueue={listeningHistory}
                      youtubeLikedTracks={youtubeLikedTracks}
                      isYouTubeSynced={isYouTubeSynced}
                      onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    />
                  )}

                  {activeView === 'search' && (
                    <SearchView
                      onPlayTrack={playTrack}
                      onAddToQueue={handleAddToQueue}
                      onOpenLyrics={(track) => {
                        playTrack(track);
                        setIsLyricsOpen(true);
                        window.history.pushState({ view: activeView, modal: 'lyrics' }, '');
                      }}
                      onOpenVideo={(track) => {
                        playTrack(track);
                        navigateToView('video');
                      }}
                      onDownloadTrack={(track) => handleDirectInAppDownload(track)}
                      onOpenCredits={setCreditsTrack}
                      currentTrackId={currentTrack?.id}
                      likedTrackIds={likedTrackIds}
                      onToggleLike={handleToggleLike}
                      accentColorHex={accentColorHex}
                      query={searchQuery}
                      onQueryChange={(q) => setSearchQuery(q)}
                      theme={activeTheme}
                    />
                  )}

                  {activeView === 'video' && (
                    <VideoTheatreView
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      onTogglePlay={togglePlay}
                      onNextTrack={handleNextTrack}
                      onPrevTrack={handlePrevTrack}
                      currentTime={currentTime}
                      duration={duration}
                      onSeek={handleSeek}
                      queue={userQueue.length > 0 ? userQueue : radioQueue}
                      onPlayTrack={playTrack}
                      onOpenLyrics={() => {
                        setIsLyricsOpen(true);
                        window.history.pushState({ view: activeView, modal: 'lyrics' }, '');
                      }}
                      onSetPipMode={() => {
                        setVideoMode('pip');
                        navigateToView('explore');
                      }}
                      onDownloadTrack={(track) => handleDirectInAppDownload(track)}
                      onSaveToInternalStorage={handleSaveToInternalStorage}
                      accentColorHex={accentColorHex}
                    />
                  )}

                  {activeView === 'equalizer' && (
                    <EqualizerView isPlaying={isPlaying} accentColorHex={accentColorHex} />
                  )}

                  {activeView === 'settings' && (
                    <SettingsView
                      settings={settings}
                      onUpdateSettings={setSettings}
                      accentColorHex={accentColorHex}
                      onOpenAppModal={() => {
                        setIsPwaModalOpen(true);
                        window.history.pushState({ view: activeView, modal: 'pwa' }, '');
                      }}
                    />
                  )}

                  {activeView === 'library' && (
                    <LibraryView
                      localTracks={localTracks}
                      onAddLocalTrack={handleAddLocalTrack}
                      onRemoveLocalTrack={handleRemoveLocalTrack}
                      onPlayTrack={(track, plId, plTracks) => playTrack(track, plId, plTracks)}
                      likedTrackIds={likedTrackIds}
                      onToggleLike={handleToggleLike}
                      playlists={playlists}
                      onCreatePlaylist={handleCreatePlaylist}
                      currentTrackId={currentTrack?.id}
                      accentColorHex={accentColorHex}
                      offlineItems={offlineItems}
                      onRemoveOfflineItem={handleRemoveOfflineItem}
                      youtubeLikedTracks={youtubeLikedTracks}
                      listeningHistory={listeningHistory}
                      theme={activeTheme}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Floating Liquid Glass Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full bg-[#121216]/98 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-2xl flex items-center gap-2 select-none pointer-events-none"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Mini Player Docked Above Tabs */}
        <MobileMiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onOpenFullPlayer={() => {
            setIsMobileSheetOpen(true);
            window.history.pushState({ view: activeView, modal: 'now-playing' }, '');
          }}
          accentColorHex={accentColorHex}
          theme={activeTheme}
        />

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar
          activeView={activeView}
          onSelectView={navigateToView}
          accentColorHex={accentColorHex}
          theme={activeTheme}
        />

        {/* Desktop Floating Player Bar */}
        <div className="hidden md:block shrink-0">
          <FloatingPlayerBar
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            repeatMode={repeatMode}
            isShuffle={isShuffle}
            isLyricsOpen={isLyricsOpen}
            isQueueOpen={isQueueOpen}
            isLiked={currentTrack ? likedTrackIds.has(currentTrack.id) : false}
            onTogglePlay={togglePlay}
            onPrevTrack={handlePrevTrack}
            onNextTrack={handleNextTrack}
            onSeek={handleSeek}
            onVolumeChange={setVolume}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onToggleRepeat={() => {
              setRepeatMode((prev) => {
                if (prev === 'off') return 'all';
                if (prev === 'all') return 'one';
                return 'off';
              });
            }}
            onToggleShuffle={() => setIsShuffle((prev) => !prev)}
            onToggleLyrics={() => {
              setIsLyricsOpen((prev) => {
                const next = !prev;
                if (next) window.history.pushState({ view: activeView, modal: 'lyrics' }, '');
                return next;
              });
            }}
            onToggleQueue={() => {
              setIsQueueOpen((prev) => {
                const next = !prev;
                if (next) window.history.pushState({ view: activeView, modal: 'queue' }, '');
                return next;
              });
            }}
            onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
            onOpenEqualizer={() => navigateToView('equalizer')}
            onOpenVideo={() => navigateToView('video')}
            onOpenDownload={(track: Track) => handleDirectInAppDownload(track)}
            onOpenCredits={setCreditsTrack}
            qualityBadge={qualityBadge}
            isVideoActive={activeView === 'video'}
            hapticFeedback={settings.hapticFeedback}
            accentColorHex={accentColorHex}
            theme={activeTheme}
          />
        </div>
      </div>

      {/* Mobile Fullscreen Now Playing Sheet */}
      <MobileNowPlayingSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        isLiked={currentTrack ? likedTrackIds.has(currentTrack.id) : false}
        onTogglePlay={togglePlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleRepeat={() => {
          setRepeatMode((prev) => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
          });
        }}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
        onOpenEqualizer={() => {
          navigateToView('equalizer');
          setIsMobileSheetOpen(false);
        }}
        onDownloadTrack={(track) => handleDirectInAppDownload(track)}
        accentColorHex={accentColorHex}
        theme={activeTheme}
      />

      {/* Up Next Queue & Infinite Vibe Radio Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        userQueue={userQueue}
        radioQueue={radioQueue}
        historyQueue={listeningHistory}
        autoplayRadio={autoplayRadio}
        onToggleAutoplayRadio={() => setAutoplayRadio((prev) => !prev)}
        onRefreshRadio={() => currentTrack && fetchSimilarVibeTracks(currentTrack)}
        isLoadingRadio={isLoadingRadio}
        currentTrack={currentTrack}
        onPlayTrack={playTrack}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={() => setUserQueue([])}
        onMoveQueueItem={handleMoveQueueItem}
        onOpenCredits={setCreditsTrack}
        accentColorHex={accentColorHex}
        theme={activeTheme}
      />

      {/* Song Credits & Specs Modal */}
      <SongCreditsModal
        isOpen={!!creditsTrack}
        track={creditsTrack}
        onClose={() => setCreditsTrack(null)}
        accentColorHex={accentColorHex}
        theme={activeTheme}
      />

      {/* High Quality Audio & Video Downloader Modal */}
      <DownloadTrackModal
        isOpen={!!downloadTrack}
        track={downloadTrack}
        onClose={() => setDownloadTrack(null)}
        onSaveToInternalStorage={handleSaveToInternalStorage}
        accentColorHex={accentColorHex}
      />

      {/* Native Mobile App & Android APK Modal */}
      <PWAInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        accentColorHex={accentColorHex}
      />

      {/* YouTube Google Sync Modal */}
      <SonnetmdpAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logout}
        accentColorHex={accentColorHex}
        likedCount={youtubeLikedTracks.length}
      />

      {/* Mobile Back Button Toast Indicator */}
      {exitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-neutral-900/90 text-white text-xs font-semibold shadow-2xl border border-white/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          {exitToast}
        </div>
      )}
    </div>
  );
}
