import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/admin/email-templates")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardSidebar userRole={session.user.role} initialCollapsed />
        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-6 py-10 md:px-10">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
