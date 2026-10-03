import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';

export const EmailVerificationSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const studentName = location.state?.studentName || 'Student Member';
  const studentId = location.state?.studentId || 'STU-2026-8842';
  const email = location.state?.email || 'student@university.edu';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-md mx-auto w-full bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        {/* Top Celebration Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-status-success" />

        <div className="p-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-status-success-bg border-2 border-status-success/40 flex items-center justify-center text-status-success mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-surface p-1 rounded-full shadow-sm">
              <UniversityCrest className="w-6 h-6" variant="gold" />
            </div>
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-success-bg text-status-success border border-status-success/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Registration & Identity Verified
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Welcome to ConnectU
          </h1>

          <p className="text-xs text-text-secondary mt-1">
            Your university student member profile has been ratified.
          </p>

          {/* Academic Profile Snapshot Card */}
          <div className="my-6 p-4 rounded-lg bg-ivory-100 border border-border text-left text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-border/80">
              <span className="text-text-muted">Student Name:</span>
              <span className="font-semibold text-text-primary">{studentName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/80">
              <span className="text-text-muted">Assigned Student ID:</span>
              <span className="font-mono font-semibold text-primary">{studentId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/80">
              <span className="text-text-muted">Directory Email:</span>
              <span className="font-mono text-text-primary">{email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Designated Role:</span>
              <span className="font-semibold text-status-success">Student Member (Active)</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2"
            >
              <span>Sign In to Your Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <p className="text-[11px] text-text-muted">
              Use your registered email and password to log in and join campus clubs.
            </p>
          </div>
        </div>

        {/* Classical footer motto */}
        <div className="py-3 px-6 bg-ivory-200 border-t border-border text-center text-[11px] text-text-muted">
          ConnectU System • Academic Year 2026–2027
        </div>

      </div>
    </div>
  );
};

export default EmailVerificationSuccessPage;
