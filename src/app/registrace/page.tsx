"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Hesla se neshodují")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        // Auto sign in after registration
        // Give the database a moment to commit the user
        await new Promise(resolve => setTimeout(resolve, 500))

        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/dashboard")
        } else {
          // If auto sign-in fails, show error but don't redirect
          setError("Účet byl vytvořen, ale automatické přihlášení se nezdařilo. Zkuste se přihlásit manuálně.")
        }
      } else {
        const data = await response.json()
        setError(data.error || "Došlo k chybě při registraci")
      }
    } catch (error) {
      console.error("Failed to register user:", error)
      setError("Došlo k chybě při registraci")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-md md:max-w-2xl w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-title-3 text-black mb-2">Registrace</h1>
          <p className="text-sm sm:text-body text-gray-600">
            Vytvořte si účet a začněte organizovat akce
          </p>
        </div>

        <Card>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-sm sm:text-callout text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Uživatelské jméno *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Vaše uživatelské jméno"
                    required
                    className="h-11 sm:h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    E-mail *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="vas@email.cz"
                    required
                    className="h-11 sm:h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Heslo *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="h-11 sm:h-12"
                  />
                  <p className="text-xs sm:text-caption text-gray-500 mt-1">
                    Heslo musí mít alespoň 6 znaků
                  </p>
                </div>

                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Potvrzení hesla *
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="h-11 sm:h-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-[44px] sm:min-h-[48px]"
                disabled={isLoading}
              >
                {isLoading ? "Vytvářím účet..." : "Vytvořit účet"}
              </Button>
            </form>

            <div className="text-center mt-4 sm:mt-6">
              <p className="text-sm sm:text-callout text-gray-600">
                Už máte účet?{" "}
                <Link
                  href="/prihlaseni"
                  className="text-black hover:underline font-medium"
                >
                  Přihlaste se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
