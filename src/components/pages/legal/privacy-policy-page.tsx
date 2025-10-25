'use client'

import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <section className="relative py-24 px-6 bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl animate-float-medium" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl animate-float-fast" />
        </div>

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <h1 className="text-display text-gray-900 mb-6 font-black tracking-tight">
              Ochrana soukromí
            </h1>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-title-3 text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
              Jak zpracováváme a chráníme vaše osobní údaje
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="prose prose-lg max-w-none">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 hover-lift">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Úvodní informace</h2>
                  <p className="text-gray-700 mb-6">
                    Tato zásada ochrany osobních údajů (dále jen &quot;Zásada&quot;) informuje o tom,
                    jakým způsobem společnost Future Developments s.r.o. (dále jen &quot;Správce&quot;) zpracovává
                    osobní údaje uživatelů platformy Prostormat v souladu s nařízením GDPR a zákonem o ochraně osobních údajů.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Správce osobních údajů</h2>
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <p className="text-gray-700 mb-2">
                      <strong>Future Developments s.r.o.</strong>
                    </p>
                    <p className="text-gray-700 mb-2">IČO: 12345678</p>
                    <p className="text-gray-700 mb-2">Adresa: Placeholder Address, 110 00 Praha 1</p>
                    <p className="text-gray-700 mb-2">Email: info@prostormat.cz</p>
                    <p className="text-gray-700">Telefon: +420 775 654 639</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Jaké osobní údaje zpracováváme</h2>
                  <p className="text-gray-700 mb-4">
                    Zpracováváme následující kategorie osobních údajů:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>
                      <strong>Identifikační údaje:</strong> jméno, příjmení, e-mailová adresa
                    </li>
                    <li>
                      <strong>Kontaktní údaje:</strong> telefon, adresa (pro majitele prostor)
                    </li>
                    <li>
                      <strong>Účetní údaje:</strong> fakturační adresa, IČO, DIČ
                    </li>
                    <li>
                      <strong>Technické údaje:</strong> IP adresa, cookies, údaje o prohlížeči
                    </li>
                    <li>
                      <strong>Údaje o užívání:</strong> log návštěv, interakce s platformou
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Účel zpracování</h2>
                  <p className="text-gray-700 mb-4">
                    Osobní údaje zpracováváme za následujícími účely:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>Provozování a správa platformy Prostormat</li>
                    <li>Registrace a správa uživatelských účtů</li>
                    <li>Komunikace s uživateli a zákaznická podpora</li>
                    <li>Zpracování plateb a fakturace</li>
                    <li>Marketingová komunikace (se souhlasem)</li>
                    <li>Analýza a zlepšování našich služeb</li>
                    <li>Plnění právních povinností</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Právní základ zpracování</h2>
                  <p className="text-gray-700 mb-4">
                    Osobní údaje zpracováváme na základě:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>
                      <strong>Smlouvy:</strong> pro poskytování služeb platformy
                    </li>
                    <li>
                      <strong>Oprávněného zájmu:</strong> pro analýzu a zlepšování služeb
                    </li>
                    <li>
                      <strong>Souhlasu:</strong> pro marketingovou komunikaci
                    </li>
                    <li>
                      <strong>Právní povinnosti:</strong> pro vedení účetnictví a daňové povinnosti
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Předávání třetím stranám</h2>
                  <p className="text-gray-700 mb-4">
                    Osobní údaje můžeme předávat:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>Poskytovatelům IT služeb a cloudových řešení</li>
                    <li>Platebním společnostem pro zpracování plateb</li>
                    <li>Účetním a daňovým poradcům</li>
                    <li>Orgánům veřejné moci (je-li to zákonem požadováno)</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Doba zpracování</h2>
                  <p className="text-gray-700 mb-4">
                    Osobní údaje zpracováváme po dobu:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>Trvání uživatelského účtu a dalších 3 roky po jeho zrušení</li>
                    <li>Po dobu stanovenou právními předpisy (např. 10 let pro účetní doklady)</li>
                    <li>Do odvolání souhlasu (u marketingové komunikace)</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Vaše práva</h2>
                  <p className="text-gray-700 mb-4">
                    Jako subjekt údajů máte právo:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>Na přístup k osobním údajům</li>
                    <li>Na opravu nepřesných údajů</li>
                    <li>Na výmaz údajů (právo být zapomenut)</li>
                    <li>Na omezení zpracování</li>
                    <li>Na přenositelnost údajů</li>
                    <li>Vznést námitku proti zpracování</li>
                    <li>Odvolat souhlas</li>
                    <li>Podat stížnost u dozorového úřadu</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Bezpečnost údajů</h2>
                  <p className="text-gray-700 mb-6">
                    Implementujeme vhodná technická a organizační opatření k ochraně osobních údajů před neoprávněným přístupem,
                    změnou, zničením nebo ztrátou. Používáme šifrované spojení (SSL/TLS) a pravidelně aktualizujeme bezpečnostní opatření.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Cookies</h2>
                  <p className="text-gray-700 mb-6">
                    Naše webová stránka používá cookies pro zlepšení funkčnosti a uživatelského zážitku. Podrobné informace naleznete v naší Cookie Policy.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Změny zásad</h2>
                  <p className="text-gray-700 mb-6">
                    Tyto zásady můžeme aktualizovat. O významných změnách vás budeme informovat e-mailem nebo prostřednictvím platformy.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 mt-8">
                    <p className="text-gray-600 text-sm">
                      Tyto zásady ochrany osobních údajů jsou účinné od 1. ledna 2024.
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Pro dotazy ohledně zpracování osobních údajů nás kontaktujte na:
                      <a href="mailto:info@prostormat.cz" className="text-blue-600 hover:underline ml-1">
                        info@prostormat.cz
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
