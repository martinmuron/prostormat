"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Calendar,
  MessageSquare,
  Building,
  Users,
  BarChart3,
  BarChart2,
  CreditCard,
  Mail,
  Menu,
  PanelLeftClose
} from "lucide-react"

interface DashboardSidebarProps {
  userRole: string
  initialCollapsed?: boolean
}

export function DashboardSidebar({ userRole, initialCollapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const navigation = useMemo(() => {
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
          href: "/verejne-zakazky",
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
        {
          name: "Email nastavení",
          href: "/admin/email-templates",
          icon: Mail,
        },
        {
          name: "Email statistiky",
          href: "/admin/email-flow",
          icon: BarChart2,
        },
        {
          name: "Blog",
          href: "/admin/blog",
          icon: MessageSquare,
        },
      ]
    }

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
  }, [userRole])

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-end border-b border-gray-200 px-3 py-4">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20"
          aria-label={collapsed ? "Otevřít menu" : "Skrýt menu"}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-xl text-body transition-colors",
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
