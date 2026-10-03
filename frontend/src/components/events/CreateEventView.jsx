import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, MapPin, Ticket, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * CreateEventView Component
 * Form structured into Sections A-E for creating and publishing a new organization event.
 */
export const CreateEventView = ({ onSaveEvent, onCancel }) => {
  // Form State
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Competition & Exhibition');
  const [eventDescription, setEventDescription] = useState('');
  const [eventBanner, setEventBanner] = useState('');

  // Section B
  const [eventDate, setEventDate] = useState('2026-11-25');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venue, setVenue] = useState('');
  const [venueCapacity, setVenueCapacity] = useState(150);

  // Section C
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [maxAttendees, setMaxAttendees] = useState(150);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-11-24');

  // Section D: Ticket Configurations
  const [ticketTypes, setTicketTypes] = useState([
    { id: 'tt-1', name: 'Member Ticket', price: 0, capacity: 100, memberDiscount: 0, availability: 'Available' },
    { id: 'tt-2', name: 'Student Ticket', price: 5, capacity: 50, memberDiscount: 5, availability: 'Available' }
  ]);

  // Validation & Feedback
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const EVENT_TYPE_OPTIONS = [
    'Competition & Exhibition',
    'Debate & Public Forum',
    'Community Service',
    'Hackathon',
    'Workshop',
    'Seminar',
    'Lecture',
    'Social Event',
    'Other'
  ];

  // Ticket Handler Functions
  const handleAddTicketType = () => {
    const newId = `tt-${Date.now()}`;
    setTicketTypes([
      ...ticketTypes,
      { id: newId, name: 'Public Ticket', price: 10, capacity: 25, memberDiscount: 0, availability: 'Available' }
    ]);
  };

  const handleRemoveTicketType = (id) => {
    if (ticketTypes.length === 1) {
      alert('At least one ticket type must be configured.');
      return;
    }
    setTicketTypes(ticketTypes.filter((t) => t.id !== id));
  };

  const handleUpdateTicketType = (id, field, value) => {
    setTicketTypes(
      ticketTypes.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Validation Rules
  const validateForm = () => {
    const errs = {};

    if (!eventName.trim()) errs.eventName = 'Event name is required.';
    if (!eventType) errs.eventType = 'Event type selection is required.';
    if (!eventDate) errs.eventDate = 'Event date is required.';
    if (!startTime) errs.startTime = 'Start time is required.';
    if (!venue.trim()) errs.venue = 'Venue location is required.';
    if (!venueCapacity || Number(venueCapacity) <= 0) errs.venueCapacity = 'Valid venue capacity is required.';

    if (endTime && startTime && endTime < startTime) {
      errs.endTime = 'End time cannot be before start time.';
    }

    if (registrationRequired) {
      if (Number(maxAttendees) > Number(venueCapacity)) {
        errs.maxAttendees = 'Maximum attendees cannot exceed venue capacity.';
      }
      if (registrationDeadline && eventDate && registrationDeadline > eventDate) {
        errs.registrationDeadline = 'Registration deadline cannot be after the event date.';
      }
    }

    // Validate Tickets
    const totalTicketCapacity = ticketTypes.reduce((acc, curr) => acc + Number(curr.capacity || 0), 0);
    if (totalTicketCapacity > Number(venueCapacity)) {
      errs.tickets = `Total ticket capacity (${totalTicketCapacity}) exceeds venue capacity (${venueCapacity}).`;
    }

    ticketTypes.forEach((t) => {
      if (Number(t.price) < 0) {
        errs.tickets = 'Ticket price must be a valid non-negative number.';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (status = 'Published & Active') => {
    setSuccessMessage('');
    if (!validateForm()) return;

    // Calculate display strings
    const dateObj = new Date(eventDate);
    const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    // Create new event payload
    const formattedPriceString = ticketTypes.map(t => t.price === 0 ? `${t.name}: Free` : `${t.name}: $${t.price}`).join(' / ');

    const newEvent = {
      id: `evt-${Date.now()}`,
      title: eventName,
      category: eventType,
      date: eventDate,
      dateDisplay: dateDisplay,
      startTime: startTime,
      endTime: endTime,
      timeDisplay: `${startTime} - ${endTime}`,
      venue: venue,
      location: venue,
      capacity: Number(venueCapacity),
      attendees: 0,
      price: formattedPriceString || 'Free',
      badge: status === 'Draft' ? 'Draft Event' : 'Newly Created',
      status: status,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      image: eventBanner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      description: eventDescription || 'Official student organization campus event.',
      userRsvp: false,
      ticketTypes: ticketTypes.map((tt, idx) => ({
        id: tt.id,
        name: tt.name,
        price: Number(tt.price),
        capacity: Number(tt.capacity),
        sold: 0,
        available: Number(tt.capacity),
        revenue: 0
      })),
      tickets: []
    };

    setSuccessMessage(`Event "${eventName}" successfully ${status === 'Draft' ? 'saved as Draft' : 'created and published'}!`);
    
    setTimeout(() => {
      onSaveEvent(newEvent);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Create Event
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Create and publish a new organization event.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 rounded bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary transition-campus"
        >
          Cancel & Return
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="font-semibold text-sm">{successMessage}</div>
        </div>
      )}

      {/* Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-xl bg-status-error-bg border border-status-error/30 text-status-error text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Please correct the errors in the event form:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-2">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="space-y-6">
        {/* SECTION A — Basic Information */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">A</span>
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Event Name <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Autonomous Robotics Showcase 2026"
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Event Type <span className="text-status-error">*</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Event Description
            </label>
            <textarea
              rows={3}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Describe the purpose, schedule, guest speakers, and requirements for attendees..."
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Event Banner / Image Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Event Cover Banner / Image Option
            </label>
            
            <div className="space-y-3">
              {/* Preset Image Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Robotics Lab', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Auditorium Debate', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Botanical Reserve', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Hackathon Coding', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setEventBanner(preset.url)}
                    className={`relative rounded-lg overflow-hidden border text-left p-1 transition ${
                      eventBanner === preset.url
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-16 object-cover rounded" />
                    <span className="text-[10px] font-semibold text-text-primary block mt-1 px-1 truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Image URL Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={eventBanner}
                  onChange={(e) => setEventBanner(e.target.value)}
                  placeholder="Or paste custom image URL (https://...)"
                  className="flex-1 px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Live Preview */}
              {eventBanner && (
                <div className="p-2 bg-ivory-100 border border-border rounded-lg flex items-center space-x-3">
                  <img src={eventBanner} alt="Preview" className="w-20 h-12 object-cover rounded border border-border" />
                  <div className="text-[11px] text-text-secondary">
                    <strong className="text-text-primary block">Banner Preview Selected</strong>
                    Selected cover image will be displayed on event cards, details modal, and ticket headers.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B — Date & Venue */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">B</span>
            Date & Venue
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Event Date <span className="text-status-error">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Start Time <span className="text-status-error">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Venue Location <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Grand Hall, Turing Science Quad"
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Venue Capacity <span className="text-status-error">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION C — Registration */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">C</span>
            Registration Controls
          </h3>

          <div className="flex items-center space-x-3 pt-1">
            <input
              type="checkbox"
              id="registrationRequired"
              checked={registrationRequired}
              onChange={(e) => setRegistrationRequired(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="registrationRequired" className="text-xs font-semibold text-text-primary cursor-pointer">
              Registration Required for Event Entry
            </label>
          </div>

          {registrationRequired && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION D — Ticket Configuration */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">D</span>
              Ticket Configuration
            </h3>
            <button
              type="button"
              onClick={handleAddTicketType}
              className="px-3 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-campus flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Ticket Type</span>
            </button>
          </div>

          <div className="space-y-3">
            {ticketTypes.map((t, index) => (
              <div key={t.id} className="p-4 rounded-lg bg-ivory-100 border border-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-text-primary mb-1">
                    Ticket Type Name
                  </label>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => handleUpdateTicketType(t.id, 'name', e.target.value)}
                    placeholder="e.g. Member Ticket"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-text-primary mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={t.price}
                    onChange={(e) => handleUpdateTicketType(t.id, 'price', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-text-primary mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={t.capacity}
                    onChange={(e) => handleUpdateTicketType(t.id, 'capacity', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-text-primary mb-1">
                    Availability Status
                  </label>
                  <select
                    value={t.availability || 'Available'}
                    onChange={(e) => handleUpdateTicketType(t.id, 'availability', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary"
                  >
                    <option value="Available">Available</option>
                    <option value="Presale">Presale</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveTicketType(t.id)}
                    className="p-1.5 rounded text-status-error hover:bg-status-error-bg transition"
                    title="Remove ticket type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION E — Publishing Actions */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-secondary">
            Event will be saved in the institutional catalog and available for ticket management.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              className="px-4 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-campus"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('Published & Active')}
              className="px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center space-x-1.5"
            >
              <span>Publish Event</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventView;
