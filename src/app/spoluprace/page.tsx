import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/layout/page-hero"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Check, Mail, TrendingUp, Calendar, Users, BadgeCheck, Sparkles, ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Spolupráce pro prostory | Prostormat",
  description: "Připojte se k největší platformě event prostorů v Praze. Získejte více poptávek na akce, bez provizí z rezervací. Roční předplatné 12 000 Kč + DPH.",
  keywords: ["spolupráce event prostor", "přidat prostor prostormat", "partner prostormat", "registrace event prostor Praha"],
  alternates: {
    canonical: "https://prostormat.cz/spoluprace",
  },
  openGraph: {
    title: "Spolupráce pro prostory | Prostormat",
    description: "Získejte více poptávek na akce z největší platformy v Praze. Bez provizí, transparentní ceny.",
    url: "https://prostormat.cz/spoluprace",
    siteName: "Prostormat",
    locale: "cs_CZ",
    type: "website"
  }
}

export default function SpolupracePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <PageHero
        tone="blue"
        variant="soft"
        size="lg"
        title="Začnete dostávat poptávky na firemní akce, teambuildingy, svatby a více hned."
        subtitle="Připojte se ke stovkám prostorů, které už získávají klienty přes Prostormat"
      />

      {/* Problem Statement */}
      <section className="py-12 px-4 sm:px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
              Hledání nových klientů pro váš event prostor je náročné. Reklama je drahá, výsledky nejisté.
            </p>
            <p className="text-xl text-gray-900 mt-4 font-semibold">
              Prostormat je tady, aby to změnil.... (a teď si říkáš, no jasně a chcete za to určitě 100 tisíc)
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              Proč Prostormat?
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <ScrollReveal delay={100}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 h-full">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Rychlá poptávka = Vaše garance poptávek
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Kvůli naší funkci &quot;Rychlá poptávka&quot; potenciální klient vyplní jeden formulář a jejich poptávka přijde všem prostorům, které splňují jejich kritéria. Jedna poptávka = desítky prostorů, které se prohánějí za klientem. Vy mezi nimi.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 h-full">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Jo a taky máme vyhledávač...
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Samozřejmě vás můžou i najít v našem vyhledávači prostorů. Ale co si budeme povídat... lidi jsou víc a víc líní. Nikdo nechce nic dělat! Proto máme tu rychlou poptávku.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 h-full">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Takže to spadne na vás...
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Dostanete hodně poptávek a potom je to na vás jim odpsat co nejdřív s nabídkou. Rychlost = klíč k úspěchu.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100 h-full">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Garance? Jasná věc.
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Garance že budete mít víc poptávek než teď je víceméně jasná. Bez provizí z rezervací. Vše jde přímo vám.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              Jak to funguje?
            </h2>
          </ScrollReveal>

          <div className="space-y-6">
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Vyplníte žádost</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Formulář zabere 5 minut. Potřebujeme základní informace - název, adresa, kapacita, typ akcí.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Ozveme se vám do 48 hodin</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Probereme společně detaily vašeho profilu, pomůžeme s fotkami a videi, projdeme vybavení a odpovíme na všechny otázky.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Aktivujeme profil a začnou chodit poptávky</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Po zaplacení faktury zpřístupníme váš profil. Začnete dostávat poptávky do dashboardu a emailem.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
              Cože oni chtějí 12 000 Kč?
            </h2>
            <p className="text-center text-gray-700 mb-4 text-xl">
              Aby se vám tahle &quot;investice&quot; nevrátila, to byste museli nikdy na poptávku neodpovědět a nikdy žádnou akci nemít...
            </p>
            <p className="text-center text-gray-900 mb-12 text-xl font-semibold">
              Tohle je fakt skoro zadarmo.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Package */}
            <ScrollReveal delay={100}>
              <div className="bg-white border-2 border-blue-500 rounded-3xl p-8 hover:border-blue-600 transition-all">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Základní balíček</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black text-gray-900">12 000</span>
                    <span className="text-xl text-gray-600 ml-2">Kč + DPH</span>
                  </div>
                  <p className="text-gray-600">za rok</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    'Kompletní profil s fotkami a videi',
                    'Neomezené poptávky od klientů',
                    'Přístup k Event Boardu',
                    'Dashboard pro správu dotazů',
                    'Bez provizí z rezervací'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/pridat-prostor">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg py-6">
                    Přidat prostor
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Top Priority Package - SOLD OUT */}
            <ScrollReveal delay={150}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-3xl p-8 text-white relative opacity-75">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    VYPRODÁNO
                  </span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Top Priority</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black">14 000</span>
                    <span className="text-xl text-gray-300 ml-2">Kč + DPH</span>
                  </div>
                  <p className="text-gray-300">za rok navíc</p>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-gray-200 font-medium mb-4">
                    Vše ze základního balíčku +
                  </p>
                  {[
                    'Top 12 ve vyhledávání',
                    'Doporučený výběr na homepage',
                    'Maximální viditelnost',
                    '+135% poptávek'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button disabled className="w-full bg-gray-700 text-gray-400 cursor-not-allowed">
                  Momentálně nedostupné
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Stačí asi tak jedna akce za 5 let, aby se vám investice vrátila...
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Průměrný příjem z jedné akce? To je na vás, prostě ty ceny napalte!
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <p className="text-lg text-blue-50">
                Roční předplatné <span className="font-bold text-white">12 000 Kč</span>. To je 1 000 Kč měsíčně.
                Za to nedostanete skoro ani normální jídlo v restauraci.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              Často kladené otázky
            </h2>
          </ScrollReveal>

          <div className="space-y-6">
            {[
              {
                question: "Platím provize z rezervací?",
                answer: "Ne. Platíte pouze roční předplatné. Všechny příjmy z akcí jdou přímo vám, bez jakýchkoliv provizí."
              },
              {
                question: "Jak dlouho trvá aktivace?",
                answer: "Ozveme se vám do 48 hodin po vyplnění žádosti. Po dohodě a zaplacení faktury aktivujeme profil obvykle do 1-2 pracovních dnů."
              },
              {
                question: "Co když nemám profesionální fotky?",
                answer: "Pomůžeme vám. Poradíme, jak nafotit prostor na mobil, nebo vám doporučíme fotografa. Hlavní je ukázat prostor v reálném světle."
              },
              {
                question: "Můžu kdykoliv zrušit předplatné?",
                answer: "Ano. Předplatné je roční a není automaticky obnovováno. Před vypršením se ozveme s možností prodloužení. Můžete kdykoli ukončit."
              },
              {
                question: "Jak funguje Priority?",
                answer: "Priority balíčky vás umístí mezi prvními ve vyhledávání. Priority = top 24 pozic (+70% poptávek), Top Priority = top 12 pozic + homepage (+135% poptávek)."
              },
              {
                question: "Co je Event Board?",
                answer: "Event Board je sekce, kde organizátoři zveřejňují požadavky na akce. Můžete prohlížet poptávky a aktivně oslovovat klienty, kteří hledají prostor jako ten váš."
              },
              {
                question: "Dostanu fakturu na firmu?",
                answer: "Ano, samozřejmě. Vystavíme fakturu na vaši firmu s DPH. Akceptujeme běžné platební podmínky."
              }
            ].map((faq, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed pl-7">
                    {faq.answer}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Připraveni začít?
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Přidejte svůj prostor na Prostormat a začněte dostávat poptávky ještě dnes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pridat-prostor">
                <Button size="lg" className="w-full sm:w-auto px-12 py-6 text-lg font-semibold bg-black hover:bg-gray-900 text-white rounded-2xl shadow-lg">
                  Vyplnit žádost
                </Button>
              </Link>
              <Link href="mailto:info@prostormat.cz">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-12 py-6 text-lg font-semibold rounded-2xl border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50">
                  <Mail className="w-5 h-5 mr-2" />
                  info@prostormat.cz
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
