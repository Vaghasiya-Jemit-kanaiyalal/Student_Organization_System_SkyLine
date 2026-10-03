import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  ShieldAlert,
  Ticket as TicketIcon,
  Mail,
  Hash,
  ArrowLeft,
  Building,
  Sparkles,
  ExternalLink,
  Printer
} from 'lucide-react';
import { ticketsApi } from '../../services/api';

export const TicketVerificationPage = () => {
  const { ticket_uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verifyTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ticketsApi.verifyPublicTicket(ticket_uuid);
        if (isMounted) {
          setData(response);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to verify ticket:', err);
          setError(err.response?.data?.message || 'Unable to connect to verification server.');
          setData({ valid: false, message: 'Invalid Ticket' });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (ticket_uuid) {
      verifyTicket();
    } else {
      setLoading(false);
      setData({ valid: false, message: 'Missing Ticket Identifier' });
    }

    return () => {
      isMounted = false;
    };
  }, [ticket_uuid]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <TicketIcon className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                SKYLINE
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Registry Verified
                </span>
              </h1>
              <p className="text-xs text-slate-400">Dynamic Ticket Verification System</p>
            </div>
          </div>

          <Link
            to="/login"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-500 bg-slate-800/40 transition flex items-center gap-1.5"
          >
            Portal Login
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {loading ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Verifying Ticket Authenticity...</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Connecting to Skyline cryptographic registry and validating gate admission status.
            </p>
          </div>
        ) : data && data.valid ? (
          /* ========================================================= */
          /* VALID TICKET CARD                                         */
          /* ========================================================= */
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden backdrop-blur-xl">
            {/* Top Emerald Badge Header */}
            <div className="bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent p-6 border-b border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  VALID TICKET
                </div>

                <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
                  {data.ticket_id || 'TCK-CONFIRMED'}
                </span>
              </div>

              {/* Event Name & Category */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 bg-slate-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  {data.event_category || 'University Event'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight leading-snug">
                  {data.event_name}
                </h2>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Event Date</p>
                    <p className="text-sm font-semibold text-slate-100 mt-0.5">{data.event_date}</p>
                    {data.event_time && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {data.event_time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Venue</p>
                    <p className="text-sm font-semibold text-slate-100 mt-0.5">{data.venue}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Main Campus</p>
                  </div>
                </div>
              </div>

              {/* Attendee Details Card */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    Attendee Information
                  </span>
                  <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/30">
                    ID: {data.student_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 text-[11px]">Participant Name</p>
                    <p className="text-sm font-bold text-white capitalize mt-0.5">{data.student_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">University Email</p>
                    <p className="text-slate-200 truncate mt-0.5 font-mono text-[11px]">{data.university_email}</p>
                  </div>
                </div>
              </div>

              {/* Admission Tier & Seat */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Ticket Type</p>
                  <p className="font-semibold text-emerald-300 mt-0.5">{data.ticket_type}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Assigned Seat</p>
                  <p className="font-semibold text-slate-100 mt-0.5 truncate">{data.seat || data.seat_number}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Admission Status</p>
                  <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {data.status || 'Confirmed'}
                  </p>
                </div>
              </div>

              {/* Cryptographic Verification Meta */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400">
                <span className="font-mono">
                  Ref: {data.verification_id || `VERIFY-${ticket_uuid?.slice(0, 8)?.toUpperCase()}`}
                </span>
                <span>
                  {data.purchase_date ? `Purchased: ${data.purchase_date}` : 'Verified via Skyline Gateway'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Confirmation
              </button>

              <Link
                to="/member/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* INVALID TICKET CARD                                       */
          /* ========================================================= */
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl shadow-2xl shadow-rose-500/10 overflow-hidden backdrop-blur-xl">
            {/* Top Red Badge Header */}
            <div className="bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent p-6 sm:p-8 border-b border-rose-500/20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
                <XCircle className="w-4 h-4 text-rose-400" />
                INVALID TICKET
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Admission Verification Failed
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                {error || data?.message || 'This QR ticket could not be validated in the Skyline secure admissions database.'}
              </p>
            </div>

            {/* Error explanations */}
            <div className="p-6 space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Possible Reasons:
                </p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px] pl-1">
                  <li>The ticket has been cancelled or refunded by the organizer.</li>
                  <li>The QR code identifier is malformed or has expired.</li>
                  <li>The ticket does not exist in the official university database.</li>
                  <li>The admission pass was transferred to another student.</li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                If you believe this is an error, please present your order confirmation email or contact the event organizers at the admission gate.
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-800 flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Return to Login
              </Link>
              <Link
                to="/member/dashboard"
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-rose-500/20"
              >
                View My Tickets
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* University Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-6 px-4 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-400">
          Skyline Student Organization & Admission Verification System
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Cryptographically verified passes • Division of Student Affairs
        </p>
      </footer>
    </div>
  );
};

export default TicketVerificationPage;
