"use client";
import { Search, Filter, X } from "lucide-react";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Movie } from "@/lib/supabase";
import { NetflixCard } from "@/components/NetflixCard";
import { ModernSearchBar } from "@/components/ModernSearchBar";
import { ModernFilterDropdown } from "@/components/ModernFilterDropdown";
import { GenreFilterChips } from "@/components/GenreFilterChips";
import { getVJs, searchMovies } from "@/lib/api";

type MovieWithVJ = Movie & {
  vjs: { id: string; name: string } | null;
};

type VJ = { id: string; name: string };

const genreOptions = [
  'All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western', 'Family'
];

const LoadingGrid = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
    {Array.from({ length: 24 }).map((_, i) => (
      <div key={i} className="aspect-[2/3] rounded-lg bg-gray-800/40 animate-pulse" />
    ))}
  </div>
);

function MoviesPageInner() {
  const searchParams = useSearchParams();
  const yearFromUrl = searchParams.get('year');
  const [selectedYear, setSelectedYear] = useState<string>(yearFromUrl || "");
  const [movies, setMovies] = useState<MovieWithVJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVJ, setSelectedVJ] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>(() => {
    const g = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('genre') : null;
    if (!g) return "All";
    return genreOptions.find(o => o.toLowerCase() === g.toLowerCase()) || "All";
  });
  const [availableVJs, setAvailableVJs] = useState<VJ[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  const moviesPerPage = 48;

  const fetchAvailableVJs = useCallback(async () => {
    try {
      const vjData = await getVJs();
      setAvailableVJs(vjData || []);
    } catch (error) {
      console.error("Error fetching VJs:", error);
    }
  }, []);

  const fetchMovies = useCallback(async (page: number, query = "", vjName = "", genre = "All", year = "") => {
    setLoading(true);
    try {
      if (year) {
        const res = await fetch('/api/movies/full-catalog');
        const allMovies: any[] = await res.json();
        const filtered = allMovies
          .filter(m => m.release_date && new Date(m.release_date).getFullYear().toString() === year)
          .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        setTotalMovies(filtered.length);
        setMovies(filtered.slice((page - 1) * moviesPerPage, page * moviesPerPage) as any);
      } else {
        const moviesData = await searchMovies(query, moviesPerPage, page, vjName || undefined, genre !== "All" ? genre.toLowerCase() : undefined);
        setMovies(moviesData as any);
        setTotalMovies(
          moviesData.length === moviesPerPage
            ? page * moviesPerPage + 1
            : (page - 1) * moviesPerPage + moviesData.length
        );
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, [moviesPerPage]);

  useEffect(() => { fetchMovies(1, "", "", "All", selectedYear); fetchAvailableVJs(); }, [fetchMovies, fetchAvailableVJs]);

  useEffect(() => {
    if (currentPage > 1) fetchMovies(currentPage, searchQuery, selectedVJ, selectedGenre, selectedYear);
  }, [currentPage, fetchMovies, searchQuery, selectedVJ, selectedGenre, selectedYear]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchMovies(1, searchQuery, selectedVJ, selectedGenre, selectedYear);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedVJ, selectedGenre, selectedYear, fetchMovies]);

  const clearFilters = () => { 
    setSelectedVJ(""); 
    setSearchQuery(""); 
    setSelectedGenre("All");
    setCurrentPage(1); 
  };

  const totalPages = Math.ceil(totalMovies / moviesPerPage);
  const isFiltering = searchQuery.trim().length > 0 || !!selectedVJ || selectedGenre !== "All";
  const selectedVJLabel = availableVJs.find(vj => vj.id === selectedVJ)?.name;

  const displayedMovies = movies;

  const vjOptions = [
    { value: '', label: 'All VJs' },
    ...availableVJs.map(vj => ({ value: vj.id, label: vj.name }))
  ];

  const yearOptions = [
    { value: '', label: 'All Years' },
    ...Array.from(
      new Set(
        movies
          .filter(movie => movie.release_date)
          .map(movie => new Date(movie.release_date!).getFullYear().toString())
      )
    )
      .sort((a, b) => Number(b) - Number(a))
      .map(year => ({ value: year, label: year }))
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Modern Search + Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search and VJ Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Modern Search */}
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search movies by title or VJ..."
              className="flex-1"
            />

            {/* Modern VJ Filter */}
            <ModernFilterDropdown
              label="Filter by VJ"
              icon={<Filter className="w-4 h-4" />}
              options={vjOptions}
              value={selectedVJ}
              onChange={setSelectedVJ}
            />

            {/* Modern Year Filter */}
            <ModernFilterDropdown
              label="Year"
              icon={<Filter className="w-4 h-4" />}
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
            />

            {/* Clear filters */}
            {isFiltering && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-gray-800 bg-black/40 backdrop-blur-xl text-gray-400 hover:border-[#E50914]/60 hover:text-white hover:bg-black/50 transition-all duration-300 whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Genre Filter Chips */}
          <GenreFilterChips
            genres={genreOptions}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />
        </div>

        {/* Active filter chips */}
        {isFiltering && !loading && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Active Filters:</span>
            <span className="text-white text-sm font-medium">{movies.length} movie{movies.length !== 1 ? "s" : ""}</span>
            {searchQuery && (
              <span className="px-3 py-1.5 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full text-xs text-[#E50914] font-medium">
                &quot;{searchQuery}&quot;
              </span>
            )}
            {selectedVJ && (
              <span className="px-3 py-1.5 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full text-xs text-[#E50914] font-medium">
                {selectedVJLabel}
              </span>
            )}
            {selectedGenre !== "All" && (
              <span className="px-3 py-1.5 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full text-xs text-[#E50914] font-medium">
                {selectedGenre}
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingGrid />}

        {/* Grid */}
        {!loading && displayedMovies.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
            {displayedMovies.map((movie) => (
              <NetflixCard key={movie.id} content={movie} type="movie" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayedMovies.length === 0 && (
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

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center mt-14 gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:border-[#E50914]/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium uppercase tracking-wider transition-all"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 4) {
                pageNum = i + 1;
              } else if (currentPage <= 2) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 3 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
                      : "border border-gray-800 text-gray-400 hover:border-[#E50914]/60 hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 4 && currentPage < totalPages - 2 && (
              <span className="text-gray-600 px-2">.....</span>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:border-[#E50914]/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium uppercase tracking-wider transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <MoviesPageInner />
    </Suspense>
  );
}
