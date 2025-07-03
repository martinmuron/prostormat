"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { ChevronDown, HelpCircle } from "lucide-react"
import { useState } from "react"

const faqData = [
  {
    category: "Základní informace",
    questions: [
      {
        question: "Co je Prostormat?",
        answer: "Prostormat je největší platforma pro hledání event prostorů v Praze. Spojujeme organizátory akcí s majiteli prostorů bez provizí a skrytých poplatků."
      },
      {
        question: "Je používání platformy zdarma?",
        answer: "Pro organizátory akcí je platforma zcela zdarma. Majitelé prostorů platí pouze roční předplatné 9 000 Kč za maximální viditelnost svého prostoru."
      },
      {
        question: "Jak funguje rezervace prostoru?",
        answer: "Prostormat zprostředkovává kontakt mezi organizátory a majiteli prostorů. Samotná rezervace a platba probíhá přímo mezi vámi a majitelem prostoru."
      }
    ]
  },
  {
    category: "Pro organizátory akcí",
    questions: [
      {
        question: "Jak najdu vhodný prostor pro svou akci?",
        answer: "Použijte naše vyhledávání na hlavní stránce nebo procházejte kategorii Prostory. Můžete filtrovat podle kapacity, typu akce, lokace a dalších kritérií."
      },
      {
        question: "Platím nějaké poplatky za zprostředkování?",
        answer: "Ne! Pro organizátory je platforma zcela zdarma. Neúčtujeme žádné provize ani poplatky za zprostředkování kontaktu."
      },
      {
        question: "Mohu zveřejnit požadavek na akci?",
        answer: "Ano, můžete zveřejnit váš požadavek na akci v sekci 'Požadavky na akce'. Majitelé prostorů vás pak mohou kontaktovat přímo."
      },
      {
        question: "Jak dlouho trvá odpověď od majitele prostoru?",
        answer: "Většina majitelů odpovídá do 24 hodin. Pokud nedostanete odpověď do 2 pracovních dnů, doporučujeme kontaktovat další prostory."
      }
    ]
  },
  {
    category: "Pro majitele prostorů",
    questions: [
      {
        question: "Kolik stojí přidání prostoru na platformu?",
        answer: "Roční předplatné stojí 9 000 Kč. Zahrnuje kompletní profil prostoru, neomezené dotazy od klientů a přístup k požadavkům na akce."
      },
      {
        question: "Jak rychle bude můj prostor viditelný?",
        answer: "Po vytvoření profilu a uhrazení předplatného bude váš prostor viditelný okamžitě. Doporučujeme však nejprve kompletně vyplnit všechny informace."
      },
      {
        question: "Mohu upravovat informace o svém prostoru?",
        answer: "Ano, přes váš dashboard můžete kdykoliv upravovat všechny informace, fotografie a dostupnost vašeho prostoru."
      },
      {
        question: "Jak dostávám dotazy od klientů?",
        answer: "Všechny dotazy přijdou na váš email a zároveň je uvidíte ve vašem dashboardu. Můžete odpovídat přímo přes platformu nebo emailem."
      }
    ]
  },
  {
    category: "Technické otázky",
    questions: [
      {
        question: "Podporujete mobilní zařízení?",
        answer: "Ano, celá platforma je optimalizovaná pro mobilní telefony a tablety. Můžete ji používat z jakéhokoliv zařízení."
      },
      {
        question: "Jak mohu změnit své heslo?",
        answer: "Ve vašem dashboardu v sekci Nastavení můžete změnit heslo i ostatní údaje vašeho účtu."
      },
      {
        question: "Co když zapomenu heslo?",
        answer: "Na přihlašovací stránce klikněte na 'Zapomenuté heslo' a na váš email přijdou instrukce pro obnovení."
      }
    ]
  }
]

function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-2xl bg-white hover-lift transition-all duration-300">
      <button
        className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 rounded-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-headline font-semibold text-black pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <div className="px-6 pb-5 animate-slide-up">
          <div className="pt-2 border-t border-gray-100">
            <p className="text-body text-gray-600 leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
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
              <HelpCircle className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Často kladené otázky
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Máte otázky? Najděte odpovědi na nejčastější dotazy o platformě Prostormat.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          {faqData.map((category, categoryIndex) => (
            <ScrollReveal key={category.category} delay={categoryIndex * 100}>
              <div className="mb-16">
                <h2 className="text-title-2 text-black font-bold mb-8 text-center">
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <ScrollReveal key={index} delay={index * 50}>
                      <FAQAccordion question={faq.question} answer={faq.answer} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}

          {/* Contact Section */}
          <ScrollReveal delay={500}>
            <div className="text-center mt-20 p-8 bg-gray-50 rounded-3xl">
              <h3 className="text-title-3 text-black font-bold mb-4">
                Nenašli jste odpověď na svou otázku?
              </h3>
              <p className="text-body text-gray-600 mb-6 max-w-2xl mx-auto">
                Kontaktujte nás přímo a my vám rádi pomůžeme s čímkoliv potřebujete.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:info@prostormat.cz"
                  className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 hover-lift text-headline font-semibold"
                >
                  info@prostormat.cz
                </a>
                <a 
                  href="tel:+420775654639"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-black text-black rounded-2xl hover:bg-black hover:text-white transition-all duration-300 hover-lift text-headline font-semibold"
                >
                  +420 775 654 639
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
} 