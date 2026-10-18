import { Metadata } from 'next';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Film, 
  UserCheck, 
  Ban, 
  AlertTriangle, 
  Scale, 
  Mail, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Use - Katiwatch Streaming Service',
  description: 'Read the Terms of Use for Katiwatch, Uganda\'s streaming platform for VJ translated movies and international cinema. Learn about membership, billing, streaming quality, and account guidelines.',
  alternates: {
    canonical: 'https://katiwatch.com/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms of Use - Katiwatch',
    description: 'Terms of Use and streaming agreement for Katiwatch.',
    url: 'https://katiwatch.com/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  const lastUpdated = 'October 18, 2026';

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: ShieldCheck },
    { id: 'service', title: '2. The Katiwatch Streaming Service', icon: Film },
    { id: 'membership', title: '3. Membership, Subscriptions & Billing', icon: CreditCard },
    { id: 'passwords', title: '4. Passwords & Account Access', icon: UserCheck },
    { id: 'content', title: '5. Content & Intellectual Property', icon: FileText },
    { id: 'acceptable-use', title: '6. Prohibited Activities & Conduct', icon: Ban },
    { id: 'disclaimers', title: '7. Disclaimers & Limitations of Liability', icon: AlertTriangle },
    { id: 'governing-law', title: '8. Governing Law & Dispute Resolution', icon: Scale },
    { id: 'contact', title: '9. Customer Support & Inquiries', icon: Mail },
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
              Legal Documentation
            </span>
            <span className="text-xs text-zinc-400">
              Last updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Katiwatch Terms of Use
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            These Terms of Use govern your access to and use of the Katiwatch video streaming service, including our website, applications, media player, and features.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Quick Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-20 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-sm">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Table of Contents
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
                Looking for our data practices? Read our{' '}
                <Link href="/privacy" className="text-[#E50914] hover:underline font-medium">
                  Privacy Statement
                </Link>.
              </div>
            </div>
          </aside>

          {/* Main Content Sections */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-12 leading-relaxed text-zinc-300">
            
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">1. Acceptance of Terms</h2>
              </div>
              <p className="mb-3">
                By visiting, registering an account on, subscribing to, or accessing any content through Katiwatch (&quot;Katiwatch&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Use and our Privacy Statement.
              </p>
              <p className="mb-3">
                If you do not agree to these terms, you must not use or access Katiwatch. You must be at least 18 years of age, or the age of legal majority in your jurisdiction, to become a member of the Katiwatch service. Individuals under the legal age may only utilize the service under the supervision of a parent or legal guardian.
              </p>
            </section>

            {/* Section 2 */}
            <section id="service" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Film className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">2. The Katiwatch Streaming Service</h2>
              </div>
              <p className="mb-3">
                Katiwatch provides an on-demand digital entertainment and video streaming service offering access to movies, television series, VJ translated cinema (commentary dubbing in Luganda by featured Video Jockeys), trailers, and entertainment metadata.
              </p>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 my-4 space-y-2 text-sm">
                <div className="font-semibold text-white">Key Service Guidelines:</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li><strong>Personal, Non-Commercial Use:</strong> The service and all content viewed through it are for your personal and non-commercial entertainment only.</li>
                  <li><strong>Streaming Quality:</strong> Playback resolution (SD, HD, Full HD) depends on factors such as device capability, network bandwidth, and internet connection speed.</li>
                  <li><strong>Catalog Rotation:</strong> Content availability, featured titles, and translator tracks are continually updated and subject to periodic changes without prior notice.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="membership" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">3. Membership, Subscriptions & Billing</h2>
              </div>
              <p className="mb-3">
                While Katiwatch offers free-to-watch ad-supported content, selected premium movies, early-access VJ releases, and high-bitrate ad-free streams may require an active VIP or Premium subscription plan.
              </p>
              <p className="mb-3">
                <strong>Payment Methods:</strong> We support convenient local and digital payment channels, including MTN Mobile Money, Airtel Money, MakyPay, and supported mobile gateways. By subscribing, you authorize us to charge your chosen payment method for the periodic membership fee.
              </p>
              <p className="mb-3">
                <strong>Cancellation:</strong> You may cancel your subscription at any time via your account profile settings. Your access will remain active through the end of your current paid billing period.
              </p>
            </section>

            {/* Section 4 */}
            <section id="passwords" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">4. Passwords & Account Access</h2>
              </div>
              <p className="mb-3">
                You can create a Katiwatch account via email and password or third-party authentication providers (such as &quot;Continue with Google&quot;).
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3 text-zinc-300">
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You agree to notify us immediately of any suspected unauthorized access or breach of security.</li>
                <li>We reserve the right to suspend or terminate accounts that violate security guidelines or engage in credential sharing abuse.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="content" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">5. Content & Intellectual Property</h2>
              </div>
              <p className="mb-3">
                All software, user interfaces, graphic designs, logos, and proprietary features of Katiwatch are protected by copyright, trademark, and intellectual property laws.
              </p>
              <p className="mb-3">
                <strong>VJ Cultural Commentary:</strong> Katiwatch honors Uganda&apos;s rich cinematic culture of Video Jockey (VJ) commentary, voice-over adaptations, and community translations. All third-party movie titles, imagery, and studio metadata referenced via TMDB or external indexing remain the intellectual property of their respective copyright holders.
              </p>
            </section>

            {/* Section 6 */}
            <section id="acceptable-use" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Ban className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">6. Prohibited Activities & Conduct</h2>
              </div>
              <p className="mb-3">When using Katiwatch, you explicitly agree not to:</p>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-2 text-sm text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span>Circumvent, remove, alter, deactivate, or thwart any content protections, DRM, or access controls.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span>Use any robot, spider, scraper, or other automated means to access, capture, or download media streams.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span>Decompile, reverse engineer, or disassemble any software accessible through the Katiwatch website or app.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#E50914] font-bold">•</span>
                  <span>Resell, re-stream, broadcast in public commercial venues, or charge fees for viewing Katiwatch content.</span>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="disclaimers" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">7. Disclaimers & Limitations of Liability</h2>
              </div>
              <p className="mb-3 text-sm text-zinc-400">
                THE KATIWATCH SERVICE AND ALL MATERIALS ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. KATIWATCH DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
              </p>
              <p className="text-sm text-zinc-400">
                In no event shall Katiwatch, its directors, employees, or partners be liable for any indirect, punitive, or consequential damages arising from your access to or inability to use the streaming platform.
              </p>
            </section>

            {/* Section 8 */}
            <section id="governing-law" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Scale className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">8. Governing Law & Dispute Resolution</h2>
              </div>
              <p className="mb-3">
                These Terms shall be governed by and construed in accordance with the applicable laws of the Republic of Uganda, without regard to its conflict of law provisions. Any dispute shall be resolved through amicable consultation before seeking competent judicial resolution.
              </p>
            </section>

            {/* Section 9: Contact */}
            <section id="contact" className="scroll-mt-24">
              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-[#141414] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-[#E50914]" />
                  <h3 className="text-lg font-bold text-white">Have questions about these terms?</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  If you have questions regarding these Terms of Use, our service policies, or need account support, please reach out:
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a 
                    href="mailto:support@katiwatch.com" 
                    className="inline-flex items-center text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Email: support@katiwatch.com
                  </a>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center text-[#E50914] hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Visit Contact Center <ChevronRight className="w-4 h-4 ml-1" />
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
