import { Suspense } from "react"

// Force dynamic rendering to avoid caching issues
export const revalidate = 0
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"
import { EVENT_TYPES } from "@/types"
import type { EventType } from "@/types"
import { formatDate } from "@/lib/utils"
import { Calendar, Users, MapPin, Euro, Mail, Phone, User } from "lucide-react"

async function getEventRequests() {
  try {
    const requests = await db.eventRequest.findMany({
      where: {
        status: "active",
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    })
    
    
    return requests
  } catch (error) {
    console.error("Error fetching event requests:", error)
    return []
  }
}

function EventRequestSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20 self-start" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-16" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20" />
          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function EventRequestsList() {
  const requests = await getEventRequests()

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <h3 className="text-title-3 text-black mb-4">Žádné aktivní požadavky</h3>
        <p className="text-body text-gray-600 mb-6 px-4">
          Momentálně nejsou k dispozici žádné požadavky na akce.
        </p>
        <Link href="/pozadavky/novy">
          <Button className="bg-black text-white hover:bg-gray-800">Přidat první požadavek</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {requests.map((request: any) => {
        const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
        
        return (
          <Card key={request.id} className="group hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 ease-out border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 font-medium px-3 py-1">
                    {eventTypeLabel}
                  </Badge>
                  <div className="text-xs text-gray-500 text-right">
                    {formatDate(new Date(request.createdAt))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight group-hover:text-black transition-colors">{request.title}</h3>
                  {request.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{request.description}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Datum</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(new Date(request.eventDate))}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Hosté</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{request.expectedGuests}</p>
                  </div>
                </div>
                
                {(request.budget || request.locationPreference) && (
                  <div className="grid grid-cols-1 gap-3">
                    {request.budget && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Euro className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Rozpočet</span>
                        </div>
                        <p className="text-sm font-semibold text-green-900">{request.budget.toLocaleString()} Kč</p>
                      </div>
                    )}
                    
                    {request.locationPreference && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Lokalita</span>
                        </div>
                        <p className="text-sm font-semibold text-purple-900 truncate">{request.locationPreference}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {request.requirements && (
                <div className="mb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">Speciální požadavky</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">{request.requirements}</p>
                  </div>
                </div>
              )}
              
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />
                  Kontakt
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{request.contactName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <a 
                      href={`mailto:${request.contactEmail}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate"
                    >
                      {request.contactEmail}
                    </a>
                  </div>
                  
                  {request.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <a 
                        href={`tel:${request.contactPhone}`}
                        className="text-sm text-green-600 hover:text-green-800 hover:underline transition-colors"
                      >
                        {request.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function EventRequestsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
        
        <Suspense
          fallback={
            <div className="space-y-4 sm:space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventRequestSkeleton key={i} />
              ))}
            </div>
          }
        >
          <EventRequestsList />
        </Suspense>
      </div>
    </div>
  )
}