import React, { useState, useEffect } from 'react';
import { useYouTubeSearch } from '../../hooks/useYouTubeSearch';
import { 
  Play, Youtube, Search, Radio, Compass, Gamepad2, Tv, 
  Cpu, Video, Check, Download, ThumbsUp, ThumbsDown, Share2, Bookmark,
  PictureInPicture2, Music2, CheckCircle2, ChevronDown, ChevronUp,
  Flame, Film, Newspaper, ArrowLeft, Bell, MessageSquare, MoreVertical,
  Maximize2
} from 'lucide-react';
import { Track, OfflineStoredItem } from '../../types/media';
import { formatTime } from '../../utils/lyricsParser';
import { DownloadModal } from '../common/DownloadModal';

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
  // Mode: 'feed' (browse video grid) vs 'watch' (playing active video)
  const [viewMode, setViewMode] = useState<'feed' | 'watch'>('feed');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [videoResults, setVideoResults] = useState<Track[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(142000);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isDisliked, setIsDisliked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  const [isVideoSearchFocused, setIsVideoSearchFocused] = useState<boolean>(false);
  const { suggestions: liveVideoSuggestions } = useYouTubeSearch(videoSearchQuery);

  const videoQuerySuggestionsList = [
    'Official Music Videos 4K',
    'Synthwave Live Concert',
    'Lofi Beats Stream 24/7',
    'Gaming Highlights 2026',
    'Tech & AI Deep Dive Podcast',
    'Deep Focus Ambience',
    'Chill Cyberpunk Radio',
    'Acoustic Guitar Session'
  ];

  const matchingVideoSuggestions = videoSearchQuery.trim().length > 0
    ? (liveVideoSuggestions.length > 0 ? liveVideoSuggestions : videoQuerySuggestionsList.filter(q => q.toLowerCase().includes(videoSearchQuery.toLowerCase())))
    : videoQuerySuggestionsList.slice(0, 4);

  const categories = [
    { id: 'all', label: 'All', icon: Compass },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'music', label: 'Music Videos', icon: Music2 },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'tech', label: 'Tech & AI', icon: Cpu },
    { id: 'podcasts', label: 'Podcasts', icon: Tv },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  // Resolve active YouTube video ID
  const activeVideoId = currentTrack?.youtubeId || (
    currentTrack?.mediaUrl?.includes('youtube.com') 
      ? new URLSearchParams(new URL(currentTrack.mediaUrl).search).get('v')
      : 'fHI8X4OXluQ'
  );

  // Fetch YouTube video feeds matching selected category
  const fetchCategoryVideos = async (cat: string) => {
    setIsLoadingVideos(true);
    try {
      const res = await fetch(`/api/videos/trending?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        const raw = data?.results;
        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
          ? raw.results
          : [];
        setVideoResults(items);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchCategoryVideos(selectedCategory);
  }, [selectedCategory]);

  // When user clicks a video, switch to 'watch' mode
  const handleSelectVideo = (video: Track) => {
    onPlayTrack(video);
    setViewMode('watch');
  };

  // Handle video search query
  const handleSearchVideos = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery !== undefined ? customQuery : videoSearchQuery;
    if (!queryToUse.trim()) return;

    setIsLoadingVideos(true);
    try {
      const res = await fetch(`/api/videos/search?q=${encodeURIComponent(queryToUse.trim())}`);
      if (res.ok) {
        const data = await res.json();
        const raw = data?.results;
        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
          ? raw.results
          : [];
        if (items.length > 0) {
          setVideoResults(items);
          if (items.length === 1 && items[0].publishedAt === 'Now') {
            handleSelectVideo(items[0]);
          } else {
            setViewMode('feed');
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
    <div className="h-full overflow-y-auto bg-[#0F0F0F] text-white select-none pb-32 font-sans">
      {/* --------------------------------------------------------------------------
          1. SonTube MOBILE & DESKTOP TOP HEADER (Red SonTube Logo + Search + Actions)
          -------------------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md px-2.5 sm:px-4 md:px-6 py-2 flex items-center justify-between border-b border-white/10 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {viewMode === 'watch' && (
            <button
              onClick={() => setViewMode('feed')}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Return to Video Feed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => setViewMode('feed')} 
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Youtube className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-base font-black tracking-tighter text-white font-mono">SonTube</span>
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest font-sans hidden xs:inline">HD</span>
            </div>
          </div>
        </div>

        {/* Centered YouTube Web Search Bar with Live Autocomplete Suggestions */}
        <div className="flex-1 min-w-0 max-w-lg relative mx-1 sm:mx-2">
          <form onSubmit={(e) => handleSearchVideos(e)} className="flex items-center w-full">
            <div className="relative flex-1 min-w-0 flex items-center">
              <input
                type="text"
                value={videoSearchQuery}
                onChange={(e) => setVideoSearchQuery(e.target.value)}
                onFocus={() => setIsVideoSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsVideoSearchFocused(false), 250)}
                placeholder="Search videos..."
                className="w-full pl-3 pr-7 py-1.5 rounded-l-full bg-[#1A1A1A] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
              />
              {videoSearchQuery && (
                <button
                  type="button"
                  onClick={() => setVideoSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-r-full bg-[#272727] hover:bg-[#353535] border border-l-0 border-white/15 text-white transition-all flex items-center justify-center shrink-0"
              title="Search YouTube"
            >
              <Search className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown - full width across mobile screen */}
          {isVideoSearchFocused && matchingVideoSuggestions.length > 0 && (
            <div className="fixed sm:absolute top-14 sm:top-full left-2 right-2 sm:left-0 sm:right-0 mt-1 p-2 rounded-2xl bg-[#181818]/98 backdrop-blur-3xl border border-white/20 shadow-2xl z-50 space-y-1 max-h-72 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Trending Video Searches
              </div>
              {matchingVideoSuggestions.map((suggestionText, idx) => (
                <div
                  key={`v-sug-${idx}`}
                  onMouseDown={() => {
                    setVideoSearchQuery(suggestionText);
                    setIsVideoSearchFocused(false);
                    handleSearchVideos(undefined, suggestionText);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors text-xs text-slate-200 group active:bg-white/15"
                >
                  <Search className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="font-medium group-hover:text-white flex-1 truncate">{suggestionText}</span>
                  <span className="text-[10px] text-slate-500 font-mono opacity-0 sm:opacity-100 transition-opacity">Search &crarr;</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onSetPipMode}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Picture-in-Picture Mini Player"
          >
            <PictureInPicture2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={onOpenLyrics}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Synced Lyrics"
          >
            <Music2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
          </button>
        </div>
      </header>

      {/* --------------------------------------------------------------------------
          VIEW MODE 1: SonTube HOME VIDEO FEED (Full-bleed Mobile / Multi-column Desktop Grid)
          -------------------------------------------------------------------------- */}
      {viewMode === 'feed' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="px-3 md:px-6 pt-3 bg-[#0F0F0F]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 text-xs ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'bg-[#272727] hover:bg-[#3F3F3F] text-slate-200 border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Grid Feed: Full-bleed 1 col on Mobile, 2 cols on Tablet, 3-4 cols on Desktop */}
          <div className="px-3 md:px-6">
            {isLoadingVideos ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-3">
                <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading SonTube feeds...</p>
              </div>
            ) : videoResults.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-3">
                <Film className="w-10 h-10 mx-auto text-slate-600" />
                <p>No videos found. Try searching above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {videoResults.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className="flex flex-col gap-2.5 cursor-pointer group active:scale-[0.99] transition-all"
                  >
                    {/* Widescreen 16:9 Thumbnail with Duration Overlay */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 font-mono text-[10px] font-bold text-white shadow">
                        {formatTime(video.duration)}
                      </span>
                    </div>

                    {/* Video Card Metadata */}
                    <div className="flex items-start gap-3 px-1">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 shrink-0 border border-white/10 overflow-hidden">
                        <img src={video.thumbnailUrl} alt={video.artist} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs md:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          {video.artist}
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 inline shrink-0" />
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {video.viewCount || '1.8M views'} &bull; 2 days ago
                        </p>
                      </div>

                      <button className="p-1 text-slate-400 hover:text-white shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------
          VIEW MODE 2: SonTube MOBILE & DESKTOP WATCH PAGE (Triggered when video selected)
          -------------------------------------------------------------------------- */}
      {viewMode === 'watch' && (
        <div className="max-w-7xl mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2/3 on Desktop): HD Video Player + Channel Subscribe Row + Action Pills + Comments */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pinned 16:9 HD Video Player Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
              <iframe
                key={activeVideoId}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                title={currentTrack?.title || 'SonTube Video'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Title & Metrics */}
            <div>
              <h1 className="text-base md:text-xl font-extrabold text-white leading-snug">
                {currentTrack?.title || 'SonTube Video Stream'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{currentTrack?.viewCount || '2.4M views'}</span>
                <span>&bull;</span>
                <span>2 days ago</span>
              </div>
            </div>

            {/* Channel Subscription Row (Matching YouTube Mobile Redesign) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#1C1C1C] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 overflow-hidden shrink-0">
                  <img
                    src={currentTrack?.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                    alt={currentTrack?.artist || 'Creator'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs md:text-sm font-bold text-white truncate">
                      {currentTrack?.artist || 'SonTube Creator'}
                    </h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">1.82M subscribers</p>
                </div>
              </div>

              {/* Red Subscribe Button */}
              <button
                onClick={() => setIsSubscribed((prev) => !prev)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
                  isSubscribed
                    ? 'bg-[#272727] text-slate-300 hover:bg-[#3F3F3F]'
                    : 'bg-red-600 text-white hover:bg-red-500'
                }`}
              >
                {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </div>

            {/* Action Pill Bar (Like, Dislike, Share, Download, Save) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {/* Like / Dislike Combined Pill */}
              <div className="flex items-center rounded-full bg-[#272727] border border-white/5 overflow-hidden shrink-0">
                <button
                  onClick={() => {
                    setIsLiked((prev) => !prev);
                    setIsDisliked(false);
                    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isLiked ? 'text-red-400 bg-white/10' : 'text-white hover:bg-white/5'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{(likeCount / 1000).toFixed(1)}K</span>
                </button>
                <div className="w-[1px] h-4 bg-white/20" />
                <button
                  onClick={() => {
                    setIsDisliked((prev) => !prev);
                    setIsLiked(false);
                  }}
                  className={`px-3 py-1.5 transition-all ${
                    isDisliked ? 'text-red-400 bg-white/10' : 'text-slate-300 hover:bg-white/5'
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share Pill */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: currentTrack?.title, url: window.location.href }).catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272727] hover:bg-[#3F3F3F] text-xs font-semibold text-white transition-all shrink-0 active:scale-95"
              >
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>Share</span>
              </button>

              {/* Download Pill */}
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272727] hover:bg-[#3F3F3F] text-xs font-semibold text-white transition-all shrink-0 active:scale-95"
              >
                <Download className="w-4 h-4 text-red-400" />
                <span>Download</span>
              </button>

              {/* Save / Bookmark Pill */}
              <button
                onClick={() => setIsSaved((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                  isSaved ? 'bg-red-600 text-white' : 'bg-[#272727] hover:bg-[#3F3F3F] text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Comments Preview Card */}
            <div className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-red-500" />
                  Comments &bull; 1.4K
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  U
                </div>
                <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                  "This 4K video quality and studio sound separation is absolutely top tier! Great release."
                </p>
              </div>
            </div>

            {/* Expandable Description */}
            <div 
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-white/5 cursor-pointer transition-colors space-y-2 text-xs"
            >
              <p className={`text-slate-300 leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                Official HD release on SonTube Theatre. High quality 1080p stream with spatial audio processing and ad-free viewing experience.
              </p>
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <span>{isDescriptionExpanded ? 'Show less' : '...more'}</span>
                {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3 on Desktop): Up Next Recommendations Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Film className="w-4 h-4 text-red-500" />
                Up Next Videos
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Auto Play</span>
            </div>

            <div className="space-y-3 max-h-[780px] overflow-y-auto no-scrollbar">
              {(queue && queue.length > 0 ? queue : videoResults).map((item, idx) => (
                <div
                  key={`up-${item.id}-${idx}`}
                  onClick={() => handleSelectVideo(item)}
                  className="flex gap-2.5 p-1.5 rounded-xl hover:bg-[#272727] cursor-pointer group transition-all"
                >
                  {/* Widescreen 16:9 Thumbnail */}
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-black shrink-0 shadow">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 font-mono text-[9px] font-bold text-white">
                      {formatTime(item.duration)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {item.artist}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {item.viewCount || '850K views'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quality Downloader Modal */}
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
