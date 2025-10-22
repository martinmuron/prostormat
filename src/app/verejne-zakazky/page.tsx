'use client'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { formatDate } from "@/lib/utils"
import { EventRequestHeartButton } from "@/components/event-request/heart-button"
import { Calendar, Users, MapPin, Euro, Mail, Phone, User, Clock, X, LogIn, Heart } from "lucide-react"
import { PageHero } from "@/components/layout/page-hero"

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'

interface EventRequest {
  id: string
  title: string
  description?: string | null
  eventType: string
  eventDate: string
  guestCount: number
  budget?: number | null
  locationPreference?: string | null
  requirements?: string | null
  contactName: string
  contactEmail: string
  contactPhone?: string | null
  createdAt: string
  user: {
    name: string
  }
  favorites?: Array<{ userId: string }>
}

const GUEST_COUNTS = [
  { label: "Všechny", value: "all" },
  { label: "1-25 osob", value: "1-25" },
  { label: "26-50 osob", value: "26-50" },
  { label: "51-100 osob", value: "51-100" },
  { label: "101-200 osob", value: "101-200" },
  { label: "200+ osob", value: "200+" },
]

const DATE_RANGES = [
  { label: "Všechny", value: "all" },
  { label: "Posledních 7 dní", value: "7days" },
  { label: "Posledních 30 dní", value: "30days" },
  { label: "Nejnovější", value: "recent" },
]

const LOCATIONS = [
  "Všechny",
  "Praha 1",
  "Praha 2", 
  "Praha 3",
  "Praha 4",
  "Praha 5",
  "Praha 6",
  "Praha 7",
  "Praha 8",
  "Praha 9",
  "Praha 10",
  "Brno",
  "Ostrava",
  "Plzeň",
  "České Budějovice",
  "Hradec Králové",
  "Pardubice",
  "Zlín",
  "Karlovy Vary",
  "Liberec",
]

function EventRequestSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-1 w-16 mx-auto" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto" />
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function EventRequestsPage() {
  const { data: session, status } = useSession()
  const [requests, setRequests] = useState<EventRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: "Všechny",
    guestCount: "all",
    dateRange: "all",
    prostormat_venue_favorites: "all",
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/event-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = useMemo(() => {
    let filtered = [...requests]

    // Filter by location
    if (filters.location !== "Všechny") {
      filtered = filtered.filter(request => 
        request.locationPreference?.includes(filters.location)
      )
    }

    // Filter by guest count
    if (filters.guestCount !== "all") {
      const [min, max] = filters.guestCount.split("-").map(n => n === "+" ? Infinity : parseInt(n))
      filtered = filtered.filter(request => {
        const guests = request.guestCount
        if (max === undefined) return guests >= min
        return guests >= min && guests <= max
      })
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateRange) {
        case "7days":
          filterDate.setDate(now.getDate() - 7)
          break
        case "30days":
          filterDate.setDate(now.getDate() - 30)
          break
        case "recent":
          filterDate.setDate(now.getDate() - 3)
          break
      }
      
      filtered = filtered.filter(request => 
        new Date(request.createdAt) >= filterDate
      )
    }

    // Filter by favorites (only if user is logged in and favorites data is available)
    if (filters.prostormat_venue_favorites === "favorites" && session?.user?.id) {
      filtered = filtered.filter(request => 
        request.favorites?.some(fav => fav.userId === session.user.id) || false
      )
    }

    return filtered
  }, [filters, requests, session?.user?.id])

  const clearFilters = () => {
    setFilters({
      location: "Všechny",
      guestCount: "all",
      dateRange: "all",
      prostormat_venue_favorites: "all",
    })
  }

  const hasActiveFilters = filters.location !== "Všechny" ||
                          filters.guestCount !== "all" ||
                          filters.dateRange !== "all" ||
                          filters.prostormat_venue_favorites !== "all"

  const hero = (
    <PageHero
      eyebrow="Poptávky"
      title="Veřejné zakázky"
      subtitle="Aktuální poptávky na event prostory. Kontaktujte organizátory přímo prostřednictvím uvedených kontaktních údajů."
      variant="plain"
      className="bg-gradient-to-br from-rose-50 via-white to-pink-50 pb-16"
      actions={
        <Link href="/verejne-zakazky/novy">
          <Button size="lg" className="bg-black text-white hover:bg-gray-800 min-w-[200px] rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
            Přidat poptávku
          </Button>
        </Link>
      }
      tone="rose"
      size="md"
      containerClassName="max-w-5xl mx-auto"
    >
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border-2 border-rose-200 bg-white/95 shadow-xl backdrop-blur-sm p-6 sm:p-8">
          {hasActiveFilters && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="rounded-xl border-rose-200 text-rose-600 hover:border-rose-400 hover:text-rose-700"
              >
                <X className="h-4 w-4 mr-2" />
                Vymazat filtry
              </Button>
            </div>
          )}

          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${session ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 rounded-md flex-shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </span>
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-amber-700 bg-white text-base text-gray-900 focus:border-black">
                  <SelectValue placeholder="Vyberte lokalitu" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 bg-green-700 rounded-md flex-shrink-0">
                <Users className="h-4 w-4 text-white" />
              </span>
              <Select value={filters.guestCount} onValueChange={(value) => setFilters(prev => ({ ...prev, guestCount: value }))}>
                <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-green-700 bg-white text-base text-gray-900 focus:border-black">
                  <SelectValue placeholder="Počet hostů" />
                </SelectTrigger>
                <SelectContent>
                  {GUEST_COUNTS.map(count => (
                    <SelectItem key={count.value} value={count.value}>{count.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-700 rounded-md flex-shrink-0">
                <Clock className="h-4 w-4 text-white" />
              </span>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-blue-700 bg-white text-base text-gray-900 focus:border-black">
                  <SelectValue placeholder="Termín" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {session && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-rose-700 rounded-md flex-shrink-0">
                  <Heart className="h-4 w-4 text-white" />
                </span>
                <Select value={filters.prostormat_venue_favorites} onValueChange={(value) => setFilters(prev => ({ ...prev, prostormat_venue_favorites: value }))}>
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-rose-700 bg-white text-base text-gray-900 focus:border-black">
                    <SelectValue placeholder="Filtrovat favority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny poptávky</SelectItem>
                    <SelectItem value="favorites">Jen moje favority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageHero>
  )

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        {hero}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <EventRequestSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {hero}
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">

        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} />
          ) : (
            filteredRequests.map((request: EventRequest) => {
              const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
              
              return (
                <Card key={request.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 font-medium px-3 py-1 text-sm">
                            {eventTypeLabel}
                          </Badge>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(new Date(request.createdAt))}
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                          {request.title}
                        </h2>
                        {request.description && (
                          <p className="text-base text-gray-600 leading-relaxed line-clamp-2">
                            {request.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Heart Button for logged-in users */}
                      {session?.user?.id && (
                        <div className="flex-shrink-0">
                          <EventRequestHeartButton 
                            eventRequestId={request.id}
                            className="shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-blue-600 font-medium">Datum akce</p>
                        <p className="text-sm font-semibold text-blue-900">{formatDate(new Date(request.eventDate))}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                        <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-green-600 font-medium">Počet hostů</p>
                        <p className="text-sm font-semibold text-green-900">{request.guestCount} osob</p>
                      </div>
                      
                      {request.budget && (
                        <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <Euro className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                          <p className="text-xs text-amber-600 font-medium">Rozpočet</p>
                          <p className="text-sm font-semibold text-amber-900">{request.budget.toLocaleString()} Kč</p>
                        </div>
                      )}
                      
                      {request.locationPreference && (
                        <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <MapPin className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs text-purple-600 font-medium">Lokalita</p>
                          <p className="text-sm font-semibold text-purple-900">{request.locationPreference}</p>
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    {request.requirements && (
                      <div className="mb-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-amber-800 mb-2">Speciální požadavky</h4>
                          <p className="text-sm text-amber-700 leading-relaxed line-clamp-2">{request.requirements}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Contact Info */}
                    <div className="relative bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-slate-200">
                      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${!session ? 'blur-sm' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600" />
                          </div>
                          <span className="font-medium text-slate-900">{request.contactName}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <a 
                            href={session ? `mailto:${request.contactEmail}` : '#'}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            onClick={!session ? (e) => e.preventDefault() : undefined}
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </a>
                          
                          {request.contactPhone && (
                            <a 
                              href={session ? `tel:${request.contactPhone}` : '#'}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                              onClick={!session ? (e) => e.preventDefault() : undefined}
                            >
                              <Phone className="h-4 w-4" />
                              Telefon
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Login overlay for non-authenticated users */}
                      {!session && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-xl flex items-center justify-center p-2">
                          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 text-center sm:text-left">
                            <LogIn className="h-6 w-6 text-gray-600 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900">
                              Přihlaste se pro zobrazení kontaktních údajů
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
                              <Link href="/prihlaseni" className="w-full sm:w-auto">
                                <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-lg w-full">
                                  Přihlásit se
                                </Button>
                              </Link>
                              <Link href="/registrace" className="w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="rounded-lg border-gray-300 w-full">
                                  Registrace
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasActiveFilters, clearFilters }: { hasActiveFilters: boolean; clearFilters: () => void }) {
  return (
    <Card className="border-2 border-rose-100 bg-rose-50/40">
      <CardContent className="p-8 text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Žádné poptávky zatím neodpovídají</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Zkuste upravit filtry nebo se vraťte později – nové poptávky přidáváme průběžně během týdne.
        </p>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-xl border-rose-200 text-rose-600 hover:border-rose-400 hover:text-rose-700"
          >
            Resetovat filtry
          </Button>
        )}
        <Link href="/verejne-zakazky/novy" className="inline-block">
          <Button className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">
            Přidat novou poptávku
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
