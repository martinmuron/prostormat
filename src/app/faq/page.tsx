import type { Metadata } from "next"
import { FAQPage } from "@/components/pages/faq-page"
import { faqItems } from "@/data/faq"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"
import { generateFaqSchema, schemaToJsonLd } from "@/lib/schema-markup"

export const metadata: Metadata = {
  title: "FAQ: Kompletní průvodce Prostormat – 34 odpovědí | Prostormat",
  description: "Kompletní průvodce Prostormat: Event Board, full-service organizace akcí, ceník pro majitele (12 000 Kč + DPH / rok), prémiové balíčky, připravované AI funkce, platby a další. Bez provizí, transparentní ceny.",
  keywords: [
    "FAQ prostormat",
    "event board jak funguje",
    "prostormat ceník",
    "cena přidání prostoru",
    "12000 kč roční předplatné",
    "prostormat bez provize",
    "full service organizace akcí Praha",
    "rychlá poptávka prostor",
    "priority balíček prostormat",
    "top priority prostormat",
    "jak přidat prostor na prostormat",
    "ai matching prostormat",
    "ai visual event prostormat",
    "prostormat pro majitele",
    "prostormat pro organizátory",
    "event prostor otázky",
    "pronájem prostoru FAQ",
    "offline platba prostor",
    "refundace prostormat"
  ],
  alternates: {
    canonical: "https://prostormat.cz/faq",
  },
  openGraph: {
    title: "FAQ: Kompletní průvodce Prostormat – 34 odpovědí",
    description: "Vše o Event Boardu, full-service organizaci, cenících pro majitele (12K + DPH / rok), prémiových balíčcích Priority & Top Priority i připravovaných AI funkcích. Bez provizí.",
    url: "https://prostormat.cz/faq",
    siteName: "Prostormat",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ: Kompletní průvodce Prostormat",
    description: "34 odpovědí na nejčastější otázky: Event Board, ceník, full-service organizace, AI novinky a platby. Bez provizí.",
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
