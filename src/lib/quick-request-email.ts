import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"
import { validateAndExtractEmail, getEmailValidationError } from "@/lib/email-validation"

interface QuickRequestContact {
  title?: string | null
  guestCount?: number | null
  eventDate?: Date | string | null
  locationPreference?: string | null
}

interface QuickRequestVenueInfo {
  id: string
  name: string
  slug: string
  contactEmail: string | null
}

export async function sendQuickRequestEmailToVenue(
  venue: QuickRequestVenueInfo,
  broadcastId: string,
  request: QuickRequestContact
) {
  if (!venue.contactEmail) {
    throw new Error(`Venue ${venue.name} nemá vyplněný kontaktní email`)
  }

  // Validate and extract email - ensures ASCII-only for Resend compatibility
  const recipientEmail = validateAndExtractEmail(venue.contactEmail)

  if (!recipientEmail) {
    const errorDetail = getEmailValidationError(venue.contactEmail)
    throw new Error(`Venue ${venue.name}: ${errorDetail || "Neplatný kontaktní email"}`)
  }

  const emailContent = generateQuickRequestVenueNotificationEmail({
    venueName: venue.name,
    venueSlug: venue.slug,
    broadcastId,
    quickRequest: {
      title: request.title,
      guestCount: request.guestCount,
      eventDate: request.eventDate,
      locationPreference: request.locationPreference,
    },
  })

  const maxAttempts = 4
  const baseDelayMs = 750

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const isRateLimitError = (error: unknown): boolean => {
    if (!error) return false

    const message =
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : null

    if (!message) return false

    const normalized = message.toLowerCase()
    return normalized.includes("too many requests") || normalized.includes("rate limit") || normalized.includes("429")
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const emailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        replyTo: REPLY_TO_EMAIL,
      })

      if (!emailResult.data) {
        const errorDetails = emailResult.error ?? new Error("Unknown Resend error")

        // Log the full Resend error for debugging
        console.error("Resend API error:", {
          email: recipientEmail,
          attempt,
          error: errorDetails,
          fullResponse: emailResult,
        })

        const errorMessage = emailResult.error?.message || "Unknown Resend error"

        if (isRateLimitError(errorDetails) && attempt < maxAttempts) {
          const backoffMs = baseDelayMs * attempt
          await wait(backoffMs)
          continue
        }

        throw new Error(`Resend nevrátil email ID pro ${recipientEmail}: ${errorMessage}`)
      }

      return {
        emailId: emailResult.data.id,
        subject: emailContent.subject,
      }
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error(
              typeof error === "string"
                ? error
                : "Došlo k neznámé chybě při odesílání emailu přes Resend"
            )

      lastError = normalizedError

      console.error("Resend send attempt failed:", {
        email: recipientEmail,
        attempt,
        error: normalizedError,
      })

      if (isRateLimitError(normalizedError) && attempt < maxAttempts) {
        const backoffMs = baseDelayMs * attempt
        await wait(backoffMs)
        continue
      }

      throw normalizedError
    }
  }

  throw lastError ?? new Error(`Resend nevrátil email ID pro ${recipientEmail}: Neznámá chyba`)
}
