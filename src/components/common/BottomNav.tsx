/**
 * @file BottomNav.tsx
 * 4-Tab automotive mobile navigation bar (Home, Digital Key, Activity, Settings)
 */

import React from 'react';
import { Home, KeyRound, Clock3, Settings } from 'lucide-react';

export type ActiveTab = 'home' | 'key' | 'activity' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unreadEventsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadEventsCount = 0,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'key',
      label: 'Digital Key',
      icon: <KeyRound className="w-5 h-5" />,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: (
        <div className="relative">
          <Clock3 className="w-5 h-5" />
          {unreadEventsCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav id="bottom-navigation-bar" className="fixed bottom-0 left-0 right-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#222222] pb-safe">
      <div className="max-w-xl mx-auto grid grid-cols-4 px-2 py-2">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-btn-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#F27D26] font-semibold bg-[#140E0A]/80 border border-[#F27D26]/30 glow-orange'
                  : 'text-[#666666] hover:text-[#BBBBBB] hover:bg-[#111111]/40 border border-transparent'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-100'}`}>
                {item.icon}
              </div>
              <span className="text-[9px] mt-1 uppercase font-bold tracking-[0.15em] whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
