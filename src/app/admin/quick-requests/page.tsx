"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar, Mail, MapPin, Users, RefreshCw, Send, Trash, Zap, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface VenueTypeCount {
  type: string
  count: number
  label: string
}

interface QuickRequestLog {
  id: string
  venueId: string
  emailStatus: string
  emailError?: string | null
  resendEmailId?: string | null
  sentAt?: Date | null
  venue: {
    id: string
    name: string
    district?: string | null
    capacityStanding?: number | null
    capacitySeated?: number | null
    contactEmail?: string | null
    venueTypes?: string[]
  }
}

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
  status: string
  sentCount: number
  lastSentAt?: Date | null
  totalVenues: number
  pendingCount: number
  logs: QuickRequestLog[]
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Čekající" },
  { value: "partial", label: "Částečně odeslané" },
  { value: "completed", label: "Odeslané" },
  { value: "all", label: "Vše" },
] as const

type StatusValue = typeof STATUS_OPTIONS[number]["value"]

type ApiLog = Omit<QuickRequestLog, "sentAt"> & { sentAt: string | null }
type ApiQuickRequest = Omit<QuickRequestItem, "createdAt" | "lastSentAt" | "logs" | "eventDate"> & {
  createdAt: string
  lastSentAt: string | null
  eventDate: string | null
  logs: ApiLog[]
}

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  partial: "bg-sky-100 text-sky-800 border-sky-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const emailStatusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  sent: "bg-emerald-100 text-emerald-700",
  delivered: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  skipped: "bg-slate-100 text-slate-700",
  bounced: "bg-red-100 text-red-800 border-red-300",
  complained: "bg-orange-100 text-orange-800 border-orange-300",
  delayed: "bg-yellow-100 text-yellow-800 border-yellow-300",
}

function toDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
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

function formatCapacity(log: QuickRequestLog) {
  const parts: string[] = []
  if (log.venue.capacitySeated) {
    parts.push(`Sezení: ${log.venue.capacitySeated}`)
  }
  if (log.venue.capacityStanding) {
    parts.push(`Stání: ${log.venue.capacityStanding}`)
  }
  return parts.join(" · ") || "-"
}

