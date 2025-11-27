import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import type { DashboardData, VenueManagerDashboardData, EventRequestSummary, VenueBroadcastSummary, VenueInquirySummary } from "@/types/dashboard"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { VenueManagerDashboard } from "@/components/dashboard/venue-manager-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { ViewAsVenueBanner } from "@/components/dashboard/view-as-venue-banner"

// Get dashboard data for "View as Venue" mode (admin viewing a specific venue's dashboard)
async function getViewAsVenueData(venueSlug: string): Promise<VenueManagerDashboardData | null> {
  try {
    const venue = await db.venue.findUnique({
      where: { slug: venueSlug },
      include: {
        inquiries: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        broadcastLogs: {
          where: {
            emailStatus: { in: ["sent", "backfilled"] }
          },
          include: {
            broadcast: {
              select: {
                id: true,
                title: true,
                description: true,
                eventType: true,
                eventDate: true,
                guestCount: true,
                locationPreference: true,
                contactName: true,
                contactEmail: true,
                contactPhone: true,
                createdAt: true,
              }
            }
          },
          orderBy: { sentAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            inquiries: true,
            broadcastLogs: true,
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          }
        }
      }
    })

    if (!venue) {
      return null
    }

    // Create a fake user object for display (using venue manager info or placeholder)
    const displayUser = venue.manager ? {
      id: venue.manager.id,
      name: venue.manager.name,
      email: venue.manager.email ?? "Bez emailu",
      role: "venue_manager" as const,
      company: venue.manager.company,
      phone: venue.manager.phone,
    } : {
      id: "view-as-venue",
      name: venue.name,
      email: venue.contactEmail ?? "Bez emailu",
      role: "venue_manager" as const,
      company: null,
      phone: venue.contactPhone,
    }

    return {
      kind: 'venue_manager',
      user: displayUser,
      venues: [venue],
      favoritedEventRequests: [],
      stats: {
        totalVenues: 1,
        activeVenues: venue.status === "published" ? 1 : 0,
        totalInquiries: venue._count.inquiries + venue._count.broadcastLogs,
        totalFavorites: 0,
        totalInquiryGuests: 0,
      }
    }
  } catch (error) {
    console.error("Error fetching view-as-venue data:", error)
    return null
  }
}

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
          broadcastLogs: {
            where: {
              emailStatus: { in: ["sent", "backfilled"] } // Show sent and backfilled quick requests
            },
            include: {
              broadcast: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  eventType: true,
                  eventDate: true,
                  guestCount: true,
                  locationPreference: true,
                  contactName: true,
                  contactEmail: true,
                  contactPhone: true,
                  createdAt: true,
                }
              }
            },
            orderBy: { sentAt: "desc" },
            take: 10,
          },
          _count: {
            select: {
              inquiries: true,
              broadcastLogs: true,
            }
          },
        }
      })

      // Fetch favorited event requests
      const [favoritedEventRequestsResults, totalFavoritesCount, totalInquiryGuestsResult] = await Promise.all([
        db.eventRequestFavorite.findMany({
          where: { userId },
          include: {
            eventRequest: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        }),
        db.eventRequestFavorite.count({
          where: { userId }
        }),
        db.venueInquiry.aggregate({
          where: {
            venue: {
              managerId: userId,
            },
          },
          _sum: {
            guestCount: true,
          },
        }),
      ])

      const totalInquiryGuests = totalInquiryGuestsResult._sum.guestCount ?? 0

      return {
        kind: 'venue_manager',
        ...baseData,
        venues,
        favoritedEventRequests: favoritedEventRequestsResults.map(fav => fav.eventRequest),
        stats: {
          totalVenues: venues.length,
          activeVenues: venues.filter(v => v.status === "published").length,
          totalInquiries: venues.reduce((sum, venue) => sum + venue._count.inquiries + venue._count.broadcastLogs, 0),
          totalFavorites: totalFavoritesCount,
          totalInquiryGuests,
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
    let totalEventRequests = 0
    let activeEventRequests = 0
    let totalVenueInquiries = 0
    let totalBroadcasts = 0
    
    try {
      const [results, totalCount, activeCount] = await Promise.all([
        db.eventRequest.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        db.eventRequest.count({ where: { userId } }),
        db.eventRequest.count({ where: { userId, status: "active" } }),
      ])
      eventRequests = results
      totalEventRequests = totalCount
      activeEventRequests = activeCount
    } catch (error) {
      console.error("Error fetching event requests:", error)
    }
    
    try {
      const [results, totalCount] = await Promise.all([
        db.venueInquiry.findMany({
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
        }),
        db.venueInquiry.count({ where: { userId } }),
      ])
      venueInquiries = results
      totalVenueInquiries = totalCount
    } catch (error) {
      console.error("Error fetching venueInquiry:", error)
    }
    
    try {
      const [results, totalCount] = await Promise.all([
        db.venueBroadcast.findMany({
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
        }),
        db.venueBroadcast.count({ where: { userId } }),
      ])
      broadcasts = results
      totalBroadcasts = totalCount
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
        activeRequests: activeEventRequests,
        totalRequests: totalEventRequests,
        totalInquiries: totalVenueInquiries,
        totalBroadcasts: totalBroadcasts,
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return null
  }
}

interface DashboardPageProps {
  searchParams: Promise<{ viewAsVenue?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/dashboard")
  }

  const params = await searchParams
  const viewAsVenueSlug = params.viewAsVenue

  // Admin "View as Venue" mode
  if (viewAsVenueSlug && session.user.role === "admin") {
    const venueData = await getViewAsVenueData(viewAsVenueSlug)

    if (!venueData) {
      return (
        <div className="rounded-2xl bg-white p-10 shadow-sm">
          <h1 className="text-title-2 text-black mb-2 text-center">Prostor nenalezen</h1>
          <p className="text-body text-gray-600 text-center">
            Prostor &quot;{viewAsVenueSlug}&quot; nebyl nalezen. Zkontrolujte prosím slug prostoru.
          </p>
        </div>
      )
    }

    const venueName = venueData.venues[0]?.name ?? viewAsVenueSlug

    return (
      <>
        <ViewAsVenueBanner venueName={venueName} venueSlug={viewAsVenueSlug} />
        <VenueManagerDashboard data={venueData} />
      </>
    )
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
