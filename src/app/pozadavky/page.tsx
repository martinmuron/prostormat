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
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-16" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
      <div className="text-center py-12">
        <h3 className="text-title-3 text-black mb-4">Žádné aktivní požadavky</h3>
        <p className="text-body text-gray-600 mb-6">
          Momentálně nejsou k dispozici žádné požadavky na akce.
        </p>
        <Link href="/pozadavky/novy">
          <Button>Přidat první požadavek</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {requests.map((request: any) => {
        const eventTypeLabel = EVENT_TYPES[request.eventType as EventType] || request.eventType
        
        return (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-title-3 text-black mb-2">{request.title}</h3>
                  {request.description && (
                    <p className="text-body text-gray-600 line-clamp-2">{request.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-4">
                  {eventTypeLabel}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {request.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-caption text-gray-500 block">Datum</span>
                      <p className="text-callout text-black">{formatDate(new Date(request.eventDate))}</p>
                    </div>
                  </div>
                )}
                
                {request.guestCount && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-caption text-gray-500 block">Počet hostů</span>
                      <p className="text-callout text-black">{request.guestCount}</p>
                    </div>
                  </div>
                )}
                
                {request.budgetRange && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-caption text-gray-500 block">Rozpočet</span>
                      <p className="text-callout text-black">{request.budgetRange}</p>
                    </div>
                  </div>
                )}
                
                {request.locationPreference && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-caption text-gray-500 block">Lokalita</span>
                      <p className="text-callout text-black">{request.locationPreference}</p>
                    </div>
                  </div>
                )}
              </div>

              {request.requirements && (
                <div className="mb-6">
                  <span className="text-caption text-gray-500 block mb-2">Požadavky</span>
                  <p className="text-callout text-gray-700">{request.requirements}</p>
                </div>
              )}
              
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-callout font-medium text-black mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Kontaktní údaje
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-callout text-black font-medium">{request.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`mailto:${request.contactEmail}`}
                      className="text-callout text-blue-600 hover:underline"
                    >
                      {request.contactEmail}
                    </a>
                  </div>
                  {request.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`tel:${request.contactPhone}`}
                        className="text-callout text-blue-600 hover:underline"
                      >
                        {request.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-right">
                <span className="text-caption text-gray-500">
                  Přidáno {formatDate(new Date(request.createdAt))}
                </span>
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-title-1 text-black mb-4">Požadavky na akce</h1>
          <p className="text-body text-gray-600 mb-8 max-w-2xl mx-auto">
            Aktuální požadavky na event prostory. Kontaktujte organizátory přímo 
            prostřednictvím uvedených kontaktních údajů.
          </p>
          <Link href="/pozadavky/novy">
            <Button size="lg">
              Přidat požadavek
            </Button>
          </Link>
        </div>
        
        <Suspense
          fallback={
            <div className="space-y-6">
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