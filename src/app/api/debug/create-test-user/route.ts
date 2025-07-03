import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if test user already exists
    const existingUser = await db.user.findUnique({
      where: { email: 'test@test.com' }
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      })
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('12345', 12)
    const testUser = await db.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'user',
        company: 'Test Company',
        phone: '+420 775 654 639',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        email: testUser.email,
        name: testUser.name,
        role: testUser.role
      },
      credentials: {
        email: 'test@test.com',
        password: '12345'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create test user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}