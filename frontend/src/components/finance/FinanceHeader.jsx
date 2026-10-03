import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Calendar,
  Filter,
  PlusCircle,
  Receipt,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const FinanceHeader = ({
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenReport,
  onNavigateToReimbursements
}) => {
  const { academicYear, setAcademicYear, dateRange, setDateRange } = useFinance();
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const academicYears = [
    'Academic Year 2026–2027',
    'Academic Year 2025–2026'
  ];

  const dateRanges = [
    'This Month',
    'Last Month',
    'This Semester',
    'This Academic Year',
    'Custom Range'
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
      {/* Top Row: Title, Description, and Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="font-serif-academic text-2xl sm:text-3xl font-bold text-text-primary">
              Finance Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-primary text-white shadow-xs">
              Treasurer Command Center
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage finances, monitor transactions, review reimbursements, and view financial reports.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddIncome}
            className="px-3.5 py-2 rounded-lg bg-status-success text-white text-xs font-semibold shadow-xs hover:bg-status-success/90 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Income</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-hover transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Expense</span>
          </button>

          <button
            onClick={onNavigateToReimbursements}
            className="px-3.5 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-text-primary text-xs font-semibold border border-border transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-accent" />
            <span>Review Reimbursements</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-3.5 py-2 rounded-lg bg-surface hover:bg-ivory-100 text-text-secondary text-xs font-semibold border border-border transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Bottom Filter Controls: Period Selector & Date Range Selector */}
      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Financial Period Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowYearDropdown(!showYearDropdown);
                setShowDateDropdown(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-ivory-100 hover:bg-ivory-200 border border-border text-text-primary font-semibold flex items-center space-x-2 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{academicYear}</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {showYearDropdown && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-lg bg-surface border border-border shadow-elevated z-30 py-1 text-xs">
                {academicYears.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setAcademicYear(yr);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-ivory-100 transition flex items-center justify-between ${
                      academicYear === yr ? 'font-bold text-primary bg-ivory-100' : 'text-text-primary'
                    }`}
                  >
                    <span>{yr}</span>
                    {academicYear === yr && <span className="text-primary text-[10px]">● Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowYearDropdown(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface hover:bg-ivory-100 border border-border text-text-secondary font-medium flex items-center space-x-2 transition"
            >
              <Filter className="w-3.5 h-3.5 text-accent" />
              <span>Range: <strong className="text-text-primary">{dateRange}</strong></span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {showDateDropdown && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-lg bg-surface border border-border shadow-elevated z-30 py-1 text-xs">
                {dateRanges.map((rng) => (
                  <button
                    key={rng}
                    onClick={() => {
                      setDateRange(rng);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-ivory-100 transition flex items-center justify-between ${
                      dateRange === rng ? 'font-bold text-primary bg-ivory-100' : 'text-text-secondary'
                    }`}
                  >
                    <span>{rng}</span>
                    {dateRange === rng && <span className="text-primary text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-[11px] text-text-muted flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Ledger Synced with University Bursar • Real-time Calculation</span>
        </div>
      </div>
    </div>
  );
};
