"use client";

import { logger } from '@/lib/logger';
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Play, Info, Plus, Star, Calendar, Mic, ChevronRight, Heart, Search, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { NetflixCard } from "@/components/NetflixCard";
import { FullPageSpinner } from "@/components/LoadingSpinner";
import { getVJContent, getMovieById, getSeriesById, getMovies, getSeries, getGenreRowsForHome, searchMovies, searchSeries, getRegions } from "@/lib/api";
import { Movie, Series } from "@/lib/supabase";
import { useAuthCheck } from "@/components/AuthRequiredModal";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";

type VJContent = (Movie | Series) & {
  type: 'movie' | 'series';
  vjs: { id: string; name: string } | null;
  is_premium?: boolean;
};

type TrendingContent = (Movie | Series) & {
  type: 'movie' | 'series';
  trending?: 'hot' | 'trending';
};

const filterOptions = [
  'All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western', 'Family'
];

// Skeleton row for lazy sections
function SwiperSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[calc(100%/3.5)] sm:w-[calc(100%/4.5)] md:w-[calc(100%/5.5)] lg:w-[calc(100%/6.5)] xl:w-[calc(100%/8.5)] pt-[150%] bg-gray-800/50 animate-pulse rounded" />
      ))}
    </div>
  );
}

export default function HomePage() {

  const [featuredItem, setFeaturedItem] = useState<VJContent | null>(null);
  const [heroSlides, setHeroSlides] = useState<VJContent[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [latestSeries, setLatestSeries] = useState<Series[]>([]);
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('All');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [genreRows, setGenreRows] = useState<{ name: string; movies: any[]; series: any[] }[]>([]);
  const [animationContent, setAnimationContent] = useState<TrendingContent[]>([]);
  const [movies2026, setMovies2026] = useState<Movie[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [seriesFilterLoading, setSeriesFilterLoading] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; action: 'play' | 'download'; requirePremium?: boolean }>({ isOpen: false, action: 'play' });
  const [regionRows, setRegionRows] = useState<{ slug: string; name: string; content: any[] }[]>([]);
  const [regions, setRegions] = useState<{ slug: string; name: string; description: string; countries: string[] }[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { checkAuth } = useAuthCheck();
  const genresFetched = useRef(false);

  const fetchMovies2026Catalog = async () => {
    // Optimised: Only fetch exactly 20 items using the backend's year filter
    // INSTEAD of fetching 500 items and filtering locally.
    const results = await searchMovies('', 20, 1, undefined, undefined, '2026');
    return results;
  };

  // Phase 1: Load hero immediately
  useEffect(() => {
    getVJContent(5).then(async vjData => {
      if (!vjData || vjData.length === 0) { 
        setHeroLoading(false); 
        return; 
      }

      // Fetch full details for ONLY the first hero item to unblock the UI instantly
      const firstItem = vjData[0] as any;
      if (!firstItem.description?.trim()) {
        try {
          const details = firstItem.type === 'movie'
            ? await getMovieById(firstItem.id)
            : await getSeriesById(firstItem.id);
          if (details?.description) {
            firstItem.description = details.description;
          }
        } catch {}
      }

      setHeroSlides(vjData as any);
      setFeaturedItem(firstItem);
      setHeroLoading(false);

      // Fetch the rest of the descriptions in the background
      Promise.all(
        vjData.slice(1).map(async (item: any) => {
          if (!item.description?.trim()) {
            try {
              const details = item.type === 'movie'
                ? await getMovieById(item.id)
                : await getSeriesById(item.id);
              if (details?.description) {
                return { ...item, description: details.description };
              }
            } catch {}
          }
          return item;
        })
      ).then(restWithDetails => {
        setHeroSlides([firstItem, ...restWithDetails] as any);
      });
    }).catch(() => setHeroLoading(false));
  }, []);

  // Auto-change hero slides every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const nextIndex = (prev + 1) % heroSlides.length;
        setFeaturedItem(heroSlides[nextIndex]);
        return nextIndex;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlides]);

  // Phase 2: Load core content first to unblock UI, then load heavy/secondary rows independently
  useEffect(() => {
    // 1. Core Content (Fast)
    Promise.all([
      searchMovies('', 24, 1),
      getSeries(24)
    ]).then(([movies, series]) => {
      setLatestMovies(movies);
      setLatestSeries(series);
      setFilteredMovies(movies);
      setFilteredSeries(series);
      setTrendingContent([
        ...movies.slice(0, 3).map((m: any) => ({ ...m, type: 'movie', trending: 'hot' })),
        ...series.slice(0, 3).map((s: any) => ({ ...s, type: 'series', trending: 'today' })),
      ]);
      setContentLoading(false); // Unblock UI immediately!
    }).catch(() => setContentLoading(false));

    // 2. Genre Rows (Medium)
    if (!genresFetched.current) {
      getGenreRowsForHome(12).then(genres => {
        setGenreRows(genres);
        genresFetched.current = true;
      }).catch(err => logger.error('Error loading genre rows:', err));
    }

    // 3. 2026 Movies (Fast - 1 single API call)
    fetchMovies2026Catalog().then(movies => {
      setMovies2026(movies);
    }).catch(err => logger.error('Error loading 2026 catalog:', err));

    // 4. Animation Content (Medium)
    import('@/lib/reelplexi').then(Reelplexi => {
      Promise.all([
        Reelplexi.getReelplexiMoviesByGenre('animation', 1, 12),
        Reelplexi.getReelplexiSeriesByGenre('animation', 1, 12),
      ]).then(([animMovies, animSeries]) => {
        const combined = [
          ...(animMovies || []).map((m: any) => ({ ...m, type: 'movie' })),
          ...(animSeries || []).map((s: any) => ({ ...s, type: 'series' })),
        ];
        setAnimationContent(combined as TrendingContent[]);
      }).catch(error => logger.error('Error loading animation content:', error));
    });

    // 5b. Region cards for horizontal strip
    getRegions().then(data => setRegions(data)).catch(() => {});

    // 5. Region Content (Medium) - Load select regions for homepage
    import('@/lib/api').then(({ getRegionContent }) => {
      const featuredRegions = ['bollywood', 'kdrama', 'chinese-drama'];
      Promise.all(
        featuredRegions.map(async (slug) => {
          try {
            const result = await getRegionContent(slug, 1, 12);
            return {
              slug,
              name: result.region.name || slug,
              content: result.data
            };
          } catch (error) {
            logger.error(`Error loading ${slug} content:`, error);
            return { slug, name: slug, content: [] };
          }
        })
      ).then(regions => {
        setRegionRows(regions.filter(r => r.content.length > 0));
      });
    });
  }, []);

  // Genre filter - movies
  useEffect(() => {
    if (selectedFilter === 'All') { 
      setFilteredMovies(latestMovies); 
      setFilterLoading(false);
      return; 
    }
    setFilterLoading(true);
    searchMovies('', 16, 1, undefined, selectedFilter.toLowerCase())
      .then(r => {
        setFilteredMovies(r.length > 0 ? r : []);
        setFilterLoading(false);
      })
      .catch(() => {
        setFilteredMovies([]);
        setFilterLoading(false);
      });
  }, [selectedFilter, latestMovies]);

  // Genre filter - series
  useEffect(() => {
    if (selectedSeriesFilter === 'All') { 
      setFilteredSeries(latestSeries); 
      setSeriesFilterLoading(false);
      return; 
    }
    setSeriesFilterLoading(true);
    searchSeries('', 16, 1, undefined, selectedSeriesFilter.toLowerCase())
      .then(r => {
        setFilteredSeries(r.length > 0 ? r : []);
        setSeriesFilterLoading(false);
      })
      .catch(() => {
        setFilteredSeries([]);
        setSeriesFilterLoading(false);
      });
  }, [selectedSeriesFilter, latestSeries]);

  // Search functionality with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true); // Show results container immediately
    
    const handler = setTimeout(async () => {
      try {
        const api = await import("@/lib/api");
        const results = await api.searchAllContent(searchQuery, 500, 1);
        setSearchResults(results);
        setIsSearching(false);
      } catch (error) {
        logger.error("Search error:", error);
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  if (heroLoading) return <FullPageSpinner text="Loading..." />;

  const swiperProps = {
    modules: [Navigation],
    navigation: true,
    spaceBetween: 8,
    slidesPerView: 3,
    breakpoints: { 480: { slidesPerView: 4 }, 768: { slidesPerView: 5 }, 1024: { slidesPerView: 6 }, 1280: { slidesPerView: 8 } },
  };

  return (
    <>
      <div className="min-h-screen bg-[#141414] text-white pb-4">
        <h1 className="sr-only">Katiwatch - VJ Translated Movies in Luganda | Watch VJ Junior, VJ Jjingo Movies Uganda Free Online</h1>
        
        {/* SEO-optimized hidden content for search engines */}
        <div className="sr-only">
          <h2>Watch VJ Translated Movies in Luganda Online Free</h2>
          <p>Katiwatch is Uganda&apos;s #1 platform for VJ translated movies in Luganda. Stream Hollywood, Bollywood, and Korean drama movies dubbed in Luganda by top Ugandan VJs including VJ Junior, VJ Jjingo, ICE P, VJ Emmy, and VJ Kevo. Watch free VJ movies online, download translated movies, and enjoy premium VJ series. New VJ movies added daily.</p>
          
          <h3>Popular VJ Translators on Katiwatch</h3>
          <ul>
            <li>VJ Junior Movies - Watch VJ Junior translated movies in Luganda</li>
            <li>VJ Jjingo Movies - Stream VJ Jjingo dubbed movies and series</li>
            <li>ICE P Movies - Watch ICE P translated movies online</li>
            <li>VJ Emmy Movies - Stream VJ Emmy Luganda movies</li>
            <li>VJ Kevo Movies - Watch VJ Kevo translated content</li>
          </ul>
          
          <h3>Categories of VJ Translated Movies</h3>
          <ul>
            <li>Hollywood movies in Luganda - Action, thriller, romance movies translated</li>
            <li>Bollywood movies in Luganda - Indian movies dubbed by VJs</li>
            <li>Korean drama in Luganda - K-drama translated to Luganda</li>
            <li>Chinese movies in Luganda - Asian content translated by VJs</li>
            <li>VJ translated series - TV shows dubbed in Luganda</li>
            <li>Latest 2026 VJ movies - New releases translated to Luganda</li>
          </ul>
          
          <h3>Why Choose Katiwatch for VJ Movies?</h3>
          <ul>
            <li>100% Free VJ translated movies streaming</li>
            <li>Daily updates with new VJ movies and series</li>
            <li>HD quality VJ dubbed content</li>
            <li>All popular Ugandan VJ translators in one place</li>
            <li>Mobile-friendly VJ movie streaming</li>
            <li>Download VJ movies for offline watching</li>
            <li>Premium VJ content and exclusive releases</li>
          </ul>
          
          <h3>Watch VJ Movies by Genre</h3>
          <p>Action movies in Luganda, Comedy movies in Luganda, Romance movies in Luganda, Horror movies in Luganda, Drama series in Luganda, Thriller movies in Luganda, Sci-Fi movies in Luganda, Animation movies in Luganda</p>
          
          <h3>Katiwatch - Your Home for VJ Translated Movies in Uganda</h3>
          <p>Stream thousands of VJ translated movies and series online. Katiwatch.com brings you the latest Hollywood, Bollywood, and international movies translated to Luganda by your favorite Ugandan VJs. Watch VJ Junior movies, VJ Jjingo movies, ICE P movies, and more. New VJ translations added every day. Join millions of Ugandans watching free VJ movies on Katiwatch.</p>
        </div>

        {/* Hero Section - FMovies Style with Auto-Changing Slider */}
        <section className="relative min-h-[80vh] md:min-h-[85vh] w-full md:overflow-hidden md:mb-12">
          {/* Background with auto-changing movie slides */}
          <div className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={slide.cover_image_url || `https://via.placeholder.com/1920x1080/1a1a2e/e50914?text=${encodeURIComponent(slide.title)}`}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  onError={(e) => { 
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x1080/1a1a2e/e50914?text=${encodeURIComponent(slide.title)}`; 
                  }}
                />
              </div>
            ))}
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/80 via-[#1a1a2e]/85 to-[#141414] z-20" />
          </div>

          {/* Centered Content */}
          <div className="relative z-30 flex flex-col items-center justify-center h-full min-h-[80vh] md:min-h-[85vh] px-4 py-4 md:py-12">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Large Logo/Title */}
              <div className="mb-8">
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight">
                  <span className="text-white">KATI</span>
                  <span className="text-[#E50914]">WATCH</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg mt-4 font-medium tracking-wide">
                  WATCH MOVIES & TV SERIES | ENTERTAINMENT
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-2xl mx-auto">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search movie and series..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 md:py-5 pr-14 bg-[#2a2a3e]/80 backdrop-blur-sm border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#E50914] transition-all duration-300 text-base md:text-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Results are already shown inline via useEffect
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#E50914] hover:bg-[#b80710] flex items-center justify-center transition-all duration-300 hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault();
                      // Results are shown inline automatically
                    }}
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="font-bold px-10 py-6 rounded-full bg-[#E50914] text-white hover:bg-[#b80710] transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-[#E50914]/50 hover:scale-105 text-base md:text-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    const authCheck = checkAuth(featuredItem?.is_premium || false);
                    if (!authCheck.allowed) {
                      setAuthModal({ isOpen: true, action: 'play', requirePremium: authCheck.reason === 'premium_required' });
                    } else if (featuredItem) {
                      window.location.href = `/${featuredItem.type === 'movie' ? 'movies' : 'series'}/${featuredItem.id}`;
                    }
                  }}
                >
                  <Play className="w-6 h-6 fill-current" />
                  Kati watch
                </Button>
                <Link
                  href="/english-movies"
                  className="font-bold px-8 py-[14px] rounded-full border-2 border-orange-500/60 text-white hover:bg-orange-500/20 hover:border-orange-500 transition-all duration-300 text-base md:text-lg"
                >
                  🎬 Non-Translated
                </Link>
              </div>

              {/* Featured Content Info with fade animation */}
              {featuredItem && (
                <div 
                  key={featuredItem.id}
                  className="pt-8 text-center space-y-3 animate-fade-in"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Featured: {featuredItem.title}
                  </h2>
                  <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-300">
                    {featuredItem.release_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#E50914]" />
                        <span className="font-medium">
                          {new Date(typeof featuredItem.release_date === "string" ? featuredItem.release_date.replace(/ /g, "T") : featuredItem.release_date).getFullYear()}
                        </span>
                      </div>
                    )}
                    {featuredItem.vjs && (
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#E50914]" />
                        <span className="font-medium">{featuredItem.vjs.name}</span>
                      </div>
                    )}
                  </div>
                  {featuredItem.description && (
                    <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto line-clamp-2 leading-relaxed">
                      {featuredItem.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add fade animation keyframes */}
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.5s ease-out;
            }
          `}</style>

          {/* Regions horizontal strip — inside hero on mobile */}
          {regions.length > 0 && (
            <div className="relative z-30 md:hidden px-4 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Browse by Region</h2>
                <Link href="/regions" className="text-[#E50914] font-semibold flex items-center gap-1 text-sm">
                  See More <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {regions.map(region => {
                  const icons: Record<string,string> = { 'kdrama':'🇰🇷','chinese-drama':'🇨🇳','western':'🇺🇸','bollywood':'🇮🇳','nollywood':'🇳🇬','east-african':'🇺🇬','anime':'🇯🇵','latin':'🇲🇽','turkish':'🇹🇷','filipino':'🇵🇭','thai':'🇹🇭' };
                  const themes: Record<string,{from:string;to:string}> = { 'kdrama':{from:'#e8f0fe',to:'#c7d9f8'},'chinese-drama':{from:'#fde8e8',to:'#f8c7c7'},'western':{from:'#e8f4fd',to:'#c7e6f8'},'bollywood':{from:'#fef3e8',to:'#f8dfc7'},'nollywood':{from:'#e8fdf0',to:'#c7f8d9'},'east-african':{from:'#e8fdf8',to:'#c7f8ee'},'anime':{from:'#fde8ee',to:'#f8c7d4'},'latin':{from:'#fef0e8',to:'#f8d9c7'},'turkish':{from:'#fde8e8',to:'#f8c7c7'},'filipino':{from:'#e8eefe',to:'#c7d2f8'},'thai':{from:'#f0e8fe',to:'#d9c7f8'} };
                  const t = themes[region.slug] || { from:'#1f2937', to:'#374151' };
                  return (
                    <Link
                      key={region.slug}
                      href={`/regions/${region.slug}`}
                      className="flex-shrink-0 w-[120px] rounded-xl overflow-hidden border border-gray-200/40"
                      style={{ background: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)` }}
                    >
                      <div className="p-3 flex flex-col items-center text-center gap-1">
                        <span className="text-3xl">{icons[region.slug] || '🌍'}</span>
                        <span className="text-gray-800 font-bold text-xs leading-tight line-clamp-2">{region.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Search Results Section */}
        {showSearchResults && searchQuery && (
          <section className="mb-16 container mx-auto px-4 md:px-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Search Results for &quot;{searchQuery}&quot;
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Clear
              </button>
            </div>

            {isSearching ? (
              <div className="flex justify-center py-12">
                <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
                {searchResults.map((item) => (
                  <NetflixCard 
                    key={item.id} 
                    content={item} 
                    type={item.type || 'movie'} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No results found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-500 text-sm mt-2">Try different keywords or browse our catalog below</p>
              </div>
            )}
          </section>
        )}

        {/* Regions horizontal strip — desktop only (mobile is inside hero) */}
        {regions.length > 0 && (
          <section className="hidden md:block mb-10 container mx-auto px-4 md:px-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Browse by Region</h2>
              <Link href="/regions" className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors text-sm">
                See More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {regions.map(region => {
                const icons: Record<string,string> = { 'kdrama':'🇰🇷','chinese-drama':'🇨🇳','western':'🇺🇸','bollywood':'🇮🇳','nollywood':'🇳🇬','east-african':'🇺🇬','anime':'🇯🇵','latin':'🇲🇽','turkish':'🇹🇷','filipino':'🇵🇭','thai':'🇹🇭' };
                const themes: Record<string,{from:string;to:string}> = { 'kdrama':{from:'#1e3a8a',to:'#3b82f6'},'chinese-drama':{from:'#7f1d1d',to:'#dc2626'},'western':{from:'#1e40af',to:'#3b82f6'},'bollywood':{from:'#ea580c',to:'#f97316'},'nollywood':{from:'#065f46',to:'#059669'},'east-african':{from:'#0f766e',to:'#14b8a6'},'anime':{from:'#be123c',to:'#e11d48'},'latin':{from:'#b91c1c',to:'#dc2626'},'turkish':{from:'#991b1b',to:'#dc2626'},'filipino':{from:'#1e40af',to:'#3b82f6'},'thai':{from:'#1e3a8a',to:'#3b82f6'} };
                const t = themes[region.slug] || { from:'#1f2937', to:'#374151' };
                return (
                  <Link
                    key={region.slug}
                    href={`/regions/${region.slug}`}
                    className="flex-shrink-0 w-[140px] rounded-xl overflow-hidden border border-gray-800 hover:scale-105 transition-all duration-300"
                    style={{ background: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)` }}
                  >
                    <div className="p-3 flex flex-col items-center text-center gap-1">
                      <span className="text-3xl">{icons[region.slug] || '🌍'}</span>
                      <span className="text-white font-bold text-xs leading-tight line-clamp-2">{region.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* New 2026 Movies */}
        {movies2026.length > 0 && (
          <section className="mb-16 container mx-auto px-4 md:px-12 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 to-transparent pointer-events-none rounded-t-3xl -z-10" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1 group">
                <h2 className="text-[10px] md:text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase">
                  Exclusive Premieres
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300 uppercase tracking-wide drop-shadow-sm">
                    New Movies 2026
                  </span>
                  <div className="h-[2px] w-16 bg-gradient-to-r from-white/40 to-transparent rounded-full mt-1" />
                </div>
              </div>
              <Link href="/movies?year=2026" className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
                See More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {contentLoading ? <SwiperSkeleton /> : (
              <Swiper
                {...swiperProps}
                className="movies-2026-swiper !pb-4"
              >
                {movies2026.map(movie => (
                  <SwiperSlide key={movie.id}>
                    <NetflixCard content={movie} type="movie" variant="cinematic" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>
        )}

        {/* Trending */}
        {trendingContent.length > 0 && (
          <section className="mb-16 container mx-auto px-4 md:px-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600">Trending Today</h2>
              <span className="text-4xl md:text-5xl animate-bounce" style={{ animationDuration: '1.5s' }}>🔥</span>
            </div>
            <Swiper modules={[Navigation]} navigation spaceBetween={16} slidesPerView={1.5}
              breakpoints={{ 480: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 4.5 } }}
              className="trending-swiper"
            >
              {trendingContent.map((item) => (
                <SwiperSlide key={item.id}>
                  <Link href={item.type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`} className="group block">
                    <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                      <Image
                        src={item.cover_image_url || item.thumbnail_url || `https://via.placeholder.com/640x360/1f2937/e50914?text=${encodeURIComponent(item.title)}`}
                        alt={item.title}
                        fill
                        sizes="(max-width:480px) 66vw, (max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/640x360/1f2937/e50914?text=${encodeURIComponent(item.title)}`; }}
                      />
                      <div className="absolute top-3 right-3 z-10">
                        {item.trending === 'hot' ? (
                          <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <span className="text-orange-500 text-sm">🔥</span>
                            <span className="text-xs font-bold text-gray-900">Going viral</span>
                          </div>
                        ) : (
                          <div className="bg-white px-3 py-1.5 rounded-full shadow-lg">
                            <span className="text-xs font-bold text-gray-900">Trending today</span>
                          </div>
                        )}
                      </div>
                      {item.trending === 'hot' && (
                        <div className="absolute bottom-10 right-3 z-10"><span className="text-2xl">🔥</span></div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-[5]" />
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="flex items-center gap-2 mb-1 text-xs text-gray-300">
                          {item.release_date && <span>{new Date(typeof item.release_date === "string" ? item.release_date.replace(/ /g, "T") : item.release_date).getFullYear()}</span>}
                          {'duration' in item && item.duration && <><span>•</span><span>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span></>}
                          {item.type === 'series' && <><span>•</span><span>(Season 1)</span></>}
                        </div>
                        <h3 className="text-white font-bold text-base line-clamp-1">{item.title}</h3>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Movies with genre filter */}
        <section className="mb-16 container mx-auto px-4 md:px-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#E50914]">Movies</h2>
            <Link href="/movies" className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
              See More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Genre filter with proper boundaries */}
          <div className="relative mb-8">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {filterOptions.map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full 
                    text-sm font-semibold whitespace-nowrap
                    transition-all duration-300
                    ${selectedFilter === filter 
                      ? 'bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/40 scale-105' 
                      : 'bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
            {/* Gradient fade on sides */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#141414] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#141414] to-transparent pointer-events-none" />
          </div>
          
          {contentLoading ? <SwiperSkeleton /> : filterLoading ? (
            <div className="flex justify-center py-12"><span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
</span></div>
          ) : (
            <Swiper {...swiperProps} className="movies-swiper">
              {filteredMovies.slice(0, 16).map(movie => (
                <SwiperSlide key={movie.id}><NetflixCard content={movie} type="movie" /></SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        {/* TV Shows with genre filter */}
        <section className="mb-16 container mx-auto px-4 md:px-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#E50914]">TV Shows</h2>
            <Link href="/series" className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
              See More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Genre filter with proper boundaries */}
          <div className="relative mb-8">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {filterOptions.map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedSeriesFilter(filter)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full 
                    text-sm font-semibold whitespace-nowrap
                    transition-all duration-300
                    ${selectedSeriesFilter === filter 
                      ? 'bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/40 scale-105' 
                      : 'bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
            {/* Gradient fade on sides */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#141414] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#141414] to-transparent pointer-events-none" />
          </div>
          
          {contentLoading ? <SwiperSkeleton /> : seriesFilterLoading ? (
            <div className="flex justify-center py-12"><span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
</span></div>
          ) : (
            <Swiper {...swiperProps} className="series-swiper">
              {filteredSeries.slice(0, 16).map(series => (
                <SwiperSlide key={series.id}><NetflixCard content={series} type="series" /></SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        {/* Genre rows — loaded lazily, show skeleton until ready */}
        {genreRows.length === 0 && !contentLoading && (
          <section className="mb-16 container mx-auto px-4 md:px-12">
            <div className="h-6 w-48 bg-gray-800/50 rounded animate-pulse mb-6" />
            <SwiperSkeleton />
          </section>
        )}

        {genreRows.map(genre => (
          <React.Fragment key={genre.name}>
            {genre.movies.length > 0 && (
              <section className="mb-4 container mx-auto px-4 md:px-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#E50914]">{genre.name} Movies</h2>
                  <Link href={`/movies?genre=${genre.name.toLowerCase()}`} className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
                    See More <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <Swiper {...swiperProps} className={`genre-movies-${genre.name.toLowerCase()}-swiper`}>
                  {genre.movies.slice(0, 16).map(movie => (
                    <SwiperSlide key={movie.id}><NetflixCard content={movie} type="movie" /></SwiperSlide>
                  ))}
                </Swiper>
              </section>
            )}
            {genre.series?.length > 0 && (
              <section className="mb-4 container mx-auto px-4 md:px-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#E50914]">{genre.name} Series</h2>
                  <Link href={`/series?genre=${genre.name.toLowerCase()}`} className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
                    See More <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <Swiper {...swiperProps} className={`genre-series-${genre.name.toLowerCase()}-swiper`}>
                  {genre.series.slice(0, 16).map(series => (
                    <SwiperSlide key={series.id}><NetflixCard content={series} type="series" /></SwiperSlide>
                  ))}
                </Swiper>
              </section>
            )}
          </React.Fragment>
        ))}

        {/* Animation Row - from Reelplexi */}
        {animationContent.length > 0 && (
          <section className="mb-16 container mx-auto px-4 md:px-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#E50914]">Animation</h2>
              <Link href="/movies?genre=animation" className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
                See More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Swiper {...swiperProps} className="animation-swiper">
              {animationContent.map(item => (
                <SwiperSlide key={`anim-${item.id}`}>
                  <NetflixCard content={item} type={item.type} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Region Rows */}
        {regionRows.map(region => (
          region.content.length > 0 && (
            <section key={region.slug} className="mb-16 container mx-auto px-4 md:px-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[#E50914]">{region.name}</h2>
                <Link href={`/regions/${region.slug}`} className="text-[#E50914] hover:text-[#b80710] font-semibold flex items-center gap-2 transition-colors">
                  See More <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <Swiper {...swiperProps} className={`region-${region.slug}-swiper`}>
                {region.content.map(item => (
                  <SwiperSlide key={`${region.slug}-${item.id}`}>
                    <NetflixCard content={item} type={item.type || 'movie'} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )
        ))}
      </div>

      <AuthRequiredModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        action={authModal.action}
        requirePremium={authModal.requirePremium}
      />
    </>
  );
}
