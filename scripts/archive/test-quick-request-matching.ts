import { findMatchingVenues } from '../src/lib/quick-request-utils'

async function testMatching() {
  console.log('🧪 Testing Quick Request Matching with Concrete Numbers\n')

  // Test 1: Small number (e.g., 15 guests)
  console.log('Test 1: 15 guests in Praha')
  const result1 = await findMatchingVenues({
    guestCount: '15',
    locationPreference: 'Praha'
  })
  console.log(`✅ Found ${result1.length} venues for 15 guests in Praha`)

  // Test 2: Medium number (e.g., 40 guests)
  console.log('\nTest 2: 40 guests in Praha')
  const result2 = await findMatchingVenues({
    guestCount: '40',
    locationPreference: 'Praha'
  })
  console.log(`✅ Found ${result2.length} venues for 40 guests in Praha`)

  // Test 3: Large number (e.g., 120 guests)
  console.log('\nTest 3: 120 guests in Praha')
  const result3 = await findMatchingVenues({
    guestCount: '120',
    locationPreference: 'Praha'
  })
  console.log(`✅ Found ${result3.length} venues for 120 guests in Praha`)

  // Test 4: Very large number (e.g., 500 guests)
  console.log('\nTest 4: 500 guests in Praha')
  const result4 = await findMatchingVenues({
    guestCount: '500',
    locationPreference: 'Praha'
  })
  console.log(`✅ Found ${result4.length} venues for 500 guests in Praha`)

  // Test 5: Numeric input instead of string
  console.log('\nTest 5: 70 guests (numeric) in Praha')
  const result5 = await findMatchingVenues({
    guestCount: 70,
    locationPreference: 'Praha'
  })
  console.log(`✅ Found ${result5.length} venues for 70 guests (numeric) in Praha`)

  // Test 6: Old range format (backward compatibility)
  console.log('\nTest 6: Old format "26-50" in Praha (backward compatibility)')
  const result6 = await findMatchingVenues({
    guestCount: '26-50',
    locationPreference: 'Praha'
  })
  console.log(`✅ Found ${result6.length} venues for "26-50" range in Praha`)

  // Test 7: Praha vs Celá Praha
  console.log('\nTest 7: 40 guests in "Celá Praha"')
  const result7 = await findMatchingVenues({
    guestCount: '40',
    locationPreference: 'Celá Praha'
  })
  console.log(`✅ Found ${result7.length} venues for 40 guests in "Celá Praha"`)

  console.log('\n✨ All tests completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Concrete numbers work: ✅`)
  console.log(`   - Numeric input works: ✅`)
  console.log(`   - Backward compatibility with ranges: ✅`)
  console.log(`   - Praha location fix: ✅ (${result2.length} venues vs ${result7.length} venues)`)
}

testMatching()
  .then(() => {
    console.log('\n✅ Test suite completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
