import { Movie, Series, Genre, EpisodeWithSeason, Season, Episode } from './supabase';

const REELPLEXI_API_KEY = (process.env.REELPLEXI_API_KEY || process.env.NEXT_PUBLIC_REELPLEXI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();
const isServer = typeof window === 'undefined';
const REELPLEXI_BASE_URL = isServer ? 'https://api.reelplexi.com' : '/api/reelplexi';

class ReelplexiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ReelplexiError';
  }
}

async function fetchReelplexi(endpoint: string, params: Record<string, string | number> = {}) {
  let origin = '';
  if (!isServer) {
    origin = window.location.origin || (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: ''));
  }
  const urlString = isServer ? `${REELPLEXI_BASE_URL}${endpoint}` : `${origin}${REELPLEXI_BASE_URL}${endpoint}`;
  
  let queryString = '';
  const paramKeys = Object.keys(params);
  if (paramKeys.length > 0) {
    queryString = '?' + paramKeys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`).join('&');
  }
  const fullUrl = `${urlString}${queryString}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (isServer && REELPLEXI_API_KEY) {
    headers['X-API-Key'] = REELPLEXI_API_KEY;
    headers['Authorization'] = `Bearer ${REELPLEXI_API_KEY}`;
  }

  let res: any;

  if (isServer) {
    res = await fetch(fullUrl, {
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes server-side
    });
  } else {
    // Client-side: use XMLHttpRequest to bypass Next.js buggy fetch polyfills on old TVs
    res = await new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fullUrl, true);
        for (const k in headers) {
          if (Object.prototype.hasOwnProperty.call(headers, k)) {
            xhr.setRequestHeader(k, headers[k]);
          }
        }
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            text: async () => xhr.responseText,
            json: async () => {
              try {
                return JSON.parse(xhr.responseText);
              } catch (e) {
                return {};
              }
            }
          });
        };
        xhr.onerror = function() {
          reject(new Error('Network request failed'));
        };
        xhr.send();
      } catch (e) {
        reject(e);
      }
    });
  }

  if (!res.ok) {
    let message = 'Unknown API error';
    const text = await res.text();
    try {
      const body = JSON.parse(text);
      if (body.detail) {
        const detailMsg = typeof body.detail === 'string' 
          ? body.detail 
          : (body.detail.error?.message || JSON.stringify(body.detail));
        throw new ReelplexiError(res.status, `Reelplexi API error (HTTP ${res.status}): ${detailMsg}`);
      }
      if (body.error) {
        message = typeof body.error === 'string' ? body.error : (body.error.message || JSON.stringify(body.error));
      }
    } catch (e) {
      if (e instanceof ReelplexiError) throw e;
      throw new ReelplexiError(res.status, `HTTP error ${res.status}: ${text.substring(0, 150)}`);
    }
    throw new ReelplexiError(res.status, `Reelplexi API error: ${message}`);
  }

  const body = await res.json();
  return body;
}

// Helpers
const asString = (val: any) => (val ? String(val).trim() : undefined);
const yearToDate = (year: any) => (year ? `${year}-01-01` : undefined);

function extractVjName(raw: any): string | null {
  const direct = asString(raw.vj_name) || asString(raw.vj) || asString(raw.translator);
  if (direct) return direct;
  
  const versions = raw.available_vj_versions;
  if (Array.isArray(versions) && versions.length > 0 && typeof versions[0] === 'object') {
    return asString(versions[0].vj_name) || asString(versions[0].name) || null;
  }
  return null;
}

function normalizeGenres(genres: any): string[] {
  if (!Array.isArray(genres)) return [];
  return genres.map(g => asString(g)).filter(Boolean) as string[];
}

