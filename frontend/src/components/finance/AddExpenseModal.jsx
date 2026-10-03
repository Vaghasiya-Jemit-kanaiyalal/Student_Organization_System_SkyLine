import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, PlusCircle, CheckCircle2, UploadCloud } from 'lucide-react';

export const AddExpenseModal = ({ isOpen, onClose }) => {
  const { addExpense } = useFinance();
  const [formData, setFormData] = useState({
    vendor: '',
    description: '',
    category: 'Venue',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    month: 'October',
    receipt: 'REC-VOUCHER-NEW.pdf'
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'Venue',
    'Equipment',
    'Merchandise Expenses',
    'Marketing / Printing',
    'Fundraiser Expenses',
    'Event Expenses',
    'Other Expenses'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendor || !formData.amount || !formData.description) return;

    addExpense({
      vendor: formData.vendor,
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      month: formData.month,
      receipt: formData.receipt,
      receiptStatus: 'Verified'
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({
        vendor: '',
        description: '',
        category: 'Venue',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        month: 'October',
        receipt: 'REC-VOUCHER-NEW.pdf'
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            <h3 className="font-serif-academic text-lg font-bold text-text-primary">
              Record Operational Expense
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <p className="font-serif-academic font-bold text-base text-text-primary">
              Disbursement Successfully Logged!
            </p>
            <p className="text-xs text-text-muted">
              Audited against university operating budget.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Vendor / Payee Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Custom Apparels or Campus Mart"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Item Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bulk Production of 80 Hoodies"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-surface text-text-primary font-medium focus:outline-none focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 12000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-surface text-text-primary font-medium focus:outline-none focus:border-primary"
                >
                  {['September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Receipt Attachment
                </label>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border bg-ivory-50 text-[11px] text-text-muted">
                  <UploadCloud className="w-3.5 h-3.5 text-primary" />
                  <span>Verified Invoice Attached</span>
                </div>
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
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-xs"
              >
                Record Expense
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
