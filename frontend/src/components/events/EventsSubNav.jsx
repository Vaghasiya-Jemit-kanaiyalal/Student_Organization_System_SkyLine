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
    <div className="bg-white rounded-lg border border-slate-200 p-1 shadow-2xs">
      <div className="flex flex-wrap sm:flex-nowrap gap-1">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 h-8 px-3 rounded-md text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventsSubNav;
