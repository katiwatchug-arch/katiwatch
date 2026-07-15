import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminRequest } from '@/lib/apiAuth'

// GET /api/stats - Fetch movie/series counts and top viewed content (bypasses RLS)
export async function GET(request: NextRequest) {
  // SECURITY: Verify the caller is an authenticated admin
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) return auth.response;

  try {
    const [moviesRes, seriesRes, topMoviesRes, topSeriesRes] = await Promise.all([
      supabaseAdmin.from('movies').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('series').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('movies').select('title, views').order('views', { ascending: false }).limit(10),
      supabaseAdmin.from('series').select('title, views').order('views', { ascending: false }).limit(10),
    ]);

    if (moviesRes.error || seriesRes.error || topMoviesRes.error || topSeriesRes.error) {
      console.error('Error fetching stats:', {
        moviesError: moviesRes.error,
        seriesError: seriesRes.error,
        topMoviesError: topMoviesRes.error,
        topSeriesError: topSeriesRes.error,
      });
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    return NextResponse.json({
      movieCount: moviesRes.count || 0,
      seriesCount: seriesRes.count || 0,
      topMovies: topMoviesRes.data || [],
      topSeries: topSeriesRes.data || [],
    })
  } catch (err) {
    console.error('Unexpected error fetching stats:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}