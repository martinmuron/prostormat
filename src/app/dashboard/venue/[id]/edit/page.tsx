import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { VenueEditForm } from "@/components/dashboard/venue-edit-form"

interface VenueEditPageProps {
  params: {
    id: string
  }
}

async function getVenueData(venueId: string, userId: string) {
  try {
    const venue = await db.venue.findFirst({
      where: {
        id: venueId,
        managerId: userId, // Ensure user owns this venue
      },
      include: {
        inquiries: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            inquiries: true,
          }
        }
      }
    })

    return venue
  } catch (error) {
    console.error("Error fetching venue data:", error)
    return null
  }
}

export default async function VenueEditPage({ params }: VenueEditPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "venue_manager") {
    redirect("/prihlaseni?callbackUrl=/dashboard")
  }

  const venue = await getVenueData(params.id, session.user.id)

  if (!venue) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-title-1 text-gray-900 mb-2">
            Upravit prostor: {venue.name}
          </h1>
          <p className="text-body text-gray-600">
            Upravte informace o vašem prostoru a spravujte jeho nastavení
          </p>
        </div>

        <VenueEditForm venue={venue} />
      </div>
    </div>
  )
}