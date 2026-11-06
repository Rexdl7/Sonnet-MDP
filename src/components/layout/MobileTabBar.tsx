import React from 'react';
import { ActiveView } from '../../types/media';
import { Compass, Search, Sliders, Settings, HardDrive, Film } from 'lucide-react';

interface MobileTabBarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  accentColorHex?: string;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  onSelectView,
  accentColorHex = '#FA2D48',
}) => {
  const tabs = [
    { id: 'explore' as ActiveView, label: 'Explore', icon: Compass },
    { id: 'search' as ActiveView, label: 'Search', icon: Search },
    { id: 'video' as ActiveView, label: 'Video', icon: Film },
    { id: 'equalizer' as ActiveView, label: 'Equalizer', icon: Sliders },
    { id: 'library' as ActiveView, label: 'Library', icon: HardDrive },
  ];

  return (
    <nav className="md:hidden h-16 bg-[#0a0a0a] border-t border-white/10 grid grid-cols-5 items-center select-none shrink-0 z-40 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectView(tab.id)}
            className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors"
          >
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110' : 'text-slate-400'
              }`}
              style={{ color: isActive ? accentColorHex : undefined }}
            />
            <span
              className={`text-[10px] tracking-tight mt-1 ${
                isActive ? 'font-bold' : 'text-slate-400 font-medium'
              }`}
              style={{ color: isActive ? accentColorHex : undefined }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
