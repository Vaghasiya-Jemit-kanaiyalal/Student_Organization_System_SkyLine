import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Users,
  Sparkles,
  Check
} from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  const redirectByRole = React.useCallback((role) => {
    const destination = location.state?.from?.pathname;
    const cleanRole = String(role || '').toUpperCase();

    // Validate that destination belongs to the user's role (avoid stale /unauthorized or /login)
    if (destination && !destination.includes('/login') && !destination.includes('/unauthorized')) {
      if (cleanRole === 'TREASURER' && destination.startsWith('/treasurer')) {
        navigate(destination, { replace: true });
        return;
      }
      if (cleanRole === 'ADMIN' && destination.startsWith('/admin')) {
        navigate(destination, { replace: true });
        return;
      }
      if ((cleanRole === 'MEMBER' || cleanRole === 'STUDENT') && (destination.startsWith('/member') || destination.startsWith('/student'))) {
        navigate(destination, { replace: true });
        return;
      }
    }

    // Role-specific primary destinations
    switch (cleanRole) {
      case 'ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'TREASURER':
        navigate('/treasurer/dashboard', { replace: true });
        break;
      case 'MEMBER':
      case 'STUDENT':
      default:
        navigate('/member/dashboard', { replace: true });
        break;
    }
  }, [location.state?.from?.pathname, navigate]);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectByRole(user.role);
    }
  }, [isAuthenticated, user, redirectByRole]);

  const validateForm = () => {
    const errors = {};
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        redirectByRole(result.role);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo auto-fill convenience for Hackathon judges & testers
  const handleAutoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-slate-50 overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-emerald-500/5 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-emerald-50/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[380px] h-[380px] bg-slate-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Quick Demo Helper Pill */}
      <div className="mb-4 flex flex-col items-center z-10">
        <button
          type="button"
          onClick={() => setShowDemoDrawer(!showDemoDrawer)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Demo Accounts (1-Click Fill)</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-mono">
            {showDemoDrawer ? 'Hide' : 'Quick Test'}
          </span>
        </button>

        {showDemoDrawer && (
          <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded-lg shadow-lg flex flex-wrap items-center justify-center gap-2 animate-fadeIn max-w-md">
            <button
              type="button"
              onClick={() => handleAutoFill('yug@gmail.com', 'Yug@123')}
              className="px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Student (Yug)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('student@university.edu', 'password123')}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-zinc-800 text-[11px] font-medium transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span>Student Member</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('admin@university.edu', 'password123')}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-[11px] font-medium transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Club Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('amit@treasurer.gmail.com', 'Treas@123')}
              className="px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Treasurer (Amit)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-[440px] bg-white rounded-xl border border-slate-200 shadow-xl p-6 sm:p-8 relative z-10">

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-2">
            <UniversityCrest
              className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-700"
              variant="skyline"
              color="#059669"
            />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight">
            SkyLine
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Student Organization Portal
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* University Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-zinc-900 mb-1"
            >
              University Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="e.g. yug@gmail.com or student@university.edu"
                className={`w-full h-10 pl-9 pr-3 text-xs rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                  fieldErrors.email
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-200 focus:border-emerald-600'
                }`}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-zinc-900"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
                placeholder="Enter your password"
                className={`w-full h-10 pl-9 pr-9 text-xs rounded-lg border bg-white text-zinc-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-600/10 ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-200 focus:border-emerald-600'
                }`}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Keep me signed in Checkbox */}
          <div className="pt-0.5">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    rememberMe
                      ? 'bg-emerald-700 border border-emerald-700 text-white shadow-xs'
                      : 'border border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {rememberMe && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-600">
                Keep me signed in on this device
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider OR */}
        <div className="relative flex items-center justify-center my-5">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            OR
          </span>
        </div>

        {/* Bottom Banner: New student joining a club? */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-900 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-zinc-900 leading-tight truncate">
                New student joining a club?
              </p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                Create a member account to get started.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 bg-zinc-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 shadow-2xs"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
