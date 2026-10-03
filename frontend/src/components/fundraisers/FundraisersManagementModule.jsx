import React, { useState, useMemo } from 'react';
import { useFundraiser } from '../../context/FundraiserContext';
import { VOLUNTEER_ROSTER_OPTIONS } from '../../data/fundraisersData';
import {
  DollarSign,
  TrendingUp,
  Target,
  CheckSquare,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  User,
  Calendar,
  CreditCard,
  Building2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Users
} from 'lucide-react';

export const FundraisersManagementModule = () => {
  const {
    fundraisers,
    createFundraiser,
    updateFundraiser,
    deleteFundraiser,
    addTask,
    updateTaskStatus,
    deleteTask,
    recordContribution,
    metrics
  } = useFundraiser();

  // Active view: 'list' or 'detail'
  const [selectedFundraiserId, setSelectedFundraiserId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isRecordContribModalOpen, setIsRecordContribModalOpen] = useState(false);

  // Selected Fundraiser object for detail view
  const activeFundraiser = useMemo(() => {
    return fundraisers.find((f) => f.id === selectedFundraiserId) || null;
  }, [fundraisers, selectedFundraiserId]);

  // Filtered fundraisers for table list
  const filteredFundraisers = useMemo(() => {
    return fundraisers.filter((f) => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fundraisers, searchQuery, statusFilter]);

  // Format currency helper
  const formatMoney = (amount) => {
    const val = Number(amount) || 0;
    return `$${val.toLocaleString('en-US')}`;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBF5FB] text-[#1557B0] border border-[#1557B0]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1557B0] mr-1.5"></span>
            Active
          </span>
        );
      case 'Planning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF9E7] text-[#B7791F] border border-[#B7791F]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F] mr-1.5"></span>
            Planning
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAFAF1] text-[#1E8449] border border-[#1E8449]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E8449] mr-1.5"></span>
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FADBD8] text-[#922B21] border border-[#922B21]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#922B21] mr-1.5"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-ivory-200 text-text-secondary">
            {status}
          </span>
        );
    }
  };

  // Task Status Badge Helper
  const getTaskStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAFAF1] text-[#1E8449] border border-[#1E8449]/20">
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF5FB] text-[#1557B0] border border-[#1557B0]/20">
            In Progress
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FEF9E7] text-[#B7791F] border border-[#B7791F]/20">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER */}
      {/* ========================================================= */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Fundraisers
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-ivory-200 text-text-secondary font-medium">
              Admin Panel
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Plan, manage, and track your organization's fundraising activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>+ Create Fundraiser</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. COMPACT SUMMARY CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Fundraisers */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Active Fundraisers
            </span>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {metrics.activeFundraisersCount}
            </p>
            <span className="text-[10px] text-text-muted">
              {fundraisers.length} total campaigns recorded
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EBF5FB] text-[#1557B0] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Total Raised */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Total Raised
            </span>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatMoney(metrics.totalRaised)}
            </p>
            <span className="text-[10px] text-text-muted">
              Collected across all activities
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EAFAF1] text-[#1E8449] flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Fundraising Goal */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Fundraising Goal
            </span>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatMoney(metrics.totalGoal)}
            </p>
            <span className="text-[10px] text-text-muted">
              Combined target budget
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F4F5F7] text-text-primary flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Pending Tasks */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Pending Tasks
            </span>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {metrics.totalPendingTasks}
            </p>
            <span className="text-[10px] text-text-muted">
              Volunteer action items remaining
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FEF9E7] text-[#B7791F] flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN CONTENT: TABLE LIST OR DETAILED MANAGEMENT VIEW */}
      {/* ========================================================= */}
      {!selectedFundraiserId ? (
        /* ========================================================= */
        /* VIEW A: FUNDRAISER TABLE LIST */
        /* ========================================================= */
        <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
          {/* Filter and Search Bar */}
          <div className="p-4 border-b border-border bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by fundraiser name, category..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
              {['ALL', 'Active', 'Planning', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    statusFilter === st
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface hover:bg-ivory-200 text-text-secondary border border-border'
                  }`}
                >
                  {st === 'ALL' ? 'All Fundraisers' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table or Empty State */}
          {filteredFundraisers.length === 0 ? (
            /* 10. EMPTY STATE */
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-ivory-200 mx-auto flex items-center justify-center text-text-muted">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                No fundraisers yet
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Create your first fundraiser to start organizing fundraising activities and volunteer tasks.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
                >
                  + Create Fundraiser
                </button>
              </div>
            </div>
          ) : (
            /* Fundraiser Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-primary">
                <thead className="bg-[#F4F5F7] border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Fundraiser</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Goal</th>
                    <th className="py-3 px-4">Raised</th>
                    <th className="py-3 px-4 min-w-[170px]">Progress</th>
                    <th className="py-3 px-4">Tasks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFundraisers.map((f) => {
                    const percent = Math.min(
                      100,
                      Math.round(((Number(f.raised) || 0) / (Number(f.goal) || 1)) * 100)
                    );
                    const totalTasks = f.tasks ? f.tasks.length : 0;
                    const completedTasks = f.tasks
                      ? f.tasks.filter((t) => t.status === 'Completed').length
                      : 0;

                    return (
                      <tr key={f.id} className="hover:bg-ivory-100 transition-colors">
                        {/* Fundraiser Column */}
                        <td className="py-3 px-4 font-semibold text-text-primary">
                          <div>
                            <span className="block font-bold">{f.title}</span>
                            <span className="text-[10px] text-text-muted font-normal">
                              {f.category || 'General Fund'}
                            </span>
                          </div>
                        </td>

                        {/* Description Column */}
                        <td className="py-3 px-4 text-text-secondary max-w-xs truncate" title={f.description}>
                          {f.description || '—'}
                        </td>

                        {/* Goal Column */}
                        <td className="py-3 px-4 font-mono font-semibold text-text-primary">
                          {formatMoney(f.goal)}
                        </td>

                        {/* Raised Column */}
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {formatMoney(f.raised)}
                        </td>

                        {/* Progress Column (Raised amount / Goal + thin progress bar) */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-mono text-text-secondary">
                                {formatMoney(f.raised)} / {formatMoney(f.goal)}
                              </span>
                              <span className="font-bold text-primary ml-2">
                                {percent}%
                              </span>
                            </div>
                            {/* Thin Progress Bar */}
                            <div className="w-full bg-[#E4E7EB] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Tasks Column */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-ivory-200 text-text-primary">
                            {completedTasks} / {totalTasks} Tasks
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-3 px-4">
                          {getStatusBadge(f.status)}
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedFundraiserId(f.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded border border-border bg-surface hover:bg-ivory-200 text-text-primary text-xs font-semibold transition"
                          >
                            <span>View / Manage</span>
                            <ArrowRight className="w-3.5 h-3.5 text-primary ml-0.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* VIEW B: FUNDRAISER DETAILS & VOLUNTEER TASK MANAGEMENT */
        /* ========================================================= */
        activeFundraiser && (
          <FundraiserDetailView
            fundraiser={activeFundraiser}
            onBack={() => setSelectedFundraiserId(null)}
            onOpenAddTask={() => setIsAddTaskModalOpen(true)}
            onOpenRecordContrib={() => setIsRecordContribModalOpen(true)}
            onUpdateStatus={(newStatus) => updateFundraiser(activeFundraiser.id, { status: newStatus })}
            onUpdateTaskStatus={(taskId, newStatus) => updateTaskStatus(activeFundraiser.id, taskId, newStatus)}
            onDeleteTask={(taskId) => deleteTask(activeFundraiser.id, taskId)}
            formatMoney={formatMoney}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            getTaskStatusBadge={getTaskStatusBadge}
          />
        )
      )}

      {/* ========================================================= */}
      {/* 4. MODALS */}
      {/* ========================================================= */}

      {/* Modal 1: Create Fundraiser */}
      {isCreateModalOpen && (
        <CreateFundraiserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(data) => {
            const created = createFundraiser(data);
            setIsCreateModalOpen(false);
            if (created && created.id) {
              setSelectedFundraiserId(created.id);
            }
          }}
        />
      )}

      {/* Modal 2: Add Volunteer Task */}
      {isAddTaskModalOpen && activeFundraiser && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          fundraiserTitle={activeFundraiser.title}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAdd={(taskData) => {
            addTask(activeFundraiser.id, taskData);
            setIsAddTaskModalOpen(false);
          }}
        />
      )}

      {/* Modal 3: Record Contribution */}
      {isRecordContribModalOpen && activeFundraiser && (
        <RecordContributionModal
          isOpen={isRecordContribModalOpen}
          fundraiserTitle={activeFundraiser.title}
          onClose={() => setIsRecordContribModalOpen(false)}
          onRecord={(contribData) => {
            recordContribution(activeFundraiser.id, contribData);
            setIsRecordContribModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

/**
 * ====================================================================
 * SUBCOMPONENT: FundraiserDetailView
 * Detailed management view for a single fundraiser with financial status
 * and volunteer task coordination table.
 * ====================================================================
 */
const FundraiserDetailView = ({
  fundraiser,
  onBack,
  onOpenAddTask,
  onOpenRecordContrib,
  onUpdateStatus,
  onUpdateTaskStatus,
  onDeleteTask,
  formatMoney,
  formatDate,
  getStatusBadge,
  getTaskStatusBadge
}) => {
  const [taskFilter, setTaskFilter] = useState('ALL');

  const goal = Number(fundraiser.goal) || 0;
  const raised = Number(fundraiser.raised) || 0;
  const remaining = Math.max(0, goal - raised);
  const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));

  const tasks = fundraiser.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const taskPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button & top toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-ivory-200 text-xs font-semibold text-text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-primary" />
          <span>← Back to Fundraisers</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Status selector */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-text-secondary font-medium">Status:</span>
            <select
              value={fundraiser.status}
              onChange={(e) => onUpdateStatus(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-border bg-surface text-text-primary font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenRecordContrib}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1"
          >
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            <span>Record Contribution</span>
          </button>
        </div>
      </div>

      {/* Fundraiser Header Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-text-primary">
                {fundraiser.title}
              </h3>
              {getStatusBadge(fundraiser.status)}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {fundraiser.description}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-text-secondary border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6 flex-shrink-0">
            <div>
              <span className="text-[10px] uppercase font-semibold text-text-muted block">
                Start Date
              </span>
              <span className="font-mono text-text-primary font-medium">
                {formatDate(fundraiser.startDate)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-text-muted block">
                Target End Date
              </span>
              <span className="font-mono text-text-primary font-medium">
                {formatDate(fundraiser.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* 9. FINANCIAL INFORMATION CARDS */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Goal */}
            <div className="p-4 rounded-lg bg-ivory-100 border border-border">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block">
                Fundraising Goal
              </span>
              <span className="text-xl font-bold text-text-primary font-mono mt-0.5 block">
                {formatMoney(goal)}
              </span>
              <span className="text-[10px] text-text-secondary">Target budget required</span>
            </div>

            {/* Raised */}
            <div className="p-4 rounded-lg bg-ivory-100 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block">
                  Amount Raised
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {percent}%
                </span>
              </div>
              <span className="text-xl font-bold text-primary font-mono mt-0.5 block">
                {formatMoney(raised)}
              </span>
              <span className="text-[10px] text-text-secondary">Verified contributions</span>
            </div>

            {/* Remaining */}
            <div className="p-4 rounded-lg bg-ivory-100 border border-border">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block">
                Remaining to Target
              </span>
              <span className="text-xl font-bold text-text-primary font-mono mt-0.5 block">
                {formatMoney(remaining)}
              </span>
              <span className="text-[10px] text-text-secondary">
                {remaining === 0 ? 'Goal fully achieved' : 'Remaining balance to raise'}
              </span>
            </div>
          </div>

          {/* Thin Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Funding Progress</span>
              <span className="font-semibold text-text-primary font-mono">
                {formatMoney(raised)} of {formatMoney(goal)} ({percent}%)
              </span>
            </div>
            <div className="w-full bg-[#E4E7EB] h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 8. VOLUNTEER TASK MANAGEMENT SECTION */}
      {/* ========================================================= */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-bold text-text-primary">
                Volunteer Tasks & Coordination
              </h4>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EBF5FB] text-[#1557B0]">
                {completedTasks}/{tasks.length} Completed ({taskPercent}%)
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Assign responsible student volunteers and track deadlines for this fundraiser.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddTask}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>+ Add Task</span>
          </button>
        </div>

        {/* Task Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {['ALL', 'Pending', 'In Progress', 'Completed'].map((filterTab) => (
            <button
              key={filterTab}
              type="button"
              onClick={() => setTaskFilter(filterTab)}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                taskFilter === filterTab
                  ? 'bg-primary text-white'
                  : 'bg-ivory-100 hover:bg-ivory-200 text-text-secondary border border-border'
              }`}
            >
              {filterTab === 'ALL' ? 'All Tasks' : filterTab}
            </button>
          ))}
        </div>

        {/* Tasks Table */}
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary bg-ivory-100 rounded-lg border border-border">
            No volunteer tasks match this filter. Click <strong>+ Add Task</strong> to assign volunteer responsibilities.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-primary">
              <thead className="bg-[#F4F5F7] border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Task</th>
                  <th className="py-2.5 px-3">Assigned Volunteer</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-ivory-100 transition-colors">
                    {/* Task Title */}
                    <td className="py-3 px-3 font-semibold text-text-primary">
                      {t.title}
                    </td>

                    {/* Assigned Volunteer */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {t.volunteer?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <span className="font-semibold block">{t.volunteer}</span>
                          {t.studentId && (
                            <span className="text-[10px] text-text-muted font-mono">
                              {t.studentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 font-mono text-text-secondary">
                      {formatDate(t.dueDate)}
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="py-3 px-3">
                      <select
                        value={t.status}
                        onChange={(e) => onUpdateTaskStatus(t.id, e.target.value)}
                        className="px-2 py-1 text-xs rounded border border-border bg-surface text-text-primary font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    {/* Action delete */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1 rounded text-status-error hover:bg-status-error-bg transition"
                        title="Remove task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contributions History Log */}
      {fundraiser.contributions && fundraiser.contributions.length > 0 && (
        <div className="bg-surface rounded-xl border border-border shadow-subtle p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <div>
              <h4 className="text-base font-bold text-text-primary">
                Recorded Contributions & Donors
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Official audit log of verified donations and institutional grants.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRecordContrib}
              className="text-xs font-semibold text-primary hover:underline"
            >
              + Record Contribution
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-primary">
              <thead className="bg-[#F4F5F7] border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Donor / Entity</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Receipt Code</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fundraiser.contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory-100 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-text-primary">
                      {c.donor}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">
                      {c.method}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-text-muted">
                      {c.receipt}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-text-secondary">
                      {formatDate(c.date)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                      +{formatMoney(c.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ====================================================================
 * SUBCOMPONENT: CreateFundraiserModal
 * Modal to provision a new fundraiser campaign
 * ====================================================================
 */
const CreateFundraiserModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Community Charity',
    goal: '',
    initialRaised: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Fundraiser name is required';
    if (!formData.goal || Number(formData.goal) <= 0) {
      errs.goal = 'Enter a valid target goal greater than $0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onCreate({
      ...formData,
      goal: Number(formData.goal),
      initialRaised: Number(formData.initialRaised) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface rounded-xl border border-border shadow-elevated w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-[#0F2942] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-white">Create New Fundraiser</h3>
          </div>
          <button onClick={onClose} className="text-[#98A2B3] hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Fundraiser Name */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Fundraiser Name <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Charity Food Drive"
              className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary focus:outline-none focus:ring-1 ${
                errors.title ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
              }`}
            />
            {errors.title && <p className="text-[10px] text-status-error mt-0.5">{errors.title}</p>}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Community Charity">Community Charity</option>
                <option value="Cultural Events">Cultural Events</option>
                <option value="Competition & Travel">Competition & Travel</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Scholarships">Scholarships</option>
                <option value="General Fund">General Fund</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {/* Goal & Initial Raised */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Fundraising Goal ($) <span className="text-status-error">*</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g. 5000"
                className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary font-mono focus:outline-none focus:ring-1 ${
                  errors.goal ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
                }`}
              />
              {errors.goal && <p className="text-[10px] text-status-error mt-0.5">{errors.goal}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Initial Seed / Raised ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.initialRaised}
                onChange={(e) => setFormData({ ...formData, initialRaised: e.target.value })}
                placeholder="e.g. 0"
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Target End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Description / Campaign Purpose
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the fundraising objectives, logistics, and donor incentives..."
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
            >
              Create Fundraiser
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ====================================================================
 * SUBCOMPONENT: AddTaskModal
 * Modal to assign a volunteer task to the active fundraiser
 * ====================================================================
 */
const AddTaskModal = ({ isOpen, fundraiserTitle, onClose, onAdd }) => {
  const [taskForm, setTaskForm] = useState({
    title: '',
    volunteer: 'Rahul Sharma',
    volunteerEmail: 'rahul.s@university.edu',
    studentId: 'STU-2026-5120',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVolunteerSelect = (name) => {
    const selected = VOLUNTEER_ROSTER_OPTIONS.find((v) => v.name === name);
    if (selected) {
      setTaskForm({
        ...taskForm,
        volunteer: selected.name,
        volunteerEmail: selected.email,
        studentId: selected.studentId
      });
    } else {
      setTaskForm({ ...taskForm, volunteer: name });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }
    onAdd(taskForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface rounded-xl border border-border shadow-elevated w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-[#0F2942] text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Add Volunteer Task</h3>
            <p className="text-[11px] text-[#98A2B3] truncate max-w-xs">{fundraiserTitle}</p>
          </div>
          <button onClick={onClose} className="text-[#98A2B3] hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Task Description / Title <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => {
                setTaskForm({ ...taskForm, title: e.target.value });
                if (error) setError('');
              }}
              placeholder="e.g. Contact Sponsors / Arrange Venue"
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {error && <p className="text-[10px] text-status-error mt-0.5">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Assign Volunteer
            </label>
            <select
              value={taskForm.volunteer}
              onChange={(e) => handleVolunteerSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {VOLUNTEER_ROSTER_OPTIONS.map((v) => (
                <option key={v.studentId} value={v.name}>
                  {v.name} ({v.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Initial Status
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ====================================================================
 * SUBCOMPONENT: RecordContributionModal
 * Modal to record new donor contribution/grant into fundraiser
 * ====================================================================
 */
const RecordContributionModal = ({ isOpen, fundraiserTitle, onClose, onRecord }) => {
  const [form, setForm] = useState({
    donor: '',
    amount: '',
    method: 'Direct Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.donor.trim()) {
      setError('Donor or entity name is required');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid contribution amount');
      return;
    }
    onRecord({
      ...form,
      amount: Number(form.amount)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface rounded-xl border border-border shadow-elevated w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-[#0F2942] text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Record Contribution</h3>
            <p className="text-[11px] text-[#98A2B3] truncate max-w-xs">{fundraiserTitle}</p>
          </div>
          <button onClick={onClose} className="text-[#98A2B3] hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Donor / Sponsor Name <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={form.donor}
              onChange={(e) => {
                setForm({ ...form, donor: e.target.value });
                if (error) setError('');
              }}
              placeholder="e.g. Alumni Guild / Corporate Sponsor"
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {error && <p className="text-[10px] text-status-error mt-0.5">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Amount ($) <span className="text-status-error">*</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Payment Method
              </label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Sponsorship Grant">Sponsorship Grant</option>
                <option value="Cash / Venmo Box">Cash / Venmo Box</option>
                <option value="Institutional Match">Institutional Match</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Contribution Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
            >
              Save Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundraisersManagementModule;
