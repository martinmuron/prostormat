import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { formatDate } from "@/lib/utils"
import { Calendar, MessageSquare, Building, Plus } from "lucide-react"

interface UserDashboardProps {
  data: {
    user: any
    eventRequests: any[]
    inquiries: any[]
    stats: {
      activeRequests: number
      totalRequests: number
      totalInquiries: number
    }
  }
}

export function UserDashboard({ data }: UserDashboardProps) {
  const { user, eventRequests, inquiries, stats } = data

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-1 text-black mb-2">
          Vítejte zpět, {user.name}!
        </h1>
        <p className="text-body text-gray-600">
          Přehled vašich aktivit na Prostormatu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Aktivní požadavky</p>
                <p className="text-title-2 text-black">{stats.activeRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem požadavků</p>
                <p className="text-title-2 text-black">{stats.totalRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Odeslané dotazy</p>
                <p className="text-title-2 text-black">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Event Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nedávné požadavky</CardTitle>
              <Link href="/pozadavky/novy">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nový požadavek
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {eventRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 mb-4">
                  Zatím jste nevytvořili žádné požadavky
                </p>
                <Link href="/pozadavky/novy">
                  <Button size="sm">Vytvořit první požadavek</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {eventRequests.map((request: any) => {
                  const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-callout font-medium text-black">{request.title}</h4>
                        <Badge 
                          variant={request.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {request.status === "active" ? "Aktivní" : "Neaktivní"}
                        </Badge>
                      </div>
                      <p className="text-caption text-gray-600 mb-2">{eventTypeLabel}</p>
                      <p className="text-caption text-gray-500">
                        Vytvořeno {formatDate(new Date(request.createdAt))}
                      </p>
                    </div>
                  )
                })}
                <Link href="/dashboard/requests">
                  <Button variant="secondary" size="sm" className="w-full">
                    Zobrazit všechny požadavky
                  </Button>
                </Link>
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
            {inquiries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 mb-4">
                  Zatím jste neodeslali žádné dotazy
                </p>
                <Link href="/prostory">
                  <Button size="sm">Prohlédnout prostory</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry: any) => (
                  <div key={inquiry.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <Link 
                        href={`/prostory/${inquiry.venue.slug}`}
                        className="text-callout font-medium text-black hover:text-gray-700"
                      >
                        {inquiry.venue.name}
                      </Link>
                    </div>
                    <p className="text-caption text-gray-500">
                      Odesláno {formatDate(new Date(inquiry.createdAt))}
                    </p>
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
            <Link href="/pozadavky/novy">
              <Button variant="secondary" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Nový požadavek na akci
              </Button>
            </Link>
            <Link href="/prostory">
              <Button variant="secondary" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Prohlédnout prostory
              </Button>
            </Link>
            <Link href="/pozadavky">
              <Button variant="secondary" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Požadavky ostatních
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}