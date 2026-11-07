# Implementation Plan - Colored Played Progress Scrubbers, Mobile Google Sign-In, and YouTube History Sync

## User Requirements Addressed
1. **Colored Played Progress Scrubbers**: Upgrade range input scrubbers across the app (`FloatingPlayerBar`, `MobileNowPlayingSheet`, `MobileMiniPlayer`) with a dynamic filled gradient track where the played portion of the song is colored (with theme accent or platform green/red).
2. **Mobile Google Sign-In with Redirect Fallback**: Update Firebase Auth helper (`useFirebaseAuth.ts`) to automatically catch mobile popup blockers/restrictions and fallback to `signInWithRedirect` + `getRedirectResult`.
3. **YouTube Account Personalization & History Sync**: Upon Google sign-in, load user profile and sync YouTube Music listening history and personalized playlists (similar to YouTube Music profile sync).

---

## Proposed Changes

### 1. Custom Filled Progress Scrubber (`FloatingPlayerBar.tsx`, `MobileNowPlayingSheet.tsx`, `MobileMiniPlayer.tsx`)
- Replace standard range inputs with custom click-to-seek and drag scrubbers featuring a dual-layer bar: background track (`bg-white/15`) and played fill track (`bg-[accentColorHex]` or platform color) with smooth thumb transition.

### 2. Firebase Auth Mobile Redirect Fallback (`src/hooks/useFirebaseAuth.ts`)
- Implement `signInWithPopup` with a clean `catch` block that triggers `signInWithRedirect(auth, provider)` on mobile or when popups are blocked, handling `getRedirectResult` on app load.

### 3. YouTube Music Account Personalization & History Sync (`src/hooks/useFirebaseAuth.ts`, `src/App.tsx`, `src/services/firebaseService.ts`)
- When user signs in with Google, initialize user document in Firestore with personalized YouTube Music listening history (`historyQueue`), liked tracks, and custom playlists.

---

## Verification Plan
- **Build Verification**: Run `compile_applet` and `lint_applet` co-executed together to verify zero errors.
- **Runtime Verification**: Verify colored played progress on scrubbers, mobile Google auth redirect flow, and user profile synchronization.
