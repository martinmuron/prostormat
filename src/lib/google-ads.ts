type ConversionPayload = {
  send_to: string
  value?: number
  currency?: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    gtag_report_conversion?: (url?: string) => boolean
    reportGoogleAdsConversion?: (config: ConversionPayload, url?: string) => boolean
  }
}

const REGISTRATION_CONVERSION: ConversionPayload = {
  send_to: 'AW-17685324076/zK4hCKTLpbUbEKzCgvFB',
  value: 1.0,
  currency: 'CZK',
}

const VENUE_SUBMISSION_CONVERSION: ConversionPayload = {
  send_to: 'AW-17685324076/suPvCOWkwbYbEKzCgvFB',
  value: 12000.0,
  currency: 'CZK',
}

function fireGoogleAdsConversion(config: ConversionPayload) {
  if (typeof window === 'undefined') {
    return
  }

  if (typeof window.reportGoogleAdsConversion === 'function') {
    window.reportGoogleAdsConversion(config)
    return
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: config.send_to,
      value: config.value ?? 0,
      currency: config.currency ?? 'CZK',
    })
    return
  }

  console.warn('[Google Ads] gtag not available; conversion event not fired', config.send_to)
}

export function fireGoogleAdsRegistrationConversion() {
  fireGoogleAdsConversion(REGISTRATION_CONVERSION)
}

export function fireGoogleAdsVenueSubmissionConversion() {
  fireGoogleAdsConversion(VENUE_SUBMISSION_CONVERSION)
}
