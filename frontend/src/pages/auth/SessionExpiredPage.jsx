import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  Clock,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const SessionExpiredPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-slate-50 overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[440px] w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden relative z-10">

        <div className="h-1.5 bg-emerald-700" />

        <div className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-zinc-800 mx-auto mb-3">
            <Clock className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
            SECURITY PROTOCOL • TIMEOUT
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Session Inactivity Timeout
          </h1>

          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            In accordance with University Cyber-Security Standards for shared campus terminals and student records, your session has automatically expired.
          </p>

          <div className="my-5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center space-x-2 text-zinc-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Campus Security Check</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-500">
              Any unsaved draft documents or pending approvals remain protected in server cache. Please sign back in with your university credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            <span>Re-Authenticate & Sign In</span>
          </button>
        </div>

        <div className="py-2.5 px-6 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          SkyLine Identity Service • Session Reference: ID-TIMEOUT-2026
        </div>

      </div>
    </div>
  );
};

export default SessionExpiredPage;
