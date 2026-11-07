import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../../types/media';
import { INITIAL_TRACKS } from '../../data/curatedTracks';
import { formatTime } from '../../utils/lyricsParser';
import { searchYouTubeMusic } from '../../services/youtubeSearchService';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  Search, Play, Plus, Heart, Mic2, X, Music, 
  Flame, Loader2, Sparkles, Youtube, Film, Download,
  Compass, Zap, Radio, TrendingUp, User, Disc3
} from 'lucide-react';

interface SearchViewProps {
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onOpenLyrics: (track: Track) => void;
  onOpenVideo?: (track: Track) => void;
  onDownloadTrack?: (track: Track) => void;
  onOpenCredits?: (track: Track) => void;
  currentTrackId?: string;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  accentColorHex?: string;
  query?: string;
  onQueryChange?: (q: string) => void;
  theme?: ThemeConfig;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onPlayTrack,
  onAddToQueue,
  onOpenLyrics,
  onOpenVideo,
  onDownloadTrack,
  onOpenCredits,
  currentTrackId,
  likedTrackIds,
  onToggleLike,
  accentColorHex = '#D97736',
  query: externalQuery,
  onQueryChange,
  theme,
}) => {
  const [internalQuery, setInternalQuery] = useState<string>(externalQuery || '');
  const activeQuery = externalQuery !== undefined ? externalQuery : internalQuery;

  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const debounceTimerRef = useRef<any>(null);

  const isLight = theme?.category === 'light';
  const bgColor = theme?.colors.bg || '#030303';
  const surfaceColor = theme?.colors.surface || '#141414';
  const textColor = theme?.colors.text || '#FFFFFF';
  const textMuted = theme?.colors.textMuted || '#94A3B8';
  const borderColor = theme?.colors.border || 'rgba(255,255,255,0.1)';

  // Synchronize internal query when external query changes
  useEffect(() => {
    if (externalQuery !== undefined && externalQuery !== internalQuery) {
      setInternalQuery(externalQuery);
    }
  }, [externalQuery]);

  const setEffectiveQuery = (val: string) => {
    setInternalQuery(val);
    if (onQueryChange) onQueryChange(val);
  };

  const genrePills = [
    { id: 'all', label: 'Trending Charts', query: 'YouTube Music Global Top 50' },
    { id: 'pop', label: 'Pop Anthems', query: 'Top Pop Hits 2026' },
    { id: 'hiphop', label: 'Hip-Hop & Rap', query: 'Hotlist Hip Hop Rap hits' },
    { id: 'rock', label: 'Rock & Alternative', query: 'Best Modern Rock Alternative songs' },
    { id: 'lofi', label: 'Lo-Fi Chill Beats', query: 'Lofi Hip Hop beats to relax study' },
    { id: 'edm', label: 'EDM & Dance', query: 'EDM Festival Dance club hits' },
    { id: 'bollywood', label: 'Bollywood Hits', query: 'Top Bollywood Hindi songs' },
    { id: 'kpop', label: 'K-Pop Top Hits', query: 'K-Pop Top Hits 2026' },
    { id: 'acoustic', label: 'Acoustic Chill', query: 'Acoustic Guitar chill songs' },
    { id: 'synthwave', label: 'Synthwave / Retro', query: 'Synthwave retro 80s chill' },
  ];

  const popularArtists = [
    'Taylor Swift', 'The Weeknd', 'Eminem', 'Drake', 
    'Coldplay', 'Billie Eilish', 'Bruno Mars', 'Ed Sheeran', 
    'Arijit Singh', 'BTS', 'Dua Lipa', 'Post Malone'
  ];

  // Core YouTube Search Function (Uses multi-tier hybrid search service)
  const performSearch = async (searchTerm: string, mode: 'music' | 'video' = 'music') => {
    setIsLoading(true);
    try {
      const results = await searchYouTubeMusic(searchTerm, mode);
      setSearchResults(results.length > 0 ? results : INITIAL_TRACKS);
    } catch (err) {
      console.warn('Search service error, using fallback:', err);
      setSearchResults(INITIAL_TRACKS);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: Fetch real live YouTube music trending list immediately
  useEffect(() => {
    if (!activeQuery.trim()) {
      performSearch('');
    } else {
      performSearch(activeQuery);
    }
  }, []);

  // Debounce user search typing
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(activeQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [activeQuery]);

  // Handle explicit form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    performSearch(activeQuery);
  };

  // Handle Genre Pill click: Searches real YouTube tracks for that genre
  const handleGenreClick = (genreId: string, genreQuery: string) => {
    setActiveCategory(genreId);
    if (genreId === 'all') {
      setEffectiveQuery('');
      performSearch('');
    } else {
      setEffectiveQuery(genreQuery);
      performSearch(genreQuery);
    }
  };

  // Handle Artist chip click: Instant search
  const handleArtistClick = (artist: string) => {
    setEffectiveQuery(artist);
    performSearch(artist);
  };

  return (
    <div 
      className="h-full overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:p-8 space-y-6 select-none pb-36 md:pb-12 transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5" style={{ color: accentColorHex }} />
            Search Any Song on YouTube Music
          </h1>
          <p className="text-xs mt-0.5" style={{ color: textMuted }}>
            Full access to every song, album, artist, remix, and live tour across YouTube.
          </p>
        </div>

        {/* Search Input Bar with Submit Button */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <div className="relative flex items-center">
            {isLoading ? (
              <Loader2
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-red-500"
                style={{ color: accentColorHex }}
              />
            ) : (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
            )}
            <input
              type="text"
              value={activeQuery}
              onChange={(e) => setEffectiveQuery(e.target.value)}
              placeholder="Type any song, artist, album, or lyrics..."
              className="w-full pl-11 pr-24 h-12 rounded-full text-sm outline-none transition-all border"
              style={{
                backgroundColor: surfaceColor,
                borderColor: borderColor,
                color: textColor,
              }}
              autoFocus
            />
            {activeQuery && (
              <button
                type="button"
                onClick={() => {
                  setEffectiveQuery('');
                  performSearch('');
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: textMuted }}
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition-all"
              style={{ backgroundColor: accentColorHex }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Global Artists Quick Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: textMuted }}>
            <User className="w-3.5 h-3.5" style={{ color: accentColorHex }} />
            Popular Artists:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {popularArtists.map((artist) => {
              const isSelected = activeQuery.toLowerCase().includes(artist.toLowerCase());
              return (
                <button
                  key={artist}
                  onClick={() => handleArtistClick(artist)}
                  className="px-3 py-1 rounded-full border text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: isSelected ? accentColorHex : surfaceColor,
                    borderColor: isSelected ? accentColorHex : borderColor,
                    color: isSelected ? '#FFFFFF' : textColor,
                  }}
                >
                  {artist}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Category / Genre Quick Launch Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: textMuted }}>
            <Compass className="w-3.5 h-3.5" style={{ color: accentColorHex }} />
            Explore Genres & Hits:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {genrePills.map((g) => {
              const isSelected = activeCategory === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => handleGenreClick(g.id, g.query)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border"
                  style={{
                    backgroundColor: isSelected ? accentColorHex : surfaceColor,
                    borderColor: isSelected ? accentColorHex : borderColor,
                    color: isSelected ? '#FFFFFF' : textColor,
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor }}>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs font-semibold flex items-center gap-2" style={{ color: textMuted }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: accentColorHex }} />
              Searching all songs on YouTube...
            </span>
          ) : (
            <span className="text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5" style={{ color: textColor }}>
              <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
              {activeQuery ? `Results for "${activeQuery}"` : 'Top Trending on YouTube Music'}
            </span>
          )}
        </div>
        <span className="text-xs font-mono" style={{ color: textMuted }}>
          {searchResults.length} songs available
        </span>
      </div>

      {/* Results Grid */}
      {searchResults.length === 0 && !isLoading ? (
        <div className="py-20 text-center space-y-3 rounded-3xl border p-8" style={{ backgroundColor: surfaceColor, borderColor }}>
          <Music className="w-12 h-12 mx-auto" style={{ color: textMuted }} />
          <h3 className="text-base font-semibold" style={{ color: textColor }}>
            No songs found for "{activeQuery}"
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: textMuted }}>
            Try searching for a different song title, artist, or click one of the popular artists above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {searchResults.map((track) => {
            const isCurrent = currentTrackId === track.id;
            const isLiked = likedTrackIds.has(track.id);

            return (
              <div
                key={track.id}
                className="group relative p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm"
                style={{
                  backgroundColor: surfaceColor,
                  borderColor: isCurrent ? accentColorHex : borderColor,
                }}
              >
                {/* Artwork & Play Overlay */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black shadow-md">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* YouTube Tag */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-semibold text-white/90 flex items-center gap-1 border border-white/10">
                    <Youtube className="w-2.5 h-2.5 text-red-500 fill-red-500" />
                    <span>YouTube</span>
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-white/90 border border-white/10">
                    {formatTime(track.duration)}
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => onPlayTrack(track)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200"
                    aria-label={`Play ${track.title}`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform group-hover:scale-110 active:scale-95"
                      style={{ backgroundColor: accentColorHex }}
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </button>
                </div>

                {/* Track Details */}
                <div className="min-w-0 mb-3 space-y-0.5">
                  <h3 
                    className="text-xs md:text-sm font-bold truncate transition-colors"
                    style={{ color: isCurrent ? accentColorHex : textColor }}
                  >
                    {track.title}
                  </h3>
                  <p className="text-xs truncate" style={{ color: textMuted }}>
                    {track.artist}
                  </p>
                  {track.viewCount && (
                    <p className="text-[10px]" style={{ color: textMuted }}>
                      {track.viewCount}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor }}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleLike(track.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: isLiked ? accentColorHex : textMuted }}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => onAddToQueue(track)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                      style={{ color: textMuted }}
                      title="Add to Up Next Queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenLyrics(track)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                      style={{ color: textMuted }}
                      title="View Lyrics"
                    >
                      <Mic2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenCredits && (
                      <button
                        onClick={() => onOpenCredits(track)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                        style={{ color: textMuted }}
                        title="Song Credits & Specs"
                      >
                        <Disc3 className="w-4 h-4" />
                      </button>
                    )}

                    {onOpenVideo && (
                      <button
                        onClick={() => onOpenVideo(track)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                        style={{ color: textMuted }}
                        title="Watch Full Video"
                      >
                        <Film className="w-4 h-4" />
                      </button>
                    )}

                    {onDownloadTrack && (
                      <button
                        onClick={() => onDownloadTrack(track)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                        style={{ color: textMuted }}
                        title="Download Media (Audio or Video)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

