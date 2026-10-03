import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Send,
  XCircle,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Bell,
  Layout,
  RefreshCw
} from 'lucide-react';
import { AnnouncementDetailsModal } from './AnnouncementDetailsModal';
import { RescheduleModal } from './RescheduleModal';

/**
 * ScheduledAnnouncementsView Component
 * Dedicated monitor for pending scheduled broadcasts, with live rescheduling,
 * instant manual dispatch ("Send Now"), and cancellation workflows.
 */
export const ScheduledAnnouncementsView = ({
  announcements,
  setAnnouncements,
  onNavigateToCreate,
  onEditAnnouncement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [reschedulingAnnouncement, setReschedulingAnnouncement] = useState(null);
  const [confirmSendItem, setConfirmSendItem] = useState(null);
  const [confirmCancelItem, setConfirmCancelItem] = useState(null);
  const [bannerFeedback, setBannerFeedback] = useState(null);

  // Filter scheduled records only
  const scheduledList = announcements.filter((a) => a.status === 'Scheduled');

  const filteredScheduled = scheduledList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRecipient = recipientFilter === 'ALL' || item.sentTo === recipientFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesRecipient && matchesCategory;
  });

  // Action: Reschedule Callback
  const handleSaveReschedule = (id, newSchedule) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              scheduledDate: newSchedule.scheduledDate,
              scheduledTime: newSchedule.scheduledTime,
              timezone: newSchedule.timezone
            }
          : a
      )
    );
    setBannerFeedback({
      type: 'success',
      text: `Announcement successfully rescheduled for ${newSchedule.scheduledDate} at ${newSchedule.scheduledTime}.`
    });
    setTimeout(() => setBannerFeedback(null), 3000);
  };

  // Action: Send Now Immediate Dispatch
  const handleConfirmSendNow = () => {
    if (!confirmSendItem) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const fullTimeStr = `Today • ${timestamp}`;

    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === confirmSendItem.id
          ? {
              ...a,
              status: 'Sent',
              sentDate: fullTimeStr,
              scheduledDate: null,
              scheduledTime: null,
              deliveryStats: {
                total: a.recipientsCount,
                delivered: Math.max(1, a.recipientsCount - 2),
                failed: 2,
                opened: Math.round(a.recipientsCount * 0.72),
                openRate: '72.0%'
              }
            }
          : a
      )
    );

    setBannerFeedback({
      type: 'success',
      text: `"${confirmSendItem.title}" has been transmitted immediately and recorded under All Announcements.`
    });
    setConfirmSendItem(null);
    setTimeout(() => setBannerFeedback(null), 3500);
  };

  // Action: Cancel Scheduled Announcement (preserved in All Announcements as Cancelled)
  const handleConfirmCancel = () => {
    if (!confirmCancelItem) return;

    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === confirmCancelItem.id ? { ...a, status: 'Cancelled' } : a
      )
    );

    setBannerFeedback({
      type: 'warning',
      text: `Scheduled transmission for "${confirmCancelItem.title}" was cancelled. Record preserved in All Announcements.`
    });
    setConfirmCancelItem(null);
    setTimeout(() => setBannerFeedback(null), 3500);
  };

  // Action: Delete Permanently
  const handleDelete = (id, title) => {
    if (window.confirm(`Permanently delete scheduled announcement "${title}"?`)) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setBannerFeedback({
        type: 'success',
        text: `Scheduled announcement "${title}" was removed.`
      });
      setTimeout(() => setBannerFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif-academic text-2xl font-bold text-text-primary">
            Scheduled Announcements
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage announcements that are scheduled for future automated delivery ({scheduledList.length} in queue).
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="px-4 py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>+ Create Announcement</span>
        </button>
      </div>

      {/* Notification Toast */}
      {bannerFeedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center space-x-2 animate-fadeIn ${
            bannerFeedback.type === 'success'
              ? 'bg-status-success-bg border-status-success/30 text-status-success'
              : 'bg-status-warning-bg border-status-warning/30 text-status-warning'
          }`}
        >
          {bannerFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="font-semibold">{bannerFeedback.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scheduled announcements..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Recipient Groups</option>
            <option value="All Members">All Members</option>
            <option value="Active Members">Active Members</option>
            <option value="Event Participants">Event Participants</option>
            <option value="Volunteers">Volunteers</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Categories</option>
            <option value="General">General</option>
            <option value="Event">Event</option>
            <option value="Membership">Membership</option>
            <option value="Volunteer">Volunteer</option>
          </select>
        </div>
      </div>

      {/* Scheduled Cards Grid */}
      {filteredScheduled.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScheduled.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl border border-border p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:shadow-card transition"
            >
              <div className="space-y-3">
                {/* Header Tag Bar */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-light text-primary border border-primary-200">
                      {item.category || 'General'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-light text-accent-700 border border-accent-300">
                      Scheduled
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-accent font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.scheduledTime || '09:00 AM'}</span>
                  </span>
                </div>

                {/* Title & Preview */}
                <div>
                  <h3 className="font-serif-academic text-lg font-bold text-text-primary leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="p-3 bg-ivory-100 rounded-lg border border-border grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">Target Audience</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{item.sentTo} ({item.recipientsCount})</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted block">Dispatch Date</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{item.scheduledDate}</span>
                    </span>
                  </div>
                </div>

                {/* Delivery Channels */}
                <div className="flex items-center space-x-1.5 text-[11px] text-text-muted">
                  <span>Channels:</span>
                  {(item.channels || ['Email']).map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 rounded bg-surface border border-border text-text-primary text-[10px] font-medium"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setViewingAnnouncement(item)}
                    className="px-2.5 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-text-muted" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onEditAnnouncement(item)}
                    className="px-2.5 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-text-muted" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setReschedulingAnnouncement(item)}
                    className="px-2.5 py-1.5 rounded bg-accent/10 hover:bg-accent/20 border border-accent/30 text-xs font-semibold text-accent-700 transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-accent" />
                    <span>Reschedule</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setConfirmSendItem(item)}
                    className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5 text-accent" />
                    <span>Send Now</span>
                  </button>

                  <button
                    onClick={() => setConfirmCancelItem(item)}
                    title="Cancel Scheduled"
                    className="p-1.5 rounded bg-surface hover:bg-status-warning-bg border border-border text-status-warning transition"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Delete Record"
                    className="p-1.5 rounded bg-surface hover:bg-status-error-bg border border-border text-status-error transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-text-muted text-xs bg-surface rounded-xl border border-border">
          No scheduled announcements in the queue at this time.
        </div>
      )}

      {/* MODAL 1: DETAILS */}
      {viewingAnnouncement && (
        <AnnouncementDetailsModal
          announcement={viewingAnnouncement}
          onClose={() => setViewingAnnouncement(null)}
          onEdit={(item) => {
            setViewingAnnouncement(null);
            onEditAnnouncement(item);
          }}
        />
      )}

      {/* MODAL 2: RESCHEDULE */}
      {reschedulingAnnouncement && (
        <RescheduleModal
          announcement={reschedulingAnnouncement}
          onClose={() => setReschedulingAnnouncement(null)}
          onSave={handleSaveReschedule}
        />
      )}

      {/* CONFIRMATION DIALOG: SEND NOW */}
      {confirmSendItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
          <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Send this announcement now?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This will immediately bypass the scheduled queue and transmit the announcement to targeted recipients.
            </p>

            <div className="p-3.5 bg-ivory-100 rounded-lg border border-border text-xs space-y-1.5">
              <div><strong>Title:</strong> {confirmSendItem.title}</div>
              <div><strong>Recipient Group:</strong> {confirmSendItem.sentTo} ({confirmSendItem.recipientsCount} recipients)</div>
              <div><strong>Channels:</strong> {(confirmSendItem.channels || []).join(', ')}</div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setConfirmSendItem(null)}
                className="px-3.5 py-2 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendNow}
                className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-accent" />
                <span>Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: CANCEL SCHEDULED */}
      {confirmCancelItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
          <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Cancel this scheduled announcement?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This will remove <strong className="text-text-primary">"{confirmCancelItem.title}"</strong> from the automated dispatch queue. It will remain in <span className="font-semibold text-text-primary">All Announcements</span> history marked as <strong className="text-status-warning">Cancelled</strong>.
            </p>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setConfirmCancelItem(null)}
                className="px-3.5 py-2 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary"
              >
                Keep Scheduled
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded bg-status-error text-white text-xs font-semibold shadow-sm"
              >
                Cancel Transmission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledAnnouncementsView;
