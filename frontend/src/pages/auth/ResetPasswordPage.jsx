import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { PasswordStrengthMeter, calculateStrength } from '../../components/common/PasswordStrengthMeter';
import { authApi } from '../../services/api';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get('uid') || searchParams.get('uidb64') || '';
  const token = searchParams.get('token') || '';

  const [targetEmail, setTargetEmail] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate the token on mount
  useEffect(() => {
    let isMounted = true;

    const checkToken = async () => {
      if (!uid || !token) {
        if (isMounted) {
          setIsTokenValid(false);
          setTokenError('The password reset link is incomplete or missing required security parameters.');
          setIsValidatingToken(false);
        }
        return;
      }

      try {
        const res = await authApi.validateResetToken(uid, token);
        if (isMounted) {
          if (res.valid) {
            setIsTokenValid(true);
            setTargetEmail(res.email || '');
          } else {
            setIsTokenValid(false);
            setTokenError(res.error || 'The reset link is invalid or has expired.');
          }
        }
      } catch (err) {
        if (isMounted) {
          const detail = err.response?.data?.error || err.response?.data?.details || 'This password reset link is invalid or has expired.';
          setIsTokenValid(false);
          setTokenError(detail);
        }
      } finally {
        if (isMounted) {
          setIsValidatingToken(false);
        }
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    const strength = calculateStrength(newPassword);
    if (strength.score < 2) {
      setErrorMessage('Please choose a stronger password (minimum 8 characters, with letters and numbers).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-type.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({
        uidb64: uid,
        token: token,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || res.message || 'Password update failed. The token may have expired.');
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.details?.new_password) {
        setErrorMessage(Array.isArray(resp.details.new_password) ? resp.details.new_password.join(' ') : resp.details.new_password);
      } else if (resp?.details?.confirm_new_password) {
        setErrorMessage(resp.details.confirm_new_password);
      } else if (resp?.details?.token) {
        setErrorMessage(resp.details.token);
      } else if (resp?.details) {
        setErrorMessage(typeof resp.details === 'string' ? resp.details : 'Failed to update password.');
      } else {
        setErrorMessage('Failed to connect to the authentication server. Please try again.');
      }
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
          {targetEmail && isTokenValid && !isSuccess && (
            <p className="text-xs text-slate-500 mt-1">
              Updating account credentials for <span className="font-semibold text-zinc-900">{targetEmail}</span>
            </p>
          )}
        </div>

        {/* 1. Loading / Token Validation State */}
        {isValidatingToken ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <svg className="animate-spin h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs font-medium text-slate-600">
              Verifying security link...
            </p>
          </div>
        ) : !isTokenValid ? (
          /* 2. Invalid or Expired Token State */
          <div className="space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Invalid or Expired Reset Link
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {tokenError || 'This password reset link is invalid or has already been used. Please request a new link.'}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                to="/forgot-password"
                className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Request New Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          /* 3. Password Reset Success State */
          <div className="space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                Password Reset Successfully
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your credentials have been securely updated. You may now sign in with your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* 4. Reset Password Form */
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span className="leading-relaxed">{errorMessage}</span>
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
                  className="w-full h-10 pl-9 pr-9 text-xs rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 bg-white text-zinc-900 placeholder:text-slate-400 transition-all"
                  disabled={isLoading}
                  autoComplete="new-password"
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
                  className="w-full h-10 pl-9 pr-9 text-xs rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 bg-white text-zinc-900 placeholder:text-slate-400 transition-all"
                  disabled={isLoading}
                  autoComplete="new-password"
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
              className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating Password...</span>
                </div>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
