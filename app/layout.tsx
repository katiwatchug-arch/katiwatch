import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AuthProvider } from "@/components/AuthProvider";
import ConditionalLayout from "../components/ConditionalLayout";
import WhatsAppFloat from "../components/WhatsAppFloat";
import { ErrorBoundary } from "../components/ErrorBoundary";
import Script from "next/script";
import NotificationPrompt from "@/components/NotificationPrompt";

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover', // Better support for iPhone notch/safe areas
  themeColor: '#E50914',
};

export const metadata: Metadata = {
  title: {
    default: 'Katiwatch - VJ Translated Movies in Luganda | Watch VJ Junior, VJ Jjingo Movies Uganda',
    template: '%s | Katiwatch - VJ Movies Uganda',
  },
  description: 'Watch FREE VJ translated movies in Luganda online. Stream VJ Junior movies, VJ Jjingo movies, ICE P translated movies and series. Uganda\'s number 1 streaming platform for movies translated to Luganda. Watch Hollywood, Bollywood, Korean drama movies dubbed in Luganda by top Ugandan VJs. Katiwatch.com - Your home for VJ movies in Uganda.',
  keywords: 'VJ translated movies luganda, VJ movies Uganda, movies in luganda, free VJ movies, VJ Junior movies, VJ Jjingo movies, ICE P movies, VJ Emmy movies, VJ Kevo movies, translated movies Uganda, luganda movies online, watch VJ movies free, Uganda movie streaming, movies translated to luganda, VJ movies download, Hollywood movies in luganda, Bollywood movies luganda, Korean drama luganda, VJ translated series, katiwatch, translated movies kampala, VJ movies 2026, latest VJ movies Uganda, VJ movies free download, watch translated movies online Uganda, VJ dubbed movies, VJ voice over movies, Ugandan VJ movies, best VJ movies Uganda, VJ translated films, movies in luganda language, VJ movie streaming Uganda, VJ movies website Uganda, watch VJ Junior online, watch VJ Jjingo online, translated series Uganda, VJ TV shows Uganda, katiwatch.com, VJ movies app Uganda',
  applicationName: 'Katiwatch',
  authors: [{ name: 'Katiwatch' }],
  generator: 'Next.js',
  publisher: 'Katiwatch',
  creator: 'Katiwatch',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://katiwatch.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Katiwatch - VJ Translated Movies in Luganda | VJ Junior, VJ Jjingo Movies Uganda',
    description: 'Watch FREE VJ translated movies in Luganda. Stream VJ Junior movies, VJ Jjingo, ICE P translated movies & series. Uganda\'s number one platform for movies translated to Luganda by top VJs.',
    url: 'https://katiwatch.com',
    siteName: 'Katiwatch - VJ Movies Uganda',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Katiwatch - Watch VJ Translated Movies in Luganda Online - VJ Junior, VJ Jjingo Movies Uganda',
      },
    ],
    locale: 'en_UG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Katiwatch - VJ Translated Movies Luganda | VJ Junior, VJ Jjingo Movies Uganda',
    description: 'Watch FREE VJ translated movies in Luganda online. Stream VJ Junior movies, VJ Jjingo movies, ICE P & more. Uganda\'s number 1 VJ movie streaming platform.',
    images: ['/logo.jpeg'],
    site: '@katiwatch',
    creator: '@katiwatch',
  },
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  // PWA manifest
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'ng4R7NM6MuDzTtbHaQRZL9I0J7yFZ-itKgF-12hIQWo',
  },
};