export function normalizeReelplexiMovie(raw: any): any {
  if (!raw) return null;
  const genres = normalizeGenres(raw.genres);
  const vjName = extractVjName(raw);
  const posterUrl = asString(raw.poster_url) || asString(raw.thumbnail_url) || '';
  const backdropUrl = asString(raw.backdrop_url) || posterUrl;
  
  return {
    id: asString(raw.id) || '',
    title: asString(raw.title) || asString(raw.name) || 'Untitled',
    description: asString(raw.description) || asString(raw.overview) || asString(raw.plot) || asString(raw.synopsis) || asString(raw.storyline) || '',
    release_date: asString(raw.release_date) || asString(raw.released_at) || yearToDate(raw.year) || new Date().toISOString(),
    thumbnail_url: posterUrl,
    cover_image_url: backdropUrl,
    trailer_url: asString(raw.trailer_url),
    genre_ids: genres.map(g => g.toLowerCase()),
    duration: raw.duration_mins || raw.runtime || 120, // Default to 120 mins if unknown
    published: true,
    premium: raw.premium !== false, // All content is paid for by default
    recommend: raw.recommend === true,
    popular: raw.popular === true,
    latest: raw.latest === true,
    vj_id: vjName ? vjName.toLowerCase() : undefined,
    video_url: asString(raw.stream_url) || asString(raw.proxy_url),
    embed_url: asString(raw.embed_url) || `https://embed.reelplexi.com/movie/${raw.id}?key=${REELPLEXI_API_KEY}`,
    tmdb_id: raw.tmdb_id || undefined,
    vjs: vjName ? { id: vjName.toLowerCase(), name: vjName } : null,
    type: 'movie'
  };
}

export function normalizeReelplexiSeries(raw: any): any {
  if (!raw) return null;
  const genres = normalizeGenres(raw.genres);
  const vjName = extractVjName(raw);
  const posterUrl = asString(raw.poster_url) || asString(raw.thumbnail_url) || '';
  const backdropUrl = asString(raw.backdrop_url) || posterUrl;
  const seriesId = asString(raw.id) || '';

  // Preserve embedded seasons and their episodes — the dedicated episodes
  // endpoint is unreliable; this embedded data is the source of truth.
  const rawSeasons = Array.isArray(raw.seasons) ? raw.seasons : [];
  const seasons = rawSeasons.map((s: any) => ({
    season_number: s.season_number || 1,
    name: s.name || `Season ${s.season_number || 1}`,
    overview: s.overview || '',
    episode_count: s.episode_count || (Array.isArray(s.episodes) ? s.episodes.length : 0),
    poster_path: s.poster_path || s.poster_url || '',
    episodes: Array.isArray(s.episodes)
      ? s.episodes.map((ep: any) => normalizeReelplexiEpisode(seriesId, s.season_number || 1, ep))
      : [],
  }));

  return {
    id: seriesId,
    title: asString(raw.title) || asString(raw.name) || 'Untitled',
    description: asString(raw.description) || asString(raw.overview) || asString(raw.plot) || asString(raw.synopsis) || asString(raw.storyline) || '',
    release_date: asString(raw.first_air_date) || yearToDate(raw.year) || asString(raw.release_date) || new Date().toISOString(),
    thumbnail_url: posterUrl,
    cover_image_url: backdropUrl,
    trailer_url: asString(raw.trailer_url),
    genre_ids: genres.map(g => g.toLowerCase()),
    published: true,
    premium: raw.premium !== false,
    created_at: raw.created_at || new Date().toISOString(),
    vj_id: vjName ? vjName.toLowerCase() : undefined,
    tmdb_id: raw.tmdb_id || undefined,
    vjs: vjName ? { id: vjName.toLowerCase(), name: vjName } : null,
    type: 'series',
    season_count: raw.no_of_seasons || seasons.length || 0,
    seasons,
  };
}

export function normalizeReelplexiEpisode(seriesId: string, seasonNumber: number, raw: any): any {
  if (!raw) return null;
  const episodeNumber = parseInt(raw.episode_number || 0, 10);
  // Support both dedicated endpoint format (poster_url/thumbnail_url) and embedded format (still_path)
  const posterUrl = asString(raw.poster_url) || asString(raw.thumbnail_url) || asString(raw.still_path) || '';
  const backdropUrl = asString(raw.backdrop_url) || posterUrl;
  const syntheticId = `${seriesId}:season:${seasonNumber}:episode:${episodeNumber}`;

  return {
    id: syntheticId,
    season_id: `${seriesId}:season:${seasonNumber}`,
    title: asString(raw.title) || asString(raw.name) || `Episode ${episodeNumber}`,
    episode_number: episodeNumber,
    description: asString(raw.description) || asString(raw.overview) || '',
    // Support both dedicated endpoint (stream_url/proxy_url) and embedded format (video_url)
    video_url: asString(raw.stream_url) || asString(raw.proxy_url) || asString(raw.video_url),
    embed_url: asString(raw.embed_url) || `https://embed.reelplexi.com/tv/${seriesId}/${seasonNumber}/${episodeNumber}?key=${REELPLEXI_API_KEY}`,
    published: true,
    premium: raw.premium !== false,
    duration: raw.duration_mins || raw.runtime || 45,
    thumbnail_url: posterUrl,
    cover_image_url: backdropUrl,
    created_at: raw.created_at || new Date().toISOString(),
  };
}

