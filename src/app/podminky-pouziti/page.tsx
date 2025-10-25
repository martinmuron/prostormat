import type { Metadata } from "next"
import TermsOfUsePage from "@/components/pages/legal/terms-of-use-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Podmínky použití | Prostormat",
  description: "Seznamte se s podmínkami používání platformy Prostormat pro organizátory i majitele eventových prostorů.",
  alternates: {
    canonical: "https://prostormat.cz/podminky-pouziti",
  },
  openGraph: {
    title: "Podmínky používání platformy Prostormat",
    description: "Detailní vysvětlení pravidel a povinností pro uživatele eventového katalogu Prostormat.",
    url: "https://prostormat.cz/podminky-pouziti",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Podmínky použití | Prostormat",
    description: "Přečtěte si, za jakých podmínek můžete využívat platformu Prostormat.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function TermsRoute() {
  return <TermsOfUsePage />
}
