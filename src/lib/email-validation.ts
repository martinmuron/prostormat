/**
 * Email validation utilities for Resend compatibility
 * Resend requires ASCII-only email addresses
 */

/**
 * Extracts and validates email addresses for sending
 * Handles formats: "email@example.com" or "Name <email@example.com>"
 * Ensures ASCII-only characters (Resend requirement)
 */
export function validateAndExtractEmail(emailString: string | null | undefined): string | null {
  if (!emailString) return null

  // Split multiple emails and get first
  const emails = emailString.split(",").map((e) => e.trim()).filter((e) => e.length > 0)
  if (emails.length === 0) return null

  let email = emails[0]

  // Extract email from "Name <email>" format
  const angleMatch = email.match(/<([^>]+)>/)
  if (angleMatch) {
    email = angleMatch[1].trim()
  }

  // Remove parenthetical notes like "email@example.com (description)"
  email = email.replace(/\s*\([^)]*\)\s*$/, "").trim()

  // Validate basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return null
  }

  // Ensure ASCII-only (Resend requirement)
  if (!isASCIIOnly(email)) {
    return null
  }

  // Check for suspicious whitespace
  if (/\s/.test(email)) {
    return null
  }

  return email.toLowerCase()
}

/**
 * Checks if a string contains only ASCII characters
 */
export function isASCIIOnly(str: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str)
}

/**
 * Checks if an email is valid for Resend (ASCII-only, proper format)
 */
export function isValidResendEmail(email: string): boolean {
  return validateAndExtractEmail(email) !== null
}

/**
 * Gets a detailed error message for invalid email
 */
export function getEmailValidationError(emailString: string | null | undefined): string | null {
  if (!emailString) {
    return "Email je prázdný"
  }

  const emails = emailString.split(",").map((e) => e.trim()).filter((e) => e.length > 0)
  if (emails.length === 0) {
    return "Email je prázdný"
  }

  let email = emails[0]

  // Extract email from "Name <email>" format
  const angleMatch = email.match(/<([^>]+)>/)
  if (angleMatch) {
    email = angleMatch[1].trim()
  }

  // Remove parenthetical notes like "email@example.com (description)"
  email = email.replace(/\s*\([^)]*\)\s*$/, "").trim()

  // Check format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return `Neplatný formát emailu: "${email}"`
  }

  // Check ASCII
  if (!isASCIIOnly(email)) {
    return `Email obsahuje speciální znaky mimo ASCII: "${email}". Použijte pouze anglické znaky.`
  }

  // Check whitespace
  if (/\s/.test(email)) {
    return `Email obsahuje mezery: "${email}"`
  }

  return null
}
