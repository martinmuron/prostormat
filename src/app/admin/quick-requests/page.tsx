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
    if (!highlightId) return
    const timer = setTimeout(() => {
      const element = document.getElementById(`quick-request-${highlightId}`)
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

      <div className="space-y-6">
        {requests.map((request) => {
          const statusStyle = statusBadgeStyles[request.status] ?? "bg-gray-100 text-gray-700 border-gray-200"
          const cardHighlight = highlightId === request.id ? "ring-2 ring-emerald-400" : ""

          return (
            <Card key={request.id} id={`quick-request-${request.id}`} className={cn("border border-gray-200 shadow-sm", cardHighlight)}>
              <CardHeader className="flex flex-col gap-4 border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{request.title}</CardTitle>
                    <p className="text-sm text-gray-500">{request.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={statusStyle}>
                      {statusFilter === "all" ? request.status : STATUS_OPTIONS.find((opt) => opt.value === request.status)?.label || request.status}
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Odesláno {request.sentCount}/{request.totalVenues}
                    </Badge>
                    {request.pendingCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Čeká {request.pendingCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Akce: {formatDate(request.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>Hostů: {request.guestCount ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{request.locationPreference || "Bez preference"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{request.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Vytvořeno: {formatDateTime(request.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-gray-400" />
                    <span>Naposledy odesláno: {formatDateTime(request.lastSentAt)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Seznam vhodných prostorů</h3>
                  {request.pendingCount > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSendAll(request.id)}
                      disabled={bulkSendingId === request.id || sendingLogId !== null}
                      className="rounded-lg"
                    >
                      {bulkSendingId === request.id ? (
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
                      {request.logs.map((log) => (
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
                                onClick={() => handleSend(request.id, log.venueId)}
                                disabled={sendingLogId === log.venueId || bulkSendingId === request.id}
                                className="rounded-lg"
                              >
                                {sendingLogId === log.venueId ? (
                                  <Send className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Odeslat"
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
          )
        })}
      </div>
    </div>
  )
}
