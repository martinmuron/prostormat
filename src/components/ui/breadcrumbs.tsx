import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Navigace"
      className={cn("flex items-center text-sm text-gray-500", className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === items.length - 1

          return (
            <li key={item.url} className="flex items-center">
              {!isFirst && (
                <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
              )}
              {isLast ? (
                <span
                  className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  {isFirst && <Home className="h-3.5 w-3.5" />}
                  <span className={isFirst ? "sr-only sm:not-sr-only" : ""}>
                    {item.name}
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
