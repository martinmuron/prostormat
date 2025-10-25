import type { Metadata } from "next"
import { ContactPage } from "@/components/pages/contact-page"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"
import { generateContactPageSchema, schemaToJsonLd } from "@/lib/schema-markup"

export const metadata: Metadata = {
  title: "Kontaktujte nás | Prostormat",
  description: "Ozvěte se nám s poptávkou po firemní akci, spolupráci nebo správě vašeho eventového prostoru v Praze.",
  keywords: ["kontakt prostormat", "event prostor kontakt", "organizace akce Praha", "kontakt firemní akce"],
  alternates: {
    canonical: "https://prostormat.cz/kontakt",
  },
  openGraph: {
    title: "Kontakt Prostormat",
    description: "Potřebujete poradit s výběrem prostoru nebo hledáte partnera pro organizaci firemní akce? Napište nám.",
    url: "https://prostormat.cz/kontakt",
    siteName: "Prostormat",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontakt Prostormat",
    description: "Potřebujete poradit s výběrem prostoru nebo hledáte partnera pro organizaci firemní akce?",
    images: [DEFAULT_OG_IMAGE]
  }
}

export default function ContactRoute() {
  const contactSchema = generateContactPageSchema({
    email: "info@prostormat.cz",
    telephone: "+420 775 654 639",
    address: {
      addressLocality: "Praha",
      addressCountry: "CZ",
    },
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(contactSchema)}
      />
      <ContactPage />
    </>
  )
}
