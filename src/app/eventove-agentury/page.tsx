import type { Metadata } from "next"
import { EventAgenciesPage } from "@/components/pages/event-agencies-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Eventové agentury | Prostormat",
  description: "Připravujeme partnerskou sekci pro eventové agentury, které s námi spolupracují na realizaci akcí. Ozvěte se nám, pokud chcete být u toho.",
  alternates: {
    canonical: "https://prostormat.cz/eventove-agentury",
  },
  openGraph: {
    title: "Eventové agentury | Prostormat",
    description: "Spojujeme ověřené eventové agentury s klienty Prostormat. Zanechte nám kontakt a probereme možnosti spolupráce.",
    url: "https://prostormat.cz/eventove-agentury",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventové agentury | Prostormat",
    description: "Připravujeme partnerskou sekci pro eventové agentury spolupracující s Prostormat.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function EventAgenciesRoute() {
  return <EventAgenciesPage />
}
