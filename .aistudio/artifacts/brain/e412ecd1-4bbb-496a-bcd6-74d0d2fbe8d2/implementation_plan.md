# SimpMusic Experience Overhaul (maxrave-dev Inspired)

Transform **sonnetmdp** into a fast, 100% ad-free, open-source music player inspired by **SimpMusic** (by maxrave-dev). This overhaul strips out all advertising code, resolves React runtime hook conflicts, delivers rich YouTube Music recommendation feeds (Moods, Quick Picks, Similar Artists, Charts), and introduces a dynamic ambient glow player with fluid gesture controls and offline-first storage.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The advertising infrastructure (AdSense/AdMob scripts, meta tags, and components) will be completely removed. All library data, playlists, and listening history will run on high-performance offline-first local storage (IndexedDB/localStorage) with optional direct YouTube Music library sync.

- **Confirmed Decision 1**: Completely remove the ad system (AdSense tags, scripts, `AdBanner`, and AdMob Android configurations) for an uninterrupted, clean listening experience.
- **Confirmed Decision 2**: Full SimpMusic YouTube Music recommendation feed: Moods & Moments (Energize, Workout, Relax, Focus, Commute), Quick Picks, Similar to Top Artists, and Global/Local Charts.
- **Confirmed Decision 3**: SimpMusic-style Now Playing experience featuring dynamic album artwork ambient blur, animated waveforms, synchronized lyrics, and a fluid gesture-driven bottom sheet.
- **Confirmed Decision 4**: Offline-first local library architecture that works out of the box with zero login requirements, while keeping optional Google YouTube Music sync for importing liked songs and playlists.
- **Confirmed Decision 5**: Fix React 19 hook duplication and renderer binding errors (`Cannot read properties of null (reading 'useRef')`) via strict dependency deduplication in Vite.

---

### 1. Overview & Core Concept

- **What It Does**: A sleek, client-side, ad-free streaming player powered by YouTube Music and local audio, matching the fluidity, design language, and recommendation depth of **SimpMusic**.
- **Target Audience**: Music listeners who want instant, jitter-free playback, rich personalized algorithmic recommendations, real-time synchronized lyrics, and zero ad interruptions.
- **Key Value**: Delivers the responsiveness of a native Material 3 / SimpMusic mobile client directly in the browser and Android app, backed by a resilient offline-first store.

---

### 2. User Experience & Visual Design

#### A. SimpMusic Home Feed (Discovery & Recommendations)
1. **Moods & Moments Bar**: Top horizontal capsule selector with SimpMusic categories:
   - `Energize` (Upbeat, Electronic, Pop)
   - `Workout` (High-tempo, Phonk, Trap)
   - `Relax` (Lo-Fi, Acoustic, Ambient)
   - `Focus` (Instrumental, Neo-classical, Chillhop)
   - `Commute` (Trending Hits, Melodic)
2. **Quick Picks Shelf**: 4x2 grid of instant tracks tailored to the user's recent vibe, with one-tap play and radio launcher buttons.
3. **"Similar to [Artist]" Horizontal Carousel**: Rich card strip featuring track thumbnails, artist credits, and instant station creation.
4. **YouTube Music Charts**: Global and regional top tracks with rank badges and play counters.
5. **Infinite Vibe Radio**: Playing any track immediately queues contextual, seamless Up-Next tracks without gaps or dead ends.

#### B. SimpMusic Now Playing & Smoothness
- **Dynamic Ambient Glow**: Dynamic dual-stop mesh gradient extracted from the active track's cover art using ColorThief/Canvas, softly backlighting the player without performance drops.
- **Fluid Bottom Sheet & MiniPlayer**:
  - Docked mobile mini-player with swipe-to-skip gestures, progressive scrub bar, and play/pause toggle.
  - Expanding fullscreen Now Playing sheet with spring physics (`stiffness: 380, damping: 32`), oversized album artwork with rounded squircle geometry (`rounded-3xl`), and real-time lyric sync.
