import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  ShieldAlert,
  ArrowLeft,
  UserCheck,
  Lock,
  LogOut,
  Sparkles
} from 'lucide-react';

export const UnauthorizedPage = () => {
  const { user, quickSwitchRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentRole = user?.role || location.state?.currentRole || 'GUEST';
  const requiredRoles = location.state?.requiredRoles || ['ADMIN', 'TREASURER'];
  const attemptedPath = location.state?.attemptedPath || 'Restricted Area';

  const handleReturnToDashboard = () => {
    if (currentRole === 'ADMIN') navigate('/admin/dashboard');
    else if (currentRole === 'TREASURER') navigate('/treasurer/dashboard');
    else navigate('/member/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-lg mx-auto w-full bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        {/* Warning Accent Border */}
        <div className="h-2 bg-primary" />

        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-status-error-bg border border-status-error/30 flex items-center justify-center text-status-error mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-ivory-200 text-status-error border border-border mb-2">
            HTTP 403 • ACCESS RESTRICTED
          </span>

          <h1 className="font-serif-academic text-2xl sm:text-3xl font-bold text-text-primary">
            Restricted University Clearance
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-sm mx-auto leading-relaxed">
            Your university account does not possess the institutional permissions required to view this administrative resource.
          </p>

          {/* Context box */}
          <div className="my-6 p-4 rounded-lg bg-ivory-100 border border-border text-left text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-text-muted">Target Path:</span>
              <span className="font-mono text-primary font-semibold truncate max-w-[200px]">{attemptedPath}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-text-muted">Your Current Role:</span>
              <span className="font-semibold text-text-primary">{currentRole}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Required Authority:</span>
              <span className="font-semibold text-accent font-mono">{requiredRoles.join(' OR ')}</span>
            </div>
          </div>

          {/* Demo Role Switcher helper for judges */}
          <div className="mb-6 p-3 rounded bg-accent-light/50 border border-accent-300 text-xs text-left">
            <div className="flex items-center space-x-1.5 font-semibold text-accent mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Testing Clearance as a Judge?</span>
            </div>
            <p className="text-[11px] text-text-secondary mb-2">
              Elevate your account role immediately to view administrative modules:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  quickSwitchRole('ADMIN');
                  navigate('/admin/dashboard');
                }}
                className="py-1.5 px-2 bg-surface hover:bg-ivory-200 border border-border rounded text-[11px] font-semibold text-primary"
              >
                Switch to Club Admin →
              </button>
              <button
                type="button"
                onClick={() => {
                  quickSwitchRole('TREASURER');
                  navigate('/treasurer/dashboard');
                }}
                className="py-1.5 px-2 bg-surface hover:bg-ivory-200 border border-border rounded text-[11px] font-semibold text-accent"
              >
                Switch to Treasurer →
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="w-full py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Return to Authorized Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2 px-4 rounded bg-surface hover:bg-ivory-100 text-text-secondary hover:text-status-error text-xs font-medium border border-border transition flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out to Use Another Account</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UnauthorizedPage;
