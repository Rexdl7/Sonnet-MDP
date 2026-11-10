# SonnetMDP Platform Upgrade: Project Audit & Implementation Plan (Revised)

A comprehensive architectural upgrade to transform SonnetMDP into a polished music streaming and discovery platform inspired by Spotify and YouTube Music, featuring an authentic YouTube Music Now Playing mobile player, full playlist lifecycle management, and verified audio persistence.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following revisions and architectural choices were incorporated based on your latest feedback:

- **Revised Mobile Now Playing Screen (YouTube Music Style)**: Replace the current long, vertically scrolling sheet with a clean, single-viewport YouTube Music interface:
  1. **Main Viewport Stage**: Top chevron-down dismiss button, prominent centered album artwork, title & artist with like button, clean precision scrubber with timestamps, and core playback transport (Shuffle, Previous, Play/Pause, Next, Repeat).
  2. **YouTube Music Bottom Drawer (Up Next / Lyrics / Related)**: Instead of an endless vertical timeline, a bottom tabbed drawer with three dedicated tabs: **UP NEXT** (queue), **LYRICS** (real-time synced lyrics), and **RELATED** (station tracks & artist info).
  3. **Fluid Swipe-to-Dismiss**: Natural vertical drag gesture that smoothly minimizes the full player down into the bottom docked mini-player with spring physics.
- **Confirmed Discovery Strategy**: YouTube Music trending charts paired with real-time AI sonic vibe radio (matching BPM, harmonic key, and groove) as the primary discovery flow on the Home/Explore screen.
- **Confirmed Data Persistence**: Hybrid architecture using browser local storage for instant zero-friction use, seamlessly synced to Google Firebase Authentication & Firestore for cross-device playlists and favorites.
- **Strict Preservation**: Retain the single shared audio engine (`audioEngine.ts` & `YouTubePlayer.tsx`), existing view routing, frosted acrylic styling, and responsive layouts without breaking working features.

---

## Phase 1: Existing-Feature Inventory & Comparison Audit

### Feature Comparison Table

| Feature | Current Status | Existing Implementation | Required Action |
| :--- | :--- | :--- | :--- |
| **Mobile Now Playing Screen** | PARTIALLY IMPLEMENTED / REVISION REQUIRED | `MobileNowPlayingSheet.tsx` (currently an endless vertical scroll of artwork, lyrics, and cards) | Redesign to match YouTube Music: compact single-viewport player with bottom tabbed drawer (**Up Next**, **Lyrics**, **Related**) and fluid swipe-down minimization |
| **Music Playback** | FULLY IMPLEMENTED | `YouTubePlayer.tsx`, `audioEngine.ts`, unified in `App.tsx` | Preserve single audio engine; ensure uninterrupted navigation across all views |
| **Search** | FULLY IMPLEMENTED | Multi-tier YouTube search in `server.ts`, tabbed filters (Songs, Artists, Albums, Videos) in `SearchView.tsx`, debounced autocomplete hook in `useYouTubeSearch.ts` | Preserve & polish quick search suggestions; add search history caching |
| **Playlists** | PARTIALLY IMPLEMENTED | `ApplePlaylistActionSheet.tsx` for creation & track addition; `LibraryView.tsx` with Play/Shuffle and track removal; Firestore sync | Add playlist Rename and Delete dialogs in `LibraryView.tsx` to complete full CRUD operations |
| **Music Discovery** | PARTIALLY IMPLEMENTED | `ExploreView.tsx` with trending charts, SimpMusic mood chips, and `/api/ai/recommend` | Enhance Home sections with live YouTube Music Top 50, New Releases, and Gemini AI Sonic Vibe mixes |
| **Queue & Radio** | FULLY IMPLEMENTED | `QueueDrawer.tsx`, explicit user queue + dynamic Infinite Vibe Radio queue, drag reordering, autoplay toggle | Wire directly into the YouTube Music mobile drawer's **Up Next** tab |
| **Favorites / Likes** | FULLY IMPLEMENTED | Set of liked IDs in `App.tsx`, synced locally and to Firestore library collection | Preserve; ensure 1-tap toggle across all views with instant UI feedback |
| **Responsive Design** | FULLY IMPLEMENTED | Desktop sidebar + floating player bar (`FloatingPlayerBar.tsx`), mobile tab bar (`MobileTabBar.tsx`) + docked mini player (`MobileMiniPlayer.tsx`) + fullscreen sheet (`MobileNowPlayingSheet.tsx`) | Preserve; maintain touch-friendly targets and zero horizontal overflow |
| **Authentication** | FULLY IMPLEMENTED | Firebase Google OAuth in `useFirebaseAuth.ts`, `SonnetmdpAuthModal.tsx` | Preserve optional Google sign-in without blocking unauthenticated local users |
| **Audio Integrations** | FULLY IMPLEMENTED | YouTube IFrame API background streaming, `/api/music/stream` audio proxy, Web Audio 10-band DSP equalizer (`EqualizerView.tsx`) | Preserve; verify seamless background playback and media session metadata |
| **PWA & Accessibility**| FULLY IMPLEMENTED | Zoomable viewport, `public/manifest.json`, `public/sw.js` shell caching, 1200×630 `og:image`, 16px mobile input rule | Preserve and verify installability and offline app shell load |