// API Methods
export async function getReelplexiMovies(page = 1, perPage = 50, genre?: string) {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (genre) params.genre = genre;
  const res = await fetchReelplexi('/v1/movies', params);
  return (res.data || []).map(normalizeReelplexiMovie);
}

export async function searchReelplexiMovies(query: string, page = 1, perPage = 100, vj?: string, genre?: string, year?: string) {
  const vjNorm = vj ? vj.toLowerCase() : undefined;

  // /v1/movies/search requires q with min_length=1.
  // When there is no search text, use the list endpoint which accepts vj as an optional filter.
  if (!query.trim()) {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (genre) params.genre = genre;
    if (year) params.year = year;
    if (vjNorm) params.vj = vjNorm;
    const res = await fetchReelplexi('/v1/movies', params);
    return (res.data || []).map(normalizeReelplexiMovie);
  }

  // When text is searched, fetch ALL matching results across the entire database
  const allResults: any[] = [];
  let currentPage = 1;
  const pageSize = 100;

  while (true) {
    const params: Record<string, string | number> = { page: currentPage, per_page: pageSize, q: query.trim() };
    if (vjNorm) params.vj = vjNorm;
    if (genre) params.genre = genre;
    if (year) params.year = year;

    const res = await fetchReelplexi('/v1/movies/search', params);
    const data = res.data || [];
    if (!Array.isArray(data) || data.length === 0) break;

    allResults.push(...data.map(normalizeReelplexiMovie));

    if (data.length < pageSize) break;
    currentPage++;
    if (currentPage > 50) break; // Safety cap against non-terminating APIs
  }

  return allResults;
}

export async function searchReelplexiAll(query: string, page = 1, perPage = 100, vj?: string, genre?: string) {
  const vjNorm = vj ? vj.toLowerCase() : undefined;

  // /v1/search requires q with min_length=1.
  // When there is no search text, fetch movies and series list endpoints separately.
  if (!query.trim()) {
    const [moviesRes, seriesRes] = await Promise.all([
      searchReelplexiMovies('', page, Math.ceil(perPage / 2), vjNorm, genre),
      searchReelplexiSeries('', page, Math.ceil(perPage / 2), vjNorm, genre),
    ]);
    return [
      ...moviesRes.map((m: any) => ({ ...m, type: 'movie' })),
      ...seriesRes.map((s: any) => ({ ...s, type: 'series' })),
    ];
  }

  // When text is searched, fetch ALL matching results across the entire database
  const allResults: any[] = [];
  let currentPage = 1;
  const pageSize = 100;

  while (true) {
    const params: Record<string, string | number> = { page: currentPage, per_page: pageSize, q: query.trim() };
    if (vjNorm) params.vj = vjNorm;
    if (genre) params.genre = genre;

    const res = await fetchReelplexi('/v1/search', params);
    const data = res.data || [];
    if (!Array.isArray(data) || data.length === 0) break;

    const normalized = data.map((item: any) => {
      if (item.type === 'movie' || item.type === undefined) {
        return { ...normalizeReelplexiMovie(item), type: 'movie' };
      } else {
        return { ...normalizeReelplexiSeries(item), type: 'series' };
      }
    });
    allResults.push(...normalized);

    if (data.length < pageSize) break;
    currentPage++;
    if (currentPage > 50) break; // Safety cap against non-terminating APIs
  }

  return allResults;
}



export async function getReelplexiVJs(page = 1, perPage = 100) {
  const params = { page, per_page: perPage };
  const res = await fetchReelplexi('/v1/vj', params);
  return res.data || [];
}

export async function getReelplexiMovieById(id: string) {
  try {
    const res = await fetchReelplexi(`/v1/movies/${id}`);
    return normalizeReelplexiMovie(res.data || res);
  } catch (e) {
    if (e instanceof ReelplexiError && e.status === 404) return null;
    throw e;
  }
}

