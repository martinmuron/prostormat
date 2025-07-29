import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('Updating Restaurant Terasa with 6 photos...')
    
    const result = await db.venue.update({
      where: { slug: 'restaurant-terasa' },
      data: {
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      select: {
        name: true,
        slug: true,
        images: true
      }
    })
    
    console.log('✅ Successfully updated Restaurant Terasa!')
    console.log(`📸 Images count: ${result.images.length}`)
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant Terasa updated successfully',
      venue: {
        name: result.name,
        slug: result.slug,
        imageCount: result.images.length,
        images: result.images
      }
    })
    
  } catch (error) {
    console.error('❌ Error updating Restaurant Terasa:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}