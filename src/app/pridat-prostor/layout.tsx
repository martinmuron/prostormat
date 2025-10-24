import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Přidat prostor - Prostormat | Zaregistrujte svůj event prostor zdarma",
  description: "Zaregistrujte svůj event prostor a oslovte tisíce organizátorů firemních akcí, konferencí a teambuilding v Praze. Bezplatná registrace, žádné provize, okamžitá viditelnost.",
  keywords: [
    "přidat prostor",
    "registrace event prostor",
    "pronájem prostoru Praha",
    "event prostor registrace",
    "conference venue Praha",
    "prostor pro akce",
    "katalog event prostorů"
  ],
  openGraph: {
    title: "Přidat prostor - Prostormat",
    description: "Zaregistrujte svůj event prostor a oslovte tisíce organizátorů firemních akcí v Praze. Bezplatná registrace, žádné provize.",
    url: "https://prostormat.cz/pridat-prostor",
    siteName: "Prostormat",
    images: [
      {
        url: "https://prostormat.cz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prostormat - Přidat prostor"
      }
    ],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Přidat prostor - Prostormat",
    description: "Zaregistrujte svůj event prostor a oslovte tisíce organizátorů firemních akcí v Praze.",
    images: ["https://prostormat.cz/og-image.jpg"]
  },
  alternates: {
    canonical: "https://prostormat.cz/pridat-prostor"
  }
}

export default function PridatProstorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
