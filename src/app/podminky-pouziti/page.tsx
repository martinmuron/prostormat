import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { FileText, Calendar } from "lucide-react"

export default function TermsOfUsePage() {
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
              <FileText className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Podmínky použití
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Pravidla a podmínky pro používání platformy Prostormat
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-body text-gray-600 font-medium">Poslední aktualizace: 15. ledna 2024</span>
              </div>
              <p className="text-body text-gray-600 leading-relaxed">
                Tyto podmínky použití upravují vztah mezi vámi a společností Prostormat při používání našich služeb.
              </p>
            </div>
          </ScrollReveal>

          <div className="prose max-w-none">
            <ScrollReveal delay={100}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">1. Základní ustanovení</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Prostormat je online platforma provozovaná společností [Název společnosti], která umožňuje 
                    propojení organizátorů akcí s majiteli event prostorů. Používáním našich služeb souhlasíte 
                    s těmito podmínkami použití.
                  </p>
                  <p>
                    Platforma slouží jako zprostředkovatel kontaktu. Veškeré obchodní vztahy a smlouvy 
                    vznikají přímo mezi organizátory akcí a majiteli prostorů.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">2. Registrace a uživatelské účty</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Pro plné využití služeb je nutná registrace uživatelského účtu. Při registraci se zavazujete 
                    poskytnout pravdivé a aktuální informace.
                  </p>
                  <p>
                    Jste odpovědní za zachování důvěrnosti vašeho hesla a za všechny aktivity, 
                    které se uskuteční pod vaším účtem.
                  </p>
                  <p>
                    V případě podezření na neoprávněné použití vašeho účtu nás prosím okamžitě kontaktujte 
                    na adrese info@prostormat.cz.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">3. Využívání služeb</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Naše služby smíte používat pouze v souladu s těmito podmínkami a platnou legislativou. 
                    Zavazujete se nepoužívat služby k nezákonným nebo nepovoleným účelům.
                  </p>
                  <p>
                    Je zakázáno zveřejňovat nepravdivé, zavádějící nebo nevhodné informace, 
                    porušovat práva třetích stran nebo obtěžovat ostatní uživatele.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">4. Předplatné a platby</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Majitelé prostorů platí roční předplatné ve výši 9 000 Kč za zveřejnění prostoru 
                    na platformě. Cena je uvedena včetně DPH.
                  </p>
                  <p>
                    Předplatné se automaticky obnovuje každý rok, pokud jej nezrušíte alespoň 30 dní 
                    před koncem platného období.
                  </p>
                  <p>
                    V případě zrušení předplatného zůstane váš prostor zveřejněný do konce placeného období.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">5. Autorská práva a duševní vlastnictví</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Veškerý obsah platformy, včetně textu, grafiky, log, ikon a softwaru, 
                    je chráněn autorským právem a jinými právy duševního vlastnictví.
                  </p>
                  <p>
                    Uživatelé si zachovávají práva k obsahu, který na platformu nahrávají, 
                    ale udělují nám licenci k jeho použití v rámci poskytování služeb.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={600}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">6. Omezení odpovědnosti</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Prostormat slouží pouze jako zprostředkovatel kontaktu. Neneseme odpovědnost 
                    za kvalitu prostorů, spolehlivost uživatelů nebo za škody vzniklé v souvislosti 
                    s používáním našich služeb.
                  </p>
                  <p>
                    Veškeré spory mezi organizátory akcí a majiteli prostorů řeší strany přímo mezi sebou. 
                    Prostormat do těchto sporů nezasahuje.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={700}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">7. Ukončení služeb</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Můžeme ukončit nebo pozastavit váš přístup ke službám v případě porušení 
                    těchto podmínek nebo z důvodu technických problémů.
                  </p>
                  <p>
                    Svůj účet můžete kdykoliv zrušit kontaktováním naší zákaznické podpory.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={800}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">8. Změny podmínek</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Tyto podmínky můžeme čas od času aktualizovat. O významných změnách vás 
                    budeme informovat prostřednictvím emailu nebo oznámení na platformě.
                  </p>
                  <p>
                    Pokračováním v používání služeb po změně podmínek vyjadřujete souhlas 
                    s aktualizovanými podmínkami.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={900}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">9. Kontaktní informace</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Máte-li jakékoliv otázky ohledně těchto podmínek použití, 
                    kontaktujte nás na:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="font-semibold text-black mb-2">Prostormat</p>
                    <p>Email: info@prostormat.cz</p>
                    <p>Telefon: +420 775 654 639</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Section */}
          <ScrollReveal delay={1000}>
            <div className="text-center mt-20 p-8 bg-gray-50 rounded-3xl">
              <h3 className="text-title-3 text-black font-bold mb-4">
                Máte otázky k podmínkám použití?
              </h3>
              <p className="text-body text-gray-600 mb-6 max-w-2xl mx-auto">
                Kontaktujte nás a my vám rádi vysvětlíme jakékoliv nejasnosti.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:info@prostormat.cz"
                  className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 hover-lift text-headline font-semibold"
                >
                  Kontaktovat nás
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
} 