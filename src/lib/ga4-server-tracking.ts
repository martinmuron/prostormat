import crypto from "crypto"
import { headers } from "next/headers"

const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || process.env.GA4_MEASUREMENT_ID || ""
const GA4_API_SECRET = process.env.GA4_API_SECRET || ""

type GA4Value = string | number | boolean | undefined

type GA4Event = {
  name: string
  params?: Record<string, GA4Value>
}

type GA4ServerEventData = {
  clientId: string
  userId?: string
  userProperties?: Record<string, { value: string | number | boolean }>
  events: GA4Event[]
}

function hasGaCredentials() {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    return false
  }
  return true
}

export function generateClientId(): string {
  return `${Date.now()}.${Math.floor(Math.random() * 1e6)}`
}

export function extractClientIdFromCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return generateClientId()
  const match = cookieHeader.match(/_ga=GA\d+\.\d+\.(\d+)\.(\d+)/)
  if (match && match[1] && match[2]) {
    return `${match[1]}.${match[2]}`
  }
  return generateClientId()
}

async function sendGa4ServerEvent(eventData: GA4ServerEventData) {
  if (!hasGaCredentials()) {
    console.warn("GA4 credentials missing; skipping server event", eventData.events[0]?.name)
    return { success: false, error: "GA4 credentials missing" }
  }

  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`

    const payload = {
      client_id: eventData.clientId,
      user_id: eventData.userId,
      user_properties: eventData.userProperties,
      events: eventData.events,
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("GA4 server event failed:", response.status, text)
      return { success: false, error: text || String(response.status) }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send GA4 server event:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

function hashEmail(email?: string) {
  if (!email) return undefined
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex")
}

async function resolveClientId(request?: Request, explicitClientId?: string) {
  if (explicitClientId) return explicitClientId
  if (request) {
    return extractClientIdFromCookie(request.headers.get("cookie"))
  }
  try {
    const maybeHeaders = headers()
    if (typeof (maybeHeaders as unknown as { get?: unknown }).get === "function") {
      const cookieHeader = (maybeHeaders as unknown as { get: (key: string) => string | undefined }).get("cookie")
      return extractClientIdFromCookie(cookieHeader)
    }

    if (typeof (maybeHeaders as Promise<unknown>).then === "function") {
      const resolved = await maybeHeaders
      if (resolved && typeof (resolved as { get?: unknown }).get === "function") {
        return extractClientIdFromCookie(
          (resolved as { get: (key: string) => string | undefined }).get("cookie")
        )
      }
    }
  } catch (error) {
    console.warn("Unable to access headers() for GA4 client ID:", error)
  }
  return generateClientId()
}

type RegistrationPayload = {
  userId: string
  email?: string
  method?: string
  clientId?: string
  eventId?: string
  request?: Request
}

type LeadPayload = {
  userId?: string
  formType: string
  eventType?: string
  guestCount?: string | number
  location?: string
  budgetRange?: string
  email?: string
  venueName?: string
  venueId?: string
  clientId?: string
  eventId?: string
  request?: Request
}

type PaymentPayload = {
  userId?: string
  transactionId?: string
  value: number
  currency: string
  venueName?: string
  venueId?: string
  subscription?: boolean
  email?: string
  clientId?: string
  eventId?: string
  request?: Request
}

type LocationRegistrationPayload = {
  userId?: string
  venueId?: string
  venueName: string
  mode?: "new" | "claim"
  email?: string
  clientId?: string
  eventId?: string
  request?: Request
}

export async function trackGA4ServerRegistration(data: RegistrationPayload) {
  const clientId = await resolveClientId(data.request, data.clientId)
  const hashedEmail = hashEmail(data.email)
  await sendGa4ServerEvent({
    clientId,
    userId: data.userId,
    userProperties:
      hashedEmail !== undefined
        ? {
            email_hash: {
              value: hashedEmail,
            },
          }
        : undefined,
    events: [
      {
        name: "sign_up",
        params: {
          method: data.method || "email",
          event_id: data.eventId,
        },
      },
    ],
  })
}

export async function trackGA4ServerLead(data: LeadPayload) {
  const clientId = await resolveClientId(data.request, data.clientId)
  await sendGa4ServerEvent({
    clientId,
    userId: data.userId,
    events: [
      {
        name: "generate_lead",
        params: {
          form_type: data.formType,
          event_type: data.eventType,
          guest_count: data.guestCount,
          location: data.location,
          budget_range: data.budgetRange,
          venue_name: data.venueName,
          venue_id: data.venueId,
          event_id: data.eventId,
        },
      },
    ],
  })
}

export async function trackGA4ServerPayment(data: PaymentPayload) {
  const clientId = await resolveClientId(data.request, data.clientId)
  await sendGa4ServerEvent({
    clientId,
    userId: data.userId,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: data.transactionId,
          value: data.value,
          currency: data.currency,
          venue_name: data.venueName,
          venue_id: data.venueId,
          subscription: data.subscription ?? false,
          event_id: data.eventId,
        },
      },
    ],
  })
}

export async function trackGA4ServerLocationRegistration(data: LocationRegistrationPayload) {
  const clientId = await resolveClientId(data.request, data.clientId)
  await sendGa4ServerEvent({
    clientId,
    userId: data.userId,
    events: [
      {
        name: "location_registration",
        params: {
          venue_id: data.venueId,
          venue_name: data.venueName,
          registration_mode: data.mode || "new",
          event_id: data.eventId,
        },
      },
    ],
  })
}
