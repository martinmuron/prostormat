import type { Metadata } from "next"
import { ContactPage } from "@/components/pages/contact-page"

export const metadata: Metadata = {
  title: "Kontaktujte nás | Prostormat",
  description: "Ozvěte se nám s poptávkou po firemní akci, spolupráci nebo správě vašeho eventového prostoru v Praze.",
  alternates: {
    canonical: "https://prostormat.cz/kontakt",
  },
  openGraph: {
    title: "Kontakt Prostormat",
    description: "Potřebujete poradit s výběrem prostoru nebo hledáte partnera pro organizaci firemní akce? Napište nám.",
    url: "https://prostormat.cz/kontakt",
  },
}

export default function ContactRoute() {
  return <ContactPage />
}
