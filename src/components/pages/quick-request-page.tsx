'use client'

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LoginModal } from "@/components/auth/login-modal"
import { LOCATION_OPTIONS } from "@/types"
import { Clock, Send, Zap, CheckCircle } from "lucide-react"
import { PageHero } from "@/components/layout/page-hero"
import { trackGA4BulkFormSubmit } from "@/lib/ga4-tracking"
import { createTrackingContext } from "@/lib/tracking-utils"

interface QuickRequestFormData {
  eventDate: string
  guestCount: string
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

export function QuickRequestPage() {
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [hasPromptedLogin, setHasPromptedLogin] = useState(false)
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  
  const [formData, setFormData] = useState<QuickRequestFormData>({
    eventDate: "",
    guestCount: "",
    locationPreference: "",
    requirements: "",
    contactName: session?.user?.name || "",
    contactEmail: session?.user?.email || "",
    contactPhone: "",
    message: "",
  })

  const [errors, setErrors] = useState<Partial<QuickRequestFormData>>({})

  const promptLoginIfNeeded = () => {
    if (status === 'unauthenticated' && !hasPromptedLogin) {
      setHasPromptedLogin(true)
      setShowLoginModal(true)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      setHasPromptedLogin(false)
      setShowLoginModal(false)
    }
  }, [status])

  const validateForm = () => {
    const newErrors: Partial<QuickRequestFormData> = {}

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

    if (status !== 'authenticated') {
      if (status === 'unauthenticated') {
        promptLoginIfNeeded()
      }
      return
    }
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const tracking = createTrackingContext()
      const response = await fetch('/api/quick-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tracking,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Track bulk form submission in GA4
        trackGA4BulkFormSubmit({
          guest_count: formData.guestCount,
          location: formData.locationPreference,
          tracking,
        })

        setIsSuccess(true)
        setPendingCount(data.pendingCount || 0)
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
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') {
        promptLoginIfNeeded()
      }
      return
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleInputFocus = () => {
    if (status === 'unauthenticated') {
      promptLoginIfNeeded()
    }
  }

  const hero = (
    <PageHero
      eyebrow="Automatické oslovování"
      title="Rychlá poptávka"
      subtitle="Jedním formulářem oslovíte desítky relevantních prostorů. Zadejte preferované parametry a my poptávku rozešleme za vás."
      variant="plain"
      className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-16"
      tone="emerald"
      size="md"
      containerClassName="max-w-4xl mx-auto"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 justify-center sm:justify-start rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Rychlé odeslání</span>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start rounded-2xl border border-blue-200 bg-white/80 px-4 py-3 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Více nabídek najednou</span>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start rounded-2xl border border-orange-200 bg-white/80 px-4 py-3 shadow-sm">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Ušetříte hodně hodně a hodně času!</span>
          </div>
        </div>
      </div>
    </PageHero>
  )

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
              Vaši poptávku jsme přijali a náš tým ji manuálně zkontroluje. 
              Po schválení ji odešleme {pendingCount} vybraným prostorům a potvrdíme vám to emailem.
            </p>
            <p className="text-base text-gray-600 mb-10 max-w-xl mx-auto">
              Současně jsme vaši poptávku zveřejnili na Event Boardu, aby vás mohli kontaktovat i další ověření provozovatelé prostorů.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-xl w-full sm:w-auto">
                  Otevřít můj dashboard
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
      {hero}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
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
                {/* Event Date */}
                <div>
                  <Label htmlFor="eventDate" className="text-sm font-medium text-gray-700 mb-2 block">
                    Datum akce *
                  </Label>
                  <Input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    onFocus={handleInputFocus}
                    className={errors.eventDate ? 'border-red-300' : ''}
                    min={today}
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
                  <input type="hidden" name="guestCount" value={formData.guestCount} />
                  {errors.guestCount && <p className="text-sm text-red-600 mt-1">{errors.guestCount}</p>}
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
                      {LOCATION_OPTIONS.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="locationPreference" value={formData.locationPreference} />
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
                  id="requirements"
                  name="requirements"
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
                  id="message"
                  name="message"
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
                      id="contactName"
                      name="contactName"
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
                      id="contactEmail"
                      name="contactEmail"
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
                      id="contactPhone"
                      name="contactPhone"
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
                <p className="text-xs text-gray-500 text-center mt-2">
                  Odesláním také automaticky vytvoříte poptávku na Event Boardu, aby se vám mohly ozvat další prostory.
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
                contactEmail: session.user.email || prev.contactEmail,
              }))
            }
          }}
        />
      </div>
    </div>
  )
}
