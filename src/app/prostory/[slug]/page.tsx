import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { VenueGallery } from "@/components/venue/venue-gallery"
import { VenueContactForm } from "@/components/forms/venue-contact-form"
import { HeartButton } from "@/components/venue/heart-button"
import { GoogleVenueMap } from "@/components/maps/google-venue-map"
import { RelatedVenues } from "@/components/venue/related-venues"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { MapPin, Users, Instagram } from "lucide-react"
import { generateVenueSchema, generateBreadcrumbSchema, schemaToJsonLd } from "@/lib/schema-markup"
import { buildVenueMetaDescription, buildVenueKeywords, absoluteUrl } from "@/lib/seo"
import { getOptimizedImageUrl } from "@/lib/supabase-images"

export const revalidate = 0

function formatDisplayAddress(address?: string | null) {
  if (!address) return ""
  return address
    .replace(/\b\d{3}\s?\d{2}\b/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ", ")
    .trim()
}

async function getVenue(slug: string) {
  try {
  const venue = await db.venue.findUnique({
      where: {
        slug,
      },
      include: {
        manager: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        subVenues: {
          where: {
            status: { in: ["published", "active", "hidden"] },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            description: true,
            capacitySeated: true,
            capacityStanding: true,
            images: true,
            status: true,
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    })

    if (!venue) return null

    if (!['published', 'active', 'hidden'].includes(venue.status)) {
      return null
    }

    // PostgreSQL returns arrays directly, no need to parse
    return venue
  } catch (error) {
    console.error("Error fetching venue:", error)
    return null
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const venue = await getVenue(slug)

  if (!venue) {
    return {
      title: 'Prostor nenalezen - Prostormat',
      description: 'Tento prostor nebyl nalezen. Vyberte si z našeho katalogu event prostorů v Praze.',
    }
  }

  const capacity = Math.max(Number(venue.capacitySeated) || 0, Number(venue.capacityStanding) || 0)
  const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType as VenueType] || venue.venueType : 'Event prostor'

  const description = buildVenueMetaDescription({
    name: venue.name,
    rawDescription: venue.description,
    venueTypeLabel,
    district: venue.district,
    address: venue.address,
    capacity,
  })

  const imageCandidates = Array.isArray(venue.images) ? venue.images : []
  const ogImageUrls = imageCandidates
    .slice(0, 4)
    .map((imagePath) => getOptimizedImageUrl(imagePath, "medium"))
    .filter((url) => Boolean(url)) as string[]

  const normalizedOgImages = (ogImageUrls.length > 0 ? ogImageUrls : [absoluteUrl("/og-image.jpg")])
    .map((url) => absoluteUrl(url))

  const keywords = buildVenueKeywords({
    name: venue.name,
    venueTypeLabel,
    district: venue.district,
  })

  return {
    title: `${venue.name} - Event prostor v Praze | Prostormat`,
    description,
    keywords,
    openGraph: {
      title: `${venue.name} - Event prostor v Praze`,
      description,
      url: `https://prostormat.cz/prostory/${slug}`,
      siteName: 'Prostormat',
      images: [
        ...normalizedOgImages.map((url) => ({
          url,
          width: 1200,
          height: 630,
          alt: venue.name,
        })),
      ],
      locale: 'cs_CZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${venue.name} - Event prostor v Praze`,
      description,
      images: [normalizedOgImages[0]],
    },
    alternates: {
      canonical: `https://prostormat.cz/prostory/${slug}`,
    },
  }
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenue(slug)

  if (!venue) {
    notFound()
  }

  const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType as VenueType] || venue.venueType : null

  const displayAddress = formatDisplayAddress(venue.address)

  // Generate schema markup for SEO
  const venueSchema = generateVenueSchema({
    name: venue.name,
    description: venue.description,
    address: venue.address,
    images: venue.images,
    venueType: venue.venueType,
    capacitySeated: venue.capacitySeated,
    capacityStanding: venue.capacityStanding,
    slug: venue.slug,
    manager: venue.manager,
    district: venue.district,
    instagramUrl: venue.instagramUrl ?? undefined,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Domů', url: 'https://prostormat.cz' },
    { name: 'Prostory', url: 'https://prostormat.cz/prostory' },
    { name: venue.name, url: `https://prostormat.cz/prostory/${venue.slug}` },
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Schema.org JSON-LD markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(venueSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(breadcrumbSchema)}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <VenueGallery images={venue.images} venueName={venue.name} />

            {/* YouTube Video */}
            {venue.videoUrl && (
              <div className="mt-8">
                <h2 className="text-title-3 text-black mb-4">Video prezentace</h2>
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={venue.videoUrl.includes('embed') ? venue.videoUrl : venue.videoUrl.replace('watch?v=', 'embed/')}
                    title={`${venue.name} - Video prezentace`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Venue Info */}
            <div className="mt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  {venue.parent && (
                    <div className="text-sm text-blue-600 mb-2">
                        <Link href={`/prostory/${venue.parent.slug}`} className="hover:underline">
                          Součást: {venue.parent.name}
                      </Link>
                    </div>
                  )}
                  <h1 className="text-title-1 text-black mb-2">{venue.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-body">{displayAddress}</span>
                  </div>
                  {venue.district && (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-4">
                      {venue.district}
                    </span>
                  )}
                  {venueTypeLabel && (
                    <Badge variant="secondary" className="mb-4">
                      {venueTypeLabel}
                    </Badge>
                  )}
                </div>
                <HeartButton venueId={venue.id} />
              </div>

              {venue.description && (
                <div className="mb-8">
                  <h2 className="text-title-3 text-black mb-4">O prostoru</h2>
                  <p className="text-body text-gray-700 leading-relaxed">
                    {venue.description}
                  </p>
                </div>
              )}

              {venue.subVenues && venue.subVenues.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-title-3 text-black mb-4">Dostupné prostory</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {venue.subVenues.map((subVenue) => {
                      const capacity = Math.max(Number(subVenue.capacitySeated) || 0, Number(subVenue.capacityStanding) || 0)
                      const image = Array.isArray(subVenue.images) && subVenue.images.length > 0 ? subVenue.images[0] : null

                      return (
                        <Link
                          key={subVenue.id}
                          href={`/prostory/${subVenue.slug}`}
                          className="block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="aspect-[4/3] bg-gray-100 relative">
                            {image ? (
                              <Image
                                src={image}
                                alt={subVenue.name}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                Bez fotografie
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{subVenue.name}</h3>
                              {capacity > 0 && (
                                <div className="flex items-center gap-1 text-gray-600 text-sm">
                                  <Users className="h-4 w-4" />
                                  <span>{capacity}</span>
                                </div>
                              )}
                            </div>
                            {subVenue.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <MapPin className="h-4 w-4" />
                                <span>{subVenue.address}</span>
                              </div>
                            )}
                            {subVenue.description && (
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {subVenue.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Capacity */}
              {(venue.capacitySeated || venue.capacityStanding) && (
                <div className="mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Kapacita
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {Math.max(Number(venue.capacitySeated) || 0, Number(venue.capacityStanding) || 0)} osob
                        </span>
                      </div>
                      {venue.capacitySeated && venue.capacityStanding && (
                        <div className="mt-3 text-sm text-gray-600">
                          <div>Sedící: {venue.capacitySeated} osob</div>
                          <div>Stojící: {venue.capacityStanding} osob</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Amenities */}
              {venue.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-title-3 text-black mb-4">Vybavení a služby</h2>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {venue.instagramUrl && (
                <div className="mb-8">
                  <h2 className="text-title-3 text-black mb-4">Sledujte</h2>
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-gray-500" />
                    <a
                      href={venue.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body text-blue-600 hover:underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div className="mb-8">
                <h2 className="text-title-3 text-black mb-4">Poloha</h2>
                <GoogleVenueMap 
                  address={venue.address}
                  venueName={venue.name}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Pošlete dotaz</CardTitle>
                </CardHeader>
                <CardContent>
                  <VenueContactForm venueId={venue.id} venueName={venue.name} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Related Venues */}
        <RelatedVenues
          currentVenueId={venue.id}
          venueType={venue.venueType}
          address={venue.address}
          district={venue.district}
          maxCapacity={Math.max(Number(venue.capacitySeated) || 0, Number(venue.capacityStanding) || 0)}
        />
      </div>
    </div>
  )
}
