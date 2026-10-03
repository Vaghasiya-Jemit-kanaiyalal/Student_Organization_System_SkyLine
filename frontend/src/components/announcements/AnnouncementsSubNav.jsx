import React from 'react';
import { Megaphone, PlusCircle, Clock } from 'lucide-react';

/**
 * AnnouncementsSubNav Component
 * Sub-navigation tab bar for Announcement Management module.
 * Options: All Announcements, Create Announcement, Scheduled (with badge)
 */
export const AnnouncementsSubNav = ({ activeSubTab, setActiveSubTab, scheduledCount = 0 }) => {
  const subNavItems = [
    { id: 'all', label: 'All Announcements', icon: Megaphone },
    { id: 'create', label: 'Create Announcement', icon: PlusCircle },
    { id: 'scheduled', label: 'Scheduled', icon: Clock, badge: scheduledCount }
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-1 shadow-2xs">
      <div className="flex flex-wrap sm:flex-nowrap gap-1">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 h-8 px-3 rounded-md text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementsSubNav;
