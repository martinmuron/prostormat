declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    gtag_report_conversion?: (url?: string) => boolean
  }
}

const SEND_TO_ID = 'AW-17685324076/zK4hCKTLpbUbEKzCgvFB'

export function fireGoogleAdsRegistrationConversion() {
  if (typeof window === 'undefined') {
    return
  }

  if (typeof window.gtag_report_conversion === 'function') {
    window.gtag_report_conversion()
    return
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: SEND_TO_ID,
      value: 1.0,
      currency: 'CZK',
    })
    return
  }

  console.warn('[Google Ads] gtag not available; conversion event not fired')
}
