import React, { useState, useEffect } from 'react';
import { Track, Playlist, ActiveView, UserAuthProfile } from '../../types/media';
import { INITIAL_TRACKS } from '../../data/curatedTracks';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  Play, Sparkles, Heart, Radio, 
  Download, Film, Youtube, Plus,
  Sliders, Disc3, Shuffle, RefreshCw, Info, CheckCircle2,
  Clock, Music2, ExternalLink
} from 'lucide-react';
import { generateYouTubeMusicRecommendations, RecommendationResult } from '../../services/youtubeOAuthService';
import { motion } from 'framer-motion';

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
  smartShuffle = false,
  onToggleSmartShuffle,
  user,
  historyQueue = [],
  youtubeLikedTracks = [],
  isYouTubeSynced = false,
  onOpenAuthModal,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [recommendations, setRecommendations] = useState<RecommendationResult>({
    quickPicks: [],
    similarToTopArtist: null,
    supermix: [],
  });
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  // Natural warm studio colors
  const isLight = theme?.category === 'light';
  const bgColor = theme?.colors.bg || (isLight ? '#F8FAFC' : '#141416');
  const surfaceColor = theme?.colors.surface || (isLight ? '#FFFFFF' : '#1E1E23');
  const surfaceHover = theme?.colors.surfaceHover || (isLight ? '#F1F5F9' : '#28282F');
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#F2EFE9');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#A09D96');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)');
  const copperAccent = theme?.colors.accent || '#D97736';

  // Seed algorithmic YouTube Music recommendations whenever YouTube library is updated
  useEffect(() => {
    let isMounted = true;
    
    // Only show loader if we have absolutely no recommendations yet
    if (recommendations.quickPicks.length === 0) {
      setIsLoadingRecs(true);
    }

    const fetchRecs = async () => {
      try {
        const recs = await generateYouTubeMusicRecommendations(youtubeLikedTracks);
        if (isMounted) {
          // If the recommendation engine returns nothing (cold start), fetch trending songs as a rich fallback
          if (recs.quickPicks.length === 0) {
            const res = await fetch('/api/music/trending?category=charts');
            if (res.ok) {
              const trending = await res.json();
              if (trending.results && trending.results.length > 0) {
                setRecommendations({
                  quickPicks: trending.results.slice(0, 12),
                  similarToTopArtist: {
                    artistName: 'Trending Global',
                    tracks: trending.results.slice(12, 18),
                  },
                  supermix: trending.results.sort(() => Math.random() - 0.5).slice(0, 8),
                });
                return;
              }
            }
          }
          
          if (recs.quickPicks.length > 0) {
            setRecommendations(recs);
          }
        }
      } catch (err) {
        console.warn('Recommendation engine notice:', err);
      } finally {
        if (isMounted) {
          setIsLoadingRecs(false);
        }
      }
    };

    fetchRecs();

    return () => {
      isMounted = false;
    };
  }, [youtubeLikedTracks]);

  // Determine hero track: Prioritize curated daily mixtape or top recommendation
  const heroTrack: Track | null = recommendations.quickPicks.length > 0 
    ? recommendations.quickPicks[0] 
    : (historyQueue.length > 0 ? historyQueue[0] : null);

  const moodChips = [
    'All',
    'Dark Synth & Phonk',
    'Acoustic & Studio',
    'Dark Pop',
    'Indie & Electro',
    'Pop Classics',
    'Ambient & Mixes',
  ];

  // Dynamic Metadata Tag Classifier
  const matchesMoodTag = (track: Track, tag: string): boolean => {
    if (!tag || tag === 'All') return true;
    const text = `${track.title} ${track.artist} ${track.genre || ''} ${track.album || ''}`.toLowerCase();
    if (tag === 'Dark Synth & Phonk') return /synth|phonk|beamglow|villain|dark|cyber|retro/.test(text);
    if (tag === 'Acoustic & Studio') return /acoustic|folk|studio|guitar|bon iver|coldplay|chill/.test(text);
    if (tag === 'Dark Pop') return /dark pop|pop|chris grey|bring me back|rebel|billie|feather/.test(text);
    if (tag === 'Indie & Electro') return /indie|electro|failure|ptasinski|daft punk|lucky/.test(text);
    if (tag === 'Pop Classics') return /christina|aguilera|genie|brooklyn|dua lipa|levitating|pop/.test(text);
    if (tag === 'Ambient & Mixes') return /ambient|ambience|devil|cry|vampiilure|lofi|interstellar|zimmer|soundtrack/.test(text);
    return true;
  };

  const handleTagSelect = (chip: string) => {
    setSelectedMood(chip);
  };

  return (
    <div 
      className="h-full overflow-y-auto px-4 md:px-8 py-6 space-y-8 select-none transition-colors duration-300 font-sans"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* 1. Category & Mood Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {moodChips.map((chip) => {
          const isSelected = selectedMood === chip;
          return (
            <motion.button
              key={chip}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTagSelect(chip)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 shadow-sm"
              style={{
                backgroundColor: isSelected ? copperAccent : surfaceColor,
                color: isSelected ? '#FFFFFF' : textMuted,
                borderWidth: '1px',
                borderColor: isSelected ? copperAccent : borderColor,
              }}
            >
              {chip}
            </motion.button>
          );
        })}
      </div>

      {/* 2. Hero Spotlight or Clean Cold-Start Launcher */}
      {heroTrack ? (
        <div className="relative rounded-3xl overflow-hidden border shadow-lg transition-all" style={{ backgroundColor: surfaceColor, borderColor }}>
          {/* Soft Warm Ambient Lighting Gradient */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(ellipse at top left, ${copperAccent}25 0%, transparent 70%)`
            }}
          />

          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
            <div className="flex items-center gap-5 sm:gap-6 min-w-0">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border" style={{ borderColor }}>
                <img
                  src={heroTrack.thumbnailUrl}
                  alt={heroTrack.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => onPlayTrack(heroTrack)}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: copperAccent }}
                  >
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                  <span>{user ? 'Based on Your YouTube Activity' : 'Featured Track'}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span style={{ color: copperAccent }} className="font-medium">
                    {selectedMood !== 'All' ? selectedMood : (heroTrack.genre || 'Music Station')}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate" style={{ color: textColor }}>
                  {heroTrack.title}
                </h1>

                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: textMuted }}>
                  {heroTrack.artist} {heroTrack.album ? `· ${heroTrack.album}` : ''}
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onPlayTrack(heroTrack)}
                    className="px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                    style={{ backgroundColor: copperAccent }}
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play {selectedMood !== 'All' ? `${selectedMood} Radio` : 'Radio'}</span>
                  </button>

                  {onOpenVideo && (
                    <button
                      onClick={() => onOpenVideo(heroTrack)}
                      className="px-4 py-2.5 rounded-full font-medium text-xs flex items-center gap-1.5 border active:scale-95 transition-all"
                      style={{ backgroundColor: surfaceColor, borderColor, color: textColor }}
                    >
                      <Film className="w-3.5 h-3.5" style={{ color: copperAccent }} />
                      <span>Watch Video</span>
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
                className="text-xs font-mono px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: `${copperAccent}15`,
                  color: copperAccent,
                  borderColor: `${copperAccent}30`,
                }}
              >
                Lossless 24-Bit Studio Audio
              </span>
              <button
                onClick={() => onSwitchView('equalizer')}
                className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ color: textMuted }}
              >
                <Sliders className="w-3.5 h-3.5" style={{ color: copperAccent }} />
                <span>10-Band Studio Equalizer</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Zero-state station launcher when boot without preloaded songs */
        <div 
          className="relative rounded-3xl p-6 sm:p-10 border shadow-lg flex flex-col items-center text-center space-y-6 overflow-hidden"
          style={{ backgroundColor: surfaceColor, borderColor }}
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(circle at center, ${copperAccent}30 0%, transparent 70%)`
            }}
          />

          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg text-white"
            style={{ backgroundColor: copperAccent }}
          >
            <Radio className="w-8 h-8" />
          </div>

          <div className="max-w-lg space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: textColor }}>
              What do you want to listen to?
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: textMuted }}>
              Search any track, start an artist station, or connect your Google account to sync your real YouTube Music library.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl">
            <button
              onClick={() => onSwitchView('search')}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-md active:scale-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: copperAccent }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Search Any Song or Artist</span>
            </button>

            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-5 py-2.5 rounded-full text-xs font-semibold border active:scale-95 transition-all flex items-center gap-2"
                style={{ backgroundColor: surfaceColor, borderColor, color: textColor }}
              >
                <Youtube className="w-4 h-4" style={{ color: copperAccent }} />
                <span>Connect Google YouTube Account</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Real YouTube Connected Shelf: "Listen Again & Liked Songs" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${copperAccent}20` }}
            >
              <Youtube className="w-4 h-4" style={{ color: copperAccent }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>
                  Sonnet Daily Mixtape & Fresh Mixes
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border" style={{ backgroundColor: `${copperAccent}20`, borderColor: `${copperAccent}50`, color: copperAccent }}>
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Generated Daily</span>
                </span>
              </div>
              <p className="text-xs" style={{ color: textMuted }}>
                Fresh algorithmic tracks and trending artist stations tailored to your active mood
              </p>
            </div>
          </div>

          <span className="text-xs font-mono" style={{ color: textMuted }}>
            {selectedMood !== 'All' ? `${selectedMood} Station` : 'Curated Mix'}
          </span>
        </div>

        {/* Display fresh algorithmic recommendations & curated daily mix filtered by selected mood/genre tag */}
        {(() => {
          const rawTracks = recommendations.supermix.length > 0 
            ? recommendations.supermix 
            : historyQueue;

          const filtered = rawTracks.filter((t) => matchesMoodTag(t, selectedMood));
          const displayTracks = filtered.length > 0 ? filtered : rawTracks;

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {displayTracks.slice(0, 6).map((track, idx) => {
                const isPlayingThis = currentTrackId === track.id;
                return (
                  <motion.div
                    key={`${track.id}-${idx}`}
                    whileHover={{ y: -6, scale: 1.04, rotateX: 4, rotateY: -4 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    style={{
                      backgroundColor: surfaceColor,
                      borderColor: isPlayingThis ? copperAccent : borderColor,
                      perspective: 1000,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isPlayingThis && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-0.5 z-10">
                          <motion.span animate={{ height: ['30%', '100%', '40%'] }} transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }} className="w-0.5 h-2.5 bg-red-500 rounded-full" style={{ backgroundColor: copperAccent }} />
                          <motion.span animate={{ height: ['80%', '20%', '90%'] }} transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }} className="w-0.5 h-2.5 bg-red-500 rounded-full" style={{ backgroundColor: copperAccent }} />
                          <motion.span animate={{ height: ['40%', '90%', '30%'] }} transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut' }} className="w-0.5 h-2.5 bg-red-500 rounded-full" style={{ backgroundColor: copperAccent }} />
                        </div>
                      )}
                      <div 
                        className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                          isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                        }`}
                        style={{ backgroundColor: copperAccent }}
                      >
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 min-w-0">
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
          );
        })()}
      </div>

      {/* 4. Algorithmic Shelf: "Quick Picks" (Based on user's real YouTube artists & active mood tag) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>
              {selectedMood !== 'All' ? `${selectedMood} Quick Picks` : 'Quick Picks'}
            </h2>
            <p className="text-xs" style={{ color: textMuted }}>
              Fresh songs and deep cuts from creators matching your active filter
            </p>
          </div>
          <span className="text-xs font-mono" style={{ color: textMuted }}>Algorithmic Radio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(() => {
            const rawPicks = recommendations.quickPicks.length > 0 ? recommendations.quickPicks : historyQueue;
            const filteredPicks = rawPicks.filter((t) => matchesMoodTag(t, selectedMood));
            const displayPicks = filteredPicks.length > 0 ? filteredPicks : rawPicks;

            return displayPicks.slice(0, 6).map((track) => {
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
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 relative">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className="p-2 transition-colors"
                      style={{ color: likedTrackIds.has(track.id) ? copperAccent : textMuted }}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedTrackIds.has(track.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            });
          })()}
        </div>
      </div>

      {/* 5. Algorithmic Shelf: "Similar to [Top Artist]" */}
      {recommendations.similarToTopArtist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>
                Similar to {recommendations.similarToTopArtist.artistName}
              </h2>
              <p className="text-xs" style={{ color: textMuted }}>
                Genre recommendations tailored to your top-streamed creator
              </p>
            </div>
            <span className="text-xs font-mono" style={{ color: textMuted }}>Collaborative Filter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {recommendations.similarToTopArtist.tracks.map((track, idx) => {
              const isPlayingThis = currentTrackId === track.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
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
                  <div className="mt-2.5 min-w-0">
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

      {/* 6. Algorithmic Shelf: "My Supermix" */}
      {recommendations.supermix.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: textColor }}>My Supermix</h2>
              <p className="text-xs" style={{ color: textMuted }}>
                An endless blend combining your favorite YouTube artists and tailored discoveries
              </p>
            </div>
            <button
              onClick={() => onPlayTrack(recommendations.supermix[0])}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
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
                className="p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                style={{ backgroundColor: surfaceColor, borderColor }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 mb-3">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div 
                    className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
