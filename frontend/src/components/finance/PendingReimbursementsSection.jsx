import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { Receipt, Eye, CheckCircle2, XCircle, ArrowRight, Paperclip } from 'lucide-react';

export const PendingReimbursementsSection = ({ onReviewRequest, onNavigateToReimbursements }) => {
  const { pendingReimbursements, approveReimbursement, rejectReimbursement } = useFinance();

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-academic text-lg font-bold text-text-primary">
              Pending Reimbursement Requests
            </h2>
            <p className="text-xs text-text-secondary">
              Review and disburse verified campus member expenditures
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToReimbursements}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All ({pendingReimbursements.length} Pending)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {pendingReimbursements.length === 0 ? (
        <div className="p-8 text-center bg-ivory-50 rounded-lg border border-dashed border-border text-xs text-text-muted space-y-2">
          <CheckCircle2 className="w-6 h-6 text-status-success mx-auto" />
          <p className="font-semibold text-text-primary">All reimbursement requests have been audited!</p>
          <p>Zero pending claims awaiting treasurer approval.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Request ID</th>
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Submitted Date</th>
                <th className="py-2.5 px-3">Receipt Status</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingReimbursements.map((rmb) => (
                <tr key={rmb.id} className="hover:bg-ivory-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-primary">
                    {rmb.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-text-primary block">{rmb.claimant}</span>
                    <span className="text-[10px] font-mono text-text-muted">{rmb.studentId}</span>
                  </td>
                  <td className="py-3 px-3 text-text-secondary max-w-[200px] truncate" title={rmb.description}>
                    {rmb.description}
                  </td>
                  <td className="py-3 px-3 font-bold text-text-primary font-mono">
                    {formatINR(rmb.amount)}
                  </td>
                  <td className="py-3 px-3 text-text-muted">
                    {rmb.submittedDate}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-success bg-status-success-bg px-2 py-0.5 rounded border border-status-success/30">
                      <Paperclip className="w-3 h-3" />
                      {rmb.receiptStatus || 'Receipt Attached'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {rmb.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onReviewRequest(rmb)}
                      className="px-2.5 py-1 bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/40 rounded text-[11px] font-semibold transition"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => approveReimbursement(rmb.id)}
                      className="px-2.5 py-1 bg-status-success text-white hover:bg-status-success/90 rounded text-[11px] font-semibold transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectReimbursement(rmb.id)}
                      className="px-2.5 py-1 bg-surface border border-status-error/30 text-status-error hover:bg-status-error-bg rounded text-[11px] font-semibold transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
