import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"

export const dynamic = 'force-dynamic';

async function getVenues() {
  try {
    const venues = await db.venue.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        venueType: true,
        address: true,
        district: true,
        contactEmail: true,
        contactPhone: true,
        isRecommended: true,
        updatedAt: true,
        manager: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { inquiries: true, broadcastLogs: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return venues.map(venue => ({
      ...venue,
      featured: venue.isRecommended,
      subscriptionStatus: null,
      expiresAt: null,
      lastBilledAt: null,
    }))
  } catch (error) {
    console.error('Error fetching venues:', error)
    return []
  }
}

export default async function VenuesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const venues = await getVenues();
  const publishedVenues = venues.filter(v => v.status === 'published' || v.status === 'active');
  const draftVenues = venues.filter(v => v.status === 'draft');
  const pendingVenues = venues.filter(v => v.status === 'pending');
  const hiddenVenues = venues.filter(v => v.status === 'hidden');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Správa prostorů</h1>
          <p className="text-muted-foreground">Spravujte všechny prostory v systému</p>
        </div>
        <Button asChild>
          <a href="/dashboard/venues/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Přidat prostor
          </a>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Všechny ({venues.length})</TabsTrigger>
          <TabsTrigger value="published">Zveřejněné ({publishedVenues.length})</TabsTrigger>
          <TabsTrigger value="draft">Koncepty ({draftVenues.length})</TabsTrigger>
          <TabsTrigger value="pending">Čekající ({pendingVenues.length})</TabsTrigger>
          <TabsTrigger value="hidden">Skryté ({hiddenVenues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              <DataTable columns={columns} data={venues as any} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published">
          <Card>
            <CardContent className="pt-6">
              <DataTable columns={columns} data={publishedVenues as any} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card>
            <CardContent className="pt-6">
              <DataTable columns={columns} data={draftVenues as any} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <DataTable columns={columns} data={pendingVenues as any} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hidden">
          <Card>
            <CardContent className="pt-6">
              <DataTable columns={columns} data={hiddenVenues as any} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
