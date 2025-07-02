import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Simple password check via header
    const adminPassword = request.headers.get("x-admin-password")
    
    if (adminPassword !== "112233") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all venues with manager info and inquiry count
    const venues = await db.venue.findMany({
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            inquiries: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(venues)
  } catch (error) {
    console.error("Error fetching venues for admin:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 