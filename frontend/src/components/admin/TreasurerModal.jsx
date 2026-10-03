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
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 bg-[#0B0F17] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Treasurer Authority & Administration
              </h3>
              <p className="text-[11px] text-slate-400">
                Skyline Fiscal Governance & Ledger Signatory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Treasurer Card */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                Current Appointed Treasurer
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1"></span>
                Active Signatory
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 pt-0.5">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">
                  {currentTreasurer?.name || 'Marcus Sterling'}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    ID: <strong className="font-mono text-emerald-700">{currentTreasurer?.studentId || 'STU-2026-4419'}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {currentTreasurer?.email || 'm.sterling@university.edu'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Serving Since
                </span>
                <span className="text-xs font-mono font-bold text-zinc-900 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-emerald-700" />
                  {formatDate(currentTreasurer?.startDate)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authority: {currentTreasurer?.appointedBy || 'Office of Club President'}</span>
              <span>{currentTreasurer?.department || 'Engineering & Applied Sciences'}</span>
            </div>
          </div>

          {/* Toggle / Trigger Button to Assign New Treasurer */}
          {!isAssigning ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsAssigning(true)}
                className="w-full h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign New Treasurer</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-1.5">
                Assigning a new treasurer provisions system credentials and updates fiscal ledger authority.
              </p>
            </div>
          ) : (
            /* Assign New Treasurer Form */
            <form onSubmit={handleSubmitNewTreasurer} className="space-y-3 pt-2 border-t border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                  Appoint & Assign New Treasurer
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="text-xs text-slate-400 hover:text-zinc-900"
                >
                  Cancel
                </button>
              </div>

              {/* Name & Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Treasurer Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className={`w-full h-8 px-2.5 text-xs rounded-md border bg-white text-zinc-900 focus:outline-none focus:ring-1 ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="e.g. STU-2026-3021"
                    className={`w-full h-8 px-2.5 text-xs rounded-md border bg-white text-zinc-900 font-mono focus:outline-none focus:ring-1 ${
                      errors.studentId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600'
                    }`}
                  />
                  {errors.studentId && <p className="text-[10px] text-red-500 mt-0.5">{errors.studentId}</p>}
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    University Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g. e.rostova@university.edu"
                    className={`w-full h-8 px-2.5 text-xs rounded-md border bg-white text-zinc-900 focus:outline-none focus:ring-1 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Temporary Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Min 6 characters"
                    className={`w-full h-8 px-2.5 text-xs rounded-md border bg-white text-zinc-900 focus:outline-none focus:ring-1 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600'
                    }`}
                  />
                  {errors.password && <p className="text-[10px] text-red-500 mt-0.5">{errors.password}</p>}
                </div>
              </div>

              {/* Date of Starting & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Date of Starting <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full h-8 px-2.5 text-xs rounded-md border bg-white text-zinc-900 focus:outline-none focus:ring-1 ${
                      errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600'
                    }`}
                  />
                  {errors.startDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="School of Engineering"
                    className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="h-8 px-3 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
                >
                  <span>Confirm & Ratify Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <span>Skyline Student Organization System</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-zinc-700 hover:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreasurerModal;
