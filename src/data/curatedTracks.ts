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
  hapticFeedback: true,
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

export const INITIAL_TRACKS: Track[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [];

export const YTM_SEARCH_DATABASE: Track[] = [];
