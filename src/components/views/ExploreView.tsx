import React, { useState, useEffect } from 'react';
import { Track, Playlist, ActiveView, UserAuthProfile } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  Play, Sparkles, Heart, Radio, 
  Film, Youtube, Plus,
  Sliders, Shuffle, RefreshCw,
  TrendingUp, Compass, Flame, Music, Activity
} from 'lucide-react';
import { generateYouTubeMusicRecommendations, RecommendationResult } from '../../services/youtubeOAuthService';
import { motion, AnimatePresence } from 'framer-motion';

interface ExploreViewProps {
  onPlayTrack: (track: Track) => void;
  onOpenLyrics: (track: Track) => void;
  onSelectPlaylist?: (playlist: Playlist) => void;
  onDownloadTrack?: (track: Track) => void;
  onOpenVideo?: (track: Track) => void;
  onOpenCredits?: (track: Track) => void;
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
  // SimpMusic Moods & Moments categories
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

  // Surface colors
  const isLight = theme?.category === 'light';
  const bgColor = theme?.colors.bg || (isLight ? '#F8FAFC' : '#141416');
  const surfaceColor = theme?.colors.surface || (isLight ? '#FFFFFF' : '#1E1E23');
  const surfaceHover = theme?.colors.surfaceHover || (isLight ? '#F1F5F9' : '#28282F');
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#F2EFE9');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#A09D96');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)');
  const copperAccent = theme?.colors.accent || '#D97736';

