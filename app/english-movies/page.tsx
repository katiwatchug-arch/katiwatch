"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, Film, Tv, Download, ChevronLeft, ChevronRight, 
  X, Star, Calendar, Loader2, ArrowLeft, CheckCircle2, 
  FileText, Sparkles, Filter
} from "lucide-react";
import { 
  getEnglishMovies, 
  searchEnglishMovies, 
  getEnglishMovieDownloads,
  getEnglishSeries,
  searchEnglishSeries,
  getEnglishSeriesDetails,
  getEnglishSeriesSeason,
  getEnglishEpisodeDownloads
} from "@/lib/api";

type EnglishItem = {
  id: string;
  tmdb_id: string;
  title: string;
  description: string;
  poster_url: string;
  thumbnail_url: string;
  cover_image_url: string;
  release_date: string;
  vote_average?: number;
  runtime?: number | null;
  number_of_seasons?: number | null;
  genres: string[];
  genre_ids: (number | string)[];
  type: "english-movie" | "english-series";
};

type DownloadOption = {
  resolution: number;
  quality: string;
  name: string;
  size_bytes: number;
  size_readable: string;
  url: string;
  proxy_url: string;
  type: string;
};

type SubtitleOption = {
  name: string;
  language: string;
  language_code?: string;
  url: string;
  size_readable?: string;
  format?: string;
};

type SeriesSeason = {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episode_count: number;
  poster_url: string;
};

type SeriesEpisode = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_url: string;
  air_date: string;
  vote_average?: number;
};

const GENRE_MAP: Record<string, number[]> = {
  "action": [28, 10759, 12],
  "comedy": [35],
  "scifi": [878, 10765, 14],
  "animation": [16],
  "thriller": [53, 80, 9648],
  "horror": [27],
  "drama": [18],
  "romance": [10749],
};

const FILTER_PILLS = [
  { id: "all", label: "All" },
  { id: "trending-movies", label: "Trending Movies" },
  { id: "trending-series", label: "Trending Series" },
  { id: "popular-movies", label: "Popular Movies" },
  { id: "popular-series", label: "Popular Series" },
  { id: "now-playing", label: "In Theaters" },
  { id: "top-rated", label: "Top Rated" },
  { id: "upcoming", label: "Upcoming" },
  { id: "genre-action", label: "Action & Adventure" },
  { id: "genre-comedy", label: "Comedy" },
  { id: "genre-scifi", label: "Sci-Fi & Fantasy" },
  { id: "genre-animation", label: "Animation" },
  { id: "genre-thriller", label: "Thriller & Crime" },
  { id: "genre-horror", label: "Horror" },
  { id: "genre-drama", label: "Drama" },
];

