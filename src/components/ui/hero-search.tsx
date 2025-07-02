"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, Calendar, Users, MapPin, ChevronDown } from "lucide-react"

export function HeroSearch() {
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedCapacity, setSelectedCapacity] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedType) params.set("type", selectedType)
    if (selectedCapacity) params.set("capacity", selectedCapacity)
    if (selectedDistrict) params.set("district", selectedDistrict)
    
    window.location.href = `/prostory?${params.toString()}`
  }

  const FilterCard = ({ 
    icon: Icon, 
    label, 
    value, 
    placeholder, 
    options, 
    onSelect, 
    dropdownKey 
  }: {
    icon: any
    label: string
    value: string
    placeholder: string
    options: Array<{ key: string; label: string }>
    onSelect: (value: string) => void
    dropdownKey: string
  }) => {
    const isOpen = openDropdown === dropdownKey

    return (
      <div className="relative">
        <div 
          className="glass-search-dark rounded-2xl p-6 hover-glow cursor-pointer transition-all duration-300 hover:scale-105"
          onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
        >
          <div className="flex items-center mb-4">
            <Icon className="h-5 w-5 text-white mr-3" />
            <label className="text-lg font-semibold text-gray-200">{label}</label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-white">
              {value || placeholder}
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-search-dark rounded-2xl p-4 max-h-60 overflow-y-auto" style={{ zIndex: 9999 }}>
            <div className="space-y-2">
              <div
                className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white"
                onClick={() => {
                  onSelect("")
                  setOpenDropdown(null)
                }}
              >
                {placeholder}
              </div>
              {options.map((option) => (
                <div
                  key={option.key}
                  className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white"
                  onClick={() => {
                    onSelect(option.key)
                    setOpenDropdown(null)
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Venue Type Filter */}
          <FilterCard
            icon={Calendar}
            label="Typ prostoru"
            value={selectedType ? VENUE_TYPES[selectedType as keyof typeof VENUE_TYPES] : ""}
            placeholder="Všechny typy"
            options={Object.entries(VENUE_TYPES).map(([key, label]) => ({ key, label }))}
            onSelect={setSelectedType}
            dropdownKey="type"
          />

          {/* Capacity Filter */}
          <FilterCard
            icon={Users}
            label="Kapacita"
            value={selectedCapacity}
            placeholder="Libovolná kapacita"
            options={CAPACITY_RANGES.map((range) => ({ key: range, label: range }))}
            onSelect={setSelectedCapacity}
            dropdownKey="capacity"
          />

          {/* Location Filter */}
          <FilterCard
            icon={MapPin}
            label="Lokalita"
            value={selectedDistrict}
            placeholder="Celá Praha"
            options={PRAGUE_DISTRICTS.map((district) => ({ key: district, label: district }))}
            onSelect={setSelectedDistrict}
            dropdownKey="district"
          />
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

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0" 
          style={{ zIndex: 9998 }}
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  )
}