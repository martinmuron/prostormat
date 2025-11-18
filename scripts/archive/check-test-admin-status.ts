import * as dotenv from 'dotenv'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env.production')
dotenv.config({ path: envPath })

async function checkTestAdmin() {
  const { db } = await import('@/lib/db')

  console.log('Checking test admin account...\n')

  const user = await db.user.findUnique({
    where: { email: 'test-admin@prostormat.cz' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      password: true,
      createdAt: true
    }
  })

  if (!user) {
    console.log('❌ User NOT FOUND in database')
    console.log('Account does not exist - needs to be created')
  } else {
    console.log('✅ User FOUND:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
    console.log('  Role:', user.role)
    console.log('  Email Verified:', user.emailVerified ? '✅ YES - ' + user.emailVerified.toISOString() : '❌ NO - NULL')
    console.log('  Has Password:', user.password ? '✅ YES (hash exists)' : '❌ NO')
    console.log('  Created:', user.createdAt.toISOString())

    if (!user.emailVerified) {
      console.log('\n⚠️  EMAIL NOT VERIFIED - This will block login')
    }

    if (!user.password) {
      console.log('\n⚠️  NO PASSWORD SET - This will block login')
    }

    if (user.role !== 'admin') {
      console.log('\n⚠️  Role is', user.role, 'not "admin"')
    }
  }
}

checkTestAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
