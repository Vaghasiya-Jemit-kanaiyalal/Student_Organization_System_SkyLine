import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  XCircle,
  Clock,
  Send,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AnnouncementDetailsModal } from './AnnouncementDetailsModal';

/**
 * AllAnnouncementsView Component
 * Displays complete announcement history with advanced filters, status-aware actions,
 * delivery counters, and pagination.
 */
export const AllAnnouncementsView = ({
  announcements,
  setAnnouncements,
  onNavigateToCreate,
  onEditAnnouncement,
  onDuplicateAnnouncement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [recipientFilter, setRecipientFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Status Action Handlers
  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
      setBannerMessage({ type: 'success', text: `Announcement "${title}" was deleted.` });
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  const handleCancelScheduled = (id, title) => {
    if (window.confirm(`Cancel scheduled transmission for "${title}"? It will be marked as Cancelled in history.`)) {
      setAnnouncements(
        announcements.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
      );
      setBannerMessage({ type: 'warning', text: `Scheduled announcement "${title}" has been cancelled.` });
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  const handleSendNow = (announcement) => {
    if (window.confirm(`Transmit "${announcement.title}" immediately to ${announcement.recipientsCount} recipients?`)) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const fullTimeStr = `Today • ${timestamp}`;

      setAnnouncements(
        announcements.map((a) =>
          a.id === announcement.id
            ? {
                ...a,
                status: 'Sent',
                sentDate: fullTimeStr,
                deliveryStats: {
                  total: a.recipientsCount,
                  delivered: Math.max(1, a.recipientsCount - 2),
                  failed: 2,
                  opened: Math.round(a.recipientsCount * 0.75),
                  openRate: '75.0%'
                }
              }
            : a
        )
      );
      setBannerMessage({ type: 'success', text: `Announcement "${announcement.title}" was dispatched immediately!` });
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  const handleResend = (announcement) => {
    if (window.confirm(`Re-dispatch "${announcement.title}" to ${announcement.recipientsCount} recipients?`)) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setBannerMessage({ type: 'success', text: `Re-dispatch triggered for "${announcement.title}" (Dispatched at ${timestamp}).` });
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  // Filtering Logic
  const filtered = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesRecipient = recipientFilter === 'ALL' || item.sentTo === recipientFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesRecipient && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif-academic text-2xl font-bold text-text-primary">
            All Announcements
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            View, manage, and track all organization announcements across their lifecycle.
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
      {bannerMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center space-x-2 animate-fadeIn ${
            bannerMessage.type === 'success'
              ? 'bg-status-success-bg border-status-success/30 text-status-success'
              : 'bg-status-warning-bg border-status-warning/30 text-status-warning'
          }`}
        >
          {bannerMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold">{bannerMessage.text}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, message, or author..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Recipient Filter */}
        <div>
          <select
            value={recipientFilter}
            onChange={(e) => {
              setRecipientFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Recipient Groups</option>
            <option value="All Members">All Members</option>
            <option value="Active Members">Active Members</option>
            <option value="Expiring Members">Expiring Members</option>
            <option value="Event Participants">Event Participants</option>
            <option value="Volunteers">Volunteers</option>
            <option value="Committee Members">Committee Members</option>
            <option value="Organizers">Organizers</option>
            <option value="Treasurers">Treasurers</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Categories</option>
            <option value="General">General</option>
            <option value="Event">Event</option>
            <option value="Membership">Membership</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Fundraiser">Fundraiser</option>
            <option value="Merchandise">Merchandise</option>
            <option value="Important">Important</option>
            <option value="Emergency">Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Announcement</th>
                <th className="py-3 px-4">Message Preview</th>
                <th className="py-3 px-4">Sent To</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Sent / Scheduled</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-ivory-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-primary max-w-xs">
                      <div className="font-serif-academic text-sm font-bold text-text-primary">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-200">
                          {item.category || 'General'}
                        </span>
                        {item.priority === 'Urgent' && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-status-error-bg text-status-error">
                            Urgent
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary max-w-xs">
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {item.content}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-text-primary font-medium">
                      {item.sentTo}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">
                      <span className="truncate block max-w-[130px]">{item.author || 'Club Admin'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-text-muted">
                      {item.createdDate}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">
                      {item.status === 'Sent'
                        ? item.sentDate || 'Dispatched'
                        : item.status === 'Scheduled'
                        ? `${item.scheduledDate} ${item.scheduledTime || ''}`
                        : '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'Sent'
                            ? 'bg-status-success-bg text-status-success border border-status-success/30'
                            : item.status === 'Scheduled'
                            ? 'bg-accent-light text-accent-700 border border-accent-300'
                            : item.status === 'Draft'
                            ? 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                            : 'bg-status-error-bg text-status-error border border-status-error/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-text-primary">
                      {item.recipientsCount}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Always available View */}
                        <button
                          onClick={() => setViewingAnnouncement(item)}
                          title="View Details"
                          className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-ivory-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Status-specific actions */}
                        {item.status === 'Sent' && (
                          <>
                            <button
                              onClick={() => onDuplicateAnnouncement(item)}
                              title="Duplicate Announcement"
                              className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-ivory-200 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResend(item)}
                              title="Resend Announcement"
                              className="p-1.5 rounded text-primary hover:bg-primary-light transition"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {item.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => onEditAnnouncement(item)}
                              title="Edit Scheduled Announcement"
                              className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-ivory-200 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDuplicateAnnouncement(item)}
                              title="Duplicate Announcement"
                              className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-ivory-200 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCancelScheduled(item.id, item.title)}
                              title="Cancel Scheduled"
                              className="p-1.5 rounded text-status-warning hover:bg-status-warning-bg transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {item.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => onEditAnnouncement(item)}
                              title="Edit Draft"
                              className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-ivory-200 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSendNow(item)}
                              title="Send Immediately"
                              className="p-1.5 rounded text-status-success hover:bg-status-success-bg transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              title="Delete Draft"
                              className="p-1.5 rounded text-status-error hover:bg-status-error-bg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {item.status === 'Cancelled' && (
                          <>
                            <button
                              onClick={() => onDuplicateAnnouncement(item)}
                              title="Duplicate"
                              className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-ivory-200 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              title="Delete Record"
                              className="p-1.5 rounded text-status-error hover:bg-status-error-bg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted text-xs">
                    No announcements found matching the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filtered.length > itemsPerPage && (
          <div className="p-4 bg-ivory-50 border-t border-border flex items-center justify-between text-xs text-text-secondary">
            <span>
              Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} announcements
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-border bg-surface hover:bg-ivory-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-text-primary">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-border bg-surface hover:bg-ivory-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {viewingAnnouncement && (
        <AnnouncementDetailsModal
          announcement={viewingAnnouncement}
          onClose={() => setViewingAnnouncement(null)}
          onEdit={(item) => {
            setViewingAnnouncement(null);
            onEditAnnouncement(item);
          }}
          onResend={handleResend}
        />
      )}
    </div>
  );
};

export default AllAnnouncementsView;
