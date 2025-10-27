 "use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  PanelLeftClose,
  Sparkles,
  Zap,
  BadgePercent,
} from "lucide-react"

type DashboardNavItem = {
  name: string
  href: string
  icon: typeof Home
}

function buildNavigation(userRole: string): DashboardNavItem[] {
  const baseNav: DashboardNavItem[] = [
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
        name: "Rychlé poptávky",
        href: "/admin/quick-requests",
        icon: Zap,
      },
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
        name: "Event Board",
        href: "/event-board",
        icon: Calendar,
      },
      {
        name: "Prémiové balíčky",
        href: "/ceny#premium",
        icon: Sparkles,
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
        name: "Ceník",
        href: "/admin/pricing",
        icon: BadgePercent,
      },
      {
        name: "Blog",
        href: "/admin/blog",
        icon: MessageSquare,
      },
    ]
  }

  return baseNav
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface DashboardSidebarProps {
  userRole: string
  initialCollapsed?: boolean
}

export function DashboardSidebar({ userRole, initialCollapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const navigation = useMemo(() => buildNavigation(userRole), [userRole])

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo variant="black" size="sm" href={null} className="h-6 w-auto" />
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-gray-500">
              Admin
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/15"
          aria-label={collapsed ? "Otevřít menu" : "Skrýt menu"}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1.5">
          {navigation.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all",
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
                  active
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

interface DashboardMobileNavProps {
  userRole: string
}

export function DashboardMobileNav({ userRole }: DashboardMobileNavProps) {
  const navigation = useMemo(() => buildNavigation(userRole), [userRole])
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-14 z-40 border-b border-gray-200 bg-white shadow-sm sm:top-16 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo variant="black" size="sm" href={null} className="h-6 w-auto" />
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-gray-500">
            Admin
          </span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2 rounded-full border-gray-200 px-3 py-2 font-medium"
            >
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <SheetHeader className="border-b border-gray-200 px-5 py-4 text-left">
              <Logo variant="black" size="sm" href={null} className="h-6 w-auto" />
              <SheetTitle className="text-xs font-medium uppercase tracking-[0.24em] text-gray-500">
                Admin
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const active = isActiveRoute(pathname, item.href)

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-black"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
            </div>
            <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
              Přihlášeni jako {userRole === "admin" ? "administrátor" : "správce prostoru"}.
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
