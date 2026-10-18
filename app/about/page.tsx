import { Metadata } from 'next';
import Link from 'next/link';
import { Film, Users, Globe, Award, Play, Heart } from 'lucide-react';
import { redirect } from 'next/navigation';

// SEO-only page - redirect users to home
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  title: 'About Katiwatch - Uganda\'s number 1 platform VJ Translated Movies Platform | VJ Junior, VJ Jjingo Movies',
  description: 'Learn about Katiwatch, Uganda\'s leading platform for VJ translated movies in Luganda. Watch free VJ Junior movies, VJ Jjingo movies, ICE P translations and more. Discover how we bring Hollywood, Bollywood, and international cinema to Ugandan audiences in Luganda.',
  keywords: 'about katiwatch, VJ movies platform Uganda, Katiwatch Uganda, VJ translated movies, movies in luganda platform, VJ Junior, VJ Jjingo, Uganda movie streaming',
  alternates: {
    canonical: 'https://katiwatch.com/about',
  },
  openGraph: {
    title: 'About Katiwatch - Uganda\'s number 1 VJ Translated Movies Platform',
    description: 'Uganda\'s leading platform for VJ translated movies in Luganda. Free streaming of VJ Junior, VJ Jjingo, ICE P movies.',
    url: 'https://katiwatch.com/about',
    type: 'website',
  },
};

export default function AboutPage({ searchParams }: { searchParams: { preview?: string } }) {
  // Redirect regular users to home
  if (typeof window !== 'undefined' && !searchParams?.preview) {
    redirect('/');
  }
  const stats = [
    { icon: <Film className="w-8 h-8" />, number: '5000+', label: 'VJ Translated Movies' },
    { icon: <Users className="w-8 h-8" />, number: '15+', label: 'Top VJ Translators' },
    { icon: <Globe className="w-8 h-8" />, number: '1M+', label: 'Monthly Viewers' },
    { icon: <Award className="w-8 h-8" />, number: '#1', label: 'VJ Movies Platform' },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-white">
            About Katiwatch
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Uganda&apos;s number one platform for VJ translated movies in Luganda
          </p>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-[#E50914]/20 to-transparent p-6 rounded-lg text-center border border-[#E50914]/30">
              <div className="text-[#E50914] flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-white mb-2">{stat.number}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Main Content */}
        <section className="prose prose-invert prose-lg max-w-none mb-16">
          <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Katiwatch was founded with a simple mission: to make world-class entertainment accessible to all Ugandans in their native language. We believe that language should never be a barrier to enjoying the best movies and TV shows from around the world.
          </p>

          <h2 className="text-3xl font-bold mb-6 text-white">What We Offer</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Katiwatch is Uganda&apos;s premier streaming platform for VJ translated movies and series in Luganda. We partner with the best VJ translators in Uganda—including VJ Junior, VJ Jjingo, ICE P, VJ Emmy, and VJ Kevo—to bring you thousands of Hollywood, Bollywood, and international films dubbed in Luganda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="bg-[#1a1a2e]/60 p-6 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-6 h-6 text-[#E50914]" />
                <h3 className="text-xl font-bold text-white">Free Streaming</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Watch thousands of VJ translated movies completely free. No hidden fees, no subscriptions required for basic content.
              </p>
            </div>

            <div className="bg-[#1a1a2e]/60 p-6 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Film className="w-6 h-6 text-[#E50914]" />
                <h3 className="text-xl font-bold text-white">Latest Releases</h3>
              </div>
              <p className="text-gray-400 text-sm">
                New VJ translated movies added daily. Stay updated with the latest Hollywood blockbusters in Luganda.
              </p>
            </div>

            <div className="bg-[#1a1a2e]/60 p-6 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#E50914]" />
                <h3 className="text-xl font-bold text-white">Top VJ Translators</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Access content from all popular Ugandan VJs including VJ Junior, VJ Jjingo, ICE P, and more.
              </p>
            </div>

            <div className="bg-[#1a1a2e]/60 p-6 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-[#E50914]" />
                <h3 className="text-xl font-bold text-white">HD Quality</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Enjoy high-quality video streaming and crystal-clear VJ voice translations optimized for mobile.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-white">Why Choose Katiwatch?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Unlike other platforms, Katiwatch is specifically designed for Ugandan audiences who prefer watching movies in Luganda. We work directly with top VJ translators to ensure high-quality translations that capture the essence and humor of the original films.
          </p>

          <ul className="text-gray-300 space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-[#E50914] font-bold mt-1">✓</span>
              <span><strong>Largest VJ Movie Collection:</strong> Over 5,000 VJ translated movies and series</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#E50914] font-bold mt-1">✓</span>
              <span><strong>All Popular VJs:</strong> Content from VJ Junior, VJ Jjingo, ICE P, VJ Emmy, VJ Kevo and more</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#E50914] font-bold mt-1">✓</span>
              <span><strong>Daily Updates:</strong> New VJ translated movies added every single day</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#E50914] font-bold mt-1">✓</span>
              <span><strong>Mobile Optimized:</strong> Watch VJ movies on any device, anywhere in Uganda</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#E50914] font-bold mt-1">✓</span>
              <span><strong>Free & Premium:</strong> Free content plus premium VJ movies for subscribers</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 text-white">Our VJ Partners</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We&apos;re proud to partner with Uganda&apos;s most talented VJ translators. These voice-over artists have built massive followings by bringing Hollywood magic to Ugandan audiences in Luganda. From VJ Junior&apos;s action-packed translations to VJ Jjingo&apos;s blockbuster dubs, each VJ brings their unique style and personality to every movie.
          </p>

          <h2 className="text-3xl font-bold mb-6 text-white">Content Categories</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Katiwatch offers VJ translated content across all major genres and categories:
          </p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li><strong className="text-white">Hollywood Movies in Luganda:</strong> Action, thriller, drama, comedy, romance</li>
            <li><strong className="text-white">Bollywood Movies in Luganda:</strong> Indian cinema dubbed by VJs</li>
            <li><strong className="text-white">Korean Drama in Luganda:</strong> K-dramas and Korean movies translated</li>
            <li><strong className="text-white">VJ Translated Series:</strong> TV shows and series in Luganda</li>
            <li><strong className="text-white">Latest 2026 Movies:</strong> Brand new releases translated by VJs</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 text-white">Join the Katiwatch Community</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Millions of Ugandans trust Katiwatch for their entertainment needs. Join our growing community of VJ movie enthusiasts and never miss the latest translated releases. Whether you&apos;re a fan of VJ Junior, VJ Jjingo, ICE P, or any of our other talented translators, Katiwatch has something for everyone.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-[#E50914]/20 to-transparent py-12 px-6 rounded-2xl border border-[#E50914]/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Watching?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore thousands of VJ translated movies in Luganda. Free streaming, HD quality, and new content daily.
          </p>
          <Link
            href="/movies"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#E50914] hover:bg-[#b80710] rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
          >
            <Play className="w-6 h-6 fill-current" />
            Browse VJ Movies
          </Link>
        </section>
      </div>
    </div>
  );
}
