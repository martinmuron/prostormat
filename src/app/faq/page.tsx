'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Často kladené otázky
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Najděte odpovědi na nejčastější otázky o ProstorMat
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
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
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nenašli jste odpověď na svou otázku?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Neváhejte nás kontaktovat, rádi vám pomůžeme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@prostormat.cz"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Napsat email
            </a>
            <a
              href="tel:+420775654639"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              Zavolat
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}