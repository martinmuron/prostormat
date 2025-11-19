import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { VenueFilters } from "@/components/venue/venue-filters"
import { InfiniteVenueList } from "@/components/venue/infinite-venue-list"
import { PageHero } from "@/components/layout/page-hero"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"
import { fetchRandomizedVenuePage, getCurrentSeed } from "@/lib/venue-order"
import {
  parseLandingPageSlug,
  getLandingPageTitle,
  getLandingPageDescription,
  getLandingPageH1,
  generateAllLandingPageSlugs,
  VENUE_TYPE_SEO_NAMES,
  buildLandingPageUrl,
} from "@/lib/seo-slugs"
import { VenueType, PRAGUE_DISTRICTS } from "@/types"

export const revalidate = 3600 // Revalidate every hour

interface SearchParams {
  q?: string
  type?: string
  district?: string
  capacity?: string
  page?: string
}

const VENUES_PER_PAGE = 20
const PUBLIC_STATUSES: string[] = ["published", "active"]

// Generate static params for all landing pages
export async function generateStaticParams() {
  const pages = generateAllLandingPageSlugs()
  return pages.map((page) => ({
    slug: page.slug,
  }))
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  const parsed = parseLandingPageSlug(slug)

  // If we can't parse the slug, return 404
  if (!parsed.venueType && !parsed.district) {
    notFound()
  }

  const resolved = await searchParams
  const rawPage = Array.isArray(resolved.page) ? resolved.page[0] : resolved.page
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1)

  // Get venue count for better meta description
  const venueCount = await getVenueCount(parsed.venueType, parsed.district)

  const title = getLandingPageTitle(parsed.venueType, parsed.district, venueCount)
  const description = getLandingPageDescription(parsed.venueType, parsed.district, venueCount)

  const canonicalBase = `https://prostormat.cz/prostory/kategorie/${slug}`
  const canonical = page > 1 ? `${canonicalBase}?page=${page}` : canonicalBase

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

async function getVenueCount(
  venueType?: VenueType,
  district?: string
): Promise<number> {
  try {
    const result = await fetchRandomizedVenuePage({
      filters: {
        q: null,
        type: venueType ?? null,
        district: district ?? null,
        capacity: null,
        statuses: PUBLIC_STATUSES,
        includeSubvenues: false,
      },
      seed: getCurrentSeed(),
      take: 1,
      skip: 0,
    })
    return result.totalCount
  } catch {
    return 0
  }
}

