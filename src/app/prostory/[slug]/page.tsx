import Link from "next/link"
import { notFound } from "next/navigation"
import { VenueGallery } from "@/components/venue/venue-gallery"
import { VenueContactForm } from "@/components/forms/venue-contact-form"
import { HeartButton } from "@/components/venue/heart-button"
import { GoogleVenueMap } from "@/components/maps/google-venue-map"
import { RelatedVenues } from "@/components/venue/related-venues"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { MapPin, Users, Instagram } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-white">
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
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-5 w-5" />
                    <span className="text-body">{venue.address}</span>
                  </div>
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
                          <div className="aspect-[4/3] bg-gray-100">
                            {image ? (
                              <img src={image} alt={subVenue.name} className="w-full h-full object-cover" />
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
          amenities={venue.amenities}
        />
      </div>
    </div>
  )
}
