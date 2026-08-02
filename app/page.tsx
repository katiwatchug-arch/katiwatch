"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Info, Plus, Star, Calendar, Mic, ChevronRight, Heart, Search } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { NetflixCard } from "@/components/NetflixCard";
import { FullPageSpinner } from "@/components/LoadingSpinner";
import { getVJContent, getMovieById, getSeriesById, getMovies, getSeries, getGenreRowsForHome, searchMovies } from "@/lib/api";
import { Movie, Series } from "@/lib/supabase";
import { useAuthCheck } from "@/components/AuthRequiredModal";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";

type VJContent = (Movie | Series) & {
  type: 'movie' | 'series';
  vjs: { id: string; name: string } | null;
  is_premium?: boolean;
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
  const router = useRouter();
  const [featuredItem, setFeaturedItem] = useState<VJContent | null>(null);
  const [latestMovies, setLatestMovies] = useState<any[]>([]);
  const [latestSeries, setLatestSeries] = useState<any[]>([]);
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [genreRows, setGenreRows] = useState<{ name: string; movies: any[]; series: any[] }[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; action: 'play' | 'download'; requirePremium?: boolean }>({ isOpen: false, action: 'play' });

  const { checkAuth } = useAuthCheck();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserPreferences();
  const genresFetched = useRef(false);

  // Phase 1: Load hero immediately
  useEffect(() => {
    getVJContent(1).then(async vjData => {
      const item = vjData[0] as any;
      if (!item) { setHeroLoading(false); return; }

      if (!item.description?.trim()) {
        try {
          const details = item.type === 'movie'
            ? await getMovieById(item.id)
            : await getSeriesById(item.id);
          if (details?.description) { setFeaturedItem({ ...item, description: details.description } as any); setHeroLoading(false); return; }
        } catch {}
      }
      setFeaturedItem(item as any);
      setHeroLoading(false);
    }).catch(() => setHeroLoading(false));
  }, []);

  // Phase 2: Load movies + series in parallel (show as soon as ready)
  useEffect(() => {
    Promise.all([getMovies(24), getSeries(24)])
      .then(([movies, series]) => {
        setLatestMovies(movies);
        setLatestSeries(series);
        setFilteredMovies(movies);
        setTrendingContent([
          ...movies.slice(0, 3).map((m: any) => ({ ...m, type: 'movie', trending: 'hot' })),
          ...series.slice(0, 3).map((s: any) => ({ ...s, type: 'series', trending: 'today' })),
        ]);
        setContentLoading(false);
      })
      .catch(() => setContentLoading(false));
  }, []);

  // Phase 3: Load genre rows after content is visible (deferred)
  useEffect(() => {
    if (contentLoading || genresFetched.current) return;
    genresFetched.current = true;
    // Use setTimeout as a safe fallback — requestIdleCallback is not supported on iOS Safari
    const id = setTimeout(() => {
      getGenreRowsForHome(12).then(rows => setGenreRows(rows)).catch(() => {});
    }, 500);
    return () => clearTimeout(id);
  }, [contentLoading]);

  // Genre filter
  useEffect(() => {
    if (selectedFilter === 'All') { setFilteredMovies(latestMovies); return; }
    setFilterLoading(true);
    searchMovies('', 16, 1, undefined, selectedFilter.toLowerCase())
      .then(r => setFilteredMovies(r.length > 0 ? r : latestMovies))
      .catch(() => setFilteredMovies(latestMovies))
      .finally(() => setFilterLoading(false));
  }, [selectedFilter, latestMovies]);

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
        <h1 className="sr-only">Katiwatch - We Are Entertainment</h1>

        {/* Hero Section - FMovies Style */}
        <section className="relative min-h-[80vh] md:min-h-[85vh] w-full overflow-hidden mb-12">
          {/* Background with movie collage */}
          {featuredItem && (
            <div className="absolute inset-0">
              <Image
                src={featuredItem.cover_image_url || `https://via.placeholder.com/1920x1080/1a1a2e/e50914?text=${encodeURIComponent(featuredItem.title)}`}
                alt={featuredItem.title}
                fill
                className="object-cover opacity-20"
                priority
                sizes="100vw"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x1080/1a1a2e/e50914?text=${encodeURIComponent(featuredItem.title)}`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/95 via-[#1a1a2e]/90 to-[#141414]" />
            </div>
          )}

          {/* Centered Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[80vh] md:min-h-[85vh] px-4 py-12">
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
                    className="w-full px-6 py-4 md:py-5 pr-14 bg-[#2a2a3e]/80 backdrop-blur-sm border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#E50914] transition-all duration-300 text-base md:text-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const query = (e.target as HTMLInputElement).value;
                        if (query.trim()) {
                          router.push(`/search?q=${encodeURIComponent(query)}`);
                        }
                      }
                    }}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#E50914] hover:bg-[#b80710] flex items-center justify-center transition-all duration-300 hover:scale-110"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Search movie and series..."]') as HTMLInputElement;
                      if (input?.value.trim()) {
                        router.push(`/search?q=${encodeURIComponent(input.value)}`);
                      }
                    }}
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  className="font-bold px-10 py-6 rounded-full bg-[#E50914] text-white hover:bg-[#b80710] transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-[#E50914]/50 hover:scale-105 text-base md:text-lg mx-auto"
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
                  Watch Here Katiwatch
                </Button>
              </div>

              {/* Featured Content Info (if available) */}
              {featuredItem && (
                <div className="pt-8 text-center space-y-3">
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Featured: {featuredItem.title}
                  </h2>
                  <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-400">
                    {featuredItem.release_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#E50914]" />
                        {new Date(typeof featuredItem.release_date === "string" ? featuredItem.release_date.replace(/ /g, "T") : featuredItem.release_date).getFullYear()}
                      </div>
                    )}
                    {featuredItem.vjs && (
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#E50914]" />
                        {featuredItem.vjs.name}
                      </div>
                    )}
                  </div>
                  {featuredItem.description && (
                    <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto line-clamp-2">
                      {featuredItem.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

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
                          {item.duration && <><span>•</span><span>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span></>}
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
                  onClick={() => {
                    // This will be implemented when user clicks
                    // For now it just shows the UI
                  }}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full 
                    text-sm font-semibold whitespace-nowrap
                    transition-all duration-300
                    bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105
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
          
          {contentLoading ? <SwiperSkeleton /> : (
            <Swiper {...swiperProps} className="series-swiper">
              {latestSeries.slice(0, 16).map(series => (
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
