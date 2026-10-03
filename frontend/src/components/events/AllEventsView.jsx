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

  const formatEventDateTime = (e) => {
    if (!e) return '';
    if (e.date && e.date.includes('•')) {
      return e.date;
    }
    const dateStr = e.dateDisplay || e.date || '';
    const timeStr = e.timeDisplay || '';
    if (dateStr && timeStr) {
      return `${dateStr} • ${timeStr}`;
    }
    return dateStr || timeStr;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Controls Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-lg border border-slate-200 bg-white text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
            className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
            className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            <option value="ALL">All Dates</option>
            <option value="UPCOMING">Upcoming Events</option>
          </select>
        </div>
      </div>

      {/* SQUARE BOX EVENTS GRID */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredEvents.map((evt) => {
            const rsvpPercent = Math.min(
              100,
              Math.round((evt.attendees / (evt.capacity || 1)) * 100)
            );

            return (
              <div
                key={evt.id}
                className="bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Square Box Cover Image Container */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={
                        evt.image ||
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />

                    {/* Top Category & Status Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center z-10">
                      <span className="bg-zinc-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs backdrop-blur-xs font-mono">
                        {evt.category}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs shadow-2xs ${
                          evt.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : evt.status === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {evt.status || 'Published & Active'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition leading-snug">
                        {evt.title}
                      </h3>
                      {evt.createdDate && (
                        <p className="text-[10px] text-slate-400">
                          Created on {evt.createdDate}
                        </p>
                      )}
                    </div>

                    {/* Date & Location Specs */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-[11px]">{formatEventDateTime(evt)}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                        <span className="text-[11px] truncate">{evt.venue || evt.location}</span>
                      </div>
                    </div>

                    {/* Pricing Tag */}
                    <div className="pt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 font-mono">
                        {evt.price}
                      </span>
                    </div>

                    {/* RSVP Capacity Progress Bar */}
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Capacity ({rsvpPercent}%)</span>
                        <span className="font-semibold text-zinc-900 font-mono">
                          {evt.attendees} / {evt.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${rsvpPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setViewingEvent(evt)}
                      className="h-8 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-zinc-800 transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTickets(evt.id)}
                      className="h-8 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition"
                    >
                      <span>Manage Tickets</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setViewingAttendeesEvent(evt)}
                      title="View Attendees Roster"
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 flex items-center justify-center transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>

                    {evt.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelEvent(evt.id)}
                        title="Cancel Event"
                        className="w-8 h-8 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 flex items-center justify-center transition"
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
        <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
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
