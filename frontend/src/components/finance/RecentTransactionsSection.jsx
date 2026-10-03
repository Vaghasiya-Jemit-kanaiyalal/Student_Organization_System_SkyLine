import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { FileCheck2, ArrowRight, Search, Filter } from 'lucide-react';

export const RecentTransactionsSection = ({ onNavigateToLedger }) => {
  const { recentTransactions } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredTransactions = recentTransactions.filter((txn) => {
    const matchesSearch =
      (txn.description && txn.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.id && txn.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.vendorOrSource && txn.vendorOrSource.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || txn.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-academic text-lg font-bold text-text-primary">
              Recent Transactions Ledger
            </h2>
            <p className="text-xs text-text-secondary">
              Latest audited debits, credits, and reimbursement journal entries
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search txn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-text-secondary focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Reimbursement">Reimbursement</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
            <tr>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Transaction ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Source / Category</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTransactions.slice(0, 7).map((txn) => (
              <tr key={txn.id} className="hover:bg-ivory-50 transition">
                <td className="py-3 px-3 text-text-muted whitespace-nowrap">
                  {txn.displayDate || txn.date}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-primary whitespace-nowrap">
                  {txn.id}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      txn.type === 'Income'
                        ? 'bg-status-success-bg text-status-success border border-status-success/30'
                        : txn.type === 'Expense'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-semibold text-text-primary block">{txn.category || txn.vendorOrSource}</span>
                  <span className="text-[10px] text-text-muted">{txn.vendorOrSource}</span>
                </td>
                <td className="py-3 px-3 text-text-secondary max-w-[220px] truncate" title={txn.description}>
                  {txn.description}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap">
                  <span className={txn.sign === '+' ? 'text-status-success' : 'text-primary'}>
                    {txn.sign}{formatINR(txn.amount)}
                  </span>
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-ivory-200 text-text-secondary">
                    {txn.status || 'Cleared'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex justify-between items-center text-xs text-text-muted">
        <span>Showing latest {Math.min(filteredTransactions.length, 7)} transactions</span>
        <button
          onClick={() => onNavigateToLedger('income')}
          className="font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
