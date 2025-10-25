import type { Metadata } from "next"
import { ResetPasswordPage } from "@/components/pages/auth/reset-password-page"

export const metadata: Metadata = {
  title: "Nastavit nové heslo | Prostormat",
  description: "Zadejte nové heslo pro svůj účet Prostormat pomocí odkazu, který vám přišel e-mailem.",
  alternates: {
    canonical: "https://prostormat.cz/reset-heslo",
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

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />
}
