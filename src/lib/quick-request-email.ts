import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

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

  const emailResult = await resend.emails.send({
    from: FROM_EMAIL,
    to: venue.contactEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    replyTo: REPLY_TO_EMAIL,
  })

  if (!emailResult.data) {
    throw new Error(`Resend nevrátil email ID pro ${venue.contactEmail}`)
  }

  return {
    emailId: emailResult.data.id,
    subject: emailContent.subject,
  }
}
