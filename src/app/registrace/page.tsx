"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    company: "",
    phone: "",
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
          role: formData.role,
          company: formData.company || null,
          phone: formData.phone || null,
        }),
      })

      if (response.ok) {
        // Auto sign in after registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/dashboard")
        } else {
          router.push("/prihlaseni?message=Účet byl vytvořen, přihlaste se prosím")
        }
      } else {
        const data = await response.json()
        setError(data.error || "Došlo k chybě při registraci")
      }
    } catch (error) {
      setError("Došlo k chybě při registraci")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      setError("Došlo k chybě při registraci")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo variant="black" size="md" />
          </div>
          <h1 className="text-title-3 text-black mb-2">Registrace</h1>
          <p className="text-body text-gray-600">
            Vytvořte si účet a začněte organizovat akce
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
                  Jméno *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Vaše jméno"
                  required
                />
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  E-mail *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="vas@email.cz"
                  required
                />
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Typ účtu *
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte typ účtu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Organizátor akcí</SelectItem>
                    <SelectItem value="venue_manager">Provozovatel prostoru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "user" && (
                <div>
                  <label className="block text-callout font-medium text-black mb-2">
                    Společnost
                  </label>
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Název společnosti"
                  />
                </div>
              )}

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Telefon
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+420 123 456 789"
                />
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Heslo *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                <p className="text-caption text-gray-500 mt-1">
                  Heslo musí mít alespoň 6 znaků
                </p>
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Potvrzení hesla *
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Vytvářím účet..." : "Vytvořit účet"}
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
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              Registrovat se přes Google
            </Button>

            <div className="text-center mt-6">
              <p className="text-callout text-gray-600">
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