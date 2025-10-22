/**
 * Schema.org structured data markup generators
 * Improves SEO by providing rich snippets to search engines
 */

import { getOptimizedImageUrl } from '@/lib/supabase-images'
import { absoluteUrl, SITE_URL } from '@/lib/seo'

interface VenueData {
  name: string
  description: string | null
  address: string
  images: string[]
  venueType: string | null
  capacitySeated: number | null
  capacityStanding: number | null
  slug: string
  district?: string | null
  instagramUrl?: string
  manager?: {
    name: string | null
    email: string
    phone: string | null
  } | null
}

/**
 * Generate LocalBusiness schema for venue pages
 * https://schema.org/LocalBusiness
 */
export function generateVenueSchema(venue: VenueData) {
  const baseUrl = SITE_URL
  const imageUrls = (Array.isArray(venue.images) ? venue.images : [])
    .slice(0, 5)
    .map((imagePath) => getOptimizedImageUrl(imagePath, 'medium'))
    .filter((url) => Boolean(url)) as string[]

  const images = imageUrls.length > 0
    ? imageUrls
    : [absoluteUrl('/images/placeholder-venue.jpg')]

  const capacity = Math.max(
    venue.capacitySeated || 0,
    venue.capacityStanding || 0
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: venue.name,
    description: venue.description || `Event prostor ${venue.name} v Praze`,
    url: `${baseUrl}/prostory/${venue.slug}`,
    image: images,
    address: {
      '@type': 'PostalAddress',
      addressLocality: venue.district || 'Praha',
      addressCountry: 'CZ',
      streetAddress: venue.address,
    },
    maximumAttendeeCapacity: capacity > 0 ? capacity : undefined,
    sameAs: venue.instagramUrl ? [venue.instagramUrl] : undefined,
  }

  // Add aggregateRating if we have reviews in the future
  // Add offers/priceRange if we have pricing data

  return schema
}

/**
 * Generate Organization schema for homepage
 * https://schema.org/Organization
 */
export function generateOrganizationSchema() {
  const baseUrl = SITE_URL

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Prostormat',
    url: baseUrl,
    logo: absoluteUrl('/images/logo-black.svg'),
    description: 'Největší katalog event prostorů v Praze. Najděte perfektní prostor pro vaši firemní akci, svatbu, teambuilding nebo konferenci.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Praha',
      addressCountry: 'CZ',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@prostormat.cz',
      availableLanguage: ['cs', 'en'],
    },
    sameAs: [
      // Add social media URLs when available
      // 'https://www.facebook.com/prostormat',
      // 'https://www.instagram.com/prostormat',
    ],
  }
}

/**
 * Generate BreadcrumbList schema for better navigation understanding
 * https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate WebSite schema with search action
 * https://schema.org/WebSite
 */
export function generateWebSiteSchema() {
  const baseUrl = SITE_URL

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Prostormat',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/prostory?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Helper function to convert schema object to JSON-LD script tag
 */
export function schemaToJsonLd(schema: object) {
  return {
    __html: JSON.stringify(schema, null, 0),
  }
}
