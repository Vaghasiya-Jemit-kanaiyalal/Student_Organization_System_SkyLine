import React from 'react';
import { X, Users, CheckCircle2, Clock, Search } from 'lucide-react';

/**
 * EventAttendeesModal Component
 * Shows registered attendees list for a specific event
 */
export const EventAttendeesModal = ({ event, onClose }) => {
  if (!event) return null;

  const tickets = event.tickets || [];
  const checkedInCount = tickets.filter(t => t.checkInStatus === 'Checked In').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs overflow-y-auto">
      <div className="max-w-3xl w-full bg-surface border border-border rounded-xl shadow-elevated overflow-hidden animate-fadeIn my-8">

        {/* Header */}
        <div className="bg-surface p-5 border-b border-border flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-light text-primary rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-academic text-lg font-bold text-text-primary">
                Attendee Roster: {event.title}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {event.attendees} Registered Attendees • {checkedInCount} Checked In ({event.capacity} Max Capacity)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Body */}
        <div className="p-5">
          {tickets.length > 0 ? (
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Attendee Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Ticket Type</th>
                    <th className="py-2.5 px-3">Check-in Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((tck) => (
                    <tr key={tck.id} className="hover:bg-ivory-50 transition">
                      <td className="py-2.5 px-3 font-mono text-primary font-medium">{tck.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{tck.attendeeName}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{tck.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory-200 text-text-secondary">
                          {tck.ticketType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center w-fit gap-1 ${tck.checkInStatus === 'Checked In'
                              ? 'bg-status-success-bg text-status-success border border-status-success/30'
                              : 'bg-ivory-200 text-text-muted'
                            }`}
                        >
                          {tck.checkInStatus === 'Checked In' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Checked In</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Not Checked In</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-muted text-[11px]">
                        {tck.checkInTime || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted text-xs">
              No individual attendee records found for this event yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-ivory-100 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus"
          >
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventAttendeesModal;
