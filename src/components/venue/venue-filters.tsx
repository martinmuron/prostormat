'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search, MapPin, Users, Calendar, Heart } from "lucide-react"

interface VenueSuggestion {
  id: string
  name: string
  slug: string
  district?: string | null
}

interface VenueFiltersProps {
  initialValues: {
    q?: string
    type?: string
    district?: string
    capacity?: string
    favorites?: string
  }
}

type FilterState = {
  q: string
  type?: string
  district?: string
  capacity?: string
  favorites?: boolean
}

export function VenueFilters({ initialValues }: VenueFiltersProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const computeFilterValue = (value?: string) => {
    if (!value || value === "all") return undefined
    return value
  }

  const [filters, setFilters] = useState<FilterState>(() => {
    const hasSearch = Boolean(initialValues.q)
    return {
      q: initialValues.q ?? "",
      type: hasSearch ? undefined : computeFilterValue(initialValues.type),
      district: hasSearch ? undefined : computeFilterValue(initialValues.district),
      capacity: hasSearch ? undefined : computeFilterValue(initialValues.capacity),
      favorites: initialValues.favorites === "true",
    }
  })
  const [isSearchMode, setIsSearchMode] = useState(Boolean(initialValues.q))
  const [suggestions, setSuggestions] = useState<VenueSuggestion[]>([])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestionContext, setActiveSuggestionContext] = useState<'desktop' | 'mobile' | null>(null)
  const suggestionHideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const hasSearch = Boolean(initialValues.q)
    setFilters({
      q: initialValues.q ?? "",
      type: hasSearch ? undefined : computeFilterValue(initialValues.type),
      district: hasSearch ? undefined : computeFilterValue(initialValues.district),
      capacity: hasSearch ? undefined : computeFilterValue(initialValues.capacity),
      favorites: initialValues.favorites === "true",
    })
    setIsSearchMode(hasSearch)
  }, [initialValues.q, initialValues.type, initialValues.district, initialValues.capacity, initialValues.favorites])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    const trimmedQuery = filters.q.trim()
    if (trimmedQuery.length > 0) {
      params.set("q", trimmedQuery)
    }
    if (filters.type) {
      params.set("type", filters.type)
    }
    if (filters.district) {
      params.set("district", filters.district)
    }
    if (filters.capacity) {
      params.set("capacity", filters.capacity)
    }
    if (filters.favorites) {
      params.set("favorites", "true")
    }

    const paramsString = params.toString()
    router.push(paramsString ? `/prostory?${paramsString}` : '/prostory')
  }

  const toggleFavorites = () => {
    const newFavorites = !filters.favorites
    setFilters(prev => ({ ...prev, favorites: newFavorites }))

    // Immediately update URL
    const params = new URLSearchParams()
    if (filters.q.trim()) params.set("q", filters.q.trim())
    if (filters.type) params.set("type", filters.type)
    if (filters.district) params.set("district", filters.district)
    if (filters.capacity) params.set("capacity", filters.capacity)
    if (newFavorites) params.set("favorites", "true")

    const paramsString = params.toString()
    router.push(paramsString ? `/prostory?${paramsString}` : '/prostory')
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === "q") {
      setFilters(prev => ({ ...prev, q: value }))
      return
    }
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }))
  }

  const toggleSearchMode = () => {
    setFilters(prev => {
      if (isSearchMode) {
        return { ...prev, q: "" }
      }
      return { ...prev, type: undefined, district: undefined, capacity: undefined }
    })
    setIsSearchMode(prev => !prev)
    setSuggestions([])
    setSuggestionsOpen(false)
    setActiveSuggestionContext(null)
  }

  useEffect(() => {
    const trimmed = filters.q.trim()
    if (trimmed.length === 0) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setIsFetchingSuggestions(true)
        const response = await fetch(`/api/venues/suggestions?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        const data: { venues: VenueSuggestion[] } = await response.json()
        setSuggestions(data.venues ?? [])
        if (activeSuggestionContext) {
          setSuggestionsOpen(true)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load venue suggestions:', error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsFetchingSuggestions(false)
        }
      }
    }, 200)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [filters.q, activeSuggestionContext])

  const closeSuggestionsDelayed = useCallback(() => {
    if (suggestionHideTimeoutRef.current) {
      clearTimeout(suggestionHideTimeoutRef.current)
    }
    suggestionHideTimeoutRef.current = setTimeout(() => {
      setSuggestionsOpen(false)
      setActiveSuggestionContext(null)
    }, 120)
  }, [])

  const handleSuggestionFocus = useCallback((context: 'desktop' | 'mobile') => {
    if (suggestionHideTimeoutRef.current) {
      clearTimeout(suggestionHideTimeoutRef.current)
      suggestionHideTimeoutRef.current = null
    }
    setActiveSuggestionContext(context)
    if (filters.q.trim().length > 0) {
      setSuggestionsOpen(true)
    }
  }, [filters.q])

  const handleSuggestionSelect = useCallback((suggestion: VenueSuggestion) => {
    setFilters(prev => ({ ...prev, q: suggestion.name }))
    setSuggestionsOpen(false)
    setActiveSuggestionContext(null)
    router.push(`/prostory/${suggestion.slug}`)
  }, [router])

  const renderSuggestions = useMemo(() => {
    if (!suggestionsOpen) {
      return null
    }

    return (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-gray-200 bg-white shadow-lg z-30">
        <div className="max-h-64 overflow-y-auto py-2">
          {isFetchingSuggestions ? (
            <div className="px-4 py-3 text-sm text-gray-500">Načítám výsledky…</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Žádné prostory neodpovídají hledání.</div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseDown={(event) => event.preventDefault()}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{suggestion.name}</div>
                {suggestion.district && (
                  <div className="text-sm text-gray-500">{suggestion.district}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    )
  }, [suggestionsOpen, isFetchingSuggestions, suggestions, handleSuggestionSelect])

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full max-w-7xl mx-auto rounded-2xl border-2 border-gray-200 bg-white/90 shadow-lg backdrop-blur p-4 sm:p-6 md:p-8">
        {isSearchMode ? (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <button
              type="button"
              onClick={toggleSearchMode}
              className="hidden md:inline-flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full flex-shrink-0 hover:bg-gray-800 transition-colors"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
            <div className="relative flex-1">
              <Input
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                onFocus={() => handleSuggestionFocus('desktop')}
                onBlur={closeSuggestionsDelayed}
                className="h-12 rounded-2xl border-2 border-gray-700 bg-white text-base shadow-sm transition-all focus:border-black"
                placeholder="Například: Praha, Karlín, loft..."
              />
              {activeSuggestionContext === 'desktop' && renderSuggestions}
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
            >
              Najít ideální místo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search toggle button - visible on desktop, hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={toggleSearchMode}
                className="inline-flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full flex-shrink-0 hover:bg-gray-800 transition-colors"
              >
                <Search className="h-5 w-5 text-white" />
              </button>

              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-700 rounded-md flex-shrink-0">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-blue-700 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Vyber typ prostoru" />
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

              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-green-700 rounded-md flex-shrink-0">
                  <Users className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.capacity}
                  onValueChange={(value) => handleFilterChange("capacity", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-green-700 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Kolik lidí přivedeš?" />
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

              <div className="flex w-full items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 rounded-md flex-shrink-0">
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                <Select
                  value={filters.district}
                  onValueChange={(value) => handleFilterChange("district", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-amber-700 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Kde to má být?" />
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

              <Button
                type="submit"
                className="h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
              >
                Najít ideální místo
              </Button>

              {/* Favorites toggle - only visible for logged in users */}
              {session?.user && (
                <button
                  type="button"
                  onClick={toggleFavorites}
                  className={`h-12 px-4 rounded-xl border-2 flex items-center gap-2 font-medium transition-all flex-shrink-0 ${
                    filters.favorites
                      ? 'bg-red-50 border-red-400 text-red-600 hover:bg-red-100'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  title={filters.favorites ? 'Zobrazit všechny prostory' : 'Zobrazit pouze oblíbené'}
                >
                  <Heart className={`h-5 w-5 ${filters.favorites ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="hidden xl:inline">{filters.favorites ? 'Oblíbené' : 'Oblíbené'}</span>
                </button>
              )}
            </div>

            {/* Mobile layout - vertical stack */}
            <div className="flex flex-col gap-4 md:hidden">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-xl flex-shrink-0">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <div className="relative flex-1">
                  <Input
                    value={filters.q}
                    onChange={(e) => handleFilterChange("q", e.target.value)}
                    onFocus={() => handleSuggestionFocus('mobile')}
                    onBlur={closeSuggestionsDelayed}
                    placeholder="Hledat podle názvu"
                    className="h-11 sm:h-12 rounded-2xl border-2 border-gray-300 bg-white text-base"
                  />
                  {activeSuggestionContext === 'mobile' && renderSuggestions}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex-shrink-0">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-blue-600 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Vyber typ prostoru" />
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

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-xl flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Select
                  value={filters.capacity}
                  onValueChange={(value) => handleFilterChange("capacity", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-green-600 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Kolik lidí přivedeš?" />
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

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-xl flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <Select
                  value={filters.district}
                  onValueChange={(value) => handleFilterChange("district", value)}
                >
                  <SelectTrigger className="!w-full h-12 rounded-2xl border-2 border-orange-600 bg-white text-base text-black focus:border-black">
                    <SelectValue placeholder="Kde to má být?" />
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

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-md transition-all hover:bg-blue-700 flex items-center justify-center"
                >
                  Najít ideální místo
                </Button>

                {/* Favorites toggle - only visible for logged in users */}
                {session?.user && (
                  <button
                    type="button"
                    onClick={toggleFavorites}
                    className={`h-12 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                      filters.favorites
                        ? 'bg-red-50 border-red-400 text-red-600'
                        : 'bg-white border-gray-300 text-gray-600'
                    }`}
                    title={filters.favorites ? 'Zobrazit všechny prostory' : 'Zobrazit pouze oblíbené'}
                  >
                    <Heart className={`h-5 w-5 ${filters.favorites ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
