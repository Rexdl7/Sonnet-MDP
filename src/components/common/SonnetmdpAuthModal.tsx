import React, { useState } from 'react';
import { UserAuthProfile } from '../../types/media';
import { 
  X, ShieldCheck, CheckCircle2, Youtube, 
  Radio, RefreshCw, UserCheck, Sparkles
} from 'lucide-react';

interface SonnetmdpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAuthProfile | null;
  onLogin: () => Promise<any>;
  onLogout: () => Promise<void>;
  accentColorHex?: string;
  likedCount?: number;
}

export const SonnetmdpAuthModal: React.FC<SonnetmdpAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  accentColorHex = '#D97736',
  likedCount = 0,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await onLogin();
      if (user) {
        onClose();
      }
    } catch (err: any) {
      console.warn('Google Auth notice:', err);
      setErrorMessage(err?.message || 'Could not complete Google Sign-In. Please check your browser popup settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      {/* Soft Ambient Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog (Warm Natural Dark Studio) */}
      <div className="relative w-full max-w-md bg-[#18181B] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 text-[#F2EFE9] space-y-5 animate-in zoom-in-95 duration-200 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md font-semibold text-white text-base tracking-tight"
              style={{ backgroundColor: accentColorHex }}
            >
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2EFE9] tracking-tight">YouTube Music Sync</h3>
              </div>
              <p className="text-xs text-[#A09D96] mt-0.5">
                Connect your Google Account to sync your real listening history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A09D96] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature List */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs text-[#D1CECA]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#D97736] shrink-0" />
            <span>Syncs your real liked music and YouTube history</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#D97736] shrink-0" />
            <span>Generates authentic Quick Picks & Similar to your top artists</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D97736] shrink-0" />
            <span>Replaces static filler with your actual taste profile</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        {currentUser ? (
          /* Already Signed In */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#222227] border border-white/10 flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D97736]"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base"
                  style={{ backgroundColor: accentColorHex }}
                >
                  {(currentUser.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white truncate">{currentUser.displayName}</h4>
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-[#A09D96] truncate">{currentUser.email}</p>
                <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
                  &bull; YouTube Account Connected ({likedCount} Liked Songs Synced)
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-white border border-red-500/20 font-semibold text-xs transition-colors"
            >
              Disconnect YouTube Account
            </button>
          </div>
        ) : (
          /* Sign In Actions */
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-semibold text-sm flex items-center justify-center gap-3 shadow-md active:scale-98 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Connecting to YouTube...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Connect with Google Account</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-[#A09D96] text-center">
              Requires read-only permission to view your YouTube liked music
            </p>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#717171] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D97736]" />
          <span>Official Google OAuth &bull; Read-Only Access</span>
        </div>
      </div>
    </div>
  );
};
