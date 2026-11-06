import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut, testConnection } from '../lib/firebase';
import { syncUserProfile } from '../services/firebaseService';
import { UserAuthProfile } from '../types/media';

export function useFirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState<boolean>(true);

  useEffect(() => {
    // Validate connection to Firestore on boot
    testConnection().then((online) => {
      setIsFirebaseOnline(online);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userProfile: UserAuthProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Music Fan',
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
        };
        setCurrentUser(userProfile);

        // Sync to Firestore
        try {
          await syncUserProfile({
            id: user.uid,
            displayName: userProfile.displayName || '',
            email: userProfile.email || '',
            photoURL: userProfile.photoURL || undefined,
          });
        } catch (err) {
          console.warn('Sync profile error:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let msg = error?.message || 'Failed to sign in with Google';
      if (error?.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by browser. Please allow popups for this site.';
      } else if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in cancelled.';
      }
      setAuthError(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Sign-Out Error:', error);
    }
  };

  return {
    currentUser,
    loading,
    authError,
    isFirebaseOnline,
    loginWithGoogle,
    logout,
  };
}
