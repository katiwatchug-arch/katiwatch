"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { MovieWithVJ, SeriesWithVJ } from "@/lib/supabase";
import AuthRequiredModal, { useAuthCheck } from "@/components/AuthRequiredModal";
import { FullPageSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { NetflixCard } from "@/components/NetflixCard";
import { canUserDownload } from "@/lib/subscriptions";
import VideoPlayer from "@/components/VideoPlayer";
import { MovieCast } from "@/components/MovieCast";
import { StreamitHoverCard } from "@/components/StreamitHoverCard";
import { Play, Download, Check, ThumbsUp, Share2 } from "lucide-react";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";

export default function MovieDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isPremium } = useAuth();
  const { checkAuth } = useAuthCheck();

  const [movie, setMovie] = useState<MovieWithVJ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<MovieWithVJ[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [relatedLoaded, setRelatedLoaded] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"play" | "download">("play");
  const [activeTab, setActiveTab] = useState<"more" | "cast">("more");

  const { watchHistory, addToWatchlist, removeFromWatchlist, isInWatchlist, updateWatchProgress } = useUserPreferences();
  const progress = movie ? watchHistory[movie.id] : null;
  const initialTime = progress ? progress.progress : 0;
  const isWatchlisted = movie ? isInWatchlist(movie.id) : false;

  const dataFetchedRef = React.useRef<string | null>(null);
  const hasRights = movie ? checkAuth(movie.premium).allowed : false;

  useEffect(() => {
    async function fetchData() {
      if (!params?.id || dataFetchedRef.current === params.id) return;
      setLoading(true);
      setError(null);

      const api = await import("@/lib/api");
      const data = await api.getMovieById(params.id as string) as MovieWithVJ;
      if (!data) { setError("Movie not found"); setLoading(false); return; }
      setMovie(data);

      fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: params.id, contentType: "movie", userId: user?.id || null }),
      }).catch(() => {});

      // Fetch trailer separately — shown in its own section
      try {
        const trailers = await api.getMovieTrailers(params.id as string);
        if (trailers?.[0]?.key) setTrailerUrl(`https://www.youtube.com/watch?v=${trailers[0].key}`);
      } catch {}

      // Fetch stream for the main player is deferred until user clicks Watch Now
      
      setLoading(false);

      if ((data.genre_ids?.length ?? 0) > 0) {
        setGenres((data.genre_ids ?? []).map(g => ({ id: g, name: g.charAt(0).toUpperCase() + g.slice(1) })));
        try { const r = await api.getRelatedMoviesByGenre(params.id as string, data.genre_ids ?? [], 8); setRelated((r || []) as unknown as MovieWithVJ[]); } catch {}
      }
      setRelatedLoaded(true);
      dataFetchedRef.current = params.id as string;
    }
    fetchData();
  }, [params?.id, user?.id, isPremium]);

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    if (movie && hasRights) {
      updateWatchProgress({ id: movie.id, type: "movie", progress: currentTime, duration, timestamp: Date.now(), title: movie.title, poster_url: movie.thumbnail_url || movie.cover_image_url });
    }
  }, [movie, hasRights, updateWatchProgress]);

  const handleWatchClick = async () => {
    if (!hasRights) {
      const r = checkAuth(movie?.premium ?? false);
      if (r.reason === "auth_required") { setAuthAction("play"); setShowAuthModal(true); }
      else router.push("/payment");
      return;
    }

    // Fetch stream url here so video player only mounts after tapping "Watch Now"
    if (!streamUrl && movie) {
      try {
        const api = await import("@/lib/api");
        const streamData = await api.getMovieStream(movie.id);
        if (streamData?.video_url) {
          setStreamUrl(streamData.video_url);
          // Scroll to player after a short delay to ensure it's mounted
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
        }
      } catch (err) {
        console.error("Failed to load stream", err);
      }
    } else {
      // Stream URL already loaded, just scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDownload = async () => {
    if (!user?.id) { setAuthAction("download"); setShowAuthModal(true); return; }
    if (movie?.premium && !isPremium) { router.push("/payment"); return; }
    const allowed = await canUserDownload(user.id);
    if (!allowed) { router.push("/payment"); return; }
    
    // Scroll to top to ensure modal is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Show modal after brief delay to let scroll complete
    setTimeout(() => {
      setShowDownloadModal(true);
    }, 100);
  };

  if (loading || authLoading) return <FullPageSpinner text="Loading movie details..." />;
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Movie Not Found"}</h1>
          <Button className="bg-[#E50914] hover:bg-[#b80710]" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const coverImage = movie.cover_image_url || `https://via.placeholder.com/1920x1080/141414/e50914?text=${encodeURIComponent(movie.title)}`;
  const releaseYear = movie.release_date ? new Date(typeof movie.release_date === "string" ? movie.release_date.replace(/ /g, "T") : movie.release_date).getFullYear() : "2024";
  const duration = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : null;

  return (
    <div className="min-h-screen bg-[#141414] text-white">

      {/* Hero — main stream player or cover image */}
      <section className="relative w-full aspect-video bg-black max-h-[85vh]">
        {streamUrl ? (
          <VideoPlayer
            src={streamUrl}
            title={movie.title}
            isPremiumContent={movie.premium}
            poster={coverImage}
            initialTime={initialTime}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <div className="w-full h-full relative">
            <Image src={coverImage} alt={movie.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/50" />
            <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 text-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={handleWatchClick} className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </button>
          </div>
        )}
      </section>

      {/* Details */}
      <section className="px-4 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm mb-3 flex-wrap">
          <span className="text-[#46d369] font-bold">98% Match</span>
          <span className="text-gray-300">{releaseYear}</span>
          <span className="border border-gray-500 text-gray-300 text-xs px-1">18+</span>
          {duration && <span className="text-gray-300">{duration}</span>}
          {genres.length > 0 && <span className="text-gray-400 text-xs">{genres.slice(0, 2).map(g => g.name).join(" • ")}</span>}
        </div>

        {/* Description */}
        <p className="text-gray-200 text-sm leading-relaxed mb-4">
          {movie.description || "No description provided."}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-6 py-4 border-b border-gray-800">
          <button
            onClick={() => isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id, "movie")}
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
              if (navigator.share) navigator.share({ title: movie.title, url: window.location.href }).catch(() => {});
              else navigator.clipboard.writeText(window.location.href).catch(() => {});
            }}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs">Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
            <Download className="w-6 h-6" />
            <span className="text-xs">Download</span>
          </button>
        </div>

        {/* Watch Now button */}
        <div className="py-4">
          <button
            onClick={handleWatchClick}
            className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#c8000f] text-white font-bold py-3 rounded text-sm transition-colors"
          >
            <Play className="w-5 h-5 fill-white" /> Watch Now
          </button>
        </div>
      </section>

      {/* Trailer Section — auto-plays below the action buttons */}
      {trailerUrl && (
        <section className="px-4 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Trailer</h2>
          <div className="relative w-full pt-[56.25%] bg-black overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${trailerUrl.match(/(?:youtu\.be\/|watch\?v=)([^&?]+)/)?.[1]}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              title={`${movie.title} — Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="px-4 mt-2">
        <div className="flex gap-6 border-b border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab("more")}
            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === "more" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            More Like This
            {activeTab === "more" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />}
          </button>
          <button
            onClick={() => setActiveTab("cast")}
            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === "cast" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Cast &amp; Crew
            {activeTab === "cast" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />}
          </button>
        </div>

        {activeTab === "more" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4 pb-8">
            {related.length > 0 ? related.map(r => (
              <NetflixCard key={r.id} content={r} type="movie" />
            )) : relatedLoaded ? (
              <p className="text-gray-500 text-sm col-span-3 py-8 text-center">No similar movies found.</p>
            ) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="pt-[150%] rounded bg-gray-800/40 animate-pulse" />
              ))
            )}
          </div>
        )}

        {activeTab === "cast" && (
          <div className="pb-8">
            <MovieCast title={movie.title} hideTitle />
          </div>
        )}
      </section>

      {/* Download Modal - Always Centered in Viewport */}
      {showDownloadModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[15vh] sm:pt-[20vh]"
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
            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Icon with Pulse Animation */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-[#E50914]/20 rounded-full animate-ping"></div>
                <div 
                  className="relative w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.15), rgba(229, 9, 20, 0.05))',
                    border: '2px solid rgba(229, 9, 20, 0.3)',
                  }}
                >
                  <Download className="w-9 h-9 text-[#E50914]" strokeWidth={2.5} />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Ready to Download
              </h2>
              <p className="text-gray-400 text-sm mb-1 text-center font-medium">
                {movie.title}
              </p>
              <p className="text-gray-500 text-xs mb-6 text-center">
                Download will start in a new tab
              </p>

              {/* Download Button - Enhanced */}
              <button
                className="w-full bg-gradient-to-r from-[#E50914] to-[#b80710] hover:from-[#c8000f] hover:to-[#a00610] text-white font-bold py-4 rounded-xl mb-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                style={{
                  boxShadow: '0 4px 20px rgba(229, 9, 20, 0.4)',
                }}
                onClick={() => {
                  const clean = movie.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "").trim();
                  const filename = clean + ".mp4";
                  const proxyUrl = `/api/download?id=${movie.id}&type=movie&filename=${encodeURIComponent(filename)}`;
                  window.open(proxyUrl, '_blank');
                  setShowDownloadModal(false);
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>Start Download</span>
                </span>
              </button>

              {/* Cancel Button */}
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

      <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} action={authAction} requirePremium={false} />
    </div>
  );
}
