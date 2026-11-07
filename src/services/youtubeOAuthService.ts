import { Track, Playlist } from '../types/media';
import { searchYouTubeMusic } from './youtubeSearchService';

// Helper to parse YouTube ISO 8601 duration (e.g., PT3M45S, PT1H2M10S)
export function parseYouTubeDuration(isoDuration?: string): number {
  if (!isoDuration) return 180;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 180;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds || 180;
}

/**
 * Clean raw YouTube video titles & channel names into polished music metadata
 */
export function sanitizeYouTubeTitle(rawTitle: string, channelName: string = ''): { title: string; artist: string } {
  let cleanedTitle = rawTitle || 'Untitled Track';
  let cleanedArtist = (channelName || 'YouTube Artist')
    .replace(/ - Topic|VEVO|Official|Music/gi, '')
    .trim();

  // Strip noise like [Official Video], (Lyrics), (Visualizer), [HQ], etc.
  cleanedTitle = cleanedTitle
    .replace(/\[(Official Video|Official Audio|Official Lyric Video|Lyric Video|Audio|HQ|HD|Visualizer)\]/gi, '')
    .replace(/\((Official Video|Official Audio|Official Lyric Video|Lyric Video|Audio|HQ|HD|Visualizer|Lyrics)\)/gi, '')
    .trim();

  // If title is structured as "Artist - Track Title"
  if (cleanedTitle.includes(' - ')) {
    const parts = cleanedTitle.split(' - ');
    if (parts.length >= 2) {
      cleanedArtist = parts[0].trim();
      cleanedTitle = parts.slice(1).join(' - ').trim();
    }
  } else if (cleanedTitle.includes(' — ')) {
    const parts = cleanedTitle.split(' — ');
    if (parts.length >= 2) {
      cleanedArtist = parts[0].trim();
      cleanedTitle = parts.slice(1).join(' — ').trim();
    }
  }

  return {
    title: cleanedTitle || rawTitle,
    artist: cleanedArtist || 'YouTube Artist',
  };
}

/**
 * Fetch the authenticated user's actual liked videos/music from YouTube
 * Checks both the built-in 'LL' (Liked Videos) playlist and myRating=like endpoint
 */
export async function fetchUserYouTubeLikedVideos(accessToken: string): Promise<Track[]> {
  const tryPlaylistLL = async (): Promise<Track[]> => {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/playlistItems?playlistId=LL&part=snippet,contentDetails&maxResults=50',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) return [];

      return data.items.map((item: any) => {
        const snippet = item.snippet || {};
        const contentDetails = item.contentDetails || {};
        const vidId = contentDetails.videoId || snippet.resourceId?.videoId || item.id;
        const thumbnail =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

        const channel = snippet.videoOwnerChannelTitle || snippet.channelTitle || 'YouTube Artist';
        const { title, artist } = sanitizeYouTubeTitle(snippet.title, channel);

        return {
          id: `yt-${vidId}`,
          youtubeId: vidId,
          title,
          artist,
          album: 'YouTube Liked Videos',
          duration: 210,
          thumbnailUrl: thumbnail,
          source: 'youtube',
          mediaUrl: `https://www.youtube.com/watch?v=${vidId}`,
          genre: 'YouTube Liked',
          year: snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : 2024,
        };
      });
    } catch {
      return [];
    }
  };

  const tryRatingLike = async (): Promise<Track[]> => {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/videos?myRating=like&part=snippet,contentDetails&maxResults=50',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) return [];
      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) return [];

      return data.items.map((item: any) => {
        const snippet = item.snippet || {};
        const contentDetails = item.contentDetails || {};
        const durationSeconds = parseYouTubeDuration(contentDetails.duration);
        const thumbnail =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;

        const { title, artist } = sanitizeYouTubeTitle(snippet.title, snippet.channelTitle);

        return {
          id: `yt-${item.id}`,
          youtubeId: item.id,
          title,
          artist,
          album: 'YouTube Liked Videos',
          duration: durationSeconds,
          thumbnailUrl: thumbnail,
          source: 'youtube',
          mediaUrl: `https://www.youtube.com/watch?v=${item.id}`,
          genre: 'YouTube Liked',
          year: snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : 2024,
        };
      });
    } catch {
      return [];
    }
  };

  try {
    const fromLL = await tryPlaylistLL();
    if (fromLL.length > 0) return fromLL;
    return await tryRatingLike();
  } catch (err) {
    console.warn('Failed to fetch user YouTube liked videos:', err);
    return [];
  }
}

/**
 * Generate contextually matching "Up Next" radio queue when user plays any track
 */
