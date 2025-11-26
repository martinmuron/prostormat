"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface HeartButtonProps {
  venueId: string
  className?: string
  size?: "sm" | "icon" | "default"
}

// Create or get the overlay container
function getOrCreateOverlayContainer(): HTMLDivElement {
  let container = document.getElementById('heart-login-overlay-container') as HTMLDivElement
  if (!container) {
    container = document.createElement('div')
    container.id = 'heart-login-overlay-container'
    document.body.appendChild(container)
  }
  return container
}

// Show the login overlay using direct DOM manipulation
function showLoginOverlayDOM(buttonRect: DOMRect) {
  const container = getOrCreateOverlayContainer()

  // Calculate position - using fixed positioning, so no need for scrollY/scrollX
  const top = buttonRect.bottom + 8
  const left = Math.max(8, buttonRect.right - 320)

  // Create overlay HTML
  container.innerHTML = `
    <div
      id="heart-login-overlay"
      style="
        position: fixed;
        top: ${top}px;
        left: ${left}px;
        background-color: rgb(17, 24, 39);
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        z-index: 9999;
        font-size: 14px;
        width: 320px;
        text-align: center;
        animation: fadeIn 0.2s ease-out;
      "
    >
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #heart-login-overlay a {
          color: rgb(96, 165, 250);
          text-decoration: underline;
        }
        #heart-login-overlay a:hover {
          color: rgb(147, 197, 253);
        }
      </style>
      <p style="font-weight: 500; margin-bottom: 8px;">Pro uložení do oblíbených</p>
      <span>se </span><a href="/prihlaseni">přihlaste</a>
      <span> nebo </span>
      <a href="/registrace">vytvořte účet zdarma</a>
    </div>
  `

  // Auto-hide after 3 seconds
  setTimeout(() => {
    hideLoginOverlayDOM()
  }, 3000)
}

// Hide the login overlay
function hideLoginOverlayDOM() {
  const container = document.getElementById('heart-login-overlay-container')
  if (container) {
    container.innerHTML = ''
  }
}

export function HeartButton({ venueId, className = "", size = "icon" }: HeartButtonProps) {
  const { data: session, status } = useSession()
  const userId = session?.user?.id ?? null
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Only render on client
  useEffect(() => {
    setIsMounted(true)

    // Cleanup on unmount
    return () => {
      hideLoginOverlayDOM()
    }
  }, [])

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
    console.log('HeartButton clicked, session:', session, 'status:', status)
    if (!session?.user?.id) {
      // Show overlay for non-authenticated users using direct DOM manipulation
      console.log('No session, showing login overlay via DOM')

      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        showLoginOverlayDOM(rect)
      }
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

  // Don't render until client-side mounted
  if (!isMounted) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        className={`transition-all duration-200 ${className} bg-white border-gray-200 text-gray-600`}
        title="Přidat do oblíbených"
      >
        <Heart className="h-5 w-5 text-gray-500" />
      </Button>
    )
  }

  return (
    <Button
      ref={buttonRef}
      variant="secondary"
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading || status === 'loading'}
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
