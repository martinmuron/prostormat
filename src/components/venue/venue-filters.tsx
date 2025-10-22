'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, MapPin, Users, Calendar } from "lucide-react"

interface VenueFiltersProps {
  initialValues: {
    q?: string
    type?: string
    district?: string
    capacity?: string
  }
}

export function VenueFilters({ initialValues }: VenueFiltersProps) {
  const router = useRouter()

  const [filters, setFilters] = useState(() => {
    const hasSearch = Boolean(initialValues.q)
    return {
      q: initialValues.q || "",
      type: hasSearch ? "" : initialValues.type || "",
      district: hasSearch ? "" : initialValues.district || "",
      capacity: hasSearch ? "" : initialValues.capacity || "",
    }
  })
  const [isSearchMode, setIsSearchMode] = useState(Boolean(initialValues.q))


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value)
    })

    const paramsString = params.toString()
    router.push(paramsString ? `/prostory?${paramsString}` : '/prostory')
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? "" : value }))
  }

  const toggleSearchMode = () => {
    setFilters(prev => {
      if (isSearchMode) {
        return { ...prev, q: "" }
      }
      return { ...prev, type: "", district: "", capacity: "" }
    })
    setIsSearchMode(prev => !prev)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full max-w-5xl mx-auto rounded-2xl border-2 border-gray-200 bg-white/90 shadow-lg backdrop-blur p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-600">
              {isSearchMode ? "Hledejte podle názvu nebo lokace" : "Vyberte typ, kapacitu a lokaci prostoru"}
            </p>
            <Button
              type="button"
              onClick={toggleSearchMode}
              variant={isSearchMode ? "default" : "outline"}
              className={`h-10 rounded-xl px-4 transition-all ${isSearchMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}
            >
              <Search className="mr-2 h-4 w-4" />
              {isSearchMode ? "Zobrazit filtry" : "Hledat prostory"}
            </Button>
          </div>

          {isSearchMode ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={filters.q}
                  onChange={(e) => handleFilterChange("q", e.target.value)}
                  className="h-12 rounded-2xl border-2 border-blue-600 bg-white pl-12 text-base shadow-sm transition-all focus:border-black"
                  placeholder="Například: Praha, Karlín, loft..."
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-xl bg-blue-600 px-6 text-white shadow-md transition-all hover:bg-blue-700"
              >
                Najít ideální místo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-700 rounded-md flex-shrink-0">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-blue-700 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Vyber typ prostoru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny typy</SelectItem>
                    {Object.entries(VENUE_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-green-700 rounded-md flex-shrink-0">
                  <Users className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.capacity || "all"}
                  onValueChange={(value) => handleFilterChange("capacity", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-green-700 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Kolik lidí přivedeš?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Libovolná kapacita</SelectItem>
                    {CAPACITY_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 rounded-md flex-shrink-0">
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.district || "all"}
                  onValueChange={(value) => handleFilterChange("district", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-amber-700 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Kde to má být?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Celá Praha</SelectItem>
                    {PRAGUE_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full items-center">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700"
                >
                  Najít ideální místo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
