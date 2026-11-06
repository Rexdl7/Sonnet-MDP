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
  accentTheme: 'rose',
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
    id: 'yt-fHI8X4OXluQ',
    youtubeId: 'fHI8X4OXluQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 204,
    thumbnailUrl: 'https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=fHI8X4OXluQ',
    genre: 'Synthwave / Pop',
    year: 2020,
    lyrics: `[00:00.00]♪ Synth intro ♪
[00:13.50]Yeah
[00:17.00]I've been tryna call
[00:20.50]I've been on my own for long enough
[00:24.00]Maybe you can show me how to love, maybe
[00:28.50]I'm going through withdrawals
[00:32.00]You don't even have to do too much
[00:35.50]You can turn me on with just a touch, baby
[00:39.50]I look around and Sin City's cold and empty
[00:45.00]No one's around to judge me
[00:48.00]I can't see clearly when you're gone
[00:52.00]I said, ooh, I'm blinded by the lights
[00:59.00]No, I can't sleep until I feel your touch
[01:04.00]I said, ooh, I'm drowning in the night
[01:10.50]Oh, when I'm like this, you're the one I trust
[01:16.00]♪ Driving drum & bass rhythm ♪
[01:23.00]I'm running out of time
[01:26.00]'Cause I can see the sun light up the sky
[01:29.50]So I hit the road in overdrive, baby`
  },
  {
    id: 'yt-yKNxeF4KMsY',
    youtubeId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Parachutes',
    duration: 273,
    thumbnailUrl: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=yKNxeF4KMsY',
    genre: 'Indie Rock',
    year: 2000,
    lyrics: `[00:00.00]♪ Acoustic guitar chords and drum pulse ♪
[00:35.60]Look at the stars
[00:38.40]Look how they shine for you
[00:44.10]And everything you do
[00:49.60]Yeah, they were all yellow
[00:58.20]I came along
[01:01.00]I wrote a song for you
[01:06.80]And all the things you do
[01:12.30]And it was called "Yellow"
[01:21.00]So then I took my turn
[01:24.00]Oh, what a thing to have done
[01:29.50]And it was all yellow
[01:38.00]Your skin, oh yeah, your skin and bones
[01:43.80]Turn into something beautiful
[01:49.50]Do you know, you know I love you so?
[01:55.20]You know I love you so`
  },
  {
    id: 'yt-4xDzrJKXOOY',
    youtubeId: '4xDzrJKXOOY',
    title: 'synthwave radio - beats to chill/game to',
    artist: 'Lofi Girl',
    album: 'Synthwave Chill',
    duration: 180,
    thumbnailUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    genre: 'Synthwave / Lo-Fi',
    year: 2024,
    lyrics: `[00:00.00]♪ Analog synthesizer pads and nostalgic arpeggios ♪
[00:20.00]Cosmic highways under starry skies
[00:40.00]Neon reflections in your eyes
[01:00.00]Electronic rhythms keeping time
[01:20.00]A quiet cybernetic mind
[01:40.00]♪ Lush melodic filter sweep ♪`
  },
  {
    id: 'yt-V9PVRfjEBTI',
    youtubeId: 'V9PVRfjEBTI',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 196,
    thumbnailUrl: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=V9PVRfjEBTI',
    genre: 'Indie Pop',
    year: 2024,
    lyrics: `[00:00.00]♪ Bright indie guitar strumming ♪
[00:08.00]I want you to stay
[00:11.50]'Til I'm in the grave
[00:15.00]'Til I rot away, dead and buried
[00:19.50]'Til I'm in the casket you carry
[00:23.00]If you go, I'm going, too, uh
[00:27.50]'Cause it was always you, alright
[00:31.00]And if I'm turning blue, please don't save me
[00:35.50]Nothing in this world could persuade me
[00:39.00]To love you love you less`
  },
  {
    id: 'yt-UDVtMYqUAyw',
    youtubeId: 'UDVtMYqUAyw',
    title: 'Interstellar - Main Theme (First Step)',
    artist: 'Hans Zimmer',
    album: 'Interstellar OST',
    duration: 258,
    thumbnailUrl: 'https://i.ytimg.com/vi/UDVtMYqUAyw/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=UDVtMYqUAyw',
    genre: 'Soundtrack / Classical',
    year: 2014,
    lyrics: `[00:00.00]♪ Soft organ pulse echoing through deep space ♪
[00:30.00]Do not go gentle into that good night
[01:00.00]Rage, rage against the dying of the light
[01:30.00]♪ Majestic pipe organ crescendo swelling with intensity ♪
[02:00.00]Across the event horizon of Gargantua
[02:30.00]Time slips into another dimension`
  },
  {
    id: 'yt-5NV6Rdv1a3I',
    youtubeId: '5NV6Rdv1a3I',
    title: 'Get Lucky (Official Audio)',
    artist: 'Daft Punk feat. Pharrell Williams',
    album: 'Random Access Memories',
    duration: 248,
    thumbnailUrl: 'https://i.ytimg.com/vi/5NV6Rdv1a3I/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
    genre: 'Nu-Disco / Funk',
    year: 2013,
    lyrics: `[00:00.00]♪ Nile Rodgers funky rhythm guitar riff ♪
[00:15.00]Like the legend of the phoenix
[00:19.00]All ends with beginnings
[00:23.00]What keeps the planet spinning
[00:27.00]The force from the beginning
[00:31.00]We've come too far to give up who we are
[00:38.00]So let's raise the bar and our cups to the stars
[00:46.00]She's up all night 'til the sun
[00:48.00]I'm up all night to get some
[00:50.00]She's up all night for good fun
[00:52.00]I'm up all night to get lucky`
  },
  {
    id: 'yt-TUVcZfQe-Kw',
    youtubeId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    thumbnailUrl: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
    genre: 'Nu-Disco / Pop',
    year: 2020,
    lyrics: `[00:00.00]♪ Funky bassline and upbeat groove ♪
[00:08.00]If you wanna run away with me, I know a galaxy
[00:12.50]And I can take you for a ride
[00:16.50]I had a premonition that we fell into a rhythm
[00:20.50]Where the music don't stop for life
[00:24.50]Glitter in the sky, glitter in my eyes
[00:28.50]Shining just the way I like
[00:32.50]If you're feeling like you need a little bit of company
[00:36.50]You met me at the perfect time
[00:40.50]You want me, I want you, baby
[00:44.50]My sugarboo, I'm levitating`
  },
  {
    id: 'yt-jfKfPfyJRdk',
    youtubeId: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio - beats to relax/study to',
    artist: 'Lofi Girl',
    album: 'Chilled Cow Relax',
    duration: 220,
    thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    source: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    genre: 'Lo-Fi Chill',
    year: 2024,
    lyrics: `[00:00.00]♪ Warm vinyl crackle and soothing piano chords ♪
[00:30.00]Mellow bass rhythms and quiet rain falling
[01:00.00]Pages turning in a quiet room
[01:30.00]Peaceful focus through the afternoon
[02:00.00]Drifting smoothly into the twilight hours`
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    title: 'Loved & Favorited',
    description: 'Tracks marked with your personalized heart badge.',
    coverUrl: 'https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg',
    trackIds: ['yt-fHI8X4OXluQ', 'yt-yKNxeF4KMsY', 'yt-V9PVRfjEBTI'],
    isCustom: false,
    createdAt: '2026-01-01'
  },
  {
    id: 'pl-synth-vault',
    title: 'Neon Synthwave Vault',
    description: 'High-energy retro arpeggios, analog pads, and night drives.',
    coverUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    trackIds: ['yt-fHI8X4OXluQ', 'yt-4xDzrJKXOOY', 'yt-5NV6Rdv1a3I'],
    isCustom: false,
    createdAt: '2026-02-15'
  },
  {
    id: 'pl-focus-tea',
    title: 'Deep Focus & Study Cafe',
    description: 'Calming lo-fi piano beats and serene ambient textures.',
    coverUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    trackIds: ['yt-jfKfPfyJRdk', 'yt-UDVtMYqUAyw'],
    isCustom: true,
    createdAt: '2026-03-01'
  },
  {
    id: 'pl-acoustic-warmth',
    title: 'Golden Sunset Acoustic',
    description: 'Heartfelt grand piano, delicate strings, and warm vocals.',
    coverUrl: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    trackIds: ['yt-yKNxeF4KMsY', 'yt-V9PVRfjEBTI', 'yt-TUVcZfQe-Kw'],
    isCustom: false,
    createdAt: '2026-03-10'
  }
];

export const YTM_SEARCH_DATABASE: Track[] = [...INITIAL_TRACKS];
