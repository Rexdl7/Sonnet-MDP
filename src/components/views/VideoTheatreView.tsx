import React, { useState, useEffect } from 'react';
import { 
  Film, PictureInPicture2, Play, 
  Sparkles, Music2, Download,
  Youtube, Search, Radio, Compass, Gamepad2, Tv, 
  Cpu, Video, Check, Layers, ExternalLink
} from 'lucide-react';
import { Track, OfflineStoredItem } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { DownloadModal } from '../common/DownloadModal';
import { AmbientArtworkGlowCanvas } from '../player/AmbientArtworkGlowCanvas';
import { CustomScrubber } from '../common/CustomScrubber';

interface VideoTheatreViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  queue: Track[];
  onPlayTrack: (track: Track) => void;
  onOpenLyrics: () => void;
  onSetPipMode: () => void;
  onDownloadTrack?: (track: Track) => void;
  onSaveToInternalStorage?: (item: OfflineStoredItem) => void;
  accentColorHex?: string;
}

export const VideoTheatreView: React.FC<VideoTheatreViewProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime,
  duration,
  onSeek,
  queue,
  onPlayTrack,
  onOpenLyrics,
  onSetPipMode,
  onSaveToInternalStorage,
  accentColorHex = '#FF0000',
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16-9' | '21-9' | '4-3'>('16-9');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [videoResults, setVideoResults] = useState<Track[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'up-next'>('browse');

  const categories = [
    { id: 'trending', label: 'Trending', icon: Compass },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'podcasts', label: 'Podcasts', icon: Tv },
    { id: 'tech', label: 'Tech & AI', icon: Cpu },
    { id: 'music', label: 'Music Videos', icon: Music2 },
    { id: 'anime', label: 'Anime & Shorts', icon: Film },
  ];

  // Resolve YouTube ID
  const youtubeId = currentTrack?.youtubeId || (
    currentTrack?.mediaUrl?.includes('youtube.com') 
      ? new URLSearchParams(new URL(currentTrack.mediaUrl).search).get('v')
      : 'fHI8X4OXluQ'
  );

  const aspectClass = {
    '16-9': 'aspect-video max-w-5xl',
    '21-9': 'aspect-[21/9] max-w-6xl',
    '4-3': 'aspect-[4/3] max-w-3xl',
  }[aspectRatio];

  // Load category videos
  const fetchCategoryVideos = async (cat: string) => {
    setIsLoadingVideos(true);
    try {
      const res = await fetch(`/api/videos/trending?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setVideoResults(data.results);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchCategoryVideos(selectedCategory);
  }, [selectedCategory]);

  // Handle Search for any YouTube video or direct URL
  const handleSearchVideos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoSearchQuery.trim()) return;

    setIsLoadingVideos(true);
    try {
      const res = await fetch(`/api/videos/search?q=${encodeURIComponent(videoSearchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setVideoResults(data.results);
          // If direct URL was pasted, automatically play it
          if (data.results.length === 1 && data.results[0].publishedAt === 'Now') {
            onPlayTrack(data.results[0]);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingVideos(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6 select-none bg-[#030303] text-white pb-36 md:pb-12">
      {/* 1. Header with YouTube Theater Branding & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Youtube className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              YouTube Video Theater
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                All Videos Unlocked
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Watch any YouTube video, gaming stream, podcast, or official music video uninterrupted
            </p>
          </div>
        </div>

        {/* Global Video Search Bar */}
        <form onSubmit={handleSearchVideos} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={videoSearchQuery}
            onChange={(e) => setVideoSearchQuery(e.target.value)}
            placeholder="Search all YouTube videos or paste YouTube link..."
            className="w-full pl-9 pr-20 py-2 rounded-full bg-[#1c1c1c] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-[11px] font-bold text-white transition-all"
          >
            Search
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSetPipMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#212121] hover:bg-[#303030] border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            title="Pop out into floating Picture-in-Picture window"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Mini Player</span>
          </button>

          <button
            onClick={onOpenLyrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#212121] hover:bg-[#303030] border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95"
          >
            <Music2 className="w-3.5 h-3.5 text-slate-300" />
            <span>Lyrics</span>
          </button>
        </div>
      </div>

      {/* 2. Main Theater Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Player Canvas & Video Actions (2 cols on desktop) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Responsive YouTube Embed Player Canvas with Ambient Audio Glow */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <AmbientArtworkGlowCanvas
                thumbnailUrl={currentTrack?.thumbnailUrl}
                isPlaying={isPlaying}
                accentColorHex={accentColorHex}
                className="w-full h-full scale-110"
                glowScale={1.6}
              />
            </div>

            <div className={`relative z-10 w-full mx-auto rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 transition-all duration-300 ${aspectClass}`}>
              <iframe
                key={youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                title={currentTrack?.title || 'YouTube Video'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Custom Video Progress Scrubber */}
            <div className="mt-2 px-1">
              <CustomScrubber
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
                accentColorHex="#FF0000"
                trackBgColor="rgba(255, 255, 255, 0.15)"
                trackHeight="normal"
                showTimeTooltips={true}
              />
            </div>
          </div>

          {/* Under-Video Details & Download Bar */}
          <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-bold text-white truncate">
                {currentTrack?.title || 'No Media Selected'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-white font-medium">{currentTrack?.artist || 'YouTube Creator'}</span>
                {currentTrack?.viewCount && (
                  <>
                    <span>&bull;</span>
                    <span className="text-slate-400">{currentTrack.viewCount}</span>
                  </>
                )}
                <span>&bull;</span>
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5 fill-current" /> YouTube Video
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Download in Any Quality Button */}
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                title="Download in Any Quality (4K, 1080p, 720p, 480p, 320k Audio, Lossless WAV)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Media</span>
              </button>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-[#212121] border border-white/10 text-xs">
                {(['16-9', '21-9', '4-3'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-white text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Pills for Video Theater */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" />
                Browse YouTube Categories
              </h3>
              <span className="text-[11px] text-slate-500">Live Feeds</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-white text-black shadow-md'
                        : 'bg-[#1c1c1c] hover:bg-[#282828] text-slate-300 border border-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Video Browser & Up Next */}
        <div className="space-y-3">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#121212] border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'browse'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Browse Videos ({videoResults.length})
            </button>
            <button
              onClick={() => setActiveTab('up-next')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'up-next'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Up Next Queue ({queue.length})
            </button>
          </div>

          {/* Videos Scroll List */}
          <div className="rounded-3xl bg-[#121212] border border-white/10 p-3 max-h-[620px] overflow-y-auto space-y-2">
            {activeTab === 'browse' ? (
              isLoadingVideos ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading YouTube videos...</p>
                </div>
              ) : videoResults.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <Film className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No videos found for this search.</p>
                </div>
              ) : (
                videoResults.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => onPlayTrack(video)}
                    className="flex items-center gap-3 p-2 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-transparent hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="relative w-24 h-14 rounded-xl overflow-hidden shrink-0 bg-black">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                        {formatTime(video.duration)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {video.artist}
                      </p>
                      {video.viewCount && (
                        <p className="text-[10px] text-slate-500">
                          {video.viewCount}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : (
              queue.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Queue is empty.</p>
                  <p className="text-[11px] text-slate-500">Click any video in Browse to add or play!</p>
                </div>
              ) : (
                queue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-3 p-2 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-transparent hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="relative w-20 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Download in Any Quality Modal */}
      {currentTrack && (
        <DownloadModal
          track={currentTrack}
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onSaveToInternalStorage={onSaveToInternalStorage}
          accentColorHex={accentColorHex}
        />
      )}
    </div>
  );
};
