'use client'

import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <section className="relative py-24 px-6 bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl animate-float-medium" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-100/40 rounded-full blur-3xl animate-float-fast" />
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
              Podmínky použití
            </h1>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-title-3 text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
              Pravidla a podmínky používání platformy Prostormat
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Úvodní ustanovení</h2>
                  <p className="text-gray-700 mb-6">
                    Tyto podmínky použití (dále jen &quot;Podmínky&quot;) upravují používání webové platformy Prostormat
                    (dále jen &quot;Platforma&quot;) provozované společností Future Developments s.r.o. (dále jen &quot;Provozovatel&quot;).
                    Používáním Platformy vyjadřujete svůj souhlas s těmito Podmínkami.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Popis služeb</h2>
                  <p className="text-gray-700 mb-6">
                    Prostormat je online platforma, která spojuje organizátory akcí s majiteli prostor. Platforma umožňuje publikovat nabídky,
                    vyhledávat vhodné lokace a komunikovat mezi uživateli. Provozovatel není stranou kontraktů uzavíraných mezi uživateli.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Registrace a uživatelské účty</h2>
                  <p className="text-gray-700 mb-4">
                    Pro plné využití Platformy je nutná registrace. Při registraci je nutné poskytnout správné a aktuální informace.
                    Uživatel je odpovědný za zabezpečení svých přihlašovacích údajů a za všechny aktivity provedené pod svým účtem.
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>Registrace je zdarma pro organizátory akcí</li>
                    <li>Majitelé prostor mohou využívat prémiové funkce za poplatek</li>
                    <li>Jeden uživatel může mít pouze jeden účet</li>
                    <li>Účty nesmí být předávány třetím stranám</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Pravidla používání</h2>
                  <p className="text-gray-700 mb-4">
                    Při používání Platformy se uživatel zavazuje:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li>Poskytovat pravdivé a aktuální informace</li>
                    <li>Respektovat práva jiných uživatelů</li>
                    <li>Nepublikovat nevhodný nebo nezákonný obsah</li>
                    <li>Nepoužívat Platformu k podvodným aktivitám</li>
                    <li>Dodržovat autorská práva a další právní předpisy</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Odpovědnost</h2>
                  <p className="text-gray-700 mb-6">
                    Provozovatel poskytuje Platformu v dostupném stavu a nevydává žádné záruky ohledně její funkčnosti.
                    Provozovatel nenese odpovědnost za škody vzniklé používáním Platformy nebo v souvislosti s kontrakty uzavřenými mezi uživateli.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Platby a poplatky</h2>
                  <p className="text-gray-700 mb-6">
                    Základní používání Platformy je zdarma. Majitelé prostor mohou využívat prémiové funkce za měsíční poplatek.
                    Všechny ceny jsou uvedeny včetně DPH. Platby jsou zpracovávány prostřednictvím zabezpečených platebních bran.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Ukončení služby</h2>
                  <p className="text-gray-700 mb-6">
                    Uživatel může kdykoli ukončit používání Platformy zrušením svého účtu. Provozovatel si vyhrazuje právo ukončit nebo pozastavit přístup uživatele při porušení těchto Podmínek.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Změny podmínek</h2>
                  <p className="text-gray-700 mb-6">
                    Provozovatel si vyhrazuje právo měnit tyto Podmínky. O změnách budou uživatelé informováni e-mailem nebo prostřednictvím Platformy nejméně 30 dní před jejich účinností.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Závěrečná ustanovení</h2>
                  <p className="text-gray-700 mb-4">
                    Tyto Podmínky se řídí právním řádem České republiky. Případné spory budou řešeny před příslušnými soudy České republiky.
                  </p>
                  <p className="text-gray-700 mb-6">
                    Pokud se některé ustanovení těchto Podmínek stane neplatným, ostatní ustanovení zůstávají v platnosti.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 mt-8">
                    <p className="text-gray-600 text-sm">
                      Tyto podmínky použití jsou účinné od 1. ledna 2024.
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Future Developments s.r.o., IČO: 12345678
                    </p>
                    <p className="text-gray-600 text-sm">
                      Adresa: Rybná 716/24, Staré Město, 110 00 Praha (virtuální adresa)
                    </p>
                    <p className="text-gray-600 text-sm">
                      Kontakt: info@prostormat.cz
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

export default TermsOfUsePage
