import { resend } from "@/lib/resend"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

interface QuickRequestContact {
  eventType: string
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

  const emailContent = generateQuickRequestVenueNotificationEmail({
    venueName: venue.name,
    venueSlug: venue.slug,
    broadcastId,
    quickRequest: {
      eventType: request.eventType,
      title: request.title,
      guestCount: request.guestCount,
      eventDate: request.eventDate,
      locationPreference: request.locationPreference,
    },
  })

  const emailResult = await resend.emails.send({
    from: "Prostormat <noreply@prostormat.cz>",
    to: venue.contactEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  })

  if (!emailResult.data) {
    throw new Error(`Resend nevrátil email ID pro ${venue.contactEmail}`)
  }

  return {
    emailId: emailResult.data.id,
    subject: emailContent.subject,
  }
}
