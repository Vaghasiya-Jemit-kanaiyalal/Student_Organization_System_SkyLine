import React, { useState, useEffect } from 'react';
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
  BarChart2,
  HeartHandshake,
  Award,
  RefreshCw
} from 'lucide-react';
import { EventDetailsModal } from './EventDetailsModal';
import { EventAttendeesModal } from './EventAttendeesModal';
import { eventsApi, certificateApi } from '../../services/api';

/**
 * AllEventsView Component
 * Renders all organization events in clean, structured square box cards.
 * Shows status badges (Draft, Published, Completed, Cancelled),
 * "Volunteers Needed" indicator, and "Mark Completed" / "Issue Certificates" actions.
 */
export const AllEventsView = ({
  events = [],
  setEvents,
  onNavigateToCreate,
  onNavigateToTickets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Selected event for modals
  const [viewingEvent, setViewingEvent] = useState(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync with Backend
  const refreshEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getAll();
      const list = Array.isArray(data) ? data : data.results || [];
      if (list.length > 0 && setEvents) {
        // Map backend events to UI cards format
        const mapped = list.map((item) => {
          let dateDisplay = item.date;
          if (item.date && item.date.includes('-')) {
            const parts = item.date.split('-');
            if (parts.length === 3) {
              dateDisplay = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            }
          }
          return {
            ...item,
            id: item.id,
            title: item.title,
            category: item.event_type || item.category || 'General Event',
            date: item.date,
            dateDisplay: dateDisplay,
            timeDisplay: item.start_time && item.end_time ? `${item.start_time} - ${item.end_time}` : item.timeDisplay || '',
            venue: item.venue || item.location,
            capacity: item.capacity || 100,
            attendees: item.attendees || 0,
            price: Number(item.ticket_price) === 0 ? 'Free' : `$${Number(item.ticket_price).toFixed(2)}`,
            status: item.status,
            image: item.image,
            volunteers_required: item.volunteers_required,
            volunteer_count_required: item.volunteer_count_required,
            volunteer_slots_remaining: item.volunteer_slots_remaining ?? item.volunteer_count_required,
            roles_list: item.roles_list || (typeof item.volunteer_roles_required === 'string' ? item.volunteer_roles_required.split(',').map(s => s.trim()) : item.volunteer_roles_required) || [],
          };
        });
        setEvents(mapped);
      }
    } catch (err) {
      console.warn('Events fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  // Handle Event Status Change to Completed
  const handleMarkCompleted = async (eventObj) => {
    try {
      await eventsApi.patch(eventObj.id, { status: 'Completed' });
      setEvents((prev) =>
        prev.map((e) => (e.id === eventObj.id ? { ...e, status: 'Completed' } : e))
      );
      showToast(`Event "${eventObj.title}" marked as Completed. Volunteer certificate generation is now unlocked!`);
    } catch (err) {
      // Local fallback
      setEvents((prev) =>
        prev.map((e) => (e.id === eventObj.id ? { ...e, status: 'Completed' } : e))
      );
      showToast(`Event marked as Completed.`);
    }
  };

  // Handle Event Cancellation
  const handleCancelEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel this event? This action will mark the event status as Cancelled.')) {
      try {
        await eventsApi.patch(eventId, { status: 'Cancelled' });
      } catch (err) {
        console.warn('API error cancelling:', err);
      }
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === eventId ? { ...evt, status: 'Cancelled' } : evt
        )
      );
      showToast('Event status updated to Cancelled.');
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      (evt.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.venue || evt.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || (evt.status || 'Published') === statusFilter;

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
    <div className="space-y-6">
      {/* Search and Filters Controls Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
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
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="ALL">All Event Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="ALL">All Event Types</option>
            <option value="Flagship Event">Flagship Event</option>
            <option value="Career & Networking">Career & Networking</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Technical Workshop">Technical Workshop</option>
            <option value="Seminar & Lecture">Seminar & Lecture</option>
            <option value="Social & Culture">Social & Culture</option>
            <option value="Competition & Exhibition">Competition & Exhibition</option>
            <option value="Community Service">Community Service</option>
            <option value="Debate & Public Forum">Debate & Public Forum</option>
            <option value="General Event">General Event</option>
          </select>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={refreshEvents}
            disabled={loading}
            className="w-full py-2 px-3 rounded border border-border bg-surface hover:bg-canvas text-xs font-semibold text-text-primary transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : 'text-text-muted'}`} />
            <span>Sync Events</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* SQUARE BOX EVENTS GRID */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const hasVolunteers = evt.volunteers_required || evt.volunteersRequired;
            const isCompleted = evt.status === 'Completed';

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

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-2">
                      <span className="bg-surface/90 text-primary text-[11px] font-semibold px-2.5 py-1 rounded border border-border shadow-xs backdrop-blur-xs truncate max-w-[55%]">
                        {evt.category}
                      </span>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {hasVolunteers && (
                          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <HeartHandshake className="w-3 h-3" />
                            <span>Volunteers Needed</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded backdrop-blur-xs shadow-xs ${
                            evt.status === 'Cancelled'
                              ? 'bg-status-error-bg text-status-error border border-status-error/30'
                              : evt.status === 'Draft'
                              ? 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                              : isCompleted
                              ? 'bg-[#EBF3FC] text-[#1557B0] border border-[#1557B0]/30'
                              : 'bg-status-success-bg text-status-success border border-status-success/30'
                          }`}
                        >
                          {evt.status || 'Published'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Square Card Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition leading-snug">
                        {evt.title}
                      </h3>
                      {evt.description && (
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    {/* Date & Location Specs */}
                    <div className="space-y-1.5 text-xs text-text-secondary pt-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{formatEventDateTime(evt)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="truncate">{evt.venue || evt.location}</span>
                      </div>
                    </div>

                    {/* Pricing & Volunteer Quota Tag */}
                    <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-block px-2.5 py-1 rounded bg-ivory-100 border border-border text-[11px] font-bold text-accent">
                        {evt.price}
                      </span>

                      {hasVolunteers && (
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Quota: {evt.volunteer_count_required || evt.volunteerCountRequired || 10} volunteers
                        </span>
                      )}
                    </div>

                    {/* Available Seats Indicator */}
                    <div className="pt-1 text-[11px] text-text-secondary flex justify-between items-center">
                      <span>Available Seats:</span>
                      <span className="font-bold text-text-primary">
                        {evt.capacity || 100} Capacity
                      </span>
                    </div>
                  </div>
                </div>

                {/* Square Card Footer Action Buttons */}
                <div className="p-4 bg-ivory-50 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingEvent(evt)}
                      className="px-2.5 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-text-muted" />
                      <span>View</span>
                    </button>

                    {/* Mark Completed Button */}
                    {!isCompleted && evt.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(evt)}
                        className="px-2.5 py-1.5 rounded bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary transition"
                        title="Mark event completed"
                      >
                        Complete
                      </button>
                    )}

                    {onNavigateToTickets && (
                      <button
                        type="button"
                        onClick={() => onNavigateToTickets(evt.id)}
                        className="px-2.5 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
                      >
                        Tickets
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setViewingAttendeesEvent(evt)}
                      title="View Attendees Roster"
                      className="p-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-status-success transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>

                    {evt.status !== 'Cancelled' && (
                      <button
                        type="button"
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
