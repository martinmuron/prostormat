"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  Building,
  Eye,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react"

interface Venue {
  id: string
  name: string
  slug: string
  address: string
  status: string
  paid: boolean
  capacitySeated?: string
  capacityStanding?: string
  totalViews: number
  manager?: {
    name?: string | null
    email?: string | null
  } | null
  _count?: {
    inquiries: number
    broadcastLogs: number
  }
}

export default function ViewAsVenuePage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/admin/venues")
      const data = await response.json()
      if (response.ok) {
        setVenues(data.venues)
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVenues = useMemo(() => {
    if (!searchTerm) return venues

    const normalizedSearch = searchTerm.toLowerCase()
    return venues.filter((venue) => {
      const nameMatch = venue.name?.toLowerCase().includes(normalizedSearch)
      const addressMatch = venue.address?.toLowerCase().includes(normalizedSearch)
      const slugMatch = venue.slug?.toLowerCase().includes(normalizedSearch)
      const managerName = venue.manager?.name?.toLowerCase() ?? ""
      const managerEmail = venue.manager?.email?.toLowerCase() ?? ""
      const managerMatch =
        managerName.includes(normalizedSearch) ||
        managerEmail.includes(normalizedSearch)
      return Boolean(nameMatch || addressMatch || slugMatch || managerMatch)
    })
  }, [venues, searchTerm])

  const handleViewAsVenue = (venueSlug: string) => {
    router.push(`/dashboard?viewAsVenue=${venueSlug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Načítání prostorů...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zobrazit jako prostor
          </h1>
          <p className="text-gray-600">
            Vyberte prostor a uvidíte jeho admin panel přesně tak, jak ho vidí majitel.
            Ideální pro prezentace na schůzkách.
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Jak to funguje?
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Po kliknutí na &quot;Zobrazit admin&quot; se vám načte dashboard přesně tak,
                  jak ho vidí majitel daného prostoru - včetně všech jeho poptávek,
                  dotazů a statistik.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Hledat podle názvu, adresy nebo majitele..."
                className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {filteredVenues.length} z {venues.length} prostorů
            </p>
          </CardContent>
        </Card>

        {/* Venues List */}
        {filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Žádné prostory nenalezeny
              </h3>
              <p className="text-gray-600 text-center">
                Zkuste změnit vyhledávací výraz.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredVenues.map((venue) => (
              <Card
                key={venue.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleViewAsVenue(venue.slug)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Venue Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {venue.name}
                        </h3>
                        {venue.paid && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Zaplaceno
                          </Badge>
                        )}
                        <Badge
                          className={
                            venue.status === "published"
                              ? "bg-blue-100 text-blue-800 text-xs"
                              : "bg-gray-100 text-gray-600 text-xs"
                          }
                        >
                          {venue.status === "published" ? "Zveřejněno" : "Skryto"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{venue.address}</span>
                        </div>
                      </div>

                      {venue.manager && (
                        <div className="mt-1 text-sm text-gray-500">
                          Majitel: {venue.manager.name || venue.manager.email || "Neuvedeno"}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{venue.totalViews} zobrazení</span>
                        </div>
                        {(venue.capacitySeated || venue.capacityStanding) && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {venue.capacitySeated && `${venue.capacitySeated} sedících`}
                              {venue.capacitySeated && venue.capacityStanding && " / "}
                              {venue.capacityStanding && `${venue.capacityStanding} stojících`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 group-hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewAsVenue(venue.slug)
                      }}
                    >
                      <span>Zobrazit admin</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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
