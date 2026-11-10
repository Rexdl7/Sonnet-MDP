import React, { useRef, useState } from 'react';
import { Track, Playlist, OfflineStoredItem } from '../../types/media';
import { INITIAL_TRACKS } from '../../data/curatedTracks';
import { formatTime } from '../../utils/lyricsParser';
import { ThemeConfig } from '../../utils/themeConfig';
import { 
  FolderPlus, Upload, Music, Heart, Plus, 
  Trash2, Play, HardDrive, Disc, Check, Sparkles, Film, Download, Wifi,
  ArrowLeft, Shuffle, ListMusic, MoreHorizontal
} from 'lucide-react';

interface LibraryViewProps {
  localTracks: Track[];
  onAddLocalTrack: (track: Track) => void;
  onRemoveLocalTrack: (trackId: string) => void;
  onPlayTrack: (track: Track, fromPlaylistId?: string, playlistTracks?: Track[]) => void;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  playlists: Playlist[];
  onCreatePlaylist: (title: string, description: string) => void;
  onRemoveTrackFromPlaylist?: (playlistId: string, trackId: string) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
  currentTrackId?: string;
  accentColorHex?: string;
  offlineItems?: OfflineStoredItem[];
  onRemoveOfflineItem?: (id: string) => void;
  youtubeLikedTracks?: Track[];
  listeningHistory?: Track[];
  theme?: ThemeConfig;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  localTracks,
  onAddLocalTrack,
  onRemoveLocalTrack,
  onPlayTrack,
  likedTrackIds,
  onToggleLike,
  playlists,
  onCreatePlaylist,
  onRemoveTrackFromPlaylist,
  onOpenAddToPlaylist,
  currentTrackId,
  accentColorHex = '#D97736',
  offlineItems = [],
  onRemoveOfflineItem,
  youtubeLikedTracks = [],
  listeningHistory = [],
  theme,
}) => {
  const isLight = theme?.category === 'light';
  const bgColor = theme?.colors.bg || (isLight ? '#F8FAFC' : '#141416');
  const surfaceColor = theme?.colors.surface || (isLight ? '#FFFFFF' : '#1E1E23');
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#F2EFE9');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#A09D96');
  const borderColor = theme?.colors.border || (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'liked' | 'history' | 'local' | 'playlists' | 'downloads'>('all');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistModal, setNewPlaylistModal] = useState<boolean>(false);
  const [playlistTitle, setPlaylistTitle] = useState<string>('');
  const [playlistDesc, setPlaylistDesc] = useState<string>('');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobUrl = URL.createObjectURL(file);

      const newTrack: Track = {
        id: `local-${Date.now()}-${i}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Audio File',
        album: 'Local Music Library',
        duration: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        source: 'local',
        mediaUrl: blobUrl,
        genre: 'Local Audio',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        year: 2026,
      };

      onAddLocalTrack(newTrack);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim()) return;
    onCreatePlaylist(playlistTitle.trim(), playlistDesc.trim());
    setPlaylistTitle('');
    setPlaylistDesc('');
    setNewPlaylistModal(false);
  };

  // Aggregate all tracks cleanly
  const combinedMap = new Map<string, Track>();
  [...youtubeLikedTracks, ...listeningHistory, ...localTracks].forEach((t) => {
    if (t && t.id && !combinedMap.has(t.id)) {
      combinedMap.set(t.id, t);
    }
  });
  const allTracks = Array.from(combinedMap.values());

  // Aggregate liked tracks (from YouTube API sync and in-app likes)
  const likedMap = new Map<string, Track>();
  youtubeLikedTracks.forEach((t) => likedMap.set(t.id, t));
  allTracks.filter((t) => likedTrackIds.has(t.id)).forEach((t) => likedMap.set(t.id, t));
  const likedTracks = Array.from(likedMap.values());

  return (
    <div 
      className="h-full overflow-y-auto p-4 md:p-8 space-y-6 select-none pb-36 md:pb-12 font-sans transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: textColor }}>
            <HardDrive className="w-6 h-6" style={{ color: accentColorHex }} />
            Your Music Library
          </h1>
          <p className="text-xs mt-0.5" style={{ color: textMuted }}>
            Your synced YouTube Music liked tracks, listening history, custom playlists, and local files.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewPlaylistModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: surfaceColor, borderColor, color: textColor }}
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a,.aac"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
            style={{
              backgroundColor: accentColorHex,
              boxShadow: `0 4px 14px ${accentColorHex}40`,
            }}
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Import Audio Files</span>
          </button>
        </div>
      </div>

      {/* Offline Status Summary Card */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-3xl p-5 bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Offline Playback Ready</h4>
              <p className="text-xs text-slate-400 mt-0.5">{Math.min(offlineItems.length, 10)} / 10 tracks cached for offline use</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
            {Math.min(offlineItems.length, 10)} / 10
          </div>
        </div>
      </div>

      {/* Frosted Glass Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed rounded-3xl p-6 md:p-8 text-center transition-all flex flex-col items-center justify-center shadow-sm"
        style={{
          borderColor: isDragging ? accentColorHex : borderColor,
          backgroundColor: isDragging ? `${accentColorHex}15` : surfaceColor,
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner"
          style={{ backgroundColor: `${accentColorHex}15`, color: accentColorHex }}
        >
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: textColor }}>
          Drop audio files here to import
        </h3>
        <p className="text-xs mt-1 max-w-md" style={{ color: textMuted }}>
          Supports MP3, FLAC, WAV, AAC, and OGG with zero cloud uploads. Plays 100% locally through hardware DSP.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: `All Music (${allTracks.length})` },
          { id: 'liked', label: `Liked Songs (${likedTracks.length})` },
          { id: 'history', label: `Listening History (${listeningHistory.length})` },
          { id: 'local', label: `Local Files (${localTracks.length})` },
          { id: 'playlists', label: `Playlists (${playlists.length})` },
          { id: 'downloads', label: `Downloads (${offlineItems.length})` },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
              style={{
                backgroundColor: isSelected ? accentColorHex : surfaceColor,
                color: isSelected ? '#FFFFFF' : textMuted,
                borderColor: isSelected ? accentColorHex : borderColor,
                boxShadow: isSelected ? `0 4px 14px ${accentColorHex}40` : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Playlists View (Grid or Detailed) */}
      {activeTab === 'playlists' && (
        <>
          {selectedPlaylist ? (
            // Playlist Detailed View
            (() => {
              // Get current live version of the selected playlist from playlists state
              const pl = playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;
              const playlistTracks: Track[] = pl.tracks && pl.tracks.length > 0
                ? pl.tracks
                : (pl.trackIds || [])
                    .map((id) => allTracks.find((t) => t.id === id) || INITIAL_TRACKS.find((t) => t.id === id))
                    .filter((t): t is Track => !!t);

              const totalDuration = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

              const handlePlayAll = () => {
                if (playlistTracks.length > 0) {
                  onPlayTrack(playlistTracks[0], pl.id, playlistTracks);
                }
              };

              const handleShuffle = () => {
                if (playlistTracks.length > 0) {
                  const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                  onPlayTrack(shuffled[0], pl.id, shuffled);
                }
              };

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Back button */}
                  <button
                    onClick={() => setSelectedPlaylist(null)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-white/10 transition-colors w-fit"
                    style={{ color: textMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Playlists</span>
                  </button>

                  {/* Playlist Header Card */}
                  <div 
                    className="p-6 rounded-3xl border flex flex-col md:flex-row items-center md:items-end gap-6 shadow-xl relative overflow-hidden backdrop-blur-2xl"
                    style={{ backgroundColor: surfaceColor, borderColor }}
                  >
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl shrink-0 border border-white/15"
                    />

                    <div className="space-y-3 flex-1 min-w-0 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                          {pl.isCustom ? 'Custom Playlist' : 'Curated Mix'}
                        </span>
                        <span className="text-xs font-mono" style={{ color: textMuted }}>
                          {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate" style={{ color: textColor }}>
                        {pl.title || pl.name || 'Untitled Playlist'}
                      </h2>

                      {pl.description && (
                        <p className="text-xs sm:text-sm line-clamp-2 max-w-xl" style={{ color: textMuted }}>
                          {pl.description}
                        </p>
                      )}

                      <div className="text-xs font-mono" style={{ color: textMuted }}>
                        Total Time: {formatTime(totalDuration)}
                      </div>

                      {/* Play & Shuffle Action Buttons (Apple HIG Style) */}
                      <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                        <button
                          onClick={handlePlayAll}
                          disabled={playlistTracks.length === 0}
                          className="px-6 py-2.5 rounded-full font-bold text-xs text-white shadow-lg flex items-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                          style={{ backgroundColor: accentColorHex }}
                        >
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                          <span>Play</span>
                        </button>

                        <button
                          onClick={handleShuffle}
                          disabled={playlistTracks.length === 0}
                          className="px-6 py-2.5 rounded-full font-bold text-xs border flex items-center gap-2 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40"
                          style={{ borderColor, color: textColor }}
                        >
                          <Shuffle className="w-4 h-4" />
                          <span>Shuffle</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Playlist Tracks Table */}
                  <div className="space-y-1.5 border rounded-3xl p-3 shadow-sm" style={{ backgroundColor: surfaceColor, borderColor }}>
                    {playlistTracks.length === 0 ? (
                      <div className="py-16 text-center space-y-2" style={{ color: textMuted }}>
                        <ListMusic className="w-12 h-12 mx-auto stroke-1" style={{ color: textMuted }} />
                        <p className="text-sm font-semibold" style={{ color: textColor }}>Playlist is empty</p>
                        <p className="text-xs max-w-md mx-auto">
                          Search any song and tap the "Add to Playlist" action to save tracks here.
                        </p>
                      </div>
                    ) : (
                      playlistTracks.map((track, idx) => {
                        const isCurrent = currentTrackId === track.id;
                        const isLiked = likedTrackIds.has(track.id);

                        return (
                          <div
                            key={`${track.id}-${idx}`}
                            onClick={() => onPlayTrack(track, pl.id, playlistTracks)}
                            className="group flex items-center justify-between gap-3.5 p-3 rounded-2xl transition-all cursor-pointer border hover:border-white/20"
                            style={{
                              backgroundColor: isCurrent ? `${accentColorHex}15` : 'transparent',
                              borderColor: isCurrent ? `${accentColorHex}40` : 'transparent',
                            }}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <span className="w-6 text-center text-xs font-mono tabular-nums shrink-0" style={{ color: textMuted }}>
                                {idx + 1}
                              </span>

                              <img
                                src={track.thumbnailUrl}
                                alt={track.title}
                                className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 border"
                                style={{ borderColor }}
                              />

                              <div className="min-w-0 flex-1">
                                <h4
                                  className="text-xs sm:text-sm font-semibold truncate"
                                  style={{ color: isCurrent ? accentColorHex : textColor }}
                                >
                                  {track.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                                  <span className="truncate">{track.artist}</span>
                                  <span>·</span>
                                  <span className="truncate">{track.album}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleLike(track.id);
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                                title={isLiked ? 'Unlike' : 'Like'}
                              >
                                <Heart
                                  className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
                                  style={{ color: isLiked ? accentColorHex : undefined }}
                                />
                              </button>

                              {onRemoveTrackFromPlaylist && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTrackFromPlaylist(pl.id, track.id);
                                  }}
                                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                                  title="Remove from Playlist"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}

                              <span className="text-xs font-mono tabular-nums text-slate-500 w-12 text-right">
                                {track.duration > 0 ? formatTime(track.duration) : '--:--'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            // Playlists Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="group p-4 rounded-3xl border shadow-sm transition-all flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:border-white/30"
                  style={{ backgroundColor: surfaceColor, borderColor }}
                >
                  <div className="relative">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-full aspect-square rounded-2xl object-cover mb-3 shadow-md border"
                      style={{ borderColor }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity mb-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: accentColorHex }}
                      >
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold truncate group-hover:text-red-400 transition-colors" style={{ color: textColor }}>
                      {pl.title || pl.name || 'Playlist'}
                    </h4>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: textMuted }}>{pl.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono mt-4 pt-2 border-t" style={{ borderColor, color: textMuted }}>
                    <span>{(pl.trackIds || pl.tracks || []).length} tracks</span>
                    <span className="text-[10px] uppercase tracking-wider">
                      {pl.isCustom ? 'Custom Mix' : 'Curated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Track List */}
      {activeTab !== 'playlists' && (
        <div className="space-y-1.5 border rounded-3xl p-3 shadow-sm" style={{ backgroundColor: surfaceColor, borderColor }}>
            {(() => {
              const listToDisplay =
                activeTab === 'local'
                  ? localTracks
                  : activeTab === 'liked'
                  ? likedTracks
                  : activeTab === 'history'
                  ? listeningHistory
                  : allTracks;

              if (listToDisplay.length === 0) {
                return (
                  <div className="py-16 text-center" style={{ color: textMuted }}>
                    <Music className="w-12 h-12 mx-auto mb-2 stroke-1" style={{ color: textMuted }} />
                    <p className="text-sm font-medium" style={{ color: textColor }}>No tracks in this view</p>
                    <p className="text-xs mt-1">Search any song or connect your Google account to sync your YouTube Music library.</p>
                  </div>
                );
              }

              return listToDisplay.map((track, idx) => {
                const isPlayingCurrent = currentTrackId === track.id;
                const isLiked = likedTrackIds.has(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track, activeTab, listToDisplay)}
                    className="group flex items-center justify-between gap-3.5 p-3 rounded-2xl transition-all cursor-pointer border"
                    style={{
                      backgroundColor: isPlayingCurrent ? `${accentColorHex}15` : 'transparent',
                      borderColor: isPlayingCurrent ? `${accentColorHex}40` : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="w-6 text-center text-xs font-mono tabular-nums shrink-0" style={{ color: textMuted }}>
                        {idx + 1}
                      </span>

                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 border"
                        style={{ borderColor }}
                      />

                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-xs sm:text-sm font-semibold truncate"
                          style={{ color: isPlayingCurrent ? accentColorHex : textColor }}
                        >
                          {track.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                          <span className="truncate">{track.artist}</span>
                          <span>·</span>
                          <span className="truncate">{track.album}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(track.id);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
                          style={{ color: isLiked ? accentColorHex : undefined }}
                        />
                      </button>

                      {track.source === 'local' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLocalTrack(track.id);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                          title="Remove Local File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <span className="text-xs font-mono tabular-nums text-slate-500 w-12 text-right">
                        {track.duration > 0 ? formatTime(track.duration) : '--:--'}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
      )}

      {/* In-App Offline Downloads View */}
      {activeTab === 'downloads' && (
        <div className="space-y-3">
          {offlineItems.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-3 bg-white/5 rounded-3xl border border-white/5 p-8">
              <Download className="w-12 h-12 mx-auto text-red-500" />
              <p className="text-sm font-semibold text-slate-300">No offline downloads saved yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap Download on any track or video to store it directly in this tab for instant offline playback without internet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Stored Offline Tracks ({offlineItems.length})</span>
                  <button
                    onClick={() => {
                      if (offlineItems.length > 0) {
                        const firstTrack: Track = {
                          id: offlineItems[0].id,
                          youtubeId: offlineItems[0].youtubeId,
                          title: offlineItems[0].title,
                          artist: offlineItems[0].artist,
                          album: 'Offline Downloads',
                          duration: offlineItems[0].duration,
                          thumbnailUrl: offlineItems[0].thumbnailUrl,
                          source: 'youtube',
                          mediaUrl: offlineItems[0].blobUrl || `https://www.youtube.com/watch?v=${offlineItems[0].youtubeId}`,
                          videoUrl: `https://www.youtube.com/embed/${offlineItems[0].youtubeId}`,
                        };
                        onPlayTrack(firstTrack);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-all shadow active:scale-95 ml-2"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Play All</span>
                  </button>
                </div>
                <span className="font-mono text-[10px]">
                  ~{(offlineItems.reduce((acc, i) => acc + (i.sizeBytes || 10000000), 0) / (1024 * 1024)).toFixed(0)} MB In-App Cache
                </span>
              </div>

              {offlineItems.map((item) => {
                const trackToPlay: Track = {
                  id: item.id,
                  youtubeId: item.youtubeId,
                  title: item.title,
                  artist: item.artist,
                  album: 'Offline Downloads',
                  duration: item.duration,
                  thumbnailUrl: item.thumbnailUrl,
                  source: 'youtube',
                  mediaUrl: item.blobUrl || `https://www.youtube.com/watch?v=${item.youtubeId}`,
                  videoUrl: `https://www.youtube.com/embed/${item.youtubeId}`,
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => onPlayTrack(trackToPlay)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 hover:border-red-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            OFFLINE READY ✓
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatTime(item.duration)}
                      </span>
                      {onRemoveOfflineItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveOfflineItem(item.id);
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove offline copy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New Playlist Modal */}
      {newPlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-3xl">
            <h3 className="text-base font-bold text-white">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Night Ambient"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  style={{ borderColor: accentColorHex }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your playlist..."
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPlaylistModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg"
                  style={{ backgroundColor: accentColorHex }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
