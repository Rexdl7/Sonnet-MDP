import React, { useState, useEffect } from 'react';
import { Track, Playlist, ActiveView } from '../../types/media';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../../data/curatedTracks';
import { formatTime } from '../../utils/lyricsParser';
import { 
  Play, Sparkles, Flame, Heart, Radio, 
  Music, Download, Film, Youtube, Plus, Compass,
  TrendingUp, Headphones, Sliders, Disc3, Shuffle,
  Volume2, RefreshCw, Zap
} from 'lucide-react';

interface ExploreViewProps {
  onPlayTrack: (track: Track) => void;
  onOpenLyrics: (track: Track) => void;
  onSelectPlaylist?: (playlist: Playlist) => void;
  onDownloadTrack?: (track: Track) => void;
  onOpenVideo?: (track: Track) => void;
  currentTrack?: Track | null;
  currentTrackId?: string;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  onSwitchView: (view: ActiveView) => void;
  accentColorHex?: string;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onPlayTrack,
  onOpenLyrics,
  onSelectPlaylist,
  onDownloadTrack,
  onOpenVideo,
  currentTrack,
  currentTrackId,
  likedTrackIds,
  onToggleLike,
  onSwitchView,
  accentColorHex = '#FF0000',
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [selectedTrendingCategory, setSelectedTrendingCategory] = useState<string>('charts');
  
