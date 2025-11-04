"use client"

import { useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { trackGA4Registration } from "@/lib/ga4-tracking"
import { createTrackingContext } from "@/lib/tracking-utils"
import { trackMetaRegistration } from "@/lib/meta-pixel"
import { fireGoogleAdsRegistrationConversion } from "@/lib/google-ads"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  message?: string
}

export function LoginModal({ isOpen, onClose, onSuccess, message }: LoginModalProps) {
  const router = useRouter()
  const eligibleTabs = useMemo(() => ["login", "register"], [])
  const [activeTab, setActiveTab] = useState(eligibleTabs[0])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    async function isEmailVerified(email: string) {
      try {
        const response = await fetch("/api/auth/email-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          return null
        }

        const data = await response.json()
        if (!data.exists) {
          return null
        }

        return Boolean(data.emailVerified)
      } catch (statusError) {
        console.error("Failed to check email verification status:", statusError)
        return null
      }
    }

    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setLoginError("Váš e-mail zatím není ověřen. Zkontrolujte prosím schránku a klikněte na ověřovací odkaz.")
        } else {
          const verified = loginData.email ? await isEmailVerified(loginData.email) : null
          if (verified === false) {
            setLoginError("Váš e-mail zatím není ověřen. Zkontrolujte prosím schránku a klikněte na ověřovací odkaz.")
          } else {
            setLoginError("Neplatné přihlašovací údaje")
          }
        }
      } else {
        onSuccess?.()
        onClose()
        router.refresh()
      }
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError("Došlo k chybě při přihlašování")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRegisterError("")
    setRegisterSuccess("")

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Hesla se neshodují")
      setIsLoading(false)
      return
    }

    try {
      const tracking = createTrackingContext()
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          tracking,
        }),
      })

      if (response.ok) {
        trackGA4Registration({
          email: registerData.email,
          method: "email",
          tracking,
        })
        trackMetaRegistration(tracking)
        fireGoogleAdsRegistrationConversion()
        setRegisterSuccess("Skoro hotovo! Poslali jsme vám e-mail s potvrzením registrace. Dokončete prosím ověření kliknutím na odkaz v e-mailu.")
        setRegisterData({
          email: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        setRegisterError(errorData.error || "Došlo k chybě při registraci")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setRegisterError("Došlo k chybě při registraci")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Přihlášení nebo registrace
          </DialogTitle>
        </DialogHeader>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
            <p className="text-sm text-blue-800 text-center font-medium">{message}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => value && eligibleTabs.includes(value) && setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Přihlásit se
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registrace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="jan.novak@email.cz"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password">Heslo</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Vaše heslo"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-sm text-red-600 text-center">{loginError}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? "Přihlašování..." : "Přihlásit se"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="jan.novak@email.cz"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="register-password">Heslo</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimálně 6 znaků"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="register-confirm-password">Potvrzení hesla</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Zadejte heslo znovu"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {registerError && (
                <p className="text-sm text-red-600 text-center">{registerError}</p>
              )}
              {registerSuccess && (
                <p className="text-sm text-green-600 text-center">{registerSuccess}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? "Registrace..." : "Vytvořit účet"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  )
}
