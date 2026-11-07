import { Track } from '../types/media';
import { INITIAL_TRACKS } from '../data/curatedTracks';

// Robust multi-tier search service that works both in AI Studio dev environment AND when deployed statically/serverless on custom domains
export async function searchYouTubeMusic(query: string, mode: 'music' | 'video' = 'music'): Promise<Track[]> {
  const term = query.trim();
  if (!term) {
    try {
      const res = await fetch('/api/music/trending?category=charts');
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          return data.results;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_TRACKS;
  }

  // Tier 1: Try local Express server proxy (/api/music/search)
  try {
    const res = await fetch(`/api/music/search?q=${encodeURIComponent(term)}&mode=${mode}`);
    const contentType = res.headers.get('content-type') || '';
    
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Local Express search endpoint unavailable, attempting Tier 2 CORS public search proxies...', err);
  }

  // Tier 2: Public Invidious / Piped API search proxy fallbacks for custom domain static deployments
  const publicProxies = [
    `https://invidious.drgns.space/api/v1/search?q=${encodeURIComponent(term)}&type=video`,
    `https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(term)}&type=video`,
    `https://api.piped.video/search?q=${encodeURIComponent(term)}&filter=music_songs`,
  ];

  for (const proxyUrl of publicProxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const items: Track[] = [];

        // Handle Invidious schema
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.videoId || item.title) {
              const id = item.videoId;
              if (!id) continue;
              items.push({
                id: `yt-${id}`,
                youtubeId: id,
                title: (item.title || 'YouTube Music').replace(/[\(\[](Official\s*)?(Music\s*)?(Video|Audio|Lyric\s*Video|HD|4K)[\)\]]/gi, '').trim(),
                artist: item.author || 'YouTube Artist',
                album: mode === 'video' ? 'YouTube Theater' : 'YouTube Music',
                duration: item.lengthSeconds || 210,
                thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                source: 'youtube',
                mediaUrl: `https://www.youtube.com/watch?v=${id}`,
                videoUrl: `https://www.youtube.com/embed/${id}`,
                genre: mode === 'video' ? 'Video' : 'Popular',
                viewCount: item.viewCount ? `${(item.viewCount / 1000).toFixed(0)}K views` : 'Verified',
                publishedAt: item.publishedText || 'Now',
                mediaCategory: mode === 'video' ? 'video' : 'music',
              });
              if (items.length >= 24) break;
            }
          }
        }
        // Handle Piped schema
        else if (data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            const urlMatch = (item.url || '').match(/v=([a-zA-Z0-9_-]{11})/);
            const id = urlMatch ? urlMatch[1] : item.id;
            if (!id) continue;

            items.push({
              id: `yt-${id}`,
              youtubeId: id,
              title: (item.title || 'YouTube Song').replace(/[\(\[](Official\s*)?(Music\s*)?(Video|Audio|Lyric\s*Video|HD|4K)[\)\]]/gi, '').trim(),
              artist: item.uploaderName || 'YouTube Artist',
              album: mode === 'video' ? 'YouTube Theater' : 'YouTube Music',
              duration: item.duration || 210,
              thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
              source: 'youtube',
              mediaUrl: `https://www.youtube.com/watch?v=${id}`,
              videoUrl: `https://www.youtube.com/embed/${id}`,
              genre: mode === 'video' ? 'Video' : 'Popular',
              viewCount: item.views ? `${(item.views / 1000).toFixed(0)}K views` : 'Verified',
              publishedAt: item.uploadedDate || 'Now',
              mediaCategory: mode === 'video' ? 'video' : 'music',
            });
            if (items.length >= 24) break;
          }
        }

        if (items.length > 0) {
          return items;
        }
      }
    } catch {
      // Try next proxy
    }
  }

  // Tier 3: Return curated initial tracks if all external searches fail
  return INITIAL_TRACKS;
}
