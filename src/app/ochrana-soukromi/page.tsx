export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Ochrana soukromí
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Jak zpracováváme a chráníme vaše osobní údaje
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Úvodní informace</h2>
              <p className="text-gray-700 mb-6">
                Tato zásada ochrany osobních údajů (dále jen "Zásada") informuje o tom, 
                jakým způsobem společnost ProstorMat s.r.o. (dále jen "Správce") zpracovává 
                osobní údaje uživatelů platformy ProstorMat v souladu s nařízením GDPR 
                a zákonem o ochraně osobních údajů.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Správce osobních údajů</h2>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-gray-700 mb-2"><strong>ProstorMat s.r.o.</strong></p>
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
                <li><strong>Identifikační údaje:</strong> jméno, příjmení, e-mailová adresa</li>
                <li><strong>Kontaktní údaje:</strong> telefon, adresa (pro majitele prostor)</li>
                <li><strong>Účetní údaje:</strong> fakturační adresa, IČO, DIČ</li>
                <li><strong>Technické údaje:</strong> IP adresa, cookies, údaje o prohlížeči</li>
                <li><strong>Údaje o užívání:</strong> log návštěv, interakce s platformou</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Účel zpracování</h2>
              <p className="text-gray-700 mb-4">
                Osobní údaje zpracováváme za následujícími účely:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Provozování a správa platformy ProstorMat</li>
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
                <li><strong>Smlouvy:</strong> pro poskytování služeb platformy</li>
                <li><strong>Oprávněného zájmu:</strong> pro analýzu a zlepšování služeb</li>
                <li><strong>Souhlasu:</strong> pro marketingovou komunikaci</li>
                <li><strong>Právní povinnosti:</strong> pro vedení účetnictví a daňové povinnosti</li>
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
                Implementujeme vhodná technická a organizační opatření k ochraně 
                osobních údajů před neoprávněným přístupem, změnou, zničením nebo 
                ztrátou. Používáme šifrované spojení (SSL/TLS) a pravidelně 
                aktualizujeme bezpečnostní opatření.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Cookies</h2>
              <p className="text-gray-700 mb-6">
                Naše webová stránka používá cookies pro zlepšení funkčnosti a 
                uživatelského zážitku. Podrobné informace o používání cookies 
                naleznete v naší Cookie Policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Změny zásad</h2>
              <p className="text-gray-700 mb-6">
                Tyto zásady můžeme aktualizovat. O významných změnách vás budeme 
                informovat e-mailem nebo prostřednictvím platformy.
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
        </div>
      </div>
    </div>
  )
}