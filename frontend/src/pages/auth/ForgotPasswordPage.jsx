import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered university email.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-[#f0f4f9] overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-blue-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[380px] h-[380px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-[460px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#e4ebf5] shadow-[0_20px_50px_-15px_rgba(20,50,90,0.07),0_1px_3px_rgba(0,0,0,0.02)] p-7 sm:p-9 md:p-10 relative z-10">

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
            Reset Password
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-emerald-700 text-[11.5px] leading-relaxed">
                A secure password recovery link has been sent to <strong>{email}</strong>.
              </p>
            </div>

            {/* Demo interactive shortcut for testing */}
            <div className="p-3.5 rounded-xl bg-[#f2f6fc] border border-[#e1eaf5] text-xs text-[#334155]">
              <div className="flex items-center gap-1.5 font-semibold text-[#1d64e0] mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Interactive Demo Shortcut</span>
              </div>
              <p className="text-[11px] text-[#64748b] mb-3">
                In this preview environment, proceed directly to the reset password page:
              </p>
              <button
                type="button"
                onClick={() => navigate('/reset-password', { state: { email } })}
                className="w-full h-10 rounded-[10px] bg-[#1d64e0] hover:bg-[#1855c3] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Set New Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-[#1d64e0] hover:text-[#1855c3] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-xs sm:text-[13px] text-[#64748b] leading-relaxed">
              Enter your registered university email address. We will send a secure link to reset your account password.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="recoveryEmail" className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5">
                University Email Address <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Mail className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </div>
                <input
                  id="recoveryEmail"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your university email"
                  className={`w-full h-11 pl-10 pr-3.5 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                    error ? 'border-red-400 focus:border-red-500' : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                  }`}
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  <span>Sending Instructions...</span>
                </div>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
                </>
              )}
            </button>

            <div className="pt-3 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-[#64748b] hover:text-[#1d64e0] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
