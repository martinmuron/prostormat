"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { formatDate } from "@/lib/utils"
import { Calendar, MessageSquare, Building, Plus, Send, Heart } from "lucide-react"

interface UserDashboardProps {
  data: {
    user: any
    eventRequests: any[]
    inquiries: any[]
    broadcasts: any[]
    stats: {
      activeRequests: number
      totalRequests: number
      totalInquiries: number
      totalBroadcasts: number
    }
  }
}

export function UserDashboard({ data }: UserDashboardProps) {
  const { user, eventRequests, inquiries, broadcasts, stats } = data
  const [activeTab, setActiveTab] = useState('overview')
  const [favorites, setFavorites] = useState<any[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  const fetchFavorites = async () => {
    setLoadingFavorites(true)
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites()
    }
  }, [activeTab])

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: Building },
    { id: 'requests', label: 'Moje poptávky', icon: Calendar },
    { id: 'broadcasts', label: 'Odeslané poptávky', icon: Send },
    { id: 'favorites', label: 'Uložené prostory', icon: Heart },
  ]

  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Aktivní požadavky</p>
                <p className="text-title-2 text-black">{stats.activeRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem požadavků</p>
                <p className="text-title-2 text-black">{stats.totalRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Odeslané dotazy</p>
                <p className="text-title-2 text-black">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Poptávky prostorům</p>
                <p className="text-title-2 text-black">{stats.totalBroadcasts}</p>
              </div>
              <Send className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests Preview */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Nedávné poptávky</CardTitle>
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
            {eventRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 mb-4">
                  Zatím jste nevytvořili žádné požadavky
                </p>
                <Link href="/pozadavky/novy">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Vytvořit první požadavek</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {eventRequests.slice(0, 3).map((request: any) => {
                  const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-callout font-medium text-black">{request.title}</h4>
                        <Badge 
                          variant={request.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {request.status === "active" ? "Aktivní" : "Neaktivní"}
                        </Badge>
                      </div>
                      <p className="text-caption text-gray-600 mb-2">{eventTypeLabel}</p>
                      <p className="text-caption text-gray-500">
                        Vytvořeno {formatDate(new Date(request.createdAt))}
                      </p>
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
              <CardTitle className="text-gray-900">Nedávné odeslané poptávky</CardTitle>
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
                {broadcasts.slice(0, 3).map((broadcast: any) => {
                  const eventTypeLabel = EVENT_TYPES[broadcast.eventType as EventType] || broadcast.eventType
                  return (
                    <div key={broadcast.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-callout font-medium text-black">{broadcast.title}</h4>
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          {broadcast.logs.length} prostorů
                        </Badge>
                      </div>
                      <p className="text-caption text-gray-600 mb-2">{eventTypeLabel}</p>
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
          <CardTitle className="text-gray-900">Všechny moje poptávky</CardTitle>
          <Link href="/pozadavky/novy">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nový požadavek
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {eventRequests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné poptávky</h3>
            <p className="text-body text-gray-600 mb-6">
              Zatím jste nevytvořili žádné požadavky na akci
            </p>
            <Link href="/pozadavky/novy">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Vytvořit první požadavek
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {eventRequests.map((request: any) => {
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
                      {request.status === "active" ? "Aktivní" : "Neaktivní"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Vytvořeno {formatDate(new Date(request.createdAt))}</span>
                    <div className="flex gap-2">
                      <span>{request.guestCount || 0} hostů</span>
                      <span>•</span>
                      <span>{request.budgetRange || "Bez rozpočtu"}</span>
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
            {broadcasts.map((broadcast: any) => {
              const eventTypeLabel = EVENT_TYPES[broadcast.eventType as EventType] || broadcast.eventType
              return (
                <div key={broadcast.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{broadcast.title}</h4>
                      <p className="text-gray-600 mb-2">{eventTypeLabel}</p>
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
                        {broadcast.logs.slice(0, 5).map((log: any) => (
                          <Link 
                            key={log.venue.id}
                            href={`/prostory/${log.venue.slug}`}
                            className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            {log.venue.name}
                          </Link>
                        ))}
                        {broadcast.logs.length > 5 && (
                          <span className="text-sm text-gray-500 px-3 py-1">
                            +{broadcast.logs.length - 5} dalších
                          </span>
                        )}
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
      case 'favorites':
        return renderFavorites()
      default:
        return renderOverview()
    }
  }

  const renderFavorites = () => (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900">Uložené prostory</CardTitle>
          <Link href="/prostory">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Building className="h-4 w-4 mr-2" />
              Prohlédnout prostory
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loadingFavorites ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítání oblíbených prostorů...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné oblíbené prostory</h3>
            <p className="text-body text-gray-600 mb-6">
              Zatím nemáte žádné uložené prostory. Klikněte na srdíčko u prostoru, který se vám líbí.
            </p>
            <Link href="/prostory">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Building className="h-4 w-4 mr-2" />
                Prohlédnout prostory
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {favorites.map((venue: any) => (
              <div key={venue.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {venue.images && venue.images.length > 0 ? (
                    <img 
                      src={venue.images[0]} 
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{venue.name}</h4>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Heart className="h-3 w-3 mr-1" />
                      Oblíbené
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {venue.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{venue.capacitySeated || 0} míst k sezení</span>
                    <span>Uloženo {formatDate(new Date(venue.favoritedAt))}</span>
                  </div>
                  <Link href={`/prostory/${venue.slug}`}>
                    <Button variant="secondary" size="sm" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                      <Building className="h-4 w-4 mr-2" />
                      Zobrazit prostor
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-1 text-gray-900 mb-2">
          Vítejte zpět, {user.name}!
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