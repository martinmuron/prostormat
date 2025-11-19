"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar, Mail, MapPin, Users, RefreshCw, Phone, FileText, ChevronLeft, ChevronRight } from "lucide-react"

interface QuickRequestItem {
  id: string
  title: string
  description: string
  eventType: string
  eventDate?: Date | null
  guestCount?: number | null
  budgetRange?: string | null
  locationPreference?: string | null
  requirements?: string | null
  contactName: string
  contactEmail: string
  contactPhone?: string | null
  createdAt: Date
}

const FILTER_OPTIONS = [
  { value: "upcoming", label: "Aktuální" },
  { value: "past", label: "Proběhlé" },
  { value: "all", label: "Vše" },
] as const

type FilterValue = typeof FILTER_OPTIONS[number]["value"]

const EVENT_TYPE_LABELS: Record<string, string> = {
  "firemni-akce": "Firemní akce",
  "teambuilding": "Teambuilding",
  "svatba": "Svatba",
  "soukroma-akce": "Soukromá akce",
  "konference": "Konference",
  "workshop": "Workshop",
  "narozeniny": "Narozeniny",
  "vecerni-akce": "Večerní akce",
}

function formatDate(date?: Date | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
  }).format(date)
}

function formatDateTime(date?: Date | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export default function OrganizerDashboard() {
  const { data: session, status } = useSession()
  const [requests, setRequests] = useState<QuickRequestItem[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterValue>("upcoming")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      redirect("/prihlaseni")
    }

    const userRole = (session.user as { role?: string } | undefined)?.role
    if (userRole !== "organizer") {
      redirect("/")
    }
  }, [session, status])

  const fetchRequests = useCallback(async (filterVal: FilterValue, page: number = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/organizator/quick-requests?filter=${filterVal}&page=${page}&pageSize=50`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Nepodařilo se načíst poptávky")
      }

      const data = await response.json()

      const normalized: QuickRequestItem[] = data.quickRequests.map((item: {
        id: string
        title: string
        description: string
        eventType: string
        eventDate: string | null
        guestCount?: number | null
        budgetRange?: string | null
        locationPreference?: string | null
        requirements?: string | null
        contactName: string
        contactEmail: string
        contactPhone?: string | null
        createdAt: string
      }) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        eventDate: item.eventDate ? new Date(item.eventDate) : null,
      }))

      setRequests(normalized)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchRequests(filter, currentPage)
    }
  }, [fetchRequests, filter, currentPage, status])

  useEffect(() => {
    if (requests.length === 0) {
      setSelectedRequestId(null)
      return
    }

    const isCurrentSelectionValid = selectedRequestId && requests.some((r) => r.id === selectedRequestId)
    if (!isCurrentSelectionValid) {
      setSelectedRequestId(requests[0]?.id ?? null)
    }
  }, [requests, selectedRequestId])

  const selectedRequest = selectedRequestId
    ? requests.find((r) => r.id === selectedRequestId) ?? null
    : null

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Načítám...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Poptávky</h1>
              <p className="text-sm text-gray-500">Přehled všech poptávek v systému</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={(v) => { setFilter(v as FilterValue); setCurrentPage(1) }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrovat" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => fetchRequests(filter, currentPage)} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Obnovit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
            Načítám poptávky...
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
            Žádné poptávky k zobrazení.
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_1fr]">
            {/* List */}
            <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:h-[calc(100vh-12rem)]">
              <div className="overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm lg:flex-1">
                <div className="divide-y divide-gray-100">
                  {requests.map((request) => {
                    const isSelected = request.id === selectedRequestId

                    return (
                      <button
                        type="button"
                        key={request.id}
                        onClick={() => setSelectedRequestId(request.id)}
                        className={cn(
                          "w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                          isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "flex flex-col gap-2 px-4 py-3",
                          isSelected ? "border-l-4 border-emerald-500" : "border-l-4 border-transparent"
                        )}>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{request.title}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(request.createdAt)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {request.guestCount || "-"}
                            </span>
                            {request.locationPreference && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {request.locationPreference}
                              </span>
                            )}
                            {request.eventDate && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.eventDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-6">
              {selectedRequest ? (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {selectedRequest.title}
                        </CardTitle>
                        <p className="mt-1 text-sm text-gray-500">{selectedRequest.description}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>Typ: {EVENT_TYPE_LABELS[selectedRequest.eventType] || selectedRequest.eventType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Datum: {formatDate(selectedRequest.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>Hostů: {selectedRequest.guestCount ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{selectedRequest.locationPreference || "Bez preference"}</span>
                        </div>
                      </div>

                      {selectedRequest.budgetRange && (
                        <div className="text-sm text-gray-600">
                          <strong>Rozpočet:</strong> {selectedRequest.budgetRange}
                        </div>
                      )}

                      {selectedRequest.requirements && (
                        <div className="text-sm text-gray-600">
                          <strong>Požadavky:</strong> {selectedRequest.requirements}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">Kontaktní údaje</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${selectedRequest.contactEmail}`} className="text-emerald-600 hover:underline">
                          {selectedRequest.contactEmail}
                        </a>
                      </div>
                      {selectedRequest.contactPhone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${selectedRequest.contactPhone}`} className="text-emerald-600 hover:underline">
                            {selectedRequest.contactPhone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Vytvořeno: {formatDateTime(selectedRequest.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500 shadow-sm">
                  Vyberte poptávku vlevo pro zobrazení detailů.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && requests.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-700">
              Strana {currentPage} z {pagination.totalPages} ({pagination.totalCount} poptávek)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
