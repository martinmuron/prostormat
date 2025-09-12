#!/usr/bin/env tsx

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Import Resend directly and create a new instance with the loaded API key
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
// Use the default Resend domain for testing
const FROM_EMAIL = 'Prostormat <onboarding@resend.dev>'
const REPLY_TO_EMAIL = 'info@prostormat.cz'

const TEST_EMAIL = 'mark.muron@gmail.com'

async function debugResendApi() {
  console.log('🔍 Debugging Resend API...')
  console.log('========================')
  
  // Check environment
  console.log(`📧 From email: ${FROM_EMAIL}`)
  console.log(`↩️  Reply-to email: ${REPLY_TO_EMAIL}`)
  console.log(`🎯 Test email: ${TEST_EMAIL}`)
  
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set!')
    return
  }
  
  console.log(`🔑 API Key starts with: ${apiKey.substring(0, 8)}...`)
  console.log(`🔑 API Key length: ${apiKey.length}`)
  
  try {
    console.log('\n🚀 Sending test email...')
    
    const emailData = {
      from: FROM_EMAIL,
      to: TEST_EMAIL,
      subject: '[DEBUG] Prostormat Email Test',
      html: `
        <h1>🔍 Debug Email Test</h1>
        <p>This is a debug email to test Resend functionality.</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${FROM_EMAIL}</p>
        <p><strong>To:</strong> ${TEST_EMAIL}</p>
      `,
      text: `Debug Email Test - ${new Date().toISOString()}`,
      replyTo: REPLY_TO_EMAIL
    }
    
    console.log('📤 Email payload:')
    console.log({
      ...emailData,
      html: emailData.html.substring(0, 100) + '...',
      text: emailData.text.substring(0, 50) + '...'
    })
    
    const response = await resend.emails.send(emailData)
    
    console.log('\n📥 Full API Response:')
    console.log('Response object:', response)
    console.log('Response data:', response.data)
    console.log('Response error:', response.error)
    
    if (response.error) {
      console.error('❌ API Error:', response.error)
      return false
    }
    
    if (response.data) {
      console.log('✅ Email sent successfully!')
      console.log('Message ID:', response.data.id)
      console.log('From:', response.data.from)
      console.log('To:', response.data.to)
      return true
    } else {
      console.error('❌ No data in response')
      return false
    }
    
  } catch (error) {
    console.error('❌ Exception occurred:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return false
  }
}

// Test domain verification
async function checkDomainStatus() {
  try {
    console.log('\n🌐 Checking domain status...')
    
    // Note: Resend doesn't have a direct domain check API, but we can try to understand
    // the domain setup from the email address
    const domain = FROM_EMAIL.split('@')[1].replace('>', '')
    console.log(`📍 Sending domain: ${domain}`)
    
    // Check if the domain looks valid
    if (!domain.includes('.')) {
      console.error('❌ Invalid domain format')
      return false
    }
    
    console.log('✅ Domain format looks valid')
    return true
    
  } catch (error) {
    console.error('❌ Domain check failed:', error)
    return false
  }
}

// Test API key validity
async function testApiKeyValidity() {
  try {
    console.log('\n🔐 Testing API key validity...')
    
    // Try to make a simple API call to test the key
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 API Response status: ${response.status}`)
    console.log(`📡 API Response status text: ${response.statusText}`)
    
    if (response.status === 401) {
      console.error('❌ API key is invalid or expired')
      return false
    }
    
    if (response.status === 403) {
      console.error('❌ API key lacks necessary permissions')
      return false
    }
    
    const data = await response.json()
    console.log('📊 API Response data:', data)
    
    if (response.ok) {
      console.log('✅ API key is valid')
      return true
    } else {
      console.error(`❌ API returned error: ${response.status}`)
      return false
    }
    
  } catch (error) {
    console.error('❌ API key test failed:', error)
    return false
  }
}

async function main() {
  console.log('🔍 Prostormat Resend Debug Script')
  console.log('================================\n')
  
  // Test API key
  const apiValid = await testApiKeyValidity()
  if (!apiValid) {
    console.log('\n❌ API key test failed - stopping here')
    process.exit(1)
  }
  
  // Check domain
  const domainValid = await checkDomainStatus()
  if (!domainValid) {
    console.log('\n❌ Domain check failed - but continuing with email test')
  }
  
  // Test email sending
  const emailSent = await debugResendApi()
  
  console.log('\n📊 Debug Summary:')
  console.log('================')
  console.log(`API Key Valid: ${apiValid ? '✅' : '❌'}`)
  console.log(`Domain Valid: ${domainValid ? '✅' : '❌'}`)
  console.log(`Email Sent: ${emailSent ? '✅' : '❌'}`)
  
  if (emailSent) {
    console.log('\n📧 Check your email inbox!')
    console.log(`   Email: ${TEST_EMAIL}`)
    console.log('   Subject: [DEBUG] Prostormat Email Test')
  }
}

main().catch(error => {
  console.error('💥 Debug script failed:', error)
  process.exit(1)
})