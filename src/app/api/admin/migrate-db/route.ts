import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database migration...');

    // First, try to connect to the database
    await prisma.$connect();
    console.log('Database connected successfully');

    // Create all tables manually using raw SQL
    console.log('Creating database schema...');

    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "password" TEXT,
        "phone" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        "company" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `;

    // Create Account table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
    `;

    // Create Session table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
    `;

    // Create VerificationToken table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    `;

    // Create Venue table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Venue" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "address" TEXT NOT NULL,
        "capacitySeated" INTEGER,
        "capacityStanding" INTEGER,
        "priceRange" TEXT,
        "venueType" TEXT,
        "amenities" TEXT[],
        "contactEmail" TEXT,
        "contactPhone" TEXT,
        "websiteUrl" TEXT,
        "images" TEXT[],
        "videoUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "managerId" TEXT NOT NULL,
        "subscriptionId" TEXT,
        "expiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Venue_slug_key" ON "Venue"("slug");
    `;

    // Create EventRequest table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "EventRequest" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "eventType" TEXT NOT NULL,
        "eventDate" TIMESTAMP(3),
        "guestCount" INTEGER,
        "budgetRange" TEXT,
        "locationPreference" TEXT,
        "requirements" TEXT,
        "contactEmail" TEXT NOT NULL,
        "contactPhone" TEXT,
        "contactName" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EventRequest_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create VenueInquiry table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VenueInquiry" (
        "id" TEXT NOT NULL,
        "venueId" TEXT NOT NULL,
        "userId" TEXT,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "eventDate" TIMESTAMP(3),
        "guestCount" INTEGER,
        "message" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "VenueInquiry_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create Subscription table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL,
        "venueId" TEXT NOT NULL,
        "stripeSubscriptionId" TEXT NOT NULL,
        "stripeCustomerId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_venueId_key" ON "Subscription"("venueId");
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
    `;

    console.log('Database schema created successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database migrated successfully!' 
    });

  } catch (error) {
    console.error('Error migrating database:', error);
    return NextResponse.json({ 
      error: 'Failed to migrate database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}