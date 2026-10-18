import { Metadata } from 'next';
import { Mail, MessageSquare, Phone, MapPin, Clock, Send } from 'lucide-react';
import { redirect } from 'next/navigation';

// SEO-only page
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  title: 'Contact Katiwatch - Get Help with VJ Movies | Uganda Support',
  description: 'Contact Katiwatch for help with VJ translated movies in Luganda. Get support for VJ Junior movies, VJ Jjingo movies, streaming issues, and more. We\'re here to help Ugandan movie lovers.',
  keywords: 'contact katiwatch, VJ movies support, katiwatch help Uganda, VJ movies contact, translated movies support, katiwatch customer service',
  alternates: {
    canonical: 'https://katiwatch.com/contact',
  },
  openGraph: {
    title: 'Contact Katiwatch - VJ Movies Support Uganda',
    description: 'Get help with VJ translated movies streaming. Contact Katiwatch support team.',
    url: 'https://katiwatch.com/contact',
    type: 'website',
  },
};

export default function ContactPage({ searchParams }: { searchParams: { preview?: string } }) {
  // Redirect regular users
  if (typeof window !== 'undefined' && !searchParams?.preview) {
    redirect('/');
  }
  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email Us',
      detail: 'info@katiwatch.com',
      description: 'Send us an email anytime. We typically respond within 24 hours.',
      action: 'mailto:info@katiwatch.com'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'WhatsApp',
      detail: '+256 XXX XXXXXX',
      description: 'Chat with us on WhatsApp for quick support.',
      action: '#'
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Call Us',
      detail: '+256 XXX XXXXXX',
      description: 'Speak directly with our support team.',
      action: 'tel:+256XXXXXXXXX'
    },
  ];

  const faqs = [
    {
      q: 'How can I watch VJ Junior movies?',
      a: 'Browse to our Movies section and filter by VJ Junior to see all his translated movies.'
    },
    {
      q: 'Why is my video not playing?',
      a: 'Check your internet connection. Try refreshing the page or using a different browser.'
    },
    {
      q: 'How do I download VJ movies?',
      a: 'Premium members can download movies by clicking the download button on movie pages.'
    },
    {
      q: 'Is Katiwatch really free?',
      a: 'Yes! Thousands of VJ translated movies are completely free. Premium unlocks exclusive content.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-white">
            Contact Katiwatch
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get help with VJ translated movies in Luganda. We&apos;re here to assist you!
          </p>
        </div>

        {/* SEO Content */}
        <div className="mb-12 bg-[#1a1a2e]/40 p-6 rounded-lg border border-gray-800">
          <p className="text-gray-300 leading-relaxed">
            Need help watching VJ Junior movies, VJ Jjingo movies, or any other VJ translated content on Katiwatch? 
            Our Uganda-based support team is ready to assist with streaming issues, account questions, premium subscriptions, 
            and anything related to watching movies in Luganda. Contact us through any of the methods below.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              className="bg-gradient-to-br from-[#E50914]/20 to-transparent p-6 rounded-lg border border-[#E50914]/30 hover:border-[#E50914] transition-all duration-300 group"
            >
              <div className="text-[#E50914] mb-4 group-hover:scale-110 transition-transform">
                {method.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                {method.title}
              </h3>
              <p className="text-[#E50914] font-semibold mb-3">
                {method.detail}
              </p>
              <p className="text-gray-400 text-sm">
                {method.description}
              </p>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Send Us a Message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-300">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-[#E50914] transition-colors"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-[#E50914] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2 text-gray-300">
                  Subject *
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-[#E50914] transition-colors"
                  required
                >
                  <option value="">Select a topic...</option>
                  <option value="technical">Technical Issue</option>
                  <option value="vj-movies">VJ Movies Question</option>
                  <option value="premium">Premium Subscription</option>
                  <option value="account">Account Help</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2 text-gray-300">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-[#E50914] transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#E50914] hover:bg-[#b80710] rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Quick Answers</h2>
            <div className="space-y-4 mb-8">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a2e]/60 p-5 rounded-lg border border-gray-800"
                >
                  <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-400 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-[#E50914]/20 to-transparent p-6 rounded-lg border border-[#E50914]/30">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="w-6 h-6 text-[#E50914] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-2">Support Hours</h3>
                  <p className="text-gray-300 text-sm mb-1">
                    <strong>Email Support:</strong> 24/7
                  </p>
                  <p className="text-gray-300 text-sm mb-1">
                    <strong>Phone Support:</strong> Mon-Sat, 8AM-8PM EAT
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>WhatsApp:</strong> 24/7 Chat Available
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-[#1a1a2e]/60 p-6 rounded-lg border border-gray-800">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#E50914] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-2">Location</h3>
                  <p className="text-gray-300 text-sm">
                    Serving all of Uganda
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Based in Kampala, Uganda
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="bg-[#1a1a2e]/40 p-8 rounded-lg border border-gray-800 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Looking for More Help?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Check out our FAQ page for answers to common questions about VJ translated movies, 
            streaming, downloads, and more.
          </p>
          <a
            href="/faq"
            className="inline-block px-8 py-3 bg-[#E50914] hover:bg-[#b80710] rounded-full font-bold text-white transition-all duration-300 hover:scale-105"
          >
            Visit FAQ Page
          </a>
        </div>

        {/* SEO Keywords Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Get help with: VJ Junior movies • VJ Jjingo movies • ICE P movies • VJ Emmy movies • 
            Translated movies Uganda • Movies in Luganda • VJ movies download • Premium subscription • 
            Streaming issues • Account support • Mobile app help
          </p>
        </div>
      </div>
    </div>
  );
}
