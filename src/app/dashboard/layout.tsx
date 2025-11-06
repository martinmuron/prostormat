import type { Metadata } from "next"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/sidebar"
import { BetaBanner } from "@/components/dashboard/beta-banner"

interface DashboardLayoutProps {
  children: ReactNode
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardMobileNav userRole={session.user.role} />
      <div className="flex">
        <DashboardSidebar
          userRole={session.user.role}
          initialCollapsed={session.user.role === "admin"}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 py-8 pb-20 sm:px-6 sm:pb-24 md:px-10 md:py-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <BetaBanner />
    </div>
  )
}
