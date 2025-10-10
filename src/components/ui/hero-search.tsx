"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, Calendar, Users, MapPin } from "lucide-react"

export function HeroSearch() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined)
  const [selectedCapacity, setSelectedCapacity] = useState<string | undefined>(undefined)
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedType && selectedType !== "all") params.set("type", selectedType)
    if (selectedCapacity && selectedCapacity !== "all") params.set("capacity", selectedCapacity)
    if (selectedDistrict && selectedDistrict !== "all") params.set("district", selectedDistrict)
    
    window.location.href = `/prostory?${params.toString()}`
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Unified Filter Box */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-gray-200 shadow-lg w-full animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end w-full">
            {/* Venue Type */}
            <div className="w-full">
              <label className="flex items-center justify-center md:justify-start text-sm font-medium text-black mb-2 text-center md:text-left gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-700 rounded-md">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                Vyber typ prostoru
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="!w-full bg-white border-2 border-blue-700 text-black focus:border-black">
                  <SelectValue placeholder="Vyber typ prostoru" />
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
            <div className="w-full">
              <label className="flex items-center justify-center md:justify-start text-sm font-medium text-black mb-2 text-center md:text-left gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-green-700 rounded-md">
                  <Users className="h-4 w-4 text-white" />
                </span>
                Kolik lidí přivedeš?
              </label>
              <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <SelectTrigger className="!w-full bg-white border-2 border-green-700 text-black focus:border-black">
                  <SelectValue placeholder="Kolik lidí přivedeš?" />
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
            <div className="w-full">
              <label className="flex items-center justify-center md:justify-start text-sm font-medium text-black mb-2 text-center md:text-left gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 rounded-md">
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                Kde to má být?
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="!w-full bg-white border-2 border-amber-700 text-black focus:border-black">
                  <SelectValue placeholder="Kde to má být?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Celá Praha</SelectItem>
                  {PRAGUE_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <div className="w-full mt-2 md:mt-0 md:self-center">
              <Button
                type="submit"
                className="w-full h-11 md:h-[42px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Search className="w-4 h-4 mr-2" />
                Najít ideální místo
              </Button>
            </div>
          </div>
        </div>
        
      </form>
    </div>
  )
}
