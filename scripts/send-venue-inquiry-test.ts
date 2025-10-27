import "dotenv/config"
import { db } from "@/lib/db"
import { resend, FROM_EMAIL } from "@/lib/resend"
import { generateVenueInquiryAdminNotificationEmail } from "@/lib/email-templates"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Load your production env before sending a test email.")
    return
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Configure email credentials to send the test preview.")
    return
  }

  const latestInquiry = await db.venueInquiry.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          slug: true,
          paid: true,
          status: true,
        },
      },
    },
  })

  if (!latestInquiry || !latestInquiry.venue) {
    console.error("No venue inquiry found to generate test email.")
    return
  }

  const emailContent = generateVenueInquiryAdminNotificationEmail({
    inquiryId: latestInquiry.id,
    submittedAt: latestInquiry.createdAt,
    venue: {
      id: latestInquiry.venue.id,
      name: latestInquiry.venue.name,
      slug: latestInquiry.venue.slug,
      paid: latestInquiry.venue.paid ?? false,
      status: latestInquiry.venue.status,
    },
    inquiry: {
      customerName: latestInquiry.name,
      customerEmail: latestInquiry.email,
      customerPhone: latestInquiry.phone,
      eventDate: latestInquiry.eventDate ?? undefined,
      guestCount: latestInquiry.guestCount ?? undefined,
      message: latestInquiry.message ?? undefined,
    },
  })

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: ["mark.muron@gmail.com"],
    subject: `${emailContent.subject} (TEST náhled)`,
    html: emailContent.html,
    text: emailContent.text,
  })

  console.log("Test venue inquiry email sent.", result.data?.id ?? result)
}

main()
  .catch((error) => {
    console.error("Failed to send test venue inquiry email:", error)
  })
  .finally(async () => {
    await db.$disconnect().catch(() => {
      /* ignore */
    })
  })
