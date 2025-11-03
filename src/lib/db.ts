import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Simplified connection strategy: Use DATABASE_URL for all operations
// DATABASE_URL should point to Supabase pooler (transaction mode, port 6543)
// This works optimally for Next.js serverless functions on Vercel
const connectionUrl = process.env.DATABASE_URL

if (!connectionUrl) {
  throw new Error('DATABASE_URL must be set')
}

// For serverless environments, we use connection_limit=1 to prevent connection exhaustion
// This is recommended by Prisma for platforms like Vercel where each function instance
// handles one request at a time
const isProduction = process.env.NODE_ENV === 'production'
const url = new URL(connectionUrl)

// Add connection pooling parameters for serverless optimization
if (isProduction && !url.searchParams.has('connection_limit')) {
  url.searchParams.set('connection_limit', '1')
  url.searchParams.set('pool_timeout', '10')
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: url.toString(),
      },
    },
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  })

if (!isProduction) globalForPrisma.prisma = db