  // Location and country-specific chart state
  const [userCountry, setUserCountry] = useState<{ code: string; name: string; flag: string }>(() => {
    try {
      const saved = localStorage.getItem('sonnet_music_country');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { code: 'GLOBAL', name: 'Global', flag: '🌐' };
  });
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState<boolean>(false);

  const [trendingTracks, setTrendingTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(false);
  const [aiRecommendations, setAiRecommendations] = useState<Track[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [recentTracks, setRecentTracks] = useState<Track[]>(INITIAL_TRACKS.slice(0, 6));

  const moodChips = ['All', 'Chill', 'Workout', 'Focus', 'Late Night', 'Party', 'Romance', 'Gaming'];
  const trendingCategories = [
    { id: 'charts', label: 'Top 50 Charts' },
    { id: 'viral', label: 'Viral TikTok Hits' },
    { id: 'hiphop', label: 'Hip-Hop Hotlist' },
    { id: 'pop', label: 'Pop Anthems' },
    { id: 'electronic', label: 'EDM & Dance' },
    { id: 'lofi', label: 'Lo-Fi Chill Beats' },
    { id: 'rock', label: 'Rock & Alternative' },
  ];

  const availableCountries = [
    { code: 'GLOBAL', name: 'Global Charts', flag: '🌐' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico & Latin', flag: '🇲🇽' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  ];

  // Auto-detect location on initial load if not set
  useEffect(() => {
    const saved = localStorage.getItem('sonnet_music_country');
    if (saved) return;

    // Detect via server edge headers or browser timezone
    const detectLocation = async () => {
      try {
        const res = await fetch('/api/location/detect');
        if (res.ok) {
          const data = await res.json();
          if (data.countryCode) {
            const detected = {
              code: data.countryCode,
              name: data.countryName || data.countryCode,
              flag: data.flag || '🌐',
            };
            setUserCountry(detected);
            localStorage.setItem('sonnet_music_country', JSON.stringify(detected));
            return;
          }
        }
      } catch {}

      // Fallback: Infer from Intl timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        let matched = { code: 'GLOBAL', name: 'Global Charts', flag: '🌐' };
        if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
          matched = { code: 'IN', name: 'India', flag: '🇮🇳' };
        } else if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) {
          matched = { code: 'US', name: 'United States', flag: '🇺🇸' };
        } else if (tz.includes('London')) {
          matched = { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' };
        } else if (tz.includes('Tokyo')) {
          matched = { code: 'JP', name: 'Japan', flag: '🇯🇵' };
        } else if (tz.includes('Seoul')) {
          matched = { code: 'KR', name: 'South Korea', flag: '🇰🇷' };
        } else if (tz.includes('Sao_Paulo')) {
          matched = { code: 'BR', name: 'Brazil', flag: '🇧🇷' };
        }
        setUserCountry(matched);
        localStorage.setItem('sonnet_music_country', JSON.stringify(matched));
      } catch {}
    };

    detectLocation();
  }, []);

  const heroTrack = currentTrack || trendingTracks[0] || INITIAL_TRACKS[0];

  // Fetch Trending YouTube Music tracks by category & country
  const fetchTrendingTracks = async (category: string, countryCode?: string) => {
    setIsLoadingTrending(true);
    const countryToUse = countryCode || userCountry.code;
    try {
      const res = await fetch(`/api/music/trending?category=${category}&country=${countryToUse}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setTrendingTracks(data.results);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchTrendingTracks(selectedTrendingCategory, userCountry.code);
  }, [selectedTrendingCategory, userCountry.code]);

  // Fetch AI recommendations when current track changes
  useEffect(() => {
    if (!heroTrack) return;
    const fetchAiRecommendations = async () => {
      setIsLoadingAi(true);
      try {
        const res = await fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentTrack: {
              title: heroTrack.title,
              artist: heroTrack.artist,
              genre: heroTrack.genre || 'Popular',
            },
            history: recentTracks.map((t) => `${t.title} - ${t.artist}`),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setAiRecommendations(data.results);
          }
        }
      } catch {
        // fallback
      } finally {
        setIsLoadingAi(false);
      }
    };

    fetchAiRecommendations();
  }, [heroTrack.id, heroTrack.title]);

  // Handle Mood Filter Clicks
  const handleMoodClick = async (mood: string) => {
    setSelectedMood(mood);
    if (mood === 'All') {
      fetchTrendingTracks(selectedTrendingCategory, userCountry.code);
      return;
    }

    setIsLoadingTrending(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(mood + ' vibe ' + userCountry.name + ' hits')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setTrendingTracks(data.results);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const handleSelectCountry = (country: { code: string; name: string; flag: string }) => {
    setUserCountry(country);
    setIsCountryPickerOpen(false);
    localStorage.setItem('sonnet_music_country', JSON.stringify(country));
  };

  return (
    <div className="h-full overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:p-8 space-y-6 md:space-y-8 select-none bg-[#030303] text-white pb-36 md:pb-12">
      {/* 1. Country / Region Selector & Mood Chips Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Mood Chips Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
          {moodChips.map((mood) => {
            const isSelected = selectedMood === mood;
            return (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-[#212121] hover:bg-[#303030] text-slate-300 border border-white/10'
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>

        {/* Location Region Selector Pill */}
        <div className="relative shrink-0 self-start sm:self-center">
          <button
            onClick={() => setIsCountryPickerOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1a1a1a] hover:bg-[#282828] text-slate-200 border border-white/10 transition-colors shadow-sm"
            title="Change music chart country"
          >
            <span className="text-base leading-none">{userCountry.flag}</span>
            <span className="font-bold text-white max-w-[110px] truncate">{userCountry.name}</span>
            <span className="text-[10px] text-slate-400">Charts ▼</span>
          </button>

          {isCountryPickerOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#181818] border border-white/15 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Chart Region
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {availableCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      userCountry.code === c.code
                        ? 'bg-red-600/20 text-white font-bold border border-red-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    {userCountry.code === c.code && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Spotlight Banner (Dynamic Ambient Glow & Responsive Mobile Layout) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-6 md:p-8 border border-white/10 shadow-2xl bg-gradient-to-r from-red-950/40 via-black to-[#121212] group">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColorHex }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-300 bg-neutral-900">
              <img
                src={heroTrack.thumbnailUrl}
                alt={heroTrack.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onPlayTrack(heroTrack)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl text-white transform hover:scale-110 transition-transform"
                  style={{ backgroundColor: accentColorHex }}
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </button>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10 flex items-center gap-1 w-max">
                  <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                  <span>{userCountry.flag} Trending #1</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {userCountry.name} Chart
                </span>
              </div>
              <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white truncate">
                {heroTrack.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1.5 truncate">
                <span className="truncate">{heroTrack.artist}</span>
                <span>&bull;</span>
                <span className="text-slate-400 shrink-0">{heroTrack.genre || 'Trending'}</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-3 pt-1.5 flex-wrap">
                <button
                  onClick={() => onPlayTrack(heroTrack)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs flex items-center gap-2 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  style={{ backgroundColor: accentColorHex }}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Listen Now</span>
                </button>
                {onOpenVideo && (
                  <button
                    onClick={() => onOpenVideo(heroTrack)}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-semibold text-xs flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all"
                  >
                    <Film className="w-3.5 h-3.5 text-red-400" />
                    <span>Watch</span>
                  </button>
                )}
                <button
                  onClick={() => onToggleLike(heroTrack.id)}
                  className={`p-2 sm:p-2.5 rounded-full border transition-all ${
                    likedTrackIds.has(heroTrack.id)
                      ? 'bg-red-600/20 text-red-500 border-red-500/40'
                      : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
                  }`}
                  title="Like Song"
                >
                  <Heart className={`w-3.5 h-3.5 ${likedTrackIds.has(heroTrack.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Audiophile Equalizer & High-Res Audio Badge */}
          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Studio Lossless 24-Bit / 96kHz
            </span>
            <button
              onClick={() => onSwitchView('equalizer')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              <span>Customize 10-Band EQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Spotify Style "Quick Picks / Top Country Hits" 2x3 Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Quick Picks & Top Plays</span>
            <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">Based on {userCountry.name}</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            {userCountry.flag} Top 6
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {(trendingTracks.length > 0 ? trendingTracks.slice(0, 6) : recentTracks).map((track) => {
            const isPlayingThis = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className="flex items-center justify-between p-2 rounded-xl sm:rounded-2xl bg-[#161616] hover:bg-[#222222] border border-white/5 hover:border-white/15 transition-all cursor-pointer group shadow-sm min-h-[56px]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-bold truncate ${
                      isPlayingThis ? 'text-red-500' : 'text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pr-1">
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    style={{ backgroundColor: accentColorHex }}
                  >
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI Recommended Radio (Powered by Gemini AI) */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Continuous AI Radio
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight">
                Recommended For Your Taste
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Continuously tuned by Gemini AI based on vibe: "{heroTrack.title}"
            </p>
          </div>

          <button
            onClick={() => {
              if (aiRecommendations.length > 0) {
                onPlayTrack(aiRecommendations[0]);
              }
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#212121] hover:bg-[#303030] text-slate-200 border border-white/10 active:scale-95 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Play Radio</span>
          </button>
        </div>

        {/* AI Recommendations Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {isLoadingAi && aiRecommendations.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-2.5 sm:p-3 rounded-2xl bg-[#141414] border border-white/5 animate-pulse space-y-2">
                <div className="aspect-square rounded-xl bg-white/10" />
                <div className="h-3 rounded bg-white/10 w-3/4" />
                <div className="h-2.5 rounded bg-white/5 w-1/2" />
              </div>
            ))
          ) : (
            aiRecommendations.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className="p-2.5 sm:p-3 rounded-2xl bg-[#141414] hover:bg-[#202020] border border-white/5 hover:border-white/15 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow-md">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div 
                      className="absolute bottom-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all shadow-xl transform sm:translate-y-2 group-hover:translate-y-0"
                      style={{ backgroundColor: accentColorHex }}
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
                <span className="mt-2 text-[9px] font-semibold text-amber-400/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 truncate block text-center">
                  Vibe Match
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Top Trending from YouTube Music (Country & Category Driven) */}
      <div className="space-y-3 sm:space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight">
              Top Trending in {userCountry.name}
            </h2>
          </div>

          {/* Trending Category Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {trendingCategories.map((cat) => {
              const isSelected = selectedTrendingCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedTrendingCategory(cat.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-[#1a1a1a] hover:bg-[#252525] text-slate-300 border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trending Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {isLoadingTrending ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-2.5 sm:p-3 rounded-2xl bg-[#141414] border border-white/5 animate-pulse space-y-2">
                <div className="aspect-square rounded-xl bg-white/10" />
                <div className="h-3 rounded bg-white/10 w-3/4" />
                <div className="h-2.5 rounded bg-white/5 w-1/2" />
              </div>
            ))
          ) : (
            trendingTracks.slice(0, 18).map((track) => {
              const isPlayingThis = currentTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="p-2.5 sm:p-3 rounded-2xl bg-[#141414] hover:bg-[#202020] border border-white/5 hover:border-white/15 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow-md">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div 
                        className="absolute bottom-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all shadow-xl transform sm:translate-y-2 group-hover:translate-y-0"
                        style={{ backgroundColor: accentColorHex }}
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ml-0.5" />
                      </div>
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/75 text-[9px] font-mono text-white">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate transition-colors ${
                        isPlayingThis ? 'text-red-500' : 'text-white group-hover:text-red-400'
                      }`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-500">
                    <span className="truncate max-w-[80px] sm:max-w-[90px]">{track.genre || 'Trending'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedTrackIds.has(track.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
