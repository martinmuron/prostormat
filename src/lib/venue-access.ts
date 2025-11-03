import { db } from "@/lib/db"

export async function hasActiveVenueAccess(userId: string): Promise<boolean> {
  const venues = await db.venue.findMany({
    where: {
      managerId: userId,
      status: "published",
    },
    select: {
      paid: true,
      expiresAt: true,
    },
  })

  if (venues.length === 0) {
    return false
  }

  const now = new Date()
  return venues.some((venue) => {
    if (!venue.paid) {
      return false
    }

    if (!venue.expiresAt) {
      return true
    }

    const expiry = new Date(venue.expiresAt)
    return !Number.isNaN(expiry.getTime()) && expiry.getTime() >= now.getTime()
  })
}
