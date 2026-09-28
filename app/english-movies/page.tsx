"use client";
import { Search, Film, Download, Play, X } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { ModernSearchBar } from "@/components/ModernSearchBar";
import { getEnglishMovies, searchEnglishMovies, getEnglishMovieDownloads } from "@/lib/api";

type EnglishMovie = {
  id: string;
  tmdb_id: string;
  title: string;
  description: string;
  poster_url: string;
  thumbnail_url: string;
  cover_image_url: string;
  release_date: string;
  genres: string[];
  genre_ids: string[];
  embed_url: string;
  type: string;
};

type DownloadOption = {
  resolution: number;
  name: string;
  size_bytes: number;
  size_readable: string;
  proxy_url: string;
};

type Subtitle = {
  language: string;
  url: string;
  format: string;
};

const movieTypes = [
  { value: 'all', label: 'All' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'now-playing', label: 'Now Playing' },
  { value: 'upcoming', label: 'Upcoming' }
];

const LoadingGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} className="aspect-[2/3] rounded-lg bg-gray-800/40 animate-pulse" />
    ))}
  </div>
);

export default function EnglishMoviesPage() {
  const [movies, setMovies] = useState<EnglishMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMovie, setSelectedMovie] = useState<EnglishMovie | null>(null);
  const [downloads, setDownloads] = useState<{ downloads: DownloadOption[], subtitles: Subtitle[] } | null>(null);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchMovies = useCallback(async (query = "", type = "all", page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      if (query.trim()) {
        const results = await searchEnglishMovies(query);
        setMovies(results);
        setHasMore(false); // Search returns all results at once
      } else if (type === 'all') {
        // For "All", fetch from multiple categories in rotation
        // This creates variety while enabling pagination
        const categories = ['popular', 'trending', 'top-rated', 'now-playing', 'upcoming'] as const;
        const categoryIndex = (page - 1) % categories.length;
        const categoryPage = Math.floor((page - 1) / categories.length) + 1;
        const category = categories[categoryIndex];
        
        const results = await getEnglishMovies(category, 20, categoryPage);
        
        if (append) {
          setMovies(prev => {
            // Deduplicate by id
            const existingIds = new Set(prev.map(m => m.id));
            const newMovies = results.filter(m => !existingIds.has(m.id));
            return [...prev, ...newMovies];
          });
        } else {
          setMovies(results);
        }
        
        setHasMore(results.length === 20); // If we got a full page, there might be more
      } else {
        const results = await getEnglishMovies(type as any, 20, page);
        
        if (append) {
          setMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMovies = results.filter(m => !existingIds.has(m.id));
            return [...prev, ...newMovies];
          });
        } else {
          setMovies(results);
        }
        
        setHasMore(results.length === 20);
      }
    } catch (error) {
      console.error("Error fetching English movies:", error);
      if (!append) {
        setMovies([]);
      }
      setHasMore(false);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchMovies("", selectedType, 1, false);
  }, [selectedType, fetchMovies]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) return;
    
    const handler = setTimeout(() => {
      setCurrentPage(1);
      setHasMore(false);
      fetchMovies(searchQuery, selectedType, 1, false);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedType, fetchMovies]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && !searchQuery.trim()) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchMovies("", selectedType, nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, searchQuery, currentPage, selectedType, fetchMovies]);

  const handleMovieClick = async (movie: EnglishMovie) => {
    setSelectedMovie(movie);
    setLoadingDownloads(true);
    setDownloads(null);
    setShowPlayer(false);
    
    try {
      const downloadData = await getEnglishMovieDownloads(movie.tmdb_id || movie.id);
      setDownloads(downloadData);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setLoadingDownloads(false);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setDownloads(null);
    setShowPlayer(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setCurrentPage(1);
    setHasMore(true);
  };

  const isFiltering = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50 pt-safe">
        <div className="container mx-auto sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Film className="w-5 h-5 sm:w-6 sm:h-6 text-[#E50914]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">English Movies</h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm ml-8 sm:ml-9">
            Hollywood & International English movies with high-speed downloads
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Search and Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search English movies..."
              className="flex-1"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="relative">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {movieTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full 
                    text-sm font-semibold whitespace-nowrap
                    transition-all duration-300
                    ${selectedType === type.value 
                      ? 'bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/40 scale-105' 
                      : 'bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Loading */}
        {loading && <LoadingGrid />}

        {/* Grid */}
        {!loading && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="group relative cursor-pointer rounded-lg overflow-hidden bg-gray-900 hover:ring-2 hover:ring-[#E50914] transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={movie.poster_url || `https://via.placeholder.com/300x450/1a1a2e/e50914?text=${encodeURIComponent(movie.title)}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x450/1a1a2e/e50914?text=${encodeURIComponent(movie.title)}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-2 right-2 bg-[#E50914] text-white text-xs font-bold px-2 py-1 rounded">
                      HD
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        {movie.genres && movie.genres.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{movie.genres[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && !searchQuery.trim() && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {loadingMore && (
                  <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-5">
              <Search className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No movies found</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              {isFiltering ? "Try different search terms or remove filters." : "Movies are being loaded. Please try again shortly."}
            </p>
            {isFiltering && (
              <button onClick={clearFilters} className="mt-5 px-5 py-2.5 bg-[#E50914] hover:bg-[#b80710] text-white rounded-xl text-sm font-semibold transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div 
              className="bg-[#141414] rounded-xl max-w-4xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-64 md:h-96">
                <Image
                  src={selectedMovie.cover_image_url || selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/1200x600/1a1a2e/e50914?text=${encodeURIComponent(selectedMovie.title)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 -mt-20 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{selectedMovie.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                  <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                  {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{selectedMovie.genres.join(", ")}</span>
                    </>
                  )}
                </div>
                
                {selectedMovie.description && (
                  <p className="text-gray-300 text-base leading-relaxed mb-6">
                    {selectedMovie.description}
                  </p>
                )}

                {/* Player Button */}
                {selectedMovie.embed_url && (
                  <button
                    onClick={() => setShowPlayer(!showPlayer)}
                    className="mb-6 px-6 py-3 bg-[#E50914] hover:bg-[#b80710] text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    {showPlayer ? "Hide Player" : "Watch Now"}
                  </button>
                )}

                {/* Embedded Player */}
                {showPlayer && selectedMovie.embed_url && (
                  <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={selectedMovie.embed_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                  </div>
                )}

                {/* Downloads Section */}
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#E50914]" />
                    Download Options
                  </h3>

                  {loadingDownloads && (
                    <div className="flex justify-center py-8">
                      <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                      </span>
                    </div>
                  )}

                  {!loadingDownloads && downloads && downloads.downloads.length > 0 && (
                    <div className="space-y-3">
                      {downloads.downloads.map((download, idx) => (
                        <a
                          key={idx}
                          href={download.proxy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-900/50 hover:bg-gray-900 rounded-lg border border-gray-800 hover:border-[#E50914] transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white group-hover:text-[#E50914] transition-colors">
                                {download.resolution}p - {download.name}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                Size: {download.size_readable}
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-[#E50914] transition-colors" />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {!loadingDownloads && downloads && downloads.downloads.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No download options available for this movie.
                    </p>
                  )}

                  {/* Subtitles */}
                  {downloads && downloads.subtitles && downloads.subtitles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Subtitles</h4>
                      <div className="flex flex-wrap gap-2">
                        {downloads.subtitles.map((subtitle, idx) => (
                          <a
                            key={idx}
                            href={subtitle.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-900/50 hover:bg-gray-900 rounded-lg border border-gray-800 hover:border-[#E50914] text-sm transition-all"
                          >
                            {subtitle.language} ({subtitle.format})
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50 pt-safe">
        <div className="container mx-auto sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Film className="w-5 h-5 sm:w-6 sm:h-6 text-[#E50914]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">English Movies</h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm ml-8 sm:ml-9">
            Hollywood & International English movies with high-speed downloads
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Search and Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search English movies..."
              className="flex-1"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="relative">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {movieTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full 
                    text-sm font-semibold whitespace-nowrap
                    transition-all duration-300
                    ${selectedType === type.value 
                      ? 'bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/40 scale-105' 
                      : 'bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Loading */}
        {loading && <LoadingGrid />}

        {/* Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="group relative cursor-pointer rounded-lg overflow-hidden bg-gray-900 hover:ring-2 hover:ring-[#E50914] transition-all duration-300 hover:scale-105"
              >
                <div className="aspect-[2/3] relative">
                  <Image
                    src={movie.poster_url || `https://via.placeholder.com/300x450/1a1a2e/e50914?text=${encodeURIComponent(movie.title)}`}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x450/1a1a2e/e50914?text=${encodeURIComponent(movie.title)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 right-2 bg-[#E50914] text-white text-xs font-bold px-2 py-1 rounded">
                    HD
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                      {movie.genres && movie.genres.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{movie.genres[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-5">
              <Search className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No movies found</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              {isFiltering ? "Try different search terms or remove filters." : "Movies are being loaded. Please try again shortly."}
            </p>
            {isFiltering && (
              <button onClick={clearFilters} className="mt-5 px-5 py-2.5 bg-[#E50914] hover:bg-[#b80710] text-white rounded-xl text-sm font-semibold transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div 
              className="bg-[#141414] rounded-xl max-w-4xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-64 md:h-96">
                <Image
                  src={selectedMovie.cover_image_url || selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/1200x600/1a1a2e/e50914?text=${encodeURIComponent(selectedMovie.title)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 -mt-20 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{selectedMovie.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                  <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                  {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{selectedMovie.genres.join(", ")}</span>
                    </>
                  )}
                </div>
                
                {selectedMovie.description && (
                  <p className="text-gray-300 text-base leading-relaxed mb-6">
                    {selectedMovie.description}
                  </p>
                )}

                {/* Player Button */}
                {selectedMovie.embed_url && (
                  <button
                    onClick={() => setShowPlayer(!showPlayer)}
                    className="mb-6 px-6 py-3 bg-[#E50914] hover:bg-[#b80710] text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    {showPlayer ? "Hide Player" : "Watch Now"}
                  </button>
                )}

                {/* Embedded Player */}
                {showPlayer && selectedMovie.embed_url && (
                  <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={selectedMovie.embed_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                  </div>
                )}

                {/* Downloads Section */}
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#E50914]" />
                    Download Options
                  </h3>

                  {loadingDownloads && (
                    <div className="flex justify-center py-8">
                      <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                      </span>
                    </div>
                  )}

                  {!loadingDownloads && downloads && downloads.downloads.length > 0 && (
                    <div className="space-y-3">
                      {downloads.downloads.map((download, idx) => (
                        <a
                          key={idx}
                          href={download.proxy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-900/50 hover:bg-gray-900 rounded-lg border border-gray-800 hover:border-[#E50914] transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white group-hover:text-[#E50914] transition-colors">
                                {download.resolution}p - {download.name}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                Size: {download.size_readable}
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-[#E50914] transition-colors" />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {!loadingDownloads && downloads && downloads.downloads.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No download options available for this movie.
                    </p>
                  )}

                  {/* Subtitles */}
                  {downloads && downloads.subtitles && downloads.subtitles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Subtitles</h4>
                      <div className="flex flex-wrap gap-2">
                        {downloads.subtitles.map((subtitle, idx) => (
                          <a
                            key={idx}
                            href={subtitle.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-900/50 hover:bg-gray-900 rounded-lg border border-gray-800 hover:border-[#E50914] text-sm transition-all"
                          >
                            {subtitle.language} ({subtitle.format})
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
