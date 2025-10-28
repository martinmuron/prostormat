'use client'

import { useEffect, useState } from "react"
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

type FilterState = {
  q: string
  type?: string
  district?: string
  capacity?: string
}

export function VenueFilters({ initialValues }: VenueFiltersProps) {
  const router = useRouter()

  const computeFilterValue = (value?: string) => {
    if (!value || value === "all") return undefined
    return value
  }

  const [filters, setFilters] = useState<FilterState>(() => {
    const hasSearch = Boolean(initialValues.q)
    return {
      q: initialValues.q ?? "",
      type: hasSearch ? undefined : computeFilterValue(initialValues.type),
      district: hasSearch ? undefined : computeFilterValue(initialValues.district),
      capacity: hasSearch ? undefined : computeFilterValue(initialValues.capacity),
    }
  })
  const [isSearchMode, setIsSearchMode] = useState(Boolean(initialValues.q))

  useEffect(() => {
    const hasSearch = Boolean(initialValues.q)
    setFilters({
      q: initialValues.q ?? "",
      type: hasSearch ? undefined : computeFilterValue(initialValues.type),
      district: hasSearch ? undefined : computeFilterValue(initialValues.district),
      capacity: hasSearch ? undefined : computeFilterValue(initialValues.capacity),
    })
    setIsSearchMode(hasSearch)
  }, [initialValues.q, initialValues.type, initialValues.district, initialValues.capacity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    const trimmedQuery = filters.q.trim()
    if (trimmedQuery.length > 0) {
      params.set("q", trimmedQuery)
    }
    if (filters.type) {
      params.set("type", filters.type)
    }
    if (filters.district) {
      params.set("district", filters.district)
    }
    if (filters.capacity) {
      params.set("capacity", filters.capacity)
    }

    const paramsString = params.toString()
    router.push(paramsString ? `/prostory?${paramsString}` : '/prostory')
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === "q") {
      setFilters(prev => ({ ...prev, q: value }))
      return
    }
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }))
  }

  const toggleSearchMode = () => {
    setFilters(prev => {
      if (isSearchMode) {
        return { ...prev, q: "" }
      }
      return { ...prev, type: undefined, district: undefined, capacity: undefined }
    })
    setIsSearchMode(prev => !prev)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full max-w-7xl mx-auto rounded-2xl border-2 border-gray-200 bg-white/90 shadow-lg backdrop-blur p-4 sm:p-6 md:p-8">
        {isSearchMode ? (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <button
              type="button"
              onClick={toggleSearchMode}
              className="hidden md:inline-flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full flex-shrink-0 hover:bg-gray-800 transition-colors"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
            <div className="relative flex-1">
              <Input
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                className="h-12 rounded-2xl border-2 border-gray-700 bg-white text-base shadow-sm transition-all focus:border-black"
                placeholder="Například: Praha, Karlín, loft..."
              />
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
            >
              Najít ideální místo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search toggle button - visible on desktop, hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={toggleSearchMode}
                className="inline-flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full flex-shrink-0 hover:bg-gray-800 transition-colors"
              >
                <Search className="h-5 w-5 text-white" />
              </button>

              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-700 rounded-md flex-shrink-0">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.type}
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
                  value={filters.capacity}
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
                  value={filters.district}
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

              <Button
                type="submit"
                className="h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
              >
                Najít ideální místo
              </Button>
            </div>

            {/* Mobile layout - vertical stack */}
            <div className="flex flex-col gap-4 md:hidden">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-xl flex-shrink-0">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Input
                  value={filters.q}
                  onChange={(e) => handleFilterChange("q", e.target.value)}
                  placeholder="Hledat podle názvu"
                  className="h-11 sm:h-12 rounded-2xl border-2 border-gray-300 bg-white text-base"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex-shrink-0">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-blue-600 bg-white text-base text-black focus:border-black">
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

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-xl flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Select
                  value={filters.capacity}
                  onValueChange={(value) => handleFilterChange("capacity", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-green-600 bg-white text-base text-black focus:border-black">
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

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-xl flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Select
                  value={filters.district}
                  onValueChange={(value) => handleFilterChange("district", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-orange-600 bg-white text-base text-black focus:border-black">
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

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700 flex items-center justify-center"
              >
                Najít ideální místo
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
