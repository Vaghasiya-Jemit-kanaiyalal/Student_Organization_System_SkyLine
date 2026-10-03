import React, { useState } from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { formatINR } from '../../../data/financeData';
import { TrendingDown, PlusCircle, Search, ArrowLeft, Eye, Paperclip } from 'lucide-react';

export const ExpenseManagementView = ({ onBack, onOpenAddExpense }) => {
  const { expenses, totalExpenses, expenseCategoryFilter, setExpenseCategoryFilter } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ALL',
    'Venue',
    'Equipment',
    'Merchandise Expenses',
    'Marketing / Printing',
    'Fundraiser Expenses',
    'Event Expenses',
    'Other Expenses'
  ];

  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      (item.vendor && item.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      expenseCategoryFilter === 'ALL' || item.category === expenseCategoryFilter;

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
              <TrendingDown className="w-5 h-5 text-primary" />
              <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                Expense Management & Outflows
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Audited operational disbursements, invoices, and verified receipts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-semibold text-text-secondary hidden sm:inline">
            Total Disbursed: <strong className="text-primary font-mono text-sm">{formatINR(totalExpenses)}</strong>
          </span>
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setExpenseCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                expenseCategoryFilter === cat
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
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Receipt Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.map((item) => (
                <tr key={item.id} className="hover:bg-ivory-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-text-primary">{item.vendor}</td>
                  <td className="py-3 px-4 text-text-secondary max-w-[240px] truncate">{item.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory-200 text-text-secondary">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted whitespace-nowrap">{item.displayDate}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-primary text-sm">
                    -{formatINR(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => alert(`Reviewing archived voucher: ${item.receipt}`)}
                      className="px-2 py-1 rounded bg-ivory-100 hover:bg-ivory-200 text-text-secondary font-mono text-[11px] inline-flex items-center gap-1 transition"
                    >
                      <Paperclip className="w-3 h-3 text-accent" />
                      <span>{item.receipt}</span>
                      <Eye className="w-3 h-3 text-text-muted" />
                    </button>
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