export async function getReelplexiSeries(page = 1, perPage = 50, genre?: string) {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (genre) params.genre = genre;
  const res = await fetchReelplexi('/v1/series', params);
  return (res.data || []).map(normalizeReelplexiSeries);
}

export async function searchReelplexiSeries(query: string, page = 1, perPage = 100, vj?: string, genre?: string, year?: string) {
  const vjNorm = vj ? vj.toLowerCase() : undefined;

  // /v1/series/search requires q with min_length=1.
  // When there is no search text, use the list endpoint which accepts vj as an optional filter.
  if (!query.trim()) {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (genre) params.genre = genre;
    if (year) params.year = year;
    if (vjNorm) params.vj = vjNorm;
    const res = await fetchReelplexi('/v1/series', params);
    return (res.data || []).map(normalizeReelplexiSeries);
  }

  // When text is searched, fetch ALL matching results across the entire database
  const allResults: any[] = [];
  let currentPage = 1;
  const pageSize = 100;

  while (true) {
    const params: Record<string, string | number> = { page: currentPage, per_page: pageSize, q: query.trim() };
    if (vjNorm) params.vj = vjNorm;
    if (genre) params.genre = genre;
    if (year) params.year = year;

    const res = await fetchReelplexi('/v1/series/search', params);
    const data = res.data || [];
    if (!Array.isArray(data) || data.length === 0) break;

    allResults.push(...data.map(normalizeReelplexiSeries));

    if (data.length < pageSize) break;
    currentPage++;
    if (currentPage > 50) break; // Safety cap against non-terminating APIs
  }

  return allResults;
}

export async function getReelplexiSeriesById(id: string) {
  try {
    const res = await fetchReelplexi(`/v1/series/${id}`);
    return normalizeReelplexiSeries(res.data || res);
  } catch (e) {
    if (e instanceof ReelplexiError && e.status === 404) return null;
    throw e;
  }
}

export async function getReelplexiEpisodes(seriesId: string, season: number) {
  // Try the dedicated endpoint first
  try {
    const res = await fetchReelplexi(`/v1/series/${seriesId}/seasons/${season}/episodes`);
    const episodes = (res.data || []).map((ep: any) => normalizeReelplexiEpisode(seriesId, season, ep));
    if (episodes.length > 0) return episodes;
    // Empty result — fall through to embedded extraction below
  } catch (e) {
    if (!(e instanceof ReelplexiError && e.status === 404)) throw e;
    // 404 — fall through to embedded extraction below
  }

  // Fallback: the series endpoint already embeds seasons[].episodes[].
  // Extract from there instead of returning empty.
  try {
    const seriesRes = await fetchReelplexi(`/v1/series/${seriesId}`);
    const seriesRaw = seriesRes.data || seriesRes;
    const rawSeasons = Array.isArray(seriesRaw.seasons) ? seriesRaw.seasons : [];
    const target = rawSeasons.find((s: any) => (s.season_number || 1) === season);
    if (target && Array.isArray(target.episodes) && target.episodes.length > 0) {
      return target.episodes.map((ep: any) => normalizeReelplexiEpisode(seriesId, season, ep));
    }
  } catch {
    // Ignore — return empty below
  }
  return [];
}

export async function getReelplexiGenres() {
  const res = await fetchReelplexi('/v1/genres');
  if (!Array.isArray(res.data)) return [];
  return res.data.map((g: any) => {
    const name = asString(g) || '';
    return { id: name.toLowerCase(), name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() };
  });
}

export async function getReelplexiTrendingAll(page = 1, perPage = 20) {
  const res = await fetchReelplexi('/v1/trending/all', { page, per_page: perPage });
  return (res.data || []).map((item: any) => {
    if (item.type === 'series' || item.first_air_date != null) {
      return normalizeReelplexiSeries(item);
    }
    return normalizeReelplexiMovie(item);
  });
}

export async function getReelplexiTrendingMovies(page = 1, perPage = 20) {
  const res = await fetchReelplexi('/v1/trending/movies', { page, per_page: perPage });
  return (res.data || []).map(normalizeReelplexiMovie);
}

