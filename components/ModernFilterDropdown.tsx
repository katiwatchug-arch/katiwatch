"use client";

import { ChevronDown, X, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ModernFilterDropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

export function ModernFilterDropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  icon,
  className = "" 
}: ModernFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative flex items-center justify-between gap-3
          px-5 py-3.5 rounded-2xl 
          transition-all duration-300
          min-w-[160px]
          ${value && value !== ''
            ? "bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/30 hover:shadow-[#E50914]/50"
            : "bg-black/40 backdrop-blur-xl border-2 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-black/50"
          }
        `}
      >
        <div className="flex items-center gap-2.5">
          {icon && <div className={value && value !== '' ? "text-white" : "text-[#E50914]"}>{icon}</div>}
          <span className="font-semibold text-sm whitespace-nowrap">
            {selectedOption?.label || label}
          </span>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />

        {/* Active indicator */}
        {value && value !== '' && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full shadow-lg" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Backdrop glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E50914]/20 to-transparent rounded-2xl blur-xl" />
          
          <div className="relative bg-[#1a1a1a] backdrop-blur-2xl border-2 border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-[#E50914]/10 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {label}
                </span>
                {value && value !== '' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs text-[#E50914] hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {options.map((option) => {
                const isSelected = option.value === value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3
                      text-sm transition-all duration-200
                      ${isSelected
                        ? "bg-[#E50914]/20 text-white font-semibold border-l-4 border-[#E50914]"
                        : "text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#E50914]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer gradient */}
            <div className="h-8 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E50914;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b80710;
        }
      `}</style>
    </div>
  );
}
