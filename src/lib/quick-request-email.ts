import { resend } from "@/lib/resend"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

interface QuickRequestContact {
  eventType: string
  eventDate?: Date | null
  guestCount?: number | null
  budgetRange?: string | null
  locationPreference?: string | null
  additionalInfo?: string | null
  contactName: string
  contactEmail: string
  contactPhone?: string | null
}

interface QuickRequestVenueInfo {
  id: string
  name: string
  contactEmail: string
}

export async function sendQuickRequestEmailToVenue(
  venue: QuickRequestVenueInfo,
  request: QuickRequestContact
) {
  if (!venue.contactEmail) {
    throw new Error(`Venue ${venue.name} nemá vyplněný kontaktní email`)
  }

  const emailContent = generateQuickRequestVenueNotificationEmail({
    venueName: venue.name,
    venueContactEmail: venue.contactEmail,
    quickRequest: {
      eventType: request.eventType,
      eventDate: request.eventDate,
      guestCount: request.guestCount ?? undefined,
      budgetRange: request.budgetRange ?? undefined,
      locationPreference: request.locationPreference ?? undefined,
      additionalInfo: request.additionalInfo ?? undefined,
      contactName: request.contactName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone ?? undefined,
    },
  })

  const emailResult = await resend.emails.send({
    from: "Prostormat <noreply@prostormat.cz>",
    to: venue.contactEmail,
    replyTo: request.contactEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  })

  if (!emailResult.data) {
    throw new Error(`Resend nevrátil email ID pro ${venue.contactEmail}`)
  }

  return emailResult.data.id
}
