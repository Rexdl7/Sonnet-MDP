import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { 
  auth, googleProvider, signInWithPopup, signInWithRedirect, 
  getRedirectResult, signOut, testConnection, firebaseConfig,
  setCachedAccessToken, getAccessToken
} from '../lib/firebase';
import { syncUserProfile } from '../services/firebaseService';
import { UserAuthProfile, Track, Playlist } from '../types/media';
import { fetchUserYouTubeLikedVideos, fetchUserYouTubePlaylists } from '../services/youtubeOAuthService';

const LOCAL_STORAGE_AUTH_KEY = 'sonnetmdp_user_profile';
const LOCAL_STORAGE_YT_TRACKS = 'sonnetmdp_yt_liked_tracks';
const LOCAL_STORAGE_HISTORY_KEY = 'sonnetmdp_listening_history';

export function useFirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  const [youtubeLikedTracks, setYoutubeLikedTracks] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_YT_TRACKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  const [listeningHistory, setListeningHistory] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  const [youtubePlaylists, setYoutubePlaylists] = useState<Playlist[]>([]);
  const [isYouTubeSynced, setIsYouTubeSynced] = useState<boolean>(() => {
    return !!localStorage.getItem(LOCAL_STORAGE_YT_TRACKS);
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState<boolean>(false);

  useEffect(() => {
    testConnection().then((online) => {
      setIsFirebaseOnline(online);
    });

    if (firebaseConfig.apiKey) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (result && result.user) {
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
              setCachedAccessToken(credential.accessToken);
              try {
                const [likes, plists] = await Promise.all([
                  fetchUserYouTubeLikedVideos(credential.accessToken),
                  fetchUserYouTubePlaylists(credential.accessToken),
                ]);
                if (likes && likes.length > 0) {
                  setYoutubeLikedTracks(likes);
                  localStorage.setItem(LOCAL_STORAGE_YT_TRACKS, JSON.stringify(likes));
                  setIsYouTubeSynced(true);
                }
                if (plists && plists.length > 0) {
                  setYoutubePlaylists(plists);
                }
              } catch (err) {
                console.warn('Redirect YouTube fetch notice:', err);
              }
            }

            const profile: UserAuthProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Google User',
              email: user.email,
              photoURL: user.photoURL,
              isAnonymous: user.isAnonymous,
            };
            setCurrentUser(profile);
            localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(profile));
          }
        })
        .catch((err) => {
          console.warn('Redirect result notice:', err);
        });

      const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          const profile: UserAuthProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Google User',
            email: user.email,
            photoURL: user.photoURL,
            isAnonymous: user.isAnonymous,
          };
          setCurrentUser(profile);
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(profile));

          try {
            await syncUserProfile({
              id: user.uid,
              displayName: profile.displayName || 'Google User',
              email: profile.email || '',
              photoURL: profile.photoURL || undefined,
            });
          } catch (err) {
            console.warn('Sync profile notice:', err);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<UserAuthProfile | null> => {
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
        // Fetch real YouTube liked tracks & playlists using OAuth token
        try {
          const [likes, plists] = await Promise.all([
            fetchUserYouTubeLikedVideos(credential.accessToken),
            fetchUserYouTubePlaylists(credential.accessToken),
          ]);
          if (likes && likes.length > 0) {
            setYoutubeLikedTracks(likes);
            localStorage.setItem(LOCAL_STORAGE_YT_TRACKS, JSON.stringify(likes));
            setIsYouTubeSynced(true);
          }
          if (plists && plists.length > 0) {
            setYoutubePlaylists(plists);
          }
        } catch (ytErr) {
          console.warn('Could not fetch YouTube liked music:', ytErr);
        }
      }

      const profile: UserAuthProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      };
      setCurrentUser(profile);
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(profile));
      return profile;
    } catch (error: any) {
      console.warn('Google Popup Sign-In notice, attempting redirect:', error);
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr: any) {
        console.error('Sign in error:', redirectErr);
        setAuthError(redirectErr?.message || 'Failed to sign in with Google');
        throw redirectErr;
      }
    }
  };

  const recordTrackListen = (track: Track) => {
    if (!track || !track.id) return;
    setListeningHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id && t.youtubeId !== track.youtubeId);
      const updated = [track, ...filtered].slice(0, 50);
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Sign-Out notice:', error);
    } finally {
      setCurrentUser(null);
      setCachedAccessToken(null);
      setYoutubeLikedTracks([]);
      setYoutubePlaylists([]);
      setIsYouTubeSynced(false);
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      localStorage.removeItem(LOCAL_STORAGE_YT_TRACKS);
    }
  };

  return {
    currentUser,
    youtubeLikedTracks,
    youtubePlaylists,
    isYouTubeSynced,
    listeningHistory,
    recordTrackListen,
    loading,
    authError,
    isFirebaseOnline,
    loginWithGoogle,
    logout,
  };
}
