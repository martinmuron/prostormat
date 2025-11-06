import type { Prisma } from "@prisma/client"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VenueCard } from "@/components/venue/venue-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/db"
import { Upload, MessageSquare, Euro, ArrowRight, Zap, Clock, Search } from "lucide-react"

// Fully static homepage; revalidation is triggered from the admin panel when slots change.
export const revalidate = false

const featuredVenueSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  address: true,
  district: true,
  capacitySeated: true,
  capacityStanding: true,
  venueType: true,
  images: true,
  status: true,
  priority: true,
} satisfies Prisma.VenueSelect

type FeaturedVenue = Prisma.VenueGetPayload<{ select: typeof featuredVenueSelect }>

type FeaturedVenuesResult = {
  venues: FeaturedVenue[]
  homepageHighlightedIds: string[]
}

async function getFeaturedVenues(): Promise<FeaturedVenuesResult> {
  try {
    const visibleStatuses = ['published']

    const desiredCount = 12
    return await db.$transaction(async (tx) => {
      const selected: FeaturedVenue[] = []
      const homepageHighlighted = new Set<string>()
      const seen = new Set<string>()

      const homepageVenues = await tx.homepageVenue.findMany({
        select: {
          venueId: true,
          position: true,
        },
        orderBy: {
          position: 'asc',
        },
      })

      if (homepageVenues.length) {
        const homepageVenueIds = homepageVenues.map(({ venueId }) => venueId)
        const homepageVenueRecords = await tx.venue.findMany({
          where: {
            id: { in: homepageVenueIds },
            parentId: null,
            status: { in: visibleStatuses },
          },
          select: featuredVenueSelect,
        })

        const homepageVenueMap = new Map(
          homepageVenueRecords.map((venue) => [venue.id, venue]),
        )

        for (const entry of homepageVenues) {
          const venue = homepageVenueMap.get(entry.venueId)
          if (!venue) continue
          if (!visibleStatuses.includes(venue.status)) continue
          if (seen.has(venue.id)) continue
          seen.add(venue.id)
          selected.push(venue)
          homepageHighlighted.add(venue.id)
          if (selected.length === desiredCount) {
            break
          }
        }
      }

      if (selected.length < desiredCount) {
        const topPriorityVenues = await tx.venue.findMany({
          where: {
            priority: 1,
            status: { in: visibleStatuses },
            parentId: null,
            id: { notIn: Array.from(seen) },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: desiredCount - selected.length,
          select: featuredVenueSelect,
        })

        for (const venue of topPriorityVenues) {
          if (seen.has(venue.id)) continue
          seen.add(venue.id)
          selected.push(venue)
        }
      }

      if (selected.length < desiredCount) {
        const fallbackVenues = await tx.venue.findMany({
          where: {
            status: { in: visibleStatuses },
            id: { notIn: Array.from(seen) },
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: desiredCount - selected.length,
          select: featuredVenueSelect,
        })

        for (const venue of fallbackVenues) {
          if (!seen.has(venue.id)) {
            seen.add(venue.id)
            selected.push(venue)
          }
        }
      }

      const finalSelection = selected.slice(0, desiredCount)
      const homepageHighlightedIds = finalSelection
        .filter((venue) => homepageHighlighted.has(venue.id))
        .map((venue) => venue.id)

      return {
        venues: finalSelection,
        homepageHighlightedIds,
      }
    })
  } catch (error) {
    console.error("Error fetching prostormat_venues:", error)
    return {
      venues: [],
      homepageHighlightedIds: [],
    }
  }
}

function VenueCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

async function FeaturedVenues() {
  const { venues, homepageHighlightedIds } = await getFeaturedVenues()
  const homepageHighlightSet = new Set(homepageHighlightedIds)

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body text-gray-600">
          Zatím nejsou k dispozici žádné prostory.
        </p>
        <Link href="/pridat-prostor" className="mt-4 inline-block">
          <Button>Přidat první prostor</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {venues.map((venue, index) => {
        const shouldHighlight =
          homepageHighlightSet.has(venue.id) || venue.priority === 1

        return (
          <VenueCard
            key={venue.id}
            venue={venue}
            priority={index < 6}
            showPriorityBadge={shouldHighlight}
          />
        )
      })}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto relative z-20">
          <div className="text-center mb-12">
            <div className="animate-slide-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900 mb-6 tracking-tight leading-tight">
                Najděte perfektní prostor<br className="hidden sm:block" />
                <span className="sm:hidden"> </span>pro vaši akci
              </h1>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-lg sm:text-xl text-gray-700 mb-3 max-w-3xl mx-auto leading-relaxed font-light">
                Stovky ověřených prostorů v Praze – vyberte si svou cestu:
              </p>
            </div>
          </div>

          {/* Two Equal CTAs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
            {/* Rychla Poptavka CTA */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border-2 border-orange-200 hover-lift h-full flex flex-col">
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 bg-orange-500">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Rychlá poptávka
                  </h2>
                  <p className="text-base text-gray-700 mb-4 leading-relaxed">
                    Vyplň jeden formulář a prostory se ti ozvou samy! Porovnej nabídky a vyber tu nejlepší.
                  </p>
                </div>
                <Link href="/rychla-poptavka" className="block">
                  <Button
                    size="lg"
                    className="magnetic-button hover-lift w-full px-5 py-3 text-base font-semibold rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Zadat poptávku
                  </Button>
                </Link>
              </div>
            </div>

            {/* Browse All Venues CTA */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-200 hover-lift h-full flex flex-col">
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 bg-blue-600">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Procházet prostory
                  </h2>
                  <p className="text-base text-gray-700 mb-4 leading-relaxed">
                    Prohlédněte si všechny prostory, porovnejte je a kontaktujte majitele přímo.
                  </p>
                </div>
                <Link href="/prostory" className="block">
                  <Button
                    size="lg"
                    className="magnetic-button hover-lift w-full px-5 py-3 text-base font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Prohlédnout všechny prostory
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Optional: Add prostor owner CTA */}
          <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-sm text-gray-600 mb-2">Vlastníte prostor?</p>
            <Link href="/pridat-prostor">
              <Button
                variant="outline"
                size="default"
                className="magnetic-button px-5 py-2 text-sm font-medium rounded-xl border-2 border-gray-300 text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Přidat prostor
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                Doporučené prostory
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Speciálně doporučené prostory, které momentálně zdůrazňujeme našim návštěvníkům
              </p>
            </div>
          </ScrollReveal>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <VenueCardSkeleton key={i} />
              ))}
            </div>
          }>
            <FeaturedVenues />
          </Suspense>
          
          <ScrollReveal delay={400}>
            <div className="text-center mt-12">
              <Link href="/prostory">
                <Button 
                  size="lg" 
                  className="magnetic-button hover-lift px-8 py-3 text-base font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-200 shadow-lg"
                >
                  Zobrazit všechny prostory
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick Request Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-6 bg-blue-600">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Rychlá poptávka
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Nemáte čas hledat? Popište svou akci a nechte majitele prostorů, aby se ozvali vám!
            </p>
          </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ušetřete čas
                  </h3>
                  <p className="text-gray-600">
                    Místo procházení stovek prostorů jednoduše popište svou akci a požadavky.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Získejte nabídky
                  </h3>
                  <p className="text-gray-600">
                    Majitelé prostorů vám sami napíšou s nabídkami přesně podle vašich potřeb.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Euro className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Lepší ceny
                  </h3>
                  <p className="text-gray-600">
                    Majitelé soutěží o vaši akci, což často znamená výhodnější podmínky.
                  </p>
                </div>
              </div>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover-lift">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Jak to funguje?
                </h3>
                <p className="text-gray-600">
                  Tři jednoduché kroky k perfektnímu prostoru
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <p className="text-gray-700 font-medium">
                    Vyplňte formulář s detaily vaší akce
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <p className="text-gray-700 font-medium">
                    Majitelé prostorů vám pošlou nabídky
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <p className="text-gray-700 font-medium">
                    Vyberte si nejlepší nabídku a rezervujte
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/rychla-poptavka" className="block">
                  <Button
                    size="lg"
                    className="magnetic-button hover-lift w-full px-6 py-3 text-base font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Zadat rychlou poptávku
                  </Button>
                </Link>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA for Venue Owners */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-6 hover-lift">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Vlastníte prostor?
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Prostormat je perfektní místo, aby vás našli potenciální zákazníci na firemní akce, teambuildingy, svatby a více!
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal delay={200}>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Přidejte prostor
                    </h3>
                    <p className="text-gray-600">
                      Vyplňte kontaktní údaje, základní parametry a odešlete žádost – o zbytek se postará náš tým.
                    </p>
                  </div>
                </div>
              
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Získejte klienty
                    </h3>
                    <p className="text-gray-600">
                      Tisíce organizátorů hledá prostory každý měsíc - buďte vidět!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <Euro className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Vydělávejte více
                    </h3>
                    <p className="text-gray-600">
                      Zvyšte obsazenost a příjmy díky našim kvalifikovaným klientům.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={400}>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover-lift">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Jak začít?
                  </h3>
                  <p className="text-gray-600">
                    Čtyři jednoduché kroky k novým klientům
                  </p>
                </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <p className="text-gray-700 font-medium">
                    Vyplňte kontaktní údaje a základní informace o prostoru
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <p className="text-gray-700 font-medium">
                    Ozveme se vám a společně projdeme váš profil
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <p className="text-gray-700 font-medium">
                    Získávejte poptávky od organizátorů
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <p className="text-gray-700 font-medium">
                    Reagujte na nabídky a uzavírejte obchody
                  </p>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Link href="/pridat-prostor" className="block">
                  <Button 
                    size="lg" 
                    className="magnetic-button hover-lift w-full px-6 py-3 text-base font-medium rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Přidat prostor
                  </Button>
                </Link>
                <Link href="/prostory" className="block">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full px-6 py-3 text-base font-medium rounded-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200"
                  >
                    Prohlédnout prostory
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Organize For You CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="bg-black rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover-lift">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">Nechcete hledat ani organizovat?</h3>
              <p className="text-white/80">Zařídíme akci za vás – prostor, catering, techniku i produkci. (Aktuálně 30+ osob)</p>
            </div>
            <Link href="/organizace-akce">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-xl">Organizaci zajistíme za vás</Button>
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Catering Coming Soon Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal delay={0.1}>
            <Link href="/catering" className="block group">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 sm:p-10 border-2 border-dashed border-gray-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-all duration-300 hover:border-gray-400 hover:shadow-md opacity-90">
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm sm:text-base font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Připravujeme
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pr-0 md:pr-8">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-gray-800 transition-colors">
                    Catering přímo na míru
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                    Plánujeme kalkulačku cateringu, kde si snadno sestavíte menu pro vaši akci
                    a získáte okamžitou cenovou nabídku. Catering zajistí naši ověření partneři.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="w-full md:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full md:w-auto bg-white/80 text-gray-700 border-gray-300 hover:bg-white hover:text-gray-900 hover:border-gray-400 rounded-xl group-hover:shadow-sm transition-all"
                  >
                    Zjistit více
                  </Button>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
