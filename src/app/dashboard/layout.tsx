import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardSidebar userRole={session.user.role} />
        <div className="ml-64 flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-8 py-10">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
