import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { Wallet, Plus, Minus, Equal, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const BalanceOverviewWidget = () => {
  const {
    openingBalance,
    totalIncome,
    totalExpenses,
    currentBalance,
    netIncome
  } = useFinance();

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-academic text-lg font-bold text-text-primary">
              Balance Overview & Formula
            </h2>
            <p className="text-xs text-text-secondary">
              Real-time audit tracking available operating capital
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audited & Solvent</span>
        </span>
      </div>

      {/* Arithmetic Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5 items-center text-center">
        {/* Step 1: Opening Balance */}
        <div className="sm:col-span-2 p-3.5 rounded-lg bg-ivory-100 border border-border">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
            Opening Balance
          </span>
          <p className="font-serif-academic text-xl font-bold text-text-primary mt-1">
            {formatINR(openingBalance)}
          </p>
          <span className="text-[10px] text-text-muted">Start of Academic Year</span>
        </div>

        {/* Operator: Plus */}
        <div className="flex justify-center text-text-muted">
          <div className="w-7 h-7 rounded-full bg-ivory-200 border border-border flex items-center justify-center font-bold text-xs text-status-success">
            +
          </div>
        </div>

        {/* Step 2: Total Income */}
        <div className="sm:col-span-2 p-3.5 rounded-lg bg-status-success-bg/40 border border-status-success/30">
          <span className="text-[11px] font-semibold text-status-success uppercase tracking-wider block">
            Total Inflows
          </span>
          <p className="font-serif-academic text-xl font-bold text-status-success mt-1">
            {formatINR(totalIncome)}
          </p>
          <span className="text-[10px] text-status-success/80">Dues, Tickets, Merch</span>
        </div>

        {/* Operator: Minus */}
        <div className="flex justify-center text-text-muted">
          <div className="w-7 h-7 rounded-full bg-ivory-200 border border-border flex items-center justify-center font-bold text-xs text-primary">
            -
          </div>
        </div>

        {/* Step 3: Total Expenses */}
        <div className="sm:col-span-2 p-3.5 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
            Total Outflows
          </span>
          <p className="font-serif-academic text-xl font-bold text-primary mt-1">
            {formatINR(totalExpenses)}
          </p>
          <span className="text-[10px] text-primary/80">Operations & Supplies</span>
        </div>
      </div>

      {/* Equals Result Box */}
      <div className="p-4 rounded-xl bg-ivory-50 border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-text-secondary">
            Net Closing Treasury Balance
          </span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="font-serif-academic text-3xl font-extrabold text-status-success">
              {formatINR(currentBalance)}
            </span>
            <span className="text-xs text-text-muted font-mono">
              (Net Surplus: {formatINR(netIncome)})
            </span>
          </div>
        </div>

        {/* Visual Balance Progress */}
        <div className="w-full sm:w-64 space-y-1.5 text-right">
          <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
            <span>Solvency Retention:</span>
            <span className="text-status-success">
              {totalIncome > 0 ? Math.round((currentBalance / totalIncome) * 100) : 100}%
            </span>
          </div>
          <div className="w-full bg-ivory-300 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-status-success h-full rounded-full transition-all duration-500"
              style={{ width: `${totalIncome > 0 ? Math.round((currentBalance / totalIncome) * 100) : 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
