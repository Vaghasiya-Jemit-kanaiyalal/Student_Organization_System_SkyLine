import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_MEMBERS_DATA } from '../../data/membersData';
import {
  Users,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Award,
  HeartHandshake,
  Download,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  FileText,
  UserCheck,
  CreditCard,
  History,
  RotateCw,
  ArrowRight
} from 'lucide-react';

export const MemberManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'all'; // 'all' | 'renewals'

  // Master Members State
  const [members, setMembers] = useState(INITIAL_MEMBERS_DATA);

  // Active Sub-Page: 'all' | 'renewals'
  const [activeSubPage, setActiveSubPage] = useState(activeTabParam);

  // Search & Filter State - All Members
  const [allSearchTerm, setAllSearchTerm] = useState('');
  const [allTypeFilter, setAllTypeFilter] = useState('ALL'); // 'ALL' | 'Annual' | 'Semester'
  const [allStatusFilter, setAllStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Expired'

  // Search & Filter State - Renewals
  const [renewalSearchTerm, setRenewalSearchTerm] = useState('');
  const [renewalTypeFilter, setRenewalTypeFilter] = useState('ALL'); // 'ALL' | 'Annual' | 'Semester'

  // Modals & Drawers State
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [renewingMember, setRenewingMember] = useState(null);
  const [renewalHistoryMember, setRenewalHistoryMember] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Switch Sub-Page Tab
  const handleTabChange = (tab) => {
    setActiveSubPage(tab);
    setSearchParams({ tab });
  };

  // Helper to determine renewal status for Renewals table
  // Active, Expiring Soon (within 30 days of 2026-10-03), or Expired
  const getRenewalStatus = (expiryDateStr) => {
    const today = new Date('2026-10-03').getTime();
    const expiry = new Date(expiryDateStr).getTime();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays <= 30) return 'Expiring Soon';
    return 'Active';
  };

  // Statistics for "ALL MEMBERS" page
  const allMembersStats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.membershipStatus === 'Active').length;
    const expired = members.filter((m) => m.membershipStatus === 'Expired').length;
    const annual = members.filter((m) => m.membershipType === 'Annual').length;
    const semester = members.filter((m) => m.membershipType === 'Semester').length;
    return { total, active, expired, annual, semester };
  }, [members]);

  // Statistics for "RENEWALS" page
  const renewalsStats = useMemo(() => {
    const totalRenewals = members.reduce((sum, m) => sum + (m.totalRenewals || 0), 0);
    const dueForRenewal = members.filter((m) => {
      const status = getRenewalStatus(m.expiryDate);
      return status === 'Expiring Soon';
    }).length;
    const expired = members.filter((m) => getRenewalStatus(m.expiryDate) === 'Expired').length;
    // Renewed this semester (renewed in 2026)
    const renewedThisSemester = members.filter((m) => m.lastRenewalDate && m.lastRenewalDate.startsWith('2026')).length;

    return { totalRenewals, dueForRenewal, expired, renewedThisSemester };
  }, [members]);

  // Filtered list for "ALL MEMBERS"
  const filteredAllMembers = useMemo(() => {
    return members.filter((m) => {
      const query = allSearchTerm.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(query) ||
        m.studentId.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query);

      const matchesType = allTypeFilter === 'ALL' || m.membershipType === allTypeFilter;
      const matchesStatus = allStatusFilter === 'ALL' || m.membershipStatus === allStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [members, allSearchTerm, allTypeFilter, allStatusFilter]);

  // Filtered list for "RENEWALS"
  const filteredRenewals = useMemo(() => {
    return members.filter((m) => {
      const query = renewalSearchTerm.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(query) ||
        m.studentId.toLowerCase().includes(query);

      const matchesType = renewalTypeFilter === 'ALL' || m.membershipType === renewalTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [members, renewalSearchTerm, renewalTypeFilter]);

  // Action: Renew Membership
  const handleConfirmRenew = (memberId, extensionMonths = 12) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const currentExpiry = new Date(m.expiryDate > '2026-10-03' ? m.expiryDate : '2026-10-03');
          currentExpiry.setMonth(currentExpiry.getMonth() + extensionMonths);
          const newExpiryStr = currentExpiry.toISOString().split('T')[0];
          const todayStr = '2026-10-03';

          const newHistoryItem = {
            id: `REN-${Date.now().toString().slice(-4)}`,
            renewalDate: todayStr,
            plan: m.membershipType === 'Annual' ? 'Annual Membership' : 'Semester Membership',
            amount: m.membershipType === 'Annual' ? 45.00 : 25.00,
            receipt: `REC-${Date.now().toString().slice(-4)}.pdf`,
            approvedBy: 'Club Administrator'
          };

          return {
            ...m,
            membershipStatus: 'Active',
            expiryDate: newExpiryStr,
            totalRenewals: (m.totalRenewals || 0) + 1,
            lastRenewalDate: todayStr,
            renewalHistory: [newHistoryItem, ...(m.renewalHistory || [])]
          };
        }
        return m;
      })
    );

    setRenewingMember(null);
    showToast('Membership renewed successfully! Term extended.');
  };

  // Action: Suspend Membership
  const handleToggleSuspend = (memberId) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const isCurrentlyActive = m.membershipStatus === 'Active';
          const nextStatus = isCurrentlyActive ? 'Expired' : 'Active';
          showToast(`Member ${m.name} status updated to ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
          return { ...m, membershipStatus: nextStatus };
        }
        return m;
      })
    );
  };

  // Action: Save Edit Member
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? editingMember : m))
    );

    if (selectedMemberDetails?.id === editingMember.id) {
      setSelectedMemberDetails(editingMember);
    }

    setEditingMember(null);
    showToast(`Updated details for ${editingMember.name}!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const list = activeSubPage === 'all' ? filteredAllMembers : filteredRenewals;
    const headers = ['Student Name,Student ID,University Email,Phone,Membership Type,Status,Join Date,Expiry Date,Total Renewals'];
    const rows = list.map(
      (m) =>
        `"${m.name}","${m.studentId}","${m.email}","${m.phone}","${m.membershipType}","${m.membershipStatus}","${m.joinDate}","${m.expiryDate}",${m.totalRenewals || 0}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `connectu_${activeSubPage}_export_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${list.length} records to CSV.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-lg shadow-lg text-xs font-medium border transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* 1. Module Header */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif-academic">
                  Member Management
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Administrative control for viewing student memberships, tracking terms, and managing renewals.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export {activeSubPage === 'all' ? 'Members' : 'Renewals'}</span>
            </button>
          </div>
        </div>

        {/* 2. Sub-Page Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs flex items-center space-x-2">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition ${
              activeSubPage === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. ALL MEMBERS</span>
            <span
              className={`ml-1.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubPage === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allMembersStats.total}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('renewals')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition ${
              activeSubPage === 'renewals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>2. RENEWALS</span>
            <span
              className={`ml-1.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubPage === 'renewals' ? 'bg-blue-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {renewalsStats.dueForRenewal} Due
            </span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* SUB-PAGE 1: ALL MEMBERS PAGE                               */}
        {/* ========================================================== */}
        {activeSubPage === 'all' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Statistics Cards - All Members */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Members</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-serif-academic">{allMembersStats.total}</p>
                <span className="text-[11px] text-blue-600 font-medium">100% Student Roster</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Members</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1 font-serif-academic">{allMembersStats.active}</p>
                <span className="text-[11px] text-emerald-600 font-medium">Good Standing</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expired Members</p>
                <p className="text-2xl font-bold text-rose-600 mt-1 font-serif-academic">{allMembersStats.expired}</p>
                <span className="text-[11px] text-rose-600 font-medium">Lapsed Dues</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Annual Memberships</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-serif-academic">{allMembersStats.annual}</p>
                <span className="text-[11px] text-slate-500 font-medium">Full Collegiate Term</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Semester Memberships</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-serif-academic">{allMembersStats.semester}</p>
                <span className="text-[11px] text-slate-500 font-medium">Single Semester Term</span>
              </div>
            </div>

            {/* Search & Filters Card - All Members */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Inputs */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={allSearchTerm}
                    onChange={(e) => setAllSearchTerm(e.target.value)}
                    placeholder="Search by Student Name, Student ID, or University Email..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  {allSearchTerm && (
                    <button
                      onClick={() => setAllSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </div>

                  {/* Filter by Membership Type */}
                  <select
                    value={allTypeFilter}
                    onChange={(e) => setAllTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="ALL">All Membership Types</option>
                    <option value="Annual">Annual</option>
                    <option value="Semester">Semester</option>
                  </select>

                  {/* Filter by Status */}
                  <select
                    value={allStatusFilter}
                    onChange={(e) => setAllStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active Only (Green)</option>
                    <option value="Expired">Expired Only (Red)</option>
                  </select>

                  {(allSearchTerm || allTypeFilter !== 'ALL' || allStatusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setAllSearchTerm('');
                        setAllTypeFilter('ALL');
                        setAllStatusFilter('ALL');
                      }}
                      className="text-xs text-blue-600 hover:underline px-2 py-1 font-semibold"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Member Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200/90">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3.5">Student Name</th>
                      <th className="py-3 px-3.5">Student ID</th>
                      <th className="py-3 px-3.5">University Email</th>
                      <th className="py-3 px-3.5">Membership Type</th>
                      <th className="py-3 px-3.5">Membership Status</th>
                      <th className="py-3 px-3.5">Join Date</th>
                      <th className="py-3 px-3.5">Expiry Date</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAllMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No registered members found matching the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAllMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-blue-50/20 transition-colors group">
                          {/* Student Name */}
                          <td className="py-3.5 px-3.5">
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                              {member.name}
                            </span>
                          </td>

                          {/* Student ID */}
                          <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-600 font-medium">
                            {member.studentId}
                          </td>

                          {/* University Email */}
                          <td className="py-3.5 px-3.5 text-slate-600">
                            {member.email}
                          </td>

                          {/* Membership Type (Annual / Semester) */}
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                member.membershipType === 'Annual'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {member.membershipType}
                            </span>
                          </td>

                          {/* Membership Status (Active Green / Expired Red) */}
                          <td className="py-3.5 px-3.5">
                            {member.membershipStatus === 'Active' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                                Expired
                              </span>
                            )}
                          </td>

                          {/* Join Date */}
                          <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500">
                            {member.joinDate}
                          </td>

                          {/* Expiry Date */}
                          <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500">
                            {member.expiryDate}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedMemberDetails(member)}
                                className="px-2 py-1 text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold transition"
                                title="View Member Details Modal"
                              >
                                View Details
                              </button>

                              {/* Edit Member */}
                              <button
                                onClick={() => setEditingMember(member)}
                                className="px-2 py-1 text-slate-700 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-slate-200 rounded text-[11px] font-semibold transition"
                                title="Edit Member Information"
                              >
                                Edit
                              </button>

                              {/* Renew Membership */}
                              <button
                                onClick={() => setRenewingMember(member)}
                                className="px-2 py-1 text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold transition"
                                title="Renew Membership"
                              >
                                Renew
                              </button>

                              {/* Suspend Membership */}
                              <button
                                onClick={() => handleToggleSuspend(member.id)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                                  member.membershipStatus === 'Active'
                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                }`}
                                title={member.membershipStatus === 'Active' ? 'Suspend Membership' : 'Activate Membership'}
                              >
                                {member.membershipStatus === 'Active' ? 'Suspend' : 'Reactivate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                <span>Showing {filteredAllMembers.length} of {members.length} student records</span>
                <span>Odoo-Inspired Clean SaaS View</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-PAGE 2: RENEWALS PAGE                                  */}
        {/* ========================================================== */}
        {activeSubPage === 'renewals' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Statistics Cards - Renewals */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Renewals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-serif-academic">{renewalsStats.totalRenewals}</p>
                <span className="text-[11px] text-blue-600 font-medium">Cumulative Historical Renewals</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due for Renewal</p>
                <p className="text-2xl font-bold text-amber-600 mt-1 font-serif-academic">{renewalsStats.dueForRenewal}</p>
                <span className="text-[11px] text-amber-600 font-medium">Expiring within 30 days</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expired Memberships</p>
                <p className="text-2xl font-bold text-rose-600 mt-1 font-serif-academic">{renewalsStats.expired}</p>
                <span className="text-[11px] text-rose-600 font-medium">Lapsed & Awaiting Renewal</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Renewed This Semester</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1 font-serif-academic">{renewalsStats.renewedThisSemester}</p>
                <span className="text-[11px] text-emerald-600 font-medium">Academic Term 2026</span>
              </div>
            </div>

            {/* Search & Filters Card - Renewals */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Inputs */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={renewalSearchTerm}
                    onChange={(e) => setRenewalSearchTerm(e.target.value)}
                    placeholder="Search by Student Name or Student ID..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  {renewalSearchTerm && (
                    <button
                      onClick={() => setRenewalSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter by Membership Type */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Type:</span>
                  <select
                    value={renewalTypeFilter}
                    onChange={(e) => setRenewalTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="ALL">All Membership Types</option>
                    <option value="Annual">Annual</option>
                    <option value="Semester">Semester</option>
                  </select>

                  {(renewalSearchTerm || renewalTypeFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setRenewalSearchTerm('');
                        setRenewalTypeFilter('ALL');
                      }}
                      className="text-xs text-blue-600 hover:underline px-2 py-1 font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Renewals Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200/90">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3.5">Student Name</th>
                      <th className="py-3 px-3.5">Student ID</th>
                      <th className="py-3 px-3.5">Membership Type</th>
                      <th className="py-3 px-3.5">Renewal Count</th>
                      <th className="py-3 px-3.5">Current Status</th>
                      <th className="py-3 px-3.5">Last Renewal Date</th>
                      <th className="py-3 px-3.5">Expiry Date</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRenewals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No renewal records matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredRenewals.map((member) => {
                        const renewalStatus = getRenewalStatus(member.expiryDate);

                        return (
                          <tr key={member.id} className="hover:bg-blue-50/20 transition-colors group">
                            {/* Student Name */}
                            <td className="py-3.5 px-3.5 font-semibold text-slate-900 group-hover:text-blue-600 transition">
                              {member.name}
                            </td>

                            {/* Student ID */}
                            <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-600 font-medium">
                              {member.studentId}
                            </td>

                            {/* Membership Type */}
                            <td className="py-3.5 px-3.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  member.membershipType === 'Annual'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {member.membershipType}
                              </span>
                            </td>

                            {/* Renewal Count */}
                            <td className="py-3.5 px-3.5 font-mono font-bold text-slate-800">
                              {member.totalRenewals} {member.totalRenewals === 1 ? 'time' : 'times'}
                            </td>

                            {/* Current Status (Active, Expiring Soon, Expired) */}
                            <td className="py-3.5 px-3.5">
                              {renewalStatus === 'Active' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                  Active
                                </span>
                              )}
                              {renewalStatus === 'Expiring Soon' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                                  Expiring Soon
                                </span>
                              )}
                              {renewalStatus === 'Expired' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                                  Expired
                                </span>
                              )}
                            </td>

                            {/* Last Renewal Date */}
                            <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500">
                              {member.lastRenewalDate || 'Initial Term'}
                            </td>

                            {/* Expiry Date */}
                            <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500">
                              {member.expiryDate}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3.5 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Renew Membership */}
                                <button
                                  onClick={() => setRenewingMember(member)}
                                  className="px-2.5 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded text-[11px] font-semibold shadow-2xs transition"
                                >
                                  Renew Membership
                                </button>

                                {/* View Renewal History */}
                                <button
                                  onClick={() => setRenewalHistoryMember(member)}
                                  className="px-2.5 py-1 text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold transition"
                                >
                                  View Renewal History
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                <span>Showing {filteredRenewals.length} renewals records</span>
                <span>Automated Term Tracker</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================== */}
      {/* MODAL 1: MEMBER DETAILS MODAL                              */}
      {/* ========================================================== */}
      {selectedMemberDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-xl font-bold text-slate-900 font-serif-academic">
                    {selectedMemberDetails.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedMemberDetails.membershipStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedMemberDetails.membershipStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Student ID: {selectedMemberDetails.studentId} • {selectedMemberDetails.email}
                </p>
              </div>

              <button
                onClick={() => setSelectedMemberDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Complete Details Required */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">

              {/* Core Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedMemberDetails.name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Student ID</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedMemberDetails.studentId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">University Email</span>
                  <p className="font-semibold text-slate-900 mt-0.5 truncate">{selectedMemberDetails.email}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedMemberDetails.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Membership Type</span>
                  <p className="font-semibold text-blue-700 mt-0.5">{selectedMemberDetails.membershipType}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Membership Status</span>
                  <p className="font-semibold text-emerald-700 mt-0.5">{selectedMemberDetails.membershipStatus}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Join Date</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedMemberDetails.joinDate}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Expiry Date</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedMemberDetails.expiryDate}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Renewals</span>
                  <p className="font-bold text-blue-700 mt-0.5">{selectedMemberDetails.totalRenewals || 0} Times</p>
                </div>
              </div>

              {/* Event Participation History */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Event Participation History ({selectedMemberDetails.eventHistory?.length || 0})</span>
                </div>
                {!selectedMemberDetails.eventHistory || selectedMemberDetails.eventHistory.length === 0 ? (
                  <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-lg border border-slate-200/60">
                    No event attendance recorded yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                    {selectedMemberDetails.eventHistory.map((evt) => (
                      <div key={evt.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">{evt.name}</p>
                          <p className="text-[11px] text-slate-500">{evt.date} • {evt.role}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {evt.checkIn}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Volunteer Participation History */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>Volunteer Participation History ({selectedMemberDetails.volunteerHistory?.length || 0})</span>
                </div>
                {!selectedMemberDetails.volunteerHistory || selectedMemberDetails.volunteerHistory.length === 0 ? (
                  <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-lg border border-slate-200/60">
                    No volunteer service records logged.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                    {selectedMemberDetails.volunteerHistory.map((vol) => (
                      <div key={vol.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">{vol.project}</p>
                          <p className="text-[11px] text-slate-500">Supervisor: {vol.supervisor} • Date: {vol.date}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          +{vol.hours} Hours ({vol.status})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates Earned */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Certificates Earned ({selectedMemberDetails.certificates?.length || 0})</span>
                </div>
                {!selectedMemberDetails.certificates || selectedMemberDetails.certificates.length === 0 ? (
                  <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-lg border border-slate-200/60">
                    No certificates earned yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                    {selectedMemberDetails.certificates.map((cert) => (
                      <div key={cert.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">{cert.title}</p>
                          <p className="text-[10px] font-mono text-slate-400">
                            Hash: {cert.credentialHash} • Issued: {cert.date} by {cert.issuedBy}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetails(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: EDIT MEMBER MODAL                                 */}
      {/* ========================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-serif-academic">
                Edit Member: {editingMember.name}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    value={editingMember.studentId}
                    onChange={(e) => setEditingMember({ ...editingMember, studentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Membership Type</label>
                  <select
                    value={editingMember.membershipType}
                    onChange={(e) => setEditingMember({ ...editingMember, membershipType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Semester">Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Membership Status</label>
                <select
                  value={editingMember.membershipStatus}
                  onChange={(e) => setEditingMember({ ...editingMember, membershipStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Active">Active (Green)</option>
                  <option value="Expired">Expired (Red)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: RENEW MEMBERSHIP CONFIRMATION MODAL               */}
      {/* ========================================================== */}
      {renewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="p-2.5 bg-blue-50 rounded-full">
                <RotateCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif-academic">
                Renew Membership
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are renewing the membership for <strong>{renewingMember.name}</strong> ({renewingMember.studentId}).
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
              <p>Current Type: <strong>{renewingMember.membershipType}</strong></p>
              <p>Current Expiry: <span className="font-mono text-slate-500">{renewingMember.expiryDate}</span></p>
              <p>Renewal Cost: <strong>${renewingMember.membershipType === 'Annual' ? '45.00' : '25.00'}</strong></p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRenewingMember(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRenew(renewingMember.id, renewingMember.membershipType === 'Annual' ? 12 : 6)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                Confirm & Extend Term
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: VIEW RENEWAL HISTORY MODAL                        */}
      {/* ========================================================== */}
      {renewalHistoryMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="max-w-xl w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif-academic">
                  Renewal History: {renewalHistoryMember.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Student ID: {renewalHistoryMember.studentId} • Total Renewals: {renewalHistoryMember.totalRenewals}
                </p>
              </div>
              <button
                onClick={() => setRenewalHistoryMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!renewalHistoryMember.renewalHistory || renewalHistoryMember.renewalHistory.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-xs">
                No past renewal transactions found for this student.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Renewal Ref</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Fee</th>
                      <th className="py-2.5 px-3">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {renewalHistoryMember.renewalHistory.map((ren) => (
                      <tr key={ren.id}>
                        <td className="py-2.5 px-3 font-mono font-medium text-blue-700">{ren.id}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{ren.renewalDate}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{ren.plan}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">${ren.amount.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{ren.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setRenewalHistoryMember(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberManagementPage;
