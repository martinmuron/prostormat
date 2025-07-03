import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating VenueFavorite table if it does not exist...')
    
    // Create the VenueFavorite table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VenueFavorite" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "venueId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "VenueFavorite_pkey" PRIMARY KEY ("id")
      );
    `

    // Add unique constraint if it doesn't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'VenueFavorite_userId_venueId_key'
        ) THEN
          ALTER TABLE "VenueFavorite" ADD CONSTRAINT "VenueFavorite_userId_venueId_key" UNIQUE ("userId", "venueId");
        END IF;
      END $$;
    `

    // Add foreign key constraints if they don't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'VenueFavorite_userId_fkey'
        ) THEN
          ALTER TABLE "VenueFavorite" ADD CONSTRAINT "VenueFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `

    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'VenueFavorite_venueId_fkey'
        ) THEN
          ALTER TABLE "VenueFavorite" ADD CONSTRAINT "VenueFavorite_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `

    console.log('✅ VenueFavorite table created successfully')

  } catch (error) {
    console.error('Error creating VenueFavorite table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })