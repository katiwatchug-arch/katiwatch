"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Film, Tv, Search } from "lucide-react";
import { getRegionContent, getRegionMovies, getRegionSeries } from "@/lib/api";
import { NetflixCard } from "@/components/NetflixCard";

type ContentType = "all" | "movies" | "series";

type Movie = {
  id: string;
  title: string;
  thumbnail_url?: string;
  poster_url?: string;
  poster?: string;
  release_date?: string;
  imdb_rating?: number;
};

type Series = {
  id: string;
  title: string;
  thumbnail_url?: string;
  poster_url?: string;
  poster?: string;
  release_date?: string;
  imdb_rating?: number;
};

type Content = (Movie | Series) & { type: "movie" | "series" };

const regionNames: Record<string, string> = {
  'kdrama': 'K-Drama',
  'chinese-drama': 'Chinese Drama',
  'western': 'Western',
  'bollywood': 'Bollywood',
  'nollywood': 'Nollywood',
  'east-african': 'East African',
  'anime': 'Anime',
  'latin': 'Latin',
  'turkish': 'Turkish',
  'filipino': 'Filipino',
  'thai': 'Thai'
};

const regionIcons: Record<string, string> = {
  'kdrama': '🇰🇷',
  'chinese-drama': '🇨🇳',
  'western': '🇺🇸',
  'bollywood': '🇮🇳',
  'nollywood': '🇳🇬',
  'east-african': '🇺🇬',
  'anime': '🇯🇵',
  'latin': '🇲🇽',
  'turkish': '🇹🇷',
  'filipino': '🇵🇭',
  'thai': '🇹🇭'
};

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [contentType, setContentType] = useState<ContentType>("all");
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const regionName = regionNames[slug] || slug;
  const regionIcon = regionIcons[slug] || '🌍';

  // Load content based on filter
  useEffect(() => {
    setLoading(true);
    setContent([]);
    setPage(1);
    setHasMore(true);
    loadContent(1, contentType);
  }, [slug, contentType]);

  const loadContent = async (pageNum: number, type: ContentType) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let newContent: Content[] = [];

      if (type === "all") {
        const result = await getRegionContent(slug, pageNum);
        newContent = result.data.map((item: any) => ({
          ...item,
          type: item.type || (item.seasons ? "series" : "movie")
        }));
      } else if (type === "movies") {
        const movies = await getRegionMovies(slug, pageNum);
        newContent = movies.map((m: Movie) => ({ ...m, type: "movie" as const }));
      } else if (type === "series") {
        const series = await getRegionSeries(slug, pageNum);
        newContent = series.map((s: Series) => ({ ...s, type: "series" as const }));
      }

      if (pageNum === 1) {
        setContent(newContent);
      } else {
        setContent(prev => [...prev, ...newContent]);
      }

      setHasMore(newContent.length > 0);
    } catch (error) {
      console.error('Error loading region content:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loadingMore &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadContent(nextPage, contentType);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, page, contentType, loading]);

  // Filter content by search query
  const filteredContent = searchQuery
    ? content.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : content;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50 pt-safe">
        <div className="container mx-auto sm:px-6">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl sm:text-5xl">{regionIcon}</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {regionName}
            </h1>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${regionName} content...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition-colors"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setContentType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                contentType === "all"
                  ? "bg-[#E50914] text-white"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setContentType("movies")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                contentType === "movies"
                  ? "bg-[#E50914] text-white"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              <Film className="w-4 h-4" />
              Movies
            </button>
            <button
              onClick={() => setContentType("series")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                contentType === "series"
                  ? "bg-[#E50914] text-white"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              <Tv className="w-4 h-4" />
              Series
            </button>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="relative pt-[150%] rounded-md bg-gray-800/40 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filteredContent.length > 0 && (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4">
              {filteredContent.map((item) => (
                <NetflixCard
                  key={`${item.type}-${item.id}`}
                  content={item}
                  type={item.type}
                />
              ))}
            </div>

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative pt-[150%] rounded-md bg-gray-800/40 animate-pulse" />
                ))}
              </div>
            )}

            {/* End of content message */}
            {!hasMore && !loadingMore && (
              <div className="text-center py-12">
                <p className="text-gray-500">You've reached the end</p>
              </div>
            )}
          </>
        )}

        {!loading && filteredContent.length === 0 && (
          <div className="text-center py-24">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              {searchQuery ? "No results found" : "No content available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No ${contentType === "all" ? "content" : contentType} found matching "${searchQuery}"`
                : `No ${contentType === "all" ? "content" : contentType} available for this region yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
