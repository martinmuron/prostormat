import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Eye, Mail, Edit, MapPin, Users, Calendar } from "lucide-react"

export default async function VenueManagerVenuePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "venue_manager" && session.user.role !== "admin")) {
    redirect("/prihlaseni?callbackUrl=/dashboard/venue")
  }

  // Fetch venues managed by this user
  const venues = await db.venue.findMany({
    where: {
      managerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      paid: true,
      address: true,
      district: true,
      capacitySeated: true,
      capacityStanding: true,
      contactEmail: true,
      totalViews: true,
      paymentDate: true,
      expiresAt: true,
      createdAt: true,
      _count: {
        select: {
          inquiries: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const statusBadgeStyles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    published: "bg-green-100 text-green-800 border-green-200",
    active: "bg-blue-100 text-blue-800 border-blue-200",
    hidden: "bg-red-100 text-red-800 border-red-200",
  }

  const statusLabels: Record<string, string> = {
    draft: "Koncept",
    pending: "Čeká na schválení",
    published: "Zveřejněno",
    active: "Aktivní",
    hidden: "Skryto",
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Moje prostory</h1>
          <p className="text-gray-600">
            Spravujete {venues.length} {venues.length === 1 ? "prostor" : venues.length < 5 ? "prostory" : "prostorů"}
          </p>
        </div>

        {/* Venues List */}
        {venues.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nemáte přiřazené žádné prostory</p>
              <p className="text-sm text-gray-500">
                Kontaktujte administrátora pro přidělení prostorů ke správě
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">{venue.name}</CardTitle>
                    <Badge variant="outline" className={statusBadgeStyles[venue.status] || "bg-gray-100 text-gray-800"}>
                      {statusLabels[venue.status] || venue.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location */}
                  {(venue.district || venue.address) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {venue.district || venue.address}
                      </span>
                    </div>
                  )}

                  {/* Capacity */}
                  {(venue.capacitySeated || venue.capacityStanding) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {venue.capacitySeated && `Sezení: ${venue.capacitySeated}`}
                        {venue.capacitySeated && venue.capacityStanding && " · "}
                        {venue.capacityStanding && `Stání: ${venue.capacityStanding}`}
                      </span>
                    </div>
                  )}

                  {/* Email */}
                  {venue.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{venue.contactEmail}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                        <Eye className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{venue.totalViews}</p>
                      <p className="text-xs text-gray-500">Zobrazení</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                        <Mail className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{venue._count.inquiries}</p>
                      <p className="text-xs text-gray-500">Dotazy</p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {venue.paid && venue.expiresAt && (
                    <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-md p-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-green-800">
                        Platné do {new Date(venue.expiresAt).toLocaleDateString("cs-CZ")}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/prostory/${venue.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Zobrazit
                      </Button>
                    </Link>
                    <Link href={`/dashboard/venue/${venue.id}/edit`} className="flex-1">
                      <Button variant="default" className="w-full" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Upravit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
