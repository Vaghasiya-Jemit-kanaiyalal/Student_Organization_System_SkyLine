import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { PasswordStrengthMeter, calculateStrength } from '../../components/common/PasswordStrengthMeter';
import {
  User,
  Hash,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  BookOpen,
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

    const strength = calculateStrength(password);
    if (!password) {
      errors.password = 'Password is required.';
    } else if (strength.score < 2) {
      errors.password = 'Password is too weak. Please meet at least 2 security requirements.';
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
        // Navigate to email verification / activation celebration screen
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-2xl mx-auto w-full bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        {/* Academic Header Banner */}
        <div className="bg-gradient-to-r from-primary via-primary-hover to-primary p-6 text-white text-center border-b border-primary-700 relative">
          <div className="flex justify-center mb-3">
            <UniversityCrest className="w-12 h-12" variant="gold" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Student Member Registration
          </h1>
          <p className="text-xs sm:text-sm text-primary-100 mt-1 max-w-md mx-auto">
            Join official university student organizations, access event passes, and register for campus activities.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">

          {/* Role Restriction Notice Alert */}
          <div className="mb-6 p-3.5 bg-ivory-100 border border-accent-300/60 rounded text-xs text-text-secondary flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Member Self-Registration Notice</p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                This portal is exclusively for enrolled students. <strong>Club Admin</strong> accounts are pre-provisioned by Faculty Councils, and <strong>Club Treasurers</strong> are appointed directly by Club Administrators.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded bg-status-error-bg border border-status-error/30 text-status-error text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Grid for Name and Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-text-primary mb-1">
                  Full Legal Name <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <User className="w-4 h-4" />
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
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.fullName ? 'border-status-error' : 'border-border focus:border-primary'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-status-error text-[11px] mt-1">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentId" className="block text-xs font-semibold text-text-primary mb-1">
                  Student ID Number <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Hash className="w-4 h-4" />
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
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.studentId ? 'border-status-error' : 'border-border focus:border-primary'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.studentId && (
                  <p className="text-status-error text-[11px] mt-1">{fieldErrors.studentId}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary mb-1">
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
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.email ? 'border-status-error' : 'border-border focus:border-primary'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-status-error text-[11px] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-text-primary mb-1">
                  Create Password <span className="text-status-error">*</span>
                </label>
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
                    placeholder="Min. 8 characters"
                    className={`w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.password ? 'border-status-error' : 'border-border focus:border-primary'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-status-error text-[11px] mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-primary mb-1">
                  Confirm Password <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
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
                    className={`w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.confirmPassword ? 'border-status-error' : 'border-border focus:border-primary'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-status-error text-[11px] mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* University Honor Code Checkbox */}
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (fieldErrors.agreeTerms) setFieldErrors({ ...fieldErrors, agreeTerms: '' });
                  }}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 mt-0.5"
                />
                <span className="text-xs text-text-secondary leading-relaxed">
                  I agree to abide by the <strong className="text-text-primary">University Student Code of Conduct</strong>, Society Constitution, and authorize verification of my Student ID against the registrar database.
                </span>
              </label>
              {fieldErrors.agreeTerms && (
                <p className="text-status-error text-[11px] mt-1">{fieldErrors.agreeTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Provisioning Student Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Student Member Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-secondary">
            Already possess an active account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-hover underline underline-offset-4">
              Return to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
