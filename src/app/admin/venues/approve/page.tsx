"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react"

interface VenueOwner {
  name: string | null
  email: string
  phone?: string | null
  createdAt: string
}

interface PaymentInfo {
  amount: number
  currency: string
  payment_completed_at: string
  stripe_payment_intent_id: string
}

interface PendingVenue {
  id: string
  name: string
  slug: string
  address: string
  description?: string | null
  capacitySeated?: number | null
  capacityStanding?: number | null
  venueType?: string | null
  amenities: string[]
  contactEmail?: string | null
  contactPhone?: string | null
  websiteUrl?: string | null
  createdAt: string
  manager: VenueOwner | null
  payment: PaymentInfo | null
}

interface PendingClaimPayment {
  amount?: number | null
  currency?: string | null
  paymentCompletedAt?: string | null
  stripePaymentIntentId?: string | null
}

interface PendingClaim {
  id: string
  status: string
  createdAt: string
  venue: {
    id: string
    name: string
    slug: string
    address?: string | null
    manager?: {
      id: string
      name?: string | null
      email?: string | null
    } | null
  }
  claimant: {
    id: string
    name?: string | null
    email?: string | null
    phone?: string | null
    createdAt: string
  }
  payment: PendingClaimPayment | null
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)

export default function VenueApprovalPage() {
  const [venues, setVenues] = useState<PendingVenue[]>([])
  const [claims, setClaims] = useState<PendingClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingVenueId, setApprovingVenueId] = useState<string | null>(null)
  const [approvingClaimId, setApprovingClaimId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/venues/approve")
        const data = await response.json()
        if (response.ok) {
          setVenues(data.venues ?? [])
          setClaims(data.claims ?? [])
        } else {
          console.error("Failed to fetch approvals:", data.error)
        }
      } catch (error) {
        console.error("Error fetching approvals:", error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const approveVenue = async (venueId: string) => {
    setApprovingVenueId(venueId)
    try {
      const response = await fetch("/api/admin/venues/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ venueId }),
      })

      const data = await response.json()

      if (response.ok) {
        setVenues((prev) => prev.filter((venue) => venue.id !== venueId))
        alert("Prostor byl úspěšně schválen.")
      } else {
        alert(data.error || "Chyba při schvalování prostoru.")
      }
    } catch (error) {
      console.error("Error approving venue:", error)
      alert("Došlo k chybě při schvalování prostoru.")
    } finally {
      setApprovingVenueId(null)
    }
  }

  const approveClaim = async (claimId: string) => {
    setApprovingClaimId(claimId)
    try {
      const response = await fetch(`/api/admin/venue-claims/${claimId}/approve`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setClaims((prev) => prev.filter((claim) => claim.id !== claimId))
        alert(data.message || "Žádost o převzetí byla schválena.")
      } else {
        alert(data.error || "Chyba při schvalování žádosti o převzetí.")
      }
    } catch (error) {
      console.error("Error approving claim:", error)
      alert("Došlo k chybě při schvalování žádosti o převzetí.")
    } finally {
      setApprovingClaimId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-12 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Načítám čekající schválení…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schvalování plateb</h1>
          <p className="text-gray-600">
            Všechny nové prostory a žádosti o převzetí, které čekají na ruční kontrolu.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Nové prostory ({venues.length})</h2>
          </div>

          {venues.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Žádné prostory čekající na schválení
                </h3>
                <p className="text-gray-600">
                  Všechny nově přidané prostory již prošly kontrolou.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {venues.map((venue) => (
                <Card key={venue.id}>
                  <CardHeader className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-gray-900">{venue.name}</CardTitle>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{venue.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Čeká na schválení
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Přidáno {formatDate(venue.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => approveVenue(venue.id)}
                        disabled={approvingVenueId === venue.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approvingVenueId === venue.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Schvaluji…
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Schválit prostor
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-3 text-sm text-gray-700">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Informace o prostoru
                      </h3>
                      {venue.description && <p>{venue.description}</p>}
                      <div className="flex flex-col gap-1">
                        {venue.capacitySeated && (
                          <span>Sedící kapacita: {venue.capacitySeated}</span>
                        )}
                        {venue.capacityStanding && (
                          <span>Stojící kapacita: {venue.capacityStanding}</span>
                        )}
                        {venue.venueType && <span>Typ: {venue.venueType}</span>}
                      </div>
                      {venue.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {venue.amenities.slice(0, 6).map((amenity) => (
                            <Badge key={amenity} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                          {venue.amenities.length > 6 && (
                            <span className="text-xs text-gray-500">
                              +{venue.amenities.length - 6} dalších
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Kontakt
                      </h3>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">
                      {venue.manager?.name || "Neuvedeno"}
                          </p>
                      <p>{venue.manager?.email}</p>
                      {venue.manager?.phone && (
                        <p className="text-xs text-gray-500">{venue.manager.phone}</p>
                      )}
                        </div>
                      </div>
                      {venue.manager?.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Na platformě od {formatDate(venue.manager.createdAt)}</span>
                        </div>
                      )}
                      {venue.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{venue.contactEmail}</span>
                        </div>
                      )}
                      {venue.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{venue.contactPhone}</span>
                        </div>
                      )}
                      {venue.websiteUrl && (
                        <a
                          href={venue.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Webové stránky
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Platba
                      </h3>
                      {venue.payment ? (
                        <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
                          <div className="flex items-center justify-between">
                            <span>Částka</span>
                            <span className="font-semibold">
                              {formatPrice(venue.payment.amount, venue.payment.currency)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Zaplaceno</span>
                            <span>{formatDate(venue.payment.payment_completed_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-green-700">
                            <CreditCard className="h-3 w-3" />
                            <span>{venue.payment.stripe_payment_intent_id}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span>Platba nebyla nalezena</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Žádosti o převzetí ({claims.length})
            </h2>
          </div>

          {claims.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Žádné nové žádosti o převzetí
                </h3>
                <p className="text-gray-600">Všechny claimy byly zpracovány.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {claims.map((claim) => (
                <Card key={claim.id} className="border-purple-200">
                  <CardHeader className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {claim.venue.name}
                        </CardTitle>
                        {claim.venue.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{claim.venue.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="flex items-center gap-1 bg-purple-100 text-purple-800">
                            <Clock className="h-3 w-3" />
                            Claim čeká na schválení
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Odesláno {formatDate(claim.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => approveClaim(claim.id)}
                        disabled={approvingClaimId === claim.id}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {approvingClaimId === claim.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Schvaluji…
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Schválit převzetí
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-3 text-sm text-gray-700">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Žadatel
                      </h3>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{claim.claimant.name || "Neuvedeno"}</p>
                          <p>{claim.claimant.email || "Bez emailu"}</p>
                          {claim.claimant.phone && (
                            <p className="text-xs text-gray-500">{claim.claimant.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Na platformě od {formatDate(claim.claimant.createdAt)}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Aktuální správce
                      </h3>
                      {claim.venue.manager ? (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {claim.venue.manager.name || "Neuvedeno"}
                          </p>
                          <p>{claim.venue.manager.email || "Bez emailu"}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Prostor zatím nemá přiřazeného správce.</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/prostory/${claim.venue.slug}`, "_blank", "noopener,noreferrer")
                        }
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Otevřít listing
                      </Button>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Platba
                      </h3>
                      {claim.payment ? (
                        <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50 p-4 text-purple-900">
                          <div className="flex items-center justify-between">
                            <span>Částka</span>
                            <span className="font-semibold">
                              {claim.payment.amount
                                ? formatPrice(
                                    claim.payment.amount,
                                    (claim.payment.currency || "CZK").toUpperCase()
                                  )
                                : "12,000 CZK"}
                            </span>
                          </div>
                          {claim.payment.paymentCompletedAt && (
                            <div className="flex items-center justify-between">
                              <span>Zaplaceno</span>
                              <span>{formatDate(claim.payment.paymentCompletedAt)}</span>
                            </div>
                          )}
                          {claim.payment.stripePaymentIntentId && (
                            <div className="flex items-center gap-2 text-xs text-purple-700">
                              <CreditCard className="h-3 w-3" />
                              <span>{claim.payment.stripePaymentIntentId}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span>Platba nebyla nalezena</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