export async function getReelplexiTrendingSeries(page = 1, perPage = 20) {
  const res = await fetchReelplexi('/v1/trending/series', { page, per_page: perPage });
  return (res.data || []).map(normalizeReelplexiSeries);
}

export async function getReelplexiMoviesByGenre(genre: string, page = 1, perPage = 20) {
  const res = await fetchReelplexi(`/v1/genres/${genre.toLowerCase()}/movies`, { page, per_page: perPage });
  return (res.data || []).map(normalizeReelplexiMovie);
}

export async function getReelplexiSeriesByGenre(genre: string, page = 1, perPage = 20) {
  const res = await fetchReelplexi(`/v1/genres/${genre.toLowerCase()}/series`, { page, per_page: perPage });
  return (res.data || []).map(normalizeReelplexiSeries);
}

export async function getReelplexiRelatedMoviesByGenre(id: string, page = 1, perPage = 20) {
  try {
    const res = await fetchReelplexi(`/v1/movies/${id}/related/genre`, { page, per_page: perPage });
    return (res.data || []).map(normalizeReelplexiMovie);
  } catch {
    return [];
  }
}

export async function getReelplexiRelatedSeriesByGenre(id: string, page = 1, perPage = 20) {
  try {
    const res = await fetchReelplexi(`/v1/series/${id}/related/genre`, { page, per_page: perPage });
    return (res.data || []).map(normalizeReelplexiSeries);
  } catch {
    return [];
  }
}

export async function getReelplexiMovieTrailers(id: string) {
  try {
    const res = await fetchReelplexi(`/v1/movies/${id}/trailers`);
    let trailers = res.trailers;
    if (trailers && !Array.isArray(trailers) && Array.isArray(trailers.trailers)) {
      trailers = trailers.trailers;
    }
    return Array.isArray(trailers) ? trailers : [];
  } catch {
    return [];
  }
}

export async function getReelplexiSeriesTrailers(id: string) {
  try {
    const res = await fetchReelplexi(`/v1/series/${id}/trailers`);
    let trailers = res.trailers;
    if (trailers && !Array.isArray(trailers) && Array.isArray(trailers.trailers)) {
      trailers = trailers.trailers;
    }
    return Array.isArray(trailers) ? trailers : [];
  } catch {
    return [];
  }
}

export async function getReelplexiMovieStream(id: string) {
  try {
    const res = await fetchReelplexi(`/v1/movies/${id}/stream`);
    const streamData = res.data || res;
    const url = streamData.stream_url || streamData.video_url || streamData.proxy_url || streamData.url;
    return {
      stream_url: url,
      proxy_url: streamData.proxy_url || url,
      video_url: url,
    };
  } catch {
    return null;
  }
}

export async function getReelplexiEpisodeStream(seriesId: string, season: number, episode: number) {
  try {
    const res = await fetchReelplexi(`/v1/series/${seriesId}/seasons/${season}/episodes/${episode}/stream`);
    const streamData = res.data || res;
    const url = streamData.stream_url || streamData.video_url || streamData.proxy_url || streamData.url;
    return {
      stream_url: url,
      proxy_url: streamData.proxy_url || url,
      video_url: url,
    };
  } catch {
    return null;
  }
}

export async function getReelplexiMovieDownloadUrl(id: string) {
  try {
    const res = await fetchReelplexi(`/v1/download/movie/${id}`);
    return res.download_url as string;
  } catch (e: any) {
    console.error('Error fetching movie download URL:', e);
    throw e;
  }
}

export async function getReelplexiEpisodeDownloadUrl(seriesId: string, season: number, episode: number) {
  try {
    const res = await fetchReelplexi(`/v1/download/tv/${seriesId}/${season}/${episode}`);
    return res.download_url as string;
  } catch (e: any) {
    console.error('Error fetching episode download URL:', e);
    throw e;
  }
}

export async function getReelplexiAppNotifications() {
  try {
    const res = await fetchReelplexi('/v1/account/app-notifications');
    return res.notifications || [];
  } catch (e) {
    console.error('Error fetching app notifications:', e);
    return [];
  }
}

