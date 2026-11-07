import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, testConnection } from '../lib/firebase';
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

    // Handle mobile redirect sign-in result on page reload
    getRedirectResult(auth).catch((err) => {
      console.warn('Redirect result error:', err);
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

        // Sync user profile & YouTube Music listening history personalization
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
      console.warn('Google Popup Sign-In Error, falling back to redirect:', error);
      // Automatic fallback for mobile browsers or blocked popups
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr: any) {
        console.error('Google Redirect Sign-In Error:', redirectErr);
        let msg = redirectErr?.message || 'Failed to sign in with Google';
        if (redirectErr?.code === 'auth/popup-blocked') {
          msg = 'Sign-in popup was blocked. Trying redirect method...';
        } else if (redirectErr?.code === 'auth/cancelled-popup-request' || redirectErr?.code === 'auth/popup-closed-by-user') {
          msg = 'Sign-in cancelled.';
        }
        setAuthError(msg);
        throw redirectErr;
      }
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
