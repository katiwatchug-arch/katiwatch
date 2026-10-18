import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Shield, 
  Database, 
  UserCheck, 
  Lock, 
  Cookie, 
  Trash2, 
  Eye, 
  Mail, 
  ArrowLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Statement - Katiwatch Streaming Service',
  description: 'Understand how Katiwatch collects, protects, and uses your personal information. Learn about your privacy rights, Google authentication, streaming history, and data security.',
  alternates: {
    canonical: 'https://katiwatch.com/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Statement - Katiwatch',
    description: 'Privacy Policy and data protection standards for Katiwatch streaming service.',
    url: 'https://katiwatch.com/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'October 18, 2026';

  const sections = [
    { id: 'collection', title: '1. Information We Collect', icon: Database },
    { id: 'google-oauth', title: '2. Google Sign-In & Third-Party Auth', icon: Sparkles },
    { id: 'use', title: '3. How We Use Information', icon: Eye },
    { id: 'disclosure', title: '4. Sharing & Disclosure', icon: UserCheck },
    { id: 'cookies', title: '5. Cookies & Local Storage', icon: Cookie },
    { id: 'security', title: '6. Data Security & Storage', icon: Lock },
    { id: 'rights', title: '7. Your Rights & Account Deletion', icon: Trash2 },
    { id: 'contact', title: '8. Privacy Questions & Contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-zinc-100 selection:bg-[#E50914] selection:text-white">
      {/* Hero Header */}
      <div className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 via-[#141414] to-[#141414] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Katiwatch
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30">
              Privacy & Data Protection
            </span>
            <span className="text-xs text-zinc-400">
              Last updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Katiwatch Privacy Statement
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            This Privacy Statement explains our practices regarding the collection, use, and disclosure of certain information, including your personal information, when you use the Katiwatch streaming service.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Quick Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-20 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-sm">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Privacy Topics
              </h2>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center gap-2.5 py-2 px-3 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors group"
                  >
                    <sec.icon className="w-4 h-4 text-zinc-500 group-hover:text-[#E50914] transition-colors shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-zinc-800/80 text-xs text-zinc-500">
                Want to review service rules? Read our{' '}
                <Link href="/terms" className="text-[#E50914] hover:underline font-medium">
                  Terms of Use
                </Link>.
              </div>
            </div>
          </aside>

          {/* Main Content Sections */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-12 leading-relaxed text-zinc-300">
            
            {/* Section 1 */}
            <section id="collection" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Database className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">1. Information We Collect</h2>
              </div>
              <p className="mb-3">
                We receive and store information about you to provide, customize, and improve your video streaming experience:
              </p>
              <div className="space-y-3 my-4">
                <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-lg p-4">
                  <div className="font-semibold text-white text-sm mb-1">A. Information You Provide to Us:</div>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Your name, email address, password, and phone number (if provided for mobile money verification). If you subscribe to a VIP membership, transaction reference tokens are generated by our payment processors.
                  </p>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-lg p-4">
                  <div className="font-semibold text-white text-sm mb-1">B. Information Collected Automatically:</div>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Activity on the service such as title selections, watch history, playback timestamps (&quot;continue watching&quot; state), search queries, device type, operating system, and IP address.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="google-oauth" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">2. Google Sign-In & Third-Party Auth</h2>
              </div>
              <p className="mb-3">
                When you choose to authenticate using <strong>&quot;Continue with Google&quot;</strong>, Google shares basic profile information with Katiwatch under the standard OAuth 2.0 protocol:
              </p>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span><strong>Basic Information Only:</strong> We only request your public profile details: your name, email address, and profile picture.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span><strong>No Sensitive Google Access:</strong> Katiwatch does NOT access your Google Drive, Gmail, contacts, or any other sensitive services or private files.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span><strong>Zero Data Selling:</strong> We never sell your Google account data or share it with third-party advertisers.</span>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="use" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Eye className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">3. How We Use Information</h2>
              </div>
              <p className="mb-3">We use information to provide, analyze, and enhance our video streaming services:</p>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-300 text-sm">
                <li>Authenticate your account and maintain active session security across devices.</li>
                <li>Remember where you stopped playing a movie so you can resume playback seamlessly.</li>
                <li>Process subscription transactions and activate VIP streaming features.</li>
                <li>Recommend movies, trending releases, and new VJ translations matched to your tastes.</li>
                <li>Detect, investigate, and prevent fraudulent activity or security exploits.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="disclosure" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">4. Sharing & Disclosure</h2>
              </div>
              <p className="mb-3">
                Katiwatch does not sell your personal data. We only share information with authorized service providers who perform critical functions on our behalf:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="font-semibold text-white mb-1">Database & Auth (Supabase)</div>
                  <p className="text-xs text-zinc-400">Secure, encrypted user authentication and profile storage with row-level security.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="font-semibold text-white mb-1">Payment Gateways (MakyPay / Mobile Money)</div>
                  <p className="text-xs text-zinc-400">Direct mobile transaction routing. We never store raw debit/credit card numbers.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="font-semibold text-white mb-1">CDN & Security (Cloudflare)</div>
                  <p className="text-xs text-zinc-400">High-speed media caching, DDoS mitigation, and SSL/TLS encryption.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="font-semibold text-white mb-1">Notifications (OneSignal)</div>
                  <p className="text-xs text-zinc-400">Optional opt-in push alerts for newly released VJ movies and series updates.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="cookies" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Cookie className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">5. Cookies & Local Storage</h2>
              </div>
              <p className="mb-3">
                We use cookies and browser local storage for essential functions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                <li><strong>Authentication Cookies:</strong> Secure tokens that keep you logged in while you navigate between pages.</li>
                <li><strong>Playback State:</strong> Local storage items that store player volume, chosen audio tracks, and playback progress.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="security" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Lock className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">6. Data Security & Storage</h2>
              </div>
              <p className="mb-3">
                We employ reasonable administrative, logical, and physical security measures to safeguard your personal information against loss, theft, and unauthorized access. All network communications are encrypted in transit via industry-standard TLS/HTTPS protocols.
              </p>
            </section>

            {/* Section 7 */}
            <section id="rights" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">7. Your Rights & Account Deletion</h2>
              </div>
              <p className="mb-3">
                You hold full control over your personal data:
              </p>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 space-y-2">
                <p>
                  <strong>Account Deletion:</strong> You can permanently delete your Katiwatch account and associated viewing data at any time from your account profile settings, or by emailing our privacy team at <a href="mailto:privacy@katiwatch.com" className="text-[#E50914] underline">privacy@katiwatch.com</a>.
                </p>
                <p>
                  Upon deletion, your profile records, saved watchlists, and authentication bindings are permanently erased from our primary databases.
                </p>
              </div>
            </section>

            {/* Section 8: Contact */}
            <section id="contact" className="scroll-mt-24">
              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-[#141414] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-[#E50914]" />
                  <h3 className="text-lg font-bold text-white">Privacy Questions or Requests?</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  For questions concerning this Privacy Statement, personal information requests, or data protection practices, please contact our Data Protection team:
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a 
                    href="mailto:privacy@katiwatch.com" 
                    className="inline-flex items-center text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Email: privacy@katiwatch.com
                  </a>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center text-[#E50914] hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Support Center <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
