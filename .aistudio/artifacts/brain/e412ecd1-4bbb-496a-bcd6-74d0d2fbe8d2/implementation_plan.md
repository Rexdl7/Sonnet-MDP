# Implementation Plan: YouTube Music API Integration, Playlist Management & Apple HIG Media Playback

Integrate the YouTube Music search API with tabbed filters (Songs, Artists, Albums, Videos), Apple Music-inspired playlist management (action sheets to add tracks to existing playlists or create new ones), and complete Apple HIG-compliant media playback UI.

---

## User Review Required

> [!NOTE]
> - **Search Filter Tabs**: As requested, search results will provide a tabbed Apple-style segmented control filter for **Songs**, **Artists**, **Albums**, and **Videos**.
> - **Apple Music Action Sheet**: Tapping the context action on any track will open an Apple Music-style frosted action sheet to add the track to an existing playlist or instantly create a new playlist.
> - **Apple HIG Media Playback**: The player bar and now playing sheets will maintain liquid glass aesthetics, fluid scrubbing, accurate monospace timing, dynamic album artwork lighting, and Apple-consistent controls.

---

## Proposed Changes

### 1. YouTube Music API Endpoint Enhancement (`server.ts`)
- Enhance `/api/music/search` to support a `filter` parameter (`songs`, `artists`, `albums`, `videos`, or `all`).
- When `filter=artists`, fetch and parse artist profiles, subscriber counts, and high-resolution artist images from YouTube Music endpoints.
- When `filter=albums`, fetch album releases with track counts, release years, and cover artwork.
- When `filter=videos`, return YouTube official music videos and live performances.
- When `filter=songs` or `all`, return top tracks with duration, artist, and high-res thumbnails.

### 2. Tabbed Search Interface (`src/components/views/SearchView.tsx`)
- Implement Apple HIG segmented tab bar: **All**, **Songs**, **Artists**, **Albums**, **Videos**.
- **Artists View**:
  - Circular avatar cards with artist photo, subscriber count, and verified badge.
  - Tapping an artist displays their top songs and allows 1-tap playback.
- **Albums View**:
  - Squircle album artwork with album name, artist, year, and track count.
  - Tapping an album queues or plays the album.
- **Songs & Videos View**:
  - Fluid row items with duration, play trigger, like button, and the **Apple Music 3-dot action menu** to add to playlists.

### 3. Apple Music Playlist Action Sheet (`src/components/common/ApplePlaylistActionSheet.tsx`)
- Build a new Apple HIG frosted action sheet:
  - Frosted liquid glass backdrop blur (`backdrop-blur-2xl`), specular highlights, and rounded-3xl corners.
  - Track preview header (title, artist, squircle artwork).
  - Quick action: **"New Playlist..."** with inline title/description input and Apple-style rounded inputs.
  - List of user playlists showing playlist cover, title, and current track count.
  - 1-tap track addition with animated checkmark and floating liquid glass toast notification.
  - Ability to remove tracks or manage playlist items.

### 4. Playlist Detail View & Queue Playback (`src/components/views/LibraryView.tsx` & `src/App.tsx`)
- Expand `LibraryView.tsx` so tapping a playlist card opens an Apple Music-style playlist details view:
  - Large playlist header with composite artwork, title, track count, total duration, and description.
  - Prominent **Play** and **Shuffle** Apple HIG action pills.
  - Complete list of tracks in the playlist with drag/swipe actions and delete options.
  - 1-tap playback that queues all playlist tracks and plays sequentially.

### 5. Apple HIG Media Playback Polish (`src/components/player/FloatingPlayerBar.tsx` & `MobileNowPlayingSheet.tsx`)
- Ensure Apple Music Cupertino Glass mode and player elements adhere strictly to Apple HIG:
  - Fluid scrubbers with elapsed/remaining timestamps in SF Mono / monospace font.
  - Large rounded-3xl squircle cover art with dynamic ambient bloom.
  - Volume slider with Apple-style speaker iconography and smooth scrubbing.
  - AirPlay / output device route button.
  - Action pill buttons with subtle specular borders and haptic feedback.

---

## Verification Plan

### Automated Tests
- Run `compile_applet` (`npm run build`) to ensure TypeScript compilation and asset bundling succeed.
- Run `lint_applet` (`tsc --noEmit`) to verify zero type or lint errors.

### Manual Verification
1. **Search YouTube Music**:
   - Search for popular artists (e.g. "The Weeknd", "Taylor Swift", "Coldplay").
   - Toggle through **Songs**, **Artists**, **Albums**, and **Videos** tabs to confirm distinct card/row presentations.
2. **Apple Music Playlist Action Sheet**:
   - Click the 3-dot action button on any search result or now-playing song.
   - Verify the Apple Music action sheet opens with frosted glass styling.
   - Select "New Playlist", create a playlist named "Chill Night", and confirm the track is added.
   - Add another track to "Chill Night" and verify the playlist track count increments.
3. **Playlist Playback**:
   - Go to **Library -> Playlists** tab.
   - Tap "Chill Night", inspect the tracks, tap "Play", and verify sequential playback.
4. **Apple HIG Playback Interface**:
   - Inspect the floating player bar and mobile now-playing sheet for liquid glass, monospace timestamps, and fluid volume/scrubbing controls.
