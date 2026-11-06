import React, { useRef, useState } from 'react';
import { Track, Playlist, OfflineStoredItem } from '../../types/media';
import { INITIAL_TRACKS } from '../../data/curatedTracks';
import { formatTime } from '../../utils/lyricsParser';
import { 
  FolderPlus, Upload, Music, Heart, Plus, 
  Trash2, Play, HardDrive, Disc, Check, Sparkles, Film, Download
} from 'lucide-react';

interface LibraryViewProps {
  localTracks: Track[];
  onAddLocalTrack: (track: Track) => void;
  onRemoveLocalTrack: (trackId: string) => void;
  onPlayTrack: (track: Track) => void;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  playlists: Playlist[];
  onCreatePlaylist: (title: string, description: string) => void;
  currentTrackId?: string;
  accentColorHex?: string;
  offlineItems?: OfflineStoredItem[];
  onRemoveOfflineItem?: (id: string) => void;
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
  currentTrackId,
  accentColorHex = '#FA2D48',
  offlineItems = [],
  onRemoveOfflineItem,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'favorites' | 'playlists' | 'downloads'>('all');
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

  const allTracks = [...INITIAL_TRACKS, ...localTracks];
  const likedTracks = allTracks.filter((t) => likedTrackIds.has(t.id));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-6 select-none pb-36 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-[#FA2D48]" style={{ color: accentColorHex }} />
            Audio Library & Playlists
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Import personal audio files with instant hardware decoding, or curate custom playlists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewPlaylistModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-2 border border-white/10 shadow-sm"
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
            <Upload className="w-4 h-4" />
            <span>Import Audio Files</span>
          </button>
        </div>
      </div>

      {/* Frosted Glass Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-3xl p-6 md:p-8 text-center transition-all flex flex-col items-center justify-center backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${
          isDragging
            ? 'scale-[1.01]'
            : 'border-white/15 hover:border-white/30 bg-slate-900/40'
        }`}
        style={{
          borderColor: isDragging ? accentColorHex : undefined,
          backgroundColor: isDragging ? `${accentColorHex}15` : undefined,
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-[#FA2D48] shadow-inner"
          style={{ color: accentColorHex }}
        >
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">
          Drop audio files here to import
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Supports MP3, FLAC, WAV, AAC, and OGG with zero cloud uploads. Plays 100% locally through hardware DSP.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: `All Audio (${allTracks.length})` },
          { id: 'local', label: `Imported Local (${localTracks.length})` },
          { id: 'favorites', label: `Loved Tracks (${likedTracks.length})` },
          { id: 'playlists', label: `Playlists (${playlists.length})` },
          { id: 'downloads', label: `In-App Downloads (${offlineItems.length})` },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'text-white shadow-md font-bold'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
              style={{
                backgroundColor: isSelected ? accentColorHex : undefined,
                boxShadow: isSelected ? `0 4px 14px ${accentColorHex}40` : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Playlists Grid View */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="group p-4 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all flex flex-col justify-between"
            >
              <div>
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-full aspect-square rounded-2xl object-cover mb-3 shadow-md border border-white/10"
                />
                <h4 className="text-sm font-bold text-white truncate">{pl.title || pl.name || 'Playlist'}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pl.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-4 pt-2 border-t border-white/5">
                <span>{(pl.trackIds || pl.tracks || []).length} tracks</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  {pl.isCustom ? 'Custom Mix' : 'Curated'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Track List */}
      {activeTab !== 'playlists' && (
        <div className="space-y-1.5 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {(() => {
            const listToDisplay =
              activeTab === 'local'
                ? localTracks
                : activeTab === 'favorites'
                ? likedTracks
                : allTracks;

            if (listToDisplay.length === 0) {
              return (
                <div className="py-16 text-center text-slate-500">
                  <Music className="w-12 h-12 mx-auto mb-2 text-slate-600 stroke-1" />
                  <p className="text-sm font-medium text-slate-300">No tracks in this view</p>
                  <p className="text-xs mt-1">Import local audio files or heart any song from explore.</p>
                </div>
              );
            }

            return listToDisplay.map((track, idx) => {
              const isPlayingCurrent = currentTrackId === track.id;
              const isLiked = likedTrackIds.has(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`group flex items-center justify-between gap-3.5 p-3 rounded-2xl transition-all cursor-pointer border ${
                    isPlayingCurrent
                      ? 'border-white/20 shadow-md'
                      : 'bg-white/[0.01] hover:bg-white/[0.06] border-transparent'
                  }`}
                  style={{
                    backgroundColor: isPlayingCurrent ? `${accentColorHex}15` : undefined,
                    borderColor: isPlayingCurrent ? `${accentColorHex}40` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-mono tabular-nums text-slate-500 shrink-0">
                      {idx + 1}
                    </span>

                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 border border-white/10"
                    />

                    <div className="min-w-0 flex-1">
                      <h4
                        className="text-xs sm:text-sm font-semibold truncate text-white"
                        style={{ color: isPlayingCurrent ? accentColorHex : undefined }}
                      >
                        {track.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="truncate">{track.artist}</span>
                        <span>·</span>
                        <span className="truncate text-slate-500">{track.album}</span>
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
              <Download className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No offline downloads saved yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                In the Video Theater or while playing any song, click "Download Media" and choose "In-App Offline Storage" to save videos and songs for offline playback without internet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-2 pb-1">
                <span>Stored Media ({offlineItems.length} items)</span>
                <span>Storage: ~{(offlineItems.reduce((acc, i) => acc + (i.sizeBytes || 10000000), 0) / (1024 * 1024)).toFixed(0)} MB IndexedDB</span>
              </div>
              {offlineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          const track: Track = {
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
                          onPlayTrack(track);
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-5 h-5 text-white fill-white" />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-red-400">
                          {item.mediaType.toUpperCase()} ({item.quality.toUpperCase()})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTime(item.duration)}
                    </span>
                    {onRemoveOfflineItem && (
                      <button
                        onClick={() => onRemoveOfflineItem(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove offline copy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
