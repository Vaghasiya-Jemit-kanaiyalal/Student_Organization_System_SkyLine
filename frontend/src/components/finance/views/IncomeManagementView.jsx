import React, { useState } from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { formatINR } from '../../../data/financeData';
import { TrendingUp, PlusCircle, Search, Filter, ArrowLeft, Download } from 'lucide-react';

export const IncomeManagementView = ({ onBack, onOpenAddIncome }) => {
  const { incomes, totalIncome, incomeCategoryFilter, setIncomeCategoryFilter } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ALL',
    'Membership Fees',
    'Event Ticket Sales',
    'Merchandise Sales',
    'Fundraisers',
    'Donations',
    'Other Income'
  ];

  const filteredIncomes = incomes.filter((item) => {
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.source && item.source.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      incomeCategoryFilter === 'ALL' || item.category === incomeCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-border hover:bg-ivory-100 text-text-secondary transition"
            title="Back to Finance Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-status-success" />
              <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                Income Management & Inflows
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Itemized ledger of membership dues, ticketing proceeds, and fundraisers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-semibold text-text-secondary hidden sm:inline">
            Total Revenue: <strong className="text-status-success font-mono text-sm">{formatINR(totalIncome)}</strong>
          </span>
          <button
            onClick={onOpenAddIncome}
            className="px-3.5 py-2 rounded-lg bg-status-success hover:bg-status-success/90 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Income</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setIncomeCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                incomeCategoryFilter === cat
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-ivory-100 text-text-secondary hover:bg-ivory-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search income entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Description / Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Source / Platform</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIncomes.map((item) => (
                <tr key={item.id} className="hover:bg-ivory-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-text-primary">{item.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory-200 text-text-secondary">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{item.source}</td>
                  <td className="py-3 px-4 text-text-muted whitespace-nowrap">{item.displayDate}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-status-success text-sm">
                    +{formatINR(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30">
                      {item.status || 'Cleared'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
