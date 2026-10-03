import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { Target, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

export const BudgetOverviewSection = ({ onOpenConfigureBudget }) => {
  const { budgets } = useFinance();

  if (!budgets || budgets.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle text-center space-y-3">
        <Target className="w-8 h-8 text-text-muted mx-auto" />
        <h3 className="font-serif-academic text-lg font-bold text-text-primary">
          No Budget Configured
        </h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          Establish semester spending ceilings for events, merchandise, and operations to maintain council fiscal discipline.
        </p>
        <button
          onClick={onOpenConfigureBudget}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition"
        >
          Configure Budget
        </button>
      </div>
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallUtilizationPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-academic text-lg font-bold text-text-primary">
              Institutional Budget Allocation & Ceilings
            </h2>
            <p className="text-xs text-text-secondary">
              Authorized university spending caps and category utilization
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">Overall Utilization</span>
            <span className="font-mono text-sm font-bold text-primary">{overallUtilizationPct}%</span>
          </div>
          <button
            onClick={onOpenConfigureBudget}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-ivory-100 text-text-secondary text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-accent" />
            <span>Configure Budget</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-ivory-100 border border-border">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
            Authorized Total Budget
          </span>
          <p className="font-serif-academic text-xl font-bold text-text-primary mt-1">
            {formatINR(totalBudget)}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
            Total Disbursed / Spent
          </span>
          <p className="font-serif-academic text-xl font-bold text-primary mt-1">
            {formatINR(totalSpent)}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-status-success-bg/40 border border-status-success/30">
          <span className="text-[10px] font-semibold text-status-success uppercase tracking-wider block">
            Remaining Available Cap
          </span>
          <p className="font-serif-academic text-xl font-bold text-status-success mt-1">
            {formatINR(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {budgets.map((b) => {
          const utilPct = b.budget > 0 ? Math.round((b.spent / b.budget) * 100) : 0;
          return (
            <div key={b.category} className="p-4 rounded-xl border border-border bg-ivory-50/50 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-text-primary">{b.category}</span>
                <span className="font-mono text-[11px] font-semibold text-text-secondary">
                  {utilPct}% Utilized
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-ivory-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`${b.color || 'bg-primary'} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(utilPct, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-text-secondary pt-0.5">
                <span>Budget: <strong className="text-text-primary">{formatINR(b.budget)}</strong></span>
                <span>Spent: <strong className="text-primary">{formatINR(b.spent)}</strong></span>
                <span>Remaining: <strong className="text-status-success">{formatINR(b.remaining)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