---

## Phase 2: YouTube Music Now Playing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Mobile Now Playing Screen                   │
│                                                             │
│   [Chevron Down (Swipe / Tap)]                 [Equalizer]  │
│                                                             │
│                    ┌───────────────────┐                    │
│                    │                   │                    │
│                    │    Album Art      │                    │
│                    │    (Squircle)     │                    │
│                    │                   │                    │
│                    └───────────────────┘                    │
│                                                             │
│   Song Title                                  [Heart / Like]│
│   Artist Name                                 [In-App Save] │
│                                                             │
│   ●───────────────────────────────────────────────────────  │
│   1:24                                                3:45  │
│                                                             │
│       [Shuffle]   [Prev]   ( PLAY / PAUSE )   [Next]   [Repeat]     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   Bottom Tabs:    [ UP NEXT ]   [ LYRICS ]   [ RELATED ]    │
├─────────────────────────────────────────────────────────────┤
│   Slide-up Drawer:                                          │
│   - Up Next: Live queue, drag reorder, Infinite Vibe Radio  │
│   - Lyrics: Real-time synchronized LRC lyrics               │
│   - Related: Similar songs, artist bio, discography         │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Improvements

1. **`src/components/player/MobileNowPlayingSheet.tsx`**:
   - Re-architect layout so the main transport view fits within `100dvh` without unnecessary vertical scrolling.
   - Add active drawer state: `null | 'up_next' | 'lyrics' | 'related'`.
   - Implement bottom pill selector: `UP NEXT`, `LYRICS`, `RELATED`.
   - When a tab is selected, a drawer slides up smoothly over the lower portion of the screen, allowing easy dismissal back down to the artwork.
   - Enhanced swipe gesture: A downward drag on the header or artwork smoothly dismisses the sheet and returns to the docked mini-player.
2. **`src/components/views/LibraryView.tsx`**:
   - Add Playlist Rename and Playlist Delete dialogs to enable full playlist management.
3. **`src/App.tsx`**:
   - Wire `handleRenamePlaylist` and `handleDeletePlaylist`.
   - Pass queue and related tracks down to `MobileNowPlayingSheet`.
4. **`src/components/views/SearchView.tsx`**:
   - Add persistent recent search history chips in `localStorage`.
5. **`src/components/views/ExploreView.tsx`**:
   - Polish discovery shelves with "Top Global Artists" and "New Singles".

---

## Phase 3: Verification & Quality Assurance

- Co-execute `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
- Verify smooth 60fps drag physics on mobile viewport simulation.
- Verify uninterrupted audio playback across navigation between all views.
