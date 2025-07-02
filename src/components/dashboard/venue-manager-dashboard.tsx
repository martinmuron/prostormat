import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Building, MessageSquare, Eye, Plus } from "lucide-react"

interface VenueManagerDashboardProps {
  data: {
    user: any
    venues: any[]
    stats: {
      totalVenues: number
      activeVenues: number
      totalInquiries: number
    }
  }
}

export function VenueManagerDashboard({ data }: VenueManagerDashboardProps) {
  const { user, venues, stats } = data

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-1 text-black mb-2">
          Vítejte zpět, {user.name}!
        </h1>
        <p className="text-body text-gray-600">
          Správa vašich event prostorů
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem prostorů</p>
                <p className="text-title-2 text-black">{stats.totalVenues}</p>
              </div>
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Aktivní prostory</p>
                <p className="text-title-2 text-black">{stats.activeVenues}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem dotazů</p>
                <p className="text-title-2 text-black">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Venues */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Moje prostory</CardTitle>
              <Link href="/pridat-prostor">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Přidat prostor
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {venues.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 mb-4">
                  Zatím nemáte žádné prostory
                </p>
                <Link href="/pridat-prostor">
                  <Button size="sm">Přidat první prostor</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.slice(0, 3).map((venue: any) => (
                  <div key={venue.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-callout font-medium text-black">{venue.name}</h4>
                      <Badge 
                        variant={venue.status === "active" ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {venue.status === "active" ? "Aktivní" : venue.status}
                      </Badge>
                    </div>
                    <p className="text-caption text-gray-600 mb-2">
                      {venue.inquiries?.length || 0} dotazů
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/prostory/${venue.slug}`}>
                        <Button variant="secondary" size="sm">
                          Zobrazit
                        </Button>
                      </Link>
                      <Link href={`/dashboard/venue/${venue.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Upravit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {venues.length > 3 && (
                  <Link href="/dashboard/venues">
                    <Button variant="secondary" size="sm" className="w-full">
                      Zobrazit všechny prostory
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Nedávné dotazy</CardTitle>
          </CardHeader>
          <CardContent>
            {venues.every(v => !v.inquiries?.length) ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600">
                  Zatím jste neobdrželi žádné dotazy
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {venues
                  .flatMap(venue => 
                    (venue.inquiries || []).map((inquiry: any) => ({
                      ...inquiry,
                      venueName: venue.name
                    }))
                  )
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((inquiry: any) => (
                    <div key={inquiry.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-callout font-medium text-black">{inquiry.name}</h4>
                          <p className="text-caption text-gray-600">{inquiry.venueName}</p>
                        </div>
                      </div>
                      <p className="text-caption text-gray-700 mb-2 line-clamp-2">
                        {inquiry.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-caption text-gray-500">
                          {formatDate(new Date(inquiry.createdAt))}
                        </p>
                        <a 
                          href={`mailto:${inquiry.email}`}
                          className="text-caption text-blue-600 hover:underline"
                        >
                          Odpovědět
                        </a>
                      </div>
                    </div>
                  ))}
                <Link href="/dashboard/inquiries">
                  <Button variant="secondary" size="sm" className="w-full">
                    Zobrazit všechny dotazy
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Rychlé akce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/pridat-prostor">
              <Button variant="secondary" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Přidat nový prostor
              </Button>
            </Link>
            <Link href="/pozadavky">
              <Button variant="secondary" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Požadavky na akce
              </Button>
            </Link>
            <Link href="/dashboard/subscription">
              <Button variant="secondary" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Spravovat předplatné
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}