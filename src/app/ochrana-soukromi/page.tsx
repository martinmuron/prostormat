import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { Shield, Calendar } from "lucide-react"

export default function PrivacyPolicyPage() {
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
              <Shield className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Ochrana soukromí
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Jak chráníme vaše osobní údaje a respektujeme vaše soukromí
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-body text-gray-600 font-medium">Poslední aktualizace: 15. ledna 2024</span>
              </div>
              <p className="text-body text-gray-600 leading-relaxed">
                Tato zásada ochrany osobních údajů popisuje, jak Prostormat shromažďuje, používá a chrání vaše osobní údaje.
              </p>
            </div>
          </ScrollReveal>

          <div className="prose max-w-none">
            <ScrollReveal delay={100}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">1. Správce osobních údajů</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Správcem vašich osobních údajů je společnost [Název společnosti], 
                    se sídlem [Adresa], IČO: [IČO], zapsaná v obchodním rejstříku vedeném [Rejstřík].
                  </p>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="font-semibold text-black mb-2">Kontaktní údaje správce:</p>
                    <p>Email: info@prostormat.cz</p>
                    <p>Telefon: +420 775 654 639</p>
                    <p>Adresa: [Adresa společnosti]</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">2. Jaké osobní údaje zpracováváme</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    V závislosti na způsobu využívání našich služeb můžeme zpracovávat následující osobní údaje:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h4 className="font-semibold text-black mb-3">Identifikační údaje</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Jméno a příjmení</li>
                        <li>• Email</li>
                        <li>• Telefonní číslo</li>
                        <li>• Název společnosti</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h4 className="font-semibold text-black mb-3">Technické údaje</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• IP adresa</li>
                        <li>• Údaje o prohlížeči</li>
                        <li>• Cookies</li>
                        <li>• Statistiky návštěv</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">3. Účel zpracování osobních údajů</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>Vaše osobní údaje zpracováváme za následujícími účely:</p>
                  <div className="space-y-6">
                    <div className="border-l-4 border-black pl-6">
                      <h4 className="font-semibold text-black mb-2">Poskytování služeb</h4>
                      <p className="text-sm">
                        Vytvoření a správa uživatelského účtu, zprostředkování kontaktu mezi organizátory 
                        akcí a majiteli prostorů, zasílání dotazů a odpovědí.
                      </p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="font-semibold text-black mb-2">Komunikace</h4>
                      <p className="text-sm">
                        Odpovědi na vaše dotazy, technická podpora, informování o změnách služeb 
                        a zasílání důležitých oznámení.
                      </p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="font-semibold text-black mb-2">Vylepšování služeb</h4>
                      <p className="text-sm">
                        Analýza používání platformy za účelem zlepšování uživatelského zážitku 
                        a vývoje nových funkcí.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">4. Právní základ zpracování</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Vaše osobní údaje zpracováváme na základě následujících právních titulů 
                    podle Nařízení GDPR:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Souhlas</strong> - pro marketingové komunikace a nepovinné služby</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Smlouva</strong> - pro poskytování hlavních služeb platformy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Oprávněný zájem</strong> - pro analýzu a vylepšování služeb</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">5. Sdílení osobních údajů</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Vaše osobní údaje nesdílíme s třetími stranami, kromě následujících případů:
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                    <h4 className="font-semibold text-black mb-2">Důležité upozornění</h4>
                    <p className="text-sm">
                      Při zveřejnění požadavku na akci se vaše kontaktní údaje (jméno, email, telefon) 
                      stanou veřejnými a viditelné pro všechny uživatele platformy včetně majitelů prostorů.
                    </p>
                  </div>
                  <p>
                    Údaje můžeme sdílet také se servisními partnery (hosting, platební služby) 
                    a v případech vyžadovaných zákonem.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={600}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">6. Doba uchovávání údajů</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Osobní údaje uchováváme pouze po dobu nezbytnou pro naplnění účelů zpracování:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h4 className="font-semibold text-black mb-3">Uživatelské účty</h4>
                      <p className="text-sm">Do zrušení účtu nebo 3 roky od poslední aktivity</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h4 className="font-semibold text-black mb-3">Dotazy a komunikace</h4>
                      <p className="text-sm">3 roky od posledního kontaktu</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={700}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">7. Vaše práva</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>V souvislosti se zpracováním osobních údajů máte následující práva:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Právo na přístup k údajům",
                      "Právo na opravu údajů", 
                      "Právo na výmaz údajů",
                      "Právo na omezení zpracování",
                      "Právo na přenositelnost údajů",
                      "Právo vznést námitku",
                      "Právo odvolat souhlas",
                      "Právo podat stížnost na úřad"
                    ].map((right, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="w-2 h-2 bg-black rounded-full flex-shrink-0"></span>
                        <span className="text-sm font-medium">{right}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-4">
                    Pro uplatnění vašich práv nás kontaktujte na email info@prostormat.cz.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={800}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">8. Cookies</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Naše webová stránka používá cookies pro zajištění správného fungování 
                    a vylepšení uživatelského zážitku. Používáme následující typy cookies:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-black mb-1">Nezbytné cookies</h4>
                      <p className="text-sm text-gray-600">Zajišťují základní fungování webu a nelze je odmítnout</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-black mb-1">Analytické cookies</h4>
                      <p className="text-sm text-gray-600">Pomáhají nám pochopit, jak návštěvníci web používají</p>
                    </div>
                  </div>
                  <p className="text-sm">
                    Nastavení cookies můžete kdykoli změnit v nastavení vašeho prohlížeče.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={900}>
              <div className="mb-12">
                <h2 className="text-title-2 text-black font-bold mb-6">9. Kontakt</h2>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    Máte-li jakékoliv otázky ohledně zpracování osobních údajů nebo chcete uplatnit 
                    svá práva, kontaktujte nás:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="font-semibold text-black mb-2">Prostormat - Ochrana osobních údajů</p>
                    <p>Email: info@prostormat.cz</p>
                    <p>Telefon: +420 775 654 639</p>
                    <p>Adresa: [Adresa společnosti]</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Section */}
          <ScrollReveal delay={1000}>
            <div className="text-center mt-20 p-8 bg-gray-50 rounded-3xl">
              <h3 className="text-title-3 text-black font-bold mb-4">
                Máte otázky k ochraně osobních údajů?
              </h3>
              <p className="text-body text-gray-600 mb-6 max-w-2xl mx-auto">
                Kontaktujte nás a my vám rádi zodpovíme všechny dotazy ohledně zpracování vašich údajů.
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