// JSON-LD Structured Data for rich Google results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://katiwatch.com/#website',
      url: 'https://katiwatch.com',
      name: 'Katiwatch - VJ Translated Movies Uganda',
      alternateName: ['katiwatch.com', 'katiwatch', 'VJ Movies Uganda', 'Luganda Movies Online', 'VJ Translated Movies Luganda'],
      description: 'Watch FREE VJ translated movies in Luganda online. Stream VJ Junior movies, VJ Jjingo movies, ICE P translated movies and series. Uganda\'s number 1 platform for movies translated to Luganda by top VJs.',
      publisher: { '@id': 'https://katiwatch.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://katiwatch.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: ['en-UG', 'lg-UG'],
      audience: {
        '@type': 'Audience',
        geographicArea: {
          '@type': 'Country',
          name: 'Uganda'
        }
      }
    },
    {
      '@type': 'Organization',
      '@id': 'https://katiwatch.com/#organization',
      name: 'Katiwatch',
      alternateName: ['Katiwatch Uganda', 'Katiwatch UG', 'VJ Movies Uganda'],
      url: 'https://katiwatch.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://katiwatch.com/logo.jpeg',
        width: 1200,
        height: 630,
      },
      description: 'Uganda\'s leading platform for VJ translated movies in Luganda',
      areaServed: {
        '@type': 'Country',
        name: 'Uganda'
      },
      sameAs: [
        'https://twitter.com/katiwatch',
        'https://facebook.com/katiwatch'
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://katiwatch.com/#webpage',
      url: 'https://katiwatch.com',
      name: 'Katiwatch - VJ Translated Movies in Luganda | VJ Junior, VJ Jjingo Movies Uganda',
      isPartOf: { '@id': 'https://katiwatch.com/#website' },
      about: { '@id': 'https://katiwatch.com/#organization' },
      description: 'Watch FREE VJ translated movies in Luganda online. Stream VJ Junior movies, VJ Jjingo movies, ICE P translated movies & series. Uganda\'s number 1 platform for movies translated to Luganda by top VJs.',
      inLanguage: 'en-UG',
      keywords: 'VJ translated movies luganda, VJ movies Uganda, movies in luganda, free VJ movies, VJ Junior movies, VJ Jjingo movies, ICE P movies, translated movies Uganda',
    },
    {
      '@type': 'VideoObject',
      '@id': 'https://katiwatch.com/#streaming',
      name: 'VJ Translated Movies Streaming',
      description: 'Stream VJ translated movies and series in Luganda',
      thumbnailUrl: 'https://katiwatch.com/logo.jpeg',
      uploadDate: new Date().toISOString(),
      contentUrl: 'https://katiwatch.com',
      embedUrl: 'https://katiwatch.com',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://katiwatch.com/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://katiwatch.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'VJ Translated Movies',
          item: 'https://katiwatch.com/movies'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'VJ Translated Series',
          item: 'https://katiwatch.com/series'
        }
      ]
    }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="katiwatch" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <link rel="apple-touch-startup-image" href="/logo.jpeg" />
      </head>
      {/* 
        Streamit uses #141414 for background natively or completely black, 
        but we'll define bg-streamit-bg for exact match 
      */}
      <body className="min-h-screen bg-[#141414] text-white flex flex-col font-roboto antialiased">
        <Script
          id="json-ld-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
        {/* OneSignal Web SDK v16 */}
        <Script
          id="onesignal-sdk"
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
          defer
        />
        <Script
          id="onesignal-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: '${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''}',
                  serviceWorkerPath: 'OneSignalSDKWorker.js',
                  serviceWorkerParam: { scope: '/' },
                  notifyButton: { enable: false },
                });
                // If the user already granted permission, opt them into OneSignal's
                // push subscription. This is required in v16 SDK — permission alone
                // is not enough; optIn() creates the active push token in OneSignal.
                try {
                  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    await OneSignal.User.PushSubscription.optIn();
                    console.log('[OneSignal] optIn() called. Subscription ID:', OneSignal.User.PushSubscription.id);
                  }
                } catch(e) {
                  console.warn('[OneSignal] optIn error:', e);
                }
              });
            `,
          }}
        />
        {/* Register PWA service worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
        <ErrorBoundary>
          <AuthProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <WhatsAppFloat />
            <NotificationPrompt />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

