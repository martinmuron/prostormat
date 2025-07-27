import { Suspense } from "react"

// Force dynamic rendering to avoid caching issues
export const revalidate = 0
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VenueCard } from "@/components/venue/venue-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { HeroSearch } from "@/components/ui/hero-search"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/db"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, Upload, MessageSquare, Euro, Users, MapPin, Calendar, ArrowRight } from "lucide-react"

async function getFeaturedVenues() {
  try {
    const venues = await db.venue.findMany({
      where: {
        status: { in: ["active", "draft"] },
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
    })
    
    
    // PostgreSQL returns arrays directly, no need to parse
    return venues
  } catch (error) {
    console.error("Error fetching venues:", error)
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
      {venues.map((venue: any) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-black mb-8 tracking-tight leading-tight">
            Najděte perfektní prostor<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>pro vaši akci
          </h1>
          
          <p className="text-xl sm:text-2xl text-black mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Objevte tisíce jedinečných prostorů v Praze pro vaše akce, oslavy a události. 
            Od intimních setkání po velké konference.
          </p>
          
          <div className="mb-12">
            <HeroSearch />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
            <Link href="/prostory" className="flex-1">
              <Button 
                size="lg" 
                className="w-full px-6 py-3 text-base font-medium rounded-xl bg-blue-100 text-blue-700 border-2 border-blue-200 hover:bg-blue-200 transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Najít prostory
              </Button>
            </Link>
            <Link href="/prostory" className="flex-1">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full px-6 py-3 text-base font-medium rounded-xl bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100 transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Prohlédnout prostory
              </Button>
            </Link>
            <Link href="/pridat-prostor" className="flex-1">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full px-6 py-3 text-base font-medium rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 hover:bg-amber-100 transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                Přidat prostor
              </Button>
            </Link>
          </div>

        </div>
      </section>
      
      {/* Featured Venues */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4">
              TOP prostory tohoto měsíce
            </h2>
            <p className="text-base sm:text-lg text-black max-w-2xl mx-auto">
              Nejoblíbenější a nejlépe hodnocené prostory od našich klientů. 
              Garantovaná kvalita a spolehlivost.
            </p>
          </div>
          
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <VenueCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <FeaturedVenues />
          </Suspense>

          <div className="text-center mt-12">
            <Link href="/prostory">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-xl px-8 py-3 text-base font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Zobrazit všechny prostory
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA for Venue Owners */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Vlastníte prostor?
          </h2>
          <p className="text-base sm:text-lg text-white max-w-2xl mx-auto mb-12">
            Prostormat je perfektní místo, aby vás našli potenciální zákazníci na firemní akce, teambuildingy, svatby a více. 
            Neztrácejte příležitosti – připojte se k nám a získejte přístup k tisícům klientů!
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 border-2 border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Přidejte prostor</h3>
              <p className="text-sm text-white">
                Vytvořte profil vašeho prostoru s fotografiemi a všemi detaily
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 border-2 border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Získejte klienty</h3>
              <p className="text-sm text-white">
                Tisíce organizátorů hledá prostory každý měsíc - buďte vidět!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 border-2 border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Euro className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Vydělávejte více</h3>
              <p className="text-sm text-white">
                Zvyšte obsazenost a příjmy díky našim kvalifikovaným klientům
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/pridat-prostor" className="flex-1">
              <Button 
                size="lg" 
                className="w-full px-8 py-3 text-base font-medium rounded-xl bg-white text-black hover:bg-blue-700 hover:text-white transition-all duration-200"
              >
                Přidat prostor
              </Button>
            </Link>
            <Link href="/prostory" className="flex-1">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full px-8 py-3 text-base font-medium rounded-xl border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-200"
              >
                Prohlédnout prostory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}