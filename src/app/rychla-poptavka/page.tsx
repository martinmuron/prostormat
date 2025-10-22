import type { Metadata } from "next"
import { QuickRequestPage } from "@/components/pages/quick-request-page"

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
  },
}

export default function QuickRequestRoute() {
  return <QuickRequestPage />
}
