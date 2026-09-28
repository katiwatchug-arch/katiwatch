"use client";
import { Search, Tv, Play, X, Radio } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ModernSearchBar } from "@/components/ModernSearchBar";
import { getSportsChannels, searchSportsChannels, getLiveEvents } from "@/lib/api";

type Channel = {
  id: string;
  name: string;
  category: string;
  channel_type: string;
  embed_url: string;
  logo: string;
  is_live: boolean;
};

type LiveEvent = {
  id: string;
  title: string;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  start_time: string;
  status: string;
  embed_url: string;
};

const categories = ['all', 'Local', 'Sports', 'Movies & Shows', 'News', 'Music', 'Family & Kids'];

const LoadingGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} className="aspect-video rounded-lg bg-gray-800/40 animate-pulse" />
    ))}
  </div>
);

export default function SportsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalChannels, setTotalChannels] = useState(0);

  const channelsPerPage = 50;

  const fetchChannels = useCallback(async (query = "", category = "all", page = 1) => {
    setLoading(true);
    try {
      if (query.trim()) {
        const results = await searchSportsChannels(query);
        setChannels(results);
        setTotalChannels(results.length);
      } else {
        const result = await getSportsChannels(page, channelsPerPage, category);
        setChannels(result.data);
        setTotalChannels(result.total);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiveEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const events = await getLiveEvents();
      setLiveEvents(events);
    } catch (error) {
      console.error("Error fetching live events:", error);
      setLiveEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels("", selectedCategory, 1);
    fetchLiveEvents();
  }, [fetchChannels, fetchLiveEvents, selectedCategory]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchChannels(searchQuery, selectedCategory, currentPage);
    }
  }, [currentPage, fetchChannels, searchQuery, selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchChannels(searchQuery, selectedCategory, 1);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  const closeModal = () => {
    setSelectedChannel(null);
    setSelectedEvent(null);
  };

  const isFiltering = searchQuery.trim().length > 0;
  const totalPages = Math.ceil(totalChannels / channelsPerPage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50 pt-safe">
        <div className="container mx-auto sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-[#E50914]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Sports & Live TV</h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm ml-8 sm:ml-9">
            870+ Live broadcast channels including sports, local TV, news & more
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Live Events Section */}
        {liveEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-5 h-5 text-[#E50914]" />
              <h2 className="text-xl font-bold">Live Sports Events</h2>
              <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                LIVE
              </span>
            </div>
            
            {loadingEvents ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-80 aspect-video rounded-lg bg-gray-800/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {liveEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex-shrink-0 w-80 cursor-pointer group"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[#E50914] to-[#b80710] relative hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-xs font-bold text-white/80 mb-2">{event.league || event.sport}</div>
                        <div className="text-sm font-bold text-white mb-1">{event.home_team}</div>
                        <div className="text-xs text-white/90 mb-1">vs</div>
                        <div className="text-sm font-bold text-white">{event.away_team}</div>
                        <div className="mt-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                          WATCH LIVE
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium line-clamp-1">{event.title}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Search and Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search channels..."
              className="flex-1"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="relative">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full 
                    text-sm font-semibold whitespace-nowrap
                    transition-all duration-300
                    ${selectedCategory === category 
                      ? 'bg-gradient-to-r from-[#E50914] to-[#b80710] text-white shadow-lg shadow-[#E50914]/40 scale-105' 
                      : 'bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {category === 'all' ? 'All Channels' : category}
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Loading */}
        {loading && <LoadingGrid />}

        {/* Channels Grid */}
        {!loading && channels.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className="group relative cursor-pointer rounded-lg overflow-hidden bg-gray-900 hover:ring-2 hover:ring-[#E50914] transition-all duration-300 hover:scale-105"
              >
                <div className="aspect-video relative flex items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
                  {channel.logo ? (
                    <Image
                      src={channel.logo}
                      alt={channel.name}
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <Tv className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-400 line-clamp-2">{channel.name}</p>
                    </div>
                  )}
                  
                  {channel.is_live && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                      LIVE
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{channel.name}</h3>
                    <div className="text-xs text-gray-300">{channel.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && channels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-5">
              <Search className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No channels found</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              {isFiltering ? "Try different search terms or remove filters." : "Channels are being loaded. Please try again shortly."}
            </p>
            {isFiltering && (
              <button onClick={clearFilters} className="mt-5 px-5 py-2.5 bg-[#E50914] hover:bg-[#b80710] text-white rounded-xl text-sm font-semibold transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!searchQuery.trim() && totalPages > 1 && !loading && (
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

      {/* Channel Player Modal */}
      {selectedChannel && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div 
              className="bg-[#141414] rounded-xl max-w-6xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="aspect-video bg-black">
                  <iframe
                    src={selectedChannel.embed_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedChannel.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="px-3 py-1 bg-gray-800 rounded-full">{selectedChannel.category}</span>
                      {selectedChannel.is_live && (
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Player Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div 
              className="bg-[#141414] rounded-xl max-w-6xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="aspect-video bg-black">
                  <iframe
                    src={selectedEvent.embed_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
                    <div className="text-lg text-gray-300 mb-3">
                      {selectedEvent.home_team} vs {selectedEvent.away_team}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="px-3 py-1 bg-gray-800 rounded-full">{selectedEvent.sport}</span>
                      {selectedEvent.league && (
                        <span className="px-3 py-1 bg-gray-800 rounded-full">{selectedEvent.league}</span>
                      )}
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
