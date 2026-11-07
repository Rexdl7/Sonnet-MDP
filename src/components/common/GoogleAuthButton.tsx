import React, { useState } from 'react';
import { UserAuthProfile } from '../../types/media';
import { Cloud, LogOut, CheckCircle2, ShieldCheck, X, Youtube } from 'lucide-react';
import { SonnetmdpAuthModal } from './SonnetmdpAuthModal';

interface GoogleAuthButtonProps {
  user: UserAuthProfile | null;
  loading: boolean;
  onLogin: () => Promise<any>;
  onLogout: () => Promise<void>;
  accentColorHex?: string;
  likedCount?: number;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  user,
  loading,
  onLogin,
  onLogout,
  accentColorHex = '#D97736',
  likedCount = 0,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
    );
  }

  return (
    <>
      {!user ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-[#222227] hover:bg-[#2C2C33] text-[#F2EFE9] border border-white/10 transition-all shadow-sm active:scale-95 font-sans"
          title="Connect your Google Account to sync YouTube liked music and listening history"
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
          <span className="hidden sm:inline">Connect YouTube</span>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#1E1E23] hover:bg-[#28282F] border border-white/10 text-xs text-[#F2EFE9] transition-all active:scale-95 group font-sans"
            title="Google YouTube Account Connected"
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
            <span className="max-w-[85px] md:max-w-[115px] truncate font-medium text-[#D1CECA] group-hover:text-white">
              {user.displayName?.split(' ')[0] || 'YouTube User'}
            </span>
            <Youtube className="w-3.5 h-3.5 text-[#D97736] shrink-0" />
          </button>

          {/* Account Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-10 w-72 p-4 rounded-2xl bg-[#1E1E23] border border-white/10 shadow-2xl z-50 text-[#F2EFE9] space-y-3 animate-in fade-in zoom-in-95 duration-150 font-sans">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || ''}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D97736]"
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
                      <h4 className="text-sm font-semibold text-white truncate">
                        {user.displayName}
                      </h4>
                      <p className="text-[11px] text-[#A09D96] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-1 rounded-full text-[#A09D96] hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* YouTube Status Card */}
                <div className="p-2.5 rounded-xl bg-[#28282F] border border-white/10 flex items-center gap-2.5 text-xs text-[#F2EFE9]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold block text-[11px]">YouTube Sync Active</span>
                    <span className="text-[10px] text-[#A09D96] block">
                      {likedCount > 0 ? `${likedCount} liked tracks synced` : 'Listening history & recommendations live'}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-[#717171] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D97736]" /> Google OAuth
                  </span>
                  <button
                    onClick={async () => {
                      await onLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <SonnetmdpAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={user}
        onLogin={onLogin}
        onLogout={onLogout}
        accentColorHex={accentColorHex}
        likedCount={likedCount}
      />
    </>
  );
};
