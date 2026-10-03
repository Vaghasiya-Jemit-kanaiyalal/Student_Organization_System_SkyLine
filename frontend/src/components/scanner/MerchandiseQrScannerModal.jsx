import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { merchandiseApi } from '../../services/api';
import {
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  ShoppingBag,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck
} from 'lucide-react';

export const MerchandiseQrScannerModal = ({ isOpen, onClose }) => {
  const [manualToken, setManualToken] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScanResult(null);
      setErrorMessage('');
      setManualToken('');
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setErrorMessage('');
      setScannerActive(true);
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('merch-qr-reader');
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
            // normal background scan polling
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
      const result = await merchandiseApi.verifyQr(token);
      setScanResult(result);
    } catch (err) {
      console.error('Merchandise verification request failed:', err);
      setErrorMessage(err.response?.data?.error || 'Verification server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCollect = async () => {
    if (!scanResult?.order?.order_id && !scanResult?.order?.id) return;
    const orderId = scanResult.order?.order_id || scanResult.order?.id;
    setCollecting(true);
    try {
      const res = await merchandiseApi.collect(orderId);
      setScanResult({
        ...scanResult,
        verification_status: 'ALREADY_COLLECTED',
        title: 'COLLECTED SUCCESSFULLY',
        message: `Order #${orderId} marked as collected.`,
        order: res.order,
        collected_at: res.order?.collected_at || new Date().toISOString()
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to mark as collected.');
    } finally {
      setCollecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Merchandise Collection & Fulfillment Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Scan student collection pass QR code to verify payment and hand over items.
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
          {/* Camera Scanner View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Camera Feed</span>
              {!scannerActive ? (
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
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
              id="merch-qr-reader"
              className={`w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 ${
                scannerActive ? 'min-h-[260px]' : 'h-24 flex items-center justify-center text-slate-400 text-xs'
              }`}
            >
              {!scannerActive && <span>Camera is stopped. Click Start Camera or enter token below.</span>}
            </div>
          </div>

          {/* Manual Input Alternative */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Manual Collection QR Token / Order ID:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SKYLINE-MERCH:uuid or ORD-2026-XXXX"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyToken()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-sky-600"
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

          {/* Error Alert */}
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
                ? 'bg-sky-50/70 border-sky-300 text-sky-950'
                : scanResult.verification_status === 'ALREADY_COLLECTED'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}>
              {/* Status Header */}
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <div className="flex items-center gap-2">
                  {scanResult.verification_status === 'VALID' && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                  {scanResult.verification_status === 'ALREADY_COLLECTED' && <Clock className="w-5 h-5 text-amber-600" />}
                  {scanResult.verification_status !== 'VALID' && scanResult.verification_status !== 'ALREADY_COLLECTED' && (
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

              {/* Order Details breakdown */}
              {scanResult.order && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 p-3 rounded-lg border border-black/10">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Customer Name:</span>
                    <strong className="text-slate-900">{scanResult.order.customerName || scanResult.order.user?.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Order ID:</span>
                    <strong className="text-slate-900 font-mono">{scanResult.order.order_id || scanResult.order.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Merchandise Item:</span>
                    <strong className="text-slate-900">{scanResult.order.productName || scanResult.order.merchandise?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Variant / Size:</span>
                    <strong className="text-slate-900">{scanResult.order.size || scanResult.order.variant} (Qty: {scanResult.order.quantity})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Payment Status:</span>
                    <strong className="text-emerald-700">PAID (₹{Number(scanResult.order.total_amount || scanResult.order.totalPrice || 0).toFixed(2)})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Collection Status:</span>
                    <strong className={scanResult.order.collection_status === 'COLLECTED' ? 'text-amber-800' : 'text-sky-700'}>
                      {scanResult.order.collection_status || scanResult.order.collectionStatus}
                    </strong>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {scanResult.verification_status === 'VALID' && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={collecting}
                    onClick={handleConfirmCollect}
                    className="w-full py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {collecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                    <span>Confirm Handover & Mark as Collected</span>
                  </button>
                </div>
              )}

              {scanResult.verification_status === 'ALREADY_COLLECTED' && (
                <div className="text-center pt-1 text-[11px] font-semibold text-amber-800">
                  ⚠ Order was already dispensed to customer.
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
