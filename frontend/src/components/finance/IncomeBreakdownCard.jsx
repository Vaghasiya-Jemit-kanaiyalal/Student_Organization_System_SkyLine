import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { PieChart, ArrowRight, Tag } from 'lucide-react';

export const IncomeBreakdownCard = ({ onNavigateToIncomeCategory }) => {
  const { incomeBreakdown, totalIncome } = useFinance();

  const colorPalette = [
    { bar: 'bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    { bar: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
    { bar: 'bg-amber-600', text: 'text-amber-700', bg: 'bg-amber-50' },
    { bar: 'bg-purple-600', text: 'text-purple-700', bg: 'bg-purple-50' },
    { bar: 'bg-rose-600', text: 'text-rose-700', bg: 'bg-rose-50' },
    { bar: 'bg-slate-600', text: 'text-slate-700', bg: 'bg-slate-50' }
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-academic text-base font-bold text-text-primary">
                Income Streams Breakdown
              </h2>
              <p className="text-xs text-text-secondary">
                Where organization funds originate
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-status-success">
            {formatINR(totalIncome)}
          </span>
        </div>

        {/* Categories List */}
        <div className="space-y-3 pt-3">
          {incomeBreakdown.map((item, idx) => {
            const color = colorPalette[idx % colorPalette.length];
            return (
              <button
                key={item.category}
                onClick={() => onNavigateToIncomeCategory(item.category)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-ivory-100 transition border border-transparent hover:border-border group"
                title={`Click to filter Income Ledger by ${item.category}`}
              >
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bar}`} />
                    <span className="font-semibold text-text-primary group-hover:text-primary transition">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-text-primary font-mono">
                      {formatINR(item.amount)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${color.bg} ${color.text}`}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${color.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
        <span>Click any stream to view filtered ledger</span>
        <button
          onClick={() => onNavigateToIncomeCategory('ALL')}
          className="font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          <span>View All Incomes</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
