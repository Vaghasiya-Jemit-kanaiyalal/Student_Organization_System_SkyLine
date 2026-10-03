import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Ticket, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { UniversityCrest } from '../common/UniversityCrest';

/**
 * EventDetailsModal Component
 * Displays complete event details, venue, capacity, pricing, and ticket breakdown in a modal overlay.
 */
export const EventDetailsModal = ({ event, onClose, onNavigateToTickets }) => {
  if (!event) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs overflow-y-auto">
      <div className="max-w-2xl w-full bg-surface border border-border rounded-xl shadow-elevated overflow-hidden animate-fadeIn my-8">
        
        {/* Modal Header */}
        <div className="relative text-white overflow-hidden">
          {event.image ? (
            <div className="h-44 w-full relative">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/60 to-transparent p-6 flex flex-col justify-end" />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary via-primary-hover to-primary p-6" />
          )}

          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-10">
            <div className="flex items-center space-x-2 text-accent text-xs font-semibold uppercase tracking-wider bg-primary-900/70 backdrop-blur-xs px-2.5 py-1 rounded border border-accent/30">
              <UniversityCrest className="w-4 h-4" variant="gold" />
              <span>{event.category}</span>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-primary-900/70 backdrop-blur-xs p-1.5 rounded-full transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary via-primary-hover to-primary">
            <h2 className="text-2xl font-bold leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-primary-100 mt-1">
              Status: <span className="font-semibold text-accent">{event.status || 'Published & Active'}</span> • Created {event.createdDate || 'Sep 15, 2026'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-text-primary">
          
          {/* Key Quick Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-ivory-100 rounded-lg border border-border">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <span className="font-semibold block text-text-primary">Date & Time</span>
                <span className="text-text-secondary">{formatEventDateTime(event)}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-accent mt-0.5" />
              <div>
                <span className="font-semibold block text-text-primary">Venue & Location</span>
                <span className="text-text-secondary">{event.venue || event.location}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Users className="w-4 h-4 text-status-success mt-0.5" />
              <div>
                <span className="font-semibold block text-text-primary">Capacity & RSVPs</span>
                <span className="text-text-secondary">{event.attendees} registered / {event.capacity} total capacity</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Tag className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <span className="font-semibold block text-text-primary">Pricing Info</span>
                <span className="text-text-secondary">{event.price}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-text-primary mb-1 text-sm">About This Event</h4>
            <p className="text-text-secondary leading-relaxed bg-surface p-3 rounded border border-border">
              {event.description || 'Official campus student organization event.'}
            </p>
          </div>

          {/* Ticket Tier Breakdown */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2 text-sm flex items-center justify-between">
              <span>Configured Ticket Types</span>
              <span className="text-xs text-text-muted font-normal font-sans">
                {event.ticketTypes ? event.ticketTypes.length : 0} configured tiers
              </span>
            </h4>

            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-2 px-3">Ticket Name</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Capacity</th>
                      <th className="py-2 px-3">Sold / Reserved</th>
                      <th className="py-2 px-3">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {event.ticketTypes.map((tt) => (
                      <tr key={tt.id || tt.name}>
                        <td className="py-2 px-3 font-semibold text-text-primary">{tt.name}</td>
                        <td className="py-2 px-3 font-bold text-primary">${Number(tt.price).toFixed(2)}</td>
                        <td className="py-2 px-3 font-mono">{tt.capacity}</td>
                        <td className="py-2 px-3 text-status-success font-semibold">{tt.sold || 0}</td>
                        <td className="py-2 px-3 text-text-secondary font-mono">{tt.available || (tt.capacity - (tt.sold || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-muted text-xs italic">No specific ticket tiers configured for this event.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-ivory-100 border-t border-border flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus"
          >
            Close Window
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToTickets) onNavigateToTickets(event.id);
            }}
            className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-campus flex items-center space-x-1.5"
          >
            <span>Manage Tickets for Event →</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventDetailsModal;
