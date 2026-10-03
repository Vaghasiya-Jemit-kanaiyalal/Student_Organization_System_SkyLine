import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ticketsApi, eventsApi } from '../../services/api';
import {
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Calendar,
  Ticket,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const EventQrScannerModal = ({ isOpen, onClose, defaultEventId = null }) => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId || '');
  const [manualToken, setManualToken] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    } else {
      stopScanner();
      setScanResult(null);
      setErrorMessage('');
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      const list = Array.isArray(data) ? data : (data.results || []);
      setEvents(list);
      if (!selectedEventId && list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load events for scanner:', err);
    }
  };

  const startScanner = async () => {
    try {
      setErrorMessage('');
      setScannerActive(true);
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('event-qr-reader');
      }
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const cameraId = cameras[0].id;
        await html5QrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            handleVerifyToken(decodedText);
          },
          (errorMessage) => {
            // scan failure callback (ignored during normal scanning)
          }
        );
      } else {
        setErrorMessage('No camera found on this device. You can enter the QR token manually below.');
        setScannerActive(false);
      }
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setErrorMessage('Could not access camera. Please allow camera permissions or enter QR token manually.');
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setScannerActive(false);
      }).catch(err => console.error(err));
    } else {
      setScannerActive(false);
    }
  };

  const handleVerifyToken = async (tokenToVerify) => {
    const token = (tokenToVerify || manualToken).trim();
    if (!token) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const result = await ticketsApi.verifyQr(token, selectedEventId);
      setScanResult(result);
    } catch (err) {
      console.error('Verification request failed:', err);
      setErrorMessage(err.response?.data?.error || 'Verification server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!scanResult?.ticket?.id && !scanResult?.ticket_id) return;
    const ticketId = scanResult.ticket?.ticket_id || scanResult.ticket?.id || scanResult.ticket_id;
    setCheckingIn(true);
    try {
      const res = await ticketsApi.checkIn(ticketId);
      setScanResult({
        ...scanResult,
        verification_status: 'ALREADY_CHECKED_IN',
        title: 'CHECK-IN CONFIRMED',
        message: `Successfully checked in ${res.ticket?.student_name || 'Participant'}.`,
        ticket: res.ticket,
        original_check_in_time: 'Just now'
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Gate Entry & Ticket Verification Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Scan attendee QR code or verify ticket ID to grant event admission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Active Event Selector (Enforces rule: prevents ticket for Event A accepted at Event B) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Scanning for Event:</span>
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setScanResult(null);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} • {ev.date} ({ev.venue || ev.location || 'Campus'})
                </option>
              ))}
            </select>
          </div>

          {/* Camera Scanner View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Camera Feed</span>
              {!scannerActive ? (
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera Scanner</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            <div
              id="event-qr-reader"
              className={`w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 ${
                scannerActive ? 'min-h-[260px]' : 'h-24 flex items-center justify-center text-slate-400 text-xs'
              }`}
            >
              {!scannerActive && <span>Camera is stopped. Click Start Camera or enter token below.</span>}
            </div>
          </div>

          {/* Manual Input Alternative */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Manual QR Token / Ticket ID:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SKYLINE-TICKET:uuid or TCK-2026-XXXX"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyToken()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                disabled={loading || !manualToken.trim()}
                onClick={() => handleVerifyToken()}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Verify</span>
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verification Result Card */}
          {scanResult && (
            <div className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
              scanResult.verification_status === 'VALID'
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : scanResult.verification_status === 'ALREADY_CHECKED_IN'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}>
              {/* Status Header */}
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <div className="flex items-center gap-2">
                  {scanResult.verification_status === 'VALID' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {scanResult.verification_status === 'ALREADY_CHECKED_IN' && <Clock className="w-5 h-5 text-amber-600" />}
                  {scanResult.verification_status !== 'VALID' && scanResult.verification_status !== 'ALREADY_CHECKED_IN' && (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <h3 className="text-sm font-bold tracking-tight uppercase">
                    {scanResult.title || scanResult.verification_status}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 border border-black/10">
                  {scanResult.verification_status}
                </span>
              </div>

              {/* Message text */}
              <p className="text-xs">{scanResult.message}</p>

              {/* Ticket Details breakdown */}
              {scanResult.ticket && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 p-3 rounded-lg border border-black/10">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Participant:</span>
                    <strong className="text-slate-900">{scanResult.participant || scanResult.ticket.student_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ticket ID:</span>
                    <strong className="text-slate-900 font-mono">{scanResult.ticket_id || scanResult.ticket.ticket_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Event:</span>
                    <strong className="text-slate-900">{scanResult.event || scanResult.ticket.eventTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pass Tier / Seat:</span>
                    <strong className="text-slate-900">{scanResult.ticket.tier} • {scanResult.ticket.seat}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Payment Status:</span>
                    <strong className="text-emerald-700">PAID (₹{Number(scanResult.ticket.price_paid || 0).toFixed(2)})</strong>
                  </div>
                  {scanResult.original_check_in_time && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Checked In:</span>
                      <strong className="text-amber-800">{scanResult.original_check_in_time}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {scanResult.verification_status === 'VALID' && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={checkingIn}
                    onClick={handleConfirmCheckIn}
                    className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {checkingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Confirm & Check In Attendee</span>
                  </button>
                </div>
              )}

              {scanResult.verification_status === 'ALREADY_CHECKED_IN' && (
                <div className="text-center pt-1 text-[11px] font-semibold text-amber-800">
                  ⚠ Attendee already admitted. Please do not re-admit.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
