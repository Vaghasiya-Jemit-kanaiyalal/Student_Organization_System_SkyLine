import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { X, Receipt, CheckCircle2, XCircle, FileText, Download } from 'lucide-react';

export const ReimbursementReviewModal = ({ request, isOpen, onClose }) => {
  const { approveReimbursement, rejectReimbursement } = useFinance();

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-accent" />
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Review Claim #{request.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claim Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-ivory-100 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Claimant</span>
              <p className="font-bold text-text-primary text-sm">{request.claimant}</p>
              <span className="text-[10px] font-mono text-text-secondary">{request.studentId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Requested Sum</span>
              <p className="font-serif-academic text-xl font-extrabold text-primary">
                {formatINR(request.amount)}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-0.5">Description & Purpose</label>
            <p className="text-text-secondary bg-ivory-50 p-2.5 rounded border border-border">
              {request.description} — {request.item}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-text-muted block">Submitted Date</span>
              <span className="font-semibold text-text-primary">{request.submittedDate}</span>
            </div>
            <div>
              <span className="text-text-muted block">Category Allocation</span>
              <span className="font-semibold text-text-primary">{request.category || 'Operations'}</span>
            </div>
          </div>

          {/* Receipt Proof Card */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">Attached Receipt Proof</label>
            <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-accent" />
                <div>
                  <p className="font-mono text-xs font-semibold text-text-primary">{request.receiptFile || 'Itemized_Bill.pdf'}</p>
                  <span className="text-[10px] text-status-success font-semibold">✓ Verified Merchant Tax Stamp</span>
                </div>
              </div>
              <button
                onClick={() => alert(`Opening ${request.receiptFile || 'voucher.pdf'} in secure viewer...`)}
                className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View</span>
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {request.notes && (
            <p className="text-[11px] text-text-muted italic bg-ivory-50 p-2 rounded">
              "{request.notes}"
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex justify-between items-center border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text-secondary text-xs font-semibold hover:bg-ivory-100"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                rejectReimbursement(request.id);
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg border border-status-error/30 text-status-error hover:bg-status-error-bg text-xs font-semibold transition"
            >
              Reject Claim
            </button>
            <button
              onClick={() => {
                approveReimbursement(request.id);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-status-success hover:bg-status-success/90 text-white text-xs font-semibold shadow-xs transition"
            >
              Approve & Disburse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
