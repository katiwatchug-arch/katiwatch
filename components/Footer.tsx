import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-900 py-8 mt-12">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-4">
            Katiwatch - Uganda&apos;s number one platform for VJ translated movies in Luganda
          </p>
        </div>

        {/* Links - Small and unobtrusive like Netflix */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
          <Link href="/vj-movies?preview=true" className="text-gray-600 hover:text-gray-400 transition-colors">
            VJ Movies
          </Link>
          <Link href="/about?preview=true" className="text-gray-600 hover:text-gray-400 transition-colors">
            About
          </Link>
          <Link href="/faq?preview=true" className="text-gray-600 hover:text-gray-400 transition-colors">
            Help Center
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-gray-400 transition-colors">
            Terms of Use
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-400 transition-colors">
            Privacy
          </Link>
          <Link href="/contact?preview=true" className="text-gray-600 hover:text-gray-400 transition-colors">
            Contact
          </Link>
          <Link href="/blog?preview=true" className="text-gray-600 hover:text-gray-400 transition-colors">
            Blog
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-600 text-xs">
            © {currentYear} Katiwatch. All rights reserved.
          </p>
        </div>

        {/* Hidden SEO Keywords for crawlers only */}
        <div className="sr-only">
          <p>
            Watch VJ Junior movies, VJ Jjingo movies, ICE P translated movies, VJ Emmy movies, VJ Kevo movies online free.
            Stream Hollywood movies in Luganda, Bollywood movies in Luganda, Korean drama in Luganda.
            Uganda&apos;s best platform for translated movies and VJ content.
          </p>
        </div>
      </div>
    </footer>
  );
}
