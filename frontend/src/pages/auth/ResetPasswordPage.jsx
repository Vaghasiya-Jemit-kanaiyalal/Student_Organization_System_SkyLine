import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { PasswordStrengthMeter, calculateStrength } from '../../components/common/PasswordStrengthMeter';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = location.state?.email || 'student@university.edu';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const strength = calculateStrength(newPassword);
    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (strength.score < 2) {
      setErrorMessage('Please choose a stronger password meeting at least 2 criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(userEmail, newPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Password update failed.');
      }
    } catch {
      setErrorMessage('Failed to update credentials. Please try again.');
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
            Set New Password
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Updating security credentials for <span className="font-semibold text-zinc-900">{userEmail}</span>
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                Password Updated Successfully
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your credentials have been securely refreshed. You can now sign in to your organization dashboard with your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-zinc-900 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Min. 8 characters"
                  className="w-full h-10 pl-9 pr-9 text-sm rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 bg-white text-zinc-900 placeholder:text-slate-400 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-900 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
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
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Repeat new password"
                  className="w-full h-10 pl-9 pr-9 text-sm rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 bg-white text-zinc-900 placeholder:text-slate-400 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={newPassword} />

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
                  <span>Updating Password...</span>
                </div>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition"
              >
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPasswordPage;
