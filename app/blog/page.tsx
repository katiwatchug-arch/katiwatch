import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight, TrendingUp } from 'lucide-react';
import { redirect } from 'next/navigation';

// SEO-only page
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  title: 'VJ Movies Blog - Latest News, Tips & Updates | Katiwatch Uganda',
  description: 'Read the latest news about VJ translated movies in Luganda. Get updates on VJ Junior movies, VJ Jjingo releases, ICE P translations, and tips for watching movies in Luganda online.',
  keywords: 'VJ movies blog, VJ Junior news, VJ Jjingo updates, translated movies Uganda, Luganda movies blog, VJ movies tips, katiwatch blog, Uganda entertainment news',
  alternates: {
    canonical: 'https://katiwatch.com/blog',
  },
  openGraph: {
    title: 'VJ Movies Blog - Latest News & Updates | Katiwatch',
    description: 'Latest news about VJ translated movies in Luganda. Updates on VJ Junior, VJ Jjingo, ICE P and more.',
    url: 'https://katiwatch.com/blog',
    type: 'website',
  },
};

export default function BlogPage({ searchParams }: { searchParams: { preview?: string } }) {
  // Redirect regular users
  if (typeof window !== 'undefined' && !searchParams?.preview) {
    redirect('/');
  }
  const articles = [
    {
      id: 1,
      title: 'Top 10 VJ Junior Movies You Must Watch in 2026',
      excerpt: 'Discover the best VJ Junior translated movies available on Katiwatch. From action-packed thrillers to emotional dramas, VJ Junior brings Hollywood to life in Luganda.',
      category: 'VJ Junior',
      date: 'January 15, 2026',
      image: '/logo.jpeg',
      slug: 'top-vj-junior-movies-2026'
    },
    {
      id: 2,
      title: 'Complete Guide to Watching VJ Translated Movies Online',
      excerpt: 'Learn how to stream VJ movies in Luganda on Katiwatch. Everything you need to know about watching VJ Junior, VJ Jjingo, and ICE P movies online for free.',
      category: 'Guides',
      date: 'January 12, 2026',
      image: '/logo.jpeg',
      slug: 'guide-watching-vj-movies-online'
    },
    {
      id: 3,
      title: 'VJ Jjingo vs VJ Junior: Comparing Uganda\'s Top VJ Translators',
      excerpt: 'An in-depth comparison of VJ Jjingo and VJ Junior\'s translation styles. Which VJ translator is right for you? Read our comprehensive analysis.',
      category: 'Comparisons',
      date: 'January 10, 2026',
      image: '/logo.jpeg',
      slug: 'vj-jjingo-vs-vj-junior-comparison'
    },
    {
      id: 4,
      title: 'Latest Hollywood Movies Translated to Luganda in 2026',
      excerpt: 'Stay updated with the newest Hollywood blockbusters translated to Luganda by top VJs. See which movies VJ Junior, VJ Jjingo, and ICE P are translating this month.',
      category: 'New Releases',
      date: 'January 8, 2026',
      image: '/logo.jpeg',
      slug: 'latest-hollywood-movies-luganda-2026'
    },
    {
      id: 5,
      title: 'How VJ Translators Bring Hollywood Magic to Uganda',
      excerpt: 'Behind the scenes look at how VJ translators like VJ Junior and VJ Jjingo transform Hollywood movies into Luganda entertainment. The art of VJ translation explained.',
      category: 'Behind the Scenes',
      date: 'January 5, 2026',
      image: '/logo.jpeg',
      slug: 'how-vj-translators-work'
    },
    {
      id: 6,
      title: 'Best VJ Translated Bollywood Movies in Luganda',
      excerpt: 'Explore the top Bollywood movies translated to Luganda on Katiwatch. From romantic dramas to action thrillers, discover Indian cinema dubbed by Ugandan VJs.',
      category: 'Bollywood',
      date: 'January 3, 2026',
      image: '/logo.jpeg',
      slug: 'best-bollywood-movies-luganda'
    },
    {
      id: 7,
      title: 'ICE P Movies: Comedy King of VJ Translations',
      excerpt: 'Why ICE P is Uganda\'s favorite VJ for comedy movies. Explore ICE P\'s funniest movie translations and what makes his style unique.',
      category: 'ICE P',
      date: 'December 30, 2025',
      image: '/logo.jpeg',
      slug: 'ice-p-comedy-vj-translator'
    },
    {
      id: 8,
      title: 'VJ Emmy\'s Best Series Translations on Katiwatch',
      excerpt: 'VJ Emmy specializes in translating TV series to Luganda. Discover the best VJ Emmy translated series you can binge-watch on Katiwatch.',
      category: 'VJ Emmy',
      date: 'December 28, 2025',
      image: '/logo.jpeg',
      slug: 'vj-emmy-best-series'
    },
    {
      id: 9,
      title: 'How to Download VJ Movies for Offline Watching',
      excerpt: 'Complete tutorial on downloading VJ translated movies from Katiwatch. Watch VJ Junior and VJ Jjingo movies offline on your phone anywhere in Uganda.',
      category: 'Tutorials',
      date: 'December 25, 2025',
      image: '/logo.jpeg',
      slug: 'download-vj-movies-offline'
    },
  ];

  const categories = [
    'All Posts',
    'VJ Junior',
    'VJ Jjingo',
    'ICE P',
    'VJ Emmy',
    'Guides',
    'New Releases',
    'Comparisons',
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white py-12 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-white">
            VJ Movies Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Latest news, tips, and updates about VJ translated movies in Luganda
          </p>
        </div>

        {/* SEO Content */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="bg-[#1a1a2e]/40 p-6 rounded-lg border border-gray-800">
            <p className="text-gray-300 leading-relaxed">
              Welcome to the Katiwatch blog, your source for everything about VJ translated movies in Uganda. 
              Read the latest news about VJ Junior movies, VJ Jjingo releases, ICE P translations, and more. 
              Get tips on watching movies in Luganda online, discover new VJ translators, and stay updated 
              with the newest Hollywood and Bollywood movies translated to Luganda.
            </p>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className="flex-shrink-0 px-6 py-2.5 bg-[#1a1a2e]/60 border border-gray-800 hover:border-[#E50914] text-gray-300 hover:text-white rounded-full text-sm font-semibold transition-all whitespace-nowrap"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#E50914]/20 to-transparent p-1 rounded-2xl">
            <div className="bg-[#141414] rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative h-64 md:h-auto">
                  <Image
                    src={articles[0].image}
                    alt={articles[0].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-[#E50914] rounded-full text-xs font-bold">
                      FEATURED
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="px-3 py-1 bg-[#E50914]/20 text-[#E50914] rounded-full font-semibold">
                      {articles[0].category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {articles[0].date}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                    {articles[0].title}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {articles[0].excerpt}
                  </p>
                  <Link
                    href={`/blog/${articles[0].slug}`}
                    className="inline-flex items-center gap-2 text-[#E50914] hover:text-white font-semibold transition-colors group"
                  >
                    Read Full Article
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {articles.slice(1).map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group bg-[#1a1a2e]/60 rounded-lg overflow-hidden border border-gray-800 hover:border-[#E50914] transition-all duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-[#E50914] rounded-full text-xs font-bold">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Calendar className="w-3 h-3" />
                  {article.date}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#E50914] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-[#E50914] font-semibold text-sm group-hover:gap-3 transition-all">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* SEO Keywords Section */}
        <div className="bg-[#1a1a2e]/40 p-8 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#E50914]" />
            Popular Topics
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              'VJ Junior movies',
              'VJ Jjingo translations',
              'ICE P comedy movies',
              'VJ Emmy series',
              'Hollywood movies Luganda',
              'Bollywood movies Luganda',
              'Korean drama Luganda',
              'Latest VJ movies 2026',
              'Free VJ movies Uganda',
              'VJ translated series',
              'Watch VJ movies online',
              'Download VJ movies',
              'Best VJ translators Uganda',
              'VJ Kevo movies',
              'Translated movies Kampala',
            ].map((topic) => (
              <span
                key={topic}
                className="px-4 py-2 bg-[#1a1a2e] border border-gray-800 hover:border-[#E50914] rounded-full text-sm text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
