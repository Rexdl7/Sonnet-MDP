# Player Optimization: Pre-buffering, Offline Playback & Visual Polish

Implementation plan for optimizing YouTube playback stability, adding offline track caching, and implementing visual polish for the music player.

## User Review & Critical Decisions

> [!IMPORTANT] User choices confirmed in Phase 1:
> - **Pre-buffering Strategy**: Pre-load next YouTube track embed in background and switch instantly to eliminate playback stutters.
> - **Offline Playback Strategy**: Use Cache API in a Service Worker to store the last 10 listened audio stream blobs for offline access.

- **Confirmed Decision 1**: Implement `ServiceWorker` to manage caching audio blobs using Cache API for last 10 tracks.
- **Confirmed Decision 2**: Introduce background iframe management in `YouTubePlayer` to pre-load next track.

---

## 1. Overview & Core Concept

- **What It Does**: Optimizes the player by pre-buffering the next track for seamless transition, enables offline playback of recent tracks using a Service Worker, implements album artwork vinyl rotation animations, and fixes lingering initialization issues where tracks get stuck at 0:00.
- **Target Audience / Persona**: Users experiencing stuttering playback, limited connectivity, or wanting a more polished visual player.
- **Key Value**: Provides zero-stutter playback, reliable offline access, and premium visual feedback.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Playback Initialization**: Tracks load smoothly with robust timer synchronization.
  2. **Vinyl Rotation**: Album artwork in `NowPlayingSheet` spins smoothly while music plays and stops when paused.
  3. **Offline Access**: Recently listened tracks play seamlessly even when offline.

- **Visual Identity & Theme**:
  - *Vinyl Rotation*: `animate-spin` with `animation-play-state: paused` when `!isPlaying`.
  - *Glassmorphic UI*: Consistent styling with backdrop blurs.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: YouTube Pre-buffering**:
  - *Chosen Approach*: Maintain two hidden YouTube iframes and toggle visibility/source 5s before end of current track.
  - *Why*: Eliminates the "blank space" delay caused by iframe loading.

- **Decision 2: Service Worker Blob Caching**:
  - *Chosen Approach*: Cache audio stream blobs returned from the procedural audio engine in the `Cache` API.
  - *Why*: Allows true high-fidelity offline playback without needing to re-generate procedural tracks.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          System Components                             │
│  ┌───────────────────────┐         ┌──────────────────────────────┐    │
│  │    YouTubePlayer      │ ◄───────┤    App.tsx (Pre-buffering)   │    │
│  │ (Active + Next iframe)│         └──────────────────────────────┘    │
│  └───────────┬───────────┘                                             │
│              │                                                         │
│  ┌───────────▼───────────┐         ┌──────────────────────────────┐    │
│  │   ServiceWorker (sw)  │ ◄───────┤  Cache API (Last 10 tracks)  │    │
│  └───────────────────────┘         └──────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Updates

1. **`src/sw.js`**: Create new Service Worker for caching `audio/wav` and `thumbnail` assets using Cache API.
2. **`src/components/player/YouTubePlayer.tsx`**: Add logic to hold a pre-buffer iframe that updates with the next track in the queue.
3. **`src/components/player/MobileNowPlayingSheet.tsx`**: Add CSS vinyl rotation animation:
   ```css
   .vinyl-record { animation: spin 4s linear infinite; animation-play-state: paused; }
   .vinyl-record.playing { animation-play-state: running; }
   ```
4. **`src/App.tsx`**: Fix 0:00 initialization by ensuring `audioRef`/`YouTubePlayer` correctly consumes the source URL and triggers play immediately.
