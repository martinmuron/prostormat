import type { Metadata } from "next"
import { FAQPage } from "@/components/pages/faq-page"
import { faqItems } from "@/data/faq"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"
import { generateFaqSchema, schemaToJsonLd } from "@/lib/schema-markup"

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
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ: Jak funguje Prostormat",
    description: "Zjistěte, jak přesně probíhá vyhledávání a poptávání eventových prostorů přes Prostormat.",
    images: [DEFAULT_OG_IMAGE]
  }
}

export default function FAQRoute() {
  const faqSchema = generateFaqSchema(faqItems)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(faqSchema)}
      />
      <FAQPage />
    </>
  )
}
