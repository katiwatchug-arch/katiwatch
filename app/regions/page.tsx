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

const regionThemes: Record<string, { from: string; to: string; accent: string }> = {
  'kdrama': { from: '#1e3a8a', to: '#3b82f6', accent: '#60a5fa' }, // Korean blue
  'chinese-drama': { from: '#7f1d1d', to: '#dc2626', accent: '#ef4444' }, // Chinese red
  'western': { from: '#1e40af', to: '#3b82f6', accent: '#60a5fa' }, // American blue
  'bollywood': { from: '#ea580c', to: '#f97316', accent: '#fb923c' }, // Indian orange/saffron
  'nollywood': { from: '#065f46', to: '#059669', accent: '#10b981' }, // Nigerian green
  'east-african': { from: '#0f766e', to: '#14b8a6', accent: '#2dd4bf' }, // East African teal
  'anime': { from: '#be123c', to: '#e11d48', accent: '#f43f5e' }, // Japanese red
  'latin': { from: '#b91c1c', to: '#dc2626', accent: '#ef4444' }, // Latin red
  'turkish': { from: '#991b1b', to: '#dc2626', accent: '#ef4444' }, // Turkish red
  'filipino': { from: '#1e40af', to: '#3b82f6', accent: '#60a5fa' }, // Filipino blue
  'thai': { from: '#1e3a8a', to: '#3b82f6', accent: '#60a5fa' }, // Thai blue
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
            {regions.map((region) => {
              const theme = regionThemes[region.slug] || { from: '#1f2937', to: '#374151', accent: '#4b5563' };
              return (
                <Link
                  key={region.slug}
                  href={`/regions/${region.slug}`}
                  className="group relative rounded-xl overflow-hidden border border-gray-800 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`
                  }}
                >
                  <div className="p-6 relative z-10">
                    {/* Icon */}
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {regionIcons[region.slug] || '🌍'}
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                      {region.name}
                    </h2>
                    
                    {/* Description */}
                    <p className="text-gray-200/80 text-sm mb-4 line-clamp-2">
                      {region.description}
                    </p>

                    {/* Countries */}
                    <div className="flex flex-wrap gap-2">
                      {region.countries.slice(0, 4).map((country, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white border border-white/30"
                        >
                          {country}
                        </span>
                      ))}
                      {region.countries.length > 4 && (
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white border border-white/30">
                          +{region.countries.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div 
                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    style={{ backgroundColor: `${theme.accent}40` }}
                  >
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Bottom shine effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
                </Link>
              );
            })}
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
