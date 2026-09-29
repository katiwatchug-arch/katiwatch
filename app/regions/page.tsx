"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, ChevronRight } from "lucide-react";
import { getRegions } from "@/lib/api";

type Region = {
  slug: string;
  name: string;
  description: string;
  countries: string[];
  content_count: {
    movies: number;
    series: number;
    total: number;
  };
};

const regionIcons: Record<string, string> = {
  'kdrama': '🇰🇷',
  'chinese-drama': '🇨🇳',
  'western': '🇺🇸',
  'bollywood': '🇮🇳',
  'nollywood': '🇳🇬',
  'east-african': '🇺🇬',
  'anime': '🇯🇵',
  'latin': '🇲🇽',
  'turkish': '🇹🇷',
  'filipino': '🇵🇭',
  'thai': '🇹🇭'
};

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegions().then(data => {
      setRegions(data);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching regions:', error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] pt-8 pb-6 px-4 border-b border-gray-800/50 pt-safe">
        <div className="container mx-auto sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-[#E50914]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Browse by Region</h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm ml-8 sm:ml-9">
            Explore movies and series from around the world
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-gray-800/40 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && regions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-[#E50914] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#E50914]/20"
              >
                <div className="p-6">
                  {/* Icon */}
                  <div className="text-6xl mb-4">{regionIcons[region.slug] || '🌍'}</div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#E50914] transition-colors">
                    {region.name}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {region.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-semibold text-white">{region.content_count.movies}</span> Movies
                    </div>
                    <div>
                      <span className="font-semibold text-white">{region.content_count.series}</span> Series
                    </div>
                  </div>

                  {/* Countries */}
                  <div className="flex flex-wrap gap-2">
                    {region.countries.slice(0, 4).map((country, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700"
                      >
                        {country}
                      </span>
                    ))}
                    {region.countries.length > 4 && (
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                        +{region.countries.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 group-hover:bg-[#E50914] flex items-center justify-center transition-all">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>

                {/* Bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}

        {!loading && regions.length === 0 && (
          <div className="text-center py-24">
            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No regions available</h3>
            <p className="text-gray-500">Check back later for regional content</p>
          </div>
        )}
      </div>
    </div>
  );
}
