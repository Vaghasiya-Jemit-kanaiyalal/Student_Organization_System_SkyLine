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
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-[#f0f4f9] overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-blue-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[380px] h-[380px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Quick Demo Helper Pill for Judges */}
      <div className="mb-4 flex flex-col items-center z-10">
        <button
          type="button"
          onClick={() => setShowDemoDrawer(!showDemoDrawer)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-xs transition-all"
        >
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Demo Accounts (1-Click Fill)</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-mono">
            {showDemoDrawer ? 'Hide' : 'Quick Test'}
          </span>
        </button>

        {showDemoDrawer && (
          <div className="mt-2.5 p-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-2 animate-fadeIn max-w-md">
            <button
              type="button"
              onClick={() => handleAutoFill('student@university.edu', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-[11px] font-medium transition text-left flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Student Member</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('admin@university.edu', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-[11px] font-medium transition text-left flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Club Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('treasurer@treasurer.gmail.com', 'TreasurerPassword123!')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-[11px] font-medium transition text-left flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Club Treasurer</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-[460px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#e4ebf5] shadow-[0_20px_50px_-15px_rgba(20,50,90,0.07),0_1px_3px_rgba(0,0,0,0.02)] p-7 sm:p-9 md:p-10 relative z-10">

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center mb-7 sm:mb-8">
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
            Organization Portal
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5" noValidate>
          {/* University Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-[13px] font-semibold text-[#0f172a] mb-1.5"
            >
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
                placeholder="Enter your university email"
                className={`w-full h-11 pl-10 pr-3.5 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                  fieldErrors.email
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                }`}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-[11px] mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs sm:text-[13px] font-semibold text-[#0f172a]"
              >
                Password <span className="text-[#ef4444]">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs sm:text-[13px] font-medium text-[#1d64e0] hover:text-[#1550b8] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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
                placeholder="Enter your password"
                className={`w-full h-11 pl-10 pr-10 text-sm rounded-[10px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:outline-none focus:ring-4 focus:ring-[#1d64e0]/10 ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#dbe2ea] focus:border-[#1d64e0]'
                }`}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.8} />
                ) : (
                  <Eye className="w-[18px] h-[18px]" strokeWidth={1.8} />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-600 text-[11px] mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Keep me signed in Checkbox */}
          <div className="pt-0.5">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-150 ${
                    rememberMe
                      ? 'bg-[#1d64e0] border border-[#1d64e0] text-white shadow-xs'
                      : 'border border-[#cbd5e1] bg-white group-hover:border-[#94a3b8]'
                  }`}
                >
                  {rememberMe && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-xs sm:text-[13px] text-[#334155] font-normal">
                Keep me signed in on this device
              </span>
            </label>
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
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
              </>
            )}
          </button>
        </form>

        {/* Divider OR */}
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-[#e5e9f0]" />
          <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
            OR
          </span>
        </div>

        {/* Bottom Banner: New student joining a club? */}
        <div className="bg-[#f2f6fc] border border-[#e1eaf5] rounded-[14px] p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#dbe8fa] flex items-center justify-center text-[#1d64e0] flex-shrink-0">
              <Users className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs sm:text-[12.5px] font-semibold text-[#0f172a] leading-tight truncate">
                New student joining a club?
              </p>
              <p className="text-[11px] text-[#64748b] leading-tight mt-0.5 truncate">
                Create a member account to get started.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 border border-[#1d64e0] bg-white hover:bg-[#1d64e0] text-[#1d64e0] hover:text-white px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1 shadow-xs"
          >
            <span>Create Member Account</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
