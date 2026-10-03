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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-md mx-auto w-full bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        <div className="h-2 bg-accent" />

        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-ivory-200 border border-border flex items-center justify-center text-accent mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-ivory-200 text-text-secondary border border-border mb-2">
            SECURITY PROTOCOL • TIMEOUT
          </span>

          <h1 className="font-serif-academic text-2xl font-bold text-text-primary">
            Session Inactivity Timeout
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-sm mx-auto leading-relaxed">
            In accordance with University Cyber-Security Standards for shared campus terminals and student records, your session has automatically expired.
          </p>

          <div className="my-6 p-4 rounded-lg bg-ivory-100 border border-border text-left text-xs space-y-2 text-text-secondary">
            <div className="flex items-center space-x-2 text-text-primary font-semibold">
              <ShieldCheck className="w-4 h-4 text-status-success" />
              <span>Campus Security Check</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Any unsaved draft documents or pending approvals remain protected in server cache. Please sign back in with your university credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-campus flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            <span>Re-Authenticate & Sign In</span>
          </button>
        </div>

        <div className="py-3 px-6 bg-ivory-200 border-t border-border text-center text-[11px] text-text-muted">
          ConnectU Identity Service • Session Reference: ID-TIMEOUT-2026
        </div>

      </div>
    </div>
  );
};

export default SessionExpiredPage;
