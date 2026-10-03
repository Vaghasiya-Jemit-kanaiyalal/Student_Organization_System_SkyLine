import React from 'react';
import { Calendar, PlusCircle, BarChart3 } from 'lucide-react';

/**
 * EventsSubNav Component
 * Sub-navigation tab bar for Events Management module
 * Options: All Events, Create Event, Manage Tickets
 */
export const EventsSubNav = ({ activeSubTab, setActiveSubTab }) => {
  const subNavItems = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'create', label: 'Create Event', icon: PlusCircle },
    { id: 'tickets', label: 'Manage Tickets', icon: BarChart3 }
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
              className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-campus ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-primary hover:bg-ivory-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventsSubNav;
