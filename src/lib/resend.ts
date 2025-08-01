import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export const FROM_EMAIL = 'Prostormat <noreply@prostormat.cz>'
export const REPLY_TO_EMAIL = 'info@prostormat.cz'