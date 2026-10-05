import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from './UniversityCrest';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUp,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const Footer = () => {
  const { user, isAuthenticated } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardPath = (tab = 'overview') => {
    if (!isAuthenticated || !user) return '/login';
    const role = String(user.role || '').toUpperCase();
    if (role === 'ADMIN') return `/admin/dashboard?tab=${tab}`;
    if (role === 'TREASURER') return `/treasurer/dashboard?tab=${tab}`;
    return `/member/dashboard?tab=${tab}`;
  };

  return (
    <footer className="mt-auto bg-[#0B0F17] text-zinc-400 border-t border-zinc-800/80 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Banner Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand & Organization Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner flex items-center justify-center">
                <UniversityCrest className="w-8 h-8 text-white" variant="white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    Skyline
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Official
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium tracking-wide">
                  Student Organization Management System
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              The premier platform for student life, university club governance, digital ticketing,
              and transparent institutional finance. Built for excellence in campus administration.
            </p>

            {/* Live Operational Status */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-zinc-200">Skyline Core Systems Active</span>
              </div>
              <span className="text-[11px] text-zinc-500">
                Academic Year 2026–2027
              </span>
            </div>
          </div>

          {/* Quick Portals Navigation (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Portals</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to={getDashboardPath('overview')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Student Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getDashboardPath('membership')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Campus Clubs & Chapters</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getDashboardPath('events')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Events & Ticketing</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getDashboardPath('merchandise')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Official Campus Merchandise</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getDashboardPath('volunteer')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Volunteer Network</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Finance (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4">
              Governance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to={isAuthenticated && user?.role === 'TREASURER' ? '/treasurer/dashboard' : getDashboardPath('overview')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Treasury & Ledger</span>
                </Link>
              </li>
              <li>
                <span className="text-zinc-500 cursor-default inline-flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                  <span>Bursar Accounting</span>
                </span>
              </li>
              <li>
                <span className="text-zinc-500 cursor-default inline-flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                  <span>Expense Audit Trails</span>
                </span>
              </li>
              <li>
                <span className="text-zinc-500 cursor-default inline-flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                  <span>Fund Allocation</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Compliance (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4">
              Compliance
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium">FERPA Protected</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-300">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium">256-Bit SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium">Honor Code Verified</span>
              </div>
            </div>
          </div>

        </div>

        {/* Separator */}
        <div className="my-8 border-t border-zinc-800/80" />

        {/* Bottom Bar: Copyright, Compliance, and Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="text-zinc-400 font-medium">
              © 2026 Skyline Student Organization System.
            </p>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <p className="text-zinc-500">
              Division of Student Affairs & Campus Life
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-zinc-400 bg-zinc-900/60 px-2.5 py-1 rounded-md border border-zinc-800 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Institutional Security Verified</span>
            </div>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center space-x-1 text-[11px]"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
