import { notFound } from "next/navigation"
import { VenueGallery } from "@/components/venue/venue-gallery"
import { VenueContactForm } from "@/components/forms/venue-contact-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { MapPin, Users, Phone, Mail, Globe, Heart } from "lucide-react"

async function getVenue(slug: string) {
  try {
    const venue = await db.venue.findUnique({
      where: {
        slug,
        status: "active",
      },
      include: {
        manager: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    })
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

            {/* Venue Info */}
            <div className="mt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
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
                <Button variant="secondary" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {venue.description && (
                <div className="mb-8">
                  <h2 className="text-title-3 text-black mb-4">O prostoru</h2>
                  <p className="text-body text-gray-700 leading-relaxed">
                    {venue.description}
                  </p>
                </div>
              )}

              {/* Capacity & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {(venue.capacitySeated || venue.capacityStanding) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Kapacita
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {venue.capacitySeated && (
                        <div className="mb-2">
                          <span className="text-body text-gray-600">Sedící: </span>
                          <span className="text-body font-medium">{venue.capacitySeated} osob</span>
                        </div>
                      )}
                      {venue.capacityStanding && (
                        <div>
                          <span className="text-body text-gray-600">Stojící: </span>
                          <span className="text-body font-medium">{venue.capacityStanding} osob</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {venue.priceRange && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cenové rozpětí</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-title-3 text-black">{venue.priceRange}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Amenities */}
              {venue.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-title-3 text-black mb-4">Vybavení a služby</h2>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="mb-8">
                <h2 className="text-title-3 text-black mb-4">Kontaktní informace</h2>
                <div className="space-y-3">
                  {venue.contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <a 
                        href={`mailto:${venue.contactEmail}`}
                        className="text-body text-blue-600 hover:underline"
                      >
                        {venue.contactEmail}
                      </a>
                    </div>
                  )}
                  {venue.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <a 
                        href={`tel:${venue.contactPhone}`}
                        className="text-body text-blue-600 hover:underline"
                      >
                        {venue.contactPhone}
                      </a>
                    </div>
                  )}
                  {venue.websiteUrl && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <a 
                        href={venue.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-blue-600 hover:underline"
                      >
                        Webové stránky
                      </a>
                    </div>
                  )}
                </div>
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
      </div>
    </div>
  )
}