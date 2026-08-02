"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getProviderFromPhone, getProviderDisplayName } from '@/lib/phone-utils';
import { getSubscriptionPlans } from '@/lib/subscriptions';
import { SubscriptionPlan } from '@/lib/supabase';
import { PaymentProviders } from '@/lib/payment-config';
import Link from 'next/link';
import { YoPaymentsService } from '@/lib/yopayments';

const LoadingDots = () => (
  <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
  </span>
);

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PaymentPageContent() {
  const { user, loading: authLoading, refreshPremiumStatus } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detectedMNO, setDetectedMNO] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalPhoneNumber, setModalPhoneNumber] = useState('');
  const [modalDetectedMNO, setModalDetectedMNO] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/signin');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const loadPlans = async () => {
      try {
        const availablePlans = await getSubscriptionPlans();
        setPlans(availablePlans);
        const recommended = availablePlans.find(p => p.recommended);
        if (recommended) setSelectedPlan(recommended);
        else if (availablePlans.length > 0) setSelectedPlan(availablePlans[0]);
      } catch (error) {
        console.error('Failed to load plans:', error);
      }
    };
    loadPlans();
  }, [user]);

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      try {
        if (PaymentProviders.isMakyPayEnabled()) {
          const provider = getProviderFromPhone(phoneNumber);
          setDetectedMNO(getProviderDisplayName(provider));
        } else if (PaymentProviders.isYoPaymentsEnabled()) {
          const mno = YoPaymentsService.getAccountProviderCode(phoneNumber);
          const mnoNames: Record<string, string> = { 'MTN_MOMO_UGA': 'MTN MoMo', 'AIRTEL_OAPI_UGA': 'Airtel Money' };
          setDetectedMNO(mnoNames[mno] || 'Unknown Network');
        }
      } catch { setDetectedMNO('Invalid number'); }
    } else { setDetectedMNO(''); }
  }, [phoneNumber]);

  const handleModalPhoneNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setModalPhoneNumber(cleaned);
    if (cleaned.length >= 10) {
      try {
        if (PaymentProviders.isMakyPayEnabled()) {
          const provider = getProviderFromPhone(cleaned);
          setModalDetectedMNO(getProviderDisplayName(provider));
        } else if (PaymentProviders.isYoPaymentsEnabled()) {
          const mno = YoPaymentsService.getAccountProviderCode(cleaned);
          const mnoNames: Record<string, string> = { 'MTN_MOMO_UGA': 'MTN MoMo', 'AIRTEL_OAPI_UGA': 'Airtel Money' };
          setModalDetectedMNO(mnoNames[mno] || 'Unknown Network');
        }
      } catch { setModalDetectedMNO('Invalid number'); }
    } else { setModalDetectedMNO(''); }
  };

  const openPaymentModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setModalPhoneNumber(phoneNumber);
    setModalDetectedMNO(detectedMNO);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setModalPhoneNumber('');
    setModalDetectedMNO('');
  };

  const proceedWithPayment = () => {
    const payPhone = modalPhoneNumber;
    const payMNO = modalDetectedMNO;
    setPhoneNumber(payPhone);
    setDetectedMNO(payMNO);
    setShowPaymentModal(false);
    handlePayment(payPhone);
  };

  const handlePayment = async (overridePhone?: string) => {
    const payPhone = overridePhone || phoneNumber;
    if (!selectedPlan || !payPhone || !user) return;
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');
    try {
      const amount = selectedPlan.amount || 10000;
      const { data: sessionData } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const apiEndpoint = PaymentProviders.isMakyPayEnabled() ? '/api/makypay/initiate' : '/api/yopayments/initiate';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, accessToken, phoneNumber: payPhone, amount, description: `Subscription: ${selectedPlan.name}`, paymentMethod: 'mobile_money' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment initiation failed');
      const result = data.transaction;
      const transactionId = result.uuid || result.transactionReference || result.internalReference;
      setTransactionRef(transactionId);
      setPaymentStatus('processing');
      const statusEndpoint = PaymentProviders.isMakyPayEnabled() ? '/api/makypay/status' : '/api/yopayments/status';
      const MAX_POLLS = 24;
      const POLL_INTERVAL = 5000;
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        try {
          const pollResponse = await fetch(statusEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(PaymentProviders.isMakyPayEnabled() ? { transactionId } : { transactionReference: transactionId }),
          });
          if (!pollResponse.ok) continue;
          const pollData = await pollResponse.json();
          const txStatus = pollData.transaction;
          if (txStatus?.isCompleted) {
            const completeEndpoint = PaymentProviders.isMakyPayEnabled() ? '/api/makypay/complete' : '/api/yopayments/complete';
            const completeResponse = await fetch(completeEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(PaymentProviders.isMakyPayEnabled()
                ? { userId: user.id, accessToken, transactionId, subscriptionPlan: selectedPlan.name.toLowerCase(), subscriptionDuration: selectedPlan.duration_in_days || 30 }
                : { userId: user.id, accessToken, transactionReference: transactionId, subscriptionPlan: selectedPlan.name.toLowerCase(), subscriptionDuration: selectedPlan.duration_in_days || 30 }
              ),
            });
            if (!completeResponse.ok) {
              const completeData = await completeResponse.json();
              throw new Error(completeData.error || 'Failed to complete subscription');
            }
            setPaymentStatus('success');
            await refreshPremiumStatus();
            setTimeout(() => { window.location.href = '/'; }, 3000);
            return;
          }
          if (txStatus?.isFailed) {
            setPaymentStatus('failed');
            setErrorMessage(txStatus.displayStatus || 'Payment was declined');
            return;
          }
        } catch { }
      }
      setPaymentStatus('timeout');
      setErrorMessage('Payment is still processing. If you approved on your phone, your subscription will activate shortly.');
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a0000] via-[#0d0d0d] to-[#0a0a0a] pt-10 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.15)_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
            <span className="text-[#E50914] text-xs font-semibold tracking-widest uppercase">Premium Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
            Unlock unlimited access to all movies and TV shows. Cancel anytime.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 -mt-4">

        {/* Status Banners */}
        {paymentStatus === 'processing' && (
          <div className="mb-8 p-5 bg-blue-950/60 border border-blue-700/50 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-700/30 flex items-center justify-center flex-shrink-0">
                <LoadingDots />
              </div>
              <div>
                <p className="text-blue-300 font-semibold">Processing your payment…</p>
                <p className="text-blue-400/70 text-sm mt-0.5">Check your phone and approve the transaction. This may take a minute.</p>
                {transactionRef && <p className="text-blue-400/50 text-xs mt-1">Ref: {transactionRef.substring(0, 10)}…</p>}
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="mb-8 p-5 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-emerald-300 font-semibold">Payment Successful! 🎉</p>
                <p className="text-emerald-400/70 text-sm mt-0.5">Your subscription is now active. Redirecting you to start watching…</p>
              </div>
              <Link href="/" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-colors">
                Watch Now
              </Link>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-8 p-5 bg-red-950/60 border border-red-700/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-700/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-300 font-semibold">Payment Failed</p>
                <p className="text-red-400/70 text-sm mt-0.5">{errorMessage}</p>
              </div>
              <button onClick={() => setPaymentStatus('idle')} className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition-colors">
                Try Again
              </button>
            </div>
          </div>
        )}

        {paymentStatus === 'timeout' && (
          <div className="mb-8 p-5 bg-amber-950/60 border border-amber-600/50 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-amber-300 font-semibold">Payment Still Processing</p>
                <p className="text-amber-400/70 text-sm mt-0.5">{errorMessage}</p>
                <p className="text-amber-400/50 text-xs mt-1">You can safely close this page. Your subscription activates automatically.</p>
                <div className="flex gap-3 mt-3">
                  <Link href="/" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-sm font-semibold transition-colors">Go Home</Link>
                  <button onClick={() => setPaymentStatus('idle')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors">Try Again</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        {(paymentStatus === 'idle' || paymentStatus === 'timeout') && (
          <>
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {[
                { icon: '🔒', label: 'Secure Payments' },
                { icon: '📱', label: 'Mobile Money' },
                { icon: '⚡', label: 'Instant Access' },
                { icon: '🎬', label: 'All Content' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>

            <div className={`grid gap-5 mb-10 ${
              plans.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
              plans.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => openPaymentModal(plan)}
                  className={`relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group ${
                    plan.recommended
                      ? 'border-[#E50914] bg-gradient-to-b from-[#E50914]/10 to-transparent shadow-[0_0_30px_rgba(229,9,20,0.1)]'
                      : 'border-gray-800 bg-white/[0.03] hover:border-[#E50914]/60 hover:bg-[#E50914]/5'
                  } ${selectedPlan?.id === plan.id ? 'ring-2 ring-[#E50914]' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[#E50914] text-white text-xs px-4 py-1 rounded-full font-bold tracking-wide shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-xl font-bold capitalize mb-1">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {plan.duration_in_days === 1 ? '1 Day Access' : `${plan.duration_in_days} Days Access`}
                    </p>
                    {plan.description && <p className="text-gray-500 text-xs mt-1">{plan.description}</p>}
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-black">UGX</span>
                    <span className="text-4xl font-black ml-1">{plan.amount?.toLocaleString()}</span>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckIcon />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    plan.recommended
                      ? 'bg-[#E50914] hover:bg-[#b80710] text-white shadow-lg shadow-[#E50914]/20'
                      : 'bg-white/10 hover:bg-[#E50914] hover:text-white text-gray-200'
                  }`}>
                    Get Started →
                  </button>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-white/[0.03] border border-gray-800/60 rounded-2xl p-6 mb-6">
              <h3 className="text-base font-semibold text-white mb-5 text-center">How to Subscribe</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { step: '01', title: 'Choose a Plan', desc: 'Select the subscription plan that works best for you.' },
                  { step: '02', title: 'Enter Your Number', desc: 'Provide your MTN or Airtel mobile money number.' },
                  { step: '03', title: 'Confirm on Phone', desc: 'Approve the prompt on your phone to activate instantly.' },
                ].map(s => (
                  <div key={s.step} className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl font-black text-[#E50914]/30">{s.step}</span>
                    <p className="font-semibold text-white text-sm">{s.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported networks */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <span className="text-gray-600 text-xs uppercase tracking-widest">Accepted via</span>
              <span className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-semibold">MTN Mobile Money</span>
              <span className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-semibold">Airtel Money</span>
            </div>
          </>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Complete Payment</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Secure mobile money transaction</p>
                </div>
                <button onClick={closePaymentModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Plan summary */}
                <div className="flex items-center justify-between bg-[#E50914]/8 border border-[#E50914]/15 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-[#E50914] font-semibold uppercase tracking-wider mb-1">Selected Plan</p>
                    <p className="text-white font-bold capitalize">{selectedPlan.name}</p>
                    <p className="text-gray-400 text-xs">{selectedPlan.duration_in_days} day{selectedPlan.duration_in_days !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">UGX</p>
                    <p className="text-2xl font-black text-white">{selectedPlan.amount?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Phone number input */}
                <div>
                  <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile Money Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      id="modal-phone"
                      type="tel"
                      value={modalPhoneNumber}
                      onChange={(e) => handleModalPhoneNumberChange(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full pl-10 pr-28 py-3.5 bg-white/5 border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-white placeholder-gray-600 text-sm transition-all outline-none"
                      maxLength={15}
                    />
                    {modalDetectedMNO && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          modalDetectedMNO === 'Invalid number'
                            ? 'bg-red-900/60 text-red-300'
                            : 'bg-emerald-900/60 text-emerald-300'
                        }`}>
                          {modalDetectedMNO}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">MTN or Airtel number — Uganda only</p>
                </div>

                {/* CTA buttons */}
                <div className="flex gap-3">
                  <button onClick={closePaymentModal} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold text-sm transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={proceedWithPayment}
                    disabled={!modalPhoneNumber || modalPhoneNumber.length < 10 || modalDetectedMNO === 'Invalid number'}
                    className="flex-1 py-3 bg-[#E50914] hover:bg-[#b80710] disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                    </svg>
                    Pay Now
                  </button>
                </div>

                <p className="text-center text-xs text-gray-600">
                  💡 You&apos;ll receive a payment prompt on your phone to confirm.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
