"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/LoadingSpinner";
import { Play, Download, Check, ThumbsUp, Share2, ChevronDown } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { useAuth } from "@/components/AuthProvider";
import { getProfile, Profile } from "@/lib/profiles";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { canUserDownload } from "@/lib/subscriptions";
import { supabase, Series, SeriesWithVJ, Season, Episode, EpisodeWithSeason, MovieWithVJ } from "@/lib/supabase";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";
import { NetflixCard } from "@/components/NetflixCard";

export default function SeriesDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isPremium, loading: authLoading } = useAuth();

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [allEpisodes, setAllEpisodes] = useState<EpisodeWithSeason[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeWithSeason | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"episodes" | "more">("episodes");
  const [relatedSeries, setRelatedSeries] = useState<SeriesWithVJ[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"play" | "download">("play");
  const [castInfo, setCastInfo] = useState<{ starring: string; creators: string }>({ starring: "", creators: "" });

  const { watchHistory, addToWatchlist, removeFromWatchlist, isInWatchlist, updateWatchProgress } = useUserPreferences();
  const progress = series ? watchHistory[series.id] : null;
  const initialTime = progress ? progress.progress : 0;
  const isWatchlisted = series ? isInWatchlist(series.id) : false;

  const dataFetchedRef = React.useRef<string | null>(null);

  useEffect(() => {
    async function fetchSeriesData() {
      if (!params.id || dataFetchedRef.current === params.id) return;

      try {
        const api = await import("@/lib/api");
        const seriesData = await api.getSeriesById(params.id as string) as SeriesWithVJ;
        if (!seriesData) throw new Error("Series not found");

        let seasonsList: Season[] = [];
        let loadedEpisodes: EpisodeWithSeason[] = [];

        if ((seriesData as any).seasons?.length > 0) {
          seasonsList = (seriesData as any).seasons;
          const firstSeason = seasonsList[0] as any;
          const firstSeasonNum = firstSeason.season_number || firstSeason.order || 1;
          setActiveSeasonId(firstSeason.id || String(firstSeasonNum));

          const seasonsWithEpisodes = await Promise.all(
            seasonsList.map(async (season: any) => {
              const seasonNum = season.season_number || season.order || 1;
              const seasonId = season.id || String(seasonNum);
              const seasonEps: any[] = Array.isArray(season.episodes) && season.episodes.length > 0
                ? season.episodes
                : await api.getEpisodes(params.id as string, seasonNum) || [];

              const mappedEps = seasonEps.map((e: any) => ({
                ...e,
                seasonName: season.name || `Season ${seasonNum}`,
                seasonOrder: seasonNum,
                season_id: seasonId,
              })) as unknown as EpisodeWithSeason[];
              loadedEpisodes = [...loadedEpisodes, ...mappedEps];
              return { ...season, episodes: seasonEps, id: seasonId };
            })
          );
          (seriesData as any).seasons = seasonsWithEpisodes;
          setSeasons(seasonsWithEpisodes);
        } else {
          const episodes = await api.getEpisodes(params.id as string, 1);
          if (episodes.length > 0) {
            const seasonId = "season-1";
            setActiveSeasonId(seasonId);
            loadedEpisodes = episodes.map((e: any) => ({
              ...e, seasonName: "Season 1", seasonOrder: 1, season_id: seasonId,
            })) as unknown as EpisodeWithSeason[];
            const mockSeason = { id: seasonId, name: "Season 1", order: 1, series_id: params.id as string, published: true, created_at: new Date().toISOString(), episodes } as Season & { episodes: any };
            (seriesData as any).seasons = [mockSeason];
            setSeasons([mockSeason]);
          }
        }

        const allEps = loadedEpisodes.sort((a, b) => {
          if (a.seasonOrder !== b.seasonOrder) return a.seasonOrder - b.seasonOrder;
          return a.episode_number - b.episode_number;
        });
        setAllEpisodes(allEps);

        const savedProgress = JSON.parse(localStorage.getItem("streamit_history") || "{}")[params.id as string];
        if (savedProgress?.episode) {
          const epToSelect = allEps.find(e => e.seasonOrder === savedProgress.season && e.episode_number === savedProgress.episode);
          if (epToSelect) { setSelectedEpisode(epToSelect); setActiveSeasonId(epToSelect.season_id); }
        }

        setSeries(seriesData);

        fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId: params.id, contentType: "series", userId: user?.id || null }),
        }).catch(() => {});

        // Trailer goes in its own section — fetch separately
        try {
          const trailers = await api.getSeriesTrailers(params.id as string);
          if (trailers?.[0]?.key) setTrailerUrl(`https://www.youtube.com/watch?v=${trailers[0].key}`);
        } catch {}

        setLoading(false);

        if ((seriesData?.genre_ids?.length ?? 0) > 0) {
          try {
            const rel = await api.getRelatedSeriesByGenre(params.id as string, seriesData.genre_ids as string[], 10) as SeriesWithVJ[];
            setRelatedSeries(rel || []);
          } catch {}
        }

        // Fetch cast info from TMDB via MovieCast logic
        try {
          const tmdbRes = await fetch(`/api/search?q=${encodeURIComponent(seriesData.title)}&type=series`);
          if (tmdbRes.ok) {
            const tmdbData = await tmdbRes.json();
            if (tmdbData?.results?.[0]?.id) {
              const credRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbData.results[0].id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
              if (credRes.ok) {
                const cred = await credRes.json();
                const starring = (cred.cast || []).slice(0, 3).map((c: any) => c.name).join(", ");
                const creators = (cred.crew || []).filter((c: any) => c.job === "Creator" || c.department === "Writing").slice(0, 2).map((c: any) => c.name).join(", ");
                setCastInfo({ starring, creators });
              }
            }
          }
        } catch {}

        dataFetchedRef.current = params.id as string;
      } catch (error) {
        console.error("Error fetching series:", error);
        setLoading(false);
      }
    }
    fetchSeriesData();
  }, [params.id, user?.id]);

  const handleEpisodeSelect = async (episode: EpisodeWithSeason) => {
    setSelectedEpisode(episode);
    if (!user?.id) { setAuthAction("play"); setShowAuthModal(true); return; }
    if (episode.premium && !isPremium) { router.push("/payment"); return; }
    try {
      const api = await import("@/lib/api");
      const streamData = await api.getEpisodeStream(params.id as string, episode.seasonOrder || 1, episode.episode_number);
      if (streamData?.video_url) setStreamUrl(streamData.video_url);
      else alert("This episode is not available for watching");
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVideoEnded = useCallback(() => {
    // Auto-advance to first episode when stream ends
    if (allEpisodes.length > 0) {
      const firstEp = allEpisodes[0];
      if (!firstEp.premium || isPremium) handleEpisodeSelect(firstEp);
    }
  }, [allEpisodes, isPremium]);

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    if (series && selectedEpisode) {
      updateWatchProgress({
        id: series.id, type: "series", progress: currentTime, duration,
        timestamp: Date.now(), title: series.title,
        poster_url: series.thumbnail_url || series.cover_image_url,
        season: selectedEpisode.seasonOrder, episode: selectedEpisode.episode_number,
      });
    }
  }, [series, selectedEpisode, updateWatchProgress]);

  const handleDownload = async (episode: EpisodeWithSeason) => {
    setSelectedEpisode(episode);
    if (!user?.id) { setAuthAction("download"); setShowAuthModal(true); return; }
    if (episode.premium && !isPremium) { router.push("/payment"); return; }
    const allowed = await canUserDownload(user.id);
    if (!allowed) { router.push("/payment"); return; }
    
    // Scroll to top to ensure modal is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Show modal after brief delay to let scroll complete
    setTimeout(() => {
      setShowDownloadModal(true);
    }, 100);
  };

  const handleDownloadNow = async () => {
    if (!selectedEpisode) return;
    const cleanTitle = series?.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "").trim() || "Series";
    const cleanEp = selectedEpisode.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "").trim();
    const filename = `${cleanTitle} - S${selectedEpisode.seasonOrder}E${selectedEpisode.episode_number} - ${cleanEp}.mp4`;
    // The API route redirects to the signed S3 URL which enforces the download
    const proxyUrl = `/api/download?id=${params.id}&type=episode&season=${selectedEpisode.seasonOrder || 1}&episode=${selectedEpisode.episode_number}&filename=${encodeURIComponent(filename)}`;
    window.open(proxyUrl, '_blank');
    setShowDownloadModal(false);
  };

  if (loading || authLoading) return <FullPageSpinner text="Loading series details..." />;

  if (!series) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
          <Button className="bg-[#E50914] hover:bg-[#b80710]" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const coverImage = series.cover_image_url || `https://via.placeholder.com/1920x1080/141414/e50914?text=${encodeURIComponent(series.title)}`;
  const currentEpisodeIndex = selectedEpisode ? allEpisodes.findIndex(e => e.id === selectedEpisode.id) : -1;
  const activeSeason = seasons.find(s => s.id === activeSeasonId);
  const activeEpisodes = allEpisodes.filter(ep => ep.season_id === activeSeasonId);
  const releaseYear = series.release_date ? new Date(typeof series.release_date === "string" ? series.release_date.replace(/ /g, "T") : series.release_date).getFullYear() : "2024";

  return (
    <div className="min-h-screen bg-[#141414] text-white">

      {/* Hero — video player or cover image with play button */}
      <section className="relative w-full aspect-video bg-black max-h-[85vh]">
        {streamUrl ? (
          <div className="w-full h-full relative">
            <VideoPlayer
              src={streamUrl}
              title={selectedEpisode ? `${selectedEpisode.seasonName} E${selectedEpisode.episode_number}: ${selectedEpisode.title}` : series.title}
              onEnded={handleVideoEnded}
              isPremiumContent={selectedEpisode?.premium || false}
              poster={coverImage}
              episodes={allEpisodes}
              currentEpisodeIndex={currentEpisodeIndex}
              onEpisodeSelect={handleEpisodeSelect}
              contentType="series"
              initialTime={(selectedEpisode && progress && progress.episode === selectedEpisode.episode_number && progress.season === selectedEpisode.seasonOrder) ? initialTime : 0}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        ) : (
          <div className="w-full h-full relative">
            <Image src={coverImage} alt={series.title} fill className="object-cover" priority />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Back button */}
            <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 text-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Centered play button */}
            <button
              onClick={() => allEpisodes.length > 0 && handleEpisodeSelect(allEpisodes[0])}
              className="absolute inset-0 flex items-center justify-center z-10"
              aria-label="Play"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </button>
          </div>
        )}

        {/* Download Modal - Anchored over Player */}
        {showDownloadModal && selectedEpisode && (
          <div 
            className="absolute inset-0 z-[90] flex items-center justify-center p-4"
            onClick={() => setShowDownloadModal(false)}
            style={{ 
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div 
              className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl shadow-2xl transform transition-all duration-300 ease-out animate-modal-appear"
              onClick={e => e.stopPropagation()}
              style={{
                border: '1px solid rgba(229, 9, 20, 0.1)',
                boxShadow: '0 0 40px rgba(229, 9, 20, 0.15), 0 20px 60px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div className="p-4 sm:p-8" style={{ paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom)))' }}>
                <div className="relative mx-auto w-14 h-14 sm:w-20 sm:h-20 mb-3 sm:mb-6">
                  <div className="absolute inset-0 bg-[#E50914]/20 rounded-full animate-ping"></div>
                  <div 
                    className="relative w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.15), rgba(229, 9, 20, 0.05))',
                      border: '2px solid rgba(229, 9, 20, 0.3)',
                    }}
                  >
                    <Download className="w-7 h-7 sm:w-9 sm:h-9 text-[#E50914]" strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 text-center">Ready to Download</h2>
                <p className="text-gray-400 text-sm mb-1 text-center font-medium">{series?.title}</p>
                <p className="text-gray-500 text-xs mb-4 sm:mb-6 text-center">
                  S{selectedEpisode.seasonOrder}E{selectedEpisode.episode_number}: {selectedEpisode.title}
                </p>
                <button
                  className="w-full bg-gradient-to-r from-[#E50914] to-[#b80710] hover:from-[#c8000f] hover:to-[#a00610] text-white font-bold py-4 rounded-xl mb-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  style={{ boxShadow: '0 4px 20px rgba(229, 9, 20, 0.4)' }}
                  onClick={handleDownloadNow}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    <span>Start Download</span>
                  </span>
                </button>
                <button 
                  className="w-full text-gray-400 hover:text-white text-sm font-medium py-3 transition-colors rounded-xl hover:bg-white/5"
                  onClick={() => setShowDownloadModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Details Section */}
      <section className="px-4 pt-5 pb-2">
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">{series.title}</h1>

        {/* Meta row: match%, year, rating, seasons */}
        <div className="flex items-center gap-3 text-sm mb-3 flex-wrap">
          <span className="text-[#46d369] font-bold">98% Match</span>
          <span className="text-gray-300">{releaseYear}</span>
          <span className="border border-gray-500 text-gray-300 text-xs px-1">13+</span>
          <span className="text-gray-300">{seasons.length} {seasons.length === 1 ? "Season" : "Seasons"}</span>
        </div>

        {/* Description */}
        <p className="text-gray-200 text-sm leading-relaxed mb-3">
          {series.description || "No description provided."}
        </p>

        {/* Starring / Creators */}
        {castInfo.starring && (
          <p className="text-xs text-gray-400 mb-1">
            <span className="text-gray-300 font-semibold">Starring: </span>{castInfo.starring}
          </p>
        )}
        {castInfo.creators && (
          <p className="text-xs text-gray-400 mb-4">
            <span className="text-gray-300 font-semibold">Creators: </span>{castInfo.creators}
          </p>
        )}

        {/* Action buttons: My List, Rate, Share */}
        <div className="flex items-center gap-6 py-4 border-b border-gray-800">
          <button
            onClick={() => isWatchlisted ? removeFromWatchlist(series.id) : addToWatchlist(series.id, "series")}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
            <Check className={`w-6 h-6 ${isWatchlisted ? "text-white" : "text-gray-300"}`} />
            <span className="text-xs">My List</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors">
            <ThumbsUp className="w-6 h-6" />
            <span className="text-xs">Rate</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) navigator.share({ title: series.title, url: window.location.href }).catch(() => {});
              else navigator.clipboard.writeText(window.location.href).catch(() => {});
            }}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </section>

      {/* Trailer Section — auto-plays below action buttons */}
      {trailerUrl && (
        <section className="px-4 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Trailer</h2>
          <div className="relative w-full pt-[56.25%] bg-black overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${trailerUrl.match(/(?:youtu\.be\/|watch\?v=)([^&?]+)/)?.[1]}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              title={`${series.title} — Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </section>
      )}

      {/* Tabs: EPISODES | MORE LIKE THIS */}
      <section className="px-4 mt-2">
        <div className="flex gap-6 border-b border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab("episodes")}
            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === "episodes" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Episodes
            {activeTab === "episodes" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />}
          </button>
          <button
            onClick={() => setActiveTab("more")}
            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === "more" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            More Like This
            {activeTab === "more" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />}
          </button>
        </div>

        {activeTab === "episodes" && (
          <div>
            {/* Netflix-style Season Selector */}
            {seasons.length > 0 && (
              <div className="relative inline-block mb-6">
                <button
                  onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                  className="flex items-center gap-3 bg-[#0a0a0a] border-2 border-gray-800 hover:border-gray-600 text-white font-bold px-5 py-3 rounded-lg text-sm transition-all duration-300 min-w-[180px] justify-between group"
                >
                  <span className="group-hover:text-white transition-colors">
                    {activeSeason?.name || `Season 1`}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showSeasonDropdown ? "rotate-180" : ""}`} />
                </button>
                
                {showSeasonDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSeasonDropdown(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 bg-[#181818] border-2 border-gray-800 rounded-lg shadow-2xl z-40 min-w-[200px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {seasons.map((s, index) => {
                        const isActive = s.id === activeSeasonId;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setActiveSeasonId(s.id);
                              setShowSeasonDropdown(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 text-sm transition-all duration-200 border-b border-gray-800/50 last:border-b-0 ${
                              isActive
                                ? "bg-[#E50914] text-white font-bold"
                                : "text-gray-300 hover:bg-[#202020] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{s.name || `Season ${(s as any).order || index + 1}`}</span>
                              {isActive && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Netflix-style Episodes List */}
            <div className="space-y-3 pb-8">
              {activeEpisodes.map((episode, index) => (
                <div
                  key={episode.id}
                  className="group bg-[#181818] rounded-lg overflow-hidden hover:bg-[#202020] transition-all duration-300 border border-transparent hover:border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                    {/* Thumbnail Section */}
                    <div
                      className="relative w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 cursor-pointer"
                      onClick={() => handleEpisodeSelect(episode)}
                    >
                      {/* Aspect ratio container */}
                      <div className="relative pt-[56.25%] sm:pt-0 sm:h-32 md:h-36 overflow-hidden">
                        <Image
                          src={episode.thumbnail_url || coverImage}
                          alt={episode.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/30" />
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                          <div className="w-12 h-12 rounded-full border-2 border-white/90 flex items-center justify-center bg-black/50 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        
                        {/* Episode number badge */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded px-2 py-1 text-white font-bold text-xs sm:text-sm">
                            {episode.episode_number}
                          </div>
                        </div>
                        
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                          <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-0.5 text-white text-[10px] sm:text-xs font-medium">
                            {episode.duration || "22m"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-4 sm:py-3 sm:pr-4 sm:pl-0 flex flex-col justify-center min-w-0">
                      {/* Title and Download Row */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-white font-bold text-base sm:text-lg mb-1 line-clamp-1 group-hover:text-[#E50914] transition-colors duration-300 cursor-pointer"
                            onClick={() => handleEpisodeSelect(episode)}
                          >
                            {episode.title}
                          </h3>
                        </div>
                        
                        {/* Download button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(episode); }}
                          className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-gray-700 hover:border-white flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 group/download"
                          aria-label="Download episode"
                        >
                          <Download className="w-4 h-4 group-hover/download:scale-110 transition-transform" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-0">
                        {episode.description || "Watch this exciting episode to continue the story."}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar (if watched) */}
                  {progress && progress.episode === episode.episode_number && progress.season === episode.seasonOrder && progress.progress > 0 && (
                    <div className="h-1 bg-gray-800">
                      <div
                        className="h-full bg-[#E50914]"
                        style={{ width: `${Math.min((progress.progress / (progress.duration || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "more" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4 pb-8">
            {relatedSeries.length > 0 ? relatedSeries.map(s => (
              <NetflixCard key={s.id} content={s} type="series" />
            )) : (
              <p className="text-gray-500 text-sm col-span-3 py-8 text-center">No similar series found.</p>
            )}
          </div>
        )}
      </section>

      <AuthRequiredModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authAction}
        requirePremium={authAction === 'download'}
      />
    </div>
  );
}
