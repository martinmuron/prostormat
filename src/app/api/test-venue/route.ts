import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Find the location manager user
    const locationManager = await db.user.findUnique({
      where: { email: 'location@location.com' }
    })

    if (!locationManager) {
      return NextResponse.json({
        error: 'Location manager user not found'
      }, { status: 404 })
    }

    // Check if test venue already exists
    const existingVenue = await db.venue.findUnique({
      where: { slug: 'test-event-space' }
    })

    if (existingVenue) {
      return NextResponse.json({
        message: 'Test venue already exists',
        venue: {
          id: existingVenue.id,
          name: existingVenue.name,
          slug: existingVenue.slug
        }
      })
    }

    // Create test venue
    const testVenue = await db.venue.create({
      data: {
        name: 'Test Event Space',
        slug: 'test-event-space',
        description: 'Beautiful test venue for all your event needs. Modern facilities with stunning views.',
        address: 'Václavské náměstí 1, 110 00 Praha 1, Česká republika',
        capacitySeated: 120,
        capacityStanding: 200,
        venueType: 'conference-hall',
        amenities: ['wifi', 'parking', 'catering', 'av-equipment', 'air-conditioning'],
        contactEmail: 'location@location.com',
        contactPhone: '+420 775 654 640',
        websiteUrl: 'https://test-venue.com',
        images: [
          '/images/venues/test-venue-1.jpg',
          '/images/venues/test-venue-2.jpg',
          '/images/venues/test-venue-3.jpg'
        ],
        status: 'active',
        managerId: locationManager.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test venue created successfully',
      venue: {
        id: testVenue.id,
        name: testVenue.name,
        slug: testVenue.slug,
        managerId: testVenue.managerId
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create test venue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}