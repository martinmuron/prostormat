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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Venue Type Filter */}
          <div className="glass-search-dark rounded-2xl p-6 hover-glow transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-white mr-3" />
              <label className="text-lg font-semibold text-gray-200">Typ prostoru</label>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-gray-300">
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
          <div className="glass-search-dark rounded-2xl p-6 hover-glow transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-white mr-3" />
              <label className="text-lg font-semibold text-gray-200">Kapacita</label>
            </div>
            <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-gray-300">
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
          <div className="glass-search-dark rounded-2xl p-6 hover-glow transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-white mr-3" />
              <label className="text-lg font-semibold text-gray-200">Lokalita</label>
            </div>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-gray-300">
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
            className="magnetic-button hover-lift px-16 py-5 text-xl font-bold rounded-2xl bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-2xl"
          >
            <Search className="mr-3 h-6 w-6" />
            Najít prostory
          </Button>
        </div>
      </form>
    </div>
  )
}