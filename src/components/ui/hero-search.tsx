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
        {/* Unified Filter Box */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-lg max-w-5xl mx-auto animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Venue Type */}
            <div>
              <label className="flex items-center text-sm font-medium text-black mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-700 rounded-md mr-2">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                Typ prostoru
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white border-2 border-blue-700 text-black focus:border-black">
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

            {/* Capacity */}
            <div>
              <label className="flex items-center text-sm font-medium text-black mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-green-700 rounded-md mr-2">
                  <Users className="h-4 w-4 text-white" />
                </span>
                Kapacita
              </label>
              <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <SelectTrigger className="bg-white border-2 border-green-700 text-black focus:border-black">
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

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-black mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 rounded-md mr-2">
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                Lokalita
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="bg-white border-2 border-amber-700 text-black focus:border-black">
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

        {/* Search Button */}
        <div className="flex justify-center mt-8">
          <Button 
            type="submit" 
            size="lg" 
            className="px-12 py-4 text-lg font-medium rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Search className="w-6 h-6 mr-3" />
            Najít prostory
          </Button>
        </div>

      </form>
    </div>
  )
}
