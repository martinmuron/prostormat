import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { VenueManagerDashboard } from "@/components/dashboard/venue-manager-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

async function getDashboardData(userId: string, userRole: string) {
  try {
    const baseData = {
      user: await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          company: true,
          phone: true,
        }
      })
    }

    if (userRole === "venue_manager") {
      const venues = await db.venue.findMany({
        where: { managerId: userId },
        include: {
          inquiries: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: {
              inquiries: true,
            }
          }
        }
      })

      return {
        ...baseData,
        venues,
        stats: {
          totalVenues: venues.length,
          activeVenues: venues.filter(v => v.status === "active").length,
          totalInquiries: venues.reduce((sum, venue) => sum + venue._count.inquiries, 0),
        }
      }
    }

    if (userRole === "admin") {
      const [userCount, venueCount, requestCount, inquiryCount] = await Promise.all([
        db.user.count(),
        db.venue.count(),
        db.eventRequest.count(),
        db.venueInquiry.count(),
      ])

      return {
        ...baseData,
        stats: {
          totalUsers: userCount,
          totalVenues: venueCount,
          totalEventRequests: requestCount,
          totalInquiries: inquiryCount,
        }
      }
    }

    // Regular user - handle each query separately with error handling
    let eventRequests = []
    let inquiries = []
    let broadcasts = []
    
    try {
      eventRequests = await db.eventRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    } catch (error) {
      console.error("Error fetching event requests:", error)
    }
    
    try {
      inquiries = await db.venueInquiry.findMany({
        where: { userId },
        include: {
          venue: {
            select: {
              name: true,
              slug: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    }
    
    try {
      broadcasts = await db.venueBroadcast.findMany({
        where: { userId },
        include: {
          logs: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  contactEmail: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    } catch (error) {
      console.error("Error fetching broadcasts:", error)
    }

    return {
      ...baseData,
      eventRequests,
      inquiries,
      broadcasts,
      stats: {
        activeRequests: eventRequests.filter(r => r.status === "active").length,
        totalRequests: eventRequests.length,
        totalInquiries: inquiries.length,
        totalBroadcasts: broadcasts.length,
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return null
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/dashboard")
  }

  const data = await getDashboardData(session.user.id, session.user.role)

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-title-2 text-black mb-4">Chyba při načítání</h1>
          <p className="text-body text-gray-600">Došlo k chybě při načítání vašeho dashboardu.</p>
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (session.user.role) {
      case "venue_manager":
        return <VenueManagerDashboard data={data as any} />
      case "admin":
        return <AdminDashboard data={data as any} />
      default:
        return <UserDashboard data={data as any} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardSidebar userRole={session.user.role} />
        <main className="flex-1 ml-64 p-8">
          {renderDashboard()}
        </main>
      </div>
    </div>
  )
}