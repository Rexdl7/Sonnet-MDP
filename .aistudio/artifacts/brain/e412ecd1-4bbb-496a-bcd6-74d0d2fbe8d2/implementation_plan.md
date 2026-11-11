# Spotify Music Ecosystem, Expanded Home Feed & UI Polish

Deliver seamless Spotify integration (OAuth linking, user playlists, liked tracks, personalized recommendation engine, and synchronized karaoke lyrics), an expanded multi-row discovery feed for new and returning listeners, compact header branding with the "Natural Studio" tag removed, and comfortable touch padding across search and core views.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive clarification:
> - **Spotify Account Integration**: Spotify OAuth popup with instant guest fallback recommendations so all visitors immediately receive fresh Spotify-derived music without mandatory developer setups.
> - **Home Page Discovery Structure**: Rich multi-row feed featuring Spotify Global Top Hits, Mood Mixes, Quick Picks, Fresh Releases, and High-Energy rows.
> - **Lyrics Experience**: Fully synchronized karaoke lyrics in both the dedicated Lyrics view and the mobile Now Playing sheet.
> - **Header & Branding**: Compact "Sonnetmdp" wordmark, removal of the "NATURAL STUDIO" tag, and generous padding for search inputs and suggestion overlays.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms Sonnetmdp into a Spotify-powered streaming hub. Users can link their personal Spotify accounts to load their real playlists and liked tracks, browse an expansive multi-row discovery feed seeded by Spotify charts, follow synchronized karaoke lyrics, and enjoy comfortable touch ergonomics on both mobile and desktop.
- **Target Audience**: Music lovers and mobile listeners on `sonnetmdp.vercel.app` seeking instant music playback, zero dead ends, personal Spotify playlist portability, and synchronized song lyrics.
- **Key Value**: Combines the vast audiovisual playback capability of YouTube with the personalization, charts, and synchronized lyrics of Spotify, all packaged within a refined, responsive Apple HIG interface.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **First-Time Discovery**: Visitors open the app and instantly see fresh Spotify-derived charts (Global Top 50, Viral Hits, Mood Mixes). No login required to listen.
2. **Spotify Account Linking**:
   - User taps the "Link Spotify" button in the header or the new Spotify Connect card.
   - A clean OAuth modal opens directly to Spotify or allows 1-tap Spotify Taste Profile activation.
   - Once linked, the user's Spotify playlists, saved tracks, and top artists seamlessly populate the Library and Home feed.
3. **Synchronized Karaoke Lyrics**:
   - While any song plays, tapping the Lyrics tab or drawer reveals synchronized Spotify-timed lines that advance and highlight with playback.
   - Clicking any lyric line seeks playback to that exact timestamp.
4. **Ergonomic Search Experience**:
   - Search bar features generous padding (`py-2.5 px-4`), clear touch targets ($\ge 44\text{px}$), and an edge-to-edge floating suggestion popover with comfortable row spacing.

#### B. Visual Identity & Typography
- **Palette**: Deep studio dark backdrop (`#0F0F12` to `#16161D`), frosted glass overlays (`backdrop-blur-md bg-white/[0.04]`), Spotify vibrant green accent (`#1DB954`) alongside Sonnet copper (`#D97736`).
- **Typography**: Clean display headline hierarchy with unboxed text metadata separated by subtle typographic bullets (`·`).
- **Branding Restraint**: Compact "Sonnetmdp" wordmark; removal of the secondary "NATURAL STUDIO" badge in accordance with the Zero-Pill & Metadata Discipline constitution.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Path Spotify Recommendations (Live OAuth + Instant Guest Seeds)**
  - *Chosen Approach*: Provide a server-side Spotify Web API proxy (`/api/spotify/*`) for real Spotify OAuth, paired with a resilient Spotify Charts & seed database that guarantees fresh daily recommendations for every guest user.
  - *Why*: Solves the cold-start problem and prevents authentication errors for visitors who do not have a registered Spotify developer client ID.
- **Decision 2: High-Fidelity Synced Lyrics Engine**
  - *Chosen Approach*: Multi-tier synchronized lyrics resolution (`/api/lyrics`) that queries Spotify/LRCLIB timestamps and delivers line-by-line synchronized LRC data with millisecond precision.
  - *Why*: Allows karaoke-style lyric synchronization that stays locked to playback even when scrubbing or changing playback speed.
- **Decision 3: Compact Top Bar Contract**
  - *Chosen Approach*: Streamlined 3-zone header with compact wordmark, centered search with generous internal padding, and high-priority action buttons (Spotify Connect, SonTube toggle, User Profile).
  - *Why*: Prevents mobile header crowding and eliminates overlap between search suggestions and action controls.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Sonnetmdp Frontend                            │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   MacOSWindowHeader   │  │              ExploreView               │ │
│  │  • Compact Wordmark   │  │  • Spotify Global Top Hits (Row 1)     │ │
│  │  • Padded Search Bar  │  │  • Quick Picks For You (Row 2)         │ │
│  │  • Spotify Connect    │  │  • Mood & Lo-Fi Study Beats (Row 3)    │ │
│  └───────────────────────┘  │  • Fresh Releases & Viral (Row 4)      │ │
│                             │  • Infinite Discovery Feed (Row 5+)    │ │
│                             └────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      LyricsView & Now Playing                     │ │
│  │     • Spotify-Synchronized LRC Karaoke Scroll & Interactive Seek  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Proxy (server.ts)                       │
│                                                                        │
│  /api/spotify/auth-url    ──> Spotify Accounts OAuth Authorize         │
│  /api/spotify/callback    ──> Token Exchange & Session Callback        │
│  /api/spotify/featured    ──> Spotify Top Playlists & Chart Seeds      │
│  /api/spotify/user-library──> User Liked Tracks & Playlists            │
│  /api/lyrics              ──> Synchronized LRC Karaoke Lyrics Match    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Audio & Playback Infrastructure                   │
│   • HTML5 Audio / YouTube Stream Matcher                               │
│   • Local Storage Session & Supabase Offline Persistence               │
└────────────────────────────────────────────────────────────────────────┘
```

#### Key Implementation Steps:
1. **Server-Side Spotify & Lyrics Proxy (`server.ts`)**:
   - Implement `/api/spotify/auth-url` and `/api/spotify/callback` adhering to the `oauth-integration` skill with `postMessage` cross-origin closing snippet.
   - Implement `/api/spotify/feed` providing multi-row categories: Global Hits, Viral 50, Deep Focus, Chill Beats, and High Energy.
   - Implement `/api/lyrics` returning synchronized LRC timestamps.
2. **Spotify Integration Service (`src/services/spotifyService.ts`)**:
   - Manage Spotify tokens, account linking status, user playlists, and guest fallback presets.
3. **Header & Navigation Polish (`src/components/layout/MacOSWindowHeader.tsx`)**:
   - Remove "NATURAL STUDIO" pill badge.
   - Make "Sonnetmdp" wordmark compact.
   - Increase search input padding (`py-2.5 px-4.5`) and ensure autocomplete dropdown is comfortably padded and scrollable.
4. **Expanded Multi-Row Feed (`src/components/views/ExploreView.tsx`)**:
   - Add rich sections with horizontal touch scrolling and "Show All" drawers.
   - Integrate Spotify account sync card with 1-tap activation.
5. **Synchronized Lyrics View (`src/components/views/LyricsView.tsx`) & Now Playing Sheet**:
   - Render synchronized karaoke lines that scroll automatically with playback time.
