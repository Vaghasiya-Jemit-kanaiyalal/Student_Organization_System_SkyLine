import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  QrCode,
  AlertCircle,
  X,
  RefreshCw,
  Ban
} from 'lucide-react';
import { UniversityCrest } from '../common/UniversityCrest';

/**
 * ManageTicketsView Component
 * Monitors ticket statistics, ticket tier breakdown, individual attendee ticket records,
 * and handles QR code check-in actions with immediate live state updates.
 */
export const ManageTicketsView = ({
  events,
  setEvents,
  selectedEventId,
  setSelectedEventId
}) => {
  // Select active event
  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('ALL');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');
  const [checkInFilter, setCheckInFilter] = useState('ALL');

  // Scanner / Quick Check In Input State
  const [scanInput, setScanInput] = useState('');
  const [checkInFeedback, setCheckInFeedback] = useState(null);

  // Digital Ticket Modal state
  const [activeTicketModal, setActiveTicketModal] = useState(null);

  // Sync selected event if changed externally
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId, setSelectedEventId]);

  if (!activeEvent) {
    return (
      <div className="p-8 text-center text-text-muted text-xs bg-surface rounded-xl border border-border">
        No events available for ticket management. Please create an event first.
      </div>
    );
  }

  // Calculate Statistics dynamically
  const tickets = activeEvent.tickets || [];
  const ticketTypes = activeEvent.ticketTypes || [];

  const totalCapacity = activeEvent.capacity || 0;
  const soldCount = activeEvent.attendees || tickets.filter((t) => t.status === 'Confirmed').length;
  const availableCount = Math.max(0, totalCapacity - soldCount);
  
  // Total Revenue calculation
  const totalRevenue = ticketTypes.reduce(
    (acc, curr) => acc + (curr.revenue || (curr.price * (curr.sold || 0))),
    0
  );

  const checkedInCount = tickets.filter((t) => t.checkInStatus === 'Checked In').length;

  // Handle QR Check-in Action
  const performCheckIn = (ticketIdToMatch) => {
    setCheckInFeedback(null);
    if (!ticketIdToMatch) return;

    const trimmed = ticketIdToMatch.trim().toUpperCase();

    // Find ticket by ID or QR code text
    const targetTicket = tickets.find(
      (t) => t.id.toUpperCase() === trimmed || (t.qrCode && t.qrCode.toUpperCase() === trimmed)
    );

    if (!targetTicket) {
      setCheckInFeedback({
        type: 'error',
        message: `Invalid Ticket ID: "${ticketIdToMatch}". Ticket not found in registry.`
      });
      return;
    }

    if (targetTicket.status === 'Cancelled') {
      setCheckInFeedback({
        type: 'error',
        message: `Invalid Ticket: Ticket #${targetTicket.id} has been cancelled.`
      });
      return;
    }

    if (targetTicket.checkInStatus === 'Checked In') {
      setCheckInFeedback({
        type: 'warning',
        message: `Already Checked In: Ticket #${targetTicket.id} (${targetTicket.attendeeName}) was checked in at ${targetTicket.checkInTime || 'earlier'}.`
      });
      return;
    }

    // Success Check-in Logic
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const fullTimeStr = `Today • ${timestamp}`;

    setEvents((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id !== activeEvent.id) return evt;

        const updatedTickets = evt.tickets.map((tck) => {
          if (tck.id === targetTicket.id) {
            return {
              ...tck,
              checkInStatus: 'Checked In',
              checkInTime: fullTimeStr
            };
          }
          return tck;
        });

        return {
          ...evt,
          tickets: updatedTickets
        };
      })
    );

    setCheckInFeedback({
      type: 'success',
      message: `Checked In Successfully: ${targetTicket.attendeeName} (${targetTicket.ticketType} - #${targetTicket.id})`
    });

    setScanInput('');
  };

  // Ticket cancellation handler
  const handleCancelTicket = (ticketId) => {
    if (window.confirm(`Are you sure you want to cancel ticket #${ticketId}?`)) {
      setEvents((prevEvents) =>
        prevEvents.map((evt) => {
          if (evt.id !== activeEvent.id) return evt;
          const updatedTickets = evt.tickets.map((t) =>
            t.id === ticketId ? { ...t, status: 'Cancelled' } : t
          );
          return { ...evt, tickets: updatedTickets };
        })
      );
    }
  };

  // Filtered Attendees Table
  const filteredTickets = tickets.filter((tck) => {
    const matchesSearch =
      tck.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tck.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tck.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = ticketTypeFilter === 'ALL' || tck.ticketType === ticketTypeFilter;
    const matchesReg = regStatusFilter === 'ALL' || tck.status === regStatusFilter;
    const matchesCheckIn = checkInFilter === 'ALL' || tck.checkInStatus === checkInFilter;

    return matchesSearch && matchesType && matchesReg && matchesCheckIn;
  });

  return (
    <div className="space-y-6">
      {/* Header & Event Selector */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          {activeEvent.image && (
            <img
              src={activeEvent.image}
              alt={activeEvent.title}
              className="w-16 h-12 object-cover rounded-lg border border-border shadow-sm flex-shrink-0"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-text-primary leading-tight">
              Manage Tickets
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Monitor ticket sales, registrations, and event attendance for <strong className="text-primary">{activeEvent.title}</strong>.
            </p>
          </div>
        </div>

        {/* Event Selector Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-text-primary whitespace-nowrap">
            Select Event:
          </label>
          <select
            value={activeEvent.id}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-80 px-3 py-2 text-xs rounded border border-border bg-ivory-100 font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Capacity */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
          <span className="text-[11px] font-medium text-text-secondary block">Total Capacity</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{totalCapacity}</p>
          <span className="text-[10px] text-text-muted">Venue Maximum</span>
        </div>

        {/* Sold / Registered */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
          <span className="text-[11px] font-medium text-text-secondary block">Sold / Registered</span>
          <p className="text-2xl font-bold text-primary mt-1">{soldCount}</p>
          <span className="text-[10px] text-primary font-medium">
            {Math.round((soldCount / (totalCapacity || 1)) * 100)}% Booked
          </span>
        </div>

        {/* Tickets Available */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
          <span className="text-[11px] font-medium text-text-secondary block">Tickets Available</span>
          <p className="text-2xl font-bold text-accent mt-1">{availableCount}</p>
          <span className="text-[10px] text-text-muted">Open Capacity</span>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
          <span className="text-[11px] font-medium text-text-secondary block">Total Revenue</span>
          <p className="text-2xl font-bold text-status-success mt-1">
            ${totalRevenue.toFixed(2)}
          </p>
          <span className="text-[10px] text-status-success font-medium">Verified Receipts</span>
        </div>

        {/* Checked In */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
          <span className="text-[11px] font-medium text-text-secondary block">Checked In</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{checkedInCount}</p>
          <span className="text-[10px] text-status-success font-medium">
            {soldCount > 0 ? Math.round((checkedInCount / soldCount) * 100) : 0}% Turnout
          </span>
        </div>
      </div>

      {/* QR CODE QUICK CHECK-IN SYSTEM BAR */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Organizer QR Check-in Terminal
              </h3>
              <p className="text-xs text-text-secondary">
                Enter or scan a Ticket ID (e.g. TCK-8829-01) for instant attendance verification.
              </p>
            </div>
          </div>

          {/* Input & Check In Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performCheckIn(scanInput);
            }}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan/Type Ticket ID..."
              className="px-3 py-2 text-xs rounded border border-border bg-ivory-100 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-campus whitespace-nowrap"
            >
              Check In Ticket
            </button>
          </form>
        </div>

        {/* Check-In Feedback Alert */}
        {checkInFeedback && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-center justify-between animate-fadeIn ${
              checkInFeedback.type === 'success'
                ? 'bg-status-success-bg border-status-success/30 text-status-success'
                : checkInFeedback.type === 'warning'
                ? 'bg-status-warning-bg border-status-warning/30 text-status-warning'
                : 'bg-status-error-bg border-status-error/30 text-status-error'
            }`}
          >
            <div className="flex items-center space-x-2">
              {checkInFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {checkInFeedback.type === 'warning' && <AlertCircle className="w-4 h-4" />}
              {checkInFeedback.type === 'error' && <Ban className="w-4 h-4" />}
              <span className="font-semibold">{checkInFeedback.message}</span>
            </div>
            <button
              onClick={() => setCheckInFeedback(null)}
              className="text-text-muted hover:text-text-primary text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* TICKET TYPE BREAKDOWN TABLE */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
        <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">
          Ticket Type Breakdown
        </h3>

        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Ticket Type</th>
                <th className="py-2.5 px-4">Price</th>
                <th className="py-2.5 px-4">Capacity</th>
                <th className="py-2.5 px-4">Sold</th>
                <th className="py-2.5 px-4">Available</th>
                <th className="py-2.5 px-4">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ticketTypes.map((tt) => {
                const sold = tt.sold || 0;
                const avail = tt.available !== undefined ? tt.available : (tt.capacity - sold);
                const rev = tt.revenue !== undefined ? tt.revenue : (tt.price * sold);
                return (
                  <tr key={tt.id || tt.name} className="hover:bg-ivory-50 transition">
                    <td className="py-2.5 px-4 font-semibold text-text-primary">{tt.name}</td>
                    <td className="py-2.5 px-4 font-bold text-primary">${Number(tt.price).toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-mono">{tt.capacity}</td>
                    <td className="py-2.5 px-4 font-semibold text-status-success">{sold}</td>
                    <td className="py-2.5 px-4 font-mono text-text-secondary">{avail}</td>
                    <td className="py-2.5 px-4 font-bold text-accent">${rev.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTENDEE / TICKET TABLE SECTION */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Individual Ticket & Attendee Registry
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Review ticket holders, check-in status, and issue passes.
            </p>
          </div>
        </div>

        {/* Table Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search holder name, email, or Ticket ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <select
              value={ticketTypeFilter}
              onChange={(e) => setTicketTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Ticket Types</option>
              {ticketTypes.map((tt) => (
                <option key={tt.name} value={tt.name}>
                  {tt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={regStatusFilter}
              onChange={(e) => setRegStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Registration Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Check-in Statuses</option>
              <option value="Checked In">Checked In</option>
              <option value="Not Checked In">Not Checked In</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Attendee Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Ticket Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Reg. Status</th>
                <th className="py-2.5 px-3">Check-in Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((tck) => (
                  <tr key={tck.id} className="hover:bg-ivory-50 transition">
                    <td className="py-2.5 px-3 font-mono text-primary font-bold">{tck.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-text-primary">{tck.attendeeName}</td>
                    <td className="py-2.5 px-3 text-text-secondary">{tck.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory-200 text-text-secondary">
                        {tck.ticketType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-text-primary">
                      ${Number(tck.amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tck.status === 'Cancelled'
                            ? 'bg-status-error-bg text-status-error'
                            : 'bg-status-success-bg text-status-success'
                        }`}
                      >
                        {tck.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1 ${
                          tck.checkInStatus === 'Checked In'
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
                    <td className="py-2.5 px-3 text-text-muted">{tck.purchaseDate}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveTicketModal(tck)}
                          className="px-2 py-1 rounded bg-surface hover:bg-ivory-200 border border-border text-[10px] font-semibold text-primary transition"
                        >
                          View Ticket
                        </button>

                        {tck.checkInStatus !== 'Checked In' && tck.status !== 'Cancelled' && (
                          <button
                            onClick={() => performCheckIn(tck.id)}
                            className="px-2 py-1 rounded bg-primary hover:bg-primary-hover text-white text-[10px] font-semibold transition"
                          >
                            Check In
                          </button>
                        )}

                        {tck.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelTicket(tck.id)}
                            className="px-2 py-1 rounded bg-status-error-bg hover:bg-status-error/20 text-status-error text-[10px] font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted text-xs">
                    No ticket records match your filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIGITAL TICKET MODAL */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
          <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <UniversityCrest className="w-6 h-6" variant="gold" />
                <h3 className="text-lg font-bold text-text-primary">
                  Digital Event Pass
                </h3>
              </div>
              <button
                onClick={() => setActiveTicketModal(null)}
                className="text-text-muted hover:text-text-primary font-bold text-lg"
              >
                ×
              </button>
            </div>

            {/* Pass Body */}
            <div className="p-4 bg-gradient-to-b from-primary-800 to-primary text-white rounded-lg space-y-3 text-center relative overflow-hidden">
              <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                Official SkyLine Event Ticket
              </div>
              <h4 className="text-base font-bold text-white">
                {activeEvent.title}
              </h4>
              <p className="text-xs text-primary-100">
                {activeEvent.dateDisplay} • {activeEvent.venue}
              </p>

              {/* QR Code Container */}
              <div className="my-3 p-3 bg-white text-text-primary rounded-md inline-block border-2 border-accent">
                <QrCode className="w-32 h-32 mx-auto text-primary" />
                <div className="font-mono text-[10px] font-bold text-text-primary mt-1">
                  {activeTicketModal.qrCode || activeTicketModal.id}
                </div>
              </div>

              <div className="text-xs text-primary-100 space-y-0.5">
                <div>Holder: <strong className="text-white">{activeTicketModal.attendeeName}</strong></div>
                <div>Pass Type: <span className="text-accent font-semibold">{activeTicketModal.ticketType}</span></div>
                <div className="font-mono text-[10px] text-accent">ID: {activeTicketModal.id}</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-text-muted">Status: <strong className="text-status-success">{activeTicketModal.status}</strong></span>
              <button
                onClick={() => setActiveTicketModal(null)}
                className="px-4 py-1.5 rounded bg-ivory-200 text-text-primary text-xs font-semibold"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTicketsView;
