import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Users,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { EventDetailsModal } from './EventDetailsModal';
import { EventAttendeesModal } from './EventAttendeesModal';

/**
 * AllEventsView Component
 * Renders all organization events in clean, structured square box cards.
 * Clean layout, high-contrast imagery, RSVP progress bars, and icon-free action triggers.
 */
export const AllEventsView = ({
  events,
  setEvents,
  onNavigateToCreate,
  onNavigateToTickets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Selected event for modals
  const [viewingEvent, setViewingEvent] = useState(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState(null);

  // Handle Event Cancellation
  const handleCancelEvent = (eventId) => {
    if (window.confirm('Are you sure you want to cancel this event? This action will mark the event status as Cancelled.')) {
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === eventId ? { ...evt, status: 'Cancelled' } : evt
        )
      );
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.venue || evt.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || (evt.status || 'Published & Active') === statusFilter;

    const matchesType = typeFilter === 'ALL' || evt.category === typeFilter;

    let matchesDate = true;
    if (dateFilter === 'UPCOMING') {
      matchesDate = new Date(evt.date || '2026-10-01') >= new Date('2026-10-01');
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Controls Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Event Statuses</option>
            <option value="Published & Active">Published & Active</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Event Types</option>
            <option value="Competition & Exhibition">Competition & Exhibition</option>
            <option value="Debate & Public Forum">Debate & Public Forum</option>
            <option value="Community Service">Community Service</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Lecture">Lecture</option>
            <option value="Social Event">Social Event</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Dates</option>
            <option value="UPCOMING">Upcoming Events</option>
          </select>
        </div>
      </div>

      {/* SQUARE BOX EVENTS GRID */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const rsvpPercent = Math.min(
              100,
              Math.round((evt.attendees / (evt.capacity || 1)) * 100)
            );

            return (
              <div
                key={evt.id}
                className="bg-surface rounded-xl border border-border shadow-subtle hover:shadow-card transition-campus overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Square Box Cover Image Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-ivory-200">
                    <img
                      src={
                        evt.image ||
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-campus duration-300"
                    />

                    {/* Top Category & Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                      <span className="bg-surface/90 text-primary text-[11px] font-semibold px-2.5 py-1 rounded border border-border shadow-xs backdrop-blur-xs">
                        {evt.category}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded backdrop-blur-xs shadow-xs ${
                          evt.status === 'Cancelled'
                            ? 'bg-status-error-bg text-status-error border border-status-error/30'
                            : evt.status === 'Draft'
                            ? 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                            : 'bg-status-success-bg text-status-success border border-status-success/30'
                        }`}
                      >
                        {evt.status || 'Published & Active'}
                      </span>
                    </div>
                  </div>

                  {/* Square Card Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition leading-snug">
                        {evt.title}
                      </h3>
                      {evt.createdDate && (
                        <p className="text-[10px] text-text-muted">
                          Created on {evt.createdDate}
                        </p>
                      )}
                    </div>

                    {/* Date & Location Specs */}
                    <div className="space-y-1.5 text-xs text-text-secondary pt-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{evt.dateDisplay || evt.date} • {evt.timeDisplay || '2:00 PM - 6:00 PM'}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="truncate">{evt.venue || evt.location}</span>
                      </div>
                    </div>

                    {/* Pricing Tag */}
                    <div className="pt-1">
                      <span className="inline-block px-2.5 py-1 rounded bg-ivory-100 border border-border text-[11px] font-semibold text-accent">
                        {evt.price}
                      </span>
                    </div>

                    {/* RSVP Capacity Progress Bar */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[11px] text-text-secondary">
                        <span>RSVPs & Attendance</span>
                        <span className="font-semibold text-text-primary">
                          {evt.attendees} / {evt.capacity} ({rsvpPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${rsvpPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Square Card Footer Action Buttons */}
                <div className="p-4 bg-ivory-50 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewingEvent(evt)}
                      className="px-3 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-text-muted" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTickets(evt.id)}
                      className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-campus"
                    >
                      <span>Manage Tickets</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setViewingAttendeesEvent(evt)}
                      title="View Attendees Roster"
                      className="p-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-status-success transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>

                    {evt.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelEvent(evt.id)}
                        title="Cancel Event"
                        className="p-1.5 rounded bg-surface hover:bg-status-error-bg border border-border text-status-error transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-text-muted text-xs bg-surface rounded-xl border border-border">
          No events match your current search or filter parameters.
        </div>
      )}

      {/* View Event Details Modal */}
      {viewingEvent && (
        <EventDetailsModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onNavigateToTickets={onNavigateToTickets}
        />
      )}

      {/* View Event Attendees Modal */}
      {viewingAttendeesEvent && (
        <EventAttendeesModal
          event={viewingAttendeesEvent}
          onClose={() => setViewingAttendeesEvent(null)}
        />
      )}
    </div>
  );
};

export default AllEventsView;
