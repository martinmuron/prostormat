import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { Check, Star, Zap, TrendingUp, Mail } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <FloatingShapes />
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Jednoduché ceny<br />
              pro váš prostor
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Bez skrytých poplatků. Bez provizí z rezervací. Pouze roční předplatné 
              za maximální viditelnost vašeho prostoru.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 sm:p-12 hover-lift transition-all duration-300 shadow-xl relative overflow-hidden">
              {/* Subtle background gradient */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-50 to-transparent rounded-full blur-3xl opacity-50" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-title-2 text-black font-bold mb-4">
                    Roční předplatné
                  </h2>
                  <div className="mb-4">
                    <span className="text-5xl sm:text-6xl font-black text-black">9 000</span>
                    <span className="text-title-3 text-gray-600 ml-2">Kč / rok</span>
                  </div>
                  <p className="text-body text-gray-600 font-medium">
                    Kompletní přístup k platformě na celý rok
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-10">
                  {[
                    'Profil prostoru s fotogalerií',
                    'Neomezené dotazy od klientů',
                    'Přístup k požadavkům na akce',
                    'Základní statistiky návštěvnosti',
                    'Email podpora',
                    'Roční platba (žádné měsíční poplatky)'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-body text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/pridat-prostor">
                    <Button 
                      variant="default"
                      size="lg" 
                      className="magnetic-button hover-lift w-full sm:w-auto px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg bg-black text-white hover:bg-gray-800"
                    >
                      Přidat prostor
                    </Button>
                  </Link>
                  <Link href="mailto:info@prostormat.cz">
                    <Button 
                      variant="secondary"
                      size="lg" 
                      className="hover-lift w-full sm:w-auto px-12 py-4 text-lg font-semibold rounded-2xl border-2"
                    >
                      Kontaktovat prodej
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 px-6 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Dodatečné služby
              </h2>
              <p className="text-body text-gray-600 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                Zvyšte viditelnost vašeho prostoru s prémiové funkce spravované přes admin panel
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3">
                  Zvýraznění profilu
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed">
                  Featured listing pro maximální viditelnost ve výsledcích vyhledávání
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3">
                  Prémiové umístění
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed">
                  Prioritní zobrazení ve výsledcích vyhledávání a kategoriích
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3">
                  Propagační možnosti
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed">
                  Dodatečné marketingové nástroje a promotional features
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3">
                  Marketingová podpora
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed">
                  Individuální konzultace a podpora pro rozvoj vašeho prostoru
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={500}>
            <div className="text-center mt-16">
              <p className="text-body text-gray-600 mb-8 max-w-2xl mx-auto">
                Zajímají vás prémiové funkce? Kontaktujte nás pro individuální nabídku.
              </p>
              <Link href="mailto:info@prostormat.cz">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="magnetic-button hover-lift rounded-2xl px-10 py-4 text-lg font-semibold border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  Kontaktovat prodej
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-800 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float-medium" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-title-1 text-white mb-6 leading-tight font-bold">
              Připraveni začít?
            </h2>
            <p className="text-lg sm:text-title-3 text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
              Přidejte svůj prostor na největší platformu event prostorů v Praze
              a začněte získávat nové klienty už dnes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
              <Link href="/pridat-prostor">
                <Button 
                  variant="secondary"
                  size="lg" 
                  className="magnetic-button hover-lift w-full sm:w-auto px-12 py-4 text-lg font-semibold rounded-2xl bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-xl"
                >
                  Přidat prostor
                </Button>
              </Link>
              <Link href="mailto:info@prostormat.cz">
                <Button 
                  size="lg" 
                  className="hover-lift magnetic-button w-full sm:w-auto px-12 py-4 text-lg font-semibold rounded-2xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300"
                >
                  Kontaktovat nás
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}