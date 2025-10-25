import type { Metadata } from "next"
import PrivacyPolicyPage from "@/components/pages/legal/privacy-policy-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Zásady ochrany osobních údajů | Prostormat",
  description: "Zjistěte, jak Prostormat zpracovává a chrání osobní údaje uživatelů v souladu s GDPR a českou legislativou.",
  alternates: {
    canonical: "https://prostormat.cz/ochrana-soukromi",
  },
  openGraph: {
    title: "Zásady ochrany osobních údajů | Prostormat",
    description: "Transparentně popisujeme, jak nakládáme s osobními údaji organizátorů i majitelů eventových prostorů.",
    url: "https://prostormat.cz/ochrana-soukromi",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ochrana soukromí | Prostormat",
    description: "Přečtěte si, jaké osobní údaje shromažďujeme a jak je chráníme.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function PrivacyRoute() {
  return <PrivacyPolicyPage />
}
