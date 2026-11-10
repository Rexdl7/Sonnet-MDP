import React from 'react';
import { ActiveView } from '../../types/media';
import { ThemeConfig } from '../../utils/themeConfig';
import { Compass, Search, Sliders, HardDrive, Film } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileTabBarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  accentColorHex?: string;
  theme?: ThemeConfig;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  onSelectView,
  accentColorHex = '#D97736',
  theme,
}) => {
  const tabs = [
    { id: 'explore' as ActiveView, label: 'Explore', icon: Compass },
    { id: 'search' as ActiveView, label: 'Search', icon: Search },
    { id: 'video' as ActiveView, label: 'Video', icon: Film },
    { id: 'equalizer' as ActiveView, label: 'EQ', icon: Sliders },
    { id: 'library' as ActiveView, label: 'Library', icon: HardDrive },
  ];

  const isLight = theme?.category === 'light';
  const textColor = theme?.colors.text || (isLight ? '#0F172A' : '#FFFFFF');
  const textMuted = theme?.colors.textMuted || (isLight ? '#64748B' : '#94A3B8');

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto pointer-events-auto">
      <nav 
        className="relative h-14 rounded-full backdrop-blur-[24px] bg-gradient-to-r from-black/75 via-[#16161D]/75 to-black/75 p-1.5 grid grid-cols-5 items-center select-none shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/15 overflow-hidden"
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
      </nav>
    </div>
  );
};



