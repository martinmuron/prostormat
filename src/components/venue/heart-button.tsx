"use client"

import { useState, useEffect } from "react"
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
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if venue is favorited when component mounts
  useEffect(() => {
    if (session?.user?.id && venueId) {
      checkFavoriteStatus()
    }
  }, [session?.user?.id, venueId])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/venues/${venueId}/favorite`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.isFavorited)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      window.location.href = '/prihlaseni?callbackUrl=' + encodeURIComponent(window.location.pathname)
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
        console.error('Error toggling favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
}