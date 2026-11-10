import React, { useState } from 'react';
import { Track, Playlist } from '../../types/media';
import { Plus, Check, ListMusic, X, Sparkles, FolderPlus, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApplePlaylistActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onCreatePlaylist: (title: string, description: string) => Playlist | void;
  onAddTrackToPlaylist: (playlistId: string, track: Track) => void;
  accentColorHex?: string;
}

export const ApplePlaylistActionSheet: React.FC<ApplePlaylistActionSheetProps> = ({
  isOpen,
  onClose,
  track,
  playlists,
  onCreatePlaylist,
  onAddTrackToPlaylist,
  accentColorHex = '#FA2D48',
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [addedPlaylistId, setAddedPlaylistId] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const created = onCreatePlaylist(title, newDesc.trim());
    if (created && created.id) {
      onAddTrackToPlaylist(created.id, track);
      setAddedPlaylistId(created.id);
    }
    setNewTitle('');
    setNewDesc('');
    setIsCreatingNew(false);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleSelectPlaylist = (pl: Playlist) => {
    onAddTrackToPlaylist(pl.id, track);
    setAddedPlaylistId(pl.id);
    setTimeout(() => {
      setAddedPlaylistId(null);
      onClose();
    }, 700);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Apple HIG Floating Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#16161D]/90 border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden text-white z-10 p-5 space-y-4 max-h-[85vh] flex flex-col"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Sheet Drag Handle for Mobile */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto sm:hidden -mt-1" />

          {/* Header with Track Details */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <img
                src={track.thumbnailUrl}
                alt={track.title}
                className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-md border border-white/10"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                  Add to Playlist
                </span>
                <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
                <p className="text-xs text-slate-400 truncate">{track.artist}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action 1: Create New Playlist Toggle */}
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 transition-all group shrink-0 active:scale-[0.99]"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: accentColorHex }}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  New Playlist...
                </h4>
                <p className="text-[11px] text-slate-400">Create a personalized Apple Music mix</p>
              </div>
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-red-500" />
                  New Playlist
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Playlist Title (e.g. Late Night Vibes)"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />

              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow disabled:opacity-40 transition-all"
                  style={{ backgroundColor: accentColorHex }}
                >
                  Create &amp; Add
                </button>
              </div>
            </form>
          )}

          {/* List of Existing Playlists */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[160px]">
            <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Your Playlists ({playlists.length})
            </div>

            {playlists.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                <Music className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                <p className="font-semibold text-slate-300">No playlists yet</p>
                <p className="text-[11px] text-slate-500">Tap "New Playlist" above to create your first one.</p>
              </div>
            ) : (
              playlists.map((pl) => {
                const trackCount = (pl.trackIds || pl.tracks || []).length;
                const isAlreadyIn = (pl.trackIds || []).includes(track.id) || (pl.tracks || []).some(t => t.id === track.id || t.youtubeId === track.youtubeId);
                const isJustAdded = addedPlaylistId === pl.id;

                return (
                  <div
                    key={pl.id}
                    onClick={() => handleSelectPlaylist(pl)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {pl.coverUrl ? (
                          <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover" />
                        ) : (
                          <ListMusic className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                          {pl.title || pl.name || 'Untitled Playlist'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isJustAdded ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : isAlreadyIn ? (
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-1 rounded-full bg-white/5">
                          In Playlist
                        </span>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-red-600 transition-colors shadow">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
