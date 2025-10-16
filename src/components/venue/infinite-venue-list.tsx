'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { VenueCard } from '@/components/venue/venue-card'

interface Venue {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  capacitySeated: number | null
  capacityStanding: number | null
  venueType: string | null
  images: string[]
  status: string
  priority?: number | null
}

interface InfiniteVenueListProps {
  initialVenues: Venue[]
  searchParams: {
    q?: string
    type?: string
    district?: string
    capacity?: string
  }
  hasMore: boolean
  orderSeed: number
}

export function InfiniteVenueList({
  initialVenues,
  searchParams,
  hasMore: initialHasMore,
  orderSeed,
}: InfiniteVenueListProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Reset when search params change
  useEffect(() => {
    setVenues(initialVenues)
    setPage(1)
    setHasMore(initialHasMore)
  }, [initialVenues, initialHasMore, orderSeed])

  const loadMoreVenues = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page + 1))
      params.set('orderSeed', String(orderSeed))

      Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 0) {
          params.set(key, value)
        }
      })

      const response = await fetch(`/api/venues/paginated?${params}`)
      const data = await response.json()

      if (data.venues && data.venues.length > 0) {
        setVenues((prev) => [...prev, ...data.venues])
        setPage((p) => p + 1)
        setHasMore(data.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more venues:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, orderSeed, page, searchParams])

  // Load more venues when user scrolls near the bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loading) {
          void loadMoreVenues()
        }
      },
      {
        rootMargin: '200px', // Load 200px before reaching the bottom
      }
    )

    const node = loadMoreRef.current

    if (node) {
      observer.observe(node)
    }

    return () => {
      if (node) {
        observer.unobserve(node)
      }
    }
  }, [hasMore, loadMoreVenues, loading])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Načítání dalších prostor...</p>
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="h-20" />
      )}

      {/* End message */}
      {!hasMore && venues.length > 0 && (
        <div className="mt-12 text-center text-sm text-gray-500">
          Zobrazeny všechny prostory ({venues.length})
        </div>
      )}
    </>
  )
}
