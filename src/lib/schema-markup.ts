/**
 * Schema.org structured data markup generators
 * Improves SEO by providing rich snippets to search engines
 */

interface VenueData {
  name: string
  description: string | null
  address: string
  images: string[]
  venueType: string | null
  capacitySeated: number | null
  capacityStanding: number | null
  slug: string
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
  const baseUrl = 'https://prostormat.cz'
  const imageUrl = venue.images[0]
    ? `https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/${venue.images[0]}`
    : `${baseUrl}/images/default-venue.jpg`

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
    image: imageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Praha',
      addressCountry: 'CZ',
      streetAddress: venue.address,
    },
    maximumAttendeeCapacity: capacity > 0 ? capacity : undefined,
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
  const baseUrl = 'https://prostormat.cz'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Prostormat',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Největší katalog event prostorů v Praze. Najděte perfektní prostor pro vaši firení akci, svatbu, teambuilding nebo konferenci.',
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
  const baseUrl = 'https://prostormat.cz'

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
