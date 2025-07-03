import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const userCount = await db.user.count()

    return NextResponse.json({
      userCount,
      users,
      testUserExists: users.some(u => u.email === 'test@test.com'),
      hasUsers: userCount > 0
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}