import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)

    const venue = await db.venue.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        description: true,
        address: true,
        district: true,
        capacitySeated: true,
        capacityStanding: true,
        venueType: true,
        contactEmail: true,
        contactPhone: true,
        websiteUrl: true,
        instagramUrl: true,
        videoUrl: true,
        youtubeUrl: true,
        musicAfter10: true,
        amenities: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!venue) {
      return NextResponse.json({ error: "Prostor nebyl nalezen" }, { status: 404 })
    }

    const isAdmin = session?.user?.role === "admin"
    const managesVenue = session?.user?.id && venue.manager?.id === session.user.id

    const baseResponse = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      status: venue.status,
      description: venue.description ?? "",
      address: venue.address ?? "",
      district: venue.district ?? "",
      capacitySeated: venue.capacitySeated ?? null,
      capacityStanding: venue.capacityStanding ?? null,
      venueType: venue.venueType ?? "",
      amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
    }

    if (!isAdmin && !managesVenue) {
      return NextResponse.json({
        ...baseResponse,
        contactEmail: "",
        contactPhone: "",
        websiteUrl: "",
        instagramUrl: "",
        videoUrl: venue.videoUrl ?? venue.youtubeUrl ?? "",
        musicAfter10: venue.musicAfter10 ?? false,
        manager: null,
      })
    }

    return NextResponse.json({
      ...baseResponse,
      contactEmail: venue.contactEmail ?? "",
      contactPhone: venue.contactPhone ?? "",
      websiteUrl: venue.websiteUrl ?? "",
      instagramUrl: venue.instagramUrl ?? "",
      videoUrl: venue.videoUrl ?? venue.youtubeUrl ?? "",
      musicAfter10: venue.musicAfter10 ?? false,
      manager: venue.manager
        ? {
            id: venue.manager.id,
            name: venue.manager.name,
            email: venue.manager.email,
          }
        : null,
    })
  } catch (error) {
    console.error("Failed to load venue claim data:", error)
    return NextResponse.json({ error: "Nepodařilo se načíst údaje prostoru" }, { status: 500 })
  }
}
