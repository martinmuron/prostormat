import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminVenueEditForm } from "@/components/dashboard/admin-venue-edit-form"

interface AdminVenueEditPageProps {
  params: Promise<{
    id: string
  }>
}

async function getVenueData(venueId: string) {
  try {
    const venue = await db.venue.findUnique({
      where: {
        id: venueId,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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

export default async function AdminVenueEditPage({ params }: AdminVenueEditPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/prihlaseni?callbackUrl=/admin")
  }

  const resolvedParams = await params
  const venue = await getVenueData(resolvedParams.id)

  if (!venue) {
    redirect("/admin/venues")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-title-1 text-gray-900 mb-2">
            Admin: Upravit prostor
          </h1>
          <p className="text-body text-gray-600">
            Kompletní správa prostoru {venue.name}
          </p>
        </div>

        <AdminVenueEditForm venue={venue} />
      </div>
    </div>
  )
}