export async function generateUpNextRadio(seedTrack: Track): Promise<Track[]> {
  try {
    const cleanArtist = seedTrack.artist?.replace(/ - Topic|VEVO/gi, '').trim();
    const query = cleanArtist && cleanArtist !== 'YouTube Artist'
      ? `${cleanArtist} radio audio`
      : `${seedTrack.title} radio`;

    const radioCandidates = await searchYouTubeMusic(query, 'music');
    // Filter out duplicate of seed track if present
    const filtered = radioCandidates.filter((t) => t.youtubeId !== seedTrack.youtubeId);
    return filtered.length > 0 ? filtered : [];
  } catch (err) {
    console.warn('Up Next radio generation notice:', err);
    return [];
  }
}

/**
 * Fetch the authenticated user's personal YouTube playlists
 */
export async function fetchUserYouTubePlaylists(accessToken: string): Promise<Playlist[]> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?mine=true&part=snippet,contentDetails&maxResults=10',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    const playlists: Playlist[] = data.items.map((item: any) => {
      const snippet = item.snippet || {};
      const thumbnail =
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

      return {
        id: `yt-pl-${item.id}`,
        name: snippet.title || 'YouTube Playlist',
        description: snippet.description || 'Synced from your YouTube Account',
        coverUrl: thumbnail,
        tracks: [],
        createdAt: snippet.publishedAt || new Date().toISOString(),
        isAiGenerated: false,
      };
    });

    return playlists;
  } catch (err) {
    console.warn('Failed to fetch user YouTube playlists:', err);
    return [];
  }
}

export interface RecommendationResult {
  quickPicks: Track[];
  similarToTopArtist: {
    artistName: string;
    tracks: Track[];
  } | null;
  supermix: Track[];
}

/**
 * YouTube Music Recommendation Engine:
 * Generates genuine algorithmic candidate recommendations based on the user's real YouTube history & liked music
 */
export async function generateYouTubeMusicRecommendations(
  userLikedTracks: Track[]
): Promise<RecommendationResult> {
  // If the user has liked tracks, extract top artists and genres
  if (userLikedTracks.length > 0) {
    // 1. Frequency count of user's listened artists
    const artistCounts: Record<string, number> = {};
    for (const track of userLikedTracks) {
      const artist = track.artist?.replace(/ - Topic|VEVO/gi, '').trim();
      if (artist && artist !== 'YouTube Artist') {
        artistCounts[artist] = (artistCounts[artist] || 0) + 1;
      }
    }

    const sortedArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const topArtist = sortedArtists[0] || userLikedTracks[0].artist;
    const secondaryArtists = sortedArtists.slice(1, 4);

    try {
      // 2. Fetch "Similar to [Top Artist]" recommendations
      const similarTracks = await searchYouTubeMusic(`${topArtist} radio audio`, 'music');
      const filteredSimilar = similarTracks
        .filter((t) => !userLikedTracks.some((liked) => liked.youtubeId === t.youtubeId))
        .slice(0, 6);

      // 3. Fetch "Quick Picks" (deep cuts and fresh releases from user's artists)
      const quickPickQueries = [topArtist, ...secondaryArtists].slice(0, 2);
      const quickPicksRaw = await Promise.all(
        quickPickQueries.map((a) => searchYouTubeMusic(`${a} top songs`, 'music'))
      );
      const quickPicks = quickPicksRaw
        .flat()
        .filter((t) => !userLikedTracks.some((liked) => liked.youtubeId === t.youtubeId))
        .slice(0, 6);

      // 4. Construct My Supermix (blend of user's liked favorites + collaborative recommendations)
      const supermix = [
        ...userLikedTracks.slice(0, 3),
        ...filteredSimilar.slice(0, 3),
      ].sort(() => Math.random() - 0.5);

      return {
        quickPicks: quickPicks.length > 0 ? quickPicks : userLikedTracks.slice(0, 6),
        similarToTopArtist: {
          artistName: topArtist,
          tracks: filteredSimilar.length > 0 ? filteredSimilar : userLikedTracks.slice(0, 6),
        },
        supermix: supermix.length > 0 ? supermix : userLikedTracks.slice(0, 6),
      };
    } catch (err) {
      console.warn('Recommendation generation error, using direct liked library:', err);
      return {
        quickPicks: userLikedTracks.slice(0, 6),
        similarToTopArtist: {
          artistName: topArtist,
          tracks: userLikedTracks.slice(0, 6),
        },
        supermix: userLikedTracks.slice(0, 6),
      };
    }
  }

  // Fallback for non-logged-in users: Clean, warm natural studio acoustic starter picks
  // (Zero "Blinding Lights" pop repetition)
  try {
    const naturalStudioTracks = await searchYouTubeMusic('warm acoustic indie folk studio session', 'music');
    if (naturalStudioTracks.length > 0) {
      return {
        quickPicks: naturalStudioTracks.slice(0, 6),
        similarToTopArtist: {
          artistName: 'Acoustic & Studio Masters',
          tracks: naturalStudioTracks.slice(0, 6),
        },
        supermix: naturalStudioTracks.slice(0, 6),
      };
    }
  } catch (err) {
    console.warn('Starter recommendation error:', err);
  }

  return {
    quickPicks: [],
    similarToTopArtist: null,
    supermix: [],
  };
}
