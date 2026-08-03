'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, X, Sparkles } from 'lucide-react';
import { useOneSignal } from '@/lib/hooks/useOneSignal';

const DISMISSED_KEY = 'katiwatch-notif-dismissed';
// Re-prompt every 3 days if not yet granted
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const PROMPT_DELAY_MS = 6000;

export default function NotificationPrompt() {
  const { permission, isInitialized, promptForNotifications } = useOneSignal();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const shouldShow = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (permission === 'granted' || permission === 'denied' || permission === 'unsupported') return false;
    if (permission === 'loading' || !isInitialized) return false;
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (raw && Date.now() - parseInt(raw, 10) < DISMISS_COOLDOWN_MS) return false;
    return true;
  }, [permission, isInitialized]);

  // Show after initial delay
  useEffect(() => {
    if (!shouldShow()) return;
    const timer = setTimeout(() => setVisible(true), PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  // Re-check on tab focus — catches users who switched tabs and came back
  useEffect(() => {
    const onFocus = () => {
      if (shouldShow()) setVisible(true);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [shouldShow]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  const handleEnable = async () => {
    setRequesting(true);
    try { await promptForNotifications(); }
    finally { setRequesting(false); setVisible(false); }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-80 z-[60] animate-slide-up"
      role="dialog"
      aria-label="Enable notifications"
    >
      <div className="relative overflow-hidden rounded-2xl border border-gray-700/60 bg-[#141414]/95 backdrop-blur-xl shadow-2xl shadow-black/60">
        {/* Cinematic top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#E50914]/10 to-transparent pointer-events-none" />

        <div className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-3 pr-6 mb-4">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#8b0000] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#E50914]/30">
              <Bell className="w-5 h-5 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Never miss a drop 🎬</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                Get notified the moment new movies &amp; series land on Katiwatch.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 text-xs text-gray-500 border border-gray-800 rounded-xl hover:text-gray-300 hover:border-gray-600 transition-all flex items-center justify-center gap-1.5"
            >
              <BellOff className="w-3.5 h-3.5" />
              Not now
            </button>
            <button
              onClick={handleEnable}
              disabled={requesting}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#E50914] to-[#b80710] hover:from-[#c8000f] hover:to-[#9a0000] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#E50914]/20"
            >
              <Bell className="w-3.5 h-3.5" />
              {requesting ? 'Enabling...' : 'Enable alerts'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.35s ease-out; }
      `}</style>
    </div>
  );
}
