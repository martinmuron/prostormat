import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { Mail, Phone, MapPin, Clock, MessageSquare, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
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
              <MessageSquare className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Kontaktujte nás
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Jsme tu pro vás. Máte otázky, návrhy nebo potřebujete pomoc? Neváhejte nás kontaktovat.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <div>
              <ScrollReveal>
                <h2 className="text-title-2 text-black font-bold mb-8">
                  Kontaktní informace
                </h2>
              </ScrollReveal>

              <div className="space-y-8">
                <ScrollReveal delay={100}>
                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover-lift transition-all duration-300">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-headline font-semibold text-black mb-2">Email</h3>
                      <a 
                        href="mailto:info@prostormat.cz" 
                        className="text-body text-gray-600 hover:text-black transition-colors"
                      >
                        info@prostormat.cz
                      </a>
                      <p className="text-callout text-gray-500 mt-1">
                        Odpovídáme do 24 hodin
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover-lift transition-all duration-300">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-headline font-semibold text-black mb-2">Telefon</h3>
                      <a 
                        href="tel:+420775654639" 
                        className="text-body text-gray-600 hover:text-black transition-colors"
                      >
                        +420 775 654 639
                      </a>
                      <p className="text-callout text-gray-500 mt-1">
                        Po - Pá, 9:00 - 17:00
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover-lift transition-all duration-300">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-headline font-semibold text-black mb-2">Sídlo</h3>
                      <p className="text-body text-gray-600">
                        Praha, Česká republika
                      </p>
                      <p className="text-callout text-gray-500 mt-1">
                        Kompletní adresa na vyžádání
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={400}>
                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover-lift transition-all duration-300">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-headline font-semibold text-black mb-2">Otevírací doba</h3>
                      <div className="space-y-1 text-body text-gray-600">
                        <p>Pondělí - Pátek: 9:00 - 17:00</p>
                        <p>Sobota - Neděle: Zavřeno</p>
                      </div>
                      <p className="text-callout text-gray-500 mt-1">
                        Email podporu poskytujeme 24/7
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Quick Contact Buttons */}
              <ScrollReveal delay={500}>
                <div className="mt-12">
                  <h3 className="text-headline font-semibold text-black mb-6">
                    Rychlý kontakt
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="mailto:info@prostormat.cz">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 py-4 bg-black text-white hover:bg-gray-800 rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Napsat email
                      </Button>
                    </a>
                    <a href="tel:+420775654639">
                      <Button 
                        variant="secondary"
                        size="lg" 
                        className="w-full sm:w-auto px-8 py-4 border-2 border-black text-black hover:bg-black hover:text-white rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Zavolat
                      </Button>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form */}
            <div>
              <ScrollReveal>
                <h2 className="text-title-2 text-black font-bold mb-8">
                  Napište nám zprávu
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <form className="space-y-6 bg-gray-50 p-8 rounded-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-callout font-semibold text-black mb-2">
                        Jméno *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        placeholder="Vaše jméno"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-callout font-semibold text-black mb-2">
                        Příjmení *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                        placeholder="Vaše příjmení"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-callout font-semibold text-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                      placeholder="vas@email.cz"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-callout font-semibold text-black mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                      placeholder="+420 xxx xxx xxx"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-callout font-semibold text-black mb-2">
                      Předmět *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body"
                    >
                      <option value="">Vyberte předmět dotazu</option>
                      <option value="general">Obecný dotaz</option>
                      <option value="venue">Dotaz k prostoru</option>
                      <option value="technical">Technická podpora</option>
                      <option value="partnership">Obchodní spolupráce</option>
                      <option value="billing">Fakturace a platby</option>
                      <option value="other">Jiné</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-callout font-semibold text-black mb-2">
                      Zpráva *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-body resize-none"
                      placeholder="Popište váš dotaz nebo požadavek..."
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit"
                      size="lg" 
                      className="w-full px-8 py-4 bg-black text-white hover:bg-gray-800 rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Odeslat zprávu
                    </Button>
                    <p className="text-caption text-gray-500 mt-3 text-center">
                      Odpovídáme obvykle do 24 hodin
                    </p>
                  </div>
                </form>
              </ScrollReveal>
            </div>
          </div>

          {/* FAQ Section */}
          <ScrollReveal delay={600}>
            <div className="mt-20 text-center">
              <h2 className="text-title-2 text-black font-bold mb-6">
                Často kladené otázky
              </h2>
              <p className="text-body text-gray-600 mb-8 max-w-2xl mx-auto">
                Možná najdete odpověď na svou otázku v našich často kladených otázkách
              </p>
              <a href="/casto-kladene-otazky">
                <Button 
                  variant="secondary"
                  size="lg" 
                  className="px-8 py-4 border-2 border-black text-black hover:bg-black hover:text-white rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                >
                  Zobrazit FAQ
                </Button>
              </a>
            </div>
          </ScrollReveal>

          {/* Team Section */}
          <ScrollReveal delay={700}>
            <div className="mt-20 p-8 bg-gray-50 rounded-3xl text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-title-3 text-black font-bold mb-4">
                Náš tým je tu pro vás
              </h3>
              <p className="text-body text-gray-600 mb-6 max-w-2xl mx-auto">
                Jsme tým profesionálů se zkušenostmi v event managementu a technologiích. 
                Naším cílem je usnadnit vám hledání a rezervaci perfektního prostoru pro vaši akci.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/o-nas">
                  <Button 
                    variant="secondary"
                    size="lg" 
                    className="px-8 py-3 border-2 border-black text-black hover:bg-black hover:text-white rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                  >
                    Více o nás
                  </Button>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
} 