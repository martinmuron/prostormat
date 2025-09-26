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
        <div className="grid gap-2 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">
          {/* Search Bar */}
          <div className="relative lg:col-span-3 xl:col-span-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="pl-12 h-12 text-base rounded-2xl border border-gray-200 bg-white focus:border-black transition-all duration-200 hover:border-black/70 shadow-sm"
              placeholder="Hledat prostory..."
            />
          </div>

          {/* Venue Type Filter */}
          <div className="lg:col-span-1 xl:col-span-1">
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="h-12 rounded-xl border border-gray-200 bg-white px-3 flex items-center gap-2 transition-all duration-200 hover:border-black/70 focus:border-black">
                <Building className="h-4 w-4 text-black flex-shrink-0" />
                <SelectValue placeholder="Typ prostoru" />
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

          {/* District Filter */}
          <div className="lg:col-span-1 xl:col-span-1">
            <Select
              value={filters.district}
              onValueChange={(value) => handleFilterChange('district', value)}
            >
              <SelectTrigger className="h-12 rounded-xl border border-gray-200 bg-white px-3 flex items-center gap-2 transition-all duration-200 hover:border-black/70 focus:border-black">
                <MapPin className="h-4 w-4 text-black flex-shrink-0" />
                <SelectValue placeholder="Lokalita" />
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

          {/* Capacity Filter */}
          <div className="lg:col-span-1 xl:col-span-1">
            <Select
              value={filters.capacity}
              onValueChange={(value) => handleFilterChange('capacity', value)}
            >
              <SelectTrigger className="h-12 rounded-xl border border-gray-200 bg-white px-3 flex items-center gap-2 transition-all duration-200 hover:border-black/70 focus:border-black">
                <Users className="h-4 w-4 text-black flex-shrink-0" />
                <SelectValue placeholder="Kapacita" />
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

          <div className="lg:col-span-1 xl:col-span-2 flex items-stretch">
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-semibold text-sm bg-black text-white hover:bg-gray-800 transition-all duration-200 flex items-center justify-center shadow-md"
            >
              Najít prostory
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
