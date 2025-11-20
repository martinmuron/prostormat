import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Building, MessageSquare, Eye, Plus, Calendar, Settings, CreditCard, Heart, Users, MapPin } from "lucide-react"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import type { VenueManagerDashboardData } from "@/types/dashboard"
import { PremiumUpsellPrompt } from "@/components/dashboard/premium-upsell-prompt"

interface VenueManagerDashboardProps {
  data: VenueManagerDashboardData
}

export function VenueManagerDashboard({ data }: VenueManagerDashboardProps) {
  const { user, venues, favoritedEventRequests, stats } = data

  type VenueInquiryEntry = VenueManagerDashboardData['venues'][number]['inquiries'][number]

  type RecentInquiry = (VenueInquiryEntry & { venueName: string; type: 'inquiry' }) | {
    type: 'broadcast'
    id: string
    venueName: string
    venueSlug: string
    name: string
    email: string
    phone: string | null
    message: string | null
    createdAt: Date
    broadcastId: string
    eventDate: Date | null
    guestCount: number | null
  }

  const inquiries: RecentInquiry[] = venues
    .flatMap((venue) =>
      (venue.inquiries ?? []).map((inquiry): RecentInquiry => ({
        ...inquiry,
        venueName: venue.name ?? '',
        type: 'inquiry' as const
      }))
    )

  const broadcastInquiries: RecentInquiry[] = venues
    .flatMap((venue) =>
      (venue.broadcastLogs ?? [])
        .filter((log) => log.broadcast)
        .map((log): RecentInquiry => ({
          type: 'broadcast' as const,
          id: log.id,
          venueName: venue.name ?? '',
          venueSlug: venue.slug,
          name: log.broadcast.contactName,
          email: log.broadcast.contactEmail,
          phone: log.broadcast.contactPhone,
          message: log.broadcast.description || null,
          createdAt: log.sentAt,
          broadcastId: log.broadcast.id,
          eventDate: log.broadcast.eventDate,
          guestCount: log.broadcast.guestCount,
        }))
    )

  const recentInquiries: RecentInquiry[] = [...inquiries, ...broadcastInquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const statusLabelMap: Record<string, { label: string; isActive: boolean }> = {
    published: { label: "Zveřejněno", isActive: true },
    active: { label: "Aktivní", isActive: true },
    draft: { label: "Koncept", isActive: false },
    pending: { label: "Čeká na schválení", isActive: false },
    hidden: { label: "Skryto", isActive: false },
  }

  type BillingStatus = "active" | "expired" | "unpaid"

  type BillingDetail = {
    venueId: string
    venueName: string
    status: BillingStatus
    paymentDate: Date | null
    expiresAt: Date | null
  }

  const now = new Date()

  const billingDetails: BillingDetail[] = venues.map((venue) => {
    const paymentDate = venue.paymentDate ? new Date(venue.paymentDate) : null
    const expiresAt = venue.expiresAt ? new Date(venue.expiresAt) : null

    let status: BillingStatus = "unpaid"

    if (venue.paid) {
      if (expiresAt && expiresAt.getTime() < now.getTime()) {
        status = "expired"
      } else {
        status = "active"
      }
    }

    return {
      venueId: venue.id,
      venueName: venue.name ?? "Neznámý prostor",
      status,
      paymentDate,
      expiresAt,
    }
  })

  const activePaidVenues = billingDetails.filter((detail) => detail.status === "active")
  const expiredPaidVenues = billingDetails.filter((detail) => detail.status === "expired")
  const unpaidVenues = billingDetails.filter((detail) => detail.status === "unpaid")
  const paidDetails = [...activePaidVenues, ...expiredPaidVenues]

  const nextExpiryDate = activePaidVenues.reduce<Date | null>((earliest, detail) => {
    if (!detail.expiresAt) {
      return earliest
    }

    if (!earliest || detail.expiresAt.getTime() < earliest.getTime()) {
      return detail.expiresAt
    }

    return earliest
  }, null)

  const daysUntilNextExpiry = nextExpiryDate
    ? Math.max(0, Math.ceil((nextExpiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : null

  const billingSummaryStatus: BillingStatus | "none" = (() => {
    if (activePaidVenues.length > 0) {
      return "active"
    }
    if (expiredPaidVenues.length > 0) {
      return "expired"
    }
    if (unpaidVenues.length > 0) {
      return "unpaid"
    }
    return "none"
  })()

  const billingStatusLabel = (() => {
    switch (billingSummaryStatus) {
      case "active":
        return "Zaplaceno"
      case "expired":
        return "Vyžaduje prodloužení"
      case "unpaid":
        return "Nezaplaceno"
      default:
        return "Bez plateb"
    }
  })()

  const billingBadgeClass = (() => {
    switch (billingSummaryStatus) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "unpaid":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  })()

  const formatBillingStatus = (status: BillingStatus) => {
    switch (status) {
      case "active":
        return "Zaplaceno"
      case "expired":
        return "Po splatnosti"
      case "unpaid":
        return "Nezaplaceno"
    }
    return "-"
  }

  const hasAnyPaidVenues = billingDetails.some((detail) => detail.status !== "unpaid")


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-1 text-gray-900 mb-2">
          Vítejte zpět, {user.email}!
        </h1>
        <p className="text-body text-gray-600">
          Správa vašich event prostorů a spolupráce s Prostormat týmem
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem prostorů</p>
                <p className="text-title-2 text-gray-900">{stats.totalVenues}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Aktivní prostory</p>
                <p className="text-title-2 text-gray-900">{stats.activeVenues}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem dotazů</p>
                <p className="text-title-2 text-gray-900">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Zaplacené prostory</p>
                <p className="text-title-2 text-gray-900">{activePaidVenues.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Status */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Stav spolupráce
            </CardTitle>
            <Badge variant="default" className={billingBadgeClass}>
              {billingStatusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!hasAnyPaidVenues ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-700">
                Zatím nemáme zaznamenanou žádnou přijatou platbu. Dejte nám vědět, až proběhne fakturace, a tým Prostormat prostor aktivuje ručně.
              </p>
              <Link href="mailto:info@prostormat.cz">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Kontaktovat tým Prostormat
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Zaplacené prostory</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {paidDetails.length}
                </p>
                <p className="text-sm text-gray-500">
                  Aktivních: {activePaidVenues.length}{expiredPaidVenues.length > 0 ? ` · Po splatnosti: ${expiredPaidVenues.length}` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Nejbližší vypršení</p>
                {nextExpiryDate ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(nextExpiryDate)}
                    </p>
                    {daysUntilNextExpiry !== null && (
                      <p className="text-sm text-gray-500">
                        za {daysUntilNextExpiry} dní
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Zatím nemáme datum expirace
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Přehled prostorů</p>
                <div className="space-y-2">
                  {paidDetails.slice(0, 3).map((detail) => (
                    <div
                      key={detail.venueId}
                      className="flex items-center justify-between text-sm text-gray-700"
                    >
                      <span>{detail.venueName}</span>
                      <span className="text-gray-500">
                        {formatBillingStatus(detail.status)}
                        {detail.expiresAt ? ` · ${formatDate(detail.expiresAt)}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
                {paidDetails.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{paidDetails.length - 3} dalších prostorů s platbou
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* My Venues */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Moje prostory</CardTitle>
              <Link href="/pridat-prostor">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Přidat první prostor</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.slice(0, 3).map((venue) => {
                  const statusMeta = statusLabelMap[venue.status] || { label: venue.status, isActive: false }
                  const isActive = statusMeta.isActive

                  return (
                    <div key={venue.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-callout font-medium text-gray-900">{venue.name}</h4>
                        </div>
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {statusMeta.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/prostory/${venue.slug}`}>
                          <Button variant="secondary" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                            <Eye className="h-3 w-3 mr-1" />
                            Zobrazit
                          </Button>
                        </Link>
                        <Link href={`/dashboard/venue/${venue.id}/edit`}>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Settings className="h-3 w-3 mr-1" />
                            Upravit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
                {venues.length > 3 && (
                  <Link href="/dashboard/venues">
                    <Button variant="secondary" size="sm" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                      Zobrazit všechny prostory ({venues.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Nedávné dotazy</CardTitle>
              <Link href="/dashboard/venue-inquiries" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Zobrazit vše →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600">
                  Zatím jste neobdrželi žádné dotazy
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInquiries.slice(0, 5).map((inquiry) => (
                  <div key={inquiry.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-callout font-medium text-gray-900">{inquiry.name}</h4>
                        <p className="text-caption text-gray-600">{inquiry.venueName}</p>
                      </div>
                      <Badge variant="secondary" className={inquiry.type === 'broadcast' ? "bg-green-100 text-green-800 text-xs" : "bg-blue-100 text-blue-800 text-xs"}>
                        {inquiry.type === 'broadcast' ? 'Rychlá poptávka' : 'Nový'}
                      </Badge>
                    </div>
                    {inquiry.type === 'broadcast' && (inquiry.guestCount || inquiry.eventDate) && (
                      <div className="flex gap-3 mb-2 text-caption text-gray-600">
                        {inquiry.guestCount && <span>👥 {inquiry.guestCount} hostů</span>}
                        {inquiry.eventDate && <span>📅 {formatDate(new Date(inquiry.eventDate))}</span>}
                      </div>
                    )}
                    <p className="text-caption text-gray-700 mb-3 line-clamp-2">
                      {inquiry.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-caption text-gray-500">
                        {formatDate(new Date(inquiry.createdAt))}
                      </p>
                      {inquiry.type === 'broadcast' ? (
                        <Link href={`/poptavka/${inquiry.broadcastId}?venue=${inquiry.venueSlug}`}>
                          <span className="text-caption bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                            Zobrazit detail
                          </span>
                        </Link>
                      ) : (
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="text-caption bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Odpovědět
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/venue-inquiries">
                  <Button variant="secondary" size="sm" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                    Zobrazit všechny dotazy
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Favorited Event Requests */}
      {favoritedEventRequests && favoritedEventRequests.length > 0 && (
        <Card className="mb-8 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-rose-600" />
                Oblíbené poptávky
              </CardTitle>
              <Link href="/event-board">
                <Button size="sm" variant="secondary" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Zobrazit Event Board
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {favoritedEventRequests.slice(0, 3).map((request) => {
                const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
                return (
                  <div key={request.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            {eventTypeLabel}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(new Date(request.createdAt))}
                          </span>
                        </div>
                        <h4 className="text-callout font-medium text-gray-900 mb-2">{request.title}</h4>
                        <div className="flex flex-wrap gap-3 text-caption text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{request.guestCount} osob</span>
                          </div>
                          {request.locationPreference && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{request.locationPreference}</span>
                            </div>
                          )}
                          {request.eventDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(new Date(request.eventDate))}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href="/event-board">
                      <Button size="sm" variant="secondary" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                        Zobrazit detail
                      </Button>
                    </Link>
                  </div>
                )
              })}
              {favoritedEventRequests.length > 3 && (
                <Link href="/event-board?filter=favorites">
                  <Button variant="secondary" size="sm" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                    Zobrazit všechny oblíbené ({favoritedEventRequests.length})
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Management */}
      <Card className="mt-8 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Správa profilu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informace o účtu</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">E-mail</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Společnost</label>
                  <p className="text-gray-900">{user.company || "Není zadáno"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Telefon</label>
                  <p className="text-gray-900">{user.phone || "Není zadáno"}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <Link href="/dashboard/profile">
                <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white mb-3">
                  <Settings className="h-4 w-4 mr-2" />
                  Upravit profil
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Rychlé akce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/pridat-prostor">
              <Button variant="secondary" className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50 h-12">
                <Plus className="h-4 w-4 mr-2" />
                Přidat nový prostor
              </Button>
            </Link>
            <Link href="/event-board">
              <Button variant="secondary" className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50 h-12">
                <Calendar className="h-4 w-4 mr-2" />
                Event Board
              </Button>
            </Link>
          </div>
      </CardContent>
    </Card>

      <PremiumUpsellPrompt />
    </div>
  )
}
