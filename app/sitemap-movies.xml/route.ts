import { NextResponse } from 'next/server';
import { getMovies } from '@/lib/api';

export async function GET() {
  try {
    const movies = await getMovies(500); // Get more movies for comprehensive sitemap
    const baseUrl = 'https://katiwatch.com';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${movies
  .map((movie) => {
    const movieUrl = `${baseUrl}/movies/${movie.id}`;
    const imageUrl = movie.cover_image_url || movie.thumbnail_url || '';
    const vjName = (movie as any).vjs?.name || 'VJ';
    
    return `  <url>
    <loc>${movieUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${imageUrl ? `<image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${movie.title} - ${vjName} Translated Movie in Luganda</image:title>
      <image:caption>Watch ${movie.title} translated to Luganda by ${vjName} on Katiwatch</image:caption>
    </image:image>` : ''}
    <video:video>
      <video:thumbnail_loc>${imageUrl || `${baseUrl}/logo.jpeg`}</video:thumbnail_loc>
      <video:title>${movie.title} - ${vjName} Translated Movie in Luganda</video:title>
      <video:description>${movie.description || `Watch ${movie.title} translated to Luganda by ${vjName}. Stream VJ translated movies online free on Katiwatch Uganda.`}</video:description>
      <video:content_loc>${movieUrl}</video:content_loc>
      <video:publication_date>${movie.created_at || new Date().toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating movies sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
