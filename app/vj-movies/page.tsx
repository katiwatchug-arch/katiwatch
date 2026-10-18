import { Metadata } from 'next';
import Link from 'next/link';
import { Film, Play, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { redirect } from 'next/navigation';

// This page is for SEO only - redirect users to movies
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  title: 'VJ Translated Movies in Luganda | Watch VJ Junior, VJ Jjingo Movies Free Online Uganda',
  description: 'Stream FREE VJ translated movies in Luganda. Watch VJ Junior movies, VJ Jjingo movies, ICE P translated movies and series online. Uganda\'s #1 platform for movies translated to Luganda by top VJs. New VJ movies added daily.',
  keywords: 'VJ translated movies luganda, VJ movies Uganda, movies in luganda, free VJ movies, VJ Junior movies, VJ Jjingo movies, ICE P movies, VJ Emmy movies, VJ Kevo movies, translated movies Uganda, luganda movies online, watch VJ movies free, VJ movies download',
  alternates: {
    canonical: 'https://katiwatch.com/vj-movies',
  },
  openGraph: {
    title: 'VJ Translated Movies in Luganda | Katiwatch Uganda',
    description: 'Watch FREE VJ translated movies by VJ Junior, VJ Jjingo, ICE P and more. Stream Luganda dubbed movies online.',
    url: 'https://katiwatch.com/vj-movies',
    type: 'website',
    images: [{ url: '/logo.jpeg', width: 1200, height: 630 }],
  },
};

