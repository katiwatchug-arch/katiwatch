import { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieDetailsClient from "./MovieDetailsClient";
import { getMovieById } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const movie = await getMovieById(id);

  if (!movie) {
    return {
      title: "Movie Not Found",
    };
  }

  const image =
    movie.cover_image_url ||
    movie.thumbnail_url ||
    "/logo.png";
  
  const vjName = (movie as any).vjs?.name || 'VJ';
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const genres = (movie as any).genres?.join(', ') || 'Action, Drama';
  
  const optimizedTitle = `${movie.title} - ${vjName} Translated Movie in Luganda ${year} | Watch Free on Katiwatch`;
  const optimizedDescription = movie.description 
    ? `${movie.description.slice(0, 150)}... Watch ${movie.title} translated to Luganda by ${vjName} online free. Stream VJ translated movies on Katiwatch Uganda.`
    : `Watch ${movie.title} (${year}) translated to Luganda by ${vjName}. Stream this ${genres} movie dubbed in Luganda online free. New VJ translated movies daily on Katiwatch Uganda.`;

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: `${movie.title} luganda, ${movie.title} ${vjName}, ${vjName} translated movies, ${movie.title} VJ movie, watch ${movie.title} luganda, ${movie.title} translated Uganda, VJ movies ${year}, ${genres} movies luganda, katiwatch ${movie.title}, free VJ movies, ${movie.title} download`,
    
    alternates: {
      canonical: `https://katiwatch.com/movies/${id}`,
    },

    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url: `https://katiwatch.com/movies/${id}`,
      type: "video.movie",
      siteName: 'Katiwatch - VJ Movies Uganda',
      locale: 'en_UG',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${movie.title} - ${vjName} Translated Movie in Luganda`,
        },
      ],
      videos: [
        {
          url: `https://katiwatch.com/movies/${id}`,
          secureUrl: `https://katiwatch.com/movies/${id}`,
          type: 'text/html',
          width: 1280,
          height: 720,
        }
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: optimizedTitle,
      description: optimizedDescription,
      images: [image],
      site: '@katiwatch',
      creator: '@katiwatch',
    },
  };
}

export default async function Page() {
  return <MovieDetailsClient />;
}