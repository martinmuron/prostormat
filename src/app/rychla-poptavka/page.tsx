'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoginModal } from "@/components/auth/login-modal"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { Calendar, Users, MapPin, Euro, Clock, Send, Zap, CheckCircle, LogIn } from "lucide-react"

interface QuickRequestFormData {
  eventType: string
  eventDate: string
  guestCount: string
  budgetRange: string
  locationPreference: string
  requirements: string
  contactName: string
  contactEmail: string
  contactPhone: string
  message: string
}

const GUEST_COUNT_OPTIONS = [
  { label: "1-25 osob", value: "1-25" },
  { label: "26-50 osob", value: "26-50" },
  { label: "51-100 osob", value: "51-100" },
  { label: "101-200 osob", value: "101-200" },
  { label: "200+ osob", value: "200+" },
]

const BUDGET_RANGES = [
  { label: "Do 50 000 Kč", value: "0-50000" },
  { label: "50 000 - 100 000 Kč", value: "50000-100000" },
  { label: "100 000 - 200 000 Kč", value: "100000-200000" },
  { label: "200 000 - 500 000 Kč", value: "200000-500000" },
  { label: "500 000+ Kč", value: "500000+" },
  { label: "Domluvíme se", value: "negotiable" },
]

const LOCATIONS = [
  "Praha 1", "Praha 2", "Praha 3", "Praha 4", "Praha 5",
  "Praha 6", "Praha 7", "Praha 8", "Praha 9", "Praha 10",
  "Brno", "Ostrava", "Plzeň", "České Budějovice",
  "Hradec Králové", "Pardubice", "Zlín", "Karlovy Vary", "Liberec"
]

