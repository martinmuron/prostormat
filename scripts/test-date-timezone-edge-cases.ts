/**
 * Test script to analyze date validation timezone edge cases
 */

console.log('🧪 Testing Date Validation Timezone Edge Cases\n')

// Simulate the validation logic
function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

console.log('Test 1: How new Date() interprets date strings')
console.log('------------------------------------------------')

const testDate1 = new Date('2025-11-06')
const testDate2 = new Date('2025-11-06T00:00:00')
const testDate3 = new Date('2025-11-06T00:00:00Z')

console.log(`  new Date('2025-11-06'):           ${testDate1.toISOString()} (${testDate1.toString()})`)
console.log(`  new Date('2025-11-06T00:00:00'):  ${testDate2.toISOString()} (${testDate2.toString()})`)
console.log(`  new Date('2025-11-06T00:00:00Z'): ${testDate3.toISOString()} (${testDate3.toString()})`)

console.log('\nTest 2: Server time vs UTC')
console.log('---------------------------')

const now = new Date()
const nowUTC = new Date(now.toISOString())

console.log(`  Server local time: ${now.toString()}`)
console.log(`  UTC time:          ${now.toUTCString()}`)
console.log(`  Timezone offset:   ${now.getTimezoneOffset()} minutes`)

const today = new Date()
today.setHours(0, 0, 0, 0)

console.log(`\n  Today (midnight local): ${today.toString()}`)
console.log(`  Today (ISO):            ${today.toISOString()}`)

console.log('\nTest 3: Date string interpretation')
console.log('------------------------------------')

// HTML date input returns "YYYY-MM-DD" format
const htmlDateInput = '2025-11-06'
const parsedDate = new Date(htmlDateInput)

console.log(`  HTML date input:     ${htmlDateInput}`)
console.log(`  Parsed as:           ${parsedDate.toString()}`)
console.log(`  Parsed ISO:          ${parsedDate.toISOString()}`)
console.log(`  Time component:      ${parsedDate.getHours()}:${parsedDate.getMinutes()}:${parsedDate.getSeconds()}`)

console.log('\nTest 4: Comparison edge case')
console.log('-----------------------------')

// Simulate today's date
const simulatedToday = new Date('2025-11-06T14:00:00+01:00') // 2 PM in Prague (UTC+1)
simulatedToday.setHours(0, 0, 0, 0)

// User selects today
const userSelectedDate = new Date('2025-11-06')

console.log(`  Simulated today (2 PM Prague):  ${new Date('2025-11-06T14:00:00+01:00').toString()}`)
console.log(`  Today at midnight local:        ${simulatedToday.toString()}`)
console.log(`  User selected date ('2025-11-06'): ${userSelectedDate.toString()}`)
console.log(`  Comparison (selected >= today): ${userSelectedDate >= simulatedToday ? '✅ PASS' : '❌ FAIL'}`)
console.log(`  Time difference (ms):           ${userSelectedDate.getTime() - simulatedToday.getTime()}`)

console.log('\nTest 5: Edge case - midnight boundary')
console.log('--------------------------------------')

// Server in Prague at 11:59 PM on Nov 5
const serverTimePrague = new Date('2025-11-05T23:59:00+01:00')
const todayPrague = new Date('2025-11-05T23:59:00+01:00')
todayPrague.setHours(0, 0, 0, 0)

// User selects Nov 6 (next day)
const userSelectsNov6 = new Date('2025-11-06')

console.log(`  Server time (11:59 PM Nov 5):  ${serverTimePrague.toString()}`)
console.log(`  Today midnight (Prague):        ${todayPrague.toString()}`)
console.log(`  User selects Nov 6:             ${userSelectsNov6.toString()}`)
console.log(`  Comparison:                     ${userSelectsNov6 >= todayPrague ? '✅ PASS' : '❌ FAIL'}`)

console.log('\n📊 Analysis:')
console.log('   1. Date strings without timezone (YYYY-MM-DD) are interpreted as UTC midnight')
console.log('   2. Server "today" uses server local timezone')
console.log('   3. This can cause edge cases depending on server timezone')
console.log('   4. For Prague server (UTC+1/+2), dates are typically handled correctly')
console.log('   5. Issue: Users in different timezones might see confusing validation')

console.log('\n💡 Recommendation:')
console.log('   - For Czech-only platform: Current implementation is acceptable')
console.log('   - For international: Consider using UTC for both sides of comparison')
console.log('   - Alternative: Validate on client-side using user\'s local timezone')

process.exit(0)
