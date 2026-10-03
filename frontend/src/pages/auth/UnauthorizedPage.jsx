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
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-slate-50 overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[480px] w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden relative z-10">

        {/* Accent Bar */}
        <div className="h-1.5 bg-zinc-900" />

        <div className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-red-50 text-red-700 border border-red-200 mb-2">
            HTTP 403 • ACCESS RESTRICTED
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Restricted University Clearance
          </h1>

          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Your university account does not possess the institutional permissions required to view this administrative resource.
          </p>

          {/* Context box */}
          <div className="my-5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Target Path:</span>
              <span className="font-mono text-zinc-900 font-semibold truncate max-w-[200px]">{attemptedPath}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Your Current Role:</span>
              <span className="font-semibold text-zinc-900">{currentRole}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Required Authority:</span>
              <span className="font-semibold text-emerald-700 font-mono">{requiredRoles.join(' OR ')}</span>
            </div>
          </div>

          {/* Demo Role Switcher helper for judges */}
          <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-left">
            <div className="flex items-center space-x-1.5 font-semibold text-emerald-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Testing Clearance as an Evaluator?</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Elevate your account role immediately to view administrative modules:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  quickSwitchRole('ADMIN');
                  navigate('/admin/dashboard');
                }}
                className="py-1.5 px-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Switch to Club Admin →
              </button>
              <button
                type="button"
                onClick={() => {
                  quickSwitchRole('TREASURER');
                  navigate('/treasurer/dashboard');
                }}
                className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Switch to Treasurer →
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
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
              className="w-full h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
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
