import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VenueCard } from "@/components/venue/venue-card"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { HeroSearch } from "@/components/ui/hero-search"
import { db } from "@/lib/db"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, Upload, MessageSquare, Euro, Users, MapPin, Calendar } from "lucide-react"

async function getFeaturedVenues() {
  try {
    const venues = await db.venue.findMany({
      where: {
        status: { in: ["active", "draft"] }, // Temporarily include draft venues
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <FloatingShapes />
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              Najděte perfektní prostor<br />
              pro vaši akci
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-2xl mx-auto font-medium">
              Největší katalog event prostorů v Praze. Bez provizí, přímý kontakt s provozovateli.
            </p>
          </div>
          
          {/* Enhanced Search Interface */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <HeroSearch />
          </div>

        </div>
      </section>
      
      {/* Featured Venues */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Doporučené prostory
              </h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto text-lg font-medium">
                Objevte nejlepší event prostory v Praze vybrané naším týmem
              </p>
            </div>
          </ScrollReveal>
          
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <VenueCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ScrollReveal delay={200}>
              <FeaturedVenues />
            </ScrollReveal>
          </Suspense>

          <ScrollReveal delay={400}>
            <div className="text-center mt-16">
              <Link href="/prostory">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="magnetic-button hover-lift rounded-2xl px-10 py-4 text-lg font-semibold border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  Zobrazit všechny prostory
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA for Venue Owners */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-800 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float-medium" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-title-1 text-white mb-6 leading-tight font-bold">
                Vlastníte event prostor?
              </h2>
              <p className="text-lg sm:text-title-3 text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
                Připojte se k tisícům spokojených provozovatelů a začněte vydělávat 
                na svém prostoru už dnes
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
            <ScrollReveal delay={100}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 hover-lift group-hover:scale-110 transition-all duration-300 shadow-2xl">
                  <Upload className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Přidejte prostor</h3>
                <p className="text-gray-300 leading-relaxed">
                  Vytvořte profil vašeho prostoru s fotografiami a všemi detaily
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 hover-lift group-hover:scale-110 transition-all duration-300 shadow-2xl">
                  <MessageSquare className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Přijímejte dotazy</h3>
                <p className="text-gray-300 leading-relaxed">
                  Komunikujte přímo s organizátory a domlouvejte si akce
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={300}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 hover-lift group-hover:scale-110 transition-all duration-300 shadow-2xl">
                  <Euro className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Vydělávejte</h3>
                <p className="text-gray-300 leading-relaxed">
                  Maximalizujte využití vašeho prostoru a generujte pravidelný příjem
                </p>
              </div>
            </ScrollReveal>
          </div>
          
          <ScrollReveal delay={400}>
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
                <Link href="/pridat-prostor">
                  <Button 
                    size="lg" 
                    className="magnetic-button hover-lift w-full sm:w-auto px-10 py-4 text-lg font-semibold rounded-2xl bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-xl"
                  >
                    Přidat prostor zdarma
                  </Button>
                </Link>
                <Link href="/prostory">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="hover-lift magnetic-button w-full sm:w-auto px-10 py-4 text-lg font-semibold rounded-2xl border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                  >
                    Prohlédnout prostory
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}