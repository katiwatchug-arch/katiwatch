"use client";
import { Search, Filter, ChevronDown, X, Tv } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Series } from "@/lib/supabase";
import { NetflixCard } from "@/components/NetflixCard";
import { getVJs, searchSeries } from "@/lib/api";

type SeriesWithVJ = Series & {
  vjs: { id: string; name: string } | null;
  season_count?: number;
};

type VJ = { id: string; name: string };

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
  const [availableVJs, setAvailableVJs] = useState<VJ[]>([]);
  const [showVJDropdown, setShowVJDropdown] = useState(false);
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

  const fetchSeries = useCallback(async (page: number, query = "", vjName = "") => {
    setLoading(true);
    try {
      const seriesData = await searchSeries(query, seriesPerPage, page, vjName || undefined);
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
    if (currentPage > 1) fetchSeries(currentPage, searchQuery, selectedVJ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchSeries(1, searchQuery, selectedVJ);
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedVJ]);

  const clearFilters = () => { setSelectedVJ(""); setSearchQuery(""); setCurrentPage(1); };

  const totalPages = Math.ceil(totalSeries / seriesPerPage);
  const isFiltering = searchQuery.trim().length > 0 || !!selectedVJ;
  const selectedVJLabel = availableVJs.find(vj => vj.id === selectedVJ)?.name;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50">
        <div className="container mx-auto sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Tv className="w-6 h-6 text-[#E50914]" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">TV Shows</h1>
          </div>
          <p className="text-gray-500 text-sm ml-9">
            Browse all translated series
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-[#E50914] transition-colors" />
            <input
              type="text"
              placeholder="Search series by title or VJ…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:bg-white/[0.06] transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* VJ Filter */}
          <div className="relative">
            <button
              onClick={() => setShowVJDropdown(!showVJDropdown)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all min-w-[130px] justify-between ${
                selectedVJ
                  ? "bg-[#E50914] border-[#E50914] text-white"
                  : "bg-white/[0.04] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                <span>{selectedVJLabel || "Filter by VJ"}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVJDropdown ? "rotate-180" : ""}`} />
            </button>

            {showVJDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedVJ(""); setShowVJDropdown(false); }}
                    className="w-full text-left px-4 py-3 text-xs text-gray-500 hover:text-white hover:bg-white/5 uppercase tracking-wider transition-colors"
                  >
                    All VJs
                  </button>
                  <div className="border-t border-gray-800/60" />
                  {availableVJs.map((vj) => (
                    <button
                      key={vj.id}
                      onClick={() => { setSelectedVJ(vj.id); setShowVJDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                        selectedVJ === vj.id
                          ? "text-[#E50914] font-semibold bg-[#E50914]/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {vj.name}
                      {selectedVJ === vj.id && (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear filters */}
          {isFiltering && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-800 text-gray-500 hover:border-red-700/60 hover:text-red-400 text-sm transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Active filter chip */}
        {isFiltering && !loading && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Results:</span>
            <span className="text-white text-sm font-medium">{series.length} show{series.length !== 1 ? "s" : ""}</span>
            {searchQuery && <span className="px-3 py-1 bg-white/5 border border-gray-700 rounded-full text-xs text-gray-300">"{searchQuery}"</span>}
            {selectedVJ && <span className="px-3 py-1 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full text-xs text-[#E50914]">{selectedVJLabel}</span>}
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
