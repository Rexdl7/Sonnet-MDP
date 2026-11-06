import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Playlist, Track } from '../types/media';

export interface UserProfileData {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredTheme?: string;
  preferredQuality?: string;
  updatedAt?: any;
}

export interface StoredDownload {
  id: string;
  userId: string;
  title: string;
  artist: string;
  mediaType: 'audio' | 'video';
  quality: string;
  downloadedAt: string;
  fileSize?: string;
}

export const syncUserProfile = async (profile: UserProfileData) => {
  const path = `users/${profile.id}`;
  try {
    await setDoc(
      doc(db, 'users', profile.id),
      {
        id: profile.id,
        displayName: profile.displayName || 'Music Fan',
        email: profile.email || '',
        photoURL: profile.photoURL || '',
        preferredTheme: profile.preferredTheme || 'youtube-music',
        preferredQuality: profile.preferredQuality || 'high',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const syncUserLibrary = async (
  userId: string,
  likedTrackIds: string[],
  historyTracks: Track[]
) => {
  const path = `user_libraries/${userId}`;
  try {
    // Only store minimal info for history to respect document limits
    const safeHistory = historyTracks.slice(0, 30).map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      thumbnailUrl: t.thumbnailUrl,
      youtubeId: t.youtubeId,
      duration: t.duration,
    }));

    await setDoc(
      doc(db, 'user_libraries', userId),
      {
        userId,
        likedTrackIds: Array.from(new Set(likedTrackIds)).slice(0, 500),
        history: safeHistory,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const subscribeUserLibrary = (
  userId: string,
  onUpdate: (data: { likedTrackIds: string[]; history: Track[] }) => void
) => {
  const path = `user_libraries/${userId}`;
  return onSnapshot(
    doc(db, 'user_libraries', userId),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          likedTrackIds: Array.isArray(data.likedTrackIds) ? data.likedTrackIds : [],
          history: Array.isArray(data.history) ? data.history : [],
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
};

export const saveUserPlaylist = async (userId: string, playlist: Playlist) => {
  const path = `playlists/${playlist.id}`;
  try {
    await setDoc(doc(db, 'playlists', playlist.id), {
      id: playlist.id,
      userId,
      name: playlist.name,
      description: playlist.description || '',
      tracks: playlist.tracks || [],
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteUserPlaylist = async (playlistId: string) => {
  const path = `playlists/${playlistId}`;
  try {
    await deleteDoc(doc(db, 'playlists', playlistId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const subscribeUserPlaylists = (
  userId: string,
  onUpdate: (playlists: Playlist[]) => void
) => {
  const path = 'playlists';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list: Playlist[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: data.id || d.id,
          name: data.name || 'Untitled Playlist',
          description: data.description || '',
          tracks: Array.isArray(data.tracks) ? data.tracks : [],
          coverUrl: data.coverUrl,
          createdAt: data.createdAt ? String(data.createdAt) : undefined,
        });
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
};

export const recordUserDownload = async (download: StoredDownload) => {
  const path = `downloads/${download.id}`;
  try {
    await setDoc(doc(db, 'downloads', download.id), {
      ...download,
      downloadedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const subscribeUserDownloads = (
  userId: string,
  onUpdate: (downloads: StoredDownload[]) => void
) => {
  const path = 'downloads';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list: StoredDownload[] = [];
      snap.forEach((d) => {
        list.push(d.data() as StoredDownload);
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
};
