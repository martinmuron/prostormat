import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from '@/lib/resend'
import { generateVenueBroadcastEmail } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      eventType,
      eventDate,
      guestCount,
      budgetRange,
      locationPreference,
      requirements,
      contactEmail,
      contactPhone,
      contactName
    } = body

    // Validate required fields
    if (!title || !description || !eventType || !contactEmail || !contactName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find matching venues based on criteria
    const matchingVenues = await db.venue.findMany({
      where: {
        status: 'active',
        // Add more matching criteria here based on location, capacity, etc.
        ...(locationPreference && {
          address: {
            contains: locationPreference,
            mode: 'insensitive'
          }
        }),
        ...(guestCount && {
          OR: [
            { capacitySeated: { gte: guestCount } },
            { capacityStanding: { gte: guestCount } }
          ]
        })
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        managerId: true
      }
    })

    // Get venue IDs for the broadcast
    const venueIds = matchingVenues.map(venue => venue.id)

    // Create the broadcast
    const broadcast = await db.venueBroadcast.create({
      data: {
        userId: session.user.id,
        title,
        description,
        eventType,
        eventDate: eventDate ? new Date(eventDate) : null,
        guestCount: guestCount || null,
        budgetRange,
        locationPreference,
        requirements,
        contactEmail,
        contactPhone,
        contactName,
        sentVenues: venueIds
      }
    })

    // Send emails to venues and create broadcast logs
    const emailResults = await Promise.allSettled(
      matchingVenues.map(async (venue) => {
        try {
          // Skip venues without contact email
          if (!venue.contactEmail) {
            console.log(`⚠️ Skipping ${venue.name} - no contact email`)
            return await db.venueBroadcastLog.create({
              data: {
                broadcastId: broadcast.id,
                venueId: venue.id,
                emailStatus: 'skipped',
                emailError: 'No contact email available'
              }
            })
          }

          // Generate email content
          const emailTemplate = generateVenueBroadcastEmail({
            venueName: venue.name,
            venueContactEmail: venue.contactEmail,
            broadcast: {
              title,
              description,
              eventType,
              eventDate: eventDate ? new Date(eventDate) : null,
              guestCount,
              budgetRange,
              locationPreference,
              requirements,
              contactName,
              contactEmail,
              contactPhone
            }
          })

          // Send email via Resend (only if API key is configured)
          let emailStatus = 'pending'
          let emailError = null
          
          if (process.env.RESEND_API_KEY) {
            try {
              await resend.emails.send({
                from: FROM_EMAIL,
                to: venue.contactEmail,
                replyTo: REPLY_TO_EMAIL,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
              })
              emailStatus = 'sent'
              console.log(`✅ Email sent to ${venue.name} (${venue.contactEmail})`)
            } catch (emailErr) {
              emailStatus = 'failed'
              emailError = emailErr instanceof Error ? emailErr.message : 'Unknown email error'
              console.error(`❌ Failed to send email to ${venue.name}:`, emailErr)
            }
          } else {
            emailStatus = 'skipped'
            console.log(`⚠️ Email skipped for ${venue.name} - RESEND_API_KEY not configured`)
          }

          // Create broadcast log with email status
          return await db.venueBroadcastLog.create({
            data: {
              broadcastId: broadcast.id,
              venueId: venue.id,
              emailStatus,
              emailError
            }
          })
        } catch (error) {
          console.error(`Error processing venue ${venue.name}:`, error)
          
          // Create log entry even for errors
          return await db.venueBroadcastLog.create({
            data: {
              broadcastId: broadcast.id,
              venueId: venue.id,
              emailStatus: 'failed',
              emailError: error instanceof Error ? error.message : 'Unknown error'
            }
          })
        }
      })
    )

    const successfulEmails = emailResults.filter(result => 
      result.status === 'fulfilled' && 
      result.value?.emailStatus === 'sent'
    ).length
    
    console.log(`📧 Broadcast completed: ${successfulEmails}/${matchingVenues.length} emails sent successfully`)

    return NextResponse.json({
      success: true,
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        sentToVenues: matchingVenues.length,
        emailsSent: successfulEmails,
        emailStatus: process.env.RESEND_API_KEY ? 'enabled' : 'disabled'
      }
    })

  } catch (error) {
    console.error('Error creating venue broadcast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [broadcasts, total] = await Promise.all([
      db.venueBroadcast.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          logs: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  contactEmail: true
                }
              }
            }
          }
        }
      }),
      db.venueBroadcast.count({
        where: { userId: session.user.id }
      })
    ])

    return NextResponse.json({
      broadcasts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching venue broadcasts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}