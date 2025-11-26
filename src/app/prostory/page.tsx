import Link from "next/link"
import { Suspense } from "react"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { VenueFilters } from "@/components/venue/venue-filters"
import { InfiniteVenueList } from "@/components/venue/infinite-venue-list"
import { PageHero } from "@/components/layout/page-hero"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES, SITE_URL } from "@/lib/seo"
import { fetchRandomizedVenuePage, getCurrentSeed } from "@/lib/venue-order"
import { generateCollectionPageSchema, schemaToJsonLd } from "@/lib/schema-markup"
import { db } from "@/lib/db"

export const revalidate = 300

interface SearchParams {
  q?: string
  type?: string
  district?: string
  capacity?: string
  page?: string
  favorites?: string
}

const VENUES_PER_PAGE = 20
const PUBLIC_STATUSES: string[] = ["published", "active"]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const resolved = await searchParams
  const rawPage = Array.isArray(resolved.page) ? resolved.page[0] : resolved.page
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1)

  const baseTitle = "Event prostory v Praze pro firemní akce | Prostormat"
  const title = page > 1 ? `${baseTitle} – Stránka ${page}` : baseTitle

  const canonicalBase = "https://prostormat.cz/prostory"
  const canonical = page > 1 ? `${canonicalBase}?page=${page}` : canonicalBase

  const description = "Prohlédněte si ověřené prostory v Praze pro firemní akce, teambuildingy, večírky i svatby. Filtrovat můžete podle typu, kapacity i lokality."

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [...DEFAULT_OG_IMAGES],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

async function getInitialVenues(
  searchParams: SearchParams,
  pageNumber: number,
  favoriteVenueIds?: string[],
) {
  try {
    const seed = getCurrentSeed()
    const offset = (pageNumber - 1) * VENUES_PER_PAGE

    // If favorites filter is on but user has no favorites, return empty
    if (searchParams.favorites === "true" && favoriteVenueIds && favoriteVenueIds.length === 0) {
      return { seed, venues: [], totalCount: 0, hasMore: false }
    }

    const result = await fetchRandomizedVenuePage({
      filters: {
        q: searchParams.q ?? null,
        type: searchParams.type ?? null,
        district: searchParams.district ?? null,
        capacity: searchParams.capacity ?? null,
        statuses: PUBLIC_STATUSES,
        includeSubvenues: false,
        venueIds: searchParams.favorites === "true" ? favoriteVenueIds : undefined,
      },
      seed,
      take: VENUES_PER_PAGE,
      skip: offset,
    })

    return {
      seed,
      venues: result.venues.map((venue) => ({
        ...venue,
        images: Array.isArray(venue.images) ? venue.images : [],
      })),
      totalCount: result.totalCount,
      hasMore: result.hasMore,
    }
  } catch (error) {
    console.error("Error fetching prostormat_venues:", error)
    return { seed: getCurrentSeed(), venues: [], totalCount: 0, hasMore: false }
  }
}

function VenueGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
          <div className="p-4 sm:p-6">
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-4 w-full" />
            <div className="flex justify-between">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function VenueContent({
  searchParams,
  currentPage,
  favoriteVenueIds,
}: {
  searchParams: SearchParams
  currentPage: number
  favoriteVenueIds?: string[]
}) {
  const { venues, totalCount, hasMore, seed } = await getInitialVenues(
    searchParams,
    currentPage,
    favoriteVenueIds,
  )

  if (venues.length === 0) {
    const isFavoritesFilter = searchParams.favorites === "true"
    return (
      <div className="text-center py-8 sm:py-12">
        <h3 className="text-lg sm:text-title-3 text-black mb-3 sm:mb-4">
          {isFavoritesFilter ? "Zatím nemáte žádné oblíbené prostory" : "Žádné prostory nebyly nalezeny"}
        </h3>
        <p className="text-sm sm:text-body text-gray-600 mb-4 sm:mb-6">
          {isFavoritesFilter
            ? "Klikněte na srdíčko u prostoru pro přidání do oblíbených."
            : "Zkuste upravit filtry nebo vyhledat jiné prostory."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 text-center text-sm text-gray-600">
        Zobrazeno {venues.length} z {totalCount} prostor
      </div>
      <InfiniteVenueList
        initialVenues={venues}
        searchParams={searchParams}
        hasMore={hasMore}
        initialPage={currentPage}
        seed={seed}
        includeHidden={false}
      />
      <PaginationLinks
        currentPage={currentPage}
        totalCount={totalCount}
        searchParams={searchParams}
      />
    </>
  )
}

function PaginationLinks({
  currentPage,
  totalCount,
  searchParams,
}: {
  currentPage: number
  totalCount: number
  searchParams: SearchParams
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / VENUES_PER_PAGE))
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  if (!hasPrevious && !hasNext) {
    return null
  }

  const createHref = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (!value || key === "page") return
      params.set(key, value)
    })
    if (page > 1) {
      params.set("page", String(page))
    }
    const query = params.toString()
    return query ? `/prostory?${query}` : "/prostory"
  }

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600" aria-label="Stránkování výsledků">
      {hasPrevious && (
        <Link
          href={createHref(currentPage - 1)}
          className="rounded-xl border border-gray-300 px-4 py-2 transition hover:border-black hover:text-black"
        >
          ← Předchozí
        </Link>
      )}
      <span className="rounded-xl border border-dashed border-gray-200 px-4 py-2">
        Stránka {currentPage} z {totalPages}
      </span>
      {hasNext && (
        <Link
          href={createHref(currentPage + 1)}
          className="rounded-xl border border-gray-300 px-4 py-2 transition hover:border-black hover:text-black"
        >
          Další →
        </Link>
      )}
    </nav>
  )
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page ?? "1", 10) || 1)

  // Get user's favorite venue IDs if favorites filter is active
  let favoriteVenueIds: string[] | undefined
  if (resolvedSearchParams.favorites === "true") {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      const favorites = await db.venueFavorite.findMany({
        where: { userId: session.user.id },
        select: { venueId: true }
      })
      favoriteVenueIds = favorites.map(f => f.venueId)
    } else {
      favoriteVenueIds = []
    }
  }

  const collectionSchema = generateCollectionPageSchema({
    title: "Event prostory v Praze pro firemní akce",
    description: "Prohlédněte si ověřené prostory v Praze pro firemní akce, teambuildingy, večírky i svatby. Filtrovat můžete podle typu, kapacity i lokality.",
    url: `${SITE_URL}/prostory`,
  })

  const hero = (
    <PageHero
      eyebrow="Výběr prostorů"
      title="Event prostory v Praze"
      subtitle="Procházejte ověřené prostory pro firemní akce, večírky i soukromé oslavy. Filtrujte podle typu, lokality a kapacity."
      variant="plain"
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-16"
      tone="blue"
      size="md"
      containerClassName="max-w-6xl mx-auto"
    >
      <div className="relative mx-auto w-full max-w-7xl">
        <VenueFilters initialValues={resolvedSearchParams} />
      </div>
    </PageHero>
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(collectionSchema)}
      />
      <div className="min-h-screen bg-white">
        {hero}

        {/* Venue Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
          <Suspense fallback={<VenueGridSkeleton />}>
            <VenueContent
              searchParams={resolvedSearchParams}
              currentPage={currentPage}
              favoriteVenueIds={favoriteVenueIds}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
