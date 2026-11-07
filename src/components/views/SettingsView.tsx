import React, { useState } from 'react';
import { AppSettings, ListeningQuality } from '../../types/media';
import { THEMES, AppThemeId } from '../../utils/themeConfig';
import { 
  Settings, Sliders, Sparkles, Volume2, Moon, 
  Trash2, ShieldCheck, Check, Music, Layers, Palette,
  Download, Archive, Radio, Waves, Sun, Eye, Cpu, Smartphone
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  accentColorHex: string;
  onOpenAppModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  accentColorHex,
  onOpenAppModal,
}) => {
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleClearCache = () => {
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  const handleDownloadProjectZip = () => {
    setIsZipping(true);
    const link = document.createElement('a');
    link.href = '/api/download-project';
    link.setAttribute('download', 'sonnet-player.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsZipping(false);
    }, 1200);
  };

  const currentTheme = THEMES[settings.appTheme] || THEMES['apple-music'];
  const isLight = currentTheme.category === 'light';

  const themeList = Object.values(THEMES);
  const darkThemes = themeList.filter((t) => t.category === 'dark');
  const lightThemes = themeList.filter((t) => t.category === 'light');

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-8 select-none pb-36 md:pb-12">
      {/* View Header */}
      <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Settings className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Studio Settings & Preferences
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Choose iconic platform themes, studio listening fidelity, custom bitrate pipeline, and download options.
          </p>
        </div>

        {/* Project ZIP Download Shortcut */}
        <button
          onClick={handleDownloadProjectZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
          style={{
            backgroundColor: currentTheme.colors.accent,
            boxShadow: `0 4px 16px ${currentTheme.colors.accent}40`,
          }}
          title="Download the entire project as a clean .ZIP archive"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{isZipping ? 'Downloading ZIP...' : 'Download Project ZIP'}</span>
        </button>
      </div>

      {/* 1. Theme Engine & UI Aesthetics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
            Application Theme & Design Language
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Active: <span className="font-bold text-white">{currentTheme.name}</span>
          </span>
        </div>

        {/* Dark Mode Themes Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Moon className="w-3 h-3 text-slate-400" />
            Dark & Studio Themes
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {darkThemes.map((th) => {
              const isSelected = settings.appTheme === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => onUpdateSettings({ ...settings, appTheme: th.id })}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-white/40 ring-1 shadow-xl'
                      : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: th.colors.surface,
                    borderColor: isSelected ? th.colors.accent : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: th.colors.accent }}
                      />
                      <span className="text-xs font-bold text-white">{th.name}</span>
                    </div>
                    <span
                      className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        backgroundColor: `${th.colors.accent}20`,
                        color: th.colors.accent,
                      }}
                    >
                      {th.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {th.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                    <div
                      className="w-4 h-4 rounded-md border border-white/10"
                      style={{ backgroundColor: th.colors.bg }}
                    />
                    <div
                      className="w-4 h-4 rounded-md border border-white/10"
                      style={{ backgroundColor: th.colors.surface }}
                    />
                    <div
                      className="w-4 h-4 rounded-md shadow-sm"
                      style={{ backgroundColor: th.colors.accent }}
                    />
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Light Mode Themes Grid */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Sun className="w-3 h-3 text-amber-400" />
            Light & Day Themes
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {lightThemes.map((th) => {
              const isSelected = settings.appTheme === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => onUpdateSettings({ ...settings, appTheme: th.id })}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-white/40 ring-1 shadow-xl'
                      : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: th.colors.surface,
                    borderColor: isSelected ? th.colors.accent : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: th.colors.accent }}
                      />
                      <span className="text-xs font-bold text-slate-900">{th.name}</span>
                    </div>
                    <span
                      className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        backgroundColor: `${th.colors.accent}20`,
                        color: th.colors.accent,
                      }}
                    >
                      {th.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {th.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                    <div
                      className="w-4 h-4 rounded-md border border-slate-300"
                      style={{ backgroundColor: th.colors.bg }}
                    />
                    <div
                      className="w-4 h-4 rounded-md border border-slate-300"
                      style={{ backgroundColor: th.colors.surface }}
                    />
                    <div
                      className="w-4 h-4 rounded-md shadow-sm"
                      style={{ backgroundColor: th.colors.accent }}
                    />
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. High-Quality Listening & Custom Quality Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
            Listening Fidelity & Audio Pipeline
          </h3>
          <span 
            className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
            style={{
              backgroundColor: `${currentTheme.colors.accent}20`,
              color: currentTheme.colors.accent,
            }}
          >
            {settings.listeningQuality.toUpperCase()}
          </span>
        </div>

        {/* Quality Presets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {[
            { id: 'lossless' as const, label: 'Studio Lossless', sub: 'FLAC 24-bit 96kHz' },
            { id: 'high_aac' as const, label: 'High Fidelity', sub: 'AAC 320 kbps' },
            { id: 'standard' as const, label: 'Balanced', sub: 'MP3 192 kbps' },
            { id: 'saver' as const, label: 'Data Saver', sub: 'Opus 96 kbps' },
            { id: 'custom' as const, label: 'Custom Quality', sub: 'DSP Pipeline' },
          ].map((preset) => {
            const isSelected = settings.listeningQuality === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onUpdateSettings({ ...settings, listeningQuality: preset.id })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-white/30 text-white shadow-lg'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: isSelected ? currentTheme.colors.surface : undefined,
                  borderColor: isSelected ? currentTheme.colors.accent : undefined,
                }}
              >
                <span className="text-xs font-bold block text-white">{preset.label}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{preset.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Audio Pipeline Controls (Displayed when 'custom' is active) */}
        {settings.listeningQuality === 'custom' && (
          <div className="p-5 rounded-3xl bg-white/5 border border-white/15 space-y-5 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Custom Hardware Audio Pipeline
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Bitrate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Custom Stream Bitrate</span>
                  <span className="font-mono font-bold" style={{ color: currentTheme.colors.accent }}>
                    {settings.customBitrate} kbps
                  </span>
                </div>
                <input
                  type="range"
                  min={64}
                  max={1411}
                  step={32}
                  value={settings.customBitrate}
                  onChange={(e) => onUpdateSettings({ ...settings, customBitrate: Number(e.target.value) })}
                  className="w-full h-1.5 cursor-pointer accent-[#FA2D48]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>64 kbps (Eco)</span>
                  <span>320 kbps (Hi-Fi)</span>
                  <span>1411 kbps (CD Lossless)</span>
                </div>
              </div>

              {/* Sample Rate Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">DAC Sample Frequency</span>
                  <span className="font-mono font-bold" style={{ color: currentTheme.colors.accent }}>
                    {(settings.customSampleRate / 1000).toFixed(1)} kHz
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[44100, 48000, 96000, 192000].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => onUpdateSettings({ ...settings, customSampleRate: rate })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                        settings.customSampleRate === rate
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Spatial Audio Width */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Stereo Spatializer / 3D Soundstage</span>
                  <span className="font-mono font-bold" style={{ color: currentTheme.colors.accent }}>
                    {settings.spatialAudioWidth}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={10}
                  value={settings.spatialAudioWidth}
                  onChange={(e) => onUpdateSettings({ ...settings, spatialAudioWidth: Number(e.target.value) })}
                  className="w-full h-1.5 cursor-pointer accent-[#FA2D48]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Mono)</span>
                  <span>100% (Standard Stereo)</span>
                  <span>200% (Ultra-Wide 3D)</span>
                </div>
              </div>

              {/* Audio Buffer Size */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Audio DSP Buffer Block</span>
                  <span className="font-mono font-bold" style={{ color: currentTheme.colors.accent }}>
                    {settings.customBufferSize} samples
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[512, 1024, 2048, 4096].map((buf) => (
                    <button
                      key={buf}
                      onClick={() => onUpdateSettings({ ...settings, customBufferSize: buf })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                        settings.customBufferSize === buf
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {buf}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Audio Normalization & Crossfade */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
          Playback DSP Utilities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Crossfade Timing */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Crossfade Duration</span>
              <span className="text-[11px] font-mono text-slate-400">
                {settings.crossfade === 0 ? 'Disabled' : `${settings.crossfade} seconds`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={settings.crossfade}
              onChange={(e) => onUpdateSettings({ ...settings, crossfade: Number(e.target.value) })}
              className="w-full h-1.5 cursor-pointer accent-[#FA2D48]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0s</span>
              <span>6s</span>
              <span>12s</span>
            </div>
          </div>

          {/* ReplayGain Normalization */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Smart ReplayGain Normalization</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Balances volume levels between tracks to eliminate sudden sound spikes.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, replayGain: !settings.replayGain })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                settings.replayGain ? 'bg-[#FA2D48]' : 'bg-white/10'
              }`}
              style={{ backgroundColor: settings.replayGain ? currentTheme.colors.accent : undefined }}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.replayGain ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Sleep Timer & Offline Cache */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Moon className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
          Timer & Storage Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sleep Timer */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Sleep Timer Countdown</span>
              <span className="text-[11px] font-mono text-slate-400">
                {settings.sleepTimerMinutes === 0 ? 'Off' : `${settings.sleepTimerMinutes} min`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 15, 30, 45, 60].map((mins) => {
                const isActive = settings.sleepTimerMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => onUpdateSettings({ ...settings, sleepTimerMinutes: mins })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-md font-bold'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {mins === 0 ? 'Off' : `${mins}m`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage & Waveform Cache */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Offline Audio Cache</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Waveform buffers, decoded lyrics, and project zip files.
              </p>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 border border-white/5 shrink-0"
            >
              {clearedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Trash2 className="w-4 h-4" />}
              <span>{clearedNotice ? 'Cleared!' : 'Clear Cache'}</span>
            </button>
          </div>

          {/* Native Mobile App & Android APK */}
          {onOpenAppModal && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-[#1c1c1c] to-[#141414] border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Native Mobile App & Android .APK
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Install native standalone WebAPK on Android, Add to Home Screen on iOS, or download APK source.
                </p>
              </div>
              <button
                onClick={onOpenAppModal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all shrink-0"
              >
                Install App / Get APK
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Interaction & Tactile Feedback */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
          Interaction & Tactile Feedback
        </h3>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Haptic Feedback</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enable tactile vibration for play/pause, volume scrubbing, and card interactions.
            </p>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, hapticFeedback: !settings.hapticFeedback })}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
              settings.hapticFeedback ? 'bg-[#FA2D48]' : 'bg-white/10'
            }`}
            style={{ backgroundColor: settings.hapticFeedback ? currentTheme.colors.accent : undefined }}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.hapticFeedback ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="text-xs font-bold text-white block">
            Sonnet Music Player Studio · Production Release
          </span>
          <p className="text-[11px] text-slate-400">
            Open-source architecture with native Web Audio DSP pipeline and YouTube streaming.
          </p>
        </div>
      </div>
    </div>
  );
};