  // SimpMusic Moods & Moments list
  const simpMoods = [
    { id: 'all', label: 'For You', icon: Sparkles },
    { id: 'energize', label: 'Energize', icon: Flame },
    { id: 'workout', label: 'Workout', icon: Activity },
    { id: 'relax', label: 'Relax', icon: Compass },
    { id: 'focus', label: 'Focus', icon: Music },
    { id: 'commute', label: 'Commute', icon: Compass },
    { id: 'party', label: 'Party', icon: Flame },
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
          .then((d) => d.results || [])
          .catch(() => []);

        // Fetch Personalized Recommendations
        const recsPromise = generateYouTubeMusicRecommendations(youtubeLikedTracks);

        const [charts, recs] = await Promise.all([chartsPromise, recsPromise]);

        if (isMounted) {
          if (charts.length > 0) {
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
        if (isMounted && data.results) {
          setMoodTracks(data.results);
        }
      })
      .catch((err) => console.warn('Failed to load mood tracks:', err))
      .finally(() => {
        if (isMounted) setIsLoadingMood(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMood]);

  // Determine hero track
  const heroTrack: Track | null = currentTrack || (
    recommendations.quickPicks.length > 0 
      ? recommendations.quickPicks[0] 
      : (chartTracks.length > 0 ? chartTracks[0] : null)
  );

  return (
    <div 
      className="h-full overflow-y-auto px-4 md:px-8 py-6 space-y-8 select-none transition-colors duration-300 font-sans"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* 1. SimpMusic Moods & Moments Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {simpMoods.map((chip) => {
          const isSelected = selectedMood === chip.id;
          const Icon = chip.icon;
          return (
            <motion.button
              key={chip.id}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(chip.id)}
              className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: isSelected ? copperAccent : surfaceColor,
                color: isSelected ? '#FFFFFF' : textMuted,
                borderWidth: '1px',
                borderColor: isSelected ? copperAccent : borderColor,
                boxShadow: isSelected ? `0 4px 14px ${copperAccent}35` : undefined,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* 2. Mood Station View (When a specific Mood is active) */}
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
                <h2 className="text-lg font-bold tracking-tight capitalize" style={{ color: textColor }}>
                  {selectedMood} Radio & Station
                </h2>
                <p className="text-xs" style={{ color: textMuted }}>
                  Continuous high-fidelity streaming curated for your {selectedMood} vibe
                </p>
              </div>
              {moodTracks.length > 0 && (
                <button
                  onClick={() => onPlayTrack(moodTracks[0])}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2 shadow-md active:scale-95 transition-all"
                  style={{ backgroundColor: copperAccent }}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play {selectedMood} Radio</span>
                </button>
              )}
            </div>

            {isLoadingMood ? (
              <div className="flex items-center justify-center py-12 text-xs" style={{ color: textMuted }}>
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                <span>Tuning {selectedMood} station...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {moodTracks.slice(0, 12).map((track, idx) => {
                  const isPlayingThis = currentTrackId === track.id;
                  return (
                    <motion.div
                      key={`${track.id}-${idx}`}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onPlayTrack(track)}
                      className="p-3 rounded-2xl border transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                      style={{
                        backgroundColor: surfaceColor,
                        borderColor: isPlayingThis ? copperAccent : borderColor,
                      }}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                        <img
                          src={track.thumbnailUrl}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div 
                          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                            isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                          }`}
                          style={{ backgroundColor: copperAccent }}
                        >
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold truncate" style={{ color: isPlayingThis ? copperAccent : textColor }}>
                          {track.title}
                        </h4>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                          {track.artist}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 3. Hero Spotlight Banner (SimpMusic Style Squircle & Ambient Lighting) */}
      {selectedMood === 'all' && heroTrack && (
        <div 
          className="relative rounded-3xl overflow-hidden border shadow-xl transition-all" 
          style={{ backgroundColor: surfaceColor, borderColor }}
        >
          {/* Ambient Lighting Gradient */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 blur-2xl"
            style={{
              background: `radial-gradient(circle at top left, ${copperAccent}35 0%, transparent 70%)`
            }}
          />

          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
            <div className="flex items-center gap-5 sm:gap-6 min-w-0">
              <div 
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg border" 
                style={{ borderColor }}
              >
                <img
                  src={heroTrack.thumbnailUrl}
                  alt={heroTrack.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => onPlayTrack(heroTrack)}
                >
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: copperAccent }}
                  >
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                  <span className="font-semibold text-white/90">SimpMusic Spotlight</span>
                  <span aria-hidden="true">&bull;</span>
                  <span style={{ color: copperAccent }} className="font-medium">
                    {heroTrack.genre || 'Infinite Vibe'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate" style={{ color: textColor }}>
                  {heroTrack.title}
                </h1>

                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: textMuted }}>
                  {heroTrack.artist} {heroTrack.album ? `· ${heroTrack.album}` : ''}
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onPlayTrack(heroTrack)}
                    className="px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                    style={{ backgroundColor: copperAccent }}
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Radio</span>
                  </button>

                  {onOpenVideo && (
                    <button
                      onClick={() => onOpenVideo(heroTrack)}
                      className="px-4 py-2.5 rounded-full font-medium text-xs flex items-center gap-1.5 border active:scale-95 transition-all"
                      style={{ backgroundColor: surfaceColor, borderColor, color: textColor }}
                    >
                      <Film className="w-3.5 h-3.5" style={{ color: copperAccent }} />
                      <span>Watch</span>
                    </button>
                  )}

                  <button
                    onClick={() => onToggleLike(heroTrack.id)}
                    className="p-2.5 rounded-full border transition-all"
                    style={{
                      backgroundColor: likedTrackIds.has(heroTrack.id) ? `${copperAccent}20` : surfaceColor,
                      borderColor: likedTrackIds.has(heroTrack.id) ? `${copperAccent}50` : borderColor,
                      color: likedTrackIds.has(heroTrack.id) ? copperAccent : textMuted,
                    }}
                    title="Like Song"
                  >
                    <Heart className={`w-4 h-4 ${likedTrackIds.has(heroTrack.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-2 text-right shrink-0">
              <span 
                className="text-xs font-mono px-3 py-1 rounded-full border font-semibold"
                style={{
                  backgroundColor: `${copperAccent}15`,
                  color: copperAccent,
                  borderColor: `${copperAccent}30`,
                }}
              >
                100% Ad-Free Open Source
              </span>
              <button
                onClick={() => onSwitchView('equalizer')}
                className="text-xs font-medium flex items-center gap-1.5 transition-colors hover:text-white"
                style={{ color: textMuted }}
              >
                <Sliders className="w-3.5 h-3.5" style={{ color: copperAccent }} />
                <span>10-Band Studio Equalizer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SimpMusic "Quick Picks" (4x2 Dynamic Grid) */}
      {selectedMood === 'all' && recommendations.quickPicks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>
                Quick Picks
              </h2>
              <p className="text-xs" style={{ color: textMuted }}>
                Start a radio station or jump back into tracks tailored to your listening habits
              </p>
            </div>
            <span className="text-xs font-mono font-medium" style={{ color: textMuted }}>YouTube Music Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendations.quickPicks.slice(0, 8).map((track) => {
              const isPlayingThis = currentTrackId === track.id;
              return (
                <motion.div
                  key={track.id}
                  whileHover={{ y: -2, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer group shadow-sm"
                  style={{
                    backgroundColor: surfaceColor,
                    borderColor: isPlayingThis ? copperAccent : borderColor,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 relative">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold truncate" style={{ color: isPlayingThis ? copperAccent : textColor }}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="p-2 transition-colors hover:scale-110 active:scale-95"
                      style={{ color: likedTrackIds.has(track.id) ? copperAccent : textMuted }}
                      title="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedTrackIds.has(track.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SimpMusic "Top Charts & Trending" */}
      {selectedMood === 'all' && chartTracks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: `${copperAccent}20` }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: copperAccent }} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>
                  Top Charts
                </h2>
                <p className="text-xs" style={{ color: textMuted }}>
                  Most played tracks and breakout global hits this week
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium" style={{ color: copperAccent }}>Top 100</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {chartTracks.slice(0, 6).map((track, idx) => {
              const isPlayingThis = currentTrackId === track.id;
              return (
                <motion.div
                  key={`chart-${track.id}-${idx}`}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPlayTrack(track)}
                  className="p-3 rounded-2xl border transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                  style={{
                    backgroundColor: surfaceColor,
                    borderColor: isPlayingThis ? copperAccent : borderColor,
                  }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-extrabold text-white font-mono shadow">
                      #{idx + 1}
                    </div>
                    <div 
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                        isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                      }`}
                      style={{ backgroundColor: copperAccent }}
                    >
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold truncate" style={{ color: isPlayingThis ? copperAccent : textColor }}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                      {track.artist}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. SimpMusic "Similar to [Artist]" Shelf */}
      {selectedMood === 'all' && recommendations.similarToTopArtist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>
                Similar to {recommendations.similarToTopArtist.artistName}
              </h2>
              <p className="text-xs" style={{ color: textMuted }}>
                Endless radio station shaped by this artist's discography and groove
              </p>
            </div>
            <button
              onClick={() => {
                if (recommendations.similarToTopArtist?.tracks[0]) {
                  onPlayTrack(recommendations.similarToTopArtist.tracks[0]);
                }
              }}
              className="text-xs font-semibold flex items-center gap-1.5 transition-colors hover:brightness-125"
              style={{ color: copperAccent }}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Start Station</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {recommendations.similarToTopArtist.tracks.map((track, idx) => {
              const isPlayingThis = currentTrackId === track.id;
              return (
                <div
                  key={`sim-${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="group relative p-3 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between hover:scale-[1.02]"
                  style={{
                    backgroundColor: surfaceColor,
                    borderColor: isPlayingThis ? copperAccent : borderColor,
                  }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div 
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                        isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                      }`}
                      style={{ backgroundColor: copperAccent }}
                    >
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="mt-2 min-w-0">
                    <h4 className="text-xs font-semibold truncate" style={{ color: textColor }}>
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
        </div>
      )}

      {/* 7. SimpMusic "My Supermix" */}
      {selectedMood === 'all' && recommendations.supermix.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>My Supermix</h2>
              <p className="text-xs" style={{ color: textMuted }}>
                An endless blend combining your favorite discoveries and fresh songs
              </p>
            </div>
            <button
              onClick={() => onPlayTrack(recommendations.supermix[0])}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              style={{ backgroundColor: copperAccent }}
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle Supermix</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {recommendations.supermix.slice(0, 4).map((track, i) => (
              <div
                key={`mix-${track.id}-${i}`}
                onClick={() => onPlayTrack(track)}
                className="p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-sm flex flex-col justify-between hover:scale-[1.02]"
                style={{ backgroundColor: surfaceColor, borderColor }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div 
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold truncate" style={{ color: textColor }}>{track.title}</h4>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
