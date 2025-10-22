import type { Metadata } from "next"
import { FAQPage } from "@/components/pages/faq-page"

export const metadata: Metadata = {
  title: "Nejčastější otázky o Prostormat | Prostormat",
  description: "Zodpovídáme otázky o tom, jak funguje Prostormat, jak najít prostor pro firemní akci v Praze a jak spolupracujeme s majiteli míst.",
  alternates: {
    canonical: "https://prostormat.cz/faq",
  },
  openGraph: {
    title: "FAQ: Jak funguje Prostormat",
    description: "Zjistěte, jak přesně probíhá vyhledávání a poptávání eventových prostorů přes Prostormat.",
    url: "https://prostormat.cz/faq",
  },
}

export default function FAQRoute() {
  return <FAQPage />
}
