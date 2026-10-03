import React, { useState } from 'react';
import { EventsSubNav } from './EventsSubNav';
import { AllEventsView } from './AllEventsView';
import { CreateEventView } from './CreateEventView';
import { ManageTicketsView } from './ManageTicketsView';

/**
 * EventsManagementModule Component
 * Parent module container for Events Management section in Student Organization Administration Portal.
 * Connects sub-navigation and shared data flow between:
 * 1. All Events
 * 2. Create Event
 * 3. Manage Tickets
 */
export const EventsManagementModule = ({ events, setEvents }) => {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState(
    events && events.length > 0 ? events[0].id : null
  );

  // Navigate to Manage Tickets with specific event pre-selected
  const handleNavigateToTickets = (eventId) => {
    if (eventId) {
      setSelectedEventId(eventId);
    }
    setActiveSubTab('tickets');
  };

  // Save new event created in Create Event view
  const handleSaveEvent = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
    setActiveSubTab('all');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub Navigation Tabs */}
      <EventsSubNav
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* Sub Navigation Views */}
      {activeSubTab === 'all' && (
        <AllEventsView
          events={events}
          setEvents={setEvents}
          onNavigateToCreate={() => setActiveSubTab('create')}
          onNavigateToTickets={handleNavigateToTickets}
        />
      )}

      {activeSubTab === 'create' && (
        <CreateEventView
          onSaveEvent={handleSaveEvent}
          onCancel={() => setActiveSubTab('all')}
        />
      )}

      {activeSubTab === 'tickets' && (
        <ManageTicketsView
          events={events}
          setEvents={setEvents}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
        />
      )}
    </div>
  );
};

export default EventsManagementModule;
