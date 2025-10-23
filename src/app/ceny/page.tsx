import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PageHero } from "@/components/layout/page-hero"
import { Check, Star, Mail } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Ceník"
        title={
          <>
            Jednoduché ceny
            <br className="hidden sm:block" /> pro váš prostor
          </>
        }
        subtitle="Bez skrytých poplatků. Bez provizí z rezervací. Pouze roční předplatné za maximální viditelnost vašeho prostoru."
      />

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 bg-white relative">
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
                    <span className="text-5xl sm:text-6xl font-black text-black">12 000</span>
                    <span className="text-title-3 text-gray-600 ml-2">Kč / rok</span>
                  </div>
                  <p className="text-body text-gray-600 font-medium">
                    Kompletní přístup k platformě na celý rok
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-10">
                  {[
                    'Profesionální promo video vaší lokace (zdarma v rámci ročního plánu)',
                    'Profil prostoru s fotogalerií',
                    'Neomezené dotazy od klientů',
                    'Přístup k požadavkům na akce',
                    'Základní statistiky návštěvnosti',
                    'Email podpora',
                    'Automatické obnovení každý rok',
                    'Zrušení kdykoliv bez sankcí'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-body text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Subscription Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-2xl">🔄</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Automatické obnovení</h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Předplatné se automaticky obnoví každý rok, aby váš prostor zůstal vždy viditelný.
                        Můžete kdykoliv zrušit v nastavení vašeho účtu bez jakýchkoliv sankcí nebo poplatků.
                      </p>
                    </div>
                  </div>
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

      {/* Premium Packages Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Prémiové balíčky viditelnosti
              </h2>
              <p className="text-body text-gray-600 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                Zvyšte viditelnost vašeho prostoru a získejte až o 90% více poptávek
              </p>
            </div>
          </ScrollReveal>

          {/* Premium Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Priority Package */}
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 relative overflow-hidden group h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3 text-center">
                  Priority
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed text-center mb-6">
                  Umístění mezi prvními 84 prostory ve výpisu
                </p>
                <div className="text-center mb-6">
                  <span className="text-4xl font-black text-black">2 200</span>
                  <span className="text-lg text-gray-600 ml-2">Kč / měsíc</span>
                </div>
                <div className="mt-auto" />
              </div>
            </ScrollReveal>

            {/* Cover Package */}
            <ScrollReveal delay={200}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 relative overflow-hidden group h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3 text-center">
                  Cover
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed text-center mb-6">
                  Foto a odkaz na hlavní stránce. Fotografie podléhá schválení.
                </p>
                <div className="text-center mb-6">
                  <span className="text-4xl font-black text-black">10 400</span>
                  <span className="text-lg text-gray-600 ml-2">Kč / měsíc</span>
                </div>
                <div className="mt-auto" />
              </div>
            </ScrollReveal>

            {/* Homepage + Top Priority Combo */}
            <ScrollReveal delay={300}>
              <div className="bg-gradient-to-br from-black to-gray-800 rounded-3xl p-8 hover-lift transition-all duration-300 shadow-xl border border-gray-700 relative overflow-hidden group text-white h-full flex flex-col">
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    NEJLEPŠÍ HODNOTA
                  </span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-title-3 font-bold mb-3 text-center">
                  Homepage + Top Priority
                </h3>
                <p className="text-callout text-gray-200 leading-relaxed text-center mb-4">
                  Výhodné kombo umístění na homepage i ve výpisu na předních pozicích
                </p>
                <div className="text-center mb-2">
                  <span className="text-4xl font-black">12 700</span>
                  <span className="text-lg text-gray-300 ml-2">Kč / měsíc</span>
                </div>
                <p className="text-sm text-gray-300 text-center mb-2">
                  Nebo 3 700 Kč/týden
                </p>
                <p className="text-sm text-gray-400 line-through text-center mb-2">
                  Běžná cena: 14 100 Kč
                </p>
                <p className="text-sm font-semibold text-yellow-400 text-center mb-6">
                  Úspora 1 400 Kč měsíčně
                </p>
                <div className="mt-auto" />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
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
      <section className="relative py-20 px-4 sm:px-6 bg-gray-50 overflow-hidden border-t border-gray-200">
        <div className="absolute top-12 left-16 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-12 right-20 w-36 h-36 bg-indigo-100/40 rounded-full blur-3xl animate-float-medium" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-title-1 text-gray-900 mb-6 leading-tight font-bold">
              Připraveni začít?
            </h2>
            <p className="text-lg sm:text-title-3 text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
              Přidejte svůj prostor na největší platformu event prostorů v Praze
              a začněte získávat nové klienty už dnes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
              <Link href="/pridat-prostor">
                <Button 
                  variant="default"
                  size="lg" 
                  className="magnetic-button hover-lift w-full sm:w-auto px-12 py-4 text-lg font-semibold rounded-2xl bg-black text-white hover:bg-gray-900 transition-all duration-300 shadow-xl"
                >
                  Přidat prostor
                </Button>
              </Link>
              <Link href="mailto:info@prostormat.cz">
                <Button 
                  size="lg" 
                  className="hover-lift magnetic-button w-full sm:w-auto px-12 py-4 text-lg font-semibold rounded-2xl border-2 border-black text-black bg-transparent hover:bg-black hover:text-white transition-all duration-300"
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
