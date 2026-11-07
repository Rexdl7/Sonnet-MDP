import { Track, EqualizerPreset, Playlist, AppSettings } from '../types/media';

export const EQUALIZER_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const EQUALIZER_LABELS = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const DEFAULT_SETTINGS: AppSettings = {
  appTheme: 'youtube-music',
  listeningQuality: 'lossless',
  customBitrate: 320,
  customSampleRate: 48000,
  customBufferSize: 1024,
  spatialAudioWidth: 100,
  ditherEnabled: true,
  crossfade: 4,
  replayGain: true,
  autoEq: true,
  vocalClarity: true,
  glassIntensity: 'deep',
  accentTheme: 'amber',
  visualizerMode: 'bars',
  sleepTimerMinutes: 0,
};

export const DEFAULT_EQ_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Flat Reference', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preamp: 0 },
  { id: 'bass-boost', name: 'Deep Bass Sub', gains: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0], preamp: 1 },
  { id: 'vocal', name: 'Vocal Presence', gains: [-2, -2, -1, 1, 4, 5, 4, 2, 0, -1], preamp: 0 },
  { id: 'acoustic', name: 'Warm Acoustic', gains: [3, 2, 1, 1, 2, 2, 3, 3, 4, 3], preamp: 0 },
  { id: 'electronic', name: 'Club Electronic', gains: [5, 4, 2, 0, -2, 2, 1, 3, 4, 5], preamp: 1 },
  { id: 'rock', name: 'Dynamic Rock', gains: [4, 3, 2, 1, -1, -1, 1, 3, 4, 4], preamp: 0 },
  { id: 'classical', name: 'Concert Hall', gains: [4, 3, 2, 2, -1, -1, 0, 2, 3, 3], preamp: 0 },
  { id: 'podcast', name: 'Spoken Clarity', gains: [-3, -2, 0, 2, 4, 4, 3, 1, -1, -3], preamp: 1 },
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'yt-villain-beamglow',
    youtubeId: '2Qe9o29x-wI',
    title: 'villain',
    artist: 'beamglow',
    album: 'villain - Single',
    duration: 168,
    thumbnailUrl: 'https://i.ytimg.com/vi/2Qe9o29x-wI/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=2Qe9o29x-wI',
    genre: 'Phonk / Dark Synth',
    year: 2023,
  },
  {
    id: 'yt-did-i-stutter-beamglow',
    youtubeId: 'j1K3yH8HwZ4',
    title: 'Did I Stutter?',
    artist: 'beamglow',
    album: 'Did I Stutter? - Single',
    duration: 126,
    thumbnailUrl: 'https://i.ytimg.com/vi/j1K3yH8HwZ4/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=j1K3yH8HwZ4',
    genre: 'Dark Synth',
    year: 2023,
  },
  {
    id: 'yt-bring-me-back-to-life',
    youtubeId: 'w_gW013yWwQ',
    title: 'Bring Me Back To Life',
    artist: 'Chris Grey & Allegra Jordyn',
    album: 'Bring Me Back To Life',
    duration: 172,
    thumbnailUrl: 'https://i.ytimg.com/vi/w_gW013yWwQ/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=w_gW013yWwQ',
    genre: 'Dark Pop / Alternative',
    year: 2024,
  },
  {
    id: 'yt-failure-ptasinski',
    youtubeId: 'm7-jO_dG_c8',
    title: 'failure',
    artist: 'ptasinski',
    album: 'failure - Single',
    duration: 101,
    thumbnailUrl: 'https://i.ytimg.com/vi/m7-jO_dG_c8/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=m7-jO_dG_c8',
    genre: 'Indie Dark Electro',
    year: 2024,
  },
  {
    id: 'yt-genie-in-a-bottle',
    youtubeId: 'kIDWgqDBNXA',
    title: 'Genie In A Bottle',
    artist: 'Christina Aguilera',
    album: 'Christina Aguilera',
    duration: 218,
    thumbnailUrl: 'https://i.ytimg.com/vi/kIDWgqDBNXA/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=kIDWgqDBNXA',
    genre: 'Pop Classic',
    year: 1999,
  },
  {
    id: 'yt-brooklyn-bloodpop',
    youtubeId: '_a2zS03Xn3M',
    title: 'Brooklyn BloodPop x Vacation',
    artist: 'Sleep Py',
    album: 'Mashup Single',
    duration: 228,
    thumbnailUrl: 'https://i.ytimg.com/vi/_a2zS03Xn3M/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=_a2zS03Xn3M',
    genre: 'Pop / Synth Mashup',
    year: 2024,
  },
  {
    id: 'yt-even-a-devil-may-cry',
    youtubeId: 'Xy9Y2k9yX30',
    title: 'even a devil may cry',
    artist: 'Vampiilure',
    album: 'Dark Ambience',
    duration: 2140,
    thumbnailUrl: 'https://i.ytimg.com/vi/Xy9Y2k9yX30/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=Xy9Y2k9yX30',
    genre: 'Dark Ambience / Mix',
    year: 2026,
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    title: 'Liked Songs (YouTube & Sonnet)',
    description: 'Tracks marked with your personalized heart badge.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    trackIds: [],
    isCustom: false,
    createdAt: '2026-01-01'
  }
];

export const YTM_SEARCH_DATABASE: Track[] = [];
