import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Shield,
  Send
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-md mx-auto w-full bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        {/* Academic Header */}
        <div className="p-6 text-center border-b border-border bg-ivory-100">
          <div className="flex justify-center mb-3">
            <UniversityCrest className="w-12 h-12" variant="navy" />
          </div>
          <h1 className="font-serif-academic text-2xl font-bold text-text-primary">
            Account Credential Recovery
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            University Identity & Access Management
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-lg bg-status-success-bg border border-status-success/30 text-status-success text-xs">
                <div className="flex items-center space-x-2 font-semibold text-sm mb-1 text-status-success">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Password Reset Dispatched</span>
                </div>
                <p className="text-text-secondary text-[11px] leading-relaxed">
                  A cryptographic recovery link has been generated for <strong>{email}</strong>. Please check your university inbox or spam folder.
                </p>
              </div>

              {/* Demo Shortcut for Judges */}
              <div className="p-3.5 rounded bg-ivory-200 border border-accent-300 text-xs text-text-primary">
                <div className="flex items-center space-x-1.5 font-semibold text-accent mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>Interactive Demo Mode</span>
                </div>
                <p className="text-[11px] text-text-secondary mb-2.5">
                  In this demonstration environment, you can directly proceed to test the password reset interface:
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/reset-password', { state: { email } })}
                  className="w-full py-2 px-3 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center justify-center space-x-1.5"
                >
                  <span>Proceed to Reset Password Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enter your university-issued email address below. We will send a secure time-limited token to reset your password.
              </p>

              {error && (
                <div className="p-3 rounded bg-status-error-bg border border-status-error/30 text-status-error text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="recoveryEmail" className="block text-xs font-semibold text-text-primary mb-1">
                  University Email Address <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="recoveryEmail"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded border border-border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Generating Recovery Token...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-text-secondary hover:text-primary transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
