import type { Metadata } from "next"
import { PageHero } from "@/components/layout/page-hero"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { ServicesForm } from "@/components/pages/services-form"
import { Check, Calendar } from "lucide-react"
import { generateServiceSchema, generateServiceListSchema, schemaToJsonLd } from "@/lib/schema-markup"

export const metadata: Metadata = {
  title: "Služby pro eventy | Prostormat",
  description: "Nabízíte služby pro firemní akce, teambuildingy a svatby? Přidejte se zdarma na Prostormat. Spouštíme 10. 12. 2025.",
  keywords: [
    "služby pro eventy",
    "catering firemní akce",
    "služby teambuilding",
    "eventové služby Praha",
    "svatební služby",
    "organizace akcí služby",
    "dodavatelé pro eventy"
  ],
  alternates: {
    canonical: "https://prostormat.cz/sluzby",
  },
  openGraph: {
    title: "Služby pro eventy | Prostormat",
    description: "Nabízíte služby pro firemní akce, teambuildingy a svatby? Přidejte se zdarma na Prostormat. Spouštíme 10. 12. 2025.",
    url: "https://prostormat.cz/sluzby",
    siteName: "Prostormat",
    locale: "cs_CZ",
    type: "website",
    images: [
      {
        url: "https://prostormat.cz/images/prostormat_sharing.jpg",
        width: 1200,
        height: 630,
        alt: "Prostormat - Služby pro eventy"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Služby pro eventy | Prostormat",
    description: "Nabízíte služby pro firemní akce, teambuildingy a svatby? Přidejte se zdarma na Prostormat.",
    images: ["https://prostormat.cz/images/prostormat_sharing.jpg"],
  }
}

// Service categories offered through the platform
const SERVICE_CATEGORIES = [
  { name: "Catering", description: "Cateringové služby pro firemní akce, konference a svatby" },
  { name: "Technika a AV", description: "Ozvučení, osvětlení a audiovizuální technika pro eventy" },
  { name: "Dekorace a florista", description: "Květinové aranžmá a dekorace pro slavnostní příležitosti" },
  { name: "Fotograf a kameraman", description: "Profesionální foto a video dokumentace akcí" },
  { name: "Moderátor a DJ", description: "Moderátorské služby a hudební doprovod" },
  { name: "Koordinace a plánování", description: "Organizace a koordinace eventů na klíč" },
]

export default function SluzbyPage() {
  const serviceSchema = generateServiceSchema({
    name: "Služby pro eventy",
    description: "Nabízíte služby pro firemní akce, teambuildingy a svatby? Přidejte se zdarma na Prostormat a získejte přístup k poptávkám od organizátorů akcí.",
    url: "https://prostormat.cz/sluzby",
    serviceType: "Event Services Platform",
  })

  const serviceListSchema = generateServiceListSchema(SERVICE_CATEGORIES)

  return (
    <div className="min-h-screen bg-white">
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(serviceSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(serviceListSchema)}
      />

      {/* Hero */}
      <PageHero
        tone="blue"
        variant="soft"
        size="lg"
        title="Nabízíte služby pro eventy?"
        subtitle="Klienti, kteří u nás hledají prostory pro firemní akce, teambuildingy a svatby, budou nově moci najít i vás."
      />

      {/* Coming Soon Banner */}
      <section className="py-8 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Calendar className="w-6 h-6" />
              <span className="text-2xl font-bold">Spouštíme 10. 12. 2025</span>
            </div>
            <p className="text-blue-100">
              Registrujte se již nyní a buďte mezi prvními
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              Co získáte?
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {[
              "Profil ve vyhledávači služeb pro eventy",
              "Poptávky od klientů hledajících služby pro akce",
              "Propojení s prostory a organizátory",
              "Žádné provize z realizovaných zakázek",
              "Registrace a základní profil ZDARMA"
            ].map((benefit, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-900 font-medium">{benefit}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={300}>
            <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-green-200 text-center">
              <p className="text-2xl font-bold text-green-700 mb-2">
                Registrace je ZDARMA
              </p>
              <p className="text-gray-600">
                Zaregistrujte se nyní a buďte připraveni na spuštění 10. 12. 2025
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white" id="registrace">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
              Zaregistrujte se
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Vyplňte formulář a my vás budeme kontaktovat před spuštěním
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <ServicesForm />
          </ScrollReveal>
        </div>
      </section>

      {/* Final Info */}
      <section className="py-12 px-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-gray-600">
              Máte dotazy? Napište nám na{" "}
              <a href="mailto:info@prostormat.cz" className="text-blue-600 hover:text-blue-700 font-medium">
                info@prostormat.cz
              </a>
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
