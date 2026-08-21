import Link from "next/link";
import Image from "next/image";
import { Movie, Series } from "@/lib/supabase";
import { Play, Star, Crown } from "lucide-react";
import React, { useState } from "react";

// Streamit-style card component for both movies and series
type TMDBGenreMovie = {
  id: number | string;
  title?: string;
  poster_url?: string;
  cover_url?: string;
  description?: string;
  release_date?: string;
  thumbnail_url?: string;
  cover_image_url?: string;
};

type NetflixCardProps = {
  content: Movie | Series | TMDBGenreMovie;
  type: "movie" | "series";
  isNonTranslated?: boolean;
  variant?: "default" | "cinematic";
};

export const NetflixCard = ({ content, type, isNonTranslated = false, variant = "default" }: NetflixCardProps) => {
  const [isShattered, setIsShattered] = useState(false);

  const getHref = () => {
    if (isNonTranslated) {
      return `/non-translated/${type === "movie" ? "movies" : "series"}/${content.id}`;
    }
    return `/${type === "movie" ? "movies" : "series"}/${content.id}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (variant === 'cinematic') {
      e.preventDefault();
      setIsShattered(true);
      setTimeout(() => {
        window.location.href = getHref();
      }, 500); // 500ms delay for shatter animation
    }
  };

  const getRating = () => {
    if ('rating' in content && typeof content.rating === 'number') {
      return content.rating.toFixed(1);
    }
    return (Math.random() * 2 + 7).toFixed(1);
  };

  const isPremium: boolean = Boolean(('premium' in content && content.premium) || ('is_premium' in content && content.is_premium));
  const vjName: string | null = ('vjs' in content && (content.vjs as any)?.name) ? (content.vjs as any).name : null;

  return (
    <Link href={getHref()} onClick={handleClick} className={`group block ${variant === 'cinematic' ? 'relative transition-transform duration-500 hover:scale-[1.03]' : ''}`}>
      <div className={`relative pt-[150%] rounded-md overflow-hidden bg-gray-900 ${
        variant === 'cinematic' 
          ? 'shadow-lg group-hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all duration-500'
          : ''
      }`}>
        <Image
          src={
            content.thumbnail_url ||
            content.cover_image_url ||
            (('poster_url' in content && content.poster_url) ? content.poster_url : undefined) ||
            `https://via.placeholder.com/240x360/1f2937/e50914?text=${encodeURIComponent(content.title || '')}`
          }
          alt={content.title || `Poster for ${type}`}
          fill
          className="object-cover"
          sizes="(max-width:480px) 33vw, (max-width:768px) 25vw, (max-width:1024px) 20vw, (max-width:1280px) 16vw, 12vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/240x360/1f2937/e50914?text=${encodeURIComponent(content.title || '')}`;
          }}
        />

        {/* Glassmorphic overlay for cinematic variant */}
        {variant === 'cinematic' && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {/* Top-left shard */}
            <div className={`absolute inset-0 bg-white/10 backdrop-blur-[2px] border-l border-t border-white/30 transition-all duration-500 ease-out origin-bottom-right ${isShattered ? 'translate-x-[-30%] translate-y-[-30%] rotate-[-25deg] opacity-0' : 'opacity-100'}`} style={{ clipPath: 'polygon(0 0, 50% 0, 40% 50%, 0 40%)' }} />
            {/* Top-right shard */}
            <div className={`absolute inset-0 bg-white/10 backdrop-blur-[2px] border-r border-t border-white/30 transition-all duration-500 ease-out origin-bottom-left ${isShattered ? 'translate-x-[30%] translate-y-[-30%] rotate-[25deg] opacity-0' : 'opacity-100'}`} style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 60%, 40% 50%)' }} />
            {/* Bottom-left shard */}
            <div className={`absolute inset-0 bg-white/10 backdrop-blur-[2px] border-l border-b border-white/30 transition-all duration-500 ease-out origin-top-right ${isShattered ? 'translate-x-[-30%] translate-y-[30%] rotate-[25deg] opacity-0' : 'opacity-100'}`} style={{ clipPath: 'polygon(0 40%, 40% 50%, 60% 100%, 0 100%)' }} />
            {/* Bottom-right shard */}
            <div className={`absolute inset-0 bg-white/10 backdrop-blur-[2px] border-r border-b border-white/30 transition-all duration-500 ease-out origin-top-left ${isShattered ? 'translate-x-[30%] translate-y-[30%] rotate-[-25deg] opacity-0' : 'opacity-100'}`} style={{ clipPath: 'polygon(40% 50%, 100% 60%, 100% 100%, 60% 100%)' }} />
            
            {/* Flash crack line upon shatter */}
            {isShattered && (
               <div className="absolute inset-0 z-30 pointer-events-none">
                 <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d="M 0 40 L 40 50 L 50 0 M 40 50 L 60 100 M 40 50 L 100 60" stroke="white" strokeWidth="1" fill="none" opacity="0.8" className="animate-pulse" />
                 </svg>
               </div>
            )}
          </div>
        )}

        {/* Rating badge - bottom left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 z-30">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white drop-shadow-md">{getRating()}</span>
        </div>

        {/* Premium badge - top right corner if premium */}
        {isPremium && (
          <div className="absolute top-2 right-2 z-30">
            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-yellow-400 shadow-lg flex items-center gap-1 uppercase">
              <Crown className="w-2.5 h-2.5" style={{ color: '#FFD700', filter: 'drop-shadow(0 0 2px #FFD700)' }} />
              <span>Premium</span>
            </div>
          </div>
        )}
      </div>

      {/* Title - below card */}
      <h3 className={`text-xs font-medium mt-2 truncate ${
        variant === 'cinematic'
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 group-hover:from-white group-hover:to-gray-200 tracking-wide uppercase font-semibold'
          : 'text-white'
      }`}>
        {content.title}
      </h3>
      
      {/* Meta info */}
      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
        {content.release_date && (
          <span>{new Date(content.release_date).getFullYear()}</span>
        )}
        {vjName && (
          <>
            <span>•</span>
            <span className="text-[#E50914] truncate">{vjName}</span>
          </>
        )}
      </div>
    </Link>
  );
};

