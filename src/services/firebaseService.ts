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
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { db, auth, firebaseConfig } from '../lib/firebase';
import { Playlist, Track, UserAuthProfile } from '../types/media';

/**
 * Configure explicit browserLocalPersistence across sonnetmdp.vercel.app and local environments
 */
export const ensureAuthPersistence = async (): Promise<void> => {
  try {
    if (auth && firebaseConfig.apiKey) {
      await setPersistence(auth, browserLocalPersistence);
    }
  } catch (err) {
    // Non-fatal configuration notice
  }
};

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

export const syncUserProfile = async (profile: UserProfileData): Promise<void> => {
  // Always persist profile to local storage
  try {
    localStorage.setItem(`sonnet_user_profile_${profile.id}`, JSON.stringify(profile));
  } catch {}

  if (!firebaseConfig.apiKey || !db) return;

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
    console.warn('Firebase profile sync notice (offline or unconfigured):', err);
  }
};

export const syncUserLibrary = async (
  userId: string,
  likedTrackIds: string[],
  historyTracks: Track[]
): Promise<void> => {
  // Mirror library in local storage
  try {
    localStorage.setItem(`sonnet_likes_${userId}`, JSON.stringify(likedTrackIds));
    localStorage.setItem(`sonnet_history_${userId}`, JSON.stringify(historyTracks.slice(0, 50)));
  } catch {}

  if (!firebaseConfig.apiKey || !db) return;

  try {
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
    console.warn('Firebase library sync notice:', err);
  }
};

export const subscribeUserLibrary = (
  userId: string,
  onUpdate: (data: { likedTrackIds: string[]; history: Track[] }) => void
) => {
  // Initial fill from local storage
  try {
    const localLikes = JSON.parse(localStorage.getItem(`sonnet_likes_${userId}`) || '[]');
    const localHistory = JSON.parse(localStorage.getItem(`sonnet_history_${userId}`) || '[]');
    if (localLikes.length > 0 || localHistory.length > 0) {
      onUpdate({ likedTrackIds: localLikes, history: localHistory });
    }
  } catch {}

  if (!firebaseConfig.apiKey || !db) {
    return () => {};
  }

  try {
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
        console.warn('User library snapshot notice:', error);
      }
    );
  } catch (err) {
    return () => {};
  }
};

export const saveUserPlaylist = async (userId: string, playlist: Playlist): Promise<void> => {
  // Save in local storage
  try {
    const storedPlaylists: Playlist[] = JSON.parse(localStorage.getItem(`sonnet_playlists_${userId}`) || '[]');
    const filtered = storedPlaylists.filter((p) => p.id !== playlist.id);
    localStorage.setItem(`sonnet_playlists_${userId}`, JSON.stringify([playlist, ...filtered]));
  } catch {}

  if (!firebaseConfig.apiKey || !db) return;

  try {
    await setDoc(doc(db, 'playlists', playlist.id), {
      id: playlist.id,
      userId,
      name: playlist.name || playlist.title || 'Untitled Playlist',
      description: playlist.description || '',
      tracks: playlist.tracks || [],
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firebase save playlist notice:', err);
  }
};

export const deleteUserPlaylist = async (playlistId: string): Promise<void> => {
  try {
    // Delete from all user playlist buckets in local storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sonnet_playlists_')) {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = stored.filter((p: any) => p.id !== playlistId);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  } catch {}

  if (!firebaseConfig.apiKey || !db) return;

  try {
    await deleteDoc(doc(db, 'playlists', playlistId));
  } catch (err) {
    console.warn('Firebase delete playlist notice:', err);
  }
};

export const subscribeUserPlaylists = (
  userId: string,
  onUpdate: (playlists: Playlist[]) => void
) => {
  // Initial local storage fill
  try {
    const stored = JSON.parse(localStorage.getItem(`sonnet_playlists_${userId}`) || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      onUpdate(stored);
    }
  } catch {}

  if (!firebaseConfig.apiKey || !db) {
    return () => {};
  }

  try {
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
            name: data.name || data.title || 'Untitled Playlist',
            description: data.description || '',
            tracks: Array.isArray(data.tracks) ? data.tracks : [],
            coverUrl: data.coverUrl,
            createdAt: data.createdAt ? String(data.createdAt) : undefined,
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Playlists snapshot notice:', err);
      }
    );
  } catch (err) {
    return () => {};
  }
};

export const recordUserDownload = async (download: StoredDownload): Promise<void> => {
  try {
    const key = `sonnet_downloads_${download.userId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = stored.filter((d: any) => d.id !== download.id);
    localStorage.setItem(key, JSON.stringify([download, ...filtered]));
  } catch {}

  if (!firebaseConfig.apiKey || !db) return;

  try {
    await setDoc(doc(db, 'downloads', download.id), {
      ...download,
      downloadedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firebase download record notice:', err);
  }
};

export const subscribeUserDownloads = (
  userId: string,
  onUpdate: (downloads: StoredDownload[]) => void
) => {
  try {
    const key = `sonnet_downloads_${userId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      onUpdate(stored);
    }
  } catch {}

  if (!firebaseConfig.apiKey || !db) {
    return () => {};
  }

  try {
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
        console.warn('Downloads snapshot notice:', err);
      }
    );
  } catch (err) {
    return () => {};
  }
};
