"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ModernSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModernSearchBar({ value, onChange, placeholder = "Search...", className = "" }: ModernSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect when focused */}
      {isFocused && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E50914] to-[#ff6b6b] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
      )}
      
      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search 
            className={`w-5 h-5 transition-all duration-300 ${
              isFocused 
                ? "text-[#E50914] scale-110" 
                : "text-gray-500 group-hover:text-gray-400"
            }`}
          />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-12 py-3.5 
            bg-black/40 backdrop-blur-xl 
            border-2 rounded-2xl 
            text-white placeholder-gray-500
            transition-all duration-300
            focus:outline-none
            ${isFocused 
              ? "border-[#E50914] bg-black/60 shadow-lg shadow-[#E50914]/20" 
              : "border-gray-800 hover:border-gray-700 hover:bg-black/50"
            }
          `}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-800 hover:bg-[#E50914] transition-all duration-200 group/clear"
          >
            <X className="w-4 h-4 text-gray-400 group-hover/clear:text-white" />
          </button>
        )}
      </div>

      {/* Bottom glow */}
      {isFocused && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />
      )}
    </div>
  );
}
