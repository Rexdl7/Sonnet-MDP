import { LyricLine } from '../types/media';

/**
 * Parses an LRC formatted string into an array of LyricLine objects sorted chronologically.
 */
export function parseLrcLyrics(lrcString?: string): LyricLine[] {
  if (!lrcString || !lrcString.trim()) {
    return [];
  }

  const lines = lrcString.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip metadata tags like [ar:Artist], [ti:Title], [al:Album]
    if (/^\[(ar|ti|al|by|offset|length):/i.test(trimmed)) {
      continue;
    }

    // Extract all timestamps from the line
    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      // The text is whatever remains after removing all time tags
      const text = trimmed.replace(timeRegex, '').trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const millis = match[3] 
          ? (match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10))
          : 0;
        
        const totalSeconds = minutes * 60 + seconds + millis / 1000;
        result.push({
          time: totalSeconds,
          text: text || '♪', // Use musical note for instrumental passages
        });
      }
    } else if (trimmed.length > 0 && !trimmed.startsWith('[')) {
      // Un-synced plain text lyrics fallback
      result.push({
        time: -1,
        text: trimmed,
      });
    }
  }

  // Sort chronologically by time
  return result.sort((a, b) => a.time - b.time);
}

/**
 * Finds the index of the currently active lyric line given playback time.
 */
export function getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1;
  if (lyrics[0].time === -1) return -1; // Unsynced

  let low = 0;
  let high = lyrics.length - 1;
  let activeIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lyrics[mid].time <= currentTime + 0.15) { // 150ms lead-in for smooth reading
      activeIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return activeIndex;
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
