"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export type VenueLeadStat = {
  id: string
  name: string
  slug: string
  status: string
  inquiryCount: number
  quickRequestCount: number
}

interface VenueLeadStatsProps {
  venues: VenueLeadStat[]
}

export function VenueLeadStats({ venues }: VenueLeadStatsProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return venues
    }
    return venues.filter((venue) =>
      venue.name.toLowerCase().includes(needle)
    )
  }, [venues, query])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, venue) => {
        acc.inquiries += venue.inquiryCount
        acc.quickRequests += venue.quickRequestCount
        return acc
      },
      { inquiries: 0, quickRequests: 0 }
    )
  }, [filtered])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Přehled poptávek podle prostoru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrovat podle názvu prostoru…"
            className="max-w-sm"
          />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Výsledky: <strong>{filtered.length}</strong>
            </span>
            <Badge variant="outline" className="rounded-full border-orange-200 bg-orange-50 text-orange-700">
              Rychlé poptávky: {totals.quickRequests}
            </Badge>
            <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
              Formuláře: {totals.inquiries}
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">
                  Prostor
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">
                  Rychlé poptávky
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">
                  Formulář na detailu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    Nenalezen žádný prostor pro zadané hledání.
                  </td>
                </tr>
              ) : (
                filtered.map((venue) => (
                  <tr key={venue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{venue.name}</span>
                        <Link
                          href={`/prostory/${venue.slug}`}
                          className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          /prostory/{venue.slug}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {venue.status.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-700">
                      {venue.quickRequestCount}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">
                      {venue.inquiryCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
