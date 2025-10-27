// Google Analytics 4 Event Tracking Library
// All events fire automatically to GA4 Measurement ID: G-5KYL3YYZL2

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
}

type GA4EventParams = {
  [key: string]: string | number | boolean | undefined | null | unknown[]
}

/**
 * Core function to send events to GA4 via gtag
 * Works automatically with GTM container GTM-TRGRXRXV
 */
export function trackGA4Event(eventName: string, params?: GA4EventParams) {
  if (typeof window === 'undefined') return

  // Wait for gtag to be available (GTM loads it)
  if (window.gtag) {
    window.gtag('event', eventName, params)
    console.log('[GA4] Event tracked:', eventName, params)
  } else if (window.dataLayer) {
    // Fallback: push to dataLayer directly
    window.dataLayer.push({
      event: eventName,
      ...params,
    })
    console.log('[GA4] Event pushed to dataLayer:', eventName, params)
  } else {
    console.warn('[GA4] gtag not available yet, event not tracked:', eventName)
  }
}

/**
 * Track user registration
 * GA4 recommended event: sign_up
 */
export function trackGA4Registration(data: {
  email?: string
  method?: string
}) {
  trackGA4Event('sign_up', {
    method: data.method || 'email',
  })
}

/**
 * Track successful payment/purchase
 * GA4 recommended event: purchase
 */
export function trackGA4Payment(data: {
  transaction_id?: string
  value: number
  currency: string
  venue_name?: string
  venue_id?: string
  subscription?: boolean
}) {
  trackGA4Event('purchase', {
    transaction_id: data.transaction_id,
    value: data.value,
    currency: data.currency,
    venue_name: data.venue_name,
    venue_id: data.venue_id,
    subscription: data.subscription || false,
  })
}

/**
 * Track venue/location registration (custom event)
 * Fires when someone adds or claims a venue
 */
export function trackGA4LocationRegistration(data: {
  venue_name: string
  venue_id?: string
  mode?: 'new' | 'claim'
}) {
  trackGA4Event('location_registration', {
    venue_name: data.venue_name,
    venue_id: data.venue_id,
    registration_mode: data.mode || 'new',
  })
}

/**
 * Track bulk/quick request form submission
 * GA4 recommended event: generate_lead
 */
export function trackGA4BulkFormSubmit(data: {
  event_type?: string
  guest_count?: string | number
  location?: string
  budget_range?: string
}) {
  trackGA4Event('generate_lead', {
    form_type: 'bulk_request',
    event_type: data.event_type,
    guest_count: data.guest_count,
    location: data.location,
    budget_range: data.budget_range,
    currency: 'CZK',
  })
}

/**
 * Track event organization form submission
 * GA4 recommended event: generate_lead
 */
export function trackGA4OrganizaceSubmit(data: {
  event_type?: string
  guest_count?: number
  budget_range?: string
  location?: string
}) {
  trackGA4Event('generate_lead', {
    form_type: 'organizace',
    event_type: data.event_type,
    guest_count: data.guest_count,
    budget_range: data.budget_range,
    location: data.location,
    currency: 'CZK',
  })
}

/**
 * Track individual venue inquiry/lokace form submission
 * GA4 recommended event: generate_lead
 */
export function trackGA4LokaceSubmit(data: {
  venue_name: string
  venue_id: string
  venue_slug?: string
  guest_count?: number
  event_date?: string
}) {
  trackGA4Event('generate_lead', {
    form_type: 'venue_inquiry',
    venue_name: data.venue_name,
    venue_id: data.venue_id,
    venue_slug: data.venue_slug,
    guest_count: data.guest_count,
    event_date: data.event_date,
  })
}

/**
 * Track when user views pricing page
 * GA4 custom event
 */
export function trackGA4ViewPricing() {
  trackGA4Event('view_pricing', {
    page_location: window.location.href,
  })
}

/**
 * Track when user begins checkout for venue subscription
 * GA4 recommended event: begin_checkout
 */
export function trackGA4BeginCheckout(data: {
  venue_name?: string
  value: number
  currency: string
}) {
  trackGA4Event('begin_checkout', {
    venue_name: data.venue_name,
    value: data.value,
    currency: data.currency,
    items: [
      {
        item_name: 'Venue Subscription',
        item_category: 'Subscription',
        price: data.value,
        quantity: 1,
      },
    ],
  })
}

/**
 * Track venue search/filter usage
 * GA4 recommended event: search
 */
export function trackGA4VenueSearch(data: {
  search_term?: string
  venue_type?: string
  district?: string
  capacity?: string
}) {
  trackGA4Event('search', {
    search_term: data.search_term || 'filter',
    venue_type: data.venue_type,
    district: data.district,
    capacity: data.capacity,
  })
}

/**
 * Track venue detail page view
 * GA4 recommended event: view_item
 */
export function trackGA4ViewVenue(data: {
  venue_name: string
  venue_id: string
  venue_type?: string
  district?: string
  capacity_seated?: number
  capacity_standing?: number
  paid?: boolean
}) {
  trackGA4Event('view_item', {
    items: [
      {
        item_id: data.venue_id,
        item_name: data.venue_name,
        item_category: data.venue_type,
        item_category2: data.district,
        price: data.paid ? 12000 : 0,
      },
    ],
    venue_name: data.venue_name,
    venue_id: data.venue_id,
    venue_type: data.venue_type,
    district: data.district,
    capacity_seated: data.capacity_seated,
    capacity_standing: data.capacity_standing,
    is_paid: data.paid,
  })
}
