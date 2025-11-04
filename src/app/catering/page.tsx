import type { Metadata } from "next"
import { PageHero } from "@/components/layout/page-hero"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"
import { Utensils, Calculator, CheckCircle2, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Catering pro akce v Praze | Prostormat",
  description: "Připravujeme kalkulačku cateringu pro vaše akce. Vyberete si jídlo, nápoje a doplňky a okamžitě získáte cenovou nabídku od našich ověřených cateringových partnerů.",
  keywords: "catering praha, catering pro akce, firemní catering, svatební catering, kalkulačka cateringu, event catering",
  alternates: {
    canonical: "https://prostormat.cz/catering",
  },
  openGraph: {
    title: "Catering pro akce - Připravujeme | Prostormat",
    description: "Brzy připravujeme kalkulačku cateringu. Sestavte si menu na míru a získejte okamžitou cenovou nabídku.",
    url: "https://prostormat.cz/catering",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catering pro akce - Připravujeme | Prostormat",
    description: "Brzy připravujeme kalkulačku cateringu. Sestavte si menu na míru a získejte okamžitou cenovou nabídku.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function CateringPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <PageHero
        tone="emerald"
        variant="soft"
        size="lg"
        eyebrow={
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Připravujeme</span>
          </div>
        }
        title="Catering pro vaše akce"
        subtitle={
          <>
            Brzy připravujeme kalkulačku pro catering na vaše akce, kde vyplníte přesně co potřebujete,
            kolik toho chcete a najdete přesnou cenu. Catering zajistí naši cateringoví partneři.
          </>
        }
      />

      {/* Coming Soon Content */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">

          {/* Main Description */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Catering na míru pro každou akci
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Pracujeme na inteligentní kalkulačce, která vám umožní snadno naplánovat catering
              pro vaši akci. Jednoduše vyberete položky, zadáte počet hostů a okamžitě získáte
              přesnou cenovou nabídku.
            </p>
          </div>

          {/* Features Grid - Coming Soon Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">

            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 relative opacity-80 pointer-events-none">
              <div className="absolute top-4 right-4">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Připravujeme
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 w-fit mb-4">
                <Calculator className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Interaktivní kalkulačka
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Vyberte si z nabídky jídel, nápojů a doplňků. Kalkulačka vám okamžitě zobrazí
                celkovou cenu podle počtu hostů.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 relative opacity-80 pointer-events-none">
              <div className="absolute top-4 right-4">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Připravujeme
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 w-fit mb-4">
                <Utensils className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Ověření partneři
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Spolupracujeme pouze s prověřenými cateringovými společnostmi s dlouholetou
                zkušeností a pozitivními referencemi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 relative opacity-80 pointer-events-none">
              <div className="absolute top-4 right-4">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Připravujeme
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 w-fit mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Okamžitá cenová nabídka
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Žádné čekání na odpověď. Získáte transparentní cenovou nabídku ihned
                po vyplnění kalkulačky.
              </p>
            </div>

          </div>

          {/* What to expect section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 sm:p-12 border border-emerald-100">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center">
                Co můžete očekávat?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Široký výběr menu</h3>
                    <p className="text-gray-700">
                      Od jednoduchých rautů po kompletní gastronomické zážitky
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Flexibilní možnosti</h3>
                    <p className="text-gray-700">
                      Přizpůsobení počtu hostů, speciální diety, vegetariánské nebo veganské menu
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Transparentní ceny</h3>
                    <p className="text-gray-700">
                      Žádné skryté poplatky, vše jasně a srozumitelně
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Profesionální servis</h3>
                    <p className="text-gray-700">
                      Včetně obsluhy, nádobí, ubrousků a dalšího vybavení
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-full">
              <Clock className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">
                Očekávané spuštění: Q2 2025
              </span>
            </div>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
              Máte zájem o catering už teď? Kontaktujte nás na{" "}
              <a href="mailto:info@prostormat.cz" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                info@prostormat.cz
              </a>{" "}
              a rádi vám pomůžeme najít vhodného cateringového partnera.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
