import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const FinancialSummaryCards = ({ onNavigate }) => {
  const {
    totalIncome,
    totalExpenses,
    currentBalance,
    pendingReimbursements,
    pendingReimbursementsTotal
  } = useFinance();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income Card */}
      <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-status-success/40 transition flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Total Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-academic text-3xl font-bold text-text-primary mt-2">
            {formatINR(totalIncome)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-status-success font-medium">
            <span>↑ 12% compared with previous period</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted">Cleared in Treasury</span>
          <button
            onClick={() => onNavigate('income')}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
          >
            <span>Income Management</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Total Expenses Card */}
      <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-primary/40 transition flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-academic text-3xl font-bold text-text-primary mt-2">
            {formatINR(totalExpenses)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <span>↑ 8% compared with previous period</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted">Verified & Audited</span>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
          >
            <span>Expense Management</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. Current Balance Card */}
      <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-accent/40 transition flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Current Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-academic text-3xl font-bold text-status-success mt-2">
            {formatINR(currentBalance)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-status-success font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available for disbursement</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted">Formula Verified</span>
          <span className="text-[11px] font-mono text-text-secondary">
            Income - Expenses
          </span>
        </div>
      </div>

      {/* 4. Pending Reimbursements Card */}
      <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-amber-400/50 transition flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Pending Reimbursements
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-academic text-3xl font-bold text-amber-800 mt-2">
            {formatINR(pendingReimbursementsTotal)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>{pendingReimbursements.length} requests pending</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted">Awaiting Approval</span>
          <button
            onClick={() => onNavigate('reimbursements')}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
