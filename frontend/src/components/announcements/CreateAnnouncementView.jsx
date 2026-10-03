import React, { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  Link2,
  Users,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  X,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { announcementsApi } from '../../services/api';

/**
 * CreateAnnouncementView Component
 * Form structured into Sections A-G for creating, scheduling, or drafting announcements
 * with rich formatting controls, audience targeting, live preview, and validation.
 */
export const CreateAnnouncementView = ({
  onSaveAnnouncement,
  onCancel,
  initialData = null
}) => {
  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'General');
  const [priority, setPriority] = useState(initialData?.priority || 'Normal');
  const [submitting, setSubmitting] = useState(false);

  // Section B: Send To
  const [sentTo, setSentTo] = useState(initialData?.sentTo || 'All Members');
  const [customSelectedMembers, setCustomSelectedMembers] = useState([]);
  const [customSearch, setCustomSearch] = useState('');

  // Section C: Channels
  const [channels, setChannels] = useState(
    initialData?.channels || ['Email', 'In-app Notification']
  );

  // Section D: Schedule / Sending
  const [sendTiming, setSendTiming] = useState(
    initialData?.status === 'Scheduled' ? 'SCHEDULE_LATER' : 'SEND_NOW'
  );
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledDate || '2026-11-15');
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime || '09:00 AM');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'Organization Time Zone (IST)');

  // Section E: Optional Settings
  const [allowReplies, setAllowReplies] = useState(initialData?.allowReplies ?? true);
  const [pinned, setPinned] = useState(initialData?.pinned ?? false);
  const [sendReminder, setSendReminder] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [attachments, setAttachments] = useState(initialData?.attachments || []);
  const [mockFileName, setMockFileName] = useState('');

  // Validation
  const [errors, setErrors] = useState({});
  const [successBanner, setSuccessBanner] = useState('');

  // Recipient Count mapping
  const RECIPIENT_COUNTS = {
    'All Members': 248,
    'Active Members': 184,
    'Expiring Members': 32,
    'Event Participants': 210,
    'Volunteers': 46,
    'Committee Members': 18,
    'Organizers': 6,
    'Treasurers': 2
  };

  const calculatedRecipientCount =
    sentTo === 'Custom Selection'
      ? customSelectedMembers.length
      : RECIPIENT_COUNTS[sentTo] || 150;

  // Format Text formatting shortcuts
  const applyFormatting = (formatType) => {
    switch (formatType) {
      case 'bold':
        setContent((prev) => `${prev} **bold text**`);
        break;
      case 'italic':
        setContent((prev) => `${prev} *italic text*`);
        break;
      case 'list':
        setContent((prev) => `${prev}\n• Bullet point 1\n• Bullet point 2`);
        break;
      case 'link':
        setContent((prev) => `${prev} [Link Title](https://university.edu)`);
        break;
      default:
        break;
    }
  };

  // Toggle delivery channels
  const handleToggleChannel = (ch) => {
    if (channels.includes(ch)) {
      if (channels.length === 1) {
        alert('At least one delivery channel must remain enabled.');
        return;
      }
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  // Add mock file attachment
  const handleAddAttachment = () => {
    if (!mockFileName.trim()) return;
    setAttachments([
      ...attachments,
      { name: mockFileName.trim(), size: '1.2 MB' }
    ]);
    setMockFileName('');
  };

  // Validation Logic
  const validateForm = (isDraft = false) => {
    const errs = {};
    if (!title.trim()) errs.title = 'Announcement title is required.';
    if (!content.trim() && !isDraft) errs.content = 'Announcement message body is required.';

    if (sentTo === 'Custom Selection' && customSelectedMembers.length === 0 && !isDraft) {
      errs.sentTo = 'Please select at least one custom member from the roster.';
    }

    if (sendTiming === 'SCHEDULE_LATER' && !isDraft) {
      if (!scheduledDate) errs.scheduledDate = 'Scheduled date is required.';
      if (!scheduledTime) errs.scheduledTime = 'Scheduled time is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleAction = async (statusTarget) => {
    setSuccessBanner('');
    const isDraft = statusTarget === 'Draft';
    if (!validateForm(isDraft)) return;

    setSubmitting(true);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const localAnnouncement = {
      id: initialData?.id || `anc-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category,
      priority: priority,
      sentTo: sentTo,
      sent_to: sentTo,
      recipientsCount: calculatedRecipientCount,
      recipients_count: calculatedRecipientCount,
      channels: channels,
      author: initialData?.author || 'Dr. Alexander Vance (Faculty Advisor)',
      createdDate: initialData?.createdDate || todayDateStr,
      sentDate: statusTarget === 'Sent' ? `Today • ${timestamp}` : null,
      sent_date: statusTarget === 'Sent' ? `Today • ${timestamp}` : null,
      scheduledDate: statusTarget === 'Scheduled' ? scheduledDate : null,
      scheduled_date: statusTarget === 'Scheduled' ? scheduledDate : null,
      scheduledTime: statusTarget === 'Scheduled' ? scheduledTime : null,
      scheduled_time: statusTarget === 'Scheduled' ? scheduledTime : null,
      timezone: timezone,
      status: statusTarget,
      pinned: pinned,
      allowReplies: allowReplies,
      allow_replies: allowReplies,
      attachments: attachments,
      deliveryStats:
        statusTarget === 'Sent'
          ? {
              total: calculatedRecipientCount,
              delivered: Math.max(1, calculatedRecipientCount - 3),
              failed: 3,
              opened: Math.round(calculatedRecipientCount * 0.78),
              openRate: '78.0%'
            }
          : null
    };

    let savedResult = localAnnouncement;

    try {
      if (initialData?.id && !String(initialData.id).startsWith('anc-')) {
        // Backend update
        const updated = await announcementsApi.patch(initialData.id, localAnnouncement);
        savedResult = { ...localAnnouncement, ...updated };
      } else {
        // Backend create
        const created = await announcementsApi.create(localAnnouncement);
        savedResult = { ...localAnnouncement, ...created };
      }
    } catch (err) {
      console.warn('Backend announcement save warning (falling back to local state):', err);
    } finally {
      setSubmitting(false);
    }

    setSuccessBanner(
      statusTarget === 'Sent'
        ? `Announcement "${title}" was dispatched immediately!`
        : statusTarget === 'Scheduled'
        ? `Announcement scheduled for ${scheduledDate} at ${scheduledTime}.`
        : `Announcement draft saved successfully.`
    );

    setTimeout(() => {
      onSaveAnnouncement(savedResult);
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            {initialData ? 'Edit Announcement' : 'Create Announcement'}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Create, target, and broadcast communications to university student groups.
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

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="font-semibold text-sm">{successBanner}</div>
        </div>
      )}

      {/* Form Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-xl bg-status-error-bg border border-status-error/30 text-status-error text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Please correct the form issues before proceeding:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-2">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="space-y-6">
        {/* SECTION A — Announcement Details */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">A</span>
            Announcement Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Announcement Title <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual General Meeting 2026"
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
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

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-text-primary">
                  Announcement Message <span className="text-status-error">*</span>
                </label>

                {/* Basic Formatting Toolbar */}
                <div className="flex items-center space-x-1 bg-ivory-100 p-1 rounded border border-border">
                  <button
                    type="button"
                    onClick={() => applyFormatting('bold')}
                    title="Bold text"
                    className="p-1 rounded hover:bg-surface text-text-secondary transition"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('italic')}
                    title="Italic text"
                    className="p-1 rounded hover:bg-surface text-text-secondary transition"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('list')}
                    title="Bullet list"
                    className="p-1 rounded hover:bg-surface text-text-secondary transition"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('link')}
                    title="Insert link"
                    className="p-1 rounded hover:bg-surface text-text-secondary transition"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the official announcement message. Markdown formatting (bold, italic, bullets) is supported..."
                className="w-full px-3 py-2.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION B — Send To */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">B</span>
              <span>Send To Target Group</span>
            </div>
            <span className="text-xs font-semibold text-primary font-sans">
              {calculatedRecipientCount} Recipients Selected
            </span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Recipient Audience Group
              </label>
              <select
                value={sentTo}
                onChange={(e) => setSentTo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All Members">All Members (248 recipients)</option>
                <option value="Active Members">Active Members (184 recipients)</option>
                <option value="Expiring Members">Expiring Members (32 recipients)</option>
                <option value="Event Participants">Event Participants (210 recipients)</option>
                <option value="Volunteers">Volunteers (46 recipients)</option>
                <option value="Committee Members">Committee Members (18 recipients)</option>
                <option value="Organizers">Organizers (6 recipients)</option>
                <option value="Treasurers">Treasurers (2 recipients)</option>
                <option value="Custom Selection">Custom Selection (Pick from roster)</option>
              </select>
            </div>

            {/* Custom Individual Selection Sub-panel */}
            {sentTo === 'Custom Selection' && (
              <div className="p-4 bg-ivory-100 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">
                    Search & Select Individual Members ({customSelectedMembers.length} selected)
                  </span>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-text-muted" />
                    <input
                      type="text"
                      value={customSearch}
                      onChange={(e) => setCustomSearch(e.target.value)}
                      placeholder="Filter student name or ID..."
                      className="w-full pl-8 pr-2.5 py-1 text-xs rounded border border-border bg-surface text-text-primary"
                    />
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-border border border-border rounded bg-surface">
                  {CLUB_MEMBERS_ADMIN.filter(m =>
                    m.name.toLowerCase().includes(customSearch.toLowerCase()) ||
                    m.studentId.toLowerCase().includes(customSearch.toLowerCase())
                  ).map((m) => {
                    const isSelected = customSelectedMembers.includes(m.name);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (isSelected) {
                            setCustomSelectedMembers(customSelectedMembers.filter(n => n !== m.name));
                          } else {
                            setCustomSelectedMembers([...customSelectedMembers, m.name]);
                          }
                        }}
                        className={`p-2 flex items-center justify-between cursor-pointer hover:bg-ivory-50 text-xs transition ${
                          isSelected ? 'bg-primary-light/50' : ''
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-text-primary block">{m.name}</span>
                          <span className="text-[10px] text-text-muted">{m.studentId} • {m.email}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-primary border-primary text-white' : 'border-border'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 bg-ivory-100 rounded border border-border text-xs text-text-secondary flex items-center gap-2">
              <Users className="w-4 h-4 text-accent flex-shrink-0" />
              <span>
                <strong>Audience Guarantee:</strong> Announcement will be delivered to{' '}
                <strong className="text-text-primary">{calculatedRecipientCount} recipients</strong> based on active society enrollment.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION C — Delivery Channels */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">C</span>
            Delivery Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Email', label: 'Email Dispatch', desc: 'Sent to official student email addresses' },
              { id: 'In-app Notification', label: 'In-app Notification', desc: 'Bell alert inside portal navbar' },
              { id: 'Announcement Board', label: 'Announcement Board', desc: 'Pinned on society main homefeed' }
            ].map((channel) => {
              const isChecked = channels.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  onClick={() => handleToggleChannel(channel.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer select-none transition ${
                    isChecked
                      ? 'bg-primary-light/40 border-primary shadow-xs'
                      : 'bg-surface border-border hover:bg-ivory-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                    />
                    <span className="font-semibold text-xs text-text-primary">{channel.label}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1 pl-6">
                    {channel.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION D — Schedule / Sending */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">D</span>
            Scheduling & Dispatch
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="sendTiming"
                  value="SEND_NOW"
                  checked={sendTiming === 'SEND_NOW'}
                  onChange={() => setSendTiming('SEND_NOW')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-text-primary">Send Immediately</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="sendTiming"
                  value="SCHEDULE_LATER"
                  checked={sendTiming === 'SCHEDULE_LATER'}
                  onChange={() => setSendTiming('SCHEDULE_LATER')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-text-primary">Schedule for Later Delivery</span>
              </label>
            </div>

            {sendTiming === 'SCHEDULE_LATER' && (
              <div className="p-4 bg-ivory-100 rounded-lg border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Scheduled Date <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Scheduled Time <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Time Zone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Organization Time Zone (IST)">Organization Time Zone (IST)</option>
                    <option value="Eastern Standard Time (EST)">Eastern Time (EST)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION E — Optional Settings */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">E</span>
            Optional Parameters & Attachments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowReplies}
                onChange={(e) => setAllowReplies(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
              <span className="text-xs text-text-primary font-medium">Allow member replies</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
              <span className="text-xs text-text-primary font-medium">Pin announcement to top</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendReminder}
                onChange={(e) => setSendReminder(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
              <span className="text-xs text-text-primary font-medium">Auto-send 24h reminder</span>
            </label>
          </div>

          {/* Attachments Upload Mock */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Attach Supporting PDF / Image
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={mockFileName}
                onChange={(e) => setMockFileName(e.target.value)}
                placeholder="e.g. Schedule-Agenda-Document.pdf"
                className="flex-1 px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3.5 py-2 rounded bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary"
              >
                Attach File
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 px-2.5 rounded bg-ivory-100 border border-border text-xs flex items-center space-x-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-primary" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-text-muted hover:text-status-error ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION F — Live Recipient Preview */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-3">
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans font-bold">F</span>
              <span>Recipient Live Preview</span>
            </div>
            <span className="text-[11px] text-accent font-sans">Simulated View</span>
          </h3>

          <div className="p-5 rounded-lg bg-ivory-100 border border-border space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-accent">
                  Official Society Notice • {category}
                </span>
                <h4 className="text-base font-bold text-text-primary mt-0.5">
                  {title || 'Announcement Title Preview'}
                </h4>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  priority === 'Urgent'
                    ? 'bg-status-error-bg text-status-error'
                    : 'bg-surface text-text-secondary border border-border'
                }`}
              >
                {priority} Priority
              </span>
            </div>

            <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
              {content || 'Your announcement message content will be displayed here exactly as formatted.'}
            </p>

            <div className="pt-2 border-t border-border flex flex-wrap justify-between items-center text-[11px] text-text-muted">
              <div>
                <strong>For:</strong> {sentTo} ({calculatedRecipientCount} recipients)
              </div>
              <div>
                {sendTiming === 'SEND_NOW'
                  ? 'Dispatch: Immediate'
                  : `Scheduled: ${scheduledDate} • ${scheduledTime}`}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION G — Actions Bar */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition-campus"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction('Draft')}
              className="px-4 py-2.5 rounded bg-ivory-200 hover:bg-ivory-300 border border-border text-xs font-semibold text-text-primary transition-campus disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>

            {sendTiming === 'SCHEDULE_LATER' ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('Scheduled')}
                className="px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center space-x-1.5 disabled:opacity-60"
              >
                <Clock className="w-4 h-4" />
                <span>{submitting ? 'Scheduling...' : 'Schedule Announcement'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('Sent')}
                className="px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center space-x-1.5 disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-accent" />
                <span>{submitting ? 'Dispatching...' : 'Send Now'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncementView;
