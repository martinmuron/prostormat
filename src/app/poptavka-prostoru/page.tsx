'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface BroadcastFormData {
  title: string
  description: string
  eventType: string
  eventDate: string
  guestCount: number | ''
  budgetRange: string
  locationPreference: string
  requirements: string
  contactEmail: string
  contactPhone: string
  contactName: string
}

export default function VenueBroadcastPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BroadcastFormData>({
    title: '',
    description: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    budgetRange: '',
    locationPreference: '',
    requirements: '',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    contactName: session?.user?.name || ''
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/prihlaseni')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/venue-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard?tab=broadcasts')
      } else {
        alert('Chyba při odesílání poptávky. Zkuste to prosím znovu.')
      }
    } catch (error) {
      alert('Chyba při odesílání poptávky. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guestCount' ? (value === '' ? '' : parseInt(value)) : value
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Poptávka prostor
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Popište svou akci a my ji pošleme vhodným prostorům
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Název akce *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Např. Firemní vánoční večírek"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Popis akce *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Popište detailně svou akci, atmosféru, kterou chcete vytvořit..."
                />
              </div>

              {/* Event Type */}
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Typ akce *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Vyberte typ akce</option>
                  <option value="firemni-akce">Firemní akce</option>
                  <option value="teambuilding">Teambuilding</option>
                  <option value="svatba">Svatba</option>
                  <option value="soukroma-akce">Soukromá akce</option>
                  <option value="konference">Konference</option>
                  <option value="workshop">Workshop</option>
                  <option value="oslava">Oslava</option>
                  <option value="jine">Jiné</option>
                </select>
              </div>

              {/* Event Date and Guest Count */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Datum akce
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                    Počet hostů
                  </label>
                  <input
                    type="number"
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Přibližný počet hostů"
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
                  Rozpočet
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Vyberte rozpočet</option>
                  <option value="do-10000">Do 10 000 Kč</option>
                  <option value="10000-25000">10 000 - 25 000 Kč</option>
                  <option value="25000-50000">25 000 - 50 000 Kč</option>
                  <option value="50000-100000">50 000 - 100 000 Kč</option>
                  <option value="nad-100000">Nad 100 000 Kč</option>
                </select>
              </div>

              {/* Location Preference */}
              <div>
                <label htmlFor="locationPreference" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferovaná lokalita
                </label>
                <input
                  type="text"
                  id="locationPreference"
                  name="locationPreference"
                  value={formData.locationPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Např. Praha 1, Brno centrum, Ostrava..."
                />
              </div>

              {/* Requirements */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Speciální požadavky
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Parking, klimatizace, projektor, catering možnosti..."
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Kontaktní informace
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Jméno a příjmení *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Vaše jméno"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+420 775 654 639"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="vas@email.cz"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {isSubmitting ? 'Odesílám...' : 'Odeslat poptávku prostorům'}
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Vaše poptávka bude odeslána pouze prostorům, které odpovídají vašim kritériím.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}