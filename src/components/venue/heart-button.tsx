"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface HeartButtonProps {
  venueId: string
  className?: string
  size?: "sm" | "icon" | "default"
}

export function HeartButton({ venueId, className = "", size = "icon" }: HeartButtonProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginOverlay, setShowLoginOverlay] = useState(false)

  const checkFavoriteStatus = useCallback(async () => {
    if (!userId) {
      return
    }

    try {
      const response = await fetch(`/api/venues/${venueId}/favorite`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.isFavorited)
      } else {
        const errorData = await response.json()
        console.error('Error checking favorite status:', errorData)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }, [venueId, userId])

  // Check if venue is favorited when component mounts
  useEffect(() => {
    if (userId && venueId) {
      void checkFavoriteStatus()
    }
  }, [checkFavoriteStatus, userId, venueId])

  const toggleFavorite = async () => {
    if (!session?.user?.id) {
      // Show overlay for non-authenticated users
      setShowLoginOverlay(true)
      setTimeout(() => setShowLoginOverlay(false), 3000)
      return
    }

    setIsLoading(true)
    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const response = await fetch(`/api/venues/${venueId}/favorite`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.isFavorited)
        
        // Show a subtle success message
        if (data.isFavorited) {
          console.log('Venue added to favorites!')
        } else {
          console.log('Venue removed from favorites!')
        }
      } else {
        const errorData = await response.json()
        console.error('Error toggling favorite:', errorData)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size={size}
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`transition-all duration-200 ${className} ${
          isFavorited
            ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
        }`}
        title={isFavorited ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      >
        <Heart 
          className={`h-5 w-5 transition-all duration-200 ${
            isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'
          } ${isLoading ? 'animate-pulse' : ''}`}
        />
      </Button>
      
      {/* Login Overlay */}
      {showLoginOverlay && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-xs sm:text-sm animate-fade-in max-w-[200px] sm:max-w-none text-center">
          <div className="relative">
            Musíte se přihlásit pro použití této funkce
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}