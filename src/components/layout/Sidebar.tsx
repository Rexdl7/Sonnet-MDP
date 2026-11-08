import React from 'react';
import { ActiveView, Playlist } from '../../types/media';
import { 
  Sliders, HardDrive, Settings, Music2, Disc, Heart, 
  Home, Youtube, Search
} from 'lucide-react';
import { ThemeConfig } from '../../utils/themeConfig';
import { motion } from 'framer-motion';
import { AdBanner } from '../common/AdBanner';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  playlists: Playlist[];
  likedCount: number;
  localCount: number;
  accentColorHex?: string;
  theme?: ThemeConfig;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  count?: number;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  playlists,
  likedCount,
  localCount,
  accentColorHex = '#D97736',
  theme,
}) => {
  const isLight = theme?.category === 'light';
  const navSections: NavSection[] = [
    {
      heading: 'Navigation',
      items: [
        { id: 'explore' as ActiveView, label: 'Home', icon: Home },
        { id: 'video' as ActiveView, label: 'YouTube Videos', icon: Youtube },
        { id: 'search' as ActiveView, label: 'Search Music', icon: Search },
      ],
    },
    {
      heading: 'Studio Engine',
      items: [
        { id: 'equalizer' as ActiveView, label: '10-Band Equalizer', icon: Sliders },
        { id: 'settings' as ActiveView, label: 'Audio Quality & Theme', icon: Settings },
      ],
    },
    {
      heading: 'Library',
      items: [
        { id: 'library' as ActiveView, label: 'Library & Playlists', icon: HardDrive, count: localCount },
      ],
    },
  ];

  return (
    <aside 
      className="hidden md:flex flex-col w-64 select-none shrink-0 h-full transition-colors duration-300 border-r"
      style={{
        backgroundColor: theme?.colors.surface || 'rgba(15, 23, 42, 0.6)',
        borderColor: theme?.colors.border || 'rgba(255, 255, 255, 0.1)',
        color: theme?.colors.text || '#FFFFFF',
      }}
    >
      {/* Window Controls Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80 cursor-pointer shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer shadow-sm" />
        <span 
          className="text-[11px] font-semibold ml-2 tracking-wide flex items-center gap-1.5"
          style={{ color: isLight ? '#1D1D1F' : '#E2E8F0' }}
        >
          <Music2 className="w-3.5 h-3.5" style={{ color: accentColorHex }} />
          sonnetmdp
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.heading} className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.heading}
            </span>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'text-white shadow-md'
                        : isLight
                        ? 'text-slate-700 hover:text-black hover:bg-black/5'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isActive ? accentColorHex : undefined,
                      boxShadow: isActive ? `0 4px 14px ${accentColorHex}40` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Playlists Section */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Playlists
          </span>
          <div className="space-y-0.5 pt-1">
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectView('library')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#FA2D48]" style={{ color: accentColorHex }} />
                <span>Loved Tracks</span>
              </div>
              {likedCount > 0 && (
                <span className="text-[10px] font-mono tabular-nums text-slate-500">
                  {likedCount}
                </span>
              )}
            </motion.button>

            {playlists.slice(0, 4).map((pl) => (
              <motion.button
                key={pl.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectView('library')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors truncate"
              >
                <Disc className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{pl.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Ad Space */}
      <div className="px-3 pb-3">
        <AdBanner slot="1234567890" className="opacity-40 hover:opacity-100 transition-opacity" />
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Audio Studio</span>
        <span className="font-mono text-[10px]">Hi-Fi</span>
      </div>
    </aside>
  );
};

