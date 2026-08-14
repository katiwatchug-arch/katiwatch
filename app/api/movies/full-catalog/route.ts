import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/api';

const getFullCatalog = unstable_cache(
  async () => {
    const API_MAX = 100;
    const seenIds = new Set<string>();
    const allMovies: any[] = [];
    let apiPage = 1;
    while (true) {
      const batch = await searchMovies('', API_MAX, apiPage);
      for (const m of batch) {
        if (!seenIds.has(String(m.id))) { seenIds.add(String(m.id)); allMovies.push(m); }
      }
      if (batch.length < API_MAX) break;
      apiPage++;
    }
    return allMovies;
  },
  ['movies-full-catalog'],
  { revalidate: 300 }
);

export async function GET() {
  const movies = await getFullCatalog();
  return NextResponse.json(movies);
}
