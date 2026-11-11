import React, { useState, useEffect } from 'react';
import { Track, Playlist, ActiveView, UserAuthProfile } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  Play, Sparkles, Heart, Radio, 
  Film, Youtube, Plus, ListPlus,
  Sliders, Shuffle, RefreshCw,
  TrendingUp, Compass, Flame, Music, Activity,
  Bell, History, Settings, Check
} from 'lucide-react';
import { generateYouTubeMusicRecommendations, RecommendationResult } from '../../services/youtubeOAuthService';
import { motion, AnimatePresence } from 'framer-motion';
import { getSystemLocale, getGreeting, DICTIONARY } from '../../utils/i18n';

interface ExploreViewProps {
  onPlayTrack: (track: Track) => void;
  onOpenLyrics: (track: Track) => void;
  onSelectPlaylist?: (playlist: Playlist) => void;
  onDownloadTrack?: (track: Track) => void;
  onOpenVideo?: (track: Track) => void;
  onOpenCredits?: (track: Track) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
  currentTrack?: Track | null;
  currentTrackId?: string;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  onSwitchView: (view: ActiveView) => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
  smartShuffle?: boolean;
  onToggleSmartShuffle?: () => void;
  user?: UserAuthProfile | null;
  historyQueue?: Track[];
  youtubeLikedTracks?: Track[];
  isYouTubeSynced?: boolean;
  onOpenAuthModal?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onPlayTrack,
  onOpenLyrics,
  onSelectPlaylist,
  onDownloadTrack,
  onOpenVideo,
  onOpenCredits,
  onOpenAddToPlaylist,
  currentTrack,
  currentTrackId,
  likedTrackIds,
  onToggleLike,
  onSwitchView,
  accentColorHex = '#D97736',
  theme,
  user,
  historyQueue = [],
  youtubeLikedTracks = [],
  isYouTubeSynced = false,
  onOpenAuthModal,
}) => {
  const locale = getSystemLocale();
  const dict = DICTIONARY[locale];
  const greetingText = getGreeting(locale, user?.displayName || undefined);

  // SimpMusic Moods & Moments categories matching reference
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [moodTracks, setMoodTracks] = useState<Track[]>([]);
  const [isLoadingMood, setIsLoadingMood] = useState<boolean>(false);
  
  // Charts & Recommendations
  const [chartTracks, setChartTracks] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult>({
    quickPicks: [],
    similarToTopArtist: null,
    supermix: [],
  });
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  // Surface colors: Pure pitch-black AMOLED matching SimpMusic reference
  const isLight = theme?.category === 'light';
  const bgColor = isLight ? '#F8FAFC' : '#000000';
  const surfaceColor = isLight ? '#FFFFFF' : '#0F0F12';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#9E9E9E');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)');
  const copperAccent = theme?.colors.accent || '#D97736';

  // SimpMusic Moods chips matching screenshot (Tất cả, Thư giãn, Dễ ngủ, Nạp năng lượng, etc.)
  const simpMoods = [
    { id: 'all', label: dict.chipAll },
    { id: 'relax', label: dict.chipRelax },
    { id: 'sleep', label: dict.chipSleep },
    { id: 'energize', label: dict.chipEnergize },
    { id: 'workout', label: dict.chipWorkout },
    { id: 'focus', label: dict.chipFocus },
    { id: 'party', label: dict.chipParty },
  ];

  // 1. Initial Load: Fetch Charts & Algorithmic Recommendations
  useEffect(() => {
    let isMounted = true;
    if (recommendations.quickPicks.length === 0) {
      setIsLoadingRecs(true);
    }

    const loadDiscoveryData = async () => {
      try {
        // Fetch Global Charts
        const chartsPromise = fetch('/api/music/trending?category=charts')
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .then((d) => {
            const raw = d?.results;
            return Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.results)
              ? raw.results
              : [];
          })
          .catch(() => []);

        // Fetch Personalized Recommendations
        const recsPromise = generateYouTubeMusicRecommendations(youtubeLikedTracks);

        const [charts, recs] = await Promise.all([chartsPromise, recsPromise]);

        if (isMounted) {
          if (Array.isArray(charts) && charts.length > 0) {
            setChartTracks(charts);
          }
          if (recs.quickPicks.length > 0) {
            setRecommendations(recs);
          } else if (charts.length > 0) {
            // Cold start fallback
            setRecommendations({
              quickPicks: charts.slice(0, 8),
              similarToTopArtist: {
                artistName: 'Global Hitmakers',
                tracks: charts.slice(8, 14),
              },
              supermix: charts.slice(0, 10).sort(() => Math.random() - 0.5),
            });
          }
        }
      } catch (err) {
        console.warn('SimpMusic discovery load notice:', err);
      } finally {
        if (isMounted) {
          setIsLoadingRecs(false);
        }
      }
    };

    loadDiscoveryData();

    return () => {
      isMounted = false;
    };
  }, [youtubeLikedTracks]);

  // 2. Fetch specific Mood tracks when a SimpMusic mood is selected
  useEffect(() => {
    if (selectedMood === 'all') {
      setMoodTracks([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMood(true);

    fetch(`/api/music/trending?category=${selectedMood}`)
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => {
        if (isMounted) {
          // Normalize data.results: handle either Track[] directly or searchYouTube { results: Track[] }
          const raw = data?.results;
          const items = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.results)
            ? raw.results
            : [];
          setMoodTracks(items);
        }
      })
      .catch((err) => {
        console.warn('Failed to load mood tracks:', err);
        if (isMounted) setMoodTracks([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMood(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMood]);

  // Tracks for the Listen Again (Nghe lại) shelf: prioritize historyQueue or chart tracks
  const listenAgainTracks = (historyQueue && historyQueue.length > 0)
    ? historyQueue.slice(0, 6)
    : chartTracks.slice(0, 6);

  return (
    <div 
      className="h-full overflow-y-auto px-4 md:px-7 py-4 space-y-6 select-none transition-colors duration-300 font-sans pb-32"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* --------------------------------------------------------------------------
          TOP APP BAR (Sonnetmdp Studio title + Greeting + Bell, History, Settings icons)
          -------------------------------------------------------------------------- */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: textColor }}>
            Sonnetmdp
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 font-mono uppercase">
              Natural Studio
            </span>
          </h1>
          <p className="text-xs font-normal mt-0.5" style={{ color: textMuted }}>
            {greetingText}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Notification Bell */}
          <button
            onClick={() => onSwitchView('explore')}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={dict.notifications}
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* History */}
          <button
            onClick={() => onSwitchView('library')}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={dict.history}
          >
            <History className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => onSwitchView('settings')}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={dict.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prominent Google Sign-In Banner for Mobile & Web Users */}
      {!user && onOpenAuthModal && (
        <div className="relative z-20 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/90 via-[#1C1215] to-[#121218] border border-red-500/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/30">
              <Youtube className="w-6 h-6 fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Connect YouTube Music</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono tracking-wider">
                  Google Auth
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                Sync real liked songs, artist radios, and listening history with 1 tap.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl active:scale-95 transition-all shrink-0 touch-manipulation cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------------
          1. MOODS & MOMENTS FILTER CAPSULES (With Checkmark on Active Chip)
          -------------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {simpMoods.map((chip) => {
          const isSelected = selectedMood === chip.id;
          return (
            <motion.button
              key={chip.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(chip.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border"
              style={{
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#FFFFFF' : textMuted,
                borderColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{chip.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------------
          MOOD STATION VIEW (When a specific mood is active)
          -------------------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {selectedMood !== 'all' ? (
          <motion.div
            key={selectedMood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {dict.quickPickEyebrow}
                </span>
                <h2 className="text-lg font-bold tracking-tight capitalize" style={{ color: textColor }}>
                  {selectedMood} Station
                </h2>
              </div>
              {moodTracks.length > 0 && (
                <button
                  onClick={() => onPlayTrack(moodTracks[0])}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-2 shadow-md active:scale-95 transition-all"
                  style={{ backgroundColor: copperAccent }}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{dict.startStation}</span>
                </button>
              )}
            </div>

            {isLoadingMood ? (
              <div className="flex items-center justify-center py-12 text-xs" style={{ color: textMuted }}>
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                <span>Loading {selectedMood} station...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {moodTracks.slice(0, 8).map((track, idx) => {
                  const isPlayingThis = currentTrackId === track.id;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlayTrack(track)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover shadow shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold truncate" style={{ color: isPlayingThis ? copperAccent : textColor }}>
                          {track.title}
                        </h4>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------
          2. START A RADIO / QUICK PICK STATIONS (BẮT ĐẦU MỘT BÀI PHÁT / Chọn nhanh đài phát)
          4-item vertical stack matching the reference screenshot exactly
          -------------------------------------------------------------------------- */}
      {selectedMood === 'all' && recommendations.quickPicks.length > 0 && (
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              {dict.quickPickEyebrow}
            </span>
            <h2 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: textColor }}>
              {dict.quickPickTitle}
            </h2>
          </div>

          <div className="space-y-2">
            {recommendations.quickPicks.slice(0, 4).map((track) => {
              const isPlayingThis = currentTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/5 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-900 shadow">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 
                        className="text-xs md:text-sm font-bold truncate leading-snug" 
                        style={{ color: isPlayingThis ? copperAccent : textColor }}
                      >
                        {track.title}
                      </h4>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onOpenAddToPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddToPlaylist(track);
                        }}
                        className="p-2 transition-colors hover:scale-110 active:scale-95 text-slate-400 hover:text-white"
                        title="Add to Playlist"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="p-2 transition-colors hover:scale-110 active:scale-95"
                      style={{ color: likedTrackIds.has(track.id) ? copperAccent : textMuted }}
                      title="Like Song"
                    >
                      <Heart className={`w-4 h-4 ${likedTrackIds.has(track.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------
          3. LISTEN AGAIN (Nghe lại) with user avatar chip & large cards
          Matching the screenshot's user avatar + "Nghe lại" header & horizontal cards
          -------------------------------------------------------------------------- */}
      {selectedMood === 'all' && listenAgainTracks.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* User profile row & section title */}
          <div className="flex items-center gap-2.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-neutral-800 border border-white/10"
              >
                {(user?.displayName || 'M')[0].toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 block leading-none">
                {user?.displayName ? user.displayName.toUpperCase() : 'SONNETMDP'}
              </span>
              <h2 className="text-base md:text-lg font-bold tracking-tight leading-snug" style={{ color: textColor }}>
                {dict.listenAgain}
              </h2>
            </div>
          </div>

          {/* Horizontal scroll shelf with large cards + tags */}
          <div className="flex items-start gap-3.5 overflow-x-auto pb-2 no-scrollbar">
            {listenAgainTracks.map((track, idx) => {
              const isPlayingThis = currentTrackId === track.id;
              const isVideo = track.mediaCategory === 'video' || idx % 2 === 1;

              return (
                <div
                  key={`again-${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="w-36 sm:w-44 shrink-0 cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-md mb-2">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* Tag badge (Album / Video) */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold uppercase text-white tracking-wider">
                      {isVideo ? dict.videoTag : dict.albumTag}
                    </div>

                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: copperAccent }}
                      >
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <h4 
                    className="text-xs font-bold truncate leading-snug"
                    style={{ color: isPlayingThis ? copperAccent : textColor }}
                  >
                    {track.title}
                  </h4>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------
          4. RECOMMENDED MUSIC VIDEOS (Video nhạc đề xuất)
          -------------------------------------------------------------------------- */}
      {selectedMood === 'all' && chartTracks.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold tracking-tight" style={{ color: textColor }}>
              {dict.recommendedVideos}
            </h2>
            <span className="text-xs font-mono font-medium text-slate-400">YouTube</span>
          </div>

          <div className="flex items-start gap-3.5 overflow-x-auto pb-2 no-scrollbar">
            {chartTracks.slice(0, 6).map((track, idx) => (
              <div
                key={`vid-${track.id}-${idx}`}
                onClick={() => (onOpenVideo ? onOpenVideo(track) : onPlayTrack(track))}
                className="w-48 sm:w-56 shrink-0 cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-md mb-2">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: copperAccent }}
                    >
                      <Film className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold truncate leading-snug" style={{ color: textColor }}>
                  {track.title}
                </h4>
                <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------
          5. TOP CHARTS & SUPERMIX
          -------------------------------------------------------------------------- */}
      {selectedMood === 'all' && recommendations.supermix.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold tracking-tight" style={{ color: textColor }}>
              {dict.supermix}
            </h2>
            <button
              onClick={() => onPlayTrack(recommendations.supermix[0])}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              style={{ backgroundColor: copperAccent }}
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recommendations.supermix.slice(0, 4).map((track, i) => (
              <div
                key={`super-${track.id}-${i}`}
                onClick={() => onPlayTrack(track)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-900 mb-2">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-xs font-bold truncate" style={{ color: textColor }}>{track.title}</h4>
                <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>{track.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
