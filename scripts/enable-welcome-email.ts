/**
 * Enable Welcome Email Trigger in Production
 *
 * Enables the user_registration trigger so welcome emails are sent
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load production environment BEFORE importing db
const envPath = path.join(process.cwd(), '.env.production')
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ Failed to load .env.production:', result.error)
  process.exit(1)
}

console.log('✅ Loaded production environment\n')

async function enableWelcomeEmail() {
  // Import db after env is loaded
  const { db } = await import('@/lib/db')
  console.log('🔧 Enabling Welcome Email Trigger...\n')

  try {
    // Check current status
    const currentTrigger = await db.emailTrigger.findUnique({
      where: { triggerKey: 'user_registration' },
    })

    if (!currentTrigger) {
      console.log('❌ Email trigger "user_registration" not found in database')
      console.log('   This trigger needs to be created first.')
      process.exit(1)
    }

    console.log('📋 Current Status:')
    console.log(`   Trigger: ${currentTrigger.triggerKey}`)
    console.log(`   Name: ${currentTrigger.name}`)
    console.log(`   Enabled: ${currentTrigger.isEnabled ? '✅ Yes' : '❌ No'}`)
    console.log()

    if (currentTrigger.isEnabled) {
      console.log('✅ Welcome email trigger is already enabled!')
      console.log('   No action needed.')
      process.exit(0)
    }

    // Enable the trigger
    console.log('🔄 Enabling trigger...')
    const updated = await db.emailTrigger.update({
      where: { triggerKey: 'user_registration' },
      data: { isEnabled: true },
    })

    console.log('✅ Welcome email trigger enabled successfully!\n')
    console.log('📋 Updated Status:')
    console.log(`   Trigger: ${updated.triggerKey}`)
    console.log(`   Name: ${updated.name}`)
    console.log(`   Enabled: ${updated.isEnabled ? '✅ Yes' : '❌ No'}`)
    console.log()

    console.log('🎉 Done! New users will now receive welcome emails after verification.')
  } catch (error) {
    console.error('❌ Error enabling welcome email trigger:', error)
    process.exit(1)
  }
}

enableWelcomeEmail()
