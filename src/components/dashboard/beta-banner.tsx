"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem("beta-banner-dismissed")
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("beta-banner-dismissed", "true")
  }

  // Prevent hydration mismatch
  if (!isMounted || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-200 bg-orange-50 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
          <p className="text-xs leading-tight text-gray-900 sm:text-sm">
            <span className="hidden sm:inline">
              Neustále přidáváme nové funkce, což znamená, že občas může něco přestat fungovat.
              Pokud narazíte na <span className="font-semibold text-red-600">chybu</span>, napište nám prosím na{" "}
            </span>
            <span className="sm:hidden">
              Narazili jste na <span className="font-semibold text-red-600">chybu</span>? Napište nám na{" "}
            </span>
            <a
              href="mailto:info@prostormat.cz"
              className="font-medium text-orange-700 underline hover:text-orange-800"
            >
              info@prostormat.cz
            </a>
            <span className="hidden sm:inline">. Děkujeme!</span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 text-gray-600 transition-colors hover:bg-orange-100 hover:text-gray-800"
          aria-label="Zavřít"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  )
}
