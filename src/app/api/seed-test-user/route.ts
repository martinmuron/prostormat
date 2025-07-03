import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// POST - Create test user
export async function POST(request: NextRequest) {
  try {
    // Check if test user already exists
    const existingUser = await db.user.findUnique({
      where: { email: "test@test.com" }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: "Test user already exists",
        userId: existingUser.id 
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("12345", 10)

    // Create test user
    const testUser = await db.user.create({
      data: {
        email: "test@test.com",
        password: hashedPassword,
        name: "Test User",
        phone: "+420 775 654 639",
        company: "Test Company",
        role: "user"
      }
    })

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role
      }
    })

  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Check if test user exists
export async function GET() {
  try {
    const testUser = await db.user.findUnique({
      where: { email: "test@test.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!testUser) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: true,
      user: testUser
    })

  } catch (error) {
    console.error("Error checking test user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 