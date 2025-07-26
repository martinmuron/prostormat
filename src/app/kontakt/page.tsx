'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - will be implemented later
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-white opacity-3 rounded-full blur-2xl animate-float-medium"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-white opacity-4 rounded-full blur-3xl animate-float-fast"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-2xl">
              Kontakt
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
              Máte dotaz nebo potřebujete pomoc? Rádi vám pomůžeme!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <ScrollReveal>
              <div className="space-y-8">
                <div>
                  <h2 className="text-title-1 text-black mb-6 font-bold">
                    Spojte se s námi
                  </h2>
                  <p className="text-body text-gray-600 max-w-2xl mx-auto text-lg font-medium">
                    Jsme zde pro vás každý pracovní den. Neváhejte nás kontaktovat 
                    s jakýmkoli dotazem ohledně našich služeb.
                  </p>
                </div>

                <div className="space-y-6">
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

                  {/* Phone */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Telefon</h3>
                      <p className="text-gray-600 mb-2">Zavolejte nám na</p>
                      <a 
                        href="tel:+420775654639"
                        className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                      >
                        +420 775 654 639
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Adresa</h3>
                      <p className="text-gray-600 mb-2">Navštivte nás na adrese</p>
                      <p className="text-gray-900 text-lg leading-relaxed">
                        Placeholder Address 123<br />
                        110 00 Praha 1<br />
                        Česká republika
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Otevírací doba</h3>
                      <p className="text-gray-600 mb-2">Jsme dostupní</p>
                      <p className="text-gray-900 text-lg leading-relaxed">
                        Pondělí - Pátek: 9:00 - 18:00<br />
                        Víkendy: Pouze e-mailem
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
                    className="w-full magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-xl"
                  >
                    Odeslat zprávu
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float-medium" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl sm:text-title-1 text-white mb-6 leading-tight font-bold">
                Často kladené otázky
              </h2>
              <p className="text-lg sm:text-title-3 text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
                Možná najdete odpověď na vaši otázku v našich FAQ
              </p>
              <a
                href="/faq"
                className="magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-xl inline-block"
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