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

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          type="text/plain"
          data-cookieconsent="marketing"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TRGRXRXV');
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
              fbq('init', '24691302657204918');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={GeistSans.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript data-cookieconsent="marketing">
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TRGRXRXV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Meta Pixel (noscript) */}
        <noscript data-cookieconsent="marketing">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=24691302657204918&ev=PageView&noscript=1"
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