export default function QuickRequestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [sentToCount, setSentToCount] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const [formData, setFormData] = useState<QuickRequestFormData>({
    eventType: "",
    eventDate: "",
    guestCount: "",
    budgetRange: "",
    locationPreference: "",
    requirements: "",
    contactName: session?.user?.name || "",
    contactEmail: session?.user?.email || "",
    contactPhone: "",
    message: "",
  })

  const [errors, setErrors] = useState<Partial<QuickRequestFormData>>({})

  const validateForm = () => {
    const newErrors: Partial<QuickRequestFormData> = {}

    if (!formData.eventType) newErrors.eventType = "Vyberte typ akce"
    if (!formData.eventDate) newErrors.eventDate = "Vyberte datum akce"
    if (!formData.guestCount) newErrors.guestCount = "Vyberte počet hostů"
    if (!formData.locationPreference) newErrors.locationPreference = "Vyberte lokalitu"
    if (!formData.contactName.trim()) newErrors.contactName = "Zadejte vaše jméno"
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "Zadejte email"
    if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = "Zadejte platný email"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/quick-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setIsSuccess(true)
        setSentToCount(data.sentToCount || 0)
      } else {
        const errorData = await response.json()
        alert(`Chyba: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error submitting quick request:', error)
      alert('Došlo k chybě při odesílání požadavku')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof QuickRequestFormData, value: string) => {
    if (!session) {
      setShowLoginModal(true)
      return
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleInputFocus = () => {
    if (!session) {
      setShowLoginModal(true)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Poptávka byla odeslána!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Vaše poptávka byla úspěšně odeslána {sentToCount} prostorům, které odpovídají vašim kritériím. 
              Měli byste očekávat odpovědi v průběhu příštích 24-48 hodin.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link href="/pozadavky">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-xl w-full sm:w-auto">
                  Zobrazit všechny požadavky
                </Button>
              </Link>
              <Link href="/prostory">
                <Button variant="outline" size="lg" className="rounded-xl border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
                  Procházet prostory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-black">Rychlá poptávka</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Vyplňte formulář a my automaticky ošleme vaši poptávku všem prostorům, 
            které odpovídají vašim požadavkům. Ušetříte čas a získáte více nabídek!
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Rychlé odeslání</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Více nabídek najednou</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Odpověď do 48h</span>
            </div>
          </div>
        </div>

        {/* Auth Check */}
        {!session && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <LogIn className="h-8 w-8 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-2">Přihlaste se pro lepší zážitek</h3>
                  <p className="text-sm text-amber-700 mb-4">
                    Přihlášení uživatelé mají automaticky vyplněné kontaktní údaje a mohou sledovat své poptávky.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/prihlaseni">
                      <Button size="sm" className="bg-amber-700 text-white hover:bg-amber-800">
                        Přihlásit se
                      </Button>
                    </Link>
                    <Link href="/registrace">
                      <Button variant="outline" size="sm" className="border-amber-600 text-amber-700">
                        Registrace
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Detaily vaší akce
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Type */}
                <div>
                  <Label htmlFor="eventType" className="text-sm font-medium text-gray-700 mb-2 block">
                    Typ akce *
                  </Label>
                  <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                    <SelectTrigger 
                      className={errors.eventType ? 'border-red-300' : ''}
                      onFocus={handleInputFocus}
                    >
                      <SelectValue placeholder="Vyberte typ akce" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.eventType && <p className="text-sm text-red-600 mt-1">{errors.eventType}</p>}
                </div>

                {/* Event Date */}
                <div>
                  <Label htmlFor="eventDate" className="text-sm font-medium text-gray-700 mb-2 block">
                    Datum akce *
                  </Label>
                  <Input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    onFocus={handleInputFocus}
                    className={errors.eventDate ? 'border-red-300' : ''}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Vyberte datum akce"
                  />
                  {errors.eventDate && <p className="text-sm text-red-600 mt-1">{errors.eventDate}</p>}
                </div>

                {/* Guest Count */}
                <div>
                  <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700 mb-2 block">
                    Počet hostů *
                  </Label>
                  <Select value={formData.guestCount} onValueChange={(value) => handleInputChange('guestCount', value)}>
                    <SelectTrigger 
                      className={errors.guestCount ? 'border-red-300' : ''}
                      onFocus={handleInputFocus}
                    >
                      <SelectValue placeholder="Vyberte počet hostů" />
                    </SelectTrigger>
                    <SelectContent>
                      {GUEST_COUNT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.guestCount && <p className="text-sm text-red-600 mt-1">{errors.guestCount}</p>}
                </div>

                {/* Budget Range */}
                <div>
                  <Label htmlFor="budgetRange" className="text-sm font-medium text-gray-700 mb-2 block">
                    Rozpočet
                  </Label>
                  <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                    <SelectTrigger onFocus={handleInputFocus}>
                      <SelectValue placeholder="Vyberte rozpočet (volitelné)" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <Label htmlFor="locationPreference" className="text-sm font-medium text-gray-700 mb-2 block">
                    Preferovaná lokalita *
                  </Label>
                  <Select value={formData.locationPreference} onValueChange={(value) => handleInputChange('locationPreference', value)}>
                    <SelectTrigger 
                      className={errors.locationPreference ? 'border-red-300' : ''}
                      onFocus={handleInputFocus}
                    >
                      <SelectValue placeholder="Vyberte lokalitu" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.locationPreference && <p className="text-sm text-red-600 mt-1">{errors.locationPreference}</p>}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700 mb-2 block">
                  Speciální požadavky
                </Label>
                <Textarea
                  placeholder="Například: catering, zvuková technika, projektor, wifi, parkovací místa..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  onFocus={handleInputFocus}
                  rows={3}
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                  Zpráva pro prostory
                </Label>
                <Textarea
                  placeholder="Představte se a popište svou akci. Čím více informací poskytnete, tím lepší nabídky dostanete..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  onFocus={handleInputFocus}
                  rows={4}
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontaktní údaje</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Jméno a příjmení *
                    </Label>
                    <Input
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder="Jan Novák"
                      className={errors.contactName ? 'border-red-300' : ''}
                    />
                    {errors.contactName && <p className="text-sm text-red-600 mt-1">{errors.contactName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email *
                    </Label>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder="jan.novak@email.cz"
                      className={errors.contactEmail ? 'border-red-300' : ''}
                    />
                    {errors.contactEmail && <p className="text-sm text-red-600 mt-1">{errors.contactEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Telefon
                    </Label>
                    <Input
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder="+420 123 456 789"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Odesíláme poptávku...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Odeslat poptávku prostorům
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  Poptávka bude odeslána pouze prostorům, které odpovídají vašim kritériím
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false)
            // Refresh form data with user info after login
            if (session?.user) {
              setFormData(prev => ({
                ...prev,
                contactName: session.user.name || prev.contactName,
                contactEmail: session.user.email || prev.contactEmail,
              }))
            }
          }}
        />
      </div>
    </div>
  )
}