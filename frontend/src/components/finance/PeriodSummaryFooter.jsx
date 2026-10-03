import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { FileCheck, ShieldCheck } from 'lucide-react';

export const PeriodSummaryFooter = () => {
  const {
    openingBalance,
    totalIncome,
    totalExpenses,
    paidReimbursementsTotal,
    currentBalance,
    netIncome,
    academicYear
  } = useFinance();

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-primary" />
          <h3 className="font-serif-academic text-base font-bold text-text-primary">
            Official Financial Period Summary ({academicYear})
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-status-success font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Division of Student Affairs Comptroller Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-ivory-100 border border-border">
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Opening Balance</span>
          <p className="font-mono text-sm font-bold text-text-primary mt-1">{formatINR(openingBalance)}</p>
        </div>

        <div className="p-3 rounded-lg bg-status-success-bg/30 border border-status-success/30">
          <span className="text-[10px] text-status-success uppercase tracking-wider block">+ Total Income</span>
          <p className="font-mono text-sm font-bold text-status-success mt-1">+{formatINR(totalIncome)}</p>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-[10px] text-primary uppercase tracking-wider block">- Total Expenses</span>
          <p className="font-mono text-sm font-bold text-primary mt-1">-{formatINR(totalExpenses)}</p>
        </div>

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <span className="text-[10px] text-amber-800 uppercase tracking-wider block">- Paid Claims</span>
          <p className="font-mono text-sm font-bold text-amber-800 mt-1">-{formatINR(paidReimbursementsTotal)}</p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300">
          <span className="text-[10px] text-emerald-800 uppercase tracking-wider block">= Closing Balance</span>
          <p className="font-mono text-sm font-bold text-emerald-800 mt-1">{formatINR(currentBalance)}</p>
        </div>

        <div className="p-3 rounded-lg bg-accent-light border border-accent-300">
          <span className="text-[10px] text-accent-700 uppercase tracking-wider block">Net Income</span>
          <p className="font-mono text-sm font-bold text-accent-700 mt-1">{formatINR(netIncome)}</p>
        </div>
      </div>

      <p className="text-[11px] text-text-muted text-center pt-1">
        Formula: <span className="font-mono text-text-secondary">Closing Balance = Opening Balance + Total Income - Total Expenses - Paid Reimbursements</span>
      </p>
    </div>
  );
};
