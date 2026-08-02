"use client";
import { Search, Filter, X, Tv } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Series } from "@/lib/supabase";
import { NetflixCard } from "@/components/NetflixCard";
import { ModernSearchBar } from "@/components/ModernSearchBar";
import { ModernFilterDropdown } from "@/components/ModernFilterDropdown";
import { GenreFilterChips } from "@/components/GenreFilterChips";
import { getVJs, searchSeries } from "@/lib/api";

type SeriesWithVJ = Series & {
  vjs: { id: string; name: string } | null;
  season_count?: number;
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

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesWithVJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVJ, setSelectedVJ] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [availableVJs, setAvailableVJs] = useState<VJ[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSeries, setTotalSeries] = useState(0);

  const seriesPerPage = 48;

  const fetchAvailableVJs = useCallback(async () => {
    try {
      const vjData = await getVJs();
      setAvailableVJs(vjData || []);
    } catch (error) {
      console.error("Error fetching VJs:", error);
    }
  }, []);

  const fetchSeries = useCallback(async (page: number, query = "", vjName = "", genre = "All") => {
    setLoading(true);
    try {
      const seriesData = await searchSeries(
        query, 
        seriesPerPage, 
        page, 
        vjName || undefined,
        genre !== "All" ? genre.toLowerCase() : undefined
      );
      setSeries(seriesData as any[]);
      setTotalSeries(
        seriesData.length === seriesPerPage
          ? page * seriesPerPage + 1
          : (page - 1) * seriesPerPage + seriesData.length
      );
    } catch (error) {
      console.error("Error fetching series:", error);
    } finally {
      setLoading(false);
    }
  }, [seriesPerPage]);

  useEffect(() => { fetchSeries(1); fetchAvailableVJs(); }, [fetchSeries, fetchAvailableVJs]);

  useEffect(() => {
    if (currentPage > 1) fetchSeries(currentPage, searchQuery, selectedVJ, selectedGenre);
  }, [currentPage, fetchSeries, searchQuery, selectedVJ, selectedGenre]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchSeries(1, searchQuery, selectedVJ, selectedGenre);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedVJ, selectedGenre, fetchSeries]);

  const clearFilters = () => { 
    setSelectedVJ(""); 
    setSearchQuery(""); 
    setSelectedGenre("All");
    setCurrentPage(1); 
  };

  const totalPages = Math.ceil(totalSeries / seriesPerPage);
  const isFiltering = searchQuery.trim().length > 0 || !!selectedVJ || selectedGenre !== "All";
  const selectedVJLabel = availableVJs.find(vj => vj.id === selectedVJ)?.name;

  const vjOptions = [
    { value: '', label: 'All VJs' },
    ...availableVJs.map(vj => ({ value: vj.id, label: vj.name }))
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50 pt-safe">
        <div className="container mx-auto sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-[#E50914]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">TV Shows</h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm ml-8 sm:ml-9">
            Browse all translated series
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Modern Search + Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search and VJ Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Modern Search */}
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search series by title or VJ..."
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
            <span className="text-white text-sm font-medium">{series.length} show{series.length !== 1 ? "s" : ""}</span>
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
        {!loading && series.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
            {series.map((show) => (
              <NetflixCard key={show.id} content={show} type="series" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && series.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-5">
              <Search className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No series found</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              {isFiltering ? "Try different search terms or remove filters." : "Series are being loaded. Please try again shortly."}
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
