import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import Script from "next/script"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import GlobalClickSpark from "@/components/ui/click-spark"
import { generateOrganizationSchema, generateWebSiteSchema, schemaToJsonLd } from "@/lib/schema-markup"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES, SITE_URL } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Prostormat - Největší katalog event prostorů v Praze",
  description: "Hledáte prostor na firemní akci, svatbu, konferenci nebo teambuilding? Prostormat je největší katalog event prostorů v Praze s 866+ lokacemi. Najděte perfektní prostor pro vaši akci.",
  keywords: [
    'firemní akce Praha',
    'event prostory Praha',
    'prostor na akci',
    'hledám prostor',
    'hledám lokaci na akci',
    'organizace akce',
    'svatební prostor Praha',
    'konferenční místnost Praha',
    'teambuilding prostor',
    'pronájem prostoru',
    'eventové prostory',
    'Prostormat',
  ],
  metadataBase: new URL(SITE_URL),
  applicationName: "Prostormat",
  category: "Eventy",
  openGraph: {
    title: 'Prostormat - Největší katalog event prostorů v Praze',
    description: 'Hledáte prostor na firemní akci, svatbu, konferenci nebo teambuilding? Najděte perfektní prostor z 866+ lokací v Praze.',
    url: 'https://prostormat.cz',
    siteName: 'Prostormat',
    images: [...DEFAULT_OG_IMAGES],
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prostormat - Největší katalog event prostorů v Praze',
    description: 'Hledáte prostor na firemní akci, svatbu, konferenci nebo teambuilding? Najděte perfektní prostor z 866+ lokací v Praze.',
    images: [DEFAULT_OG_IMAGE],
    creator: '@prostormat',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: '/favicon-32x32.svg',
  },
  alternates: {
    canonical: SITE_URL,
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema()
  const webSiteSchema = generateWebSiteSchema()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const metaPixelId = process.env.META_PIXEL_ID || '796426231881929'
  let supabaseOrigin: string | null = null

  if (supabaseUrl) {
    try {
      supabaseOrigin = new URL(supabaseUrl).origin
    } catch (error) {
      console.warn("Invalid NEXT_PUBLIC_SUPABASE_URL provided:", error)
    }
  }

  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        {/* Resource hints for faster loading */}
        {supabaseOrigin ? (
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
        ) : null}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://consent.cookiebot.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Schema.org JSON-LD markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={schemaToJsonLd(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={schemaToJsonLd(webSiteSchema)}
        />

        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="02642a3d-68e1-4dfd-9e04-eba8ad218312"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />

        <Script
          id="gtag-consent-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var ADS_ID = 'AW-17685324076';
                var GA4_ID = 'G-5KYL3YYZL2';
                var hasLoaded = false;

                function ensureDataLayer() {
                  window.dataLayer = window.dataLayer || [];
                  window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
                }

                function loadGtag() {
                  if (hasLoaded) return;
                  hasLoaded = true;
                  ensureDataLayer();

                  var script = document.createElement('script');
                  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
                  script.async = true;
                  document.head.appendChild(script);

                  script.addEventListener('load', function() {
                    window.gtag('js', new Date());
                    window.gtag('config', ADS_ID);
                    window.gtag('config', GA4_ID);
                  });

                  window.reportGoogleAdsConversion = function(config, url) {
                    if (!config || !config.send_to) {
                      console.warn('Missing Google Ads conversion configuration');
                      return false;
                    }

                    var callback = function () {
                      if (typeof url !== 'undefined') {
                        window.location = url;
                      }
                    };

                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'conversion', {
                        'send_to': config.send_to,
                        'value': typeof config.value === 'number' ? config.value : 0,
                        'currency': config.currency || 'CZK',
                        'event_callback': callback,
                      });
                    } else {
                      console.warn('gtag is not available when attempting to report conversion');
                    }

                    return false;
                  };

                  window.gtag_report_conversion = function(url) {
                    return window.reportGoogleAdsConversion({
                      send_to: 'AW-17685324076/zK4hCKTLpbUbEKzCgvFB',
                      value: 1.0,
                      currency: 'CZK',
                    }, url);
                  };
                }

                function hasMarketingConsent() {
                  if (!window.Cookiebot || !window.Cookiebot.consent) {
                    return false;
                  }
                  var consent = window.Cookiebot.consent;
                  return !!(consent.marketing || consent.statistics);
                }

                function evaluateConsent() {
                  if (hasMarketingConsent()) {
                    loadGtag();
                  }
                }

                window.addEventListener('CookiebotOnAccept', evaluateConsent);
                window.addEventListener('CookiebotOnLoad', evaluateConsent);
                evaluateConsent();
              })();
            `,
          }}
        />

        <Script
          id="remove-gtag-preload"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('link[rel="preload"][href*="gtag/js"]').forEach(function(link) {
                link.remove();
              });
            `,
          }}
        />

        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          type="text/plain"
          data-cookieconsent="marketing"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={GeistSans.className}>
        {/* Meta Pixel (noscript) */}
        <noscript data-cookieconsent="marketing">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <GlobalClickSpark />
        </SessionProvider>
      </body>
    </html>
  )
}
