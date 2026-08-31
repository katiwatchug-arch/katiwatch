"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface MakyPayButtonProps {
  amount: number;
  description: string;
  subscriptionPlan: string;
  subscriptionDuration: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * MakyPay Payment Button Component
 * 
 * A reusable component for initiating MakyPay payments
 * Supports both mobile money and card payments
 */
export default function MakyPayButton({
  amount,
  description,
  subscriptionPlan,
  subscriptionDuration,
  onSuccess,
  onError,
}: MakyPayButtonProps) {
  const { user, refreshPremiumStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detectedProvider, setDetectedProvider] = useState('');
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showModal]);

  const detectProvider = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const prefix = cleaned.startsWith('256') ? cleaned.substring(3, 5) : cleaned.substring(1, 3);
      
      // MTN: 77, 78, 76, 79, 39 — per MakyPay live API spec
      if (['77', '78', '76', '79', '39'].includes(prefix)) {
        setDetectedProvider('MTN Mobile Money');
      // Airtel: 70, 73, 74, 75 — per MakyPay live API spec
      } else if (['70', '73', '74', '75'].includes(prefix)) {
        setDetectedProvider('Airtel Money');
      } else {
        setDetectedProvider('Unknown Network');
      }
    } else {
      setDetectedProvider('');
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    detectProvider(cleaned);
  };

  const handlePayment = async () => {
    if (!user) {
      onError?.('Please sign in to continue');
      return;
    }

    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      onError?.('Please enter your phone number');
      return;
    }

    setIsProcessing(true);

    try {
      // Get session token
      const { data: sessionData } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Initiate payment
      const initiateResponse = await fetch('/api/makypay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phoneNumber: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
          amount,
          description,
          paymentMethod,
          accessToken,
        }),
      });

      const initiateData = await initiateResponse.json();

      if (!initiateResponse.ok) {
        throw new Error(initiateData.error || 'Payment initiation failed');
      }

      // For card payments, redirect to payment gateway
      if (paymentMethod === 'card' && initiateData.transaction.redirectUrl) {
        window.location.href = initiateData.transaction.redirectUrl;
        return;
      }

      // For mobile money, poll for status
      const statusResponse = await fetch('/api/makypay/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: initiateData.transaction.uuid,
        }),
      });

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(statusData.error || 'Failed to check payment status');
      }

      if (statusData.transaction.isCompleted) {
        // Complete subscription
        const completeResponse = await fetch('/api/makypay/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            transactionId: initiateData.transaction.uuid,
            subscriptionPlan,
            subscriptionDuration,
            accessToken,
          }),
        });

        if (!completeResponse.ok) {
          const completeData = await completeResponse.json();
          throw new Error(completeData.error || 'Failed to complete subscription');
        }

        setShowModal(false);
        // Refresh premium status in AuthProvider so isPremium updates immediately
        await refreshPremiumStatus();
        onSuccess?.();
      } else {
        throw new Error(statusData.transaction.displayStatus || 'Payment failed');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
        }}
        className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Pay with MakyPay</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top))',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) setShowModal(false);
          }}
        >
          <div
            className="bg-[#141414] border border-gray-800 rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 sm:p-5 border-b border-gray-800 flex-shrink-0 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">MakyPay Payment</h3>
                <p className="text-gray-400 text-xs mt-0.5">Secure payment gateway</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={isProcessing}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
              {/* Amount Display */}
              <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl px-4 py-2.5 sm:p-4">
                <p className="text-[10px] sm:text-xs text-blue-400 font-semibold uppercase tracking-wider mb-0.5">Amount to Pay</p>
                <p className="text-xl sm:text-2xl font-black text-white">UGX {amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-300">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`p-2.5 sm:p-3.5 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'mobile_money'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-800 bg-white/5 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-tight">Mobile Money</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">MTN / Airtel</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 sm:p-3.5 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-800 bg-white/5 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-tight">Card</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Visa / Master</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone Number Input (Mobile Money Only) */}
              {paymentMethod === 'mobile_money' && (
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-300">
                    Mobile Money Number
                  </label>
                  <div className="relative">
                    <input
                      ref={phoneInputRef}
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0771234567 or 0701234567"
                      className="w-full px-4 py-3 bg-white/10 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-base font-medium transition-all outline-none"
                      maxLength={12}
                      disabled={isProcessing}
                    />
                    {detectedProvider && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          detectedProvider === 'Unknown Network'
                            ? 'bg-red-900/80 text-red-300 border border-red-700'
                            : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                        }`}>
                          {detectedProvider}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">MTN or Airtel Money — Uganda only</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-gray-300 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={
                    isProcessing ||
                    (paymentMethod === 'mobile_money' && (!phoneNumber || phoneNumber.length < 10))
                  }
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-white">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                      </span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Pay Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <p className="text-center text-[11px] text-gray-400 pb-0.5">
                💡 {paymentMethod === 'mobile_money'
                  ? "You'll receive a prompt on your phone to enter your PIN."
                  : "You'll be redirected to a secure gateway for card payment."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
