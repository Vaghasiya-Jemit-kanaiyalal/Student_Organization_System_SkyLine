import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { BarChart3, TrendingUp, TrendingDown, Info } from 'lucide-react';

export const IncomeExpenseChart = () => {
  const { dateRange, incomes, expenses } = useFinance();
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Group monthly figures
  const months = ['September', 'October', 'November', 'December'];

  const monthlyData = months.map((m) => {
    const inc = incomes
      .filter((i) => i.month === m)
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const exp = expenses
      .filter((e) => e.month === m)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const net = inc - exp;
    return {
      month: m,
      income: inc,
      expense: exp,
      net
    };
  });

  // Calculate dynamic max value for scaling bar heights
  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    70000
  );

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-5">
      {/* Chart Header & Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-academic text-lg font-bold text-text-primary">
              Income vs Expenses Comparison
            </h2>
            <p className="text-xs text-text-secondary">
              Monthly breakdown for {dateRange}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-status-success inline-block shadow-xs" />
            <span className="text-text-primary">Income</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-primary inline-block shadow-xs" />
            <span className="text-text-primary">Expenses</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-6 pb-2">
        <div className="grid grid-cols-4 gap-4 sm:gap-8 items-end h-56 border-b border-border pb-2">
          {monthlyData.map((d) => {
            const incHeightPct = Math.round((d.income / maxVal) * 100);
            const expHeightPct = Math.round((d.expense / maxVal) * 100);
            const isHovered = hoveredMonth === d.month;

            return (
              <div
                key={d.month}
                className="relative flex flex-col items-center h-full justify-end cursor-pointer group"
                onMouseEnter={() => setHoveredMonth(d.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Floating Interactive Tooltip */}
                {isHovered && (
                  <div className="absolute -top-20 z-30 w-44 bg-text-primary text-white text-[11px] p-2.5 rounded-lg shadow-elevated pointer-events-none transform -translate-x-1/2 left-1/2 animate-fadeIn border border-white/10">
                    <p className="font-bold text-accent border-b border-white/10 pb-1 mb-1">
                      {d.month} 2026
                    </p>
                    <div className="flex justify-between items-center text-white/90">
                      <span>Income:</span>
                      <span className="font-semibold text-status-success">{formatINR(d.income)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/90">
                      <span>Expense:</span>
                      <span className="font-semibold text-rose-300">{formatINR(d.expense)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-white/10 mt-1 font-bold">
                      <span>Net Change:</span>
                      <span className={d.net >= 0 ? 'text-status-success' : 'text-rose-300'}>
                        {formatINR(d.net)}
                      </span>
                    </div>
                  </div>
                )}

                {/* The Bars */}
                <div className="flex items-end space-x-2 w-full justify-center h-full">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${Math.max(incHeightPct, 6)}%` }}
                    className="w-5 sm:w-10 bg-status-success hover:bg-status-success/80 rounded-t-md transition-all duration-300 shadow-xs relative group"
                    title={`Income: ${formatINR(d.income)}`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white absolute -top-4 left-1/2 -translate-x-1/2 transition">
                      {formatINR(d.income).replace('₹', '')}
                    </span>
                  </div>

                  {/* Expense Bar */}
                  <div
                    style={{ height: `${Math.max(expHeightPct, 4)}%` }}
                    className="w-5 sm:w-10 bg-primary hover:bg-primary-hover rounded-t-md transition-all duration-300 shadow-xs relative group"
                    title={`Expense: ${formatINR(d.expense)}`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-primary absolute -top-4 left-1/2 -translate-x-1/2 transition">
                      {formatINR(d.expense).replace('₹', '')}
                    </span>
                  </div>
                </div>

                {/* X-Axis Label */}
                <span className={`mt-2 text-xs font-semibold transition ${
                  isHovered ? 'text-primary underline' : 'text-text-secondary'
                }`}>
                  {d.month.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover Hint */}
        <div className="flex justify-between items-center text-[11px] text-text-muted mt-3">
          <span>* Hover or tap any month to view detailed Inflow, Outflow, and Net calculations</span>
          <span className="font-mono text-text-secondary font-semibold">Scale: Up to {formatINR(maxVal)}</span>
        </div>
      </div>
    </div>
  );
};
