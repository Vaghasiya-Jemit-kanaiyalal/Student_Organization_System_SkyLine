import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { authApi } from '../../services/api';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const ForgotPasswordPage = () => {
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
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch {
      // Still show the generic success to prevent email enumeration and network leak
      setIsSubmitted(true);
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

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white rounded-xl border border-slate-200 shadow-xl p-6 sm:p-8 relative z-10">

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
            Reset Password
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-semibold text-sm mb-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>Password Reset Link Dispatched</span>
              </div>
              <p className="text-emerald-800 text-xs leading-relaxed">
                If an account exists with <strong>{email}</strong>, you will receive an email with instructions to reset your password shortly.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security Notice</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-500">
                The reset link is time-sensitive. If you do not see the email within a few minutes, check your spam or junk folder.
              </p>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered university email address. We will send a secure link to reset your account password.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="recoveryEmail" className="block text-xs font-semibold text-zinc-900 mb-1">
                University Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" strokeWidth={1.8} />
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
                  className={`w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                    error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  <span>Sending Instructions...</span>
                </div>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
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