// English Movies API
export async function getReelplexiEnglishMovies(type: 'popular' | 'trending' | 'top-rated' | 'now-playing' | 'upcoming' = 'popular', page = 1, perPage = 20) {
  try {
    const res = await fetchReelplexi(`/v1/english-movies/${type}`, { page, per_page: perPage });
    return (res.data || []).map((movie: any) => ({
      id: asString(movie.id) || asString(movie.tmdb_id) || '',
      tmdb_id: movie.tmdb_id || movie.id,
      title: asString(movie.title) || 'Untitled',
      description: asString(movie.overview) || asString(movie.description) || '',
      poster_url: asString(movie.poster_url) || '',
      thumbnail_url: asString(movie.poster_url) || '',
      cover_image_url: asString(movie.backdrop_url) || asString(movie.poster_url) || '',
      release_date: asString(movie.release_date) || new Date().toISOString(),
      genres: normalizeGenres(movie.genres),
      genre_ids: normalizeGenres(movie.genres).map(g => g.toLowerCase()),
      // Use proper embed URL format from documentation
      embed_url: movie.tmdb_id ? `https://vidsrc.xyz/embed/movie/${movie.tmdb_id}` : '',
      type: 'english-movie'
    }));
  } catch (e) {
    console.error('Error fetching English movies:', e);
    return [];
  }
}

export async function searchReelplexiEnglishMovies(query: string, page = 1, perPage = 100) {
  try {
    if (!query.trim()) {
      return await getReelplexiEnglishMovies('popular', page, perPage);
    }

    // Fetch all pages for comprehensive search results
    const allResults: any[] = [];
    let currentPage = 1;
    const pageSize = 100;

    while (true) {
      const params: Record<string, string | number> = { 
        page: currentPage, 
        per_page: pageSize, 
        q: query.trim() 
      };

      const res = await fetchReelplexi('/v1/english-movies/search', params);
      const data = res.data || [];
      if (!Array.isArray(data) || data.length === 0) break;

      const normalized = data.map((movie: any) => ({
        id: asString(movie.id) || asString(movie.tmdb_id) || '',
        tmdb_id: movie.tmdb_id || movie.id,
        title: asString(movie.title) || 'Untitled',
        description: asString(movie.overview) || asString(movie.description) || '',
        poster_url: asString(movie.poster_url) || '',
        thumbnail_url: asString(movie.poster_url) || '',
        cover_image_url: asString(movie.backdrop_url) || asString(movie.poster_url) || '',
        release_date: asString(movie.release_date) || new Date().toISOString(),
        genres: normalizeGenres(movie.genres),
        genre_ids: normalizeGenres(movie.genres).map(g => g.toLowerCase()),
        embed_url: movie.tmdb_id ? `https://vidsrc.xyz/embed/movie/${movie.tmdb_id}` : '',
        type: 'english-movie'
      }));
      
      allResults.push(...normalized);

      if (data.length < pageSize) break;
      currentPage++;
      if (currentPage > 50) break;
    }

    return allResults;
  } catch (e) {
    console.error('Error searching English movies:', e);
    return [];
  }
}

export async function getReelplexiEnglishMovieDownloads(tmdbId: string) {
  try {
    const res = await fetchReelplexi(`/v1/english-movies/${tmdbId}/downloads`);
    return {
      title: asString(res.title) || '',
      downloads: (res.links || []).map((dl: any) => ({
        resolution: parseInt(dl.quality?.replace('p', '') || '720', 10),
        name: `${res.title || 'movie'}_${dl.quality || '720p'}.mp4`,
        size_bytes: 0,
        size_readable: asString(dl.size) || '',
        proxy_url: asString(dl.url) || ''
      })),
      subtitles: []
    };
  } catch (e) {
    console.error(`Error fetching downloads for English movie ${tmdbId}:`, e);
    return { title: '', downloads: [], subtitles: [] };
  }
}

// Sports & Live TV API
export async function getReelplexiSportsChannels(page = 1, perPage = 50, category?: string) {
  try {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (category && category !== 'all') params.category = category;
    
    const res = await fetchReelplexi('/v1/sports/channels', params);
    return {
      total: res.total || 0,
      page: res.page || 1,
      per_page: res.per_page || perPage,
      categories: res.categories || [],
      data: (res.data || []).map((channel: any) => ({
        id: asString(channel.id) || '',
        name: asString(channel.name) || '',
        category: asString(channel.category) || '',
        channel_type: asString(channel.channel_type) || '',
        embed_url: asString(channel.embed_url) || '',
        logo: asString(channel.logo) || '',
        is_live: channel.is_live !== false
      }))
    };
  } catch (e) {
    console.error('Error fetching sports channels:', e);
    return { total: 0, page: 1, per_page: perPage, categories: [], data: [] };
  }
}

