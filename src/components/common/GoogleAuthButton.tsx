import React, { useState } from 'react';
import { UserAuthProfile } from '../../types/media';
import { Cloud, LogOut, CheckCircle2, ShieldCheck, Sparkles, User as UserIcon, X } from 'lucide-react';

interface GoogleAuthButtonProps {
  user: UserAuthProfile | null;
  loading: boolean;
  onLogin: () => Promise<any>;
  onLogout: () => Promise<void>;
  accentColorHex?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  user,
  loading,
  onLogin,
  onLogout,
  accentColorHex = '#FF0000',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      await onLogin();
      setIsOpen(false);
    } catch {
      // handled in hook
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await onLogout();
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={handleSignIn}
          disabled={isLoggingIn}
          className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 bg-white text-black hover:bg-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          title="Sign in with Google to sync your playlists and liked songs to Firebase"
        >
          {/* Google SVG Icon */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
          <span className="hidden sm:inline">Sign in</span>
        </button>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#212121] hover:bg-[#303030] border border-white/10 text-xs text-white transition-all active:scale-95 group"
        title="Account & Cloud Sync"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Profile'}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: accentColorHex }}
          >
            {(user.displayName || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="max-w-[80px] md:max-w-[110px] truncate font-medium text-slate-200 group-hover:text-white">
          {user.displayName?.split(' ')[0] || 'User'}
        </span>
        <Cloud className="w-3 h-3 text-emerald-400 shrink-0" />
      </button>

      {/* Account Info Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-10 w-72 p-4 rounded-2xl bg-[#181818] border border-white/10 shadow-2xl z-50 text-white space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: accentColorHex }}
                  >
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {user.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cloud Sync Status Card */}
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold block text-[11px]">Firebase Cloud Active</span>
                <span className="text-[10px] text-emerald-400/80 block">Likes, playlists & history synced</span>
              </div>
            </div>

            <div className="pt-1 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure Google OAuth
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
