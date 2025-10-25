'use client'

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || "Došlo k chybě")
      }
    } catch (error) {
      console.error("Failed to request password reset:", error)
      setError("Došlo k chybě")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <h1 className="text-title-3 text-black mb-2">Zapomenuté heslo</h1>
        <p className="text-body text-gray-600 mb-6">
          Zadejte e‑mail, na který vám pošleme odkaz pro obnovení hesla.
        </p>

        {success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            Pokud účet existuje, poslali jsme odkaz pro obnovení hesla na {email}.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-callout text-black mb-2">E‑mail</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
              />
            </div>
            {error && <p className="text-red-600 text-callout">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Odesílám..." : "Poslat odkaz"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/prihlaseni" className="text-black hover:underline">
            Zpět na přihlášení
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
