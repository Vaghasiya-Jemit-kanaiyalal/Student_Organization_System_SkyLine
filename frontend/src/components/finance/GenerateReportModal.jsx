import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { X, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

export const GenerateReportModal = ({ isOpen, onClose }) => {
  const { totalIncome, totalExpenses, currentBalance, academicYear } = useFinance();
  const [reportType, setReportType] = useState('full-statement');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Generate Financial Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
            <p className="font-serif-academic font-bold text-base text-text-primary">
              Report Generated Successfully!
            </p>
            <p className="text-xs text-text-muted">
              Certified university audit document dispatched to downloads.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Statement Scope
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary font-medium focus:outline-none focus:border-primary"
              >
                <option value="full-statement">Comprehensive Ledger & Audit Statement ({academicYear})</option>
                <option value="income-summary">Income & Grants Summary</option>
                <option value="disbursements-log">Disbursements & Expense Receipts Log</option>
                <option value="reimbursements-audit">Reimbursement Vouchers Audit Report</option>
              </select>
            </div>

            <div className="p-3 bg-ivory-100 rounded-lg space-y-1 text-text-secondary">
              <div className="flex justify-between font-semibold">
                <span>Certified Inflow:</span>
                <span className="text-status-success">{formatINR(totalIncome)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Audited Outflow:</span>
                <span className="text-primary">{formatINR(totalExpenses)}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary border-t border-border pt-1">
                <span>Closing Operating Solvency:</span>
                <span className="text-status-success">{formatINR(currentBalance)}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition ${
                    format === 'pdf'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface text-text-secondary hover:bg-ivory-100'
                  }`}
                >
                  Official PDF (Signed)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition ${
                    format === 'csv'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface text-text-secondary hover:bg-ivory-100'
                  }`}
                >
                  Raw CSV / Excel
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-ivory-100 font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{generating ? 'Compiling Report...' : `Export ${format.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
