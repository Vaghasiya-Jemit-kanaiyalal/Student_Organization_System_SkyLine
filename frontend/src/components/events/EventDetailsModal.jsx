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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fadeIn my-8">
        
        {/* Modal Header */}
        <div className="relative text-white overflow-hidden">
          {event.image ? (
            <div className="h-44 w-full relative">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-900/60 to-transparent p-6 flex flex-col justify-end" />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 p-6" />
          )}

          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-10">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider bg-zinc-950/80 backdrop-blur-xs px-2.5 py-1 rounded border border-emerald-500/30">
              <UniversityCrest className="w-4 h-4" variant="gold" />
              <span>{event.category}</span>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-300 hover:text-white bg-zinc-950/70 hover:bg-zinc-900 backdrop-blur-xs p-1.5 rounded-full transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 border-b border-zinc-800">
            <h2 className="text-2xl font-bold leading-tight text-white">
              {event.title}
            </h2>
            <p className="text-xs text-zinc-300 mt-1">
              Status: <span className="font-semibold text-emerald-400">{event.status || 'Published & Active'}</span> • Created {event.createdDate || 'Sep 15, 2026'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800">
          
          {/* Key Quick Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Date & Time</span>
                <span className="text-slate-600">{formatEventDateTime(event)}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-rose-500 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Venue & Location</span>
                <span className="text-slate-600">{event.venue || event.location}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Users className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Capacity & RSVPs</span>
                <span className="text-slate-600">{event.attendees || 0} registered / {event.capacity || 150} total capacity</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Tag className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Pricing Info</span>
                <span className="text-slate-600 font-semibold">{event.price}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-1 text-sm">About This Event</h4>
            <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {event.description || 'Official campus student organization event.'}
            </p>
          </div>

          {/* Ticket Tier Breakdown */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 text-sm flex items-center justify-between">
              <span>Configured Ticket Types</span>
              <span className="text-xs text-slate-400 font-normal font-sans">
                {event.ticketTypes ? event.ticketTypes.length : 0} configured tiers
              </span>
            </h4>

            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Ticket Name</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Capacity</th>
                      <th className="py-2 px-3">Sold / Reserved</th>
                      <th className="py-2 px-3">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {event.ticketTypes.map((tt) => (
                      <tr key={tt.id || tt.name} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{tt.name}</td>
                        <td className="py-2 px-3 font-bold text-emerald-700 font-mono">${Number(tt.price).toFixed(2)}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{tt.capacity}</td>
                        <td className="py-2 px-3 text-emerald-700 font-semibold">{tt.sold || 0}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{tt.available || (tt.capacity - (tt.sold || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">No specific ticket tiers configured for this event.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            Close Window
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToTickets) onNavigateToTickets(event.id);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            <span>Manage Tickets for Event →</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventDetailsModal;
