"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle: string;
}

export function DownloadModal({ isOpen, onClose, onConfirm, title, subtitle }: DownloadModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md h-[100dvh] w-screen overscroll-none touch-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-gray-900 rounded-2xl border border-[#E50914]/30 shadow-2xl max-w-md w-full flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: '0 0 40px rgba(229, 9, 20, 0.15), 0 20px 60px rgba(0, 0, 0, 0.9)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-5">
            <div className="absolute inset-0 bg-[#E50914]/20 rounded-full animate-ping" />
            <div
              className="relative w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.2), rgba(229, 9, 20, 0.05))',
                border: '2px solid rgba(229, 9, 20, 0.4)',
              }}
            >
              <Download className="w-8 h-8 sm:w-9 sm:h-9 text-[#E50914]" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1.5 text-center">Ready to Download</h2>
          <p className="text-gray-300 text-sm mb-1 text-center font-semibold">{title}</p>
          <p className="text-gray-500 text-xs mb-6 text-center">{subtitle}</p>
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-3 bg-gray-800/95">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-[#E50914] hover:bg-[#b80710] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Start Download
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
