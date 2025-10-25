import { resend } from "@/lib/resend"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

interface QuickRequestContact {
  eventType: string
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

  return emailResult.data.id
}
