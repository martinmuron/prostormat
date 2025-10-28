const GA_COOKIE_NAME = "_ga"
const FBP_COOKIE_NAME = "_fbp"
const FBC_COOKIE_NAME = "_fbc"

export type TrackingContext = {
  eventId?: string
  clientId?: string
  fbp?: string
  fbc?: string
}

export function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null
  }

  const cookies = document.cookie ? document.cookie.split(";") : []
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split("=")
    if (cookieName?.trim() === name) {
      return rest.join("=").trim() || null
    }
  }
  return null
}

export function getGAClientId(): string | undefined {
  const cookie = getCookie(GA_COOKIE_NAME)
  if (!cookie) return undefined

  const match = cookie.match(/^GA\d+\.\d+\.(\d+)\.(\d+)$/)
  if (match && match[1] && match[2]) {
    return `${match[1]}.${match[2]}`
  }

  return undefined
}

export function createTrackingContext(): TrackingContext {
  const eventId = generateEventId()
  const clientId = getGAClientId()
  const fbp = getCookie(FBP_COOKIE_NAME) || undefined
  const fbc = getCookie(FBC_COOKIE_NAME) || undefined

  return {
    eventId,
    clientId,
    fbp,
    fbc,
  }
}

export function sanitizeTrackingContext(input: unknown): TrackingContext | undefined {
  if (!input || typeof input !== "object") {
    return undefined
  }

  const source = input as Record<string, unknown>
  const eventId = typeof source.eventId === "string" ? source.eventId : undefined
  const clientId = typeof source.clientId === "string" ? source.clientId : undefined
  const fbp = typeof source.fbp === "string" ? source.fbp : undefined
  const fbc = typeof source.fbc === "string" ? source.fbc : undefined

  if (!eventId && !clientId && !fbp && !fbc) {
    return undefined
  }

  const context: TrackingContext = {}
  if (eventId) context.eventId = eventId
  if (clientId) context.clientId = clientId
  if (fbp) context.fbp = fbp
  if (fbc) context.fbc = fbc
  return context
}
