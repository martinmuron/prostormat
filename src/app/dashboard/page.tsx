import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import type { DashboardData, EventRequestSummary, VenueBroadcastSummary, VenueInquirySummary } from "@/types/dashboard"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { VenueManagerDashboard } from "@/components/dashboard/venue-manager-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

async function getDashboardData(userId: string, userRole: string): Promise<DashboardData | null> {
  try {
    const user = await db.user.findUnique({
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

    if (!user) {
      return null
    }

    const baseData = { user }

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
          },
          subscription: true,
        }
      })

      // Fetch favorited event requests
      const favoritedEventRequests = await db.eventRequestFavorite.findMany({
        where: { userId },
        include: {
          eventRequest: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      })

      return {
        kind: 'venue_manager',
        ...baseData,
        venues,
        favoritedEventRequests: favoritedEventRequests.map(fav => fav.eventRequest),
        stats: {
          totalVenues: venues.length,
          activeVenues: venues.filter(v => v.status === "published").length,
          totalInquiries: venues.reduce((sum, venue) => sum + venue._count.inquiries, 0),
          totalFavorites: favoritedEventRequests.length,
        }
      }
    }

    if (userRole === "admin") {
      const now = new Date()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [userCount, paidVenueCount, paidVenuesLast30, requestCount, inquiryCount] = await Promise.all([
        db.user.count(),
        db.venue.count({
          where: {
            paid: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        }),
        db.venue.count({
          where: {
            paid: true,
            paymentDate: {
              gte: thirtyDaysAgo
            }
          }
        }),
        db.eventRequest.count(),
        db.venueInquiry.count(),
      ])

      return {
        kind: 'admin',
        ...baseData,
        stats: {
          totalUsers: userCount,
          totalPaidVenues: paidVenueCount,
          newPaidVenues30: paidVenuesLast30,
          totalEventRequests: requestCount,
          totalInquiries: inquiryCount,
        }
      }
    }

    // Regular user - handle each query separately with error handling
    let eventRequests: EventRequestSummary[] = []
    let venueInquiries: VenueInquirySummary[] = []
    let broadcasts: VenueBroadcastSummary[] = []
    
    try {
      const results = await db.eventRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
      eventRequests = results
    } catch (error) {
      console.error("Error fetching event requests:", error)
    }
    
    try {
      const results = await db.venueInquiry.findMany({
        where: { userId },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
      venueInquiries = results
    } catch (error) {
      console.error("Error fetching venueInquiry:", error)
    }
    
    try {
      const results = await db.venueBroadcast.findMany({
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
      broadcasts = results
    } catch (error) {
      console.error("Error fetching broadcasts:", error)
    }

    return {
      kind: 'user',
      ...baseData,
      eventRequests,
      venueInquiries,
      broadcasts,
      stats: {
        activeRequests: eventRequests.filter(r => r.status === "active").length,
        totalRequests: eventRequests.length,
        totalInquiries: venueInquiries.length,
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
      <div className="rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-title-2 text-black mb-2 text-center">Chyba při načítání</h1>
        <p className="text-body text-gray-600 text-center">
          Došlo k chybě při načítání vašeho dashboardu. Zkuste to prosím znovu později.
        </p>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (data.kind) {
      case 'venue_manager':
        return <VenueManagerDashboard data={data} />
      case 'admin':
        return <AdminDashboard data={data} />
      case 'user':
      default:
        return <UserDashboard data={data} />
    }
  }

  return renderDashboard()
}
