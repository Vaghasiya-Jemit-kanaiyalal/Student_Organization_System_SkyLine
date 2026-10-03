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
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users,
  CalendarCheck,
  Sparkles,
  Info
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

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectByRole(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectByRole = (role) => {
    const destination = location.state?.from?.pathname;
    if (destination && !destination.includes('/login')) {
      navigate(destination, { replace: true });
      return;
    }

    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'TREASURER':
        navigate('/treasurer/dashboard', { replace: true });
        break;
      case 'MEMBER':
      default:
        navigate('/member/dashboard', { replace: true });
        break;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'University email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email format (e.g. name@university.edu).';
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

  // Demo auto-fill convenience for Hackathon judges
  const handleAutoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-border bg-surface shadow-card overflow-hidden">

        {/* Left Side: Classical University Academic Identity */}
        <div className="lg:col-span-5 bg-gradient-to-b from-primary to-primary-hover text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle watermark crest in background */}
          <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
            <UniversityCrest className="w-80 h-80" variant="white" />
          </div>

          <div>
            {/* Campus Crest & Name */}
            <div className="flex items-center space-x-3 mb-8">
              <UniversityCrest className="w-12 h-12" variant="gold" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
                  ConnectU
                </h1>
                <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                  University Student Affairs
                </p>
              </div>
            </div>

            {/* Platform Description */}
            <div className="space-y-4 mb-8">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium bg-primary-800/80 text-accent border border-accent/30">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-accent" />
                Campus Governance & Society Hub
              </span>

              <h2 className="text-2xl sm:text-3xl text-white font-normal leading-snug">
                Where student leadership meets academic tradition.
              </h2>

              <p className="text-sm text-primary-100 font-light leading-relaxed">
                ConnectU is the premier administration platform for university clubs, societies, student government, and athletic councils.
              </p>
            </div>

            {/* University Key Highlights */}
            <div className="space-y-3 pt-2 border-t border-primary-500/40">
              <div className="flex items-start space-x-3 text-xs text-primary-100">
                <Users className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Role-Based Access:</strong> Tailored workspaces for Members, Club Organizers, and Fiscal Treasurers.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-primary-100">
                <CalendarCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Campus Events & Tickets:</strong> Real-time RSVP, digital QR admissions, and volunteer tracking.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-primary-100">
                <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Audited Financials:</strong> Institutional ledger with reimbursement approvals and grant allocations.</span>
              </div>
            </div>
          </div>

          {/* Academic Trust Seal at bottom */}
          <div className="mt-8 pt-6 border-t border-primary-500/30 flex items-center justify-between text-[11px] text-primary-200">
            <span>Official University System</span>
            <span className="font-mono text-accent">Est. 2026</span>
          </div>
        </div>

        {/* Right Side: Clean SaaS Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-surface">

          {/* Quick Demo Credentials Bar for Judges */}
          <div className="mb-6 p-3.5 bg-ivory-100 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Quick Demo Accounts (1-Click Fill)
              </span>
              <span className="text-[10px] text-accent font-medium">Odoo Hackathon Demo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAutoFill('student@university.edu', 'password123')}
                className="text-left px-2.5 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-[11px] transition-campus group"
              >
                <div className="font-semibold text-primary group-hover:text-primary-hover flex items-center justify-between">
                  <span>Student Member</span>
                  <span className="text-[10px] text-text-muted">Fill</span>
                </div>
                <div className="text-[10px] text-text-muted truncate">student@university.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('admin@university.edu', 'password123')}
                className="text-left px-2.5 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-[11px] transition-campus group"
              >
                <div className="font-semibold text-primary group-hover:text-primary-hover flex items-center justify-between">
                  <span>Club Admin</span>
                  <span className="text-[10px] text-text-muted">Fill</span>
                </div>
                <div className="text-[10px] text-text-muted truncate">admin@university.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('treasurer@university.edu', 'password123')}
                className="text-left px-2.5 py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-[11px] transition-campus group"
              >
                <div className="font-semibold text-primary group-hover:text-primary-hover flex items-center justify-between">
                  <span>Club Treasurer</span>
                  <span className="text-[10px] text-text-muted">Fill</span>
                </div>
                <div className="text-[10px] text-text-muted truncate">treasurer@university.edu</div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-normal text-text-primary">
              Portal Sign In
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Enter your credentials to access your organization dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded bg-status-error-bg border border-status-error/30 text-status-error text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary mb-1.5">
                University Email Address <span className="text-status-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
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
                  placeholder="e.g. s.montgomery@university.edu"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.email
                      ? 'border-status-error focus:border-status-error'
                      : 'border-border focus:border-primary'
                  }`}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-status-error text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-text-primary">
                  Password <span className="text-status-error">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-accent hover:text-accent-hover font-medium transition-campus"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
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
                  placeholder="Enter your security password"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.password
                      ? 'border-status-error focus:border-status-error'
                      : 'border-border focus:border-primary'
                  }`}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-status-error text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 transition"
                />
                <span className="text-xs text-text-secondary">Keep me signed in on this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Organization Portal</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Member Registration & Role Guidance */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">
                Are you a new student joining a club?
              </span>
              <Link
                to="/register"
                className="font-semibold text-primary hover:text-primary-hover underline underline-offset-4 transition"
              >
                Create Member Account →
              </Link>
            </div>

            {/* Administrative Role Note */}
            <div className="mt-4 p-2.5 rounded bg-ivory-100 border border-border text-[11px] text-text-muted flex items-start space-x-2">
              <Info className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              <span>
                <strong>Administrative Access Note:</strong> Club Admin credentials are authenticated by Council Faculty. Club Treasurers are appointed and created directly by Club Admins.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