- **Synchronized Lyrics**: Smooth automatic vertical scrolling with line-highlighting powered by LRCLIB and YouTube Music subtitle streams.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Complete Ad System Eradication**
  - *Chosen Approach*: Fully delete `AdBanner.tsx`, `MONETIZATION.md`, Google AdSense scripts/meta tags from `index.html`, and AdMob dependencies from Android manifests.
  - *Why*: Directly satisfies the user request to remove ads and aligns with SimpMusic's open-source, non-commercial philosophy.
- **Decision 2: Offline-First Local Store vs Mandatory Firebase**
  - *Chosen Approach*: Store user favorites, custom playlists, downloads, and history in browser IndexedDB/localStorage with transparent export/import, while supporting direct YouTube OAuth library sync.
  - *Why*: Eliminates setup friction, removes missing Firebase config errors, and ensures 100% offline functionality.
- **Decision 3: React Hook Deduplication & Vite Bundle Optimization**
  - *Chosen Approach*: Configure `resolve.dedupe: ['react', 'react-dom']` and `optimizeDeps.include: ['react', 'react-dom']` in `vite.config.ts`, and clear stale `.vite` cache.
  - *Why*: Resolves the `Cannot read properties of null (reading 'useRef')` error caused by multiple React instances bundled in Vite dependencies.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SimpMusic Architecture (sonnetmdp)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌───────────────────────────────┐           ┌────────────────────────────────┐
│   SimpMusic Discovery Core    │           │    Fluid Playback & Engine     │
├───────────────────────────────┤           ├────────────────────────────────┤
│ - Moods & Moments Filter Bar  │           │ - YouTube IFrame Streamer      │
│ - Quick Picks (YouTube Music) │           │ - HTML5 Web Audio DSP Engine   │
│ - "Similar To" Station Radio  │           │ - Infinite Next-Radio Buffer   │
│ - Top Charts & Viral Hits     │           │ - MediaSession Lockscreen API  │
└──────────────┬────────────────┘           └───────────────┬────────────────┘
               │                                            │
               └──────────────────────┬─────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 SimpMusic UI & Ambient Design System                   │
├────────────────────────────────────────────────────────────────────────┤
│ - Dynamic Album Artwork Mesh Glow (ColorThief RGB extraction)          │
│ - Fluid Fullscreen Now Playing Sheet (Framer Motion spring physics)    │
│ - Synced Lyrics View with Smooth Line Tracking                         │
│ - 100% Ad-Free Surface (Zero AdSense / Zero AdMob)                     │
│ - Offline-First Local Storage (Playlists, Liked Tracks, History)       │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Implementation Sequence
1. **Fix Vite & React Hook Binding**:
   - Update `vite.config.ts` with explicit `resolve.dedupe: ['react', 'react-dom']` and `optimizeDeps: { include: ['react', 'react-dom'] }`.
   - Clear stale prebundled `.vite` cache to eliminate hook crashes.
2. **Ad System Cleanup**:
   - Verify removal of all `AdBanner` instances, AdSense script tags in `index.html`, and Android manifest AdMob metadata.
3. **SimpMusic Recommendation Service Overhaul (`src/services/youtubeSearchService.ts` & `src/services/youtubeOAuthService.ts`)**:
   - Implement Moods & Moments categorized queries (`Energize`, `Workout`, `Relax`, `Focus`, `Commute`).
   - Enhance the continuous radio algorithm (`generateUpNextRadio`) to mimic YouTube Music's InnerTube autoplay stream.
4. **SimpMusic Home View (`src/components/views/ExploreView.tsx`)**:
   - Build SimpMusic Moods chip bar with active state pill-free indicators.
   - Assemble Quick Picks, Similar Artists, and Chart grids with hover scale and ambient card lighting.
5. **Smooth Player & Ambient Backing (`src/components/player/MobileNowPlayingSheet.tsx` & `src/App.tsx`)**:
   - Integrate dominant color ambient backdrop filter for the Now Playing sheet and player bar.
   - Refine animation easing curves to 60fps compositor-only transforms.
6. **Compilation & Verification**:
   - Run `compile_applet` and `lint_applet` to guarantee error-free compilation and fluid execution.
