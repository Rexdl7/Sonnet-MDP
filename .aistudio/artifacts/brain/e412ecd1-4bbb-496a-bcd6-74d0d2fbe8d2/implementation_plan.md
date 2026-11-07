# Implementation Plan: Theme-Specific UI Layout Engine & Prominent Now Playing Display

Transform the player interface so that switching themes not only changes colors, but dynamically restructures the player layout, artwork poster frames, button shapes, progress bar placement, and control badges to match Apple Music, Spotify, and YouTube Music's native interfaces.

## User Requirements
- **High-Visibility Now Playing Display**: Ensure track title, artist, artwork, duration, scrubber, and audio quality badges are 100% visible and high-contrast across all 9 dark and light themes.
- **Dynamic Platform Layout Engine**:
  - **Apple Music UI**: Frosted glass floating bar, rounded poster frame with drop shadows, Cupertino playback controls, centered title/artist, and Apple "Lossless 24-Bit" badge.
  - **Spotify UI**: Signature matte obsidian bar, left artwork frame with green heart icon, center stacked controls with wide bottom scrubber and time duration labels, right Spotify Connect & queue icons.
  - **YouTube Music UI**: Full-width top red progress scrubber, matte black bar with YouTube red play button, and prominent "Song | Video" toggle pill.

---

## Proposed Changes

### 1. Platform-Specific Layout Engine in Floating Player Bar
#### `src/components/player/FloatingPlayerBar.tsx`
- Branch player layout structure based on `theme.id`:
  - **Apple Music (`apple-music`, `cupertino-light`)**:
    - Frosted glass floating capsule (`backdrop-blur-3xl border-white/20`).
    - Left: Poster artwork with 3D shadow + title & artist + Apple Lossless pill.
    - Center: Prominent crimson play/pause button with smooth spring animations.
    - Scrubber: Sleek integrated timeline with time counters.
  - **Spotify (`spotify`)**:
    - Matte dark bar (`bg-[#121212] border-t border-white/10`).
    - Left: Square artwork thumbnail + track title & artist + green Heart icon.
    - Center: Stacked playback controls (Shuffle, Prev, Play, Next, Repeat) on top, wide green progress bar underneath with exact time duration numbers (`0:00 / 3:45`).
    - Right: Connect device, Lyrics, Queue, and Volume slider.
  - **YouTube Music (`youtube-music`, `red-black`, `oled-black`)**:
    - Pitch black bar with full-width red scrubber line at top edge.
    - Right: Dedicated "Song | Video" mode toggle pill button and red play button.

### 2. Platform-Specific Mobile Fullscreen Player Sheet
#### `src/components/player/MobileNowPlayingSheet.tsx`
- Adapt mobile Now Playing sheet layout:
  - **Apple Music Style**: Large rounded poster art with audio-reactive glow, Apple volume bar, lyrics sheet button, and crimson transport controls.
  - **Spotify Style**: Square poster card, green Heart on left of track title, prominent Spotify green scrubber bar, and bottom action bar.

### 3. Header & Global Visibility Sync
#### `src/components/layout/MacOSWindowHeader.tsx` & `src/App.tsx`
- Ensure current playing song info is clearly displayed and accessible everywhere.

---

## Verification Plan

1. **Compilation & Syntax**: Run `compile_applet` and `lint_applet` together to verify zero TypeScript errors.
2. **Theme UI Testing**:
   - Switch to **Apple Music Glass** / **Apple Pearl Light**: Verify Cupertino layout, glass styling, and crimson controls.
   - Switch to **Spotify Canvas**: Verify Spotify layout with left green heart, stacked center controls, and green progress scrubber.
   - Switch to **YouTube Music Studio**: Verify YouTube layout with top red scrubber line and Song/Video toggle.
