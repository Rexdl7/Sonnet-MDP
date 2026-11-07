export type MediaSourceType = 'youtube' | 'stream' | 'local' | 'curated';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  source: MediaSourceType;
  mediaUrl: string;
  youtubeId?: string;
  videoUrl?: string;
  lyrics?: string; // LRC formatted string
  genre?: string;
  year?: number;
  fileSize?: string;
  channelTitle?: string;
  viewCount?: string;
  publishedAt?: string;
  mediaCategory?: 'music' | 'video' | 'gaming' | 'podcast' | 'tech';
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: number[]; // 10 values in dB (-12 to +12)
  preamp: number; // in dB
}

export interface Playlist {
  id: string;
  title?: string;
  name?: string;
  description: string;
  coverUrl?: string;
  trackIds?: string[];
  tracks?: Track[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface UserAuthProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface OfflineStoredItem {
  id: string;
  youtubeId?: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl: string;
  mediaType: 'video' | 'audio';
  quality: string;
  storageType: 'internal' | 'downloaded';
  savedAt: string;
  blobUrl?: string;
  sizeBytes?: number;
}

export type PlaybackRepeatMode = 'off' | 'all' | 'one';

export type ActiveView = 
  | 'explore' 
  | 'search' 
  | 'video'
  | 'library' 
  | 'lyrics' 
  | 'equalizer' 
  | 'settings';

import { AppThemeId } from '../utils/themeConfig';

export type { AppThemeId };

export type AccentColorTheme = 'rose' | 'indigo' | 'emerald' | 'amber' | 'violet';

export type ListeningQuality = 'lossless' | 'high_aac' | 'standard' | 'saver' | 'custom';

export interface AppSettings {
  appTheme: AppThemeId;
  listeningQuality: ListeningQuality;
  customBitrate: number; // 64 to 1411 kbps
  customSampleRate: number; // 44100, 48000, 96000, 192000
  customBufferSize: number; // 512, 1024, 2048, 4096
  spatialAudioWidth: number; // 0 to 200%
  ditherEnabled: boolean;
  crossfade: number; // seconds (0 to 12)
  replayGain: boolean;
  autoEq: boolean;
  vocalClarity: boolean;
  glassIntensity: 'subtle' | 'standard' | 'deep';
  accentTheme: AccentColorTheme;
  visualizerMode: 'bars' | 'wave';
  sleepTimerMinutes: number; // 0 = off, 15, 30, 45, 60
  hapticFeedback: boolean;
}
