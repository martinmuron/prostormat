'use client'

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return setError("Odkaz je neplatný")
    if (password !== confirm) return setError("Hesla se neshodují")
    if (password.length < 6) return setError("Heslo musí mít alespoň 6 znaků")

    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || "Došlo k chybě")
      }
    } catch (error) {
      console.error("Failed to reset password:", error)
      setError("Došlo k chybě")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <h1 className="text-title-3 text-black mb-2">Nastavit nové heslo</h1>
        <p className="text-body text-gray-600 mb-6">
          Zadejte nové heslo pro váš účet.
        </p>
        {success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            Heslo bylo úspěšně změněno.{" "}
            <Link className="underline" href="/prihlaseni">
              Přihlásit se
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-callout text-black mb-2">Nové heslo</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-callout text-black mb-2">Potvrzení hesla</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-red-600 text-callout">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Ukládám..." : "Změnit heslo"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítám…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

export default ResetPasswordPage
