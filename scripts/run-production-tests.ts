/**
 * Production Test Runner
 *
 * Loads production environment variables and runs tests against live site
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { execSync } from 'child_process'

// Load production environment variables
const envPath = path.join(process.cwd(), '.env.production')
console.log(`Loading production environment from: ${envPath}\n`)

const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('Error loading .env.production:', result.error)
  process.exit(1)
}

console.log('✅ Production environment loaded\n')
console.log('🔍 Running bug detection audit...\n')
console.log('='.repeat(60))

try {
  // Run the bug detection script with production env
  execSync('npx tsx scripts/check-registration-bugs.ts', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  })
} catch (error) {
  console.error('Bug detection audit failed:', error)
  process.exit(1)
}
