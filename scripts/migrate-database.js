const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Check if EventRequestFavorite table already exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "EventRequestFavorite" LIMIT 1`
      console.log('✅ EventRequestFavorite table already exists')
    } catch (error) {
      console.log('📦 Creating EventRequestFavorite table...')
      
      // Create the EventRequestFavorite table
      await prisma.$executeRaw`
        CREATE TABLE "EventRequestFavorite" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "eventRequestId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "EventRequestFavorite_pkey" PRIMARY KEY ("id")
        );
      `
      
      // Create unique constraint
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "EventRequestFavorite_userId_eventRequestId_key" 
        ON "EventRequestFavorite"("userId", "eventRequestId");
      `
      
      // Add foreign key constraints
      await prisma.$executeRaw`
        ALTER TABLE "EventRequestFavorite" ADD CONSTRAINT "EventRequestFavorite_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
      
      await prisma.$executeRaw`
        ALTER TABLE "EventRequestFavorite" ADD CONSTRAINT "EventRequestFavorite_eventRequestId_fkey" 
        FOREIGN KEY ("eventRequestId") REFERENCES "EventRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
      
      console.log('✅ EventRequestFavorite table created successfully')
    }
    
    console.log('🎉 Database migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
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