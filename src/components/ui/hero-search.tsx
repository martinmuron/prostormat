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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Venue Type Filter */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5 text-gray-700 mr-3" />
              <label className="text-base font-medium text-gray-800">Typ prostoru</label>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-white border-gray-200 text-gray-800 text-center">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-gray-700 mr-3" />
              <label className="text-base font-medium text-gray-800">Kapacita</label>
            </div>
            <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
              <SelectTrigger className="bg-white border-gray-200 text-gray-800 text-center">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 text-gray-700 mr-3" />
              <label className="text-base font-medium text-gray-800">Lokalita</label>
            </div>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="bg-white border-gray-200 text-gray-800 text-center">
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

        {/* Search Button */}
        <div className="text-center mt-8">
          <Button 
            type="submit" 
            size="lg"
            className="px-12 py-4 text-lg font-semibold rounded-2xl bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Search className="mr-3 h-5 w-5" />
            Najít prostory
          </Button>
        </div>
      </form>
    </div>
  )
}