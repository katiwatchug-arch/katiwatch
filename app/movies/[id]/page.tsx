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

  return {
    title: movie.title,
    description: movie.description || "Watch now on KatiWatch",

    openGraph: {
      title: movie.title,
      description: movie.description || "Watch now on KatiWatch",
      url: `https://www.katiwatch.com/movies/${id}`,
      type: "video.movie",
      images: [
        {
          url: image,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: movie.title,
      description: movie.description || "Watch now on KatiWatch",
      images: [image],
    },
  };
}

export default async function Page() {
  return <MovieDetailsClient />;
}