import type { Metadata } from "next"
import { SignInPage } from "@/components/pages/auth/sign-in-page"

export const metadata: Metadata = {
  title: "Přihlášení | Prostormat",
  description: "Přihlaste se ke svému účtu a spravujte eventové prostory nebo poptávky v platformě Prostormat.",
  alternates: {
    canonical: "https://prostormat.cz/prihlaseni",
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

export default function SignInRoute() {
  return <SignInPage />
}
