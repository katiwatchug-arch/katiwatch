"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Facebook, Instagram, Youtube, Twitter, Send } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "TV Shows" },
  { href: "/payment", label: "Subscribe" },
  { href: "/profile", label: "My Profile" },
];

const supportLinks = [
  { href: "https://t.me/KatiwatchMovies", label: "Telegram Channel", external: true },
];

const socialLinks = [
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Youtube, label: "YouTube" },
  { href: "#", icon: Twitter, label: "Twitter" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080808] text-white border-t border-gray-800/40 pt-12 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <Image
                src="/logo.jpeg"
                alt="Katiwatch Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain rounded-lg"
              />
              <span className="text-xl font-black text-[#E50914] tracking-wider uppercase">Katiwatch</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-[220px]">
              Uganda&apos;s #1 streaming platform for translated movies and TV shows.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#E50914]/20 hover:text-[#E50914] text-gray-500 flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Browse</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Support</h3>
            <ul className="space-y-2.5">
              {supportLinks.map(({ href, label, external }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1.5"
                  >
                    {label}
                    {external && (
                      <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:katiwachug@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#E50914]/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Mail className="w-3.5 h-3.5 group-hover:text-[#E50914]" />
                  </span>
                  katiwachug@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+2560765773436"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#E50914]/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Phone className="w-3.5 h-3.5 group-hover:text-[#E50914]" />
                  </span>
                  0765 773 436
                </a>
              </li>
              <li>
                <a
                  href="tel:+2560705908699"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#E50914]/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Phone className="w-3.5 h-3.5 group-hover:text-[#E50914]" />
                  </span>
                  0705 908 699
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/KatiwatchMovies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#229ED9]/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Send className="w-3.5 h-3.5 group-hover:text-[#229ED9]" />
                  </span>
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {currentYear} Katiwatch — We Are Entertainment. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-gray-700 text-xs">Made with</span>
            <span className="text-[#E50914] text-xs">❤</span>
            <span className="text-gray-700 text-xs">in Uganda</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
