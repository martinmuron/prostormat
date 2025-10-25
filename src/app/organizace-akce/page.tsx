import type { Metadata } from "next"
import { OrganizeEventPage } from "@/components/pages/organize-event-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Organizace firemních akcí v Praze | Prostormat",
  description: "Pověřte nás kompletní organizací firemní akce v Praze. Zajistíme vhodné prostory, catering, techniku i produkci na míru vašemu zadání.",
  alternates: {
    canonical: "https://prostormat.cz/organizace-akce",
  },
  openGraph: {
    title: "Organizace firemních akcí v Praze | Prostormat",
    description: "Od výběru lokace přes catering až po produkci – zajistíme firemní akci v Praze na klíč.",
    url: "https://prostormat.cz/organizace-akce",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organizace firemních akcí v Praze | Prostormat",
    description: "Od výběru lokace přes catering až po produkci – zajistíme firemní akci v Praze na klíč.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function OrganizeEventRoute() {
  return <OrganizeEventPage />
}
