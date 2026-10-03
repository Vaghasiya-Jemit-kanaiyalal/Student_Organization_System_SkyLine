import React from 'react';
import {
  X,
  Megaphone,
  Calendar,
  Clock,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Bell,
  Layout,
  Paperclip,
  Share2
} from 'lucide-react';
import { UniversityCrest } from '../common/UniversityCrest';

/**
 * AnnouncementDetailsModal Component
 * Comprehensive inspector for organization announcements, including content,
 * audience segmentation, delivery channels, attachments, and delivery metrics.
 */
export const AnnouncementDetailsModal = ({ announcement, onClose, onEdit, onResend }) => {
  if (!announcement) return null;

  const stats = announcement.deliveryStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs overflow-y-auto">
      <div className="max-w-2xl w-full bg-surface border border-border rounded-xl shadow-elevated overflow-hidden animate-fadeIn my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary via-primary-hover to-primary p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <UniversityCrest className="w-4 h-4" variant="gold" />
            <span>{announcement.category || 'General'} Announcement</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
            {announcement.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-primary-100 mt-2">
            <span>By: <strong className="text-white">{announcement.author || 'Club Admin'}</strong></span>
            <span>•</span>
            <span>Created: {announcement.createdDate}</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                announcement.status === 'Sent'
                  ? 'bg-status-success text-white'
                  : announcement.status === 'Scheduled'
                  ? 'bg-accent text-white'
                  : announcement.status === 'Draft'
                  ? 'bg-status-warning text-white'
                  : 'bg-status-error text-white'
              }`}
            >
              {announcement.status}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-text-primary max-h-[70vh] overflow-y-auto">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-ivory-100 rounded-lg border border-border">
            <div>
              <span className="text-[11px] font-medium text-text-secondary block">Recipients</span>
              <p className="font-semibold text-text-primary text-sm mt-0.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span>{announcement.sentTo}</span>
              </p>
              <span className="text-[10px] text-text-muted">{announcement.recipientsCount} recipients targeted</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-text-secondary block">Priority Rating</span>
              <p className="font-semibold text-text-primary text-sm mt-0.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                    announcement.priority === 'Urgent'
                      ? 'bg-status-error-bg text-status-error border border-status-error/30'
                      : announcement.priority === 'Important'
                      ? 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                      : 'bg-ivory-200 text-text-secondary'
                  }`}
                >
                  {announcement.priority || 'Normal'}
                </span>
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-text-secondary block">Timeline Date</span>
              <p className="font-semibold text-text-primary text-sm mt-0.5">
                {announcement.status === 'Sent'
                  ? announcement.sentDate || 'Sent'
                  : announcement.status === 'Scheduled'
                  ? `${announcement.scheduledDate} • ${announcement.scheduledTime}`
                  : 'Draft / Unscheduled'}
              </p>
            </div>
          </div>

          {/* Full Announcement Message */}
          <div>
            <h4 className="font-semibold text-text-primary mb-1.5 text-sm">
              Announcement Message
            </h4>
            <div className="p-4 rounded-lg bg-surface border border-border text-xs leading-relaxed text-text-primary whitespace-pre-line shadow-xs">
              {announcement.content}
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2 text-sm">
              Delivery Channels Enabled
            </h4>
            <div className="flex flex-wrap gap-2">
              {(announcement.channels || ['Email', 'In-app Notification']).map((ch) => (
                <span
                  key={ch}
                  className="px-2.5 py-1 rounded bg-ivory-100 border border-border text-[11px] font-medium text-text-primary flex items-center gap-1.5"
                >
                  {ch === 'Email' && <Mail className="w-3.5 h-3.5 text-primary" />}
                  {ch === 'In-app Notification' && <Bell className="w-3.5 h-3.5 text-accent" />}
                  {ch === 'Announcement Board' && <Layout className="w-3.5 h-3.5 text-status-success" />}
                  <span>{ch}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div>
              <h4 className="font-semibold text-text-primary mb-2 text-sm flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                <span>Enclosed Attachments</span>
              </h4>
              <div className="space-y-1.5">
                {announcement.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-ivory-50 border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-text-primary">{file.name}</span>
                    </div>
                    <span className="text-[11px] text-text-muted">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Read Analytics (For Sent Announcements) */}
          {announcement.status === 'Sent' && stats && (
            <div>
              <h4 className="font-semibold text-text-primary mb-2 text-sm flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-status-success" />
                <span>Delivery & Reading Metrics</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded bg-ivory-100 border border-border text-center">
                  <span className="text-[10px] text-text-muted block">Total Targeted</span>
                  <span className="text-base font-bold text-text-primary">{stats.total}</span>
                </div>
                <div className="p-3 rounded bg-ivory-100 border border-border text-center">
                  <span className="text-[10px] text-text-muted block">Delivered</span>
                  <span className="text-base font-bold text-status-success">{stats.delivered}</span>
                </div>
                <div className="p-3 rounded bg-ivory-100 border border-border text-center">
                  <span className="text-[10px] text-text-muted block">Opened / Read</span>
                  <span className="text-base font-bold text-primary">{stats.opened}</span>
                </div>
                <div className="p-3 rounded bg-ivory-100 border border-border text-center">
                  <span className="text-[10px] text-text-muted block">Open Rate</span>
                  <span className="text-base font-bold text-accent">{stats.openRate || '80%'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-ivory-100 border-t border-border flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus"
          >
            Close Details
          </button>

          <div className="flex items-center space-x-2">
            {announcement.status === 'Sent' && onResend && (
              <button
                onClick={() => {
                  onClose();
                  onResend(announcement);
                }}
                className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-campus flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-accent" />
                <span>Resend Announcement</span>
              </button>
            )}

            {(announcement.status === 'Draft' || announcement.status === 'Scheduled') && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(announcement);
                }}
                className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-campus"
              >
                Edit Announcement
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnnouncementDetailsModal;