export default function VJMoviesPage({ searchParams }: { searchParams: { preview?: string } }) {
  // Redirect regular users to /movies, but allow Google to crawl
  if (typeof window !== 'undefined' && !searchParams?.preview) {
    redirect('/movies');
  }
  const popularVJs = [
    {
      name: 'VJ Junior',
      description: 'One of Uganda\'s most popular VJ translators known for high-quality movie translations',
      specialty: 'Action, Thriller, Drama',
      link: '/movies?vj=junior'
    },
    {
      name: 'VJ Jjingo',
      description: 'Expert VJ translator bringing Hollywood blockbusters to Luganda audiences',
      specialty: 'Action, Sci-Fi, Adventure',
      link: '/movies?vj=jjingo'
    },
    {
      name: 'ICE P',
      description: 'Premium VJ translator specializing in comedy and romantic movies',
      specialty: 'Comedy, Romance, Drama',
      link: '/movies?vj=icep'
    },
    {
      name: 'VJ Emmy',
      description: 'Popular translator for series and long-form content in Luganda',
      specialty: 'Series, Drama, Reality TV',
      link: '/series?vj=emmy'
    },
    {
      name: 'VJ Kevo',
      description: 'Rising star in VJ translations with focus on latest releases',
      specialty: 'Latest Movies, Trending Content',
      link: '/movies?vj=kevo'
    },
  ];

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: '100% Free Streaming',
      description: 'Watch unlimited VJ translated movies without any subscription fees'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Daily Updates',
      description: 'New VJ translated movies and series added every single day'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'HD Quality',
      description: 'High-quality VJ translations with clear audio and video'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'All Popular VJs',
      description: 'Access content from all top Ugandan VJ translators in one place'
    },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-12 bg-gradient-to-b from-[#E50914]/20 to-transparent">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
            VJ Translated Movies in Luganda
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Watch FREE VJ Junior, VJ Jjingo, ICE P translated movies online. Uganda&apos;s numer 1 platform for movies in Luganda.
          </p>
          <Link
            href="/movies"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#E50914] hover:bg-[#b80710] rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
          >
            <Play className="w-6 h-6 fill-current" />
            Start Watching VJ Movies
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 px-4 md:px-12 max-w-6xl mx-auto">
        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">What Are VJ Translated Movies?</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            VJ translated movies are Hollywood, Bollywood, and international films dubbed into Luganda by talented Ugandan voice-over artists known as VJs (Video Jockeys). These VJ translators have become household names in Uganda, bringing the best of world cinema to local audiences in their native language.
          </p>

          <p className="text-gray-300 mb-6 leading-relaxed">
            Katiwatch is Uganda&apos;s premier streaming platform for VJ translated movies, offering thousands of movies and series translated to Luganda by top VJs including VJ Junior, VJ Jjingo, ICE P, VJ Emmy, and VJ Kevo. All content is available to stream online for free.
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-8 mt-12 text-white">Popular VJ Translators on Katiwatch</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {popularVJs.map((vj) => (
            <Link
              key={vj.name}
              href={vj.link}
              className="bg-[#1a1a2e]/60 backdrop-blur-sm p-6 rounded-lg hover:bg-[#1a1a2e] transition-all duration-300 border border-gray-800 hover:border-[#E50914] group"
            >
              <h3 className="text-2xl font-bold mb-3 text-[#E50914] group-hover:text-white transition-colors">
                {vj.name}
              </h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                {vj.description}
              </p>
              <div className="text-xs text-gray-400">
                <span className="font-semibold">Specialty:</span> {vj.specialty}
              </div>
            </Link>
          ))}
        </div>

        <div className="prose prose-invert prose-lg max-w-none mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Why Watch VJ Movies on Katiwatch?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-gradient-to-br from-[#E50914]/10 to-transparent p-6 rounded-lg border border-[#E50914]/20"
            >
              <div className="text-[#E50914] mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {benefit.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Categories of VJ Translated Content</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 not-prose">
            <div className="bg-[#1a1a2e]/40 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#E50914]">Hollywood Movies in Luganda</h3>
              <p className="text-gray-300 text-sm">
                Watch the biggest Hollywood blockbusters translated to Luganda. Action movies, thriller movies, romance, drama, and more - all dubbed by top VJs.
              </p>
            </div>

            <div className="bg-[#1a1a2e]/40 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#E50914]">Bollywood Movies in Luganda</h3>
              <p className="text-gray-300 text-sm">
                Stream Indian movies translated to Luganda. Enjoy Bollywood drama, romance, and action films with VJ translations.
              </p>
            </div>

            <div className="bg-[#1a1a2e]/40 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#E50914]">Korean Drama in Luganda</h3>
              <p className="text-gray-300 text-sm">
                Watch popular K-dramas and Korean movies translated to Luganda by expert VJ translators. New episodes added regularly.
              </p>
            </div>

            <div className="bg-[#1a1a2e]/40 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#E50914]">VJ Translated Series</h3>
              <p className="text-gray-300 text-sm">
                Stream TV shows and series dubbed in Luganda. Binge-watch complete seasons of your favorite shows translated by VJs.
              </p>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">How to Watch VJ Movies on Katiwatch</h2>

          <ol className="text-gray-300 space-y-4 mb-12">
            <li className="leading-relaxed">
              <strong className="text-white">Browse our catalog:</strong> Explore thousands of VJ translated movies and series organized by VJ translator, genre, and release year.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Select your movie:</strong> Choose from VJ Junior movies, VJ Jjingo movies, ICE P translations, and more.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Stream instantly:</strong> Watch in HD quality with smooth streaming. No registration required for basic content.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Download for offline:</strong> Premium members can download VJ movies to watch offline on mobile devices.
            </li>
          </ol>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Latest VJ Movies 2026</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Stay updated with the latest Hollywood releases translated to Luganda. Katiwatch adds new VJ translated movies daily, including the newest 2026 releases. Watch the latest action movies, drama series, comedy films, and thriller movies all dubbed in Luganda by your favorite VJs.
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Free VJ Movies Streaming in Uganda</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Katiwatch offers 100% free VJ movie streaming for all Ugandans. Watch unlimited VJ translated movies without subscription fees. Our platform is optimized for mobile devices, making it easy to watch VJ movies on your phone anywhere in Uganda.
          </p>

          <p className="text-gray-300 mb-8 leading-relaxed">
            Join millions of Ugandans enjoying free VJ translated movies on Katiwatch. From VJ Junior&apos;s action-packed translations to VJ Jjingo&apos;s blockbuster dubs, we bring you the best of world cinema in Luganda.
          </p>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/movies"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#E50914] to-[#b80710] hover:from-[#b80710] hover:to-[#E50914] rounded-full font-bold text-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-[#E50914]/30"
          >
            <Film className="w-6 h-6" />
            Browse All VJ Translated Movies
          </Link>
        </div>
      </section>
    </div>
  );
}
