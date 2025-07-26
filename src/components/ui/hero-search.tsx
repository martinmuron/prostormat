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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <label className="text-base font-medium text-gray-800">Typ prostoru</label>
            </div>
            <div className="flex justify-center">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-blue-50/50 border-2 border-blue-200 text-gray-800 focus:border-blue-500 hover:bg-blue-50 transition-all duration-200 w-full max-w-xs">
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
          </div>

          {/* Capacity Filter */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <label className="text-base font-medium text-gray-800">Kapacita</label>
            </div>
            <div className="flex justify-center">
              <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <SelectTrigger className="bg-green-50/50 border-2 border-green-200 text-gray-800 focus:border-green-500 hover:bg-green-50 transition-all duration-200 w-full max-w-xs">
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
          </div>

          {/* Location Filter */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <label className="text-base font-medium text-gray-800">Lokalita</label>
            </div>
            <div className="flex justify-center">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="bg-purple-50/50 border-2 border-purple-200 text-gray-800 focus:border-purple-500 hover:bg-purple-50 transition-all duration-200 w-full max-w-xs">
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

      </form>
    </div>
  )
}