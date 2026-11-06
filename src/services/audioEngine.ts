import { EQUALIZER_FREQUENCIES, DEFAULT_EQ_PRESETS } from '../data/curatedTracks';
import { EqualizerPreset } from '../types/media';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private preampGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentElement: HTMLMediaElement | null = null;
  private isConnected = false;

  private currentGains: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private currentPreamp = 0;

  public init(mediaElement: HTMLMediaElement): boolean {
    if (this.currentElement === mediaElement && this.isConnected) {
      return true;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API is not supported in this browser environment.');
        return false;
      }

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Check if element is already attached to avoid "MediaElementAudioSource outputs can only be connected to once"
      this.currentElement = mediaElement;

      if (!this.sourceNode) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(mediaElement);
        } catch (err) {
          console.warn('Could not create MediaElementSourceNode:', err);
          return false;
        }
      }

      // Build Preamp Gain Node
      if (!this.preampGain) {
        this.preampGain = this.audioCtx.createGain();
        this.preampGain.gain.value = Math.pow(10, this.currentPreamp / 20);
      }

      // Build 10 BiquadFilterNodes
      if (this.filters.length === 0) {
        this.filters = EQUALIZER_FREQUENCIES.map((freq, index) => {
          const filter = this.audioCtx!.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1.414; // Standard Q factor for octave bands
          filter.gain.value = this.currentGains[index] || 0;
          return filter;
        });
      }

      // Build AnalyserNode
      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;
      }

      // Connect serial chain:
      // Source -> Preamp -> Filter[0] -> ... -> Filter[9] -> Analyser -> Destination
      if (!this.isConnected) {
        this.sourceNode.connect(this.preampGain);
        let prevNode: AudioNode = this.preampGain;

        for (const filter of this.filters) {
          prevNode.connect(filter);
          prevNode = filter;
        }

        prevNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.isConnected = true;
      }

      return true;
    } catch (error) {
      console.warn('AudioEngine initialization error:', error);
      return false;
    }
  }

  public resumeContext(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setBandGain(index: number, dbGain: number): void {
    if (index < 0 || index >= this.filters.length) return;
    this.currentGains[index] = dbGain;
    const filter = this.filters[index];
    if (filter) {
      filter.gain.setTargetAtTime(dbGain, this.audioCtx?.currentTime || 0, 0.05);
    }
  }

  public setPreamp(dbGain: number): void {
    this.currentPreamp = dbGain;
    if (this.preampGain) {
      const linearGain = Math.pow(10, dbGain / 20);
      this.preampGain.gain.setTargetAtTime(linearGain, this.audioCtx?.currentTime || 0, 0.05);
    }
  }

  public applyPreset(preset: EqualizerPreset): void {
    preset.gains.forEach((gain, idx) => {
      this.setBandGain(idx, gain);
    });
    this.setPreamp(preset.preamp);
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      // Cast to any to satisfy DOM AnalyserNode typing across TypeScript targets
      (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public getWaveformData(array: Uint8Array): void {
    if (this.analyser) {
      // Cast to any to satisfy DOM AnalyserNode typing across TypeScript targets
      (this.analyser as unknown as { getByteTimeDomainData: (arr: Uint8Array) => void }).getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
  }

  public getCurrentGains(): number[] {
    return [...this.currentGains];
  }

  public getCurrentPreamp(): number {
    return this.currentPreamp;
  }
}

export const audioEngine = new AudioEngine();
