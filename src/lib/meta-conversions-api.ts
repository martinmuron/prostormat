import crypto from 'crypto'

const META_PIXEL_ID = process.env.META_PIXEL_ID!
const META_ACCESS_TOKEN = process.env.META_PIXEL_ACCESS_TOKEN!
const API_VERSION = 'v22.0'

interface UserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbp?: string // Facebook browser cookie
  fbc?: string // Facebook click ID
}

interface MetaEvent {
  eventName: string
  eventTime: number
  eventSourceUrl?: string
  userData: UserData
  customData?: Record<string, unknown>
  actionSource: 'website' | 'email' | 'app'
}

type BulkFormData = {
  eventType?: string
  guestCount?: number
  locationPreference?: string
  budgetRange?: string
}

type OrganizaceFormData = Record<string, unknown>

// Hash user data for privacy (required by Meta)
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
}

// Prepare user data with hashing
function prepareUserData(userData: UserData): Record<string, string> {
  const hashed: Record<string, string> = {}

  if (userData.email) {
    hashed.em = hashData(userData.email)
  }
  if (userData.phone) {
    // Remove all non-numeric characters before hashing
    const cleanPhone = userData.phone.replace(/\D/g, '')
    hashed.ph = hashData(cleanPhone)
  }
  if (userData.firstName) {
    hashed.fn = hashData(userData.firstName)
  }
  if (userData.lastName) {
    hashed.ln = hashData(userData.lastName)
  }
  if (userData.city) {
    hashed.ct = hashData(userData.city)
  }
  if (userData.state) {
    hashed.st = hashData(userData.state)
  }
  if (userData.country) {
    hashed.country = hashData(userData.country)
  }
  if (userData.zipCode) {
    hashed.zp = hashData(userData.zipCode)
  }

  // Non-hashed data
  if (userData.clientIpAddress) {
    hashed.client_ip_address = userData.clientIpAddress
  }
  if (userData.clientUserAgent) {
    hashed.client_user_agent = userData.clientUserAgent
  }
  if (userData.fbp) {
    hashed.fbp = userData.fbp
  }
  if (userData.fbc) {
    hashed.fbc = userData.fbc
  }

  return hashed
}

// Send event to Meta Conversions API
export async function sendMetaEvent(event: MetaEvent): Promise<{ success: boolean; error?: string }> {
  try {
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.error('Meta Pixel ID or Access Token not configured')
      return { success: false, error: 'Meta credentials not configured' }
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`

    const payload = {
      data: [
        {
          event_name: event.eventName,
          event_time: event.eventTime,
          event_source_url: event.eventSourceUrl,
          user_data: prepareUserData(event.userData),
          custom_data: event.customData,
          action_source: event.actionSource,
        },
      ],
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Meta Conversions API error:', result)
      return { success: false, error: result.error?.message || 'Unknown error' }
    }

    console.log('Meta event sent successfully:', event.eventName)
    return { success: true }
  } catch (error) {
    console.error('Error sending Meta event:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper functions for specific events

export async function trackRegistration(userData: UserData, request?: Request) {
  return sendMetaEvent({
    eventName: 'Registration',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: request?.url,
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    actionSource: 'website',
  })
}

export async function trackLocationRegistration(userData: UserData, venueName: string, request?: Request) {
  return sendMetaEvent({
    eventName: 'LocationRegistration',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: request?.url,
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    customData: {
      venue_name: venueName,
    },
    actionSource: 'website',
  })
}

export async function trackPayment(userData: UserData, amount: number, currency: string, request?: Request) {
  return sendMetaEvent({
    eventName: 'Payment',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: request?.url,
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    customData: {
      value: amount,
      currency: currency,
    },
    actionSource: 'website',
  })
}

export async function trackPageView(userData: UserData, pageUrl: string, request?: Request) {
  return sendMetaEvent({
    eventName: 'PageView',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: pageUrl,
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    actionSource: 'website',
  })
}

export async function trackBulkFormSubmit(userData: UserData, formData: BulkFormData, request?: Request) {
  return sendMetaEvent({
    eventName: 'BulkFormSubmit',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: request?.url || 'https://www.prostormat.cz/rychla-poptavka',
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    customData: {
      event_type: formData.eventType,
      guest_count: formData.guestCount,
      location: formData.locationPreference,
    },
    actionSource: 'website',
  })
}

export async function trackOrganizaceSubmit(userData: UserData, formData: OrganizaceFormData, request?: Request) {
  return sendMetaEvent({
    eventName: 'OrganizaceSubmit',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: request?.url || 'https://www.prostormat.cz/organizace-akce',
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    customData: formData,
    actionSource: 'website',
  })
}

export async function trackLokaceSubmit(userData: UserData, venueName: string, request?: Request) {
  return sendMetaEvent({
    eventName: 'LokaceSubmit',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: request?.url,
    userData: {
      ...userData,
      clientIpAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      clientUserAgent: request?.headers.get('user-agent') || undefined,
    },
    customData: {
      venue_name: venueName,
    },
    actionSource: 'website',
  })
}
