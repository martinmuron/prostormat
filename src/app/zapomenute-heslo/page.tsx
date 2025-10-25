import type { Metadata } from "next"
import ForgotPasswordPage from "@/components/pages/auth/forgot-password-page"

export const metadata: Metadata = {
  title: "Zapomenuté heslo | Prostormat",
  description: "Požádejte o obnovení přístupu k účtu Prostormat. Po zadání e-mailu vám odešleme odkaz pro nastavení nového hesla.",
  alternates: {
    canonical: "https://prostormat.cz/zapomenute-heslo",
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

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />
}
