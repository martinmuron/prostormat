import type { Prisma } from "@prisma/client"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VenueCard } from "@/components/venue/venue-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { HeroSearch } from "@/components/ui/hero-search"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/db"
import { Upload, MessageSquare, Euro, ArrowRight, Zap, Clock } from "lucide-react"

// Force dynamic rendering to avoid caching issues
export const revalidate = 120

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

async function getFeaturedVenues() {
  try {
    const desiredCount = 12
    const selected: FeaturedVenue[] = []
    const seen = new Set<string>()

    const topPriorityVenues = await db.venue.findMany({
      where: {
        priority: 1,
        status: { in: ['published', 'active'] },
        parentId: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: desiredCount,
      select: featuredVenueSelect,
    })

    for (const venue of topPriorityVenues) {
      if (seen.has(venue.id)) continue
      seen.add(venue.id)
      selected.push(venue)
      if (selected.length === desiredCount) {
        return selected
      }
    }

    const homepageVenues = await db.homepageVenue.findMany({
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
      const homepageVenueRecords = await db.venue.findMany({
        where: {
          id: { in: homepageVenueIds },
          parentId: null,
        },
        select: featuredVenueSelect,
      })

      const homepageVenueMap = new Map(
        homepageVenueRecords.map((venue) => [venue.id, venue]),
      )

      for (const entry of homepageVenues) {
        const venue = homepageVenueMap.get(entry.venueId)
        if (!venue) continue
        if (!['published', 'active'].includes(venue.status)) continue
        if (seen.has(venue.id)) continue
        seen.add(venue.id)
        selected.push(venue)
      }
    }

    if (selected.length < desiredCount) {
      const fallbackVenues = await db.venue.findMany({
        where: {
          status: { in: ['published', 'active'] },
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

    return selected.slice(0, desiredCount)
  } catch (error) {
    console.error("Error fetching prostormat_venues:", error)
    return []
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
  const venues = await getFeaturedVenues()

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
      {venues.map((venue, index) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          priority={index < 6}
          showPriorityBadge={typeof venue.priority === 'number'}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 px-4 sm:px-6 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="max-w-5xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900 mb-8 tracking-tight leading-tight">
              Najděte perfektní prostor<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>pro vaši akci
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Objevte tisíce jedinečných prostorů v Praze pro vaše akce, oslavy a události. 
              Od intimních setkání po velké konference.
            </p>
          </div>
          
          <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <HeroSearch />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Link href="/pridat-prostor" className="flex-1">
              <Button 
                variant="outline" 
                size="lg" 
                className="magnetic-button hover-lift w-full px-6 py-3 text-base font-medium rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                Přidat prostor
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Quick Request Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
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
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
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
              
              <div className="mt-8 space-y-4">
                <Link href="/event-board/novy" className="block">
                  <Button 
                    size="lg" 
                    className="w-full px-6 py-3 text-base font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Vytvořit poptávku
                  </Button>
                </Link>
                <Link href="/event-board" className="block">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full px-6 py-3 text-base font-medium rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                  >
                    Prohlédnout Event Board
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                Vybrané prostory
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ručně vybrané prostory, které chceme aktuálně ukázat návštěvníkům
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
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Přidejte prostor
                    </h3>
                    <p className="text-gray-600">
                      Vytvořte profil vašeho prostoru s fotografiemi a všemi detaily.
                    </p>
                  </div>
                </div>
              
                <div className="flex items-start space-x-4 hover-lift">
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
                
                <div className="flex items-start space-x-4 hover-lift">
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
                    Tři jednoduché kroky k novým klientům
                  </p>
                </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <p className="text-gray-700 font-medium">
                    Vytvořte profil s fotografiemi a detaily
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <p className="text-gray-700 font-medium">
                    Získávejte poptávky od organizátorů
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
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
    </div>
  )
}
