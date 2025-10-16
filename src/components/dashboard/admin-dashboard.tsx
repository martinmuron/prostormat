import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Calendar, MessageSquare, FileText, Mail } from "lucide-react"
import type { AdminDashboardData } from "@/types/dashboard"

interface AdminDashboardProps {
  data: AdminDashboardData
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const { stats } = data

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-1 text-black mb-2">
          Admin Dashboard
        </h1>
        <p className="text-body text-gray-600">
          Přehled celé platformy Prostormat
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem uživatelů</p>
                <p className="text-title-2 text-black">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem prostorů</p>
                <p className="text-title-2 text-black">{stats.totalVenues}</p>
              </div>
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Veřejné zakázky</p>
                <p className="text-title-2 text-black">{stats.totalEventRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem dotazů</p>
                <p className="text-title-2 text-black">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Správa uživatelů</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Spravujte uživatelské účty, role a oprávnění.
            </p>
            <Link href="/dashboard/users">
              <Button>Spravovat uživatele</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Správa prostorů</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Moderujte venue listings a spravujte předplatná.
            </p>
            <Link href="/dashboard/venues">
              <Button>Spravovat prostory</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Správa blogu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Spravujte blog články pro SEO a marketing.
            </p>
            <Link href="/admin/blog">
              <Button>Spravovat blog</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Sledujte všechny automatické emaily odeslané přes Resend.
            </p>
            <Link href="/admin/email-flow">
              <Button>Zobrazit Email Flow</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email šablony</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Spravujte vítací emaily a odesílejte hromadné emaily uživatelům.
            </p>
            <Link href="/admin/email-templates">
              <Button>Spravovat šablony</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Rychlé akce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Link href="/dashboard/users">
              <Button variant="secondary" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Uživatelé
              </Button>
            </Link>
            <Link href="/dashboard/venues">
              <Button variant="secondary" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Prostory
              </Button>
            </Link>
            <Link href="/admin/blog">
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Link href="/verejne-zakazky">
              <Button variant="secondary" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Veřejné zakázky
              </Button>
            </Link>
            <Link href="/dashboard/stats">
              <Button variant="secondary" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Statistiky
              </Button>
            </Link>
            <Link href="/admin/email-flow">
              <Button variant="secondary" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email Flow
              </Button>
            </Link>
            <Link href="/admin/email-templates">
              <Button variant="secondary" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email šablony
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
