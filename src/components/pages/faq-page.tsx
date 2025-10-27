'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PageHero } from "@/components/layout/page-hero"
import { faqSections } from '@/data/faq'

export function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (itemId: string) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(i => i !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="FAQ"
        title="Často kladené otázky"
        subtitle="Najděte odpovědi na nejčastější otázky o Prostormat."
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
                Kompletní průvodce Prostormat pro organizátory i majitele prostorů
              </p>
            </div>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto">
            {faqSections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-12">
                <ScrollReveal delay={sectionIndex * 100}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                    {section.title}
                  </h3>
                </ScrollReveal>

                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => {
                    const itemId = `${sectionIndex}-${itemIndex}`
                    return (
                      <ScrollReveal key={itemId} delay={(sectionIndex * 100) + (itemIndex * 50)}>
                        <div
                          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden hover-lift transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 pr-4">
                              {item.question}
                            </h4>
                            {openItems.includes(itemId) ? (
                              <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {openItems.includes(itemId) && (
                            <div className="px-6 pb-5">
                              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    )
                  })}
                </div>
              </div>
            ))}
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
                  href="/kontakt"
                  className="magnetic-button hover-lift px-10 py-4 text-lg font-semibold rounded-2xl border-2 border-black text-black bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                >
                  Vyplnit formulář
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