export default function AdminQuickRequestsPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")

  const [requests, setRequests] = useState<QuickRequestItem[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusValue>("pending")
  const [sendingLogId, setSendingLogId] = useState<string | null>(null)
  const [bulkSendingId, setBulkSendingId] = useState<string | null>(null)
  const [resendingFailedId, setResendingFailedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([])
  const [venueTypeCounts, setVenueTypeCounts] = useState<VenueTypeCount[]>([])
  const [pollingRequestId, setPollingRequestId] = useState<string | null>(null)
  const [progressPercent, setProgressPercent] = useState(0)

  const fetchRequests = useCallback(async (status: StatusValue, page: number = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/quick-requests?status=${status}&page=${page}&pageSize=50`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Nepodařilo se načíst rychlé poptávky")
      }

      const data = (await response.json()) as {
        quickRequests: ApiQuickRequest[]
        pagination: {
          page: number
          pageSize: number
          totalCount: number
          totalPages: number
          hasNextPage: boolean
          hasPreviousPage: boolean
        }
      }

      const normalized: QuickRequestItem[] = data.quickRequests.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastSentAt: toDate(item.lastSentAt),
        eventDate: toDate(item.eventDate),
        logs: item.logs.map((log) => ({
          ...log,
          sentAt: toDate(log.sentAt),
        })),
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
    // Don't auto-refresh while sending emails (polling handles updates)
    if (bulkSendingId) return
    fetchRequests(statusFilter, currentPage)
  }, [fetchRequests, statusFilter, currentPage, bulkSendingId])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handleStatusFilterChange = useCallback((newStatus: StatusValue) => {
    setStatusFilter(newStatus)
    setCurrentPage(1)
  }, [])

  const fetchVenueTypeCounts = useCallback(async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/quick-requests/${requestId}/venue-types`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch venue types")
      }

      const data = await response.json()
      setVenueTypeCounts(data.venueTypes || [])
    } catch (err) {
      console.error("Error fetching venue types:", err)
      setVenueTypeCounts([])
    }
  }, [])

  // Fetch venue type counts when selected request changes
  useEffect(() => {
    if (selectedRequestId) {
      fetchVenueTypeCounts(selectedRequestId)
      setSelectedVenueTypes([]) // Reset filter when switching requests
    } else {
      setVenueTypeCounts([])
      setSelectedVenueTypes([])
    }
  }, [selectedRequestId, fetchVenueTypeCounts])

  useEffect(() => {
    if (requests.length === 0) {
      if (selectedRequestId !== null) {
        setSelectedRequestId(null)
      }
      return
    }

    if (highlightId && requests.some((request) => request.id === highlightId)) {
      if (selectedRequestId !== highlightId) {
        setSelectedRequestId(highlightId)
      }
      return
    }

    const isCurrentSelectionValid = selectedRequestId && requests.some((request) => request.id === selectedRequestId)
    if (!isCurrentSelectionValid) {
      setSelectedRequestId(requests[0]?.id ?? null)
    }
  }, [requests, highlightId, selectedRequestId])

  useEffect(() => {
    if (!highlightId) return
    const timer = setTimeout(() => {
      const element = document.getElementById(`quick-request-list-${highlightId}`) ?? document.getElementById("quick-request-detail")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [highlightId, requests])

  // Polling for real-time progress updates
  useEffect(() => {
    if (!pollingRequestId) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/admin/quick-requests/${pollingRequestId}/status`, {
          cache: "no-store",
        })

        if (!response.ok) return

        const data = await response.json()

        // Update the request in the list
        updateRequest(pollingRequestId, (request) => ({
          ...request,
          sentCount: data.sentCount,
          pendingCount: data.pendingCount,
          status: data.status,
          lastSentAt: data.lastSentAt ? new Date(data.lastSentAt) : request.lastSentAt,
        }))

        // Update progress percentage
        const percent = data.totalVenues > 0 ? Math.round((data.sentCount / data.totalVenues) * 100) : 0
        setProgressPercent(percent)

        // Stop polling when completed
        if (data.status === "completed" || data.pendingCount === 0) {
          setPollingRequestId(null)
          setProgressPercent(0)
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000)
    pollStatus() // Initial poll

    return () => clearInterval(interval)
  }, [pollingRequestId])

  // Prevent page unload during email sending
  useEffect(() => {
    if (!bulkSendingId) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Odesílání emailů probíhá. Opravdu chcete opustit stránku?"
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [bulkSendingId])

  const updateRequest = useCallback((requestId: string, updater: (request: QuickRequestItem) => QuickRequestItem) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? updater(req) : req)))
  }, [])

  const toggleVenueType = useCallback((type: string) => {
    setSelectedVenueTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const clearVenueTypeFilters = useCallback(() => {
    setSelectedVenueTypes([])
  }, [])

  const handleSend = useCallback(
    async (requestId: string, venueId?: string) => {
      setSendingLogId(venueId ?? null)
      try {
        const response = await fetch(`/api/admin/quick-requests/${requestId}/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ venueId }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Odeslání se nezdařilo")
        }

        const data = await response.json()

        updateRequest(requestId, (request) => {
          const sentSet = new Set<string>(data.sent as string[])
          const failedMap = new Map<string, string>(
            (data.failed as { venueId: string; error: string }[]).map((item: { venueId: string; error: string }) => [item.venueId, item.error])
          )

          const updatedLogs = request.logs.map((log) => {
            if (sentSet.has(log.venueId)) {
              return {
                ...log,
                emailStatus: "sent",
                emailError: null,
                sentAt: new Date(),
              }
            }

            if (failedMap.has(log.venueId)) {
              return {
                ...log,
                emailStatus: "failed",
                emailError: failedMap.get(log.venueId) || "Chyba",
              }
            }

            return log
          })

          return {
            ...request,
            logs: updatedLogs,
            pendingCount: data.remaining,
            status: data.broadcast?.status ?? request.status,
            sentCount: data.broadcast?.sentCount ?? request.sentCount,
            lastSentAt: data.broadcast?.lastSentAt ? new Date(data.broadcast.lastSentAt) : request.lastSentAt,
          }
        })

        if (data.failed?.length) {
          const failures = (data.failed as { venueId: string; error: string }[])
            .map((item) => `• ${item.venueId}: ${item.error}`)
            .join("\n")
          alert(`Některým prostorům se email nepodařilo odeslat:\n${failures}`)
        }
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : "Odeslání se nezdařilo")
      } finally {
        setSendingLogId(null)
      }
    },
    [updateRequest]
  )

  const handleSendAll = useCallback(
    async (requestId: string) => {
      setBulkSendingId(requestId)
      setPollingRequestId(requestId) // Start polling for real-time progress
      setProgressPercent(0)

      try {
        const response = await fetch(`/api/admin/quick-requests/${requestId}/send-all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venueTypes: selectedVenueTypes.length > 0 ? selectedVenueTypes : undefined,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Odeslání se nezdařilo")
        }

        const data = await response.json()

        updateRequest(requestId, (request) => {
          const sentSet = new Set<string>(data.sent as string[])
          const failedMap = new Map<string, string>(
            (data.failed as { venueId: string; error: string }[]).map((item: { venueId: string; error: string }) => [item.venueId, item.error])
          )

          const updatedLogs = request.logs.map((log) => {
            if (sentSet.has(log.venueId)) {
              return {
                ...log,
                emailStatus: "sent",
                emailError: null,
                sentAt: new Date(),
              }
            }

            if (failedMap.has(log.venueId)) {
              return {
                ...log,
                emailStatus: "failed",
                emailError: failedMap.get(log.venueId) || "Chyba",
              }
            }

            return log
          })

          return {
            ...request,
            logs: updatedLogs,
            pendingCount: data.remaining,
            status: data.broadcast?.status ?? request.status,
            sentCount: data.broadcast?.sentCount ?? request.sentCount,
            lastSentAt: data.broadcast?.lastSentAt ? new Date(data.broadcast.lastSentAt) : request.lastSentAt,
          }
        })

        if (data.failed?.length) {
          const failures = (data.failed as { venueId: string; error: string }[])
            .map((item) => `• ${item.venueId}: ${item.error}`)
            .join("\n")
          alert(`Některým prostorům se email nepodařilo odeslat:\n${failures}`)
        }
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : "Odeslání se nezdařilo")
        setPollingRequestId(null) // Stop polling on error
        setProgressPercent(0)
      } finally {
        setBulkSendingId(null)
      }
    },
    [updateRequest, selectedVenueTypes]
  )

  const handleResendFailed = useCallback(
    async (requestId: string) => {
      const request = requests.find((r) => r.id === requestId)
      if (!request) return

      const failedVenues = request.logs.filter((log) =>
        log.emailStatus === "failed" ||
        log.emailStatus === "bounced" ||
        log.emailStatus === "complained"
      )

      if (failedVenues.length === 0) {
        alert("Nejsou žádné nedoručené emaily k opětovnému odeslání.")
        return
      }

      const confirmed = window.confirm(
        `Opravdu chcete znovu odeslat email ${failedVenues.length} prostorům, kterým se předchozí doručení nezdařilo?`
      )
      if (!confirmed) return

      setResendingFailedId(requestId)
      try {
        const response = await fetch(`/api/admin/quick-requests/${requestId}/resend-failed`, {
          method: "POST",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Odeslání se nezdařilo")
        }

        const data = await response.json()

        updateRequest(requestId, (request) => {
          const sentSet = new Set<string>(data.sent as string[])
          const failedMap = new Map<string, string>(
            (data.failed as { venueId: string; error: string }[]).map((item: { venueId: string; error: string }) => [item.venueId, item.error])
          )

          const updatedLogs = request.logs.map((log) => {
            if (sentSet.has(log.venueId)) {
              return {
                ...log,
                emailStatus: "sent",
                emailError: null,
                sentAt: new Date(),
              }
            }

            if (failedMap.has(log.venueId)) {
              return {
                ...log,
                emailStatus: "failed",
                emailError: failedMap.get(log.venueId) || "Chyba",
              }
            }

            return log
          })

          return {
            ...request,
            logs: updatedLogs,
            pendingCount: data.remaining,
            status: data.broadcast?.status ?? request.status,
            sentCount: data.broadcast?.sentCount ?? request.sentCount,
            lastSentAt: data.broadcast?.lastSentAt ? new Date(data.broadcast.lastSentAt) : request.lastSentAt,
          }
        })

        const successCount = (data.sent as string[]).length
        if (successCount > 0) {
          alert(`Úspěšně odesláno ${successCount} z ${failedVenues.length} prostorům.`)
        }

        if (data.failed?.length) {
          const failures = (data.failed as { venueId: string; error: string }[])
            .map((item) => `• ${item.venueId}: ${item.error}`)
            .join("\n")
          alert(`Některým prostorům se email stále nepodařilo odeslat:\n${failures}`)
        }
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : "Odeslání se nezdařilo")
      } finally {
        setResendingFailedId(null)
      }
    },
    [requests, updateRequest]
  )

  const selectedRequest = selectedRequestId ? requests.find((request) => request.id === selectedRequestId) ?? null : null

  // Filter logs by selected venue types
  const filteredLogs = useMemo(() => {
    if (!selectedRequest || selectedVenueTypes.length === 0) {
      return selectedRequest?.logs || []
    }

    return selectedRequest.logs.filter((log) => {
      // Check if venue has any of the selected types
      const venueTypes = log.venue.venueTypes || []
      return venueTypes.some((type: string) => selectedVenueTypes.includes(type))
    })
  }, [selectedRequest, selectedVenueTypes])

  const filteredPendingCount = useMemo(() => {
    return filteredLogs.filter((log) => log.emailStatus === "pending").length
  }, [filteredLogs])

  const handleDelete = useCallback(
    async (requestId: string) => {
      const confirmed = window.confirm("Opravdu chcete tuto poptávku smazat? Tuto akci nelze vrátit.")
      if (!confirmed) {
        return
      }

      setDeletingId(requestId)

      try {
        const response = await fetch(`/api/admin/quick-requests/${requestId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Smazání poptávky se nezdařilo")
        }

        setRequests((prev) => prev.filter((req) => req.id !== requestId))
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : "Smazání poptávky se nezdařilo")
      } finally {
        setDeletingId(null)
      }
    },
    []
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rychlé poptávky</h1>
          <p className="text-sm text-gray-500">Přehled poptávek, které je potřeba manuálně odeslat provozovatelům.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrovat stav" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchRequests(statusFilter, currentPage)} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Obnovit
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {statusFilter === "pending" && (
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-800">
            <Zap className="h-4 w-4" />
            Čeká na odeslání: {requests.filter((req) => req.pendingCount > 0).length}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
            <Send className="h-4 w-4" />
            Celkem emailů k odeslání: {requests.reduce((sum, req) => sum + req.pendingCount, 0)}
          </span>
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
          Načítám rychlé poptávky...
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
          V tomto stavu nejsou žádné rychlé poptávky.
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_1fr]">
          <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm lg:flex-1">
              <div className="divide-y divide-gray-100">
                {requests.map((request) => {
                  const isSelected = request.id === selectedRequestId
                  const statusStyle = statusBadgeStyles[request.status] ?? "bg-gray-100 text-gray-700 border-gray-200"

                  return (
                    <button
                      type="button"
                      key={request.id}
                      id={`quick-request-list-${request.id}`}
                      onClick={() => setSelectedRequestId(request.id)}
                      className={cn(
                        "w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                        isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex flex-col gap-3 px-4 py-3",
                          isSelected ? "border-l-4 border-emerald-500" : "border-l-4 border-transparent"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{request.title}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(request.createdAt)}</p>
                          </div>
                          <Badge variant="outline" className={statusStyle}>
                            {statusFilter === "all"
                              ? request.status
                              : STATUS_OPTIONS.find((opt) => opt.value === request.status)?.label || request.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                            <Send className="h-3 w-3" />
                            {request.sentCount}/{request.totalVenues}
                          </span>
                          {request.pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                              <Zap className="h-3 w-3" />
                              Čeká {request.pendingCount}
                            </span>
                          )}
                          {bulkSendingId === request.id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
                              <Send className="h-3 w-3 animate-pulse" />
                              Odesílá se...
                            </span>
                          )}
                          {request.locationPreference && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {request.locationPreference}
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

          <div id="quick-request-detail" className="space-y-6">
            {selectedRequest ? (
              <Card
                key={selectedRequest.id}
                id={`quick-request-${selectedRequest.id}`}
                className="border border-gray-200 shadow-sm"
              >
                <CardHeader className="flex flex-col gap-4 border-b border-gray-100 pb-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">{selectedRequest.title}</CardTitle>
                      <p className="text-sm text-gray-500">{selectedRequest.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={statusBadgeStyles[selectedRequest.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}
                      >
                        {statusFilter === "all"
                          ? selectedRequest.status
                          : STATUS_OPTIONS.find((opt) => opt.value === selectedRequest.status)?.label ||
                            selectedRequest.status}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Odesláno {selectedRequest.sentCount}/{selectedRequest.totalVenues}
                      </Badge>
                      {selectedRequest.pendingCount > 0 && (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                          Čeká {selectedRequest.pendingCount}
                        </Badge>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedRequest.id)}
                        disabled={deletingId === selectedRequest.id || loading}
                        className="rounded-lg"
                      >
                        {deletingId === selectedRequest.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash className="h-4 w-4" />
                            Smazat
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Real-time Progress Bar */}
                  {pollingRequestId === selectedRequest.id && bulkSendingId === selectedRequest.id && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4 text-blue-600 animate-pulse" />
                          <span className="text-sm font-medium text-blue-900">Odesílání emailů...</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-900">
                          {selectedRequest.sentCount}/{selectedRequest.totalVenues} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Pokrok se aktualizuje každé 2 sekundy. Prosím nevypínejte tuto stránku.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Akce: {formatDate(selectedRequest.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Hostů: {selectedRequest.guestCount ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.locationPreference || "Bez preference"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Vytvořeno: {formatDateTime(selectedRequest.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-gray-400" />
                      <span>Naposledy odesláno: {formatDateTime(selectedRequest.lastSentAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Venue Type Filter */}
                  {venueTypeCounts.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Filter className="h-4 w-4 text-gray-600" />
                        <Label className="text-sm font-semibold text-gray-800">Filtrovat podle typu prostoru</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {venueTypeCounts.map(({ type, count, label }) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`venue-type-${type}`}
                              checked={selectedVenueTypes.includes(type)}
                              onCheckedChange={() => toggleVenueType(type)}
                            />
                            <label
                              htmlFor={`venue-type-${type}`}
                              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {label} ({count})
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedVenueTypes.length > 0 && (
                        <div className="mt-3 flex items-center justify-between border-t border-gray-300 pt-3">
                          <span className="text-sm text-gray-700">
                            Filtrováno: <span className="font-semibold">{filteredLogs.length}</span> z <span className="font-semibold">{selectedRequest.logs.length}</span> prostorů
                            {filteredPendingCount > 0 && (
                              <span className="ml-2 text-amber-700">
                                ({filteredPendingCount} čeká na odeslání)
                              </span>
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearVenueTypeFilters}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Zrušit filtr
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Seznam vhodných prostorů</h3>
                      <p className="text-xs text-gray-500">
                        Vyberte prostor a odešlete email jednotlivě nebo využijte hromadné odeslání.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const failedCount = selectedRequest.logs.filter(
                          (log) => log.emailStatus === "failed" || log.emailStatus === "bounced" || log.emailStatus === "complained"
                        ).length
                        return failedCount > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendFailed(selectedRequest.id)}
                            disabled={resendingFailedId === selectedRequest.id || bulkSendingId === selectedRequest.id || sendingLogId !== null}
                            className="rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          >
                            {resendingFailedId === selectedRequest.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Odeslat znovu nedoručeným ({failedCount})
                              </>
                            )}
                          </Button>
                        ) : null
                      })()}
                      {filteredPendingCount > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSendAll(selectedRequest.id)}
                          disabled={bulkSendingId === selectedRequest.id || resendingFailedId === selectedRequest.id || sendingLogId !== null}
                          className="rounded-lg"
                        >
                          {bulkSendingId === selectedRequest.id ? (
                            <Send className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              {selectedVenueTypes.length > 0
                                ? `Odeslat filtrovaným (${filteredPendingCount})`
                                : "Odeslat všem"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-4 py-2 text-left">Prostor</th>
                          <th className="px-4 py-2 text-left">Kapacita</th>
                          <th className="px-4 py-2 text-left">Stav</th>
                          <th className="px-4 py-2 text-left">Akce</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="align-top">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{log.venue.name}</div>
                              <div className="text-xs text-gray-500">{log.venue.district || "Bez lokality"}</div>
                              {log.venue.contactEmail && (
                                <div className="text-xs text-gray-500">{log.venue.contactEmail}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{formatCapacity(log)}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={emailStatusStyles[log.emailStatus] || "bg-gray-100 text-gray-700"}>
                                {log.emailStatus}
                              </Badge>
                              {log.emailError && (
                                <div className="mt-1 text-xs text-rose-600">{log.emailError}</div>
                              )}
                              {log.sentAt && (
                                <div className="mt-1 text-xs text-gray-500">{formatDateTime(log.sentAt)}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {log.emailStatus === "pending" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSend(selectedRequest.id, log.venueId)}
                                  disabled={sendingLogId === log.venueId || bulkSendingId === selectedRequest.id}
                                  className="rounded-lg"
                                >
                                  {sendingLogId === log.venueId ? (
                                    <Send className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Odeslat"
                                  )}
                                </Button>
                              ) : log.emailStatus === "sent" || log.emailStatus === "failed" || log.emailStatus === "bounced" || log.emailStatus === "complained" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSend(selectedRequest.id, log.venueId)}
                                  disabled={sendingLogId === log.venueId || bulkSendingId === selectedRequest.id}
                                  className="rounded-lg text-xs"
                                >
                                  {sendingLogId === log.venueId ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="h-3 w-3" />
                                      Znovu
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

      {!loading && requests.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Předchozí
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Další
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Zobrazeno{" "}
                <span className="font-medium">{(currentPage - 1) * pagination.pageSize + 1}</span>
                {" "}-{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.pageSize, pagination.totalCount)}
                </span>
                {" "}z{" "}
                <span className="font-medium">{pagination.totalCount}</span> poptávek
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="rounded-l-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Předchozí</span>
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1
                    return (
                      <div key={page} className="inline-flex">
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <Button
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "rounded-none",
                            page === currentPage && "z-10"
                          )}
                        >
                          {page}
                        </Button>
                      </div>
                    )
                  })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="rounded-r-md"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Další</span>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
