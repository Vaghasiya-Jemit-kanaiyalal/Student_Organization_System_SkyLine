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
    } else if (!/^STU-[0-9]{4}-[0-9]{3,5}$/i.test(studentId.trim()) && studentId.trim().length < 5) {
      errors.studentId = 'Enter standard student ID (e.g. STU-2026-1234).';
    }

    if (!email.trim()) {
      errors.email = 'University email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid university email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
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
      }
    } catch {
      setErrorMessage('A registration system error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-[#f0f4f9] overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-blue-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[380px] h-[380px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Registration Card */}
      <div className="w-full max-w-[520px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#e4ebf5] shadow-[0_20px_50px_-15px_rgba(20,50,90,0.07),0_1px_3px_rgba(0,0,0,0.02)] p-7 sm:p-9 md:p-10 relative z-10">

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-2.5">
            <UniversityCrest
              className="w-16 h-16 sm:w-[72px] sm:h-[72px] text-[#1d64e0]"
              variant="skyline"
              color="#1d64e0"
            />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f172a] tracking-tight leading-tight">
            SkyLine
          </h1>
          <p className="text-sm sm:text-[15px] font-medium text-[#64748b] mt-0.5">
            Create Member Account
          </p>
        </div>

        {/* Info Callout */}
        <div className="mb-5 p-3 rounded-xl bg-[#f2f6fc] border border-[#e1eaf5] text-xs text-[#334155] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#1d64e0] flex-shrink-0 mt-0.5" />
          <p className="text-[11.5px] leading-relaxed">
            Member accounts are for university students joining campus organizations. Club Admins & Treasurers are designated by faculty.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Two-column layout: Full Name & Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5">
                Full Legal Name <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <User className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                  className={`w-full h-11 pl-10 pr-3.5 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                    fieldErrors.fullName ? 'border-red-400 focus:border-red-500' : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="studentId" className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5">
                Student ID Number <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Hash className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                  className={`w-full h-11 pl-10 pr-3.5 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] font-mono transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                    fieldErrors.studentId ? 'border-red-400 focus:border-red-500' : 'border-[#dbe2ea] focus:border-[#1d64e0]'
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
            <label htmlFor="email" className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5">
              University Email Address <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                <Mail className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                className={`w-full h-11 pl-10 pr-3.5 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                  fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                }`}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="password" className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5">
                Password <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                  className={`w-full h-11 pl-10 pr-10 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                    fieldErrors.password ? 'border-red-400 focus:border-red-500' : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5">
                Confirm Password <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                  className={`w-full h-11 pl-10 pr-10 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                    fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 text-[11px] mt-1 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Honor Code Agreement Checkbox */}
          <div className="pt-1">
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
                  className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-150 ${
                    agreeTerms
                      ? 'bg-[#1d64e0] border border-[#1d64e0] text-white shadow-xs'
                      : 'border border-[#cbd5e1] bg-white group-hover:border-[#94a3b8]'
                  }`}
                >
                  {agreeTerms && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-xs text-[#334155] leading-relaxed">
                I agree to the <strong className="text-[#0f172a]">University Student Code of Conduct</strong> and authorize verification of my Student ID against university records.
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
            className="w-full h-11 sm:h-12 rounded-[10px] bg-[#1d64e0] hover:bg-[#1855c3] active:bg-[#1447a3] text-white text-sm sm:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(29,100,224,0.28)] hover:shadow-[0_6px_18px_rgba(29,100,224,0.38)] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
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
        <div className="mt-6 pt-5 border-t border-[#e5e9f0] text-center text-xs text-[#64748b]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#1d64e0] hover:text-[#1855c3] hover:underline transition"
          >
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
