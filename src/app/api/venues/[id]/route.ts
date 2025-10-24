import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const subscriptionStatuses = ["active", "past_due", "canceled", "unpaid"] as const

const updateVenueSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().or(z.literal("")),
  address: z.string().min(5).optional(),
  district: z.string().min(2).optional().or(z.literal("")),
  venueType: z.string().optional().nullable(),
  contactEmail: z.union([z.string().email(), z.literal("")]).optional(),
  contactPhone: z.union([z.string(), z.literal("")]).optional(),
  websiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  instagramUrl: z.union([z.string().url(), z.literal("")]).optional(),
  youtubeUrl: z.union([z.string().url(), z.literal("")]).optional(),
  videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  musicAfter10: z.boolean().optional(),
  capacitySeated: z.union([z.string(), z.number()]).optional(),
  capacityStanding: z.union([z.string(), z.number()]).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["draft", "pending", "published", "hidden", "active"]).optional(),
  isRecommended: z.boolean().optional(),
  priority: z.number().int().min(1).max(3).nullable().optional(),
  prioritySource: z.enum(['manual', 'subscription']).nullable().optional(),
  managerId: z.string().optional(), // Allow admin to assign managers
  billingEmail: z.union([z.string().email(), z.literal("")]).optional(),
  billingName: z.string().optional().or(z.literal("")),
  billingAddress: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  vatId: z.string().optional().or(z.literal("")),
  subscriptionStatus: z.union([z.enum(subscriptionStatuses), z.literal(""), z.null()]).optional(),
  expiresAt: z.union([z.string(), z.date(), z.null()]).optional(),
  paid: z.boolean().optional(),
  paymentDate: z.union([z.string(), z.date(), z.null()]).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is admin or venue manager for this venue
    if (session.user.role !== "admin") {
      if (session.user.role !== "venue_manager") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
      
      // Verify venue manager owns this venue
      const venue = await db.venue.findUnique({
        where: { id },
        select: { managerId: true }
      })
      
      if (!venue || venue.managerId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    // Validate request body
    const json = await request.json()
    const body = updateVenueSchema.parse(json)

    const normalizeString = (value: unknown) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed.length === 0 ? null : trimmed
    }

    const normalizeCapacity = (value: unknown) => {
      if (typeof value === "number") {
        return Number.isNaN(value) ? null : value
      }
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (!trimmed) return null
        const parsed = Number.parseInt(trimmed, 10)
        return Number.isNaN(parsed) ? null : parsed
      }
      return null
    }

    const normalizeDate = (value: unknown) => {
      if (value === null || typeof value === "undefined") return null
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value
      }
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (!trimmed) return null
        const date = new Date(trimmed)
        return Number.isNaN(date.getTime()) ? null : date
      }
      return null
    }

    const updateData: Record<string, unknown> = {}

    if (typeof body.name !== "undefined") updateData.name = body.name
    if (typeof body.description !== "undefined") updateData.description = normalizeString(body.description)
    if (typeof body.address !== "undefined") updateData.address = body.address
    if (typeof body.district !== "undefined") updateData.district = normalizeString(body.district)
    if (typeof body.venueType !== "undefined") updateData.venueType = body.venueType ?? null
    if (typeof body.contactEmail !== "undefined") updateData.contactEmail = normalizeString(body.contactEmail)
    if (typeof body.contactPhone !== "undefined") updateData.contactPhone = normalizeString(body.contactPhone)
    if (typeof body.websiteUrl !== "undefined") updateData.websiteUrl = normalizeString(body.websiteUrl)
    if (typeof body.instagramUrl !== "undefined") updateData.instagramUrl = normalizeString(body.instagramUrl)
    if (typeof body.youtubeUrl !== "undefined") {
      updateData.videoUrl = normalizeString(body.youtubeUrl)
      updateData.youtubeUrl = normalizeString(body.youtubeUrl)
    }
    if (typeof body.videoUrl !== "undefined") {
      updateData.videoUrl = normalizeString(body.videoUrl)
      updateData.youtubeUrl = normalizeString(body.videoUrl)
    }
    if (typeof body.musicAfter10 !== "undefined") updateData.musicAfter10 = body.musicAfter10
    if (typeof body.capacitySeated !== "undefined") updateData.capacitySeated = normalizeCapacity(body.capacitySeated)
    if (typeof body.capacityStanding !== "undefined") updateData.capacityStanding = normalizeCapacity(body.capacityStanding)
    if (typeof body.amenities !== "undefined") updateData.amenities = body.amenities ?? []
    if (typeof body.images !== "undefined") updateData.images = body.images ?? []
    if (typeof body.status !== "undefined") updateData.status = body.status
    if (typeof body.isRecommended !== "undefined") updateData.isRecommended = body.isRecommended
    if (typeof body.priority !== "undefined") updateData.priority = body.priority
    if (typeof body.prioritySource !== "undefined") updateData.prioritySource = body.prioritySource
    if (typeof body.managerId !== "undefined") updateData.managerId = body.managerId
    if (typeof body.billingEmail !== "undefined") updateData.billingEmail = normalizeString(body.billingEmail)
    if (typeof body.billingName !== "undefined") updateData.billingName = normalizeString(body.billingName)
    if (typeof body.billingAddress !== "undefined") updateData.billingAddress = normalizeString(body.billingAddress)
    if (typeof body.taxId !== "undefined") updateData.taxId = normalizeString(body.taxId)
    if (typeof body.vatId !== "undefined") updateData.vatId = normalizeString(body.vatId)
    if (typeof body.subscriptionStatus !== "undefined") {
      if (typeof body.subscriptionStatus === "string") {
        const status = body.subscriptionStatus.trim()
        updateData.subscriptionStatus = status ? status : null
      } else {
        updateData.subscriptionStatus = body.subscriptionStatus
      }
    }
    if (typeof body.paid !== "undefined") updateData.paid = body.paid
    if (typeof body.paymentDate !== "undefined") updateData.paymentDate = normalizeDate(body.paymentDate)
    if (typeof body.expiresAt !== "undefined") updateData.expiresAt = normalizeDate(body.expiresAt)

    // Only admins can change status, isRecommended, or manager assignments
    if (session.user.role !== "admin") {
      delete updateData.status
      delete updateData.isRecommended
      delete updateData.priority
      delete updateData.prioritySource
      delete updateData.managerId
      delete updateData.billingEmail
      delete updateData.billingName
      delete updateData.billingAddress
      delete updateData.taxId
      delete updateData.vatId
      delete updateData.subscriptionStatus
      delete updateData.paid
      delete updateData.paymentDate
      delete updateData.expiresAt
    }

    // If managerId is provided and user is admin, verify the manager exists
    if (body.managerId && session.user.role === "admin") {
      const manager = await db.user.findUnique({
        where: { id: body.managerId },
        select: { role: true }
      })
      
      if (!manager || manager.role !== "venue_manager") {
        return new NextResponse("Invalid manager ID - user must be a venue_manager", { status: 400 })
      }
    }

    // Update the venue
    const updatedVenue = await db.venue.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedVenue)
  } catch (error) {
    console.error("Error updating venue:", error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    
    return new NextResponse("Internal server error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is admin or venue manager for this venue
    if (session.user.role !== "admin") {
      if (session.user.role !== "venue_manager") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
      
      // Verify venue manager owns this venue
      const venueCheck = await db.venue.findUnique({
        where: { id },
        select: { managerId: true }
      })
      
      if (!venueCheck || venueCheck.managerId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    // Get the venue
    const venue = await db.venue.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!venue) {
      return new NextResponse("Venue not found", { status: 404 })
    }

    return NextResponse.json(venue)
  } catch (error) {
    console.error("Error fetching venue:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
