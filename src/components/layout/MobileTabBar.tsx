import React from 'react';
import { ActiveView, UserAuthProfile } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { Compass, Search, Sliders, HardDrive, Film, User, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileTabBarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
  user?: UserAuthProfile | null;
  onOpenAuth?: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  onSelectView,
  accentColorHex = '#D97736',
  theme,
  user,
  onOpenAuth,
}) => {
  const tabs = [
    { id: 'explore' as ActiveView, label: 'Explore', icon: Compass },
    { id: 'search' as ActiveView, label: 'Search', icon: Search },
    { id: 'video' as ActiveView, label: 'Video', icon: Film },
    { id: 'library' as ActiveView, label: 'Library', icon: HardDrive },
  ];

  const isLight = theme?.category === 'light';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto pointer-events-auto">
      <nav 
        className="relative h-14 rounded-full backdrop-blur-[24px] bg-gradient-to-r from-black/85 via-[#16161D]/85 to-black/85 p-1.5 grid grid-cols-5 items-center select-none shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden"
      >
        {/* Specular Top Highlight Edge */}
        <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center justify-center h-full rounded-full z-10 transition-colors"
            >
              {/* Liquid Glass Sliding Active Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeMobileTabPill"
                  className="absolute inset-0 rounded-full shadow-md"
                  style={{
                    backgroundColor: `${accentColorHex}25`,
                    border: `1px solid ${accentColorHex}50`,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                className="w-4 h-4 z-10 transition-transform duration-200"
                style={{
                  color: isActive ? accentColorHex : textMuted,
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}
              />
              <span
                className="text-[9px] tracking-tight mt-0.5 z-10 font-bold"
                style={{
                  color: isActive ? accentColorHex : textMuted,
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}

        {/* 5th Tab: Google Account / Sign-In Button */}
        <motion.button
          onClick={() => {
            if (onOpenAuth) {
              onOpenAuth();
            } else {
              onSelectView('settings');
            }
          }}
          whileTap={{ scale: 0.92 }}
          className="relative flex flex-col items-center justify-center h-full rounded-full z-10 transition-colors group"
          title={user ? `${user.displayName} (Google Connected)` : 'Sign in with Google'}
        >
          {user ? (
            user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Account'}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30 z-10"
              />
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10"
                style={{ backgroundColor: accentColorHex }}
              >
                {(user.displayName || 'U')[0].toUpperCase()}
              </div>
            )
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center z-10 group-hover:scale-105 transition-transform">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
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
            </div>
          )}
          <span
            className={`text-[9px] tracking-tight mt-0.5 z-10 font-bold ${
              user ? 'text-slate-300' : 'text-red-400'
            }`}
          >
            {user ? 'Account' : 'Sign In'}
          </span>
        </motion.button>
      </nav>
    </div>
  );
};



