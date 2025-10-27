import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PageHero } from "@/components/layout/page-hero"
import { Check, Star, Mail, Sparkles, Image as ImageIcon } from "lucide-react"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"
import { getTopPrioritySoldOut } from "@/lib/site-settings"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Ceník - Prostormat | Transparentní ceny pro event prostory",
  description: "Jednoduché a transparentní ceny za registraci event prostoru v Prostormat. Roční předplatné za 5 900 Kč bez provizí, bez skrytých poplatků. Maximální viditelnost vašeho prostoru.",
  keywords: ["ceník event prostor", "cena registrace", "prostormat ceny", "event prostor Praha cena", "pronájem prostoru tarify"],
  alternates: {
    canonical: "https://prostormat.cz/ceny",
  },
  openGraph: {
    title: "Ceník - Prostormat",
    description: "Jednoduché ceny pro váš prostor. Roční předplatné 5 900 Kč, bez provizí z rezervací.",
    url: "https://prostormat.cz/ceny",
    siteName: "Prostormat",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceník - Prostormat",
    description: "Jednoduché ceny pro váš prostor. Roční předplatné 5 900 Kč, bez provizí z rezervací.",
    images: [DEFAULT_OG_IMAGE]
  }
}

export default async function PricingPage() {
  const topPrioritySoldOut = await getTopPrioritySoldOut()

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
                    'Profil prostoru s fotogalerií',
                    'Neomezené dotazy od klientů',
                    'Přístup k požadavkům na akce',
                    'Přístup do Event Boardu',
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
      <section id="premium" className="py-20 px-4 sm:px-6 bg-gray-50 relative">
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
          {topPrioritySoldOut && (
            <div className="mb-10">
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTitle>Balíček Top Priority je aktuálně vyprodaný</AlertTitle>
                <AlertDescription>
                  Můžete si jej rezervovat do pořadníku – napište nám na <a href="mailto:info@prostormat.cz" className="underline font-medium">info@prostormat.cz</a> a dáme vám vědět hned, jak se uvolní nové místo.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Priority Package */}
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-3xl p-8 hover-lift transition-all duration-300 shadow-lg border border-gray-100 relative overflow-hidden group h-full flex flex-col">
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                    +70 % poptávek
                  </span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-3 text-center">
                  Priority
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed text-center mb-3">
                  Umístění mezi prvními 24 prostory ve vyhledávání (včetně filtrů).
                </p>
                <p className="text-sm text-gray-500 text-center mb-4">Max 24 pozic</p>
                <div className="text-center mb-6">
                  <span className="text-4xl font-black text-black">7 000</span>
                  <span className="text-lg text-gray-600 ml-2">Kč / rok</span>
                </div>
                <div className="mt-auto" />
              </div>
            </ScrollReveal>

            {/* Top Priority Package */}
            <ScrollReveal delay={150}>
              <div className={`bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-3xl p-8 transition-all duration-300 shadow-xl border border-gray-700 relative overflow-hidden group text-white h-full flex flex-col ${topPrioritySoldOut ? "opacity-80" : "hover-lift"}`}>
                {topPrioritySoldOut && (
                  <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden="true" />
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-300 text-black px-3 py-1 rounded-full text-sm font-bold">
                    +135 % poptávek
                  </span>
                </div>
                {topPrioritySoldOut && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      Vyprodáno
                    </Badge>
                  </div>
                )}
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-title-3 font-bold mb-3 text-center">
                  Top Priority
                </h3>
                <p className="text-callout text-gray-200 leading-relaxed text-center mb-3">
                  Umístění mezi prvními 12 prostory ve vyhledávání + doporučený výběr na homepage.
                </p>
                <p className="text-sm text-gray-300 text-center mb-4">Max 12 pozic</p>
                <div className="text-center mb-6">
                  <span className="text-4xl font-black">14 000</span>
                  <span className="text-lg text-gray-300 ml-2">Kč / rok</span>
                </div>
                <div className="mt-auto relative z-10">
                  {topPrioritySoldOut ? (
                    <p className="text-center text-sm text-gray-200">
                      Už máte Top Priority? Napište nám a přidáme vás na waiting list.
                    </p>
                  ) : null}
                </div>
              </div>
            </ScrollReveal>

            {/* AI Packages */}
            <ScrollReveal delay={250}>
              <div className="bg-gray-100 rounded-3xl p-8 border border-gray-200 relative overflow-hidden group h-full flex flex-col text-gray-600 opacity-90 pointer-events-none">
                <div className="absolute top-4 right-4">
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Připravujeme
                  </span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-title-3 font-bold text-gray-700 mb-3 text-center">
                  AI Matching
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed text-center mb-4">
                  Automatické párování poptávek a vyhledávání pomocí AI.
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Prémiové funkce s AI podporou, které brzy spustíme.
                </p>
                <div className="mt-auto" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={280}>
              <div className="bg-gray-100 rounded-3xl p-8 border border-gray-200 relative overflow-hidden group h-full flex flex-col text-gray-600 opacity-90 pointer-events-none">
                <div className="absolute top-4 right-4">
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Připravujeme
                  </span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-title-3 font-bold text-gray-700 mb-3 text-center">
                  AI Visual Event
                </h3>
                <p className="text-callout text-gray-600 leading-relaxed text-center mb-4">
                  Popište svou akci a uvidíte ji přímo v prostoru pomocí AI.
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Prémiové funkce s AI podporou, které brzy spustíme.
                </p>
                <div className="mt-auto" />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={320}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-body text-gray-700 font-medium text-center sm:text-left">
                Všechny prémiové balíčky zahrnují newsletter marketing Prostormat.
              </p>
            </div>
          </ScrollReveal>

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
