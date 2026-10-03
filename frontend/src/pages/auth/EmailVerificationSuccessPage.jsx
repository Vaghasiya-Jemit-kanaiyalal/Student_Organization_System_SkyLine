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
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative bg-[#f0f4f9] overflow-x-hidden font-sans">
      {/* Soft atmospheric ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-blue-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-10 w-[380px] h-[380px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-[460px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#e4ebf5] shadow-[0_20px_50px_-15px_rgba(20,50,90,0.07),0_1px_3px_rgba(0,0,0,0.02)] p-7 sm:p-9 md:p-10 relative z-10 text-center">

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center mb-6">
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

        {/* Success badge */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Account Created Successfully</span>
        </div>

        <h2 className="text-xl font-bold text-[#0f172a]">
          Welcome, {studentName}!
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Your student profile has been created and verified.
        </p>

        {/* Details Snapshot Card */}
        <div className="my-5 p-4 rounded-xl bg-[#f2f6fc] border border-[#e1eaf5] text-left text-xs space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-[#e1eaf5]">
            <span className="text-[#64748b]">Student Name:</span>
            <span className="font-semibold text-[#0f172a]">{studentName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-[#e1eaf5]">
            <span className="text-[#64748b]">Student ID:</span>
            <span className="font-mono font-semibold text-[#1d64e0]">{studentId}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-[#e1eaf5]">
            <span className="text-[#64748b]">Email Address:</span>
            <span className="font-medium text-[#0f172a] truncate max-w-[200px]">{email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b]">Assigned Role:</span>
            <span className="font-semibold text-emerald-600">Student Member</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full h-11 sm:h-12 rounded-[10px] bg-[#1d64e0] hover:bg-[#1855c3] active:bg-[#1447a3] text-white text-sm sm:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(29,100,224,0.28)] hover:shadow-[0_6px_18px_rgba(29,100,224,0.38)] transition-all duration-150 cursor-pointer"
        >
          <span>Sign In to Portal</span>
          <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.2} />
        </button>

      </div>
    </div>
  );
};

export default EmailVerificationSuccessPage;
