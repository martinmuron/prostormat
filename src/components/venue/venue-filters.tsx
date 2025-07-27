'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  
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
    
    router.push(`/prostory?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Search Bar */}
        <div className="relative flex-1 lg:flex-[2]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="pl-12 h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-300 transition-all duration-200 hover:border-gray-300 hover:shadow-lg font-medium shadow-sm bg-gray-50 focus:bg-white"
            placeholder="Hledat prostory..."
          />
        </div>

        {/* Filter Selects with colorful backgrounds */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-4 lg:flex-1">
          {/* Venue Type Filter - Blue */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-blue-700" />
              </div>
              <Select 
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="h-12 pl-14 text-sm rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-blue-300 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="Všechny typy" />
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
          </div>

          {/* District Filter - Purple */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-amber-700" />
              </div>
              <Select 
                value={filters.district}
                onValueChange={(value) => handleFilterChange('district', value)}
              >
                <SelectTrigger className="h-12 pl-14 text-sm rounded-xl border-2 border-amber-200 bg-amber-50 focus:border-amber-300 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="Celá Praha" />
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
          </div>

          {/* Capacity Filter - Green */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-100 border border-green-200 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-700" />
              </div>
              <Select 
                value={filters.capacity}
                onValueChange={(value) => handleFilterChange('capacity', value)}
              >
                <SelectTrigger className="h-12 pl-14 text-sm rounded-xl border-2 border-green-200 bg-green-50 focus:border-green-300 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="Libovolná kapacita" />
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

          <Button 
            type="submit" 
            className="h-12 px-6 text-sm rounded-xl font-semibold bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 whitespace-nowrap"
          >
            Filtrovat
          </Button>
        </div>
      </div>
    </form>
  )
}