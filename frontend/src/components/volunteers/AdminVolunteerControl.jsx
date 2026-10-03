import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  Eye,
  Check,
  X,
  FileCheck,
  Search,
  Filter,
  Calendar,
  Sparkles,
  ShieldCheck,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { volunteerApi, eventsApi, certificateApi } from '../../services/api';

export const AdminVolunteerControl = ({ onNavigateToEvents }) => {
  // Data States
  const [analytics, setAnalytics] = useState({
    total_applications: 0,
    pending_applications: 0,
    approved_volunteers: 0,
    active_volunteers: 0,
    completed_volunteers: 0,
  });
  const [applications, setApplications] = useState([]);
  const [activeVolunteers, setActiveVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Search
  const [requestSearch, setRequestSearch] = useState('');
  const [requestEventFilter, setRequestEventFilter] = useState('ALL');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

  // Modals
  const [selectedAppForView, setSelectedAppForView] = useState(null);
  const [selectedAppForApprove, setSelectedAppForApprove] = useState(null);
  const [selectedAppForReject, setSelectedAppForReject] = useState(null);
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState(null);
  const [certificateGenModalEvent, setCertificateGenModalEvent] = useState(null);

  // Approval Form State
  const [approveForm, setApproveForm] = useState({
    assigned_role: '',
    duration: '4 Hours',
    notes: '',
  });

  // Rejection Form State
  const [rejectNotes, setRejectNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, appsRes, activeRes, eventsRes] = await Promise.all([
        volunteerApi.getAnalytics().catch(() => null),
        volunteerApi.getApplications().catch(() => []),
        volunteerApi.getActive().catch(() => []),
        eventsApi.getAll().catch(() => []),
      ]);

      if (analyticsRes?.analytics) {
        setAnalytics(analyticsRes.analytics);
      } else {
        // Compute from lists if analytics endpoint unavailable
        const appList = Array.isArray(appsRes) ? appsRes : appsRes?.results || [];
        const actList = Array.isArray(activeRes) ? activeRes : activeRes?.results || [];
        setAnalytics({
          total_applications: appList.length,
          pending_applications: appList.filter(a => a.status === 'Pending').length,
          approved_volunteers: appList.filter(a => a.status === 'Approved').length,
          active_volunteers: actList.filter(v => v.status === 'Active').length,
          completed_volunteers: actList.filter(v => v.status === 'Completed').length,
        });
      }

      setApplications(Array.isArray(appsRes) ? appsRes : appsRes?.results || []);
      setActiveVolunteers(Array.isArray(activeRes) ? activeRes : activeRes?.results || []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : eventsRes?.results || []);
    } catch (err) {
      console.error('Failed to load volunteer data:', err);
      setError('Could not connect to volunteer services. Showing local cached state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // =========================================================================
  // APPROVE WORKFLOW
  // =========================================================================
  const openApproveModal = (app) => {
    setSelectedAppForApprove(app);
    setApproveForm({
      assigned_role: app.preferred_role || 'Registration Desk',
      duration: '4 Hours',
      notes: `Approved for ${app.event_details?.title || 'event'} volunteer team.`,
    });
  };

  const handleConfirmApproval = async (e) => {
    e.preventDefault();
    if (!selectedAppForApprove) return;

    try {
      await volunteerApi.approve(selectedAppForApprove.id, approveForm);
      triggerSuccess(`Approved ${selectedAppForApprove.student_details?.full_name || 'Student'} as "${approveForm.assigned_role}". Active assignment created.`);
      setSelectedAppForApprove(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.details || 'Error approving application.');
    }
  };

  // =========================================================================
  // REJECT WORKFLOW
  // =========================================================================
  const openRejectModal = (app) => {
    setSelectedAppForReject(app);
    setRejectNotes('');
  };

  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!selectedAppForReject) return;

    try {
      await volunteerApi.reject(selectedAppForReject.id, { admin_notes: rejectNotes });
      triggerSuccess(`Application for ${selectedAppForReject.student_details?.full_name || 'Student'} marked Rejected.`);
      setSelectedAppForReject(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.details || 'Error rejecting application.');
    }
  };

  // =========================================================================
  // ACTIVE VOLUNTEER ACTIONS
  // =========================================================================
  const handleMarkCompleted = async (assignment) => {
    try {
      await volunteerApi.completeAssignment(assignment.id);
      triggerSuccess(`Assignment for ${assignment.student_details?.full_name || 'Volunteer'} marked Completed.`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.details || 'Failed to complete assignment.');
    }
  };

  const handleRemoveAssignment = async (assignment) => {
    if (!window.confirm(`Are you sure you want to remove ${assignment.student_details?.full_name || 'this volunteer'}'s assignment?`)) {
      return;
    }
    try {
      await volunteerApi.deleteAssignment(assignment.id);
      triggerSuccess('Volunteer assignment removed.');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.details || 'Failed to remove assignment.');
    }
  };

  // =========================================================================
  // CERTIFICATE GENERATION WORKFLOW
  // =========================================================================
  const handleGenerateCertificateForEvent = async (eventObj) => {
    try {
      const res = await certificateApi.generate({ event_id: eventObj.id });
      triggerSuccess(res.message || `Certificates generated for event "${eventObj.title}".`);
      setCertificateGenModalEvent(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.details || 'Failed to generate certificates. Ensure there are active volunteers.');
    }
  };

  // Filtered pending requests
  const pendingRequests = applications.filter((app) => {
    const isPending = app.status === 'Pending';
    const matchesSearch =
      (app.student_details?.full_name || '').toLowerCase().includes(requestSearch.toLowerCase()) ||
      (app.student_details?.student_id || '').toLowerCase().includes(requestSearch.toLowerCase()) ||
      (app.student_details?.email || '').toLowerCase().includes(requestSearch.toLowerCase()) ||
      (app.event_details?.title || '').toLowerCase().includes(requestSearch.toLowerCase());
    const matchesEvent = requestEventFilter === 'ALL' || String(app.event) === String(requestEventFilter);
    return isPending && matchesSearch && matchesEvent;
  });

  // Filtered active volunteers
  const filteredActiveVolunteers = activeVolunteers.filter((item) => {
    const matchesSearch =
      (item.student_details?.full_name || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
      (item.student_details?.student_id || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
      (item.student_details?.email || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
      (item.event_details?.title || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
      (item.assigned_role || '').toLowerCase().includes(activeSearch.toLowerCase());
    const matchesStatus = activeStatusFilter === 'ALL' || item.status === activeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Volunteer Management Control
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Live Registry
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Review volunteer applications, assign roles, monitor active assignments, and issue verified completion certificates.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-canvas text-xs font-semibold text-text-primary transition"
            title="Refresh Registry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-text-muted ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setCertificateGenModalEvent(events[0] || null)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Generate Certificates</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="font-semibold text-sm">{successMessage}</div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: VOLUNTEER ANALYTICS CARDS                                  */}
      {/* ===================================================================== */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <span>Section 3: Volunteer Analytics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Applications */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between hover:border-primary/40 transition">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-text-secondary uppercase">Total Applications</span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-2">
              {analytics.total_applications}
            </p>
            <span className="text-[10px] text-text-muted mt-1">Across all events</span>
          </div>

          {/* Card 2: Pending Applications */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between hover:border-status-warning/50 transition">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-text-secondary uppercase">Pending Applications</span>
              <div className="w-7 h-7 rounded-lg bg-status-warning-bg flex items-center justify-center text-status-warning">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-status-warning mt-2">
              {analytics.pending_applications}
            </p>
            <span className="text-[10px] text-text-muted mt-1">Requires review</span>
          </div>

          {/* Card 3: Approved Volunteers */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between hover:border-status-success/50 transition">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-text-secondary uppercase">Approved Volunteers</span>
              <div className="w-7 h-7 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-status-success mt-2">
              {analytics.approved_volunteers}
            </p>
            <span className="text-[10px] text-text-muted mt-1">Accepted candidates</span>
          </div>

          {/* Card 4: Active Volunteers */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between hover:border-primary/40 transition">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-text-secondary uppercase">Active Volunteers</span>
              <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] flex items-center justify-center text-[#1557B0]">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1557B0] mt-2">
              {analytics.active_volunteers}
            </p>
            <span className="text-[10px] text-text-muted mt-1">Currently serving</span>
          </div>

          {/* Card 5: Completed Volunteers */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between hover:border-accent/40 transition">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-text-secondary uppercase">Completed Volunteers</span>
              <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center text-accent">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-2">
              {analytics.completed_volunteers}
            </p>
            <span className="text-[10px] text-text-muted mt-1">Certificate eligible</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: VOLUNTEER REQUESTS (PENDING APPLICATIONS)                  */}
      {/* ===================================================================== */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-status-warning-bg text-status-warning text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h2 className="text-lg font-bold text-text-primary">
                Volunteer Requests
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-status-warning-bg text-status-warning">
                {pendingRequests.length} Pending
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Review student submissions, assign specific responsibilities, duration, and admit them into active teams.
            </p>
          </div>

          {/* Search & Event Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search student or role..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={requestEventFilter}
              onChange={(e) => setRequestEventFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Events</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas/70 border-b border-border text-text-secondary font-semibold">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Preferred Role</th>
                <th className="py-2.5 px-3">Applied Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-text-muted text-xs">
                    No pending volunteer requests found matching your filter.
                  </td>
                </tr>
              ) : (
                pendingRequests.map((app) => (
                  <tr key={app.id} className="hover:bg-canvas/40 transition">
                    <td className="py-3 px-3 font-bold text-text-primary">
                      {app.student_details?.full_name || 'Member'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
                      {app.student_details?.student_id || '—'}
                    </td>
                    <td className="py-3 px-3 text-text-muted">
                      {app.student_details?.email}
                    </td>
                    <td className="py-3 px-3 font-semibold text-text-primary max-w-xs truncate">
                      {app.event_details?.title || `Event #${app.event}`}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]">
                        {app.preferred_role || 'General Volunteer'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-text-muted whitespace-nowrap">
                      {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-warning-bg text-status-warning">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForView(app)}
                          className="px-2 py-1 rounded bg-ivory-200 hover:bg-ivory-300 border border-border text-[11px] font-semibold text-text-primary transition"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openApproveModal(app)}
                          className="px-2.5 py-1 rounded bg-status-success text-white hover:bg-emerald-600 text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectModal(app)}
                          className="px-2.5 py-1 rounded bg-status-error/10 hover:bg-status-error/20 text-status-error border border-status-error/30 text-[11px] font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: ACTIVE VOLUNTEERS                                          */}
      {/* ===================================================================== */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h2 className="text-lg font-bold text-text-primary">
                Active Volunteers
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF3FC] text-[#1557B0]">
                {filteredActiveVolunteers.length} Active / Completed
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Live deployment of approved student volunteers. Complete their service to authorize official credential generation.
            </p>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search active volunteer..."
                value={activeSearch}
                onChange={(e) => setActiveSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Active Volunteers Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas/70 border-b border-border text-text-secondary font-semibold">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Event Name</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Approval Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredActiveVolunteers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-text-muted text-xs">
                    No active volunteers found. Approve pending applications to deploy volunteers.
                  </td>
                </tr>
              ) : (
                filteredActiveVolunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-canvas/40 transition">
                    <td className="py-3 px-3 font-bold text-text-primary">
                      {vol.student_details?.full_name || 'Member'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
                      {vol.student_details?.student_id || '—'}
                    </td>
                    <td className="py-3 px-3 text-text-muted">
                      {vol.student_details?.email}
                    </td>
                    <td className="py-3 px-3 font-semibold text-text-primary max-w-xs truncate">
                      {vol.event_details?.title || `Event #${vol.event}`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary">
                      {vol.assigned_role}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
                      {vol.duration}
                    </td>
                    <td className="py-3 px-3 text-text-muted whitespace-nowrap">
                      {new Date(vol.approved_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        vol.status === 'Completed'
                          ? 'bg-status-success-bg text-status-success'
                          : 'bg-[#EBF3FC] text-[#1557B0]'
                      }`}>
                        {vol.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAssignmentForView(vol)}
                          className="px-2 py-1 rounded bg-ivory-200 hover:bg-ivory-300 border border-border text-[11px] font-semibold text-text-primary transition"
                          title="View Details"
                        >
                          View Details
                        </button>

                        {vol.status === 'Active' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkCompleted(vol)}
                            className="px-2.5 py-1 rounded bg-status-success text-white hover:bg-emerald-600 text-[11px] font-semibold transition shadow-xs"
                            title="Mark as Completed"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateCertificateForEvent(vol.event_details || { id: vol.event, title: 'Event' })}
                            className="px-2.5 py-1 rounded bg-primary text-white hover:bg-primary-hover text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
                            title="Generate Official Certificate"
                          >
                            <Award className="w-3 h-3" /> Certificate
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(vol)}
                          className="px-2 py-1 rounded bg-status-error/10 hover:bg-status-error/20 text-status-error border border-status-error/30 text-[11px] font-semibold transition"
                          title="Remove Assignment"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: APPROVE VOLUNTEER WORKFLOW                                     */}
      {/* ===================================================================== */}
      {selectedAppForApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedAppForApprove(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-status-success" />
                <h3 className="text-lg font-bold text-text-primary">
                  Approve Volunteer Application
                </h3>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Assign a confirmed role, expected service duration, and advisory notes. An Active Volunteer record will automatically be generated.
              </p>
            </div>

            {/* Applicant Summary Card */}
            <div className="p-3.5 rounded-xl border border-border bg-canvas/40 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Student:</span>
                <span className="font-bold text-text-primary">
                  {selectedAppForApprove.student_details?.full_name} ({selectedAppForApprove.student_details?.student_id})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Event:</span>
                <span className="font-semibold text-text-primary">
                  {selectedAppForApprove.event_details?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Preferred Role:</span>
                <span className="font-semibold text-primary">
                  {selectedAppForApprove.preferred_role}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Final Volunteer Role <span className="text-status-error">*</span>
                </label>
                <select
                  value={approveForm.assigned_role}
                  onChange={(e) => setApproveForm({ ...approveForm, assigned_role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="Registration Desk">Registration Desk</option>
                  <option value="Photography Team">Photography Team</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Stage Management">Stage Management</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                  <option value="Crowd Management">Crowd Management</option>
                  <option value="Logistics Support">Logistics Support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Volunteer Duration <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={approveForm.duration}
                  onChange={(e) => setApproveForm({ ...approveForm, duration: e.target.value })}
                  placeholder="e.g. 4 Hours, Full Day, 6 Hours"
                  required
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Notes / Orientation Instructions
                </label>
                <textarea
                  rows="3"
                  value={approveForm.notes}
                  onChange={(e) => setApproveForm({ ...approveForm, notes: e.target.value })}
                  placeholder="Instructions for reporting time, attire, team lead contact..."
                  className="w-full p-2.5 rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForApprove(null)}
                  className="px-3.5 py-2 rounded border border-border bg-surface text-text-secondary hover:bg-canvas font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-status-success hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Confirm & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: VIEW APPLICATION DETAILS                                       */}
      {/* ===================================================================== */}
      {selectedAppForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative text-xs">
            <button
              onClick={() => setSelectedAppForView(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                Application Detail #{selectedAppForView.id}
              </span>
              <h3 className="text-base font-bold text-text-primary mt-1">
                {selectedAppForView.student_details?.full_name}
              </h3>
              <p className="text-text-muted text-[11px]">
                {selectedAppForView.student_details?.email} • ID: {selectedAppForView.student_details?.student_id}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <span className="font-semibold text-text-secondary block">Applied Event:</span>
                <span className="text-text-primary font-bold">{selectedAppForView.event_details?.title}</span>
              </div>
              <div>
                <span className="font-semibold text-text-secondary block">Preferred Role:</span>
                <span className="text-primary font-semibold">{selectedAppForView.preferred_role}</span>
              </div>
              <div>
                <span className="font-semibold text-text-secondary block">Statement of Motivation:</span>
                <p className="p-2.5 rounded bg-canvas/60 text-text-primary mt-1 border border-border leading-relaxed whitespace-pre-wrap">
                  {selectedAppForView.reason || 'No statement provided.'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-text-secondary block">Previous Experience:</span>
                <p className="p-2.5 rounded bg-canvas/60 text-text-primary mt-1 border border-border leading-relaxed whitespace-pre-wrap">
                  {selectedAppForView.experience || 'No previous experience noted.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedAppForView(null)}
                className="px-3 py-1.5 rounded border border-border bg-surface text-text-primary font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: REJECT APPLICATION                                             */}
      {/* ===================================================================== */}
      {selectedAppForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative text-xs">
            <button
              onClick={() => setSelectedAppForReject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5 text-status-error">
                <XCircle className="w-5 h-5" /> Reject Volunteer Application
              </h3>
              <p className="text-text-secondary mt-1">
                Reject candidate {selectedAppForReject.student_details?.full_name} for "{selectedAppForReject.event_details?.title}".
              </p>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Reason / Feedback (Optional)
                </label>
                <textarea
                  rows="3"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="e.g. Volunteer role quotas filled. Thank you for your interest."
                  className="w-full p-2.5 rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForReject(null)}
                  className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-status-error hover:bg-red-600 text-white font-semibold shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: VIEW ACTIVE ASSIGNMENT DETAILS                                 */}
      {/* ===================================================================== */}
      {selectedAssignmentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative text-xs">
            <button
              onClick={() => setSelectedAssignmentForView(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedAssignmentForView.status === 'Completed'
                  ? 'bg-status-success-bg text-status-success'
                  : 'bg-[#EBF3FC] text-[#1557B0]'
              }`}>
                Assignment #{selectedAssignmentForView.id} • {selectedAssignmentForView.status}
              </span>
              <h3 className="text-base font-bold text-text-primary mt-1">
                {selectedAssignmentForView.student_details?.full_name}
              </h3>
              <p className="text-text-muted text-[11px]">
                {selectedAssignmentForView.student_details?.email} • ID: {selectedAssignmentForView.student_details?.student_id}
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border">
              <div className="flex justify-between">
                <span className="text-text-muted">Event:</span>
                <span className="font-semibold text-text-primary">{selectedAssignmentForView.event_details?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Assigned Role:</span>
                <span className="font-bold text-primary">{selectedAssignmentForView.assigned_role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Committed Duration:</span>
                <span className="font-mono text-text-primary">{selectedAssignmentForView.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Approval Date:</span>
                <span className="text-text-primary">
                  {new Date(selectedAssignmentForView.approved_at).toLocaleString()}
                </span>
              </div>
              {selectedAssignmentForView.notes && (
                <div>
                  <span className="text-text-muted block">Notes / Special Instructions:</span>
                  <p className="p-2 rounded bg-canvas border border-border mt-0.5 text-text-secondary">
                    {selectedAssignmentForView.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedAssignmentForView(null)}
                className="px-3 py-1.5 rounded border border-border bg-surface text-text-primary font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: GENERATE CERTIFICATE FOR EVENT                                 */}
      {/* ===================================================================== */}
      {certificateGenModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative text-xs">
            <button
              onClick={() => setCertificateGenModalEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-primary">
                <Award className="w-5 h-5" />
                <h3 className="text-base font-bold text-text-primary">
                  Generate Volunteer Certificates
                </h3>
              </div>
              <p className="text-text-secondary mt-1">
                Select an event to batch generate cryptographically verified certificates for all approved volunteers.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Select Completed / Concluded Event:
                </label>
                <select
                  value={certificateGenModalEvent.id}
                  onChange={(e) => {
                    const evt = events.find(x => String(x.id) === String(e.target.value));
                    if (evt) setCertificateGenModalEvent(evt);
                  }}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-text-secondary space-y-1">
                <p className="font-semibold text-primary">Credential Safeguards:</p>
                <p>• Automatically marks the event status as <strong>Completed</strong>.</p>
                <p>• Assigns a unique verification credential ID (e.g. <code>SKY-2026-XXXX</code>).</p>
                <p>• Immediately publishes the certificate to the student's personal Certificates tab.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCertificateGenModalEvent(null)}
                className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGenerateCertificateForEvent(certificateGenModalEvent)}
                className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Award className="w-4 h-4" /> Issue Official Certificates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
