import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  User,
  Hash,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  Info
} from 'lucide-react';

export const RegisterPage = () => {
  const { registerMember } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full legal name is required for university rosters.';
    } else if (fullName.trim().length < 3) {
      errors.fullName = 'Please enter your complete legal name.';
    }

    if (!studentId.trim()) {
      errors.studentId = 'University Student ID is required.';
    } else if (studentId.trim().length < 3) {
      errors.studentId = 'Please enter a valid student ID (min. 3 characters).';
    }

    if (!email.trim()) {
      errors.email = 'University email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid university email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the University Honor Code & Club Guidelines.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await registerMember({
        name: fullName,
        studentId: studentId,
        email: email,
        password: password
      });

      if (result.success) {
        navigate('/verify-success', {
          state: {
            studentName: fullName,
            studentId: studentId,
            email: email
          }
        });
      } else {
        setErrorMessage(result.error || 'Failed to complete registration.');
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...result.fieldErrors }));
        }
      }
    } catch {
      setErrorMessage('A registration system error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-slate-50 overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[320px] h-[320px] bg-slate-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Registration Card */}
      <div className="w-full max-w-[500px] bg-white rounded-xl border border-slate-200 shadow-xl p-6 sm:p-8 relative z-10">

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-2">
            <UniversityCrest
              className="w-14 h-14 text-emerald-700"
              variant="skyline"
              color="#059669"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-tight">
            SkyLine
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Create Member Account
          </p>
        </div>

        {/* Info Callout */}
        <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="text-[11.5px] leading-relaxed">
            Member accounts are for university students joining campus organizations. Club Admins & Treasurers are designated by faculty.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-relaxed">
              <span>{errorMessage}</span>
              {errorMessage.toLowerCase().includes('already exists') && (
                <div className="mt-1.5">
                  <Link to="/login" className="font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1">
                    Sign in to your existing account <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Two-column layout: Full Name & Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-zinc-900 mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                  }}
                  placeholder="e.g. Sophia Montgomery"
                  className={`w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                    fieldErrors.fullName ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="studentId" className="block text-xs font-semibold text-zinc-900 mb-1">
                Student ID Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    if (fieldErrors.studentId) setFieldErrors({ ...fieldErrors, studentId: '' });
                  }}
                  placeholder="e.g. STU-2026-8842"
                  className={`w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 font-mono transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                    fieldErrors.studentId ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.studentId && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.studentId}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-zinc-900 mb-1">
              University Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="e.g. s.montgomery@university.edu"
                className={`w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                  fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-600'
                }`}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-900 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder="Min. 8 chars"
                  className={`w-full h-10 pl-9 pr-9 text-sm rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                    fieldErrors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-900 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                  placeholder="Repeat password"
                  className={`w-full h-10 pl-9 pr-9 text-sm rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                    fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Honor Code Agreement Checkbox */}
          <div className="pt-0.5">
            <label className="inline-flex items-start gap-2.5 cursor-pointer select-none group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (fieldErrors.agreeTerms) setFieldErrors({ ...fieldErrors, agreeTerms: '' });
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-150 ${
                    agreeTerms
                      ? 'bg-emerald-700 border border-emerald-700 text-white shadow-xs'
                      : 'border border-slate-300 bg-white group-hover:border-emerald-600'
                  }`}
                >
                  {agreeTerms && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the <strong className="text-zinc-900">University Student Code of Conduct</strong> and authorize verification of my Student ID against university records.
              </span>
            </label>
            {fieldErrors.agreeTerms && (
              <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.agreeTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Provisioning Account...</span>
              </div>
            ) : (
              <>
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
              </>
            )}
          </button>
        </form>

        {/* Footer Back Link */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition"
          >
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
