import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Building, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Mail,
  Eye,
  Star
} from "lucide-react"

async function getStats() {
  try {
    const [
      totalUsers,
      totalVenues,
      totalEventRequests,
      totalInquiries,
      activeVenues,
      recentUsers,
      recentVenues,
      recentRequests
    ] = await Promise.all([
      db.user.count(),
      db.venue.count(),
      db.eventRequest.count(),
      db.venueInquiry.count(),
      db.venue.count({ where: { status: "active" } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      db.venue.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      db.eventRequest.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    // Get role distribution
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    // Get venue types distribution
    const venuesByType = await db.venue.groupBy({
      by: ['venueType'],
      _count: {
        venueType: true
      },
      where: {
        venueType: {
          not: null
        }
      }
    })

    return {
      overview: {
        totalUsers,
        totalVenues,
        totalEventRequests,
        totalInquiries,
        activeVenues,
        recentUsers,
        recentVenues,
        recentRequests
      },
      usersByRole,
      venuesByType
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return null
  }
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const stats = await getStats()

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black">Statistiky</h1>
        <p className="text-red-600">Chyba při načítání statistik</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Statistiky</h1>
        <p className="text-gray-600 mt-2">
          Přehled výkonnosti a aktivity platformy
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.recentUsers} za posledních 30 dní
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem prostorů</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalVenues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.activeVenues} aktivních
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verejne Poptavky</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalEventRequests}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.recentRequests} za posledních 30 dní
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dotazy na prostory</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              Celkový počet dotazů
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity in last 30 days */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Noví uživatelé (30 dní)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.overview.recentUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nové prostory (30 dní)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{stats.overview.recentVenues}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nové požadavky (30 dní)</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              +{stats.overview.recentRequests}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rozložení uživatelů podle rolí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.usersByRole.map((role) => (
                <div key={role.role} className="flex justify-between items-center">
                  <span className="capitalize">{role.role}</span>
                  <span className="font-semibold">{role._count.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rozložení prostorů podle typu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.venuesByType.map((type) => (
                <div key={type.venueType} className="flex justify-between items-center">
                  <span className="capitalize">{type.venueType}</span>
                  <span className="font-semibold">{type._count.venueType}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}