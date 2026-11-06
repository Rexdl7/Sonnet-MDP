# Sonnet Player — High-Fidelity Audio Studio Suite

Sonnet Player is a cross-platform, high-resolution media hub combining YouTube Music streaming and search with studio-grade audio DSP, versatile download fidelity, and authentic platform design themes.

### Delivered Capabilities

1. **High-Quality Audio Downloader**:
   - Master audio export with multi-fidelity selection:
     - **Studio FLAC / WAV Master**: 24-bit · 96.0 kHz Uncompressed PCM (~8.4 MB)
     - **High Fidelity MP3**: 320 kbps CBR · 44.1 kHz Stereo (~3.6 MB)
     - **Standard Fidelity MP3**: 192 kbps VBR (~2.1 MB)
   - Available via dedicated Download buttons on track cards, track list rows, and the player bar.
   - Endpoint: `/api/music/download` serving direct attachment downloads.

2. **Listening Quality & Custom Audio Pipeline**:
   - Quality presets:
     - **Studio Lossless**: 24-bit 96kHz FLAC/PCM
     - **High Fidelity**: AAC 320 kbps
     - **Balanced**: MP3 192 kbps
     - **Data Saver**: Opus 96 kbps
     - **Custom Quality**: Hardware audio DSP configuration
   - When **Custom Quality** is selected:
     - **Custom Stream Bitrate**: 64 kbps to 1411 kbps (CD Lossless)
     - **DAC Sample Frequency**: 44.1 kHz, 48 kHz, 96 kHz, 192 kHz
     - **3D Spatial Audio Soundstage**: 0% (Mono) to 200% (Ultra-Wide 3D)
     - **DSP Buffer Size**: 512, 1024, 2048, 4096 samples
   - Real-time **Audio Quality Badge** on the player bar (`[LOSSLESS 24-BIT]`, `[HI-RES AAC 320K]`, `[CUSTOM 512K]`).

3. **Multi-Platform Theme Suite (Eliminating AI Slop / Neon Grayish)**:
   - **Apple Music Glass**: Cupertino frosted acrylic, `#000000` deep obsidian, hairline specular borders, crimson rose accent (`#FA2D48`).
   - **YouTube Music Studio**: Pitch-black `#030303`, solid `#121212` matte cards, YouTube pure red accent (`#FF0000`).
   - **Spotify Canvas**: Matte dark `#121212` / `#181818`, electric Spotify green accent (`#1DB954`).
   - **JetBrains Darcula Pro**: Professional IDE dark `#1E1F22`, charcoal `#2B2D30`, amber gold accent (`#E5C07B`).
   - **Velvet Noir & Blood Red**: Cyberpunk midnight void `#050505` with high-voltage ruby accent (`#E11D48`).
   - **OLED Pitch Black**: 100% true black `#000000` pixels with razor-sharp white borders and monochrome clarity.
   - **Light Mode Themes**:
     - *Apple Pearl Light*: Crisp Apple pearl `#F5F5F7` with clean white cards and crimson accents.
     - *Nordic Frost Light*: Minimalist Scandinavian `#F8FAFC` with deep indigo accents (`#4F46E5`).
     - *Solarized Warm Parchment*: Eye-soothing warm cream `#FDF6E3` with terracotta amber (`#D97706`).

4. **Complete Project Codebase ZIP Export**:
   - Server-side generator creating `sonnet-player.zip` on demand via `/api/download-project`.
   - Dedicated "Download Project ZIP" action in the Settings view and top bar.
   - Physical archive saved as `sonnet-player.zip` in the root workspace.
