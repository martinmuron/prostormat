import type { Metadata } from "next"
import RegisterPage from "@/components/pages/auth/register-page"

export const metadata: Metadata = {
  title: "Registrace | Prostormat",
  description: "Vytvořte si účet a získejte přístup k poptávkám po eventových prostorech i správě vlastních lokací na Prostormatu.",
  alternates: {
    canonical: "https://prostormat.cz/registrace",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
}

export default function RegisterRoute() {
  return <RegisterPage />
}
