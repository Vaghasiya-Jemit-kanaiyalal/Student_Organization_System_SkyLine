import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const EmailVerificationSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const studentName = location.state?.studentName || 'Student Member';
  const studentId = location.state?.studentId || 'STU-2026-8842';
  const email = location.state?.email || 'student@university.edu';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-slate-50 overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[320px] h-[320px] bg-slate-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white rounded-xl border border-slate-200 shadow-xl p-6 sm:p-8 relative z-10 text-center">

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center mb-5">
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
            Organization Portal
          </p>
        </div>

        {/* Success badge */}
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Account Created Successfully</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
          Welcome, {studentName}!
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Your student profile has been created and verified.
        </p>

        {/* Details Snapshot Card */}
        <div className="my-5 p-4 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-semibold text-zinc-900">{studentName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Student ID:</span>
            <span className="font-mono font-semibold text-emerald-700">{studentId}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Email Address:</span>
            <span className="font-medium text-zinc-900 truncate max-w-[200px]">{email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Assigned Role:</span>
            <span className="font-semibold text-emerald-700">Student Member</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span>Sign In to Portal</span>
          <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
        </button>

      </div>
    </div>
  );
};

export default EmailVerificationSuccessPage;
