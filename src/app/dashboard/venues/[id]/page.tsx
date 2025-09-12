import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { VenueForm } from "@/components/venue/venue-form"
import { VenueBilling } from "@/components/venue/venue-billing"
import { VenueManager } from "@/components/venue/venue-manager"

export const dynamic = 'force-dynamic';

async function getVenue(id: string) {
  try {
    const venue = await db.venue.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!venue) return null

    return {
      ...venue,
      // Ensure images is always an array
      images: Array.isArray(venue.images) ? venue.images : [],
      // Ensure amenities is always an array
      amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
    }
  } catch (error) {
    console.error('Error fetching venue:', error)
    return null
  }
}

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const venue = await getVenue(id)
  
  if (!venue) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upravit prostor</h1>
          <p className="text-muted-foreground">
            {venue.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/venues">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na přehled
            </Link>
          </Button>
          <Button form="venue-form" type="submit">
            <Save className="mr-2 h-4 w-4" />
            Uložit změny
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detaily prostoru</TabsTrigger>
          <TabsTrigger value="billing">Fakturace</TabsTrigger>
          <TabsTrigger value="manager">Správce</TabsTrigger>
          <TabsTrigger value="inquiries">Dotazy</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
            </CardHeader>
            <CardContent>
              <VenueForm venue={venue as any} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Fakturační údaje</CardTitle>
            </CardHeader>
            <CardContent>
              <VenueBilling venue={venue} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manager">
          <Card>
            <CardHeader>
              <CardTitle>Správce prostoru</CardTitle>
            </CardHeader>
            <CardContent>
              <VenueManager venue={venue} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Přijaté dotazy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seznam dotazů k tomuto prostoru</p>
              {/* Inquiries list will be implemented here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
