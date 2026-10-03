import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Download,
  Ticket,
  Package,
  HeartHandshake,
  Award,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { paymentsApi, ticketsApi, merchandiseApi } from '../../services/api';
import { UniversityCrest } from './UniversityCrest';

/**
 * DemoPaymentModal
 * Professional Skyline simulated payment modal.
 * Guides user through:
 * 1. REVIEW / AUTHORIZE: Item details, price breakdown, security badge, "Pay (Demo)"
 * 2. PROCESSING: Animated step-by-step security checks ("Securing transaction...", "Verifying authorization...", "Confirming order & issuing credentials...")
 * 3. SUCCESS: Emerald checkmark, Transaction ID, amount, and context-specific action buttons.
 */
export const DemoPaymentModal = ({
  isOpen,
  onClose,
  paymentData, // { payment_type: 'EVENT_TICKET' | 'MERCHANDISE' | 'DONATION' | 'MEMBERSHIP', title, subtitle, amount, details: {}, eventId, productId, size, quantity, fundraiserId }
  onSuccessCallback // (result) => void
}) => {
  const [stage, setStage] = useState('CONFIRM'); // 'CONFIRM' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  const [processingStep, setProcessingStep] = useState(0); // 0, 1, 2
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedResult, setCompletedResult] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const processingSteps = [
    'Securing encrypted handshake...',
    'Verifying simulated student authorization...',
    'Confirming order & issuing verified credentials...'
  ];

  // Reset state whenever modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setStage('CONFIRM');
      setProcessingStep(0);
      setIsButtonDisabled(false);
      setErrorMessage('');
      setCompletedResult(null);
      setIsDownloadingPdf(false);
    }
  }, [isOpen, paymentData]);

  if (!isOpen || !paymentData) return null;

  const handleStartPayment = async () => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    setErrorMessage('');
    setStage('PROCESSING');
    setProcessingStep(0);

    try {
      // Step 1: Create pending payment record on Django backend
      const createPayload = {
        payment_type: paymentData.payment_type || 'EVENT_TICKET',
        amount: paymentData.amount,
        event_id: paymentData.eventId,
        quantity: paymentData.quantity || 1,
        product_id: paymentData.productId,
        size: paymentData.size,
        notes: paymentData.notes || `Demo Payment for ${paymentData.title}`,
        plan: paymentData.plan,
        fundraiser_id: paymentData.fundraiserId,
        fundraiser_title: paymentData.title
      };

      const created = await paymentsApi.createDemoPayment(createPayload);

      // Animation Step 1: Securing transaction
      setProcessingStep(1);
      await new Promise((r) => setTimeout(r, 650));

      // Optional backend processing transition
      if (created.payment_id) {
        paymentsApi.processDemoPayment({ payment_id: created.payment_id }).catch(() => {});
      }

      // Animation Step 2: Verifying authorization
      setProcessingStep(2);
      await new Promise((r) => setTimeout(r, 700));

      // Step 2: Authoritatively complete payment on Django backend
      const completed = await paymentsApi.completeDemoPayment({
        payment_id: created.payment_id,
        transaction_id: created.transaction_id
      });

      // Brief pause to allow third checklist step to be seen
      await new Promise((r) => setTimeout(r, 450));

      setCompletedResult(completed);
      setStage('SUCCESS');

      if (onSuccessCallback) {
        onSuccessCallback(completed);
      }
    } catch (err) {
      console.error('Demo payment failed:', err);
      const msg = err.response?.data?.error || err.message || 'Payment simulation failed. Please try again.';
      setErrorMessage(msg);
      setStage('ERROR');
      setIsButtonDisabled(false);
    }
  };

  const handleDownloadTicketPdf = async () => {
    const ticketId = completedResult?.ticket?.ticket_id || completedResult?.ticket?.id;
    if (!ticketId) return;
    try {
      setIsDownloadingPdf(true);
      const blob = await ticketsApi.downloadPdf(ticketId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Skyline_Ticket_${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download ticket PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadMerchandisePdf = async () => {
    const orderId = completedResult?.order?.order_id || completedResult?.order?.id;
    if (!orderId) return;
    try {
      setIsDownloadingPdf(true);
      const blob = await merchandiseApi.downloadPdf(orderId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Skyline_Collection_Pass_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download merchandise collection pass PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  Skyline Pay
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SIMULATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Institutional Checkout Demo</p>
            </div>
          </div>

          {stage !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* ========================================================= */}
          {/* STAGE 1: CONFIRMATION / AUTHORIZE                         */}
          {/* ========================================================= */}
          {stage === 'CONFIRM' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Review & Confirm Payment
                </h3>
                <p className="text-xs text-slate-400">
                  Clicking authorize will simulate a secure payment and issue your credentials immediately.
                </p>
              </div>

              {/* Order Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {paymentData.payment_type?.replace('_', ' ') || 'PURCHASE'}
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">
                      {paymentData.title || 'Skyline Event / Item'}
                    </h4>
                    {paymentData.subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{paymentData.subtitle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-lg font-extrabold text-white">
                      ₹{parseFloat(paymentData.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Additional Metadata chips */}
                {paymentData.details && (
                  <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    {paymentData.details.quantity && (
                      <div>
                        <span className="text-slate-500">Qty:</span>{' '}
                        <span className="text-slate-300 font-medium">{paymentData.details.quantity}</span>
                      </div>
                    )}
                    {paymentData.details.size && (
                      <div>
                        <span className="text-slate-500">Size/Variant:</span>{' '}
                        <span className="text-slate-300 font-medium">{paymentData.details.size}</span>
                      </div>
                    )}
                    {paymentData.details.venue && (
                      <div className="col-span-2 truncate">
                        <span className="text-slate-500">Venue:</span>{' '}
                        <span className="text-slate-300 font-medium">{paymentData.details.venue}</span>
                      </div>
                    )}
                    {paymentData.details.date && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Date:</span>{' '}
                        <span className="text-slate-300 font-medium">{paymentData.details.date}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Demo Mode Notice */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Simulated Demo Mode:</strong> No real money will be charged. The system will automatically confirm your purchase and generate official passes.
                </p>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                disabled={isButtonDisabled}
                onClick={handleStartPayment}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Authorize & Complete (₹{parseFloat(paymentData.amount || 0).toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 2: PROCESSING ANIMATION                             */}
          {/* ========================================================= */}
          {stage === 'PROCESSING' && (
            <div className="py-6 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-200">
              {/* Spinner & Shield */}
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Processing Payment</h3>
                <p className="text-xs text-slate-400">Connecting with Skyline Demo Authorization Service...</p>
              </div>

              {/* Step Checklist */}
              <div className="w-full max-w-xs space-y-2.5 text-left">
                {processingSteps.map((stepText, idx) => {
                  const isDone = processingStep > idx;
                  const isCurrent = processingStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-950/30 text-emerald-300 font-medium'
                          : isCurrent
                          ? 'bg-slate-800/80 text-white font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span>{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 3: PAYMENT SUCCESSFUL                               */}
          {/* ========================================================= */}
          {stage === 'SUCCESS' && (
            <div className="py-2 space-y-5 animate-in zoom-in-95 duration-200 text-center">
              {/* Green Success Emblem */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <Sparkles className="w-5 h-5 text-emerald-300 absolute -top-1 -right-1 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Payment Successful!</h3>
                <p className="text-xs text-slate-300">
                  Your transaction has been securely confirmed.
                </p>
              </div>

              {/* Transaction Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {completedResult?.transaction_id || 'SKY-DEMO-SUCCESS'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-white">
                    ₹{parseFloat(completedResult?.amount || paymentData.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="text-slate-300 font-medium">SIMULATED / DEMO</span>
                </div>
              </div>

              {/* Contextual Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Event Ticket Actions */}
                {paymentData.payment_type === 'EVENT_TICKET' && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTicketPdf}
                      disabled={isDownloadingPdf}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isDownloadingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download Official PDF Ticket</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-emerald-400" />
                      <span>View My Tickets</span>
                    </button>
                  </div>
                )}

                {/* Merchandise Order Actions */}
                {paymentData.payment_type === 'MERCHANDISE' && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadMerchandisePdf}
                      disabled={isDownloadingPdf}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isDownloadingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download Collection Pass (PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>View My Orders</span>
                    </button>
                  </div>
                )}

                {/* Donation / Membership Actions */}
                {(paymentData.payment_type === 'DONATION' || paymentData.payment_type === 'MEMBERSHIP') && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Done</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 4: ERROR                                            */}
          {/* ========================================================= */}
          {stage === 'ERROR' && (
            <div className="py-4 space-y-4 text-center animate-in fade-in duration-150">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Payment Incomplete</h4>
                <p className="text-xs text-rose-300/90 leading-relaxed px-4">
                  {errorMessage || 'Could not complete the simulated transaction.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
