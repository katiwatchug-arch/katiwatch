"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "@/lib/auth";
import { setRedirectCookie } from "@/lib/utils";
import { Search, Bell, Send } from "lucide-react";


const leftNavItems: { href: string; label: React.ReactNode }[] = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "TV Shows" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);


  const { user, loading, isPremium } = useAuth();

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };



  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setShowUserMenu(false);
      }
    };

    if (isMenuOpen || showUserMenu) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, showUserMenu]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.relative')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <header
        className={`transition-all duration-300 border-b ${isScrolled
          ? "bg-[#1a1a2e]/95 backdrop-blur-md shadow-lg border-gray-800"
          : "bg-[#1a1a2e] border-gray-800"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left section: Logo */}
          <div className="flex items-center flex-shrink-0">
            {/* Logo - Always visible */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <Image
                src="/logo.jpeg"
                alt="Katiwatch Logo"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                priority
              />
              <span className="hidden sm:block text-xl md:text-2xl font-black text-white tracking-tight">
                KATIWATCH
              </span>
            </Link>
          </div>

          {/* Center section: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
            {leftNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 transition-all duration-200 font-semibold text-sm tracking-wide rounded-lg ${isActive(item.href)
                  ? "text-white bg-white/10"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right section: Search and User */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Desktop Search */}
            <Link
              href="/search"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Search...</span>
            </Link>

            {/* Mobile User Section */}
            <div className="flex items-center lg:hidden">
              {loading ? (
                <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
</span>
              ) : user ? (
                <>
                  {/* Mobile User Avatar - navigates directly to profile page */}
                  <Link
                    href="/profile"
                    className="relative flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#E50914] min-w-[40px] min-h-[40px]"
                    aria-label="Go to Profile"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        width={40}
                        height={40}
                        className={`w-10 h-10 rounded-full border-2 ${isPremium ? 'border-[#E50914]' : 'border-[#E50914]'}`}
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isPremium ? 'bg-orange-400' : 'bg-[#E50914]'}`}>
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setRedirectCookie(pathname)}
                  className="flex items-center justify-center w-10 h-10 bg-[#E50914] hover:bg-[#b80710] text-white font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  aria-label="Sign In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Desktop: Telegram, Notifications, User */}
            <div className="hidden lg:flex items-center space-x-3">
              <a
                href="https://t.me/KatiwatchMovies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] hover:text-white transition-all duration-300"
                aria-label="Telegram channel"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">Telegram</span>
              </a>

              {/* Notifications Icon */}
              <Link
                href="/notifications"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </Link>

              {loading ? (
                <span className="inline-flex items-center justify-center font-bold tracking-widest text-2xl text-[#E50914]">
  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
</span>
              ) : user ? (
                <>
                  {/* Premium Badge - Show only if user is not premium */}
                  {!isPremium && (
                    <Link
                      href="/payment"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all shadow-lg hover:shadow-yellow-500/50"
                    >
                      <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 24 24">
                        <path d="M3 17h18v2H3v-2zm18-9l-3.5 5.5L12 7l-5.5 6.5L3 8l3 11h12l3-11z" />
                      </svg>
                      <span className="text-black font-bold text-xs tracking-wider">SUBSCRIBE</span>
                    </Link>
                  )}

                  {/* Desktop User Avatar */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                    aria-label="Go to Profile"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        width={32}
                        height={32}
                        className={`w-8 h-8 rounded-full border-2 ${isPremium ? 'border-yellow-500' : 'border-gray-600'}`}
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isPremium ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 'bg-[#E50914]'}`}>
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setRedirectCookie(pathname)}
                  className="px-6 py-2 bg-[#E50914] hover:bg-[#b80710] text-white font-bold rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#E50914]/50"
                >
                  Login
                </Link>
              )}
            </div>

          {/* Mobile Right Section - Search and Menu */}
          <div className="flex items-center space-x-3 lg:hidden">
            <a
              href="https://t.me/KatiwatchMovies"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86bb] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#229ED9] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Telegram channel"
            >
              <Send className="w-5 h-5 text-white" />
            </a>

            {/* Mobile Search Button */}
            <Link
              href="/search"
              className="p-2 rounded-lg hover:bg-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#E50914] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#E50914]" />
            </Link>

            {/* Mobile Notifications Button */}
            <Link
              href="/notifications"
              className="p-2 rounded-lg hover:bg-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#E50914] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[#E50914]" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-black active:bg-gray-700 transition-colors duration-200 relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-0.5" : ""
                    }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""
                    }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                    }`}
                />
              </div>
            </button>
          </div>
        </div>



        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="border-t border-gray-800 bg-black shadow-lg">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
              <div className="flex flex-col space-y-1">
                {/* Home Link with Logo */}
                <Link
                  href="/"
                  className={`px-4 py-3 sm:py-4 rounded-lg transition-all duration-200 hover:bg-black active:bg-gray-700 hover:translate-x-2 text-base sm:text-lg min-h-[44px] flex items-center font-semibold ${isActive("/")
                    ? "text-[#E50914] font-medium bg-black border-r-2 border-[#E50914]"
                    : "text-gray-300 hover:text-[#E50914]"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    animationDelay: "0ms",
                    animation: isMenuOpen ? `slideIn 0.3s ease-out forwards` : ""
                  }}
                >
                  <Image
                    src="/logo.jpeg"
                    alt="Katiwatch Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain rounded mr-3"
                    priority
                  />
                  Home
                </Link>

                {leftNavItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 sm:py-4 rounded-lg transition-all duration-200 hover:bg-black active:bg-gray-700 hover:translate-x-2 text-base sm:text-lg min-h-[44px] flex items-center ${isActive(item.href)
                      ? "text-[#E50914] font-medium bg-black border-r-2 border-[#E50914]"
                      : "text-gray-300 hover:text-[#E50914]"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      animationDelay: `${(index + 1) * 50}ms`,
                      animation: isMenuOpen ? `slideIn 0.3s ease-out forwards` : ""
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/download"
                  className={`px-4 py-3 sm:py-4 rounded-lg transition-all duration-200 hover:bg-black active:bg-gray-700 hover:translate-x-2 text-base sm:text-lg min-h-[44px] flex items-center font-semibold ${isActive('/download') ? 'text-[#E50914]' : 'text-gray-300 hover:text-[#E50914]'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Image src="/google_play.svg" alt="Download" width={20} height={20} className="w-5 h-5 mr-2 transition-colors duration-200" />
                  Download
                </Link>
                {/* Mobile Navigation Footer */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {user ? (
                    <div className="px-4 py-2 flex flex-col gap-2">
                      <div className="flex items-center gap-3 mb-1">
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full border-2 border-[#E50914]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#E50914] flex items-center justify-center text-white font-bold text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.user_metadata?.full_name || 'Account'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium min-h-[44px]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500 text-center">
                        katiwatch - Your Entertainment Hub
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>

        <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Custom breakpoint for extra small screens */
        @media (max-width: 480px) {
          .xs\:hidden {
            display: none;
          }
        }
        
        @media (min-width: 481px) {
          .xs\:inline {
            display: inline;
          }
        }
        
        /* Ensure proper touch targets on mobile */
        @media (max-width: 1023px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
      </header>


    </>
  );
}

