import type { TrackingContext } from "@/lib/tracking-utils"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function trackMetaEvent(eventName: string, tracking?: TrackingContext) {
  if (typeof window === "undefined") return
  const fbq = window.fbq
  if (typeof fbq !== "function") {
    console.warn(`[Meta Pixel] fbq not available, event ${eventName} not tracked`)
    return
  }

  const eventId = tracking?.eventId
  if (!eventId) {
    console.warn(`[Meta Pixel] Missing eventId for ${eventName} event; skipping pixel dispatch`)
    return
  }

  fbq("track", eventName, { eventID: eventId })
}

export function trackMetaRegistration(tracking?: TrackingContext) {
  trackMetaEvent("Registration", tracking)
}
