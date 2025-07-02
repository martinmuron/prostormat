import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VenueCard } from "@/components/venue/venue-card"
import { db } from "@/lib/db"
import { Search } from "lucide-react"

async function getFeaturedVenues() {
  try {
    const venues = await db.venue.findMany({
      where: {
        status: "active",
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
    })
    return venues
  } catch (error) {
    console.error("Error fetching venues:", error)
    return []
  }
}

function VenueCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-full" />
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display text-black mb-6">
            Najděte perfektní prostor<br />
            pro vaši akci
          </h1>
          <p className="text-title-3 text-gray-600 mb-12 max-w-2xl mx-auto">
            Největší katalog event prostorů v Praze. Bez provizí, přímý kontakt s provozovateli.
          </p>
          
          {/* Search Bar */}
          <div className="bg-gray-50 rounded-2xl p-6 max-w-2xl mx-auto">
            <form className="flex gap-4" action="/prostory" method="GET">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  name="q"
                  className="pl-12"
                  placeholder="Hledat prostory..."
                />
              </div>
              <Button type="submit">
                Hledat
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/prostory?type=restaurant">
              <Button variant="secondary" size="sm">
                Restaurace
              </Button>
            </Link>
            <Link href="/prostory?type=rooftop">
              <Button variant="secondary" size="sm">
                Střešní terasy
              </Button>
            </Link>
            <Link href="/prostory?type=gallery">
              <Button variant="secondary" size="sm">
                Galerie
              </Button>
            </Link>
            <Link href="/prostory?type=conference">
              <Button variant="secondary" size="sm">
                Konferenční centra
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Venues */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-title-1 text-black mb-4">
              Doporučené prostory
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">
              Objevte nejlepší event prostory v Praze vybrané naším týmem
            </p>
          </div>
          
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <Button variant="secondary" size="lg">
                Zobrazit všechny prostory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-title-1 text-black mb-6">
            Máte vlastní prostor?
          </h2>
          <p className="text-body text-gray-600 mb-8 max-w-2xl mx-auto">
            Připojte se k největší platformě pro event prostory v Praze a získejte více rezervací.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pridat-prostor">
              <Button size="lg" className="w-full sm:w-auto">
                Přidat prostor
              </Button>
            </Link>
            <Link href="/pozadavky">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Zobrazit požadavky
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}