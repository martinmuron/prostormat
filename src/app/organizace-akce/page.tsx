import type { Metadata } from "next"
import { OrganizeEventPage } from "@/components/pages/organize-event-page"

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
  },
}

export default function OrganizeEventRoute() {
  return <OrganizeEventPage />
}
