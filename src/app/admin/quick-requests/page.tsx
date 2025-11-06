"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar, Mail, MapPin, Users, RefreshCw, Send, Zap } from "lucide-react"

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

  const fetchRequests = useCallback(async (status: StatusValue) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/quick-requests?status=${status}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Nepodařilo se načíst rychlé poptávky")
      }

      const data = (await response.json()) as { quickRequests: ApiQuickRequest[] }

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
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests(statusFilter)
  }, [fetchRequests, statusFilter])

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

  const updateRequest = useCallback((requestId: string, updater: (request: QuickRequestItem) => QuickRequestItem) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? updater(req) : req)))
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
      try {
        const response = await fetch(`/api/admin/quick-requests/${requestId}/send-all`, {
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
        setBulkSendingId(null)
      }
    },
    [updateRequest]
  )

  const selectedRequest = selectedRequestId ? requests.find((request) => request.id === selectedRequestId) ?? null : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rychlé poptávky</h1>
          <p className="text-sm text-gray-500">Přehled poptávek, které je potřeba manuálně odeslat provozovatelům.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(value: StatusValue) => setStatusFilter(value)}>
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
          <Button variant="outline" onClick={() => fetchRequests(statusFilter)} disabled={loading}>
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
                    </div>
                  </div>
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Seznam vhodných prostorů</h3>
                      <p className="text-xs text-gray-500">
                        Vyberte prostor a odešlete email jednotlivě nebo využijte hromadné odeslání.
                      </p>
                    </div>
                    {selectedRequest.pendingCount > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSendAll(selectedRequest.id)}
                        disabled={bulkSendingId === selectedRequest.id || sendingLogId !== null}
                        className="rounded-lg"
                      >
                        {bulkSendingId === selectedRequest.id ? (
                          <Send className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Odeslat všem
                          </>
                        )}
                      </Button>
                    )}
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
                        {selectedRequest.logs.map((log) => (
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
    </div>
  )
}
