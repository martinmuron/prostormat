"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const message = searchParams.get("message")
  const venue = searchParams.get("venue")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Success message for account creation
  const showSuccessMessage = message === "account-created"

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
      console.error("Failed to sign in:", error)
      setError("Došlo k chybě při přihlašování")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-title-3 text-black mb-2">Přihlášení</h1>
          <p className="text-sm sm:text-body text-gray-600">
            Přihlaste se ke svému účtu
          </p>
        </div>

        <Card>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            {showSuccessMessage && venue && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-callout font-medium text-green-800">Účet úspěšně vytvořen!</h3>
                </div>
                <p className="text-xs sm:text-caption text-green-700 leading-relaxed">
                  Váš účet a prostor &quot;{decodeURIComponent(venue)}&quot; byly úspěšně vytvořeny. 
                  Nyní se přihlaste a začněte spravovat svůj prostor.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-sm sm:text-callout text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  required
                  className="h-11 sm:h-12"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Heslo
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 sm:h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full min-h-[44px] sm:min-h-[48px]" 
                disabled={isLoading}
              >
                {isLoading ? "Přihlašuji..." : "Přihlásit se"}
              </Button>
            </form>

            <div className="text-center mt-4 sm:mt-6 space-y-2">
              <p className="text-sm sm:text-callout text-gray-600">
                <Link href="/zapomenute-heslo" className="text-black hover:underline font-medium">
                  Zapomněli jste heslo?
                </Link>
              </p>
              <p className="text-sm sm:text-callout text-gray-600">
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
