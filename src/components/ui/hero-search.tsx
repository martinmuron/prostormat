"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, Calendar, Users, MapPin } from "lucide-react"

export function HeroSearch() {
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCapacity, setSelectedCapacity] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedType && selectedType !== "all") params.set("type", selectedType)
    if (selectedCapacity && selectedCapacity !== "all") params.set("capacity", selectedCapacity)
    if (selectedDistrict && selectedDistrict !== "all") params.set("district", selectedDistrict)
    
    window.location.href = `/prostory?${params.toString()}`
  }

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Filter Grid - Centered */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl">
            {/* Venue Type Filter */}
            <div className="glass-search-dark rounded-xl p-4 md:p-6 hover-glow transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center mb-3 md:mb-4">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-white mr-2 md:mr-3" />
                <label className="text-sm md:text-lg font-semibold text-gray-200">Typ prostoru</label>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 h-10 md:h-12 text-sm md:text-base">
                  <SelectValue placeholder="Všechny typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny typy</SelectItem>
                  {Object.entries(VENUE_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity Filter */}
            <div className="glass-search-dark rounded-xl p-4 md:p-6 hover-glow transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center mb-3 md:mb-4">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-white mr-2 md:mr-3" />
                <label className="text-sm md:text-lg font-semibold text-gray-200">Kapacita</label>
              </div>
              <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 h-10 md:h-12 text-sm md:text-base">
                  <SelectValue placeholder="Libovolná kapacita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Libovolná kapacita</SelectItem>
                  {CAPACITY_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="glass-search-dark rounded-xl p-4 md:p-6 hover-glow transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center mb-3 md:mb-4">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-white mr-2 md:mr-3" />
                <label className="text-sm md:text-lg font-semibold text-gray-200">Lokalita</label>
              </div>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 h-10 md:h-12 text-sm md:text-base">
                  <SelectValue placeholder="Celá Praha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Celá Praha</SelectItem>
                  {PRAGUE_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search Button - Redesigned */}
        <div className="text-center">
          <Button 
            type="submit" 
            size="lg"
            className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 md:px-12 py-3 md:py-4 rounded-xl text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Search className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110" />
            Najít prostory
          </Button>
        </div>
      </form>
    </div>
  )
}