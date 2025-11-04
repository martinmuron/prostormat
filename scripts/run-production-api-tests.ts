/**
 * Production API Test Runner
 *
 * Loads production environment variables and runs API tests against prostormat.cz
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
console.log('🚀 Running API tests against https://prostormat.cz...\n')
console.log('='.repeat(60))

try {
  // Run the API test script against production
  execSync('npx tsx scripts/test-registration-flow.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BASE_URL: 'https://prostormat.cz'
    }
  })
} catch (error) {
  console.error('\n❌ API tests failed')
  process.exit(1)
}
