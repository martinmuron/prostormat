"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Building, 
  Settings, 
  Users,
  BarChart3,
  CreditCard
} from "lucide-react"

interface DashboardSidebarProps {
  userRole: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()

  const getUserNavigation = () => {
    const baseNav = [
      {
        name: "Přehled",
        href: "/dashboard",
        icon: Home,
      },
    ]

    if (userRole === "venue_manager") {
      return [
        ...baseNav,
        {
          name: "Můj prostor",
          href: "/dashboard/venue",
          icon: Building,
        },
        {
          name: "Přijaté dotazy",
          href: "/dashboard/inquiries",
          icon: MessageSquare,
        },
        {
          name: "Veřejné zakázky",
          href: "/pozadavky",
          icon: Calendar,
        },
        {
          name: "Předplatné",
          href: "/dashboard/subscription",
          icon: CreditCard,
        },
      ]
    }

    if (userRole === "admin") {
      return [
        ...baseNav,
        {
          name: "Uživatelé",
          href: "/dashboard/users",
          icon: Users,
        },
        {
          name: "Prostory",
          href: "/dashboard/venues",
          icon: Building,
        },
        {
          name: "Statistiky",
          href: "/dashboard/stats",
          icon: BarChart3,
        },
      ]
    }

    // Regular user
    return [
      ...baseNav,
      {
        name: "Moje poptávky",
        href: "/dashboard/requests",
        icon: Calendar,
      },
      {
        name: "Moje dotazy",
        href: "/dashboard/inquiries",
        icon: MessageSquare,
      },
      {
        name: "Uložené prostory",
        href: "/dashboard/saved",
        icon: Building,
      },
    ]
  }

  const navigation = [
    ...getUserNavigation(),
    {
      name: "Nastavení",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="text-title-3 font-bold text-black">
          Prostormat
        </Link>
      </div>
      
      <nav className="p-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-body transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}