export default function EnglishMoviesPage() {
  // Rows state
  const [heroSlides, setHeroSlides] = useState<EnglishItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [trendingMovies, setTrendingMovies] = useState<EnglishItem[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<EnglishItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<EnglishItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<EnglishItem[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<EnglishItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<EnglishItem[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<EnglishItem[]>([]);

  // Genre rows
  const [actionItems, setActionItems] = useState<EnglishItem[]>([]);
  const [comedyItems, setComedyItems] = useState<EnglishItem[]>([]);
  const [scifiItems, setScifiItems] = useState<EnglishItem[]>([]);
  const [animationItems, setAnimationItems] = useState<EnglishItem[]>([]);
  const [thrillerItems, setThrillerItems] = useState<EnglishItem[]>([]);
  const [horrorItems, setHorrorItems] = useState<EnglishItem[]>([]);
  const [dramaItems, setDramaItems] = useState<EnglishItem[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EnglishItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // See More (Grid View) state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string>("");
  const [gridItems, setGridItems] = useState<EnglishItem[]>([]);
  const [gridPage, setGridPage] = useState(1);
  const [gridHasMore, setGridHasMore] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridLoadingMore, setGridLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Portal mounting state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Download Modal state
  const [selectedItem, setSelectedItem] = useState<EnglishItem | null>(null);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [downloads, setDownloads] = useState<DownloadOption[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleOption[]>([]);
  const [downloadError, setDownloadError] = useState("");

  // Series Season & Episode state in modal
  const [seasons, setSeasons] = useState<SeriesSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<SeriesEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Row scroll references
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollRow = (id: string, direction: "left" | "right") => {
    const el = rowRefs.current[id];
    if (el) {
      el.scrollBy({ left: direction === "left" ? -600 : 600, behavior: "smooth" });
    }
  };

  // Helper to categorize items by genre
  const filterByGenre = (items: EnglishItem[], genreKey: string) => {
    const targetIds = GENRE_MAP[genreKey] || [];
    return items.filter(item => {
      // Check genre_ids
      const hasNumericMatch = item.genre_ids?.some(gid => targetIds.includes(Number(gid)));
      if (hasNumericMatch) return true;
      // Check genre names
      const genreLower = genreKey.toLowerCase();
      return item.genres?.some(g => g.toLowerCase().includes(genreLower));
    });
  };

  // 1. Initial Data Fetching for Rows
  useEffect(() => {
    async function loadInitialData() {
      setLoadingInitial(true);
      try {
        const [
          trendMov, 
          trendSer, 
          popMov, 
          popSer, 
          nowPlay, 
          topMov, 
          upMov
        ] = await Promise.all([
          getEnglishMovies("trending", 20, 1),
          getEnglishSeries("trending", 20, 1),
          getEnglishMovies("popular", 20, 1),
          getEnglishSeries("popular", 20, 1),
          getEnglishMovies("now-playing", 20, 1),
          getEnglishMovies("top-rated", 20, 1),
          getEnglishMovies("upcoming", 20, 1),
        ]);

        const safeTrendMov = (trendMov || []) as EnglishItem[];
        const safeTrendSer = (trendSer || []) as EnglishItem[];
        const safePopMov = (popMov || []) as EnglishItem[];
        const safePopSer = (popSer || []) as EnglishItem[];
        const safeNowPlay = (nowPlay || []) as EnglishItem[];
        const safeTopMov = (topMov || []) as EnglishItem[];
        const safeUpMov = (upMov || []) as EnglishItem[];

        setTrendingMovies(safeTrendMov);
        setTrendingSeries(safeTrendSer);
        setPopularMovies(safePopMov);
        setPopularSeries(safePopSer);
        setNowPlayingMovies(safeNowPlay);
        setTopRatedMovies(safeTopMov);
        setUpcomingMovies(safeUpMov);

        // Hero slides: top 5 from trending movies & series
        const combinedHero = [...safeTrendMov.slice(0, 3), ...safeTrendSer.slice(0, 2)];
        setHeroSlides(combinedHero.length > 0 ? combinedHero : safePopMov.slice(0, 5));

        // Aggregate pool for genre distribution
        const pool = [...safePopMov, ...safeTrendMov, ...safeNowPlay, ...safeTopMov, ...safePopSer, ...safeTrendSer];
        const uniquePoolMap = new Map<string, EnglishItem>();
        pool.forEach(item => {
          if (item && item.id && !uniquePoolMap.has(item.id)) {
            uniquePoolMap.set(item.id, item);
          }
        });
        const allItems = Array.from(uniquePoolMap.values());

        setActionItems(filterByGenre(allItems, "action"));
        setComedyItems(filterByGenre(allItems, "comedy"));
        setScifiItems(filterByGenre(allItems, "scifi"));
        setAnimationItems(filterByGenre(allItems, "animation"));
        setThrillerItems(filterByGenre(allItems, "thriller"));
        setHorrorItems(filterByGenre(allItems, "horror"));
        setDramaItems(filterByGenre(allItems, "drama"));
      } catch (err) {
        console.error("Error loading English catalog:", err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadInitialData();
  }, []);

  // 2. Auto-rotate hero slider
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // 3. Search handling with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [movResults, serResults] = await Promise.all([
          searchEnglishMovies(searchQuery.trim(), 40, 1),
          searchEnglishSeries(searchQuery.trim(), 30, 1),
        ]);
        const combined = [...(movResults || []), ...(serResults || [])] as EnglishItem[];
        setSearchResults(combined);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 4. "See More" category grid fetcher
  const openCategoryGrid = useCallback((categoryKey: string, categoryTitle: string) => {
    setActiveCategory(categoryKey);
    setActiveCategoryTitle(categoryTitle);
    setGridPage(1);
    setGridItems([]);
    setGridHasMore(true);
    setGridLoading(true);

    // Initial page load for the selected category
    fetchCategoryPage(categoryKey, 1, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeCategoryGrid = () => {
    setActiveCategory(null);
    setActiveCategoryTitle("");
    setGridItems([]);
  };

  const fetchCategoryPage = async (categoryKey: string, page: number, append: boolean) => {
    if (append) {
      setGridLoadingMore(true);
    } else {
      setGridLoading(true);
    }

    try {
      let results: EnglishItem[] = [];

      switch (categoryKey) {
        case "trending-movies":
          results = (await getEnglishMovies("trending", 24, page)) as EnglishItem[];
          break;
        case "trending-series":
          results = (await getEnglishSeries("trending", 24, page)) as EnglishItem[];
          break;
        case "popular-movies":
          results = (await getEnglishMovies("popular", 24, page)) as EnglishItem[];
          break;
        case "popular-series":
          results = (await getEnglishSeries("popular", 24, page)) as EnglishItem[];
          break;
        case "now-playing":
          results = (await getEnglishMovies("now-playing", 24, page)) as EnglishItem[];
          break;
        case "top-rated":
          results = (await getEnglishMovies("top-rated", 24, page)) as EnglishItem[];
          break;
        case "upcoming":
          results = (await getEnglishMovies("upcoming", 24, page)) as EnglishItem[];
          break;
        default:
          // Genre based filtering
          if (categoryKey.startsWith("genre-")) {
            const genreName = categoryKey.replace("genre-", "");
            const [m, s] = await Promise.all([
              getEnglishMovies("popular", 30, page),
              getEnglishSeries("popular", 20, page)
            ]);
            const combined = [...((m || []) as EnglishItem[]), ...((s || []) as EnglishItem[])];
            results = filterByGenre(combined, genreName);
          } else {
            results = (await getEnglishMovies("popular", 24, page)) as EnglishItem[];
          }
          break;
      }

      if (append) {
        setGridItems(prev => {
          const seen = new Set(prev.map(i => i.id));
          const fresh = results.filter(i => !seen.has(i.id));
          return [...prev, ...fresh];
        });
      } else {
        setGridItems(results);
      }

      setGridHasMore(results.length >= 10);
    } catch (err) {
      console.error("Error fetching category page:", err);
      if (!append) setGridItems([]);
      setGridHasMore(false);
    } finally {
      setGridLoading(false);
      setGridLoadingMore(false);
    }
  };

  // Infinite scroll observer for category grid
  useEffect(() => {
    if (!activeCategory || gridLoading || gridLoadingMore || !gridHasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && gridHasMore && !gridLoading && !gridLoadingMore) {
          const nextPage = gridPage + 1;
          setGridPage(nextPage);
          fetchCategoryPage(activeCategory, nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [activeCategory, gridLoading, gridLoadingMore, gridHasMore, gridPage]);

  // 5. Open Download Modal
  const openDownloadModal = async (item: EnglishItem) => {
    setSelectedItem(item);
    setDownloads([]);
    setSubtitles([]);
    setDownloadError("");
    setSeasons([]);
    setEpisodes([]);
    setSelectedSeason(1);
    setSelectedEpisode(1);

    if (item.type === "english-series") {
      // Fetch series details to populate seasons
      setLoadingSeasons(true);
      try {
        const details = await getEnglishSeriesDetails(item.tmdb_id || item.id);
        if (details && details.seasons && details.seasons.length > 0) {
          // Filter out season 0 specials if other seasons exist
          const validSeasons = details.seasons.filter((s: any) => s.season_number > 0);
          const finalSeasons = validSeasons.length > 0 ? validSeasons : details.seasons;
          setSeasons(finalSeasons);
          const initialSeason = finalSeasons[0].season_number;
          setSelectedSeason(initialSeason);

          // Fetch initial season episodes
          await loadSeasonEpisodes(item.tmdb_id || item.id, initialSeason);
        } else {
          // Fallback to Season 1
          setSeasons([{ id: 1, season_number: 1, name: "Season 1", overview: "", episode_count: 10, poster_url: "" }]);
          await fetchEpisodeDownloads(item.tmdb_id || item.id, 1, 1);
        }
      } catch (err) {
        console.error("Error fetching series details:", err);
      } finally {
        setLoadingSeasons(false);
      }
    } else {
      // Movie: directly fetch download links
      setLoadingDownloads(true);
      try {
        const data = await getEnglishMovieDownloads(item.tmdb_id || item.id);
        if (data && data.downloads && data.downloads.length > 0) {
          setDownloads(data.downloads as DownloadOption[]);
          setSubtitles((data.subtitles || []) as SubtitleOption[]);
        } else {
          setDownloadError("Download links are being prepared for this title. Please try again in a few moments.");
        }
      } catch (err) {
        console.error("Error fetching movie downloads:", err);
        setDownloadError("Failed to fetch download links. Please check your connection and try again.");
      } finally {
        setLoadingDownloads(false);
      }
    }
  };

  const loadSeasonEpisodes = async (tmdbId: string, seasonNumber: number) => {
    setLoadingEpisodes(true);
    try {
      const seasonData = await getEnglishSeriesSeason(tmdbId, seasonNumber);
      if (seasonData && seasonData.episodes && seasonData.episodes.length > 0) {
        setEpisodes(seasonData.episodes);
        const firstEp = seasonData.episodes[0].episode_number;
        setSelectedEpisode(firstEp);
        // Automatically fetch downloads for episode 1
        await fetchEpisodeDownloads(tmdbId, seasonNumber, firstEp);
      } else {
        setEpisodes([]);
      }
    } catch (err) {
      console.error("Error loading season episodes:", err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleSeasonChange = async (seasonNumber: number) => {
    if (!selectedItem) return;
    setSelectedSeason(seasonNumber);
    await loadSeasonEpisodes(selectedItem.tmdb_id || selectedItem.id, seasonNumber);
  };

  const handleEpisodeChange = async (epNumber: number) => {
    if (!selectedItem) return;
    setSelectedEpisode(epNumber);
    await fetchEpisodeDownloads(selectedItem.tmdb_id || selectedItem.id, selectedSeason, epNumber);
  };

  const fetchEpisodeDownloads = async (tmdbId: string, seasonNum: number, epNum: number) => {
    setLoadingDownloads(true);
    setDownloads([]);
    setSubtitles([]);
    setDownloadError("");

    try {
      const data = await getEnglishEpisodeDownloads(tmdbId, seasonNum, epNum);
      if (data && data.downloads && data.downloads.length > 0) {
        setDownloads(data.downloads as DownloadOption[]);
        setSubtitles((data.subtitles || []) as SubtitleOption[]);
      } else {
        setDownloadError(`No download links currently found for Season ${seasonNum} Episode ${epNum}.`);
      }
    } catch (err) {
      console.error("Error fetching episode downloads:", err);
      setDownloadError("Failed to fetch episode download links.");
    } finally {
      setLoadingDownloads(false);
    }
  };

  const closeDownloadModal = () => {
    setSelectedItem(null);
    setDownloads([]);
    setSubtitles([]);
    setDownloadError("");
  };

  // Lock body scroll and close on Escape key when download modal is open
  useEffect(() => {
    if (selectedItem) {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeDownloadModal();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedItem]);

  const currentHero = heroSlides[currentSlideIndex] || null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO BILLBOARD BANNER (ROTATING TRENDING MOVIES & SERIES)
      ───────────────────────────────────────────────────────────── */}
      {!searchQuery.trim() && !activeCategory && currentHero && (
        <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] min-h-[420px] overflow-hidden">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlideIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.cover_image_url || slide.poster_url || "/placeholder-backdrop.jpg"}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
            </div>
          ))}

          {/* Hero details overlay */}
          <div className="relative z-20 container mx-auto px-4 md:px-12 h-full flex items-end pb-16 sm:pb-20">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[11px] shadow">
                  {currentHero.type === "english-series" ? "TV Series" : "Movie"}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-gray-200 text-[11px]">
                  Original English
                </span>
                {currentHero.release_date && (
                  <span className="text-gray-400">
                    {new Date(currentHero.release_date).getFullYear() || currentHero.release_date.split("-")[0]}
                  </span>
                )}
                {typeof currentHero.vote_average === "number" && currentHero.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {currentHero.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-md">
                {currentHero.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow">
                {currentHero.description || "Browse and download Hollywood and international releases in crystal clear HD, FHD, and 4K with fast direct links."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openDownloadModal(currentHero)}
                  className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Links</span>
                </button>
                <button
                  onClick={() => openDownloadModal(currentHero)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition-all hover:scale-105"
                >
                  <span>More Info</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Slider Dots */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex ? "w-8 bg-[#E50914]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH & CATEGORY PILLS BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-12 py-6 relative z-30">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search English movies & TV shows..."
              className="w-full bg-[#18181f] border border-gray-800 focus:border-[#E50914] rounded-full pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick status / Info */}
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Direct HD & 4K Downloads • Zero Video Ads</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {FILTER_PILLS.map(pill => {
            const isSelected = (!activeCategory && pill.id === "all") || activeCategory === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  setSearchQuery("");
                  if (pill.id === "all") {
                    closeCategoryGrid();
                  } else {
                    openCategoryGrid(pill.id, pill.label);
                  }
                }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-[#E50914] text-white shadow-md shadow-[#E50914]/30 scale-105"
                    : "bg-[#18181f] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH RESULTS VIEW (IF SEARCH QUERY ENTERED)
      ───────────────────────────────────────────────────────────── */}
      {searchQuery.trim() ? (
        <section className="container mx-auto px-4 md:px-12 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-[#E50914]" />
              Search results for &quot;{searchQuery}&quot;
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-white px-3 py-1 bg-gray-800 rounded-lg"
            >
              Clear Search
            </button>
          </div>

          {isSearching ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-[#E50914] animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map(item => (
                <EnglishCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onSelect={openDownloadModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#121216] rounded-2xl border border-gray-800/60 max-w-lg mx-auto">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-semibold mb-1">No titles found</p>
              <p className="text-xs text-gray-500">Try searching with a different movie or TV show title.</p>
            </div>
          )}
        </section>
      ) : activeCategory ? (
        /* ─────────────────────────────────────────────────────────────
            4. CATEGORY GRID VIEW WITH INFINITE SCROLL ("SEE MORE")
        ───────────────────────────────────────────────────────────── */
        <section className="container mx-auto px-4 md:px-12 py-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <button
                onClick={closeCategoryGrid}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-200 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Rows</span>
              </button>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white">
                {activeCategoryTitle}
              </h2>
            </div>
            <span className="text-xs text-gray-400">
              {gridItems.length} titles loaded
            </span>
          </div>

          {gridLoading && gridItems.length === 0 ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-[#E50914] animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {gridItems.map((item, idx) => (
                  <EnglishCard
                    key={`${item.id}-${idx}`}
                    item={item}
                    onSelect={openDownloadModal}
                  />
                ))}
              </div>

              {/* Infinite Scroll Sentinel */}
              {gridHasMore && (
                <div ref={observerTarget} className="flex justify-center py-12">
                  {gridLoadingMore && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                      <Loader2 className="w-5 h-5 text-[#E50914] animate-spin" />
                      <span>Loading more titles...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            5. HOMEPAGE-STYLE ROWS (TRENDING, POPULAR, GENRES)
        ───────────────────────────────────────────────────────────── */
        <div className="space-y-10 pb-16">
          {/* Row 1: Trending Movies */}
          <EnglishRow
            title="Trending Movies"
            items={trendingMovies}
            categoryKey="trending-movies"
            onSelect={openDownloadModal}
            onSeeMore={openCategoryGrid}
            onScrollLeft={() => scrollRow("trending-movies", "left")}
            onScrollRight={() => scrollRow("trending-movies", "right")}
            rowRef={el => { rowRefs.current["trending-movies"] = el; }}
          />

          {/* Row 2: Trending Series */}
          <EnglishRow
            title="Trending TV Series"
            items={trendingSeries}
            categoryKey="trending-series"
            onSelect={openDownloadModal}
            onSeeMore={openCategoryGrid}
            onScrollLeft={() => scrollRow("trending-series", "left")}
            onScrollRight={() => scrollRow("trending-series", "right")}
            rowRef={el => { rowRefs.current["trending-series"] = el; }}
          />

          {/* Row 3: Popular Movies */}
          <EnglishRow
            title="Popular Movies"
            items={popularMovies}
            categoryKey="popular-movies"
            onSelect={openDownloadModal}
            onSeeMore={openCategoryGrid}
            onScrollLeft={() => scrollRow("popular-movies", "left")}
            onScrollRight={() => scrollRow("popular-movies", "right")}
            rowRef={el => { rowRefs.current["popular-movies"] = el; }}
          />

          {/* Row 4: Popular Series */}
          <EnglishRow
            title="Popular TV Shows"
            items={popularSeries}
            categoryKey="popular-series"
            onSelect={openDownloadModal}
            onSeeMore={openCategoryGrid}
            onScrollLeft={() => scrollRow("popular-series", "left")}
            onScrollRight={() => scrollRow("popular-series", "right")}
            rowRef={el => { rowRefs.current["popular-series"] = el; }}
          />

          {/* Row 5: In Theaters / Now Playing */}
          <EnglishRow
            title="In Theaters (Now Playing)"
            items={nowPlayingMovies}
            categoryKey="now-playing"
            onSelect={openDownloadModal}
            onSeeMore={openCategoryGrid}
            onScrollLeft={() => scrollRow("now-playing", "left")}
            onScrollRight={() => scrollRow("now-playing", "right")}
            rowRef={el => { rowRefs.current["now-playing"] = el; }}
          />

          {/* Row 6: Top Rated Movies */}
          <EnglishRow
            title="Top Rated Movies"
            items={topRatedMovies}
            categoryKey="top-rated"
            onSelect={openDownloadModal}
            onSeeMore={openCategoryGrid}
            onScrollLeft={() => scrollRow("top-rated", "left")}
            onScrollRight={() => scrollRow("top-rated", "right")}
            rowRef={el => { rowRefs.current["top-rated"] = el; }}
          />

          {/* Genre Row: Action */}
          {actionItems.length > 0 && (
            <EnglishRow
              title="Action & Adventure"
              items={actionItems}
              categoryKey="genre-action"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-action", "left")}
              onScrollRight={() => scrollRow("genre-action", "right")}
              rowRef={el => { rowRefs.current["genre-action"] = el; }}
            />
          )}

          {/* Genre Row: Comedy */}
          {comedyItems.length > 0 && (
            <EnglishRow
              title="Comedy"
              items={comedyItems}
              categoryKey="genre-comedy"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-comedy", "left")}
              onScrollRight={() => scrollRow("genre-comedy", "right")}
              rowRef={el => { rowRefs.current["genre-comedy"] = el; }}
            />
          )}

          {/* Genre Row: Sci-Fi & Fantasy */}
          {scifiItems.length > 0 && (
            <EnglishRow
              title="Sci-Fi & Fantasy"
              items={scifiItems}
              categoryKey="genre-scifi"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-scifi", "left")}
              onScrollRight={() => scrollRow("genre-scifi", "right")}
              rowRef={el => { rowRefs.current["genre-scifi"] = el; }}
            />
          )}

          {/* Genre Row: Animation */}
          {animationItems.length > 0 && (
            <EnglishRow
              title="Animation"
              items={animationItems}
              categoryKey="genre-animation"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-animation", "left")}
              onScrollRight={() => scrollRow("genre-animation", "right")}
              rowRef={el => { rowRefs.current["genre-animation"] = el; }}
            />
          )}

          {/* Genre Row: Thriller */}
          {thrillerItems.length > 0 && (
            <EnglishRow
              title="Thriller & Crime"
              items={thrillerItems}
              categoryKey="genre-thriller"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-thriller", "left")}
              onScrollRight={() => scrollRow("genre-thriller", "right")}
              rowRef={el => { rowRefs.current["genre-thriller"] = el; }}
            />
          )}

          {/* Genre Row: Horror */}
          {horrorItems.length > 0 && (
            <EnglishRow
              title="Horror"
              items={horrorItems}
              categoryKey="genre-horror"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-horror", "left")}
              onScrollRight={() => scrollRow("genre-horror", "right")}
              rowRef={el => { rowRefs.current["genre-horror"] = el; }}
            />
          )}

          {/* Genre Row: Drama */}
          {dramaItems.length > 0 && (
            <EnglishRow
              title="Drama"
              items={dramaItems}
              categoryKey="genre-drama"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("genre-drama", "left")}
              onScrollRight={() => scrollRow("genre-drama", "right")}
              rowRef={el => { rowRefs.current["genre-drama"] = el; }}
            />
          )}

          {/* Row: Upcoming */}
          {upcomingMovies.length > 0 && (
            <EnglishRow
              title="Upcoming Releases"
              items={upcomingMovies}
              categoryKey="upcoming"
              onSelect={openDownloadModal}
              onSeeMore={openCategoryGrid}
              onScrollLeft={() => scrollRow("upcoming", "left")}
              onScrollRight={() => scrollRow("upcoming", "right")}
              rowRef={el => { rowRefs.current["upcoming"] = el; }}
            />
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. DOWNLOAD & DETAILS MODAL (STRICTLY DOWNLOADS, NO ADS)
      ───────────────────────────────────────────────────────────── */}
      {mounted && selectedItem && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 w-screen h-[100dvh] overflow-y-auto overscroll-none"
          onClick={closeDownloadModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90dvh] bg-[#121217] rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header / Banner (fixed at top of modal) */}
            <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-gray-900 shrink-0">
              <Image
                src={selectedItem.cover_image_url || selectedItem.poster_url || "/placeholder-backdrop.jpg"}
                alt={selectedItem.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/50 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={closeDownloadModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all z-20 border border-white/20 hover:scale-105 active:scale-95 shadow-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title inside banner */}
              <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6">
                <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[11px] font-bold uppercase tracking-wider mb-1 inline-block shadow">
                  {selectedItem.type === "english-series" ? "TV Series" : "Movie"}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white line-clamp-1 drop-shadow">
                  {selectedItem.title}
                </h2>
              </div>
            </div>

            {/* Modal Body (Scrollable interior) */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                {selectedItem.release_date && (
                  <span>{new Date(selectedItem.release_date).getFullYear() || selectedItem.release_date}</span>
                )}
                {typeof selectedItem.vote_average === "number" && selectedItem.vote_average > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {selectedItem.vote_average.toFixed(1)} Rating
                    </span>
                  </>
                )}
                {selectedItem.genres && selectedItem.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{selectedItem.genres.slice(0, 3).join(", ")}</span>
                  </>
                )}
              </div>

              {/* Overview */}
              {selectedItem.description && (
                <p className="text-sm text-gray-300 leading-relaxed max-h-24 overflow-y-auto no-scrollbar">
                  {selectedItem.description}
                </p>
              )}

              {/* SERIES SELECTOR: Seasons & Episodes */}
              {selectedItem.type === "english-series" && (
                <div className="space-y-4 pt-2 border-t border-gray-800/80">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Season Selector */}
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                        Select Season
                      </label>
                      {loadingSeasons ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                          <span>Loading seasons...</span>
                        </div>
                      ) : (
                        <select
                          value={selectedSeason}
                          onChange={e => handleSeasonChange(Number(e.target.value))}
                          className="w-full bg-[#1c1c24] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E50914]"
                        >
                          {seasons.map(s => (
                            <option key={s.season_number} value={s.season_number}>
                              {s.name || `Season ${s.season_number}`} {s.episode_count ? `(${s.episode_count} eps)` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Episode Selector */}
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                        Select Episode
                      </label>
                      {loadingEpisodes ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                          <span>Loading episodes...</span>
                        </div>
                      ) : (
                        <select
                          value={selectedEpisode}
                          onChange={e => handleEpisodeChange(Number(e.target.value))}
                          className="w-full bg-[#1c1c24] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E50914]"
                        >
                          {episodes.length > 0 ? (
                            episodes.map(ep => (
                              <option key={ep.episode_number} value={ep.episode_number}>
                                Episode {ep.episode_number}: {ep.name || `Episode ${ep.episode_number}`}
                              </option>
                            ))
                          ) : (
                            Array.from({ length: 24 }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Episode {i + 1}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DOWNLOAD LINKS SECTION */}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#E50914]" />
                    {selectedItem.type === "english-series"
                      ? `Download S${selectedSeason}E${selectedEpisode}`
                      : "Direct Download Links"}
                  </h3>
                  {selectedItem.type === "english-series" && (
                    <button
                      onClick={() => fetchEpisodeDownloads(selectedItem.tmdb_id || selectedItem.id, selectedSeason, selectedEpisode)}
                      className="text-xs text-[#E50914] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Refresh Links
                    </button>
                  )}
                </div>

                {loadingDownloads ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-[#E50914] animate-spin" />
                    <p className="text-xs text-gray-400">Fetching direct high-speed download links...</p>
                  </div>
                ) : downloads.length > 0 ? (
                  <div className="space-y-2.5">
                    {downloads.map((dl, idx) => {
                      const resNumber = dl.resolution || 720;
                      const badgeColor =
                        resNumber >= 2160
                          ? "bg-purple-600 text-white"
                          : resNumber >= 1080
                          ? "bg-blue-600 text-white"
                          : resNumber >= 720
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-700 text-gray-200";

                      const downloadHref = dl.url || dl.proxy_url;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] hover:bg-[#20202b] border border-gray-800/80 transition-all group"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${badgeColor}`}>
                                {dl.quality || `${resNumber}p`}
                              </span>
                              <p className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                                {dl.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              File Size: <span className="text-gray-300 font-medium">{dl.size_readable || "Direct HD"}</span>
                            </p>
                          </div>

                          <a
                            href={downloadHref}
                            download={dl.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold rounded-lg shadow transition-transform active:scale-95 flex-shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-[#181820] rounded-xl border border-gray-800/60 p-4">
                    <p className="text-xs text-gray-400">
                      {downloadError || "No direct download links found for this title yet."}
                    </p>
                  </div>
                )}

                {/* Subtitles Section */}
                {subtitles.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-800/60">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-[#E50914]" />
                      <span>Subtitles ({subtitles.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                      {subtitles.map((sub, idx) => (
                        <a
                          key={idx}
                          href={sub.url}
                          download={sub.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/70 hover:bg-gray-700 text-xs text-gray-300 hover:text-white border border-gray-700/50 transition-colors"
                        >
                          <Download className="w-3 h-3 text-[#E50914]" />
                          <span>{sub.language}</span>
                          {sub.size_readable && (
                            <span className="text-[10px] text-gray-500">({sub.size_readable})</span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROW COMPONENT
// ─────────────────────────────────────────────────────────────
function EnglishRow({
  title,
  items,
  categoryKey,
  onSelect,
  onSeeMore,
  onScrollLeft,
  onScrollRight,
  rowRef,
}: {
  title: string;
  items: EnglishItem[];
  categoryKey: string;
  onSelect: (item: EnglishItem) => void;
  onSeeMore: (catKey: string, catTitle: string) => void;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-12 group/row relative">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h2>
        <button
          onClick={() => onSeeMore(categoryKey, title)}
          className="text-xs sm:text-sm text-[#E50914] hover:text-[#ff404a] font-semibold flex items-center gap-1 transition-colors"
        >
          <span>See More</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Row Scroller with side arrows */}
      <div className="relative">
        <button
          onClick={onScrollLeft}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-7 h-7 text-white drop-shadow" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scrollbar-hide scroll-smooth pb-3 pt-1"
        >
          {items.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex-none w-[130px] sm:w-[155px] md:w-[175px]"
            >
              <EnglishCard item={item} onSelect={onSelect} />
            </div>
          ))}
        </div>

        <button
          onClick={onScrollRight}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-7 h-7 text-white drop-shadow" />
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD COMPONENT
// ─────────────────────────────────────────────────────────────
function EnglishCard({
  item,
  onSelect,
}: {
  item: EnglishItem;
  onSelect: (item: EnglishItem) => void;
}) {
  const isSeries = item.type === "english-series";
  const year = item.release_date ? new Date(item.release_date).getFullYear() || item.release_date.split("-")[0] : null;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group/card cursor-pointer rounded-xl overflow-hidden bg-[#15151c] border border-gray-800/60 hover:border-[#E50914] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#E50914]/10 relative flex flex-col"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative w-full overflow-hidden bg-gray-900">
        <Image
          src={item.poster_url || "/placeholder-poster.jpg"}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 180px"
          className="object-cover transition-transform duration-300 group-hover/card:scale-105"
          onError={e => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x450/15151c/E50914?text=${encodeURIComponent(item.title)}`;
          }}
        />

        {/* Content badge */}
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/20">
            {isSeries ? "Series" : "Movie"}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#E50914] text-white">
            HD
          </span>
        </div>

        {/* Rating */}
        {typeof item.vote_average === "number" && item.vote_average > 0 && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-amber-400 backdrop-blur-sm">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Hover overlay with Download Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 z-20">
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Downloads</span>
          </button>
        </div>
      </div>

      {/* Info below card */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
        <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 group-hover/card:text-[#E50914] transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
          <span>{year || "HD"}</span>
          {item.genres && item.genres[0] && (
            <span className="text-[10px] text-gray-500 truncate max-w-[70px]">
              {item.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
