'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"

const STORAGE_KEY = "prostormat-premium-upsell-dismissed"
const HIDE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

export function PremiumUpsellPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    let timer: number | undefined

    const scheduleShow = () => {
      timer = window.setTimeout(() => setVisible(true), 1200)
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY)
      if (!storedValue) {
        scheduleShow()
      } else {
        const lastDismissed = Number(storedValue)
        if (!Number.isFinite(lastDismissed) || Date.now() - lastDismissed > HIDE_DURATION) {
          scheduleShow()
        }
      }
    } catch {
      scheduleShow()
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [])

  const dismiss = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, Date.now().toString())
      } catch {
        // Ignore storage errors (private mode, etc.)
      }
    }
    setVisible(false)
  }

  if (!visible) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 w-full max-w-xs sm:max-w-sm drop-shadow-2xl">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
        <button
          type="button"
          aria-label="Zavřít doporučení"
          onClick={dismiss}
          className="absolute top-3 right-3 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-black">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Získejte více poptávek</p>
            <p className="mt-1 text-xs text-gray-600">
              Vyplňte krátkou žádost a náš tým s vámi projde Priority nebo Top Priority balíčky individuálně.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link href="/dashboard/priority">
            <Button className="w-full rounded-2xl bg-black text-white hover:bg-gray-900">
              Zažádat o Priority
            </Button>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="w-full text-xs font-medium text-gray-500 transition hover:text-gray-800"
          >
            Připomenout později
          </button>
        </div>
      </div>
    </div>
  )
}
