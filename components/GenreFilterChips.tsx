"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GenreFilterChipsProps {
  genres: string[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  className?: string;
}

export function GenreFilterChips({ 
  genres, 
  selectedGenre, 
  onSelectGenre, 
  className = "" 
}: GenreFilterChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [genres]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = direction === 'left' 
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Left scroll button */}
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gradient-to-r from-[#141414] via-[#141414] to-transparent flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {genres.map((genre) => {
          const isSelected = selectedGenre === genre;
          
          return (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`
                relative flex-shrink-0 px-5 py-2.5 rounded-full
                text-sm font-semibold whitespace-nowrap
                transition-all duration-300
                ${isSelected
                  ? "bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/40 scale-105"
                  : "bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105"
                }
              `}
            >
              {/* Glow effect for selected */}
              {isSelected && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E50914] to-[#b80710] rounded-full blur opacity-50" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#E50914] to-[#b80710] rounded-full blur-lg opacity-20" />
                </>
              )}
              
              {/* Text */}
              <span className="relative z-10">{genre}</span>

              {/* Active indicator dot */}
              {isSelected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full shadow-lg" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gradient-to-l from-[#141414] via-[#141414] to-transparent flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Gradient fade on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
