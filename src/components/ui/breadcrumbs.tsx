import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function Breadcrumbs({ items, showHome = true, className = "" }: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: "Domů", href: "/" }, ...items]
    : items

  return (
    <nav aria-label="Breadcrumb" className={`mb-6 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = index === 0 && showHome

          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              )}
              {isLast ? (
                <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-black transition-colors flex items-center gap-1"
                >
                  {isHome && <Home className="h-3.5 w-3.5" />}
                  <span className={isHome ? "sr-only sm:not-sr-only" : ""}>
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
