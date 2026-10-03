import React, { useState } from 'react';
import { useTreasurer } from '../../context/TreasurerContext';
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Calendar,
  Mail,
  Lock,
  Hash,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const TreasurerModal = ({ isOpen, onClose }) => {
  const { currentTreasurer, assignNewTreasurer } = useTreasurer();
  const [isAssigning, setIsAssigning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    startDate: new Date().toISOString().split('T')[0],
    department: 'School of Engineering & Applied Sciences'
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Enter a valid institutional email';
    }
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.startDate) newErrors.startDate = 'Date of starting is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitNewTreasurer = (e) => {
    e.preventDefault();
    if (!validate()) return;

    assignNewTreasurer({
      name: formData.name,
      email: formData.email,
      studentId: formData.studentId,
      password: formData.password,
      startDate: formData.startDate,
      department: formData.department
    });

    setSuccessMsg(`Treasurer credentials successfully provisioned for ${formData.name}!`);
    setTimeout(() => {
      setSuccessMsg('');
      setIsAssigning(false);
      setFormData({
        name: '',
        email: '',
        studentId: '',
        password: '',
        startDate: new Date().toISOString().split('T')[0],
        department: 'School of Engineering & Applied Sciences'
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface rounded-xl border border-border shadow-elevated w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-[#0F2942] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#123552] border border-[#58A6FF]/40 flex items-center justify-center text-[#58A6FF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Treasurer Authority & Administration
              </h3>
              <p className="text-[11px] text-[#98A2B3]">
                Skyline Fiscal Governance & Ledger Signatory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#98A2B3] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-lg bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Current Treasurer Card */}
          <div className="bg-ivory-100 rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                Current Appointed Treasurer
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success mr-1"></span>
                Active Signatory
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <h4 className="text-base font-bold text-text-primary">
                  {currentTreasurer?.name || 'Marcus Sterling'}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-text-muted" />
                    ID: <strong className="font-mono text-primary">{currentTreasurer?.studentId || 'STU-2026-4419'}</strong>
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-text-muted" />
                    {currentTreasurer?.email || 'm.sterling@university.edu'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-text-muted block">
                  Serving Since (Start Date)
                </span>
                <span className="text-xs font-mono font-bold text-primary flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-accent" />
                  {formatDate(currentTreasurer?.startDate)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/80 flex items-center justify-between text-[11px] text-text-muted">
              <span>Authority: {currentTreasurer?.appointedBy || 'Office of Club President'}</span>
              <span>{currentTreasurer?.department || 'Engineering & Applied Sciences'}</span>
            </div>
          </div>

          {/* Toggle / Trigger Button to Assign New Treasurer */}
          {!isAssigning ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAssigning(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4 text-accent" />
                <span>Assign New Treasurer</span>
              </button>
              <p className="text-[11px] text-text-muted text-center mt-2">
                Assigning a new treasurer provisions system credentials and updates fiscal ledger authority.
              </p>
            </div>
          ) : (
            /* Assign New Treasurer Form */
            <form onSubmit={handleSubmitNewTreasurer} className="space-y-4 pt-2 border-t border-border animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-accent" />
                  Appoint & Assign New Treasurer
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>

              {/* Name & Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Treasurer Full Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary focus:outline-none focus:ring-1 ${
                      errors.name ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-status-error mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Student ID <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="e.g. STU-2026-3021"
                    className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary font-mono focus:outline-none focus:ring-1 ${
                      errors.studentId ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
                    }`}
                  />
                  {errors.studentId && <p className="text-[10px] text-status-error mt-0.5">{errors.studentId}</p>}
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    University Email <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g. e.rostova@university.edu"
                    className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary focus:outline-none focus:ring-1 ${
                      errors.email ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-status-error mt-0.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Temporary Password <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Min 6 characters"
                    className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary focus:outline-none focus:ring-1 ${
                      errors.password ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
                    }`}
                  />
                  {errors.password && <p className="text-[10px] text-status-error mt-0.5">{errors.password}</p>}
                </div>
              </div>

              {/* Date of Starting & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Date of Starting <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded border bg-surface text-text-primary focus:outline-none focus:ring-1 ${
                      errors.startDate ? 'border-status-error focus:ring-status-error' : 'border-border focus:ring-primary'
                    }`}
                  />
                  {errors.startDate && <p className="text-[10px] text-status-error mt-0.5">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="School of Engineering"
                    className="w-full px-3 py-2 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="px-3.5 py-2 rounded-lg bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Confirm & Ratify Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-ivory-200 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>Skyline Student Organization System</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