async function getInitialVenues(
  searchParams: SearchParams,
  venueType?: VenueType,
  district?: string,
  pageNumber: number = 1
) {
  try {
    const seed = getCurrentSeed()
    const offset = (pageNumber - 1) * VENUES_PER_PAGE

    const result = await fetchRandomizedVenuePage({
      filters: {
        q: searchParams.q ?? null,
        type: venueType ?? searchParams.type ?? null,
        district: district ?? searchParams.district ?? null,
        capacity: searchParams.capacity ?? null,
        statuses: PUBLIC_STATUSES,
        includeSubvenues: false,
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
    console.error("Error fetching venues:", error)
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
  venueType,
  district,
  currentPage,
  slug,
}: {
  searchParams: SearchParams
  venueType?: VenueType
  district?: string
  currentPage: number
  slug: string
}) {
  const { venues, totalCount, hasMore, seed } = await getInitialVenues(
    searchParams,
    venueType,
    district,
    currentPage
  )

  if (venues.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <h3 className="text-lg sm:text-title-3 text-black mb-3 sm:mb-4">
          Žádné prostory nebyly nalezeny
        </h3>
        <p className="text-sm sm:text-body text-gray-600 mb-4 sm:mb-6">
          V této kategorii zatím nemáme žádné prostory. Zkuste jinou lokalitu nebo typ prostoru.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/prostory"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Zobrazit všechny prostory
          </Link>
          {venueType && (
            <Link
              href={buildLandingPageUrl(venueType)}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:border-black transition"
            >
              {VENUE_TYPE_SEO_NAMES[venueType]} v celé Praze
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Create effective search params for infinite list
  const effectiveSearchParams = {
    ...searchParams,
    type: venueType ?? searchParams.type,
    district: district ?? searchParams.district,
  }

  return (
    <>
      <div className="mb-6 text-center text-sm text-gray-600">
        Zobrazeno {venues.length} z {totalCount} prostor
      </div>
      <InfiniteVenueList
        initialVenues={venues}
        searchParams={effectiveSearchParams}
        hasMore={hasMore}
        initialPage={currentPage}
        seed={seed}
        includeHidden={false}
      />
      <PaginationLinks
        currentPage={currentPage}
        totalCount={totalCount}
        searchParams={searchParams}
        slug={slug}
      />
    </>
  )
}

function PaginationLinks({
  currentPage,
  totalCount,
  searchParams,
  slug,
}: {
  currentPage: number
  totalCount: number
  searchParams: SearchParams
  slug: string
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
    return query ? `/prostory/kategorie/${slug}?${query}` : `/prostory/kategorie/${slug}`
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

// Related links component for internal linking
function RelatedLinks({
  venueType,
  district,
}: {
  venueType?: VenueType
  district?: string
}) {
  const links: { href: string; label: string }[] = []

  // If we're on a combined page, link to the individual pages
  if (venueType && district) {
    links.push({
      href: buildLandingPageUrl(venueType),
      label: `${VENUE_TYPE_SEO_NAMES[venueType]} v celé Praze`,
    })
    links.push({
      href: buildLandingPageUrl(undefined, district),
      label: `Všechny prostory v ${district.replace('Praha', 'Praze')}`,
    })
  }

  // Link to other districts if we have a venue type
  if (venueType) {
    const otherDistricts = PRAGUE_DISTRICTS.slice(0, 5).filter(d => d !== district)
    otherDistricts.forEach(d => {
      links.push({
        href: buildLandingPageUrl(venueType, d),
        label: `${VENUE_TYPE_SEO_NAMES[venueType]} v ${d.replace('Praha', 'Praze')}`,
      })
    })
  }

  // Link to other venue types if we have a district
  if (district) {
    const popularTypes: VenueType[] = ['conference', 'restaurant', 'loft', 'hotel', 'rooftop']
    popularTypes.filter(t => t !== venueType).slice(0, 4).forEach(t => {
      links.push({
        href: buildLandingPageUrl(t, district),
        label: `${VENUE_TYPE_SEO_NAMES[t]} v ${district.replace('Praha', 'Praze')}`,
      })
    })
  }

  if (links.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Související vyhledávání</h2>
      <div className="flex flex-wrap gap-2">
        {links.slice(0, 8).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Breadcrumbs component
function Breadcrumbs({
  venueType,
  district,
}: {
  venueType?: VenueType
  district?: string
}) {
  const items = [
    { href: "/", label: "Domů" },
    { href: "/prostory", label: "Prostory" },
  ]

  if (venueType && district) {
    items.push({
      href: buildLandingPageUrl(venueType),
      label: VENUE_TYPE_SEO_NAMES[venueType],
    })
    items.push({
      href: buildLandingPageUrl(venueType, district),
      label: district.replace('Praha', 'Praha'),
    })
  } else if (venueType) {
    items.push({
      href: buildLandingPageUrl(venueType),
      label: VENUE_TYPE_SEO_NAMES[venueType],
    })
  } else if (district) {
    items.push({
      href: buildLandingPageUrl(undefined, district),
      label: district,
    })
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">/</span>}
            {index === items.length - 1 ? (
              <span className="text-gray-900">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-black transition">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  const parsed = parseLandingPageSlug(slug)

  // If we can't parse the slug, return 404
  if (!parsed.venueType && !parsed.district) {
    notFound()
  }

  const { venueType, district } = parsed
  const resolvedSearchParams = await searchParams
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page ?? "1", 10) || 1)

  const h1 = getLandingPageH1(venueType, district)
  const subtitle = getLandingPageDescription(venueType, district)

  // Prepare initial filter values for the filter component
  const initialFilterValues = {
    ...resolvedSearchParams,
    type: venueType ?? resolvedSearchParams.type,
    district: district ?? resolvedSearchParams.district,
  }

  const hero = (
    <PageHero
      eyebrow="Výběr prostorů"
      title={h1}
      subtitle={subtitle}
      variant="plain"
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-16"
      tone="blue"
      size="md"
      containerClassName="max-w-6xl mx-auto"
    >
      <div className="relative mx-auto w-full max-w-7xl">
        <VenueFilters initialValues={initialFilterValues} />
      </div>
    </PageHero>
  )

  return (
    <div className="min-h-screen bg-white">
      {hero}

      {/* Venue Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <Breadcrumbs venueType={venueType} district={district} />

        <Suspense fallback={<VenueGridSkeleton />}>
          <VenueContent
            searchParams={resolvedSearchParams}
            venueType={venueType}
            district={district}
            currentPage={currentPage}
            slug={slug}
          />
        </Suspense>

        <RelatedLinks venueType={venueType} district={district} />
      </div>
    </div>
  )
}
