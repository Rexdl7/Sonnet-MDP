/**
 * Procedural Music Generator for Sonnet Player.
 * Generates rich musical audio waveforms (Synthwave, Lo-Fi, Pop, Classical, Ambient)
 * encoded as standard WAV audio blobs. This guarantees 100% offline, zero-CORS,
 * instant playback that powers the 10-band equalizer and spectrum visualizer.
 */

// Helper to write string into DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Convert audio samples [-1, 1] to WAV Blob URL
function encodeWavBlob(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF header
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // channel count (1 for mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 channel * 2 bytes/sample)
  view.setUint32(28, sampleRate * 2, true);
  // block align (1 channel * 2 bytes/sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM 16-bit samples with soft clipping
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Cache of generated audio URLs by track ID to avoid re-generating
const audioBlobCache: Map<string, string> = new Map();

/**
 * Creates a musical audio track with drums, bass, chords, and melody.
 */
export function getOrCreateProceduralTrackUrl(
  trackId: string,
  genre: string = 'Pop',
  durationSeconds: number = 60
): string {
  if (audioBlobCache.has(trackId)) {
    return audioBlobCache.get(trackId)!;
  }

  const sampleRate = 22050; // High efficiency & instant synthesis
  const totalSamples = Math.floor(sampleRate * Math.min(durationSeconds, 90));
  const samples = new Float32Array(totalSamples);

  // Determine musical style parameters based on genre
  let bpm = 120;
  let rootFreq = 220; // A3
  let chordProgression = [0, 5, 3, 7]; // A minor, D minor, F major, E minor
  let hasDrums = true;
  let filterType = 'sawtooth';

  const g = genre.toLowerCase();
  if (g.includes('synth') || g.includes('retro')) {
    bpm = 118;
    rootFreq = 130.81; // C3
    chordProgression = [0, -4, -2, -5];
    filterType = 'sawtooth';
  } else if (g.includes('lo-fi') || g.includes('chill')) {
    bpm = 78;
    rootFreq = 146.83; // D3
    chordProgression = [0, 3, 5, 2];
    filterType = 'triangle';
  } else if (g.includes('classical') || g.includes('ambient')) {
    bpm = 60;
    rootFreq = 130.81; // C3
    chordProgression = [0, 7, 5, 4];
    hasDrums = false;
    filterType = 'sine';
  } else if (g.includes('rock')) {
    bpm = 132;
    rootFreq = 164.81; // E3
    chordProgression = [0, 3, 5, 0];
    filterType = 'sawtooth';
  }

  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const barTime = t % (barDuration * chordProgression.length);
    const chordIndex = Math.floor(barTime / barDuration) % chordProgression.length;
    const semitoneOffset = chordProgression[chordIndex];
    const baseFreq = rootFreq * Math.pow(2, semitoneOffset / 12);

    let sample = 0;

    // 1. Chords (Pad / Polyphonic harmony)
    const chordNotes = [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983]; // Root, 3rd, 5th
    for (const freq of chordNotes) {
      if (filterType === 'sawtooth') {
        sample += 0.08 * (2 * ((t * freq) % 1) - 1);
      } else if (filterType === 'triangle') {
        sample += 0.1 * (2 * Math.abs(2 * ((t * freq) % 1) - 1) - 1);
      } else {
        sample += 0.12 * Math.sin(2 * Math.PI * freq * t);
      }
    }

    // 2. Bassline (Punchy sub bass on every 8th note)
    const bassNoteTime = (t % (beatDuration / 2)) / (beatDuration / 2);
    const bassEnv = Math.exp(-bassNoteTime * 4);
    const bassFreq = baseFreq / 2;
    sample += 0.22 * Math.sin(2 * Math.PI * bassFreq * t) * bassEnv;

    // 3. Arpeggio / Melodic Lead
    const arpIndex = Math.floor((t % beatDuration) / (beatDuration / 4)) % 4;
    const arpFreqMultiplier = [1, 1.2599, 1.4983, 2][arpIndex];
    const arpFreq = baseFreq * 2 * arpFreqMultiplier;
    const arpNoteTime = (t % (beatDuration / 4)) / (beatDuration / 4);
    const arpEnv = Math.exp(-arpNoteTime * 6);
    sample += 0.15 * Math.sin(2 * Math.PI * arpFreq * t) * arpEnv;

    // 4. Rhythm & Drums (Kick on 1 & 3, Snare on 2 & 4, Hi-hat on 8ths)
    if (hasDrums) {
      const beatInBar = (t % barDuration) / beatDuration;
      const beatPhase = beatInBar % 1;

      // Kick drum on beats 0 and 2
      if (Math.floor(beatInBar) === 0 || Math.floor(beatInBar) === 2) {
        const kickEnv = Math.exp(-beatPhase * 14);
        const kickFreq = 120 * Math.exp(-beatPhase * 25) + 45;
        sample += 0.35 * Math.sin(2 * Math.PI * kickFreq * t) * kickEnv;
      }

      // Snare drum on beats 1 and 3
      if (Math.floor(beatInBar) === 1 || Math.floor(beatInBar) === 3) {
        const snareEnv = Math.exp(-beatPhase * 12);
        const noise = (Math.random() * 2 - 1) * 0.25;
        const tone = Math.sin(2 * Math.PI * 180 * t) * 0.15;
        sample += (noise + tone) * snareEnv;
      }

      // Hi-hat on every 8th note
      const hatPhase = (t % (beatDuration / 2)) / (beatDuration / 2);
      const hatEnv = Math.exp(-hatPhase * 30);
      sample += (Math.random() * 2 - 1) * 0.06 * hatEnv;
    }

    samples[i] = sample;
  }

  const url = encodeWavBlob(samples, sampleRate);
  audioBlobCache.set(trackId, url);
  return url;
}
