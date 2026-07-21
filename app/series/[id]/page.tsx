import { Metadata } from "next";
import SeriesDetailsPage from "./SeriesDetailsPage";
import { getSeriesById } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const series = await getSeriesById(id);

  if (!series) {
    return {
      title: "Series Not Found | Katiwatch",
      description: "The requested series could not be found.",
    };
  }

  const image =
    series.cover_image_url ||
    series.thumbnail_url ||
    "https://www.katiwatch.com/logo.jpeg";

  return {
    title: `${series.title} | Katiwatch`,
    description:
      series.description || "Watch this series on Katiwatch.",

    openGraph: {
      title: series.title,
      description:
        series.description || "Watch this series on Katiwatch.",
      url: `https://www.katiwatch.com/series/${id}`,
      siteName: "Katiwatch",
      locale: "en_UG",
      type: "video.tv_show",
      images: [
        {
          url: image,
          width: 1280,
          height: 720,
          alt: series.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: series.title,
      description:
        series.description || "Watch this series on Katiwatch.",
      images: [image],
    },
  };
}

export default function Page() {
  return <SeriesDetailsPage />;
}