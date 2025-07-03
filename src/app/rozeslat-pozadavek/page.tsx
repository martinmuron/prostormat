"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { Button } from "@/components/ui/button"
import { Mail, Send, MapPin, Calendar, Users, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

export default function VenueBroadcastPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [venuesCount, setVenuesCount] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    budgetRange: '',
    locationPreference: '',
    requirements: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  })

  // Redirect if not logged in
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/prihlaseni?callbackUrl=/rozeslat-pozadavek")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreviewVenues = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (formData.guestCount) queryParams.append('capacity', formData.guestCount)
      if (formData.locationPreference) queryParams.append('location', formData.locationPreference)
      if (formData.eventType) queryParams.append('type', formData.eventType)
      
      const response = await fetch(`/api/venues/count?${queryParams}`)
      const data = await response.json()
      setVenuesCount(data.count)
    } catch (error) {
      console.error('Error fetching venues count:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/venue-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          title: '',
          description: '',
          eventType: '',
          eventDate: '',
          guestCount: '',
          budgetRange: '',
          locationPreference: '',
          requirements: '',
          contactName: '',
          contactEmail: '',
          contactPhone: ''
        })
        // Redirect to dashboard after success
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting broadcast:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <FloatingShapes />
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 hover-lift">
              <Send className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Rozeslat požadavek prostorům
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Popište svou akci a my automaticky rozešleme váš požadavek všem prostorům, 
              které odpovídají vašim kritériím.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          {submitStatus === 'success' && (
            <ScrollReveal>
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-headline font-semibold text-green-800">Požadavek byl úspěšně odeslán!</h3>
                    <p className="text-body text-green-700 mt-1">
                      Váš požadavek byl rozeslán všem prostorům, které odpovídají vašim kritériím. 
                      Budete přesměrováni na dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {submitStatus === 'error' && (
            <ScrollReveal>
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-headline font-semibold text-red-800">Chyba při odesílání</h3>
                    <p className="text-body text-red-700 mt-1">
                      Došlo k chybě při odesílání požadavku. Zkuste to prosím znovu.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal>
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-3xl p-8">
              <div className="space-y-8">
                
                {/* Basic Event Info */}
                <div>
                  <h2 className="text-title-2 font-bold text-black mb-6">
                    Základní informace o akci
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-callout font-semibold text-black mb-2">
                        Název akce *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        placeholder="Např. Firemní vánoční večírek 2024"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-callout font-semibold text-black mb-2">
                        Popis akce *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body resize-none"
                        placeholder="Popište svou akci, atmosféru, kterou chcete vytvořit, a specifické požadavky..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="eventType" className="block text-callout font-semibold text-black mb-2">
                          Typ akce *
                        </label>
                        <select
                          id="eventType"
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        >
                          <option value="">Vyberte typ akce</option>
                          <option value="firemni-akce">Firemní akce</option>
                          <option value="teambuilding">Teambuilding</option>
                          <option value="svatba">Svatba</option>
                          <option value="narozeniny">Narozeniny</option>
                          <option value="konference">Konference</option>
                          <option value="workshop">Workshop</option>
                          <option value="soukroma-akce">Soukromá akce</option>
                          <option value="jine">Jiné</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="eventDate" className="block text-callout font-semibold text-black mb-2">
                          Datum akce
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h2 className="text-title-2 font-bold text-black mb-6">
                    Detaily akce
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="guestCount" className="block text-callout font-semibold text-black mb-2">
                        Počet hostů
                      </label>
                      <input
                        type="number"
                        id="guestCount"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        placeholder="Počet hostů"
                      />
                    </div>

                    <div>
                      <label htmlFor="budgetRange" className="block text-callout font-semibold text-black mb-2">
                        Rozpočet
                      </label>
                      <select
                        id="budgetRange"
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                      >
                        <option value="">Vyberte rozpočet</option>
                        <option value="do-10000">Do 10 000 Kč</option>
                        <option value="10000-25000">10 000 - 25 000 Kč</option>
                        <option value="25000-50000">25 000 - 50 000 Kč</option>
                        <option value="50000-100000">50 000 - 100 000 Kč</option>
                        <option value="nad-100000">Nad 100 000 Kč</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="locationPreference" className="block text-callout font-semibold text-black mb-2">
                      Preferovaná lokalita
                    </label>
                    <select
                      id="locationPreference"
                      name="locationPreference"
                      value={formData.locationPreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                    >
                      <option value="">Všechny lokality</option>
                      <option value="praha-1">Praha 1</option>
                      <option value="praha-2">Praha 2</option>
                      <option value="praha-3">Praha 3</option>
                      <option value="praha-4">Praha 4</option>
                      <option value="praha-5">Praha 5</option>
                      <option value="praha-6">Praha 6</option>
                      <option value="praha-7">Praha 7</option>
                      <option value="praha-8">Praha 8</option>
                      <option value="praha-9">Praha 9</option>
                      <option value="praha-10">Praha 10</option>
                    </select>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="requirements" className="block text-callout font-semibold text-black mb-2">
                      Speciální požadavky
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body resize-none"
                      placeholder="Catering, technika, parking, bezbariérovost, atd..."
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h2 className="text-title-2 font-bold text-black mb-6">
                    Kontaktní údaje
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contactName" className="block text-callout font-semibold text-black mb-2">
                        Jméno kontaktní osoby *
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        placeholder="Vaše jméno"
                      />
                    </div>

                    <div>
                      <label htmlFor="contactPhone" className="block text-callout font-semibold text-black mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        placeholder="+420 xxx xxx xxx"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="contactEmail" className="block text-callout font-semibold text-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                      placeholder="vas@email.cz"
                    />
                  </div>
                </div>

                {/* Preview and Submit */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="text-center sm:text-left">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handlePreviewVenues}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-xl text-body font-semibold transition-all duration-300"
                      >
                        Zobrazit počet prostorů
                      </Button>
                      {venuesCount !== null && (
                        <p className="text-callout text-gray-600 mt-2">
                          Váš požadavek bude odeslán {venuesCount} prostorům
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="px-12 py-4 bg-black text-white hover:bg-gray-800 rounded-2xl text-headline font-semibold hover-lift transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Odesílám...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Rozeslat požadavek
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </ScrollReveal>

          {/* Info Section */}
          <ScrollReveal delay={100}>
            <div className="mt-16 p-8 bg-blue-50 rounded-3xl">
              <h3 className="text-title-3 font-bold text-black mb-4">
                Jak to funguje?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-body text-gray-700">
                    Vyplníte formulář s detaily vaší akce
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-body text-gray-700">
                    Systém automaticky najde vhodné prostory
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-body text-gray-700">
                    Majitelé prostorů vás kontaktují přímo
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
} 