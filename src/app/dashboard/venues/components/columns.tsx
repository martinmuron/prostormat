"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Star, CheckCircle, Clock, XCircle, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export type Venue = {
  id: string
  name: string
  status: "published" | "hidden"
  venueType?: string | null
  address: string
  district?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactPerson?: string | null
  manager: {
    id: string
    name: string | null
    email: string
    phone: string | null
  } | null
  _count: {
    inquiries: number
    broadcastLogs: number
    // TODO: add favorites when model is implemented
  }
  featured: boolean
  expiresAt?: Date | null
  lastBilledAt?: Date | null
  updatedAt: Date
}

export const columns: ColumnDef<Venue>[] = [
  {
    accessorKey: "name",
    header: "Název",
    cell: ({ row }) => {
      const isFeatured = row.original.featured
      const district = row.original.district
      return (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            {isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            <span className="font-medium">{row.original.name}</span>
          </div>
          {district && (
            <span className="text-xs text-muted-foreground mt-1">
              {district}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "manager",
    header: "Správce",
    cell: ({ row }) => {
      const manager = row.original.manager
      return manager ? (
        <div className="space-y-1">
          <div className="font-medium">{manager.name || manager.email}</div>
          <div className="text-sm text-muted-foreground">{manager.email}</div>
          {manager.phone && <div className="text-sm text-muted-foreground">{manager.phone}</div>}
        </div>
      ) : (
        <span className="text-muted-foreground">Nepřiřazeno</span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Stav",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusMap = {
        published: { label: "Zveřejněný", icon: CheckCircle, color: "bg-green-100 text-green-800" },
        active: { label: "Aktivní", icon: CheckCircle, color: "bg-green-100 text-green-800" },
        draft: { label: "Koncept", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
        pending: { label: "Čeká", icon: Clock, color: "bg-orange-100 text-orange-800" },
        hidden: { label: "Skrytý", icon: XCircle, color: "bg-gray-100 text-gray-800" },
      }
      const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-100 text-gray-800" }
      
      return (
        <Badge className={`${statusInfo.color} hover:${statusInfo.color} capitalize`}>
          {statusInfo.label}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const venue = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Otevřít menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akce</DropdownMenuLabel>
            <Link href={`/admin/venues/${venue.id}/edit`}>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Upravit
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href={`/prostory/${venue.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                Zobrazit veřejně
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/users/${venue.manager?.id}`}>
              <DropdownMenuItem className="cursor-pointer" disabled={!venue.manager}>
                Profil správce
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
