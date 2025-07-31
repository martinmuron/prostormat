import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, Building, Calendar } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic';

async function getUser(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        venues: {
          include: {
            _count: {
              select: {
                inquiries: true,
                broadcastLogs: true,
                favorites: true,
              },
            },
          },
        },
        eventRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        venueInquiries: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            venue: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const user = await getUser(id)
  
  if (!user) {
    notFound()
  }

  const roleLabels = {
    user: "Uživatel",
    venue_manager: "Správce prostorů",
    admin: "Administrátor",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil uživatele</h1>
          <p className="text-muted-foreground">
            {user.name || user.email}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/venues">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na přehled
          </Link>
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-lg">
                {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <h2 className="text-xl font-semibold">{user.name || "Bez jména"}</h2>
                <Badge variant="outline">
                  {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Mail className="mr-1 h-4 w-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    {user.phone}
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center">
                    <Building className="mr-1 h-4 w-4" />
                    {user.company}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Registrován {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="venues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="venues">Prostory ({user.venues.length})</TabsTrigger>
          <TabsTrigger value="requests">Verejne Poptavky ({user.eventRequests.length})</TabsTrigger>
          <TabsTrigger value="inquiries">Dotazy ({user.venueInquiries.length})</TabsTrigger>
          <TabsTrigger value="billing">Fakturace</TabsTrigger>
        </TabsList>

        <TabsContent value="venues">
          <Card>
            <CardHeader>
              <CardTitle>Spravované prostory</CardTitle>
            </CardHeader>
            <CardContent>
              {user.venues.length > 0 ? (
                <div className="space-y-4">
                  {user.venues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{venue.name}</h3>
                          <Badge variant={venue.status === 'active' ? 'default' : 'secondary'}>
                            {venue.status === 'active' ? 'Aktivní' : 
                             venue.status === 'draft' ? 'Koncept' : 
                             venue.status === 'expired' ? 'Expirovaný' : 'Pozastavený'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{venue.address}</p>
                        <div className="flex space-x-4 text-xs text-muted-foreground">
                          <span>{venue._count.inquiries} dotazů</span>
                          <span>{venue._count.broadcastLogs} rozesílek</span>
                          <span>{venue._count.favorites} oblíbených</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/prostory/${venue.slug}`}>
                            Zobrazit
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/venues/${venue.id}`}>
                            Upravit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Tento uživatel nespravuje žádné prostory.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Verejne Poptavky</CardTitle>
            </CardHeader>
            <CardContent>
              {user.eventRequests.length > 0 ? (
                <div className="space-y-4">
                  {user.eventRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{request.eventType}</h3>
                        <Badge variant="outline">
                          {request.eventDate ? new Date(request.eventDate).toLocaleDateString('cs-CZ') : 'Neuvedeno'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Kapacita: {(request as any).expectedGuests || (request as any).guestCount || 'Neuvedeno'} hostů</span>
                        <span>Vytvořeno: {new Date(request.createdAt).toLocaleDateString('cs-CZ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Žádné požadavky na akce.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Dotazy na prostory</CardTitle>
            </CardHeader>
            <CardContent>
              {user.venueInquiries.length > 0 ? (
                <div className="space-y-4">
                  {user.venueInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{inquiry.venue.name}</h3>
                        <Badge variant="outline">
                          {inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString('cs-CZ') : 'Neuvedeno'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{inquiry.message}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Kapacita: {(inquiry as any).expectedGuests || (inquiry as any).guestCount || 'Neuvedeno'} hostů</span>
                        <span>Odesláno: {new Date(inquiry.createdAt).toLocaleDateString('cs-CZ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Žádné dotazy na prostory.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Fakturační informace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                    <p className="mt-1">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                      <p className="mt-1">{user.phone}</p>
                    </div>
                  )}
                  {user.company && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Společnost</label>
                      <p className="mt-1">{user.company}</p>
                    </div>
                  )}
                </div>
                
                {user.venues.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Fakturace prostorů</h3>
                    <div className="space-y-4">
                      {user.venues.map((venue) => (
                        <div key={venue.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{venue.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Stav předplatného: {(venue as any).subscriptionStatus || 'Neuvedeno'}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/venues/${venue.id}`}>
                                Upravit fakturaci
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
