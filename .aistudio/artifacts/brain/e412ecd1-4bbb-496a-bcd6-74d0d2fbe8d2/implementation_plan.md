# Implementation Plan - Mobile Google Sign-In & Universal Supabase OAuth Integration

## 1. Overview & Objective
Enhance Google Sign-In accessibility on mobile devices and unify user authentication across `sonnetmdp.vercel.app`, local environments, and AI Studio previews using a Universal Google OAuth popup & Supabase profile persistence layer.

## 2. Key Architecture & File Modifications

### A. Authentication & Session Services
- **`src/services/supabaseAuth.ts`**:
  - Update `initiateUniversalGoogleSignIn()` to trigger an explicit Google OAuth 2.0 popup account chooser (`prompt=select_account`).
  - Implement Supabase Auth REST / Client session sync to persist token & profile seamlessly across domains.
- **`src/services/firebaseService.ts`**:
  - Repurpose profile sync & playlist/like persistence methods to fall back to Supabase/localStorage when offline or on custom domains.

### B. Mobile UI Visibility & Placement
- **`src/components/layout/MacOSWindowHeader.tsx`**:
  - Make the Google Sign-In button / user avatar profile prominent on mobile viewports (`<768px`) alongside search and window controls.
- **`src/components/views/ExploreView.tsx`**:
  - Add an eye-catching "Sync YouTube & Playlists with Google" banner at the top of Explore for signed-out mobile users.
- **`src/components/common/SonnetmdpAuthModal.tsx`**:
  - Ensure the auth modal triggers the universal popup flow with haptic feedback and instant profile resolution.

## 3. Verification Plan
- Co-execute `compile_applet` and `lint_applet` to guarantee type safety and zero syntax or import errors.
- Restart the development server to confirm mobile responsive rendering.
