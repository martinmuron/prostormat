import type { Metadata } from "next"
import { VenueBroadcastPage } from "@/components/pages/venue-broadcast-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Poptávka prostoru pro akci | Prostormat",
  description: "Vyplňte parametry své akce a rozešlete poptávku ověřeným prostorům v Praze. Firemní akce, teambuilding i svatby na jednom místě.",
  alternates: {
    canonical: "https://prostormat.cz/poptavka-prostoru",
  },
  openGraph: {
    title: "Poptávka prostoru pro akci | Prostormat",
    description: "Poptejte prostor pro firemní akci, svatbu nebo teambuilding během pár minut.",
    url: "https://prostormat.cz/poptavka-prostoru",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poptávka prostoru pro akci | Prostormat",
    description: "Poptejte prostor pro firemní akci, svatbu nebo teambuilding během pár minut.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function VenueBroadcastRoute() {
  return <VenueBroadcastPage />
}
