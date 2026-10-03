import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { eventsApi } from '../../services/api';

const EVENT_TYPE_OPTIONS = [
  'Flagship Event',
  'Career & Networking',
  'Hackathon',
  'Technical Workshop',
  'Seminar & Lecture',
  'Social & Culture',
  'Competition & Exhibition',
  'Community Service',
  'Debate & Public Forum',
  'General Event',
];

const DEFAULT_VOLUNTEER_ROLES = [
  'Registration Desk',
  'Photography Team',
  'Technical Support',
  'Stage Management',
  'Hospitality',
  'Event Coordinator',
];

const PRESET_BANNER_IMAGES = [
  { label: 'Tech & Hackathon', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Campus Conference', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Music & Cultural', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Workshop & Lab', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
];

export const CreateEventView = ({ onSaveEvent, onCancel }) => {
  // Event Information
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Competition & Exhibition');
  const [eventDescription, setEventDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('16:00');
  const [capacity, setCapacity] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [eventBanner, setEventBanner] = useState(PRESET_BANNER_IMAGES[0].url);

  // Volunteer Configuration
  const [volunteersRequired, setVolunteersRequired] = useState(true);
  const [volunteerCountRequired, setVolunteerCountRequired] = useState(12);
  const [volunteerDeadline, setVolunteerDeadline] = useState('2026-11-18');
  const [selectedRoles, setSelectedRoles] = useState([
    'Registration Desk',
    'Technical Support',
    'Hospitality',
  ]);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Event Status
  const [eventStatus, setEventStatus] = useState('Published');

  // UI Feedback & States
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Role toggle handler
  const handleToggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddCustomRole = (e) => {
    e.preventDefault();
    const trimmed = customRoleInput.trim();
    if (trimmed && !selectedRoles.includes(trimmed)) {
      setSelectedRoles([...selectedRoles, trimmed]);
      setCustomRoleInput('');
    }
  };

  const handleRemoveRole = (role) => {
    setSelectedRoles(selectedRoles.filter((r) => r !== role));
  };

  const validateForm = () => {
    const errs = {};
    if (!eventName.trim()) errs.eventName = 'Event Name is required.';
    if (!venue.trim()) errs.venue = 'Venue is required.';
    if (!eventDate) errs.eventDate = 'Event Date is required.';
    if (!startTime) errs.startTime = 'Start Time is required.';
    if (!endTime) errs.endTime = 'End Time is required.';
    if (Number(capacity) <= 0) errs.capacity = 'Capacity must be greater than 0.';
    if (Number(ticketPrice) < 0) errs.ticketPrice = 'Ticket price cannot be negative.';

    if (volunteersRequired) {
      if (Number(volunteerCountRequired) <= 0) {
        errs.volunteerCount = 'Please specify the number of volunteers required.';
      }
      if (selectedRoles.length === 0) {
        errs.volunteerRoles = 'Please select at least one required volunteer role.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (overrideStatus) => {
    const finalStatus = overrideStatus || eventStatus;
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMessage('');

    const payload = {
      title: eventName,
      description: eventDescription,
      event_type: eventType,
      venue: venue,
      location: venue,
      date: eventDate,
      start_time: startTime,
      end_time: endTime,
      capacity: Number(capacity),
      ticket_price: Number(ticketPrice),
      image: eventBanner,
      volunteers_required: volunteersRequired,
      volunteer_count_required: volunteersRequired ? Number(volunteerCountRequired) : 0,
      volunteer_deadline: volunteersRequired && volunteerDeadline ? volunteerDeadline : null,
      volunteer_roles_required: volunteersRequired ? selectedRoles : [],
      status: finalStatus,
    };

    try {
      let createdEvent = null;
      try {
        createdEvent = await eventsApi.create(payload);
      } catch (apiErr) {
        console.error('Backend API save failed:', apiErr);
        const errData = apiErr.response?.data?.details || apiErr.response?.data;
        const errMsg = errData
          ? (typeof errData === 'object'
              ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
              : String(errData))
          : apiErr.message || 'Network error saving event';
        setErrors({ submit: `Failed to create event: ${errMsg}` });
        setSubmitting(false);
        return;
      }

      const formattedPrice = Number(ticketPrice) === 0 ? 'Free' : `$${Number(ticketPrice).toFixed(2)}`;

      const localEventObj = {
        ...createdEvent,
        id: createdEvent?.id || `evt-${Date.now()}`,
        title: createdEvent?.title || eventName,
        category: createdEvent?.event_type || eventType,
        date: createdEvent?.date || eventDate,
        dateDisplay: (() => {
          const parts = (createdEvent?.date || eventDate).split('-');
          if (parts.length === 3) {
            return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
          }
          return createdEvent?.date || eventDate;
        })(),
        startTime: startTime,
        endTime: endTime,
        timeDisplay: `${startTime} – ${endTime}`,
        venue: venue,
        location: venue,
        capacity: Number(capacity),
        availableSeats: Number(capacity),
        attendees: 0,
        price: formattedPrice,
        ticketPrice: Number(ticketPrice),
        image: eventBanner,
        description: eventDescription,
        status: finalStatus,
        volunteersRequired: volunteersRequired,
        volunteers_required: volunteersRequired,
        volunteerCountRequired: Number(volunteerCountRequired),
        volunteer_count_required: Number(volunteerCountRequired),
        volunteerDeadline: volunteerDeadline,
        volunteer_deadline: volunteerDeadline,
        volunteerRolesRequired: selectedRoles,
        volunteer_roles_required: selectedRoles,
        roles_list: selectedRoles,
        volunteer_slots_remaining: Number(volunteerCountRequired),
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      };

      setSuccessMessage(`Event "${eventName}" successfully ${finalStatus === 'Draft' ? 'saved as Draft' : 'created and published'}!`);

      setTimeout(() => {
        if (onSaveEvent) onSaveEvent(localEventObj);
      }, 800);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to create event. Please verify all fields.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Create New Event
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure event details, ticket availability, and volunteer recruitment quotas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary transition"
          >
            Cancel & Return
          </button>
        </div>
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
            <span>Please resolve the following before saving:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-2">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        {/* ================================================================= */}
        {/* SECTION 1: EVENT INFORMATION                                      */}
        {/* ================================================================= */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-5">
          <h3 className="text-base font-bold text-text-primary border-b border-border pb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
            Event Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Event Type <span className="text-status-error">*</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              Description
            </label>
            <textarea
              rows="3"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Describe event agenda, keynote speakers, eligibility, and program schedule..."
              className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Venue Location <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Grand Auditorium, Engineering Block B"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Date <span className="text-status-error">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Start Time <span className="text-status-error">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  End Time <span className="text-status-error">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Attendee Capacity <span className="text-status-error">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Ticket Price ($) <span className="text-status-error">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="0.00 for Free admission"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-text-muted mt-0.5 block">Enter 0 for free student admission.</span>
            </div>
          </div>

          {/* Banner Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Event Banner / Cover Image URL
            </label>
            <input
              type="url"
              value={eventBanner}
              onChange={(e) => setEventBanner(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary mb-2"
            />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-text-muted">Preset Banners:</span>
              {PRESET_BANNER_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setEventBanner(preset.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                    eventBanner === preset.url
                      ? 'bg-primary text-white border-primary'
                      : 'bg-canvas text-text-secondary hover:text-text-primary border-border'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {eventBanner && (
              <div className="mt-3 relative h-32 w-full rounded-lg overflow-hidden border border-border">
                <img
                  src={eventBanner}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                  Cover Preview
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 2: VOLUNTEER CONFIGURATION                                */}
        {/* ================================================================= */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-3">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
              Volunteer Configuration
            </h3>

            {/* YES / NO TOGGLE */}
            <div className="flex items-center space-x-2 bg-canvas p-1 rounded-lg border border-border">
              <span className="text-xs font-semibold text-text-secondary pl-1.5">
                Volunteers Required?
              </span>
              <button
                type="button"
                onClick={() => setVolunteersRequired(true)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  volunteersRequired
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setVolunteersRequired(false)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  !volunteersRequired
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {volunteersRequired ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Number of Volunteers Required <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required={volunteersRequired}
                    value={volunteerCountRequired}
                    onChange={(e) => setVolunteerCountRequired(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Volunteer Registration Deadline <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="date"
                    required={volunteersRequired}
                    value={volunteerDeadline}
                    onChange={(e) => setVolunteerDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Volunteer Roles Required */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Volunteer Roles Required <span className="text-status-error">*</span>
                </label>
                <p className="text-[11px] text-text-muted mb-2">
                  Select available roles for student applicants (click to toggle):
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_VOLUNTEER_ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleToggleRole(role)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-canvas text-text-secondary hover:text-text-primary border-border'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Role Input */}
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Add custom role (e.g. Drone Pilot, Audio Tech)..."
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRole(e);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRole}
                    className="px-3 py-1.5 rounded-lg bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary"
                  >
                    Add Role
                  </button>
                </div>

                {/* Selected Roles Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Active Selection:</span>
                  {selectedRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="hover:text-status-error ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-canvas text-text-muted text-xs">
              No volunteer quota assigned for this event. Students will only be able to view details and buy tickets.
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION 3: EVENT STATUS & SUBMISSION                              */}
        {/* ================================================================= */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Publication Status:
              </label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <span className="text-[11px] text-text-muted max-w-xs">
              Published events will immediately appear on Student Accounts.
            </span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('Draft')}
              className="px-4 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary transition"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <span>{submitting ? 'Creating Event...' : 'Publish Event'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
