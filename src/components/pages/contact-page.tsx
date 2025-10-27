'use client'

import { useState } from 'react'
import { Mail, MapPin } from 'lucide-react'
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PageHero } from "@/components/layout/page-hero"
import { Button } from "@/components/ui/button"

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Zpráva byla úspěšně odeslána!'
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Došlo k chybě při odesílání zprávy.'
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Došlo k chybě při odesílání zprávy. Zkuste to prosím znovu.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Kontakt"
        title="Jsme připraveni vám pomoci"
        subtitle="Máte dotaz nebo potřebujete pomoc? Ozvěte se a náš tým se vám co nejdříve ozve zpět."
        actions={
          <Button
            asChild
            size="lg"
            className="magnetic-button hover-lift rounded-2xl px-8 py-4 text-base font-semibold shadow-lg bg-black text-white hover:bg-gray-900"
          >
            <a href="mailto:info@prostormat.cz">Napsat email</a>
          </Button>
        }
      />

      {/* Contact Content */}
      <section className="py-16 px-4 sm:px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="space-y-8 mb-12">
              <div className="text-center">
                <h2 className="text-title-1 text-black mb-6 font-bold">
                  Spojte se s námi
                </h2>
                <p className="text-body text-gray-600 max-w-2xl mx-auto text-lg font-medium">
                  Jsme zde pro vás každý pracovní den. Neváhejte nás kontaktovat
                  s jakýmkoli dotazem ohledně našich služeb.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Email */}
                <div className="flex items-start space-x-4 group">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600 mb-2">Napište nám na</p>
                    <a
                      href="mailto:info@prostormat.cz"
                      className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                    >
                      info@prostormat.cz
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4 group">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Sídlo společnosti</h3>
                    <p className="text-gray-600 mb-2">
                      Future Developments s.r.o.
                    </p>
                    <p className="text-gray-600">
                      Rybná 716/24, Staré Město<br />
                      110 00 Praha (virtuální adresa)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal delay={200}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 hover-lift">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Napište nám zprávu
              </h2>
                
                {/* Status Message */}
                {submitStatus.type && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-100 border border-green-400 text-green-700' 
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {submitStatus.message}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Jméno a příjmení
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Vaše jméno"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mailová adresa
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="vas@email.cz"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Předmět
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Předmět zprávy"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Zpráva
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Napište nám vaši zprávu..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-xl ${
                      isSubmitting 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSubmitting ? 'Odesílání...' : 'Odeslat zprávu'}
                  </button>
                </form>
              </div>
            </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gray-50 overflow-hidden border-t border-gray-200">
        <div className="absolute top-12 left-16 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-12 right-20 w-36 h-36 bg-indigo-100/40 rounded-full blur-3xl animate-float-medium" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl sm:text-title-1 text-gray-900 mb-6 leading-tight font-bold">
                Často kladené otázky
              </h2>
              <p className="text-lg sm:text-title-3 text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
                Možná najdete odpověď na vaši otázku v našich FAQ
              </p>
              <a
                href="/faq"
                className="magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl bg-black text-white hover:bg-gray-900 transition-all duration-300 shadow-xl inline-block"
              >
                Zobrazit FAQ
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
