import React, { useState } from 'react';
import { EQUALIZER_FREQUENCIES, EQUALIZER_LABELS, DEFAULT_EQ_PRESETS } from '../../data/curatedTracks';
import { EqualizerPreset } from '../../types/media';
import { audioEngine } from '../../services/audioEngine';
import { SpectrumVisualizer } from '../player/SpectrumVisualizer';
import { Sliders, RotateCcw, Volume2, Sparkles, Check, Zap } from 'lucide-react';

interface EqualizerViewProps {
  isPlaying: boolean;
  accentColorHex?: string;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  isPlaying,
  accentColorHex = '#FA2D48',
}) => {
  const [eqEnabled, setEqEnabled] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('flat');
  const [gains, setGains] = useState<number[]>(audioEngine.getCurrentGains());
  const [preamp, setPreamp] = useState<number>(audioEngine.getCurrentPreamp());

  const handleGainChange = (index: number, val: number) => {
    const newGains = [...gains];
    newGains[index] = val;
    setGains(newGains);
    if (eqEnabled) {
      audioEngine.setBandGain(index, val);
    }
    setSelectedPreset('custom');
  };

  const handlePreampChange = (val: number) => {
    setPreamp(val);
    if (eqEnabled) {
      audioEngine.setPreamp(val);
    }
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    setSelectedPreset(preset.id);
    setGains([...preset.gains]);
    setPreamp(preset.preamp);
    if (eqEnabled) {
      audioEngine.applyPreset(preset);
    }
  };

  const handleToggleEq = () => {
    const nextState = !eqEnabled;
    setEqEnabled(nextState);
    if (nextState) {
      gains.forEach((g, i) => audioEngine.setBandGain(i, g));
      audioEngine.setPreamp(preamp);
    } else {
      gains.forEach((_, i) => audioEngine.setBandGain(i, 0));
      audioEngine.setPreamp(0);
    }
  };

  const handleReset = () => {
    const flat = DEFAULT_EQ_PRESETS.find((p) => p.id === 'flat') || DEFAULT_EQ_PRESETS[0];
    handleSelectPreset(flat);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-6 select-none pb-36 md:pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#FA2D48]" style={{ color: accentColorHex }} />
            <h1 className="text-2xl font-bold tracking-tight text-white">10-Band Graphic Studio Equalizer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hardware-calibrated Web Audio DSP with octave-band peaking biquad filters.
          </p>
        </div>

        {/* Master EQ Toggle & Reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleEq}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              eqEnabled
                ? 'text-white'
                : 'bg-white/10 text-slate-400 hover:bg-white/15'
            }`}
            style={{
              backgroundColor: eqEnabled ? accentColorHex : undefined,
              boxShadow: eqEnabled ? `0 4px 14px ${accentColorHex}40` : undefined,
            }}
          >
            <Zap className={`w-3.5 h-3.5 ${eqEnabled ? 'fill-current' : ''}`} />
            <span>Equalizer {eqEnabled ? 'Active' : 'Bypassed'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5"
            title="Reset to Flat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FA2D48]" style={{ color: accentColorHex }} />
          <span>Acoustic Studio Presets</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_EQ_PRESETS.map((preset) => {
            const isCurrent = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : 'bg-slate-900/40 backdrop-blur-md text-slate-300 hover:bg-white/10 border border-white/5 shadow-sm'
                }`}
              >
                {isCurrent && <Check className="w-3.5 h-3.5 text-[#FA2D48]" style={{ color: accentColorHex }} />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Spectrum Analyzer Display */}
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#FA2D48]" style={{ color: accentColorHex }} />
            Live Audio Signal Spectrum
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPlaying ? 'Active frequency band distribution' : 'Playback paused — ready for input signal'}
          </p>
        </div>
        <div className="w-full sm:w-64 h-12 bg-black/40 rounded-xl p-2 flex items-center justify-center border border-white/5">
          <SpectrumVisualizer isPlaying={isPlaying} mode="bars" className="w-full h-full" barColor={accentColorHex} />
        </div>
      </div>

      {/* 10-Band Sliders Stage */}
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Frequencies (Gain Range: -12 dB to +12 dB)
          </span>
          <span className="text-xs text-slate-500 font-mono">0 dB = Unity Gain</span>
        </div>

        <div className="grid grid-cols-11 gap-2 md:gap-4 items-end justify-items-center">
          {/* Preamp Master Fader */}
          <div className="flex flex-col items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
            <span className="text-[10px] font-bold uppercase" style={{ color: accentColorHex }}>Pre-Amp</span>
            <span className="text-xs font-mono tabular-nums text-white font-semibold">
              {preamp > 0 ? `+${preamp}` : preamp} dB
            </span>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={preamp}
              onChange={(e) => handlePreampChange(Number(e.target.value))}
              disabled={!eqEnabled}
              className="vertical-slider cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-medium">Gain</span>
          </div>

          {/* 10 Equalizer Frequency Bands */}
          {EQUALIZER_LABELS.map((label, idx) => {
            const currentGain = gains[idx] || 0;
            return (
              <div key={label} className="flex flex-col items-center gap-3">
                <span className="text-[11px] font-mono tabular-nums text-slate-300 font-medium">
                  {currentGain > 0 ? `+${currentGain}` : currentGain}
                </span>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={currentGain}
                  onChange={(e) => handleGainChange(idx, Number(e.target.value))}
                  disabled={!eqEnabled}
                  className="vertical-slider cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-slate-300 whitespace-nowrap">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Audio DSP Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-md">
          <span className="font-semibold text-white block mb-1">Sub Bass (32Hz - 125Hz)</span>
          Controls deep low-end resonance and punch. Boost for dance and electronic textures.
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-md">
          <span className="font-semibold text-white block mb-1">Mid Range (250Hz - 2kHz)</span>
          Governs human vocal warmth, acoustic guitars, and keyboard body.
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-md">
          <span className="font-semibold text-white block mb-1">High Presence (4kHz - 16kHz)</span>
          Adds sparkle, air, and delicate string overtones for open staging.
        </div>
      </div>
    </div>
  );
};
