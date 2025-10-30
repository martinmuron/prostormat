'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type VerificationStatus = "idle" | "verifying" | "success" | "error"

interface VerifyEmailPageProps {
  token?: string
}

export function VerifyEmailPage({ token }: VerifyEmailPageProps) {
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>("idle")
  const [message, setMessage] = useState<string>("")
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error")
        setMessage("Chybí ověřovací odkaz. Zkuste prosím kliknout na link v e-mailu znovu.")
        return
      }

      setStatus("verifying")
      setMessage("")

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          const data = await response.json().catch(() => ({}))
          const friendlyName =
            typeof data?.user?.name === "string" && data.user.name.trim().length > 0
              ? data.user.name
              : typeof data?.user?.email === "string"
                ? data.user.email
                : null
          setStatus("success")
          setMessage(
            friendlyName
              ? `E-mail byl úspěšně ověřen. Vítej zpět, ${friendlyName}! Přihlašujeme vás...`
              : "E-mail byl úspěšně ověřen. Přihlašujeme vás..."
          )
          setRedirecting(true)
          router.refresh()
          router.prefetch("/vitejte")
          setTimeout(() => {
            router.replace("/vitejte")
          }, 1000)
        } else {
          const data = await response.json().catch(() => ({}))
          setStatus("error")
          setMessage(
            typeof data.error === "string"
              ? data.error
              : "Ověření se nezdařilo. Zkuste to prosím znovu."
          )
        }
      } catch (error) {
        console.error("Failed to verify email:", error)
        setStatus("error")
        setMessage("Došlo k chybě při ověřování e-mailu. Zkuste to prosím znovu později.")
      }
    }

    verifyEmail()
  }, [router, token])

  const isLoading = status === "verifying"

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-black mb-2">Potvrzení e-mailu</h1>
          <p className="text-sm text-gray-600">
            {isLoading
              ? "Ověřujeme vaši registraci..."
              : "Dokončete registraci potvrzením vašeho e-mailu."}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {isLoading && (
              <div className="text-center text-sm text-gray-600">
                Probíhá ověřování, prosím vyčkejte.
              </div>
            )}

            {!isLoading && status === "success" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-green-600">{message}</p>
                {redirecting && (
                  <div className="text-xs text-gray-500">
                    Přesměrováváme vás na dashboard...
                  </div>
                )}
              </div>
            )}

            {!isLoading && status === "error" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-red-600">{message}</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/registrace">Zkusit registraci znovu</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/prihlaseni">Přejít na přihlášení</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerifyEmailPage
