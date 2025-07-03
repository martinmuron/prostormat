import Image from 'next/image'
import { CheckCircleIcon, UserGroupIcon, BuildingOfficeIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function AboutUsPage() {
  const values = [
    {
      icon: CheckCircleIcon,
      title: "Kvalita",
      description: "Pečlivě prověřujeme všechny prostory a zajišťujeme vysokou kvalitu služeb."
    },
    {
      icon: UserGroupIcon,
      title: "Komunita",
      description: "Budujeme komunitu lidí, kteří sdílejí lásku k pěkným prostorům a akcím."
    },
    {
      icon: BuildingOfficeIcon,
      title: "Různorodost",
      description: "Nabízíme široký výběr prostor pro každý typ akce a rozpočet."
    },
    {
      icon: SparklesIcon,
      title: "Inovace",
      description: "Neustále vylepšujeme naše služby a technologie pro lepší uživatelský zážitek."
    }
  ]

  const stats = [
    { number: "500+", label: "Prostor v databázi" },
    { number: "1000+", label: "Spokojených klientů" },
    { number: "50+", label: "Měst po celé ČR" },
    { number: "24/7", label: "Podpora" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            O nás
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Spojujeme organizátory akcí s majiteli prostor už od roku 2023
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Naše mise
            </h2>
            <p className="text-xl text-gray-600">
              Zjednodušujeme hledání a rezervaci prostor pro vaše akce
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-16">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              ProstorMat vznikl z potřeby zjednodušit proces hledání a rezervace prostor pro různé typy akcí. 
              Uvědomili jsme si, jak náročné může být najít ten správný prostor pro firemní akci, svatbu, 
              teambuilding nebo soukromou oslavu.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Naší vizí je vytvořit největší a nejkvalitnější databázi prostor v České republice, 
              kde se organizátoři akcí setkají s majiteli prostor v přátelském a profesionálním prostředí.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Věříme, že každá akce si zaslouží perfektní prostor, a my jsme zde, 
              abychom vám pomohli ho najít.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              ProstorMat v číslech
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Naše hodnoty
            </h2>
            <p className="text-xl text-gray-600">
              Principy, kterými se řídíme při budování ProstorMat
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Náš tým
              </h2>
              <p className="text-xl text-gray-600">
                Lidé, kteří stojí za ProstorMat
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Founder */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">JN</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Jan Novák
                </h3>
                <p className="text-blue-600 font-semibold mb-4">
                  Zakladatel & CEO
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Jan má více než 10 let zkušeností v oblasti event managementu 
                  a technologických startupů. Rozhodl se vytvořit ProstorMat poté, 
                  co sám zažil frustraci z hledání vhodných prostor pro firemní akce.
                </p>
              </div>

              {/* Co-founder */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">MK</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Marie Krásná
                </h3>
                <p className="text-blue-600 font-semibold mb-4">
                  Spoluzakladatelka & CTO
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Marie je zkušená vývojářka s láskou k čistému kódu a uživatelskému 
                  zážitku. Zodpovídá za technickou stránku ProstorMat a neustále 
                  vylepšuje platformu pro naše uživatele.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Chcete se dozvědět více?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Neváhejte nás kontaktovat s jakýmkoli dotazem nebo návrhem
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/kontakt"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Kontaktovat nás
            </a>
            <a
              href="mailto:info@prostormat.cz"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              Napsat e-mail
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}