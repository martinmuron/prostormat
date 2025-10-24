import type { Metadata } from "next"
import { FAQPage } from "@/components/pages/faq-page"

export const metadata: Metadata = {
  title: "Nejčastější otázky o Prostormat | Prostormat",
  description: "Zodpovídáme otázky o tom, jak funguje Prostormat, jak najít prostor pro firemní akci v Praze a jak spolupracujeme s majiteli míst.",
  keywords: ["FAQ prostormat", "časté otázky", "jak funguje prostormat", "event prostor otázky", "pronájem prostoru Praha"],
  alternates: {
    canonical: "https://prostormat.cz/faq",
  },
  openGraph: {
    title: "FAQ: Jak funguje Prostormat",
    description: "Zjistěte, jak přesně probíhá vyhledávání a poptávání eventových prostorů přes Prostormat.",
    url: "https://prostormat.cz/faq",
    siteName: "Prostormat",
    images: [
      {
        url: "https://prostormat.cz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prostormat - FAQ"
      }
    ],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ: Jak funguje Prostormat",
    description: "Zjistěte, jak přesně probíhá vyhledávání a poptávání eventových prostorů přes Prostormat.",
    images: ["https://prostormat.cz/og-image.jpg"]
  }
}

export default function FAQRoute() {
  return <FAQPage />
}
