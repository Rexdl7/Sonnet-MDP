import React, { useState } from 'react';
import { ActiveView, Track, UserAuthProfile } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { SonnetLogo } from '../common/SonnetLogo';
import { GoogleAuthButton } from '../common/GoogleAuthButton';
import { INITIAL_TRACKS } from '../../data/curatedTracks';
import { 
  Search, Mic2, ListMusic, Maximize, Settings, 
  X, ChevronLeft, ChevronRight, Film, Youtube, Disc3,
  Smartphone, Play
} from 'lucide-react';

interface MacOSWindowHeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  currentTrack: Track | null;
  onToggleLyrics: () => void;
  isLyricsOpen: boolean;
  onToggleQueue: () => void;
  isQueueOpen?: boolean;
  queueCount: number;
  accentColorHex?: string;
  theme?: ThemeConfig;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  onOpenAppModal?: () => void;
  user?: UserAuthProfile | null;
  authLoading?: boolean;
  onLogin?: () => Promise<any>;
  onLogout?: () => Promise<void>;
  likedCount?: number;
}

export const MacOSWindowHeader: React.FC<MacOSWindowHeaderProps> = ({
  activeView,
  onSelectView,
  currentTrack,
  onToggleLyrics,
  isLyricsOpen,
  onToggleQueue,
  isQueueOpen,
  queueCount,
  accentColorHex = '#D97736',
  theme,
  searchQuery = '',
  onSearchChange,
  tracks = INITIAL_TRACKS,
  onPlayTrack,
  onOpenAppModal,
  user = null,
  authLoading = false,
  onLogin,
  onLogout,
  likedCount = 0,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const themeId = theme?.id || 'youtube-music';
  const isLight = theme?.category === 'light';

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleSearchInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
      if (activeView !== 'search' && val.trim().length > 0) {
        onSelectView('search');
      }
    }
  };

  const matchingTracks = searchQuery.trim().length > 0
    ? tracks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <header 
      className="h-14 px-3 md:px-6 flex items-center justify-between shrink-0 select-none z-30 transition-colors duration-300 relative"
      style={{
        backgroundColor: theme?.colors.surface || 'rgba(15, 23, 42, 0.7)',
        borderColor: theme?.colors.border || 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: '1px',
        color: theme?.colors.text || '#FFFFFF',
      }}
    >
      {/* Left: Brand Identity / Nav Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sonnet Brand Logo & Platform Title */}
        <div 
          onClick={() => {
            if (onSearchChange) onSearchChange('');
            onSelectView('explore');
          }}
          className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all"
          title="Return to Homepage (sonnetmdp)"
        >
          <SonnetLogo size={28} glow={themeId === 'youtube-music' || themeId === 'red-black'} />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-tight" style={{ color: theme?.colors.text || '#FFFFFF' }}>
              Sonnet
            </span>
            {themeId === 'youtube-music' ? (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white tracking-wider uppercase shadow-sm">
                Music
              </span>
            ) : themeId === 'spotify' ? (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white tracking-wider uppercase shadow-sm">
                Studio
              </span>
            ) : (
              <span className="text-[10px] font-semibold tracking-wide text-slate-400">
                Player
              </span>
            )}
          </div>
        </div>

        {/* Spotify / Browser Back/Forward Nav buttons */}
        {themeId === 'spotify' && (
          <div className="hidden lg:flex items-center gap-1 ml-4">
            <button
              onClick={() => onSelectView('explore')}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectView('search')}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Sleek Unified Search Bar with Instant Autocomplete Dropdown */}
      <div className="flex-1 max-w-2xl mx-3 md:mx-6 relative">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (activeView !== 'search') {
              onSelectView('search');
            }
          }}
          className="relative flex items-center h-10 rounded-full transition-all duration-200 bg-[#1E1E23] border border-white/10 hover:border-white/20"
          style={{
            borderColor: isSearchFocused ? accentColorHex : undefined,
          }}
        >
          <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
              if (activeView !== 'search' && searchQuery.trim().length > 0) {
                onSelectView('search');
              }
            }}
            onBlur={() => {
              // Delay blur slightly so click on autocomplete dropdown items registers
              setTimeout(() => setIsSearchFocused(false), 200);
            }}
            placeholder="Search songs, albums, artists, podcasts..."
            className="w-full py-2 px-3 text-sm bg-transparent outline-none text-white placeholder-slate-400"
            style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchInput('')}
              className="mr-2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <kbd className="hidden sm:inline-block mr-3 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/10">
            ⌘K
          </kbd>
        </form>

        {/* Instant Live Autocomplete Dropdown with Quick Play Buttons */}
        {isSearchFocused && searchQuery.trim().length > 0 && matchingTracks.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-[#121216]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Instant Quick Play ({matchingTracks.length})
            </div>
            {matchingTracks.map((track) => (
              <div
                key={track.id}
                onMouseDown={() => {
                  if (onPlayTrack) onPlayTrack(track);
                  if (onSearchChange) onSearchChange('');
                  setIsSearchFocused(false);
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <img src={track.thumbnailUrl} alt={track.title} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-900" />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                      {track.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0 shadow-md" style={{ backgroundColor: accentColorHex }}>
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Watch Video Mode Button */}
        <button
          onClick={() => onSelectView('video')}
          className={`hidden sm:flex px-3 py-1.5 rounded-full text-xs font-bold items-center gap-1.5 transition-all ${
            activeView === 'video'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[#212121] hover:bg-[#303030] text-slate-300 hover:text-white border border-white/10'
          }`}
          title="Watch Full YouTube Video"
        >
          <Film className="w-3.5 h-3.5 text-red-500" />
          <span>Videos</span>
        </button>

        {/* Mobile App & APK Install Button */}
        {onOpenAppModal && (
          <button
            onClick={onOpenAppModal}
            className="hidden md:flex px-3 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 bg-[#212121] hover:bg-[#303030] text-slate-200 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Install Mobile App / Download Android APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-red-500" />
            <span>Install App</span>
          </button>
        )}

        {/* Lyrics Button */}
        <button
          onClick={onToggleLyrics}
          className={`hidden md:flex p-2 rounded-xl text-xs items-center gap-1.5 transition-colors ${
            isLyricsOpen
              ? 'text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          style={{
            backgroundColor: isLyricsOpen ? accentColorHex : undefined,
          }}
          title="Karaoke Synchronized Lyrics"
        >
          <Mic2 className="w-4 h-4" />
          <span className="font-medium">Lyrics</span>
        </button>

        {/* Up Next Queue Button */}
        <button
          onClick={onToggleQueue}
          className={`hidden sm:flex p-2 rounded-xl text-xs items-center gap-1.5 transition-colors ${
            isQueueOpen
              ? 'text-white bg-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Up Next Queue"
        >
          <ListMusic className="w-4 h-4" />
          {queueCount > 0 && (
            <span
              className="text-[10px] font-mono tabular-nums text-white px-1.5 py-0.2 rounded-full"
              style={{ backgroundColor: accentColorHex }}
            >
              {queueCount}
            </span>
          )}
        </button>

        {/* Google Cloud Sign-In & Profile */}
        {onLogin && onLogout && (
          <GoogleAuthButton
            user={user}
            loading={authLoading}
            onLogin={onLogin}
            onLogout={onLogout}
            accentColorHex={accentColorHex}
            likedCount={likedCount}
          />
        )}

        {/* Settings Button */}
        <button
          onClick={() => onSelectView('settings')}
          className={`p-2 rounded-xl text-xs transition-colors ${
            activeView === 'settings'
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Theme, Listening Quality & Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