export async function searchReelplexiSportsChannels(query: string) {
  try {
    if (!query.trim()) {
      const result = await getReelplexiSportsChannels(1, 50);
      return result.data;
    }

    const res = await fetchReelplexi('/v1/sports/search', { q: query.trim() });
    return (res.data || []).map((channel: any) => ({
      id: asString(channel.id) || '',
      name: asString(channel.name) || '',
      category: asString(channel.category) || '',
      channel_type: asString(channel.channel_type) || '',
      embed_url: `https://api.reelplexi.com/v1/sports/embed/${channel.id}`,
      logo: asString(channel.logo) || '',
      is_live: channel.is_live !== false
    }));
  } catch (e) {
    console.error('Error searching sports channels:', e);
    return [];
  }
}

export async function getReelplexiLiveEvents() {
  try {
    const res = await fetchReelplexi('/v1/sports/events/live');
    return (res.data || res.events || []).map((event: any) => ({
      id: asString(event.id) || '',
      title: asString(event.title) || asString(event.name) || '',
      sport: asString(event.sport) || '',
      league: asString(event.league) || '',
      home_team: asString(event.home_team) || '',
      away_team: asString(event.away_team) || '',
      start_time: asString(event.start_time) || '',
      status: asString(event.status) || 'live',
      embed_url: asString(event.embed_url) || asString(event.stream_url) || ''
    }));
  } catch (e) {
    console.error('Error fetching live events:', e);
    return [];
  }
}

// Regions API
export async function getReelplexiRegions() {
  try {
    const res = await fetchReelplexi('/v1/regions');
    return (res.data || []).map((region: any) => ({
      slug: asString(region.slug) || '',
      name: asString(region.name) || '',
      description: asString(region.description) || '',
      countries: region.countries || [],
      content_count: {
        movies: region.content_count?.movies || 0,
        series: region.content_count?.series || 0,
        total: region.content_count?.total || 0
      }
    }));
  } catch (e) {
    console.error('Error fetching regions:', e);
    return [];
  }
}

export async function getReelplexiRegionContent(regionSlug: string, page = 1, perPage = 20, genre?: string, year?: string) {
  try {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (genre) params.genre = genre;
    if (year) params.year = year;
    
    const res = await fetchReelplexi(`/v1/regions/${regionSlug}`, params);
    return {
      region: res.region || { slug: regionSlug, name: regionSlug },
      data: (res.data || []).map((item: any) => {
        const contentType = asString(item.content_type) || 'movie';
        if (contentType === 'series') {
          return normalizeReelplexiSeries(item);
        } else {
          return normalizeReelplexiMovie(item);
        }
      }),
      pagination: res.pagination || { page, per_page: perPage, total: 0, total_pages: 0 }
    };
  } catch (e) {
    console.error(`Error fetching region content for ${regionSlug}:`, e);
    return { region: { slug: regionSlug, name: regionSlug }, data: [], pagination: { page, per_page: perPage, total: 0, total_pages: 0 } };
  }
}

export async function getReelplexiRegionMovies(regionSlug: string, page = 1, perPage = 20, genre?: string, year?: string) {
  try {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (genre) params.genre = genre;
    if (year) params.year = year;
    
    const res = await fetchReelplexi(`/v1/regions/${regionSlug}/movies`, params);
    return (res.data || []).map(normalizeReelplexiMovie);
  } catch (e) {
    console.error(`Error fetching region movies for ${regionSlug}:`, e);
    return [];
  }
}

export async function getReelplexiRegionSeries(regionSlug: string, page = 1, perPage = 20, genre?: string, year?: string) {
  try {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (genre) params.genre = genre;
    if (year) params.year = year;
    
    const res = await fetchReelplexi(`/v1/regions/${regionSlug}/series`, params);
    return (res.data || []).map(normalizeReelplexiSeries);
  } catch (e) {
    console.error(`Error fetching region series for ${regionSlug}:`, e);
    return [];
  }
}
