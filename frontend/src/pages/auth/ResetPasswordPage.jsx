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
  ArrowRight,
  ShieldCheck
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-md mx-auto w-full bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        {/* Academic Header */}
        <div className="p-6 text-center border-b border-border bg-ivory-100">
          <div className="flex justify-center mb-3">
            <UniversityCrest className="w-12 h-12" variant="navy" />
          </div>
          <h1 className="font-serif-academic text-2xl font-bold text-text-primary">
            Set New Password
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Updating security credentials for <span className="font-mono text-primary font-semibold">{userEmail}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="space-y-5 text-center animate-fadeIn">
              <div className="w-12 h-12 mx-auto rounded-full bg-status-success-bg border border-status-success/30 flex items-center justify-center text-status-success">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif-academic text-xl font-bold text-text-primary">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Your university credentials have been securely refreshed. You may now sign in with your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errorMessage && (
                <div className="p-3 rounded bg-status-error-bg border border-status-error/30 text-status-error text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-text-primary mb-1">
                  New Password <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded border border-border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-xs font-semibold text-text-primary mb-1">
                  Confirm New Password <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded border border-border bg-surface text-text-primary transition-campus placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              </div>

              <PasswordStrengthMeter password={newPassword} />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Updating Security Vault...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    <span>Update University Password</span>
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link
                  to="/login"
                  className="text-xs font-medium text-text-secondary hover:text-primary transition"
                >
                  Cancel and return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
