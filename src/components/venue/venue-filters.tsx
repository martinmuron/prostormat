'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, MapPin, Users, Building } from "lucide-react"

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
  
  const [filters, setFilters] = useState({
    q: initialValues.q || '',
    type: initialValues.type || '',
    district: initialValues.district || '',
    capacity: initialValues.capacity || '',
  })

  const typeTooltip = filters.type && filters.type !== 'all'
    ? VENUE_TYPES[filters.type as keyof typeof VENUE_TYPES] ?? filters.type
    : 'Typ prostoru'

  const districtTooltip = filters.district && filters.district !== 'all'
    ? filters.district
    : 'Lokalita'

  const capacityTooltip = filters.capacity && filters.capacity !== 'all'
    ? filters.capacity
    : 'Kapacita'


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
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-3xl border border-black/10 bg-white/80 shadow-xl backdrop-blur-sm p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:gap-5">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="pl-12 h-12 text-base rounded-2xl border border-gray-200 bg-white focus:border-black transition-all duration-200 hover:border-black/70 shadow-sm"
              placeholder="Hledat prostory..."
            />
          </div>

          {/* Icon Filters */}
          <div className="flex flex-row flex-wrap items-center justify-start gap-3 md:gap-4 lg:flex-nowrap lg:gap-4">
            <div className="flex items-center justify-center flex-shrink-0">
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger
                  className="h-12 w-12 rounded-full border border-gray-200 bg-white p-0 flex items-center justify-center transition-all duration-200 hover:border-black/70 focus:border-black [&>svg:last-child]:hidden"
                  aria-label={typeTooltip}
                  title={typeTooltip}
                >
                  <SelectValue className="sr-only" aria-hidden />
                  <span className="sr-only">{typeTooltip}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                    <Building className="h-4 w-4" />
                  </span>
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

            <div className="flex items-center justify-center flex-shrink-0">
              <Select
                value={filters.district}
                onValueChange={(value) => handleFilterChange('district', value)}
              >
                <SelectTrigger
                  className="h-12 w-12 rounded-full border border-gray-200 bg-white p-0 flex items-center justify-center transition-all duration-200 hover:border-black/70 focus:border-black [&>svg:last-child]:hidden"
                  aria-label={districtTooltip}
                  title={districtTooltip}
                >
                  <SelectValue className="sr-only" aria-hidden />
                  <span className="sr-only">{districtTooltip}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                    <MapPin className="h-4 w-4" />
                  </span>
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

            <div className="flex items-center justify-center flex-shrink-0">
              <Select
                value={filters.capacity}
                onValueChange={(value) => handleFilterChange('capacity', value)}
              >
                <SelectTrigger
                  className="h-12 w-12 rounded-full border border-gray-200 bg-white p-0 flex items-center justify-center transition-all duration-200 hover:border-black/70 focus:border-black [&>svg:last-child]:hidden"
                  aria-label={capacityTooltip}
                  title={capacityTooltip}
                >
                  <SelectValue className="sr-only" aria-hidden />
                  <span className="sr-only">{capacityTooltip}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                    <Users className="h-4 w-4" />
                  </span>
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
          </div>

          <div className="flex w-full items-stretch justify-start lg:w-auto lg:justify-end">
            <Button
              type="submit"
              className="h-12 w-full rounded-2xl font-semibold text-sm bg-black text-white hover:bg-gray-800 transition-all duration-200 flex items-center justify-center shadow-md lg:w-auto lg:px-6"
            >
              Najít prostory
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
