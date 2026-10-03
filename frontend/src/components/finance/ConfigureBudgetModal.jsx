import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../data/financeData';
import { X, Target, CheckCircle2 } from 'lucide-react';

export const ConfigureBudgetModal = ({ isOpen, onClose }) => {
  const { budgets, setBudgets } = useFinance();
  const [localBudgets, setLocalBudgets] = useState(budgets);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleBudgetChange = (idx, value) => {
    const val = Number(value) || 0;
    setLocalBudgets((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, budget: val, remaining: val - b.spent } : b))
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    setBudgets(localBudgets);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Configure Category Budgets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
            <p className="font-serif-academic font-bold text-base text-text-primary">
              Budgets Updated!
            </p>
            <p className="text-xs text-text-muted">
              Spending caps and utilization tracking have been updated in real-time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <p className="text-text-secondary text-[11px]">
              Set maximum authorized expenditure limits for each student organization operational category.
            </p>

            <div className="space-y-3">
              {localBudgets.map((b, idx) => (
                <div key={b.category} className="p-3 bg-ivory-50 rounded-lg border border-border space-y-1.5">
                  <div className="flex justify-between items-center font-semibold text-text-primary">
                    <span>{b.category}</span>
                    <span className="text-[11px] text-primary">Spent: {formatINR(b.spent)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-text-secondary">₹</span>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      value={b.budget}
                      onChange={(e) => handleBudgetChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text-primary font-mono font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text-secondary font-semibold hover:bg-ivory-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-xs"
              >
                Save Budget Ceilings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
