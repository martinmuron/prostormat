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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {requests.map((request: any) => {
        const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
        
        return (
          <Card key={request.id} className="group hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 ease-out border border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-start justify-between gap-4">
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 font-medium px-4 py-2 text-sm">
                    {eventTypeLabel}
                  </Badge>
                  <div className="text-sm text-gray-500 text-right">
                    {formatDate(new Date(request.createdAt))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                    {request.title}
                  </h2>
                  {request.description && (
                    <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
                      {request.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Datum akce</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(new Date(request.eventDate))}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Očekávaný počet hostů</p>
                      <p className="text-lg font-semibold text-gray-900">{request.expectedGuests} osob</p>
                    </div>
                  </div>
                  
                  {request.budget && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Euro className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Rozpočet</p>
                        <p className="text-lg font-semibold text-gray-900">{request.budget.toLocaleString()} Kč</p>
                      </div>
                    </div>
                  )}
                  
                  {request.locationPreference && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Preferovaná lokalita</p>
                        <p className="text-lg font-semibold text-purple-900">{request.locationPreference}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {request.requirements && (
                <div className="mb-8">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h4 className="text-base font-semibold text-amber-800 mb-3">Speciální požadavky</h4>
                    <p className="text-base text-amber-700 leading-relaxed">{request.requirements}</p>
                  </div>
                </div>
              )}
              
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-slate-200">
                <h4 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  Kontaktní informace
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <span className="text-base font-medium text-slate-900">{request.contactName}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <a 
                      href={`mailto:${request.contactEmail}`}
                      className="text-base text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {request.contactEmail}
                    </a>
                  </div>
                  
                  {request.contactPhone && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <a 
                        href={`tel:${request.contactPhone}`}
                        className="text-base text-green-600 hover:text-green-800 hover:underline transition-colors"
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