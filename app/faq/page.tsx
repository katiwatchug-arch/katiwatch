import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { redirect } from 'next/navigation';

// SEO-only page
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  title: 'FAQ - VJ Translated Movies Questions | Katiwatch Uganda Help Center',
  description: 'Find answers to frequently asked questions about VJ translated movies in Luganda. Learn how to watch VJ Junior movies, VJ Jjingo movies, download translated movies, and more on Katiwatch Uganda.',
  keywords: 'VJ movies FAQ, how to watch VJ movies, VJ Junior movies online, VJ Jjingo movies, translated movies Uganda, katiwatch help, VJ movies questions, movies in luganda FAQ',
  alternates: {
    canonical: 'https://katiwatch.com/faq',
  },
  openGraph: {
    title: 'FAQ - VJ Translated Movies Questions | Katiwatch',
    description: 'Frequently asked questions about watching VJ translated movies in Luganda on Katiwatch.',
    url: 'https://katiwatch.com/faq',
    type: 'website',
  },
};

export default function FAQPage({ searchParams }: { searchParams: { preview?: string } }) {
  // Redirect regular users
  if (typeof window !== 'undefined' && !searchParams?.preview) {
    redirect('/');
  }
  const faqs = [
    {
      category: 'General Questions',
      questions: [
        {
          q: 'What is Katiwatch?',
          a: 'Katiwatch is Uganda\'s number 1 streaming platform for VJ translated movies and series in Luganda. We offer thousands of Hollywood, Bollywood, and international movies dubbed by top Ugandan VJ translators including VJ Junior, VJ Jjingo, ICE P, VJ Emmy, and VJ Kevo.'
        },
        {
          q: 'What are VJ translated movies?',
          a: 'VJ translated movies are Hollywood, Bollywood, and international films that have been dubbed into Luganda by talented Ugandan voice-over artists known as VJs (Video Jockeys). These VJ translators add Ugandan humor, context, and cultural references while maintaining the story of the original film.'
        },
        {
          q: 'Is Katiwatch free to use?',
          a: 'Yes! Katiwatch offers thousands of VJ translated movies completely free to watch. We also have a premium subscription that unlocks exclusive VJ content, early access to new releases, ad-free viewing, and download capabilities.'
        },
        {
          q: 'How often are new VJ movies added?',
          a: 'New VJ translated movies and series are added to Katiwatch every single day. We work with multiple VJ translators to ensure fresh content is always available for our viewers.'
        },
      ]
    },
    {
      category: 'VJ Translators',
      questions: [
        {
          q: 'Which VJ translators are available on Katiwatch?',
          a: 'Katiwatch features all popular Ugandan VJ translators including VJ Junior, VJ Jjingo, ICE P, VJ Emmy, VJ Kevo, and many more. Each VJ brings their unique translation style and personality to the movies they dub.'
        },
        {
          q: 'How can I find movies by a specific VJ?',
          a: 'You can browse movies by VJ translator on our Movies or Series pages. Use the search feature or filter options to find content translated by your favorite VJ like VJ Junior movies or VJ Jjingo movies.'
        },
        {
          q: 'Can I request a VJ translator to be added?',
          a: 'Yes! We\'re always looking to partner with talented VJ translators. Contact us through our website to suggest VJs you\'d like to see on Katiwatch.'
        },
      ]
    },
    {
      category: 'Watching Movies',
      questions: [
        {
          q: 'How do I watch VJ translated movies on Katiwatch?',
          a: 'Simply browse our catalog of VJ movies, select the movie you want to watch, and click play. No registration is required for free content. For premium VJ movies, you\'ll need to create a free account and subscribe.'
        },
        {
          q: 'Can I watch VJ movies on my phone?',
          a: 'Absolutely! Katiwatch is fully optimized for mobile devices. You can stream VJ translated movies on any smartphone, tablet, or computer with an internet connection.'
        },
        {
          q: 'What video quality is available?',
          a: 'We offer VJ translated movies in HD quality for the best viewing experience. Video quality automatically adjusts based on your internet connection speed.'
        },
        {
          q: 'Can I download VJ movies for offline viewing?',
          a: 'Yes, premium subscribers can download VJ translated movies to watch offline on their mobile devices. This is perfect for watching VJ movies when you don\'t have internet access.'
        },
      ]
    },
    {
      category: 'Content & Categories',
      questions: [
        {
          q: 'What types of movies are available in Luganda?',
          a: 'Katiwatch offers VJ translations of Hollywood action movies, Bollywood drama, Korean dramas, Chinese films, comedy movies, romance, thriller, horror, and much more. We have content across all major genres translated to Luganda.'
        },
        {
          q: 'Are there VJ translated series available?',
          a: 'Yes! In addition to movies, Katiwatch offers VJ translated TV series and shows in Luganda. Binge-watch complete seasons of popular series dubbed by top VJs.'
        },
        {
          q: 'Do you have latest 2026 movies translated?',
          a: 'Yes! We continuously update our catalog with the latest movie releases. Our VJ translators work on new Hollywood and Bollywood movies as soon as they\'re available, so you can watch the newest films in Luganda.'
        },
        {
          q: 'Can I watch non-translated (original audio) movies too?',
          a: 'Yes, Katiwatch also offers a section for non-translated movies and series in their original languages with subtitles for viewers who prefer that option.'
        },
      ]
    },
    {
      category: 'Account & Premium',
      questions: [
        {
          q: 'Do I need to create an account?',
          a: 'You can watch free VJ translated movies without creating an account. However, creating a free account allows you to save favorites, track your watch history, and access premium features if you subscribe.'
        },
        {
          q: 'What are the benefits of Katiwatch Premium?',
          a: 'Premium subscribers get: exclusive VJ translated movies, early access to new releases, ad-free streaming, ability to download movies for offline viewing, and HD+ video quality.'
        },
        {
          q: 'How much does Premium cost?',
          a: 'Visit our Premium page for current subscription pricing and plans. We offer flexible monthly and annual subscriptions that are affordable for all Ugandans.'
        },
        {
          q: 'Can I cancel my Premium subscription anytime?',
          a: 'Yes, you can cancel your Katiwatch Premium subscription at any time with no penalties. You\'ll continue to have access until the end of your current billing period.'
        },
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'Why is my video buffering or loading slowly?',
          a: 'Video buffering is usually caused by slow internet connection. Try lowering the video quality in settings, pause and let the video buffer, or move closer to your WiFi router. Katiwatch automatically adjusts quality based on your connection speed.'
        },
        {
          q: 'The video won\'t play. What should I do?',
          a: 'Try refreshing the page, clearing your browser cache, or using a different browser. Make sure you have a stable internet connection. If the problem persists, contact our support team.'
        },
        {
          q: 'Is Katiwatch available outside Uganda?',
          a: 'While Katiwatch is primarily designed for Ugandan audiences, our VJ translated movies can be accessed from anywhere in the world. However, some content may be geo-restricted based on licensing agreements.'
        },
        {
          q: 'Which devices are supported?',
          a: 'Katiwatch works on all modern devices including: Android phones, iPhones, tablets, laptops, desktop computers, and smart TVs with a web browser.'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white py-12 px-4 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="w-16 h-16 text-[#E50914]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about watching VJ translated movies on Katiwatch
          </p>
        </div>

        {/* SEO Content */}
        <div className="mb-12 text-gray-300 bg-[#1a1a2e]/40 p-6 rounded-lg border border-gray-800">
          <p className="leading-relaxed">
            Welcome to the Katiwatch FAQ page. Here you&apos;ll find answers to common questions about watching VJ translated movies in Luganda, streaming content from VJ Junior, VJ Jjingo, ICE P, and other popular VJ translators. If you can&apos;t find the answer you&apos;re looking for, feel free to contact our support team.
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category, catIndex) => (
          <section key={catIndex} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white border-l-4 border-[#E50914] pl-4">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.questions.map((faq, faqIndex) => (
                <details
                  key={faqIndex}
                  className="group bg-[#1a1a2e]/60 rounded-lg border border-gray-800 hover:border-[#E50914]/50 transition-all duration-300"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 list-none">
                    <h3 className="text-lg font-semibold text-white pr-4">
                      {faq.q}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-[#E50914] flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Additional SEO Content */}
        <section className="mt-16 prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6 text-white">Still Have Questions About VJ Translated Movies?</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            If you couldn&apos;t find the answer to your question about watching VJ movies on Katiwatch, we&apos;re here to help! Our support team is available to assist with any questions about VJ Junior movies, VJ Jjingo content, streaming issues, account management, or anything else related to Katiwatch.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
            <div className="bg-gradient-to-br from-[#E50914]/20 to-transparent p-6 rounded-lg border border-[#E50914]/30">
              <h3 className="text-xl font-bold text-white mb-3">Contact Support</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get help from our customer support team
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-2 bg-[#E50914] hover:bg-[#b80710] rounded-full text-white font-semibold transition-colors"
              >
                Contact Us
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#E50914]/20 to-transparent p-6 rounded-lg border border-[#E50914]/30">
              <h3 className="text-xl font-bold text-white mb-3">Browse VJ Movies</h3>
              <p className="text-gray-400 text-sm mb-4">
                Explore thousands of VJ translated movies
              </p>
              <Link
                href="/movies"
                className="inline-block px-6 py-2 bg-[#E50914] hover:bg-[#b80710] rounded-full text-white font-semibold transition-colors"
              >
                Watch Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-white">Popular VJ Movie Searches</h2>
          <div className="flex flex-wrap gap-3 mb-8 not-prose">
            {[
              'VJ Junior movies',
              'VJ Jjingo movies',
              'ICE P translated movies',
              'VJ Emmy movies',
              'Latest VJ movies 2026',
              'Hollywood movies in Luganda',
              'Bollywood movies Luganda',
              'Korean drama Luganda',
              'Free VJ movies',
              'VJ translated series',
            ].map((term) => (
              <span
                key={term}
                className="px-4 py-2 bg-[#1a1a2e]/60 border border-gray-800 rounded-full text-sm text-gray-300 hover:border-[#E50914] hover:text-white transition-all cursor-pointer"
              >
                {term}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
