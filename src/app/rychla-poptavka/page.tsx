import type { Metadata } from "next"
import { QuickRequestPage } from "@/components/pages/quick-request-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Rychlá poptávka prostoru | Prostormat",
  description: "Vyplňte jeden formulář a my oslovíme desítky prostorů v Praze za vás. Ideální řešení pro firemní akce, svatby i teambuildingy.",
  alternates: {
    canonical: "https://prostormat.cz/rychla-poptavka",
  },
  openGraph: {
    title: "Rychlá poptávka prostoru | Prostormat",
    description: "Zadejte parametry a během minut odešlete poptávku na ověřené prostory v Praze.",
    url: "https://prostormat.cz/rychla-poptavka",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rychlá poptávka prostoru | Prostormat",
    description: "Zadejte parametry a během minut odešlete poptávku na ověřené prostory v Praze.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function QuickRequestRoute() {
  return <QuickRequestPage />
}
