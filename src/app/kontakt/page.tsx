import type { Metadata } from "next"
import { ContactPage } from "@/components/pages/contact-page"

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
    images: [
      {
        url: "https://prostormat.cz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prostormat - Kontakt"
      }
    ],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontakt Prostormat",
    description: "Potřebujete poradit s výběrem prostoru nebo hledáte partnera pro organizaci firemní akce?",
    images: ["https://prostormat.cz/og-image.jpg"]
  }
}

export default function ContactRoute() {
  return <ContactPage />
}
