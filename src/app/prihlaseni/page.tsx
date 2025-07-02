"use client"

import { useState, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Neplatné přihlašovací údaje")
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError("Došlo k chybě při přihlašování")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (error) {
      setError("Došlo k chybě při přihlašování")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-title-2 font-bold text-black">
            Prostormat
          </Link>
          <h1 className="text-title-3 text-black mt-6 mb-2">Přihlášení</h1>
          <p className="text-body text-gray-600">
            Přihlaste se ke svému účtu
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-callout text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  required
                />
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Heslo
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Přihlašuji..." : "Přihlásit se"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="bg-white px-2 text-gray-500">Nebo</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Přihlásit se přes Google
            </Button>

            <div className="text-center mt-6">
              <p className="text-callout text-gray-600">
                Nemáte účet?{" "}
                <Link 
                  href="/registrace" 
                  className="text-black hover:underline font-medium"
                >
                  Zaregistrujte se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}