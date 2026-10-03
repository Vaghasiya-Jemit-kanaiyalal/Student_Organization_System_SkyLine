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
    <div className="bg-surface rounded-lg border border-border p-1.5 shadow-subtle mb-6">
      <div className="flex flex-wrap sm:flex-nowrap gap-1">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-campus ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-primary hover:bg-ivory-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-primary-hover text-accent' : 'bg-accent/20 text-accent font-semibold'
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
