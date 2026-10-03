import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { formatINR } from '../../../data/financeData';
import { FileSpreadsheet, ArrowLeft, Download, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export const FinanceReportsView = ({ onBack, onOpenReportModal }) => {
  const { totalIncome, totalExpenses, currentBalance, netIncome, academicYear } = useFinance();

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
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                Reports & Audit Compliance Analytics
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Official university financial statements certified for semester compliance and bursar grant renewal
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Statement (PDF)</span>
        </button>
      </div>

      {/* Certification Box */}
      <div className="p-4 rounded-xl bg-status-success-bg/40 border border-status-success/30 flex items-center justify-between text-xs text-status-success">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span>
            Financial statements officially certified by Division of Student Affairs Comptroller on <strong>01 Oct 2026</strong>. Zero discrepancies noted.
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold hidden md:inline">
          Ref: #BSR-AUD-2026-9901
        </span>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle space-y-3">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <FileCheck className="w-4 h-4" />
            <span>Semester Operating Statement</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Consolidated breakdown of institutional grants, membership fees, and verified venue outflows for {academicYear}.
          </p>
          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
            <span className="font-bold text-status-success">{formatINR(currentBalance)} Solvency</span>
            <button
              onClick={onOpenReportModal}
              className="text-primary hover:underline font-semibold"
            >
              Generate PDF →
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle space-y-3">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <FileSpreadsheet className="w-4 h-4" />
            <span>General Transactions Ledger CSV</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Row-by-row transaction log with reference hashes, timestamps, and claimant verified vouchers for accounting software.
          </p>
          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Direct Excel / CSV</span>
            <button
              onClick={onOpenReportModal}
              className="text-primary hover:underline font-semibold"
            >
              Export CSV →
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle space-y-3">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Tax Exemption Certification</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Non-profit student council status filing document required for venue fee waivers and educational equipment concessions.
          </p>
          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
            <span className="text-status-success font-semibold">Active Valid Status</span>
            <button
              onClick={() => alert('Downloading official university tax exemption certificate...')}
              className="text-primary hover:underline font-semibold"
            >
              Download PDF →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
