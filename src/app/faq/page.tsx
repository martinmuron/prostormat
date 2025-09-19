'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PageHero } from "@/components/layout/page-hero"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "Jak funguje ProstorMat?",
    answer: "ProstorMat je platforma, která spojuje organizátory akcí s majiteli prostor. Můžete si prohlédnout dostupné prostory, odeslat poptávku a přímo komunikovat s majiteli prostor."
  },
  {
    question: "Je registrace zdarma?",
    answer: "Ano, registrace na ProstorMat je zcela zdarma pro organizátory akcí. Poplatky platí pouze majitelé prostor za prémiové funkce."
  },
  {
    question: "Jak mohu přidat svůj prostor?",
    answer: "Po registraci klikněte na 'Přidat prostor' v hlavním menu. Vyplňte všechny potřebné informace o vašem prostoru včetně fotografií a kontaktních údajů."
  },
  {
    question: "Jaké typy akcí podporujete?",
    answer: "Podporujeme širokou škálu akcí včetně firemních akcí, teambuilding aktivit, svateb, soukromých oslav, konferencí a dalších společenských událostí."
  },
  {
    question: "Jak probíhá rezervace prostoru?",
    answer: "Po nalezení vhodného prostoru odešlete poptávku majiteli. Majitel prostoru vás kontaktuje a dohodnete se na detailech rezervace přímo s ním."
  },
  {
    question: "Jsou nějaké skryté poplatky?",
    answer: "Ne, ProstorMat neúčtuje žádné skryté poplatky. Všechny náklady jsou transparentní a dohodnete si je přímo s majitelem prostoru."
  },
  {
    question: "Mohu zrušit svou poptávku?",
    answer: "Ano, můžete zrušit svou poptávku kdykoli před potvrzením rezervace. Po potvrzení se řiďte podmínkami zrušení dohodnutými s majitelem prostoru."
  },
  {
    question: "Jak mohu kontaktovat podporu?",
    answer: "Můžete nás kontaktovat na email info@prostormat.cz nebo zavolat na +420 775 654 639. Jsme tu pro vás každý pracovní den od 9:00 do 18:00."
  },
  {
    question: "Můžu upravit svůj profil prostoru?",
    answer: "Ano, jako majitel prostoru můžete kdykoli upravit informace o vašem prostoru, včetně fotografií, popisu, ceny a dostupnosti."
  },
  {
    question: "Jak dlouho trvá schválení prostoru?",
    answer: "Schválení nového prostoru obvykle trvá 24-48 hodin. Náš tým zkontroluje všechny informace a fotografie před zveřejněním."
  }
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="FAQ"
        title="Často kladené otázky"
        subtitle="Najděte odpovědi na nejčastější otázky o ProstorMat."
      />

      {/* FAQ Content */}
      <section className="py-20 px-4 sm:px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Nejčastější dotazy
              </h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto text-lg font-medium">
                Vše co potřebujete vědět o využívání ProstorMat
              </p>
            </div>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <ScrollReveal key={index} delay={index * 50}>
                  <div 
                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden hover-lift transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {openItems.includes(index) && (
                      <div className="px-6 pb-5">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-20 px-4 sm:px-6 bg-gray-50 overflow-hidden border-t border-gray-200">
        <div className="absolute top-12 left-16 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-12 right-20 w-36 h-36 bg-purple-100/40 rounded-full blur-3xl animate-float-medium" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl sm:text-title-1 text-gray-900 mb-6 leading-tight font-bold">
                Nenašli jste odpověď na svou otázku?
              </h2>
              <p className="text-lg sm:text-title-3 text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
                Neváhejte nás kontaktovat, rádi vám pomůžeme
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
                <a
                  href="mailto:info@prostormat.cz"
                  className="magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl bg-black text-white hover:bg-gray-900 transition-all duration-300 shadow-xl"
                >
                  Napsat email
                </a>
                <a
                  href="tel:+420775654639"
                  className="magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl border-2 border-black text-black bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                >
                  Zavolat
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
