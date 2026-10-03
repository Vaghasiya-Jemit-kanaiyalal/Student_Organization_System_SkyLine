import React, { useState } from 'react';
import { X, Calendar, Clock, Globe } from 'lucide-react';
import { UniversityCrest } from '../common/UniversityCrest';

/**
 * RescheduleModal Component
 * Allows changing the scheduled delivery date, time, and timezone for an announcement.
 */
export const RescheduleModal = ({ announcement, onClose, onSave }) => {
  const [newDate, setNewDate] = useState(announcement?.scheduledDate || '2026-11-15');
  const [newTime, setNewTime] = useState(announcement?.scheduledTime || '09:00 AM');
  const [timeZone, setTimeZone] = useState(announcement?.timezone || 'Organization Time Zone (IST)');
  const [error, setError] = useState('');

  if (!announcement) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      setError('Both date and time are required to reschedule.');
      return;
    }

    onSave(announcement.id, {
      scheduledDate: newDate,
      scheduledTime: newTime,
      timezone: timeZone
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <UniversityCrest className="w-5 h-5" variant="burgundy" />
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Reschedule Announcement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary font-bold text-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-text-secondary">
          Update the dispatch queue for <strong className="text-text-primary">"{announcement.title}"</strong>.
        </p>

        {error && (
          <div className="p-2.5 rounded bg-status-error-bg text-status-error text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              New Delivery Date <span className="text-status-error">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              New Delivery Time <span className="text-status-error">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Time Zone
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Organization Time Zone (IST)">Organization Time Zone (IST - UTC+5:30)</option>
              <option value="Eastern Time (US & Canada)">Eastern Time (EST - UTC-5:00)</option>
              <option value="Greenwich Mean Time (UTC)">Greenwich Mean Time (UTC+0:00)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-border flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded bg-surface hover:bg-ivory-200 border border-border font-semibold text-text-primary transition-campus"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-semibold shadow-sm transition-campus"
            >
              Save New Schedule
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RescheduleModal;
