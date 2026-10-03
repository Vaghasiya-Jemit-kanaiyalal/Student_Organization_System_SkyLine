import React, { useState } from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { formatINR } from '../../../data/financeData';
import { Receipt, Search, ArrowLeft, CheckCircle2, XCircle, Eye, Paperclip } from 'lucide-react';

export const ReimbursementsView = ({ onBack, onReviewRequest }) => {
  const { reimbursements, approveReimbursement, rejectReimbursement, pendingReimbursementsTotal } = useFinance();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReimbursements = reimbursements.filter((item) => {
    const matchesSearch =
      (item.claimant && item.claimant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
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
              <Receipt className="w-5 h-5 text-accent" />
              <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                Reimbursement Requests Queue
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Itemized member claims, verification receipts, and comptroller payouts
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Pending Reimbursements</span>
          <span className="font-mono text-base font-bold text-amber-700">{formatINR(pendingReimbursementsTotal)}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-1.5">
          {['ALL', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-ivory-100 text-text-secondary hover:bg-ivory-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search claimant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Claimant</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Comptroller Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReimbursements.map((rmb) => (
                <tr key={rmb.id} className="hover:bg-ivory-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{rmb.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-text-primary block">{rmb.claimant}</span>
                    <span className="text-[10px] font-mono text-text-muted">{rmb.studentId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary max-w-[200px] truncate">{rmb.description}</td>
                  <td className="py-3.5 px-4 text-text-muted">{rmb.category || 'Operations'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-text-primary text-sm">{formatINR(rmb.amount)}</td>
                  <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">{rmb.submittedDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rmb.status === 'Approved'
                          ? 'bg-status-success-bg text-status-success border border-status-success/30'
                          : rmb.status === 'Rejected'
                          ? 'bg-status-error-bg text-status-error border border-status-error/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {rmb.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onReviewRequest(rmb)}
                      className="px-2.5 py-1 bg-surface border border-border text-text-secondary hover:text-primary rounded text-[11px] font-semibold"
                    >
                      Review
                    </button>
                    {rmb.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => approveReimbursement(rmb.id)}
                          className="px-2.5 py-1 bg-status-success text-white hover:bg-status-success/90 rounded text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectReimbursement(rmb.id)}
                          className="px-2.5 py-1 bg-surface border border-status-error/30 text-status-error hover:bg-status-error-bg rounded text-[11px] font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
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
