import React, { useState, useEffect, useRef } from 'react';
import { Track, ArtistItem, AlbumItem } from '../../types/media';
import { INITIAL_TRACKS } from '../../data/curatedTracks';
import { formatTime } from '../../utils/lyricsParser';
import { searchYouTubeMusicDetailed } from '../../services/youtubeSearchService';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  Search, Play, Plus, Heart, Mic2, X, Music, 
  Loader2, Sparkles, Youtube, Film, Download,
  Compass, User, Disc3, ListPlus, MoreHorizontal, Check, CheckCircle2, History
} from 'lucide-react';

interface SearchViewProps {
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onOpenLyrics: (track: Track) => void;
  onOpenVideo?: (track: Track) => void;
  onDownloadTrack?: (track: Track) => void;
  onOpenCredits?: (track: Track) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
  currentTrackId?: string;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  accentColorHex?: string;
  query?: string;
  onQueryChange?: (q: string) => void;
  theme?: ThemeConfig;
}

type SearchTab = 'all' | 'songs' | 'artists' | 'albums' | 'videos';

export const SearchView: React.FC<SearchViewProps> = ({
  onPlayTrack,
  onAddToQueue,
  onOpenLyrics,
  onOpenVideo,
  onDownloadTrack,
  onOpenCredits,
  onOpenAddToPlaylist,
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

  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounceTimerRef = useRef<any>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sonnet_recent_searches') || '["The Weeknd", "Coldplay", "Taylor Swift", "Billie Eilish"]');
    } catch {
      return ["The Weeknd", "Coldplay", "Taylor Swift", "Billie Eilish"];
    }
  });

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      localStorage.setItem('sonnet_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('sonnet_recent_searches');
  };

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

  // Core YouTube Search Function supporting detailed categorized responses
  const performSearch = async (searchTerm: string, tab: SearchTab = activeTab) => {
    setIsLoading(true);
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
    }
    try {
      const mode = tab === 'videos' ? 'video' : 'music';
      const data = await searchYouTubeMusicDetailed(searchTerm, mode, tab);
      setSearchResults(data.tracks.length > 0 ? data.tracks : (searchTerm ? [] : INITIAL_TRACKS));
      setArtists(data.artists || []);
      setAlbums(data.albums || []);
    } catch (err) {
      console.warn('Search service error, using fallback:', err);
      setSearchResults(INITIAL_TRACKS);
      setArtists([]);
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    performSearch(activeQuery, activeTab);
  }, []);

  // Debounce user search typing
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(activeQuery, activeTab);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [activeQuery, activeTab]);

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    performSearch(activeQuery, tab);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    performSearch(activeQuery, activeTab);
  };

  const handleGenreClick = (genreId: string, genreQuery: string) => {
    if (genreId === 'all') {
      setEffectiveQuery('');
      performSearch('', activeTab);
    } else {
      setEffectiveQuery(genreQuery);
      performSearch(genreQuery, activeTab);
    }
  };

  const handleArtistClick = (artistName: string) => {
    setEffectiveQuery(artistName);
    performSearch(artistName, activeTab);
  };

  const handleSelectArtistCard = (artist: ArtistItem) => {
    setEffectiveQuery(artist.name);
    setActiveTab('songs');
    performSearch(artist.name, 'songs');
  };

  const handleSelectAlbumCard = (album: AlbumItem) => {
    setEffectiveQuery(`${album.title} ${album.artist}`);
    setActiveTab('songs');
    performSearch(`${album.title} ${album.artist}`, 'songs');
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
            Full access to songs, verified artists, official albums, and music videos.
          </p>
        </div>

        {/* Search Input Bar with Apple HIG aesthetic */}
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
              placeholder="Search songs, artists, albums, or lyrics..."
              className="w-full pl-11 pr-24 h-12 rounded-full text-sm outline-none transition-all border shadow-sm backdrop-blur-xl"
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
                  performSearch('', activeTab);
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

        {/* Recent Searches Bar */}
        {recentSearches.length > 0 && !activeQuery && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: textMuted }}>
                <History className="w-3.5 h-3.5" style={{ color: accentColorHex }} />
                Recent Searches:
              </span>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setEffectiveQuery(term);
                    performSearch(term, activeTab);
                  }}
                  className="px-3 py-1 rounded-full border text-xs font-medium transition-all hover:border-white/30 active:scale-95 flex items-center gap-1.5"
                  style={{ backgroundColor: surfaceColor, borderColor, color: textColor }}
                >
                  <History className="w-3 h-3 opacity-60" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Apple HIG Segmented Filter Tabs: All, Songs, Artists, Albums, Videos */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border max-w-fit shadow-inner bg-black/20 backdrop-blur-md" style={{ borderColor }}>
          {(['all', 'songs', 'artists', 'albums', 'videos'] as SearchTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 select-none"
                style={{
                  backgroundColor: isSelected ? accentColorHex : 'transparent',
                  color: isSelected ? '#FFFFFF' : textMuted,
                  boxShadow: isSelected ? `0 2px 8px ${accentColorHex}40` : undefined,
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

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
            Explore Genres &amp; Hits:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {genrePills.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGenreClick(g.id, g.query)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border hover:border-white/30"
                style={{
                  backgroundColor: surfaceColor,
                  borderColor: borderColor,
                  color: textColor,
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor }}>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs font-semibold flex items-center gap-2" style={{ color: textMuted }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: accentColorHex }} />
              Searching YouTube Music...
            </span>
          ) : (
            <span className="text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5" style={{ color: textColor }}>
              <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
              {activeQuery ? `Results for "${activeQuery}"` : 'Top Trending on YouTube Music'}
            </span>
          )}
        </div>
        <span className="text-xs font-mono" style={{ color: textMuted }}>
          {searchResults.length} {activeTab === 'videos' ? 'videos' : 'songs'}
        </span>
      </div>

      {/* Artists Section (Shown in 'all' and 'artists' tabs) */}
      {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight uppercase text-slate-400 font-mono">
              Artists ({artists.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleSelectArtistCard(artist)}
                className="group p-3 rounded-2xl border text-center transition-all hover:scale-105 cursor-pointer shadow-sm flex flex-col items-center"
                style={{ backgroundColor: surfaceColor, borderColor }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 shadow-md border border-white/10 bg-neutral-800">
                  <img
                    src={artist.thumbnailUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <h4 className="text-xs font-bold truncate max-w-full" style={{ color: textColor }}>
                  {artist.name}
                </h4>
                {artist.subscribers && (
                  <p className="text-[10px] truncate mt-0.5" style={{ color: textMuted }}>
                    {artist.subscribers}
                  </p>
                )}
                <span className="text-[9px] font-bold mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 group-hover:text-white group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all">
                  View Songs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Albums Section (Shown in 'all' and 'albums' tabs) */}
      {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight uppercase text-slate-400 font-mono">
              Albums &amp; Singles ({albums.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => handleSelectAlbumCard(album)}
                className="group p-3 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer shadow-sm flex flex-col"
                style={{ backgroundColor: surfaceColor, borderColor }}
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 shadow-md border border-white/10 bg-neutral-900">
                  <img
                    src={album.thumbnailUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: accentColorHex }}
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-bold truncate" style={{ color: textColor }}>
                  {album.title}
                </h4>
                <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                  {album.artist}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-1 border-t" style={{ borderColor, color: textMuted }}>
                  <span>{album.trackCount ? `${album.trackCount} tracks` : 'Album'}</span>
                  <span>{album.year || '2026'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Songs & Videos Results Grid */}
      {(activeTab === 'all' || activeTab === 'songs' || activeTab === 'videos') && (
        <div className="space-y-3">
          {activeTab === 'all' && (artists.length > 0 || albums.length > 0) && (
            <h3 className="text-sm font-bold tracking-tight uppercase text-slate-400 font-mono">
              Tracks &amp; Audio
            </h3>
          )}

          {searchResults.length === 0 && !isLoading ? (
            <div className="py-20 text-center space-y-3 rounded-3xl border p-8" style={{ backgroundColor: surfaceColor, borderColor }}>
              <Music className="w-12 h-12 mx-auto" style={{ color: textMuted }} />
              <h3 className="text-base font-semibold" style={{ color: textColor }}>
                No {activeTab} found for "{activeQuery}"
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

                    {/* Card Actions with Apple HIG Playlist Sheet trigger */}
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

                        {/* Apple Music Action Sheet Add to Playlist */}
                        {onOpenAddToPlaylist && (
                          <button
                            onClick={() => onOpenAddToPlaylist(track)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                            style={{ color: textMuted }}
                            title="Add to Playlist..."
                          >
                            <ListPlus className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onAddToQueue(track)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ color: textMuted }}
                          title="Add to Up Next Queue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenLyrics(track)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ color: textMuted }}
                          title="View Lyrics"
                        >
                          <Mic2 className="w-4 h-4" />
                        </button>

                        {onOpenCredits && (
                          <button
                            onClick={() => onOpenCredits(track)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                            style={{ color: textMuted }}
                            title="Song Credits &amp; Specs"
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
                            title="Save In-App"
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
      )}
    </div>
  );
};


