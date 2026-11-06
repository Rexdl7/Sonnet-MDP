import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { 
  Smartphone, Download, Check, X, Sparkles, 
  ShieldCheck, Share, ArrowRight, ExternalLink,
  Layers, Package, Terminal
} from 'lucide-react';
import { SonnetLogo } from './SonnetLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColorHex?: string;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  accentColorHex = '#FF0000',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'instant' | 'apk-package' | 'guide'>('instant');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  const handleDownloadAndroidProject = () => {
    const link = document.createElement('a');
    link.href = '/api/download-android-project';
    link.setAttribute('download', 'sonnet-music-android-project.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden text-white transition-all"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SonnetLogo size={32} glow />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Native Mobile App & APK
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                  Android & iOS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Install Sonnet Music as a native standalone app with offline support
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#0a0a0a] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'border-red-600 text-white font-bold bg-[#141414]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-red-500" />
            <span>1-Tap Native Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk-package')}
            className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'apk-package'
                ? 'border-red-600 text-white font-bold bg-[#141414]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span>Android APK Project</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-red-600 text-white font-bold bg-[#141414]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Build .APK Guide</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Android Native WebAPK & PWA
                    </h4>
                    <p className="text-xs text-slate-400">
                      Chromium on Android builds an official system APK installed directly into your phone's app drawer!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Home screen icon</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Fullscreen standalone window</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Lock screen media playback</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero unknown-sources warnings</span>
                  </div>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sonnet Music is already installed and running as a native app!</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Native App on this Device</span>
                </button>
              ) : isIOS ? (
                <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-sky-400" />
                    <span>Install on iPhone / iPad (iOS Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1">
                    <li>Tap the <strong>Share</strong> button in your Safari bottom toolbar.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>Tap <strong>Add</strong> to launch Sonnet Music in fullscreen!</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/10 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">How to install on Android / Chrome:</p>
                  <p className="text-slate-400">
                    Open your browser menu (⋮) and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Android will create the system WebAPK automatically.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apk-package' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Complete Android Studio Project Package
                    </h4>
                    <p className="text-xs text-slate-400">
                      Contains Capacitor bridge, Gradle scripts, AndroidManifest.xml, and high-res launcher icons.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 pt-1 font-mono text-[11px] bg-black/50 p-2.5 rounded-xl border border-white/5">
                  <p className="text-slate-400"># Build APK with one command:</p>
                  <p className="text-amber-400">./gradlew assembleRelease</p>
                  <p className="text-slate-400 mt-1"># Outputs signed APK at:</p>
                  <p className="text-emerald-400">app/build/outputs/apk/release/app-release.apk</p>
                </div>
              </div>

              <button
                onClick={handleDownloadAndroidProject}
                className="w-full py-3.5 rounded-2xl bg-white text-black hover:bg-slate-200 font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Studio Project (.ZIP)</span>
              </button>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  How to generate .APK using Free Tools
                </h4>

                <p className="text-slate-400">
                  You can turn this web app into a signed <code className="text-red-400">.apk</code> file in 60 seconds using Google's official Bubblewrap or PWA2APK:
                </p>

                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 space-y-1">
                    <span className="font-bold text-white block">Method A: Bubblewrap CLI (Google Official)</span>
                    <p className="font-mono text-[11px] text-emerald-400">
                      npm i -g @bubblewrap/cli<br />
                      bubblewrap init --manifest=https://your-domain.com/manifest.webmanifest<br />
                      bubblewrap build
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 space-y-1">
                    <span className="font-bold text-white block">Method B: PWABuilder (1-Click APK Generator)</span>
                    <p className="text-[11px] text-slate-400">
                      Visit <strong>PWABuilder.com</strong>, paste your app URL, and click <strong>"Package for Android"</strong> to download the ready-to-install <code className="text-amber-400">.apk</code> file!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified PWA & Android TWA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
