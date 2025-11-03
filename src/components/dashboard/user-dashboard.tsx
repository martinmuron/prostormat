"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { formatDate } from "@/lib/utils"
import { Calendar, Building, Plus, Send, Pencil } from "lucide-react"
import type { UserDashboardData } from "@/types/dashboard"

interface UserDashboardProps {
  data: UserDashboardData
}

export function UserDashboard({ data }: UserDashboardProps) {
  const { user, eventRequests, broadcasts, stats } = data
  const [activeTab, setActiveTab] = useState('overview')
  const [userRequests, setUserRequests] = useState(eventRequests)
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: Building },
    { id: 'requests', label: 'Aktivní poptávky', icon: Calendar },
    { id: 'broadcasts', label: 'Odeslané poptávky prostorům', icon: Send },
  ]

  const activeRequestCount = userRequests.filter((request) => request.status === "active").length

  const statusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktivní"
      case "closed":
        return "Uzavřená"
      default:
        return "Neaktivní"
    }
  }

  const handleRequestStatusChange = async (requestId: string, nextStatus: "active" | "closed") => {
    try {
      setUpdatingRequestId(requestId)
      setRequestError(null)

      const response = await fetch(`/api/event-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "Nepodařilo se upravit stav poptávky")
      }

      setUserRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: nextStatus } : request,
        ),
      )
    } catch (error) {
      console.error("Error updating request status:", error)
      setRequestError(
        error instanceof Error
          ? error.message
          : "Nepodařilo se upravit stav poptávky. Zkuste to prosím znovu.",
      )
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Aktivní poptávky</p>
                <p className="text-title-2 text-black">{activeRequestCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Odeslané poptávky prostorům</p>
                <p className="text-title-2 text-black">{stats.totalBroadcasts}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Send className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests Preview */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Aktivní poptávky na Event Boardu</CardTitle>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setActiveTab('requests')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Zobrazit všechny
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requestError && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {requestError}
              </div>
            )}
            {userRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 mb-4">
                  Zatím jste nevytvořili žádné poptávky
                </p>
                <Link href="/event-board/novy">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Vytvořit první poptávku</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.slice(0, 3).map((request) => {
                  const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-callout font-medium text-black">{request.title}</h4>
                        <Badge 
                          variant={request.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {statusLabel(request.status)}
                        </Badge>
                      </div>
                      <p className="text-caption text-gray-600 mb-2">{eventTypeLabel}</p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-caption text-gray-500">
                        <p className="text-gray-500">Vytvořeno {formatDate(new Date(request.createdAt))}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/event-board/${request.id}/upravit`}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Upravit
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestStatusChange(request.id, request.status === "active" ? "closed" : "active")}
                            disabled={updatingRequestId === request.id}
                          >
                            {request.status === "active" ? "Uzavřít" : "Znovu otevřít"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Broadcasts Preview */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Odeslané poptávky prostorům</CardTitle>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setActiveTab('broadcasts')}
              >
                <Send className="h-4 w-4 mr-2" />
                Zobrazit všechny
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {broadcasts.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 mb-4">
                  Zatím jste neodeslali žádnou poptávku
                </p>
                <Link href="/poptavka-prostoru">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Vytvořit první poptávku</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {broadcasts.slice(0, 3).map((broadcast) => {
                  return (
                    <div key={broadcast.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-callout font-medium text-black">{broadcast.title}</h4>
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          {broadcast.logs.length} prostorů
                        </Badge>
                      </div>
                      <p className="text-caption text-gray-500">
                        Odesláno {formatDate(new Date(broadcast.createdAt))}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderRequests = () => (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900">Všechny aktivní poptávky</CardTitle>
          <Link href="/event-board/novy">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nová poptávka
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {userRequests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné poptávky</h3>
            <p className="text-body text-gray-600 mb-6">
              Zatím jste nevytvořili žádné poptávky na akci
            </p>
            <Link href="/event-board/novy">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Vytvořit první poptávku
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userRequests.map((request) => {
              const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
              return (
                <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{request.title}</h4>
                      <p className="text-gray-600 mb-2">{eventTypeLabel}</p>
                      {request.description && (
                        <p className="text-gray-600 line-clamp-2">{request.description}</p>
                      )}
                    </div>
                    <Badge 
                      variant={request.status === "active" ? "default" : "secondary"}
                      className={request.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {statusLabel(request.status)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                    <span>Vytvořeno {formatDate(new Date(request.createdAt))}</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span>{request.guestCount || 0} hostů</span>
                        <span>•</span>
                        <span>{request.budgetRange || "Bez rozpočtu"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/event-board/${request.id}/upravit`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          Upravit
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestStatusChange(request.id, request.status === "active" ? "closed" : "active")}
                          disabled={updatingRequestId === request.id}
                        >
                          {request.status === "active" ? "Uzavřít" : "Znovu otevřít"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderBroadcasts = () => (
      <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900">Všechny odeslané poptávky</CardTitle>
          <Link href="/poptavka-prostoru">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Send className="h-4 w-4 mr-2" />
              Nová poptávka
            </Button>
          </Link>
        </div>
      </CardHeader>
          <CardContent>
            {requestError && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {requestError}
              </div>
            )}
            {broadcasts.length === 0 ? (
          <div className="text-center py-12">
            <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné poptávky</h3>
            <p className="text-body text-gray-600 mb-6">
              Zatím jste neodeslali žádnou poptávku prostorům
            </p>
            <Link href="/poptavka-prostoru">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="h-4 w-4 mr-2" />
                Vytvořit první poptávku
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast) => {
              return (
                <div key={broadcast.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{broadcast.title}</h4>
                      {broadcast.description && (
                        <p className="text-gray-600 line-clamp-2">{broadcast.description}</p>
                      )}
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {broadcast.logs.length} prostorů
                    </Badge>
                  </div>
                  {broadcast.logs.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Odeslané prostory:</p>
                      <div className="flex flex-wrap gap-2">
                        {broadcast.logs.slice(0, 5).map((log) => {
                          const statusColor = {
                            'sent': 'bg-green-100 text-green-800 border-green-200',
                            'failed': 'bg-red-100 text-red-800 border-red-200',
                            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                            'skipped': 'bg-gray-100 text-gray-800 border-gray-200'
                          }[log.emailStatus as string] || 'bg-blue-100 text-blue-800 border-blue-200'
                          
                          const statusIcon = {
                            'sent': '✓',
                            'failed': '✗',
                            'pending': '⏳',
                            'skipped': '⊘'
                          }[log.emailStatus as string] || '📧'

                          return (
                            <Link 
                              key={log.venue.id}
                              href={`/prostory/${log.venue.slug}`}
                              className={`text-sm px-3 py-1 rounded-full hover:opacity-80 transition-opacity border ${statusColor}`}
                              title={`${log.venue.name} - Email: ${log.emailStatus}${log.emailError ? ` (${log.emailError})` : ''}`}
                            >
                              <span className="mr-1">{statusIcon}</span>
                              {log.venue.name}
                            </Link>
                          )
                        })}
                        {broadcast.logs.length > 5 && (
                          <span className="text-sm text-gray-500 px-3 py-1">
                            +{broadcast.logs.length - 5} dalších
                          </span>
                        )}
                      </div>
                      {/* Email status summary */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {['sent', 'failed', 'pending', 'skipped'].map(status => {
                            const count = broadcast.logs.filter((log) => log.emailStatus === status).length
                            if (count === 0) return null
                            
                            const statusLabels = {
                              'sent': 'Odesláno',
                              'failed': 'Chyba',
                              'pending': 'Čeká',
                              'skipped': 'Přeskočeno'
                            }
                            
                            return (
                              <span key={status} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
                                {statusLabels[status as keyof typeof statusLabels]}: {count}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Odesláno {formatDate(new Date(broadcast.createdAt))}</span>
                    <div className="flex gap-2">
                      <span>{broadcast.guestCount || 0} hostů</span>
                      <span>•</span>
                      <span>{broadcast.budgetRange || "Bez rozpočtu"}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'requests':
        return renderRequests()
      case 'broadcasts':
        return renderBroadcasts()
      default:
        return renderOverview()
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-1 text-gray-900 mb-2">
          Vítejte zpět, {user.email}!
        </h1>
        <p className="text-body text-gray-600">
          Přehled vašich aktivit na Prostormatu
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}
