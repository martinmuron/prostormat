import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Calendar, MessageSquare } from "lucide-react"
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
                <p className="text-caption text-gray-500 mb-1">Placené prostory</p>
                <p className="text-title-2 text-black">{stats.totalPaidVenues}</p>
                <p className="text-caption text-gray-500 mt-1">
                  +{stats.newPaidVenues30} za posledních 30 dní
                </p>
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
            <CardTitle>Email statistiky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Sledujte všechny automatické emaily odeslané přes Resend.
            </p>
            <Link href="/admin/email-flow">
              <Button>Zobrazit statistiky</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email nastavení</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-gray-600 mb-4">
              Spravujte vítací emaily, texty zpráv i automatické spouštěče.
            </p>
            <Link href="/admin/email-templates">
              <Button>Upravit emaily</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
