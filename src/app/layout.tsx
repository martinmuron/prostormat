import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Prostormat - Event prostory v Praze",
  description: "Největší katalog event prostorů v Praze. Najděte perfektní prostor pro vaši akci.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}