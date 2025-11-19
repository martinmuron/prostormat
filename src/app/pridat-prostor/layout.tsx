import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Přidat prostor - Prostormat | Zaregistrujte svůj event prostor zdarma",
  description: "Zaregistrujte svůj event prostor a oslovte stovky organizátorů firemních akcí, konferencí a teambuilding v Praze. Bezplatná registrace, žádné provize, viditelnost do 48-72 hodin.",
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
    description: "Zaregistrujte svůj event prostor a oslovte stovky organizátorů firemních akcí v Praze. Bezplatná registrace, žádné provize.",
    url: "https://prostormat.cz/pridat-prostor",
    siteName: "Prostormat",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Přidat prostor - Prostormat",
    description: "Zaregistrujte svůj event prostor a oslovte stovky organizátorů firemních akcí v Praze.",
    images: [DEFAULT_OG_IMAGE]
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
