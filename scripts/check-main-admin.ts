import * as dotenv from 'dotenv'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env.production')
dotenv.config({ path: envPath })

async function checkMainAdmin() {
  const { db } = await import('@/lib/db')

  console.log('Checking main admin account (admin@prostormat.cz)...\n')

  const user = await db.user.findUnique({
    where: { email: 'admin@prostormat.cz' },
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
    console.log('❌ Main admin account NOT FOUND in database')
    console.log('This is a CRITICAL issue!')
  } else {
    console.log('✅ Main admin account FOUND:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
    console.log('  Role:', user.role)
    console.log('  Email Verified:', user.emailVerified ? '✅ YES - ' + user.emailVerified.toISOString() : '❌ NO - NULL')
    console.log('  Has Password:', user.password ? '✅ YES (hash exists)' : '❌ NO')
    console.log('  Created:', user.createdAt.toISOString())

    if (!user.emailVerified) {
      console.log('\n⚠️  EMAIL NOT VERIFIED')
      console.log('   The new auth code will try to auto-verify on next login')
      console.log('   This requires database write access from Vercel')
    }

    if (!user.password) {
      console.log('\n❌  NO PASSWORD - Cannot login!')
    }
  }
}

checkMainAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
