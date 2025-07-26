'use client'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { formatDate } from "@/lib/utils"
import { Calendar, Users, MapPin, Euro, Mail, Phone, User, Filter, Search, Clock, X } from "lucide-react"

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
}

const GUEST_COUNT_RANGES = [
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
  const [requests, setRequests] = useState<EventRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: "Všechny",
    guestCount: "all",
    dateRange: "all",
    search: "",
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

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        request.contactName.toLowerCase().includes(searchLower)
      )
    }

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

    return filtered
  }, [requests, filters])

  const clearFilters = () => {
    setFilters({
      location: "Všechny",
      guestCount: "all", 
      dateRange: "all",
      search: "",
    })
  }

  const hasActiveFilters = filters.location !== "Všechny" || 
                          filters.guestCount !== "all" || 
                          filters.dateRange !== "all" || 
                          filters.search !== ""

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-title-1 text-black mb-4">Požadavky na akce</h1>
            <p className="text-sm sm:text-body text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              Aktuální požadavky na event prostory. Kontaktujte organizátory přímo 
              prostřednictvím uvedených kontaktních údajů.
            </p>
          </div>
          
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-title-1 text-black mb-4">Požadavky na akce</h1>
          <p className="text-sm sm:text-body text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            Aktuální požadavky na event prostory. Kontaktujte organizátory přímo 
            prostřednictvím uvedených kontaktních údajů.
          </p>
          <Link href="/pozadavky/novy">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              Přidat požadavek
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtry</h3>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-2" />
                  Vymazat filtry
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Hledat..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* Location Filter */}
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Lokalita" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Guest Count Filter */}
              <Select value={filters.guestCount} onValueChange={(value) => setFilters(prev => ({ ...prev, guestCount: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Počet hostů" />
                </SelectTrigger>
                <SelectContent>
                  {GUEST_COUNT_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Datum přidání" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Zobrazeno {filteredRequests.length} z {requests.length} požadavků
          </p>
          {hasActiveFilters && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Aktivní filtry
            </Badge>
          )}
        </div>

        {/* Event Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-title-3 text-black mb-4">
              {requests.length === 0 ? "Žádné aktivní požadavky" : "Žádné výsledky"}
            </h3>
            <p className="text-body text-gray-600 mb-6 px-4">
              {requests.length === 0 
                ? "Momentálně nejsou k dispozici žádné požadavky na akce."
                : "Zkuste upravit filtry pro zobrazení více výsledků."
              }
            </p>
            {requests.length === 0 ? (
              <Link href="/pozadavky/novy">
                <Button className="bg-black text-white hover:bg-gray-800">Přidat první požadavek</Button>
              </Link>
            ) : (
              <Button onClick={clearFilters} variant="outline">
                Vymazat filtry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request: EventRequest) => {
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
                    <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600" />
                          </div>
                          <span className="font-medium text-slate-900">{request.contactName}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <a 
                            href={`mailto:${request.contactEmail}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </a>
                          
                          {request.contactPhone && (
                            <a 
                              href={`tel:${request.contactPhone}`}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                            >
                              <Phone className="h-4 w-4" />
                              Telefon
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}