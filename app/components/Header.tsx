"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { setRedirectCookie } from "@/lib/utils";
// signOut is now used from useAuth() directly
import { Bell, Send, LogOut, User, Crown } from "lucide-react";

const leftNavItems: { href: string; label: React.ReactNode }[] = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "TV Shows" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, loading, isPremium, signOut } = useAuth();
  const isActive = (href: string) => pathname === href;
  const router = useRouter();

  const handleSignOut = async () => {
    setShowUserMenu(false);
    setIsMenuOpen(false);
    localStorage.removeItem("katiwatch-auth-session");
    await signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsMenuOpen(false); setShowUserMenu(false); }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const AvatarCircle = ({ size }: { size: number }) =>
    user?.user_metadata?.avatar_url ? (
      <Image
        src={user.user_metadata.avatar_url}
        alt="Profile"
        width={size}
        height={size}
        className={`rounded-full border-2 ${isPremium ? "border-yellow-500" : "border-[#E50914]"}`}
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className={`rounded-full flex items-center justify-center text-white font-bold text-sm ${isPremium ? "bg-gradient-to-r from-yellow-600 to-yellow-500" : "bg-[#E50914]"}`}
        style={{ width: size, height: size }}
      >
        {user?.email?.charAt(0).toUpperCase()}
      </div>
    );

  const UserDropdown = () => (
    <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-sm font-semibold text-white truncate">
          {user?.user_metadata?.full_name || "Account"}
        </p>
        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        {isPremium && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-yellow-400">
            <Crown className="w-3 h-3" /> Premium
          </span>
        )}
      </div>
      <div className="py-1">
        <Link
          href="/profile"
          onClick={() => setShowUserMenu(false)}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <User className="w-4 h-4" /> My Profile
        </Link>
        {!isPremium && (
          <Link
            href="/payment"
            onClick={() => setShowUserMenu(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/5 transition-colors"
          >
            <Crown className="w-4 h-4" /> Get Premium
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  const LoadingDots = () => (
    <span className="inline-flex items-center font-bold tracking-widest text-2xl text-[#E50914]">
      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
    </span>
  );

  return (
    <header className={`transition-all duration-300 border-b ${isScrolled ? "bg-[#1a1a2e]/95 backdrop-blur-md shadow-lg border-gray-800" : "bg-[#1a1a2e] border-gray-800"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <Image src="/logo.jpeg" alt="Katiwatch Logo" width={48} height={48}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300" priority />
          <span className="hidden sm:block text-xl md:text-2xl font-black text-white tracking-tight">KATIWATCH</span>
        </Link>

        {/* Desktop center nav */}
        <nav className="hidden lg:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
          {leftNavItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-5 py-2 transition-all duration-200 font-semibold text-sm tracking-wide rounded-lg ${isActive(item.href) ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* ── DESKTOP ── */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="https://t.me/KatiwatchMovies" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] hover:text-white transition-all">
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">Telegram</span>
            </a>
            <Link href="/notifications" className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </Link>

            {loading ? <LoadingDots /> : user ? (
              <>
                {!isPremium && (
                  <Link href="/payment"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all shadow-lg">
                    <Crown className="w-4 h-4 text-black" />
                    <span className="text-black font-bold text-xs tracking-wider">SUBSCRIBE</span>
                  </Link>
                )}
                {/* Avatar + dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    aria-label="User menu"
                  >
                    <AvatarCircle size={32} />
                    <svg className={`w-3 h-3 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showUserMenu && <UserDropdown />}
                </div>
              </>
            ) : (
              <Link href="/signin" onClick={() => setRedirectCookie(pathname)}
                className="px-6 py-2 bg-[#E50914] hover:bg-[#b80710] text-white font-bold rounded-lg text-sm transition-all">
                Login
              </Link>
            )}
          </div>

          {/* ── MOBILE ── */}
          <div className="flex items-center gap-2 lg:hidden">
            <a href="https://t.me/KatiwatchMovies" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86bb] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </a>
            <Link href="/notifications"
              className="p-2 rounded-lg hover:bg-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#E50914]" />
            </Link>

            {loading ? <LoadingDots /> : user ? (
              /* Mobile avatar → tap to open dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center justify-center rounded-full min-w-[40px] min-h-[40px] cursor-pointer"
                  aria-label="User menu"
                >
                  <AvatarCircle size={40} />
                </button>
                {showUserMenu && <UserDropdown />}
              </div>
            ) : (
              <Link href="/signin" onClick={() => setRedirectCookie(pathname)}
                className="flex items-center justify-center w-10 h-10 bg-[#E50914] hover:bg-[#b80710] text-white font-bold rounded-full transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Hamburger */}
            <button type="button"
              className="p-2 rounded-lg hover:bg-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-0.5" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down nav */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-gray-800 bg-black shadow-lg">
          <nav className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-1">
              <Link href="/"
                className={`px-4 py-3 rounded-lg flex items-center gap-3 text-base font-semibold transition-all hover:translate-x-2 ${isActive("/") ? "text-[#E50914] bg-black border-r-2 border-[#E50914]" : "text-gray-300 hover:text-[#E50914]"}`}
                onClick={() => setIsMenuOpen(false)}>
                <Image src="/logo.jpeg" alt="" width={24} height={24} className="w-6 h-6 rounded" />
                Home
              </Link>
              {leftNavItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`px-4 py-3 rounded-lg flex items-center text-base transition-all hover:translate-x-2 ${isActive(item.href) ? "text-[#E50914] bg-black border-r-2 border-[#E50914]" : "text-gray-300 hover:text-[#E50914]"}`}
                  onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/download"
                className={`px-4 py-3 rounded-lg flex items-center gap-2 text-base font-semibold transition-all hover:translate-x-2 ${isActive("/download") ? "text-[#E50914]" : "text-gray-300 hover:text-[#E50914]"}`}
                onClick={() => setIsMenuOpen(false)}>
                <Image src="/google_play.svg" alt="" width={20} height={20} className="w-5 h-5" />
                Download
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </header>
  );
}
