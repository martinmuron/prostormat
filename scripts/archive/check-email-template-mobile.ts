/**
 * Check Email Template Mobile Responsiveness
 *
 * Analyzes the welcome_user email template for mobile compatibility
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load production environment
const envPath = path.join(process.cwd(), '.env.production')
dotenv.config({ path: envPath })

interface MobileCheck {
  name: string
  passed: boolean
  details: string
  severity: 'critical' | 'warning' | 'good'
}

async function checkEmailTemplate() {
  const { db } = await import('@/lib/db')

  console.log('📧 Checking Welcome Email Template for Mobile Responsiveness\n')
  console.log('='.repeat(60))

  try {
    // Get the welcome_user template
    const template = await db.emailTemplate.findUnique({
      where: { templateKey: 'welcome_user' },
    })

    if (!template) {
      console.log('❌ Welcome email template not found!')
      process.exit(1)
    }

    console.log('✅ Template Found:')
    console.log(`   Key: ${template.templateKey}`)
    console.log(`   Subject: ${template.subject}`)
    console.log(`   Active: ${template.isActive ? 'Yes' : 'No'}`)
    console.log()

    const htmlContent = template.htmlContent
    const checks: MobileCheck[] = []

    // Check 1: Has viewport meta tag or responsive width
    const hasViewport = htmlContent.includes('viewport') || htmlContent.includes('device-width')
    const hasMaxWidth = htmlContent.includes('max-width')
    const hasWidth100 = htmlContent.includes('width: 100%') || htmlContent.includes('width:100%')

    checks.push({
      name: 'Viewport / Responsive Width',
      passed: hasViewport || hasMaxWidth || hasWidth100,
      details: hasViewport ? 'Has viewport meta' : hasMaxWidth ? 'Uses max-width' : hasWidth100 ? 'Uses width: 100%' : 'No responsive width detected',
      severity: hasViewport || hasMaxWidth ? 'good' : 'warning'
    })

    // Check 2: Uses tables for layout (email standard)
    const tableCount = (htmlContent.match(/<table/g) || []).length
    checks.push({
      name: 'Table-based Layout',
      passed: tableCount > 0,
      details: `Found ${tableCount} table(s)`,
      severity: tableCount > 0 ? 'good' : 'warning'
    })

    // Check 3: Inline styles (required for most email clients)
    const hasInlineStyles = htmlContent.includes('style="')
    const styleCount = (htmlContent.match(/style="/g) || []).length
    checks.push({
      name: 'Inline Styles',
      passed: hasInlineStyles,
      details: `Found ${styleCount} inline style(s)`,
      severity: hasInlineStyles ? 'good' : 'critical'
    })

    // Check 4: Mobile-friendly font size
    const hasFontSize = htmlContent.match(/font-size:\s*(\d+)px/)
    const fontSize = hasFontSize ? parseInt(hasFontSize[1]) : null
    const goodFontSize = fontSize && fontSize >= 14
    checks.push({
      name: 'Mobile-friendly Font Size',
      passed: goodFontSize || false,
      details: fontSize ? `${fontSize}px ${goodFontSize ? '(good for mobile)' : '(too small for mobile)'}` : 'No font-size found',
      severity: goodFontSize ? 'good' : fontSize ? 'warning' : 'warning'
    })

    // Check 5: Has media queries (optional but good)
    const hasMediaQueries = htmlContent.includes('@media')
    checks.push({
      name: 'Media Queries',
      passed: hasMediaQueries,
      details: hasMediaQueries ? 'Has @media queries for responsive design' : 'No media queries (not required but helpful)',
      severity: hasMediaQueries ? 'good' : 'warning'
    })

    // Check 6: Button/Link touch-friendliness
    const hasButtons = htmlContent.includes('<a') || htmlContent.includes('button')
    const hasPadding = htmlContent.match(/padding:\s*(\d+)px/)
    const buttonPadding = hasPadding ? parseInt(hasPadding[1]) : null
    const touchFriendly = buttonPadding && buttonPadding >= 10
    checks.push({
      name: 'Touch-friendly Buttons',
      passed: !hasButtons || touchFriendly,
      details: hasButtons ? (touchFriendly ? `Buttons have ${buttonPadding}px padding (touch-friendly)` : buttonPadding ? `Buttons have ${buttonPadding}px padding (may be too small)` : 'Buttons found but padding unclear') : 'No buttons/links found',
      severity: hasButtons && !touchFriendly ? 'warning' : 'good'
    })

    // Check 7: Fixed width container check
    const hasFixedWidth = htmlContent.match(/width:\s*(\d{3,})px/)
    const fixedWidth = hasFixedWidth ? parseInt(hasFixedWidth[1]) : null
    const tooWide = fixedWidth && fixedWidth > 600
    checks.push({
      name: 'Mobile-safe Width',
      passed: !tooWide,
      details: fixedWidth ? `${fixedWidth}px ${tooWide ? '(too wide for mobile)' : '(mobile-safe)'}` : 'No fixed width detected',
      severity: tooWide ? 'critical' : 'good'
    })

    // Check 8: Image responsiveness
    const hasImages = htmlContent.includes('<img')
    const imageCount = (htmlContent.match(/<img/g) || []).length
    const hasResponsiveImg = htmlContent.includes('max-width: 100%') || htmlContent.includes('width="100%"')
    checks.push({
      name: 'Responsive Images',
      passed: !hasImages || hasResponsiveImg,
      details: hasImages ? `${imageCount} image(s) - ${hasResponsiveImg ? 'responsive' : 'may not be responsive'}` : 'No images',
      severity: hasImages && !hasResponsiveImg ? 'warning' : 'good'
    })

    // Print results
    console.log('📊 Mobile Responsiveness Analysis\n')

    const criticalIssues = checks.filter(c => !c.passed && c.severity === 'critical')
    const warnings = checks.filter(c => !c.passed && c.severity === 'warning')
    const passed = checks.filter(c => c.passed)

    checks.forEach(check => {
      const icon = check.passed ? '✅' : check.severity === 'critical' ? '❌' : '⚠️'
      console.log(`${icon} ${check.name}`)
      console.log(`   ${check.details}\n`)
    })

    console.log('='.repeat(60))
    console.log(`Total Checks: ${checks.length}`)
    console.log(`✅ Passed: ${passed.length}`)
    console.log(`⚠️  Warnings: ${warnings.length}`)
    console.log(`❌ Critical: ${criticalIssues.length}`)
    console.log()

    // Overall verdict
    if (criticalIssues.length > 0) {
      console.log('❌ CRITICAL ISSUES FOUND - Email may not work well on mobile')
      criticalIssues.forEach(issue => {
        console.log(`   - ${issue.name}: ${issue.details}`)
      })
    } else if (warnings.length > 0) {
      console.log('⚠️  WARNINGS - Email should work but could be improved for mobile')
      warnings.forEach(warning => {
        console.log(`   - ${warning.name}: ${warning.details}`)
      })
    } else {
      console.log('✅ MOBILE-READY - Email should display well on mobile devices!')
    }

    // Save template for inspection
    const outputPath = path.join(process.cwd(), 'welcome-email-template.html')
    fs.writeFileSync(outputPath, htmlContent)
    console.log(`\n📄 Template saved to: welcome-email-template.html`)
    console.log('   Open this file in a browser to preview')

  } catch (error) {
    console.error('❌ Error checking email template:', error)
    process.exit(1)
  }
}

checkEmailTemplate()
