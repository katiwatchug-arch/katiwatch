"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { NetflixCard } from "@/components/NetflixCard"
import { ModernSearchBar } from "@/components/ModernSearchBar"
import { ModernFilterDropdown } from "@/components/ModernFilterDropdown"
import { Search, X, Filter } from "lucide-react"

interface ContentItem {
  id: string
  title: string
  thumbnail_url?: string
  cover_image_url?: string
  description?: string
  release_date?: string
  genre_ids?: string[]
  vj_id?: string
  premium?: boolean
  vjs?: { id: string; name: string } | null
}

interface VJ {
  id: string
  name: string
}

interface Genre {
  id: string
  name: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [movies, setMovies] = useState<ContentItem[]>([])
  const [series, setSeries] = useState<ContentItem[]>([])

  const [loading, setLoading] = useState(true)
  const [vjs, setVjs] = useState<VJ[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  
  const [selectedVJ, setSelectedVJ] = useState<string>("")
  const [selectedGenre, setSelectedGenre] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"all" | "movies" | "series">("all")
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const HARDCODED_GENRES = [
    { id: "Action", name: "Action" },
    { id: "Comedy", name: "Comedy" },
    { id: "Drama", name: "Drama" },
    { id: "Horror", name: "Horror" },
    { id: "Science Fiction", name: "Science Fiction" },
    { id: "Fantasy", name: "Fantasy" },
    { id: "Romance", name: "Romance" },
    { id: "Thriller", name: "Thriller" },
    { id: "Mystery", name: "Mystery" },
    { id: "Documentary", name: "Documentary" },
    { id: "Western", name: "Western" },
    { id: "Musical", name: "Musical" },
    { id: "Crime", name: "Crime" },
    { id: "Adventure", name: "Adventure" },
    { id: "Animation", name: "Animation" }
  ]
  // Load VJs and Genres on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const api = await import("@/lib/api")
        // VJs come from the Reelplexi API (not Supabase). getVJs() maps id=name.
        const [vjRes, genreRes] = await Promise.all([
          api.getVJs(),
          api.getGenres()
        ])
        setVjs(vjRes || [])
        setGenres(genreRes && genreRes.length > 0 ? genreRes : HARDCODED_GENRES)
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    loadInitialData()
  }, [])

  // Fetch content whenever query, VJ, or genre changes using the backend Search API
  // selectedVJ is already the VJ name string (getVJs maps id=name), use it directly.
  const fetchResults = useCallback(async (pageNum: number) => {
    const isLoadMore = pageNum > 1
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)
    
    try {
      const api = await import("@/lib/api")
      const limit = 50

      // selectedVJ is the VJ name (id === name from getVJs), pass directly
      const vjNameParam = selectedVJ || undefined
      const selectedGenreName = genres.find((g) => g.id === selectedGenre)?.name

      let newMovies: any[] = []
      let newSeries: any[] = []

      if (searchQuery.trim() || vjNameParam || selectedGenreName) {
        const items = await api.searchAllContent(searchQuery.trim(), limit, pageNum, vjNameParam, selectedGenreName)
        newMovies = items.filter((item: any) => item.type === 'movie')
        newSeries = items.filter((item: any) => item.type === 'series')
      } else {
        const [mRes, sRes] = await Promise.all([
          api.searchMovies("", limit, pageNum, undefined, selectedGenreName),
          api.searchSeries("", limit, pageNum, undefined, selectedGenreName)
        ])
        newMovies = mRes as any[]
        newSeries = sRes as any[]
      }

      if (isLoadMore) {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        })
        setSeries(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNew = newSeries.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
        })
      } else {
        setMovies(newMovies)
        setSeries(newSeries)
      }

      setHasMore(newMovies.length > 0 || newSeries.length > 0)
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      if (isLoadMore) setLoadingMore(false)
      else setLoading(false)
    }
  }, [searchQuery, selectedVJ, selectedGenre, genres])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    const timer = setTimeout(() => fetchResults(1), 400) // 400ms debounce
    return () => clearTimeout(timer)
  }, [searchQuery, selectedVJ, selectedGenre, fetchResults])

  useEffect(() => {
    if (page > 1) {
      fetchResults(page)
    }
  }, [page, fetchResults])

  const totalResults = movies.length + series.length
  const hasActiveFilters = !!searchQuery || !!selectedVJ || !!selectedGenre

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedVJ("")
    setSelectedGenre("")
  }

  const displayMovies = activeTab === "series" ? [] : movies
  const displaySeries = activeTab === "movies" ? [] : series

  const vjOptions = [
    { value: '', label: 'All VJs' },
    ...vjs.map(vj => ({ value: vj.id, label: vj.name }))
  ];

  const genreOptions = [
    { value: '', label: 'All Genres' },
    ...genres.map(genre => ({ value: genre.id, label: genre.name }))
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 py-8 flex-1">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Search & Browse</h1>

        {/* Modern Search and Filters */}
        <div className="mb-8 flex flex-col gap-3">
          {/* Search bar */}
          <ModernSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search movies, series, VJs..."
            className="w-full"
          />
          
          {/* Filters row */}
          <div className="flex flex-wrap gap-3">
            {/* VJ Filter Dropdown */}
            <ModernFilterDropdown
              label="VJ"
              icon={<Filter className="w-4 h-4" />}
              options={vjOptions}
              value={selectedVJ}
              onChange={setSelectedVJ}
            />

            {/* Genre Filter Dropdown */}
            <ModernFilterDropdown
              label="Genre"
              icon={<Filter className="w-4 h-4" />}
              options={genreOptions}
              value={selectedGenre}
              onChange={setSelectedGenre}
            />

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-gray-800 bg-black/40 backdrop-blur-xl text-gray-400 hover:border-[#E50914]/60 hover:text-white hover:bg-black/50 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(["all", "movies", "series"] as const).map((tab) => {
            const label = tab === "all" ? "All" : tab === "movies" ? "Movies" : "Series"
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25"
                    : "bg-gray-800 text-gray-300 hover:bg-[#E50914]/20 hover:text-[#E50914] border border-gray-700"
                  }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
</span>
              <p className="text-gray-400">Loading content...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && totalResults === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {hasActiveFilters
                ? "No results match your filters"
                : "No content available yet"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-[#E50914] text-white rounded-lg font-medium hover:bg-[#b80710] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && totalResults > 0 && (
          <div className="space-y-8">
            {/* Movies */}
            {displayMovies.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-blue-400 mb-4">Movies</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
                  {displayMovies.map((movie) => (
                    <NetflixCard
                      key={movie.id}
                      content={movie as any}
                      type="movie"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Series */}
            {displaySeries.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-400 mb-4">Series</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
                  {displaySeries.map((s) => (
                    <NetflixCard
                      key={s.id}
                      content={s as any}
                      type="series"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8 pb-12">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loadingMore}
                  className="px-6 py-3 border border-gray-800 text-gray-400 hover:border-[#E50914] hover:text-white disabled:opacity-50 text-sm uppercase tracking-wider transition-all"
                >
                  {loadingMore ? (
                    <span className="inline-flex items-center justify-center font-bold tracking-widest text-xl text-[#E50914]">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                    </span>
                  ) : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

