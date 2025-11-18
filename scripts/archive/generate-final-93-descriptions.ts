import { readFileSync, writeFileSync } from 'fs'

const venues = JSON.parse(readFileSync('scraped-final-93-venues.json', 'utf-8'))

// Valid venue categories
const VALID_CATEGORIES = [
  'event_space', 'restaurant', 'hotel', 'conference', 'bar', 'cafe',
  'gallery', 'museum', 'theater', 'historical', 'garden', 'sports',
  'warehouse', 'loft', 'studio', 'coworking', 'rooftop', 'boat',
  'castle', 'villa', 'club', 'lounge', 'brewery', 'vineyard',
  'church', 'library'
]

function categorizeVenue(venue: any): string[] {
  const name = venue.name.toLowerCase()
  const content = venue.scrapedContent?.toLowerCase() || ''
  const currentTypes = Array.isArray(venue.venueTypes) ? venue.venueTypes : ['event_space']

  const types = new Set<string>(currentTypes)

  // Name-based categorization
  if (name.includes('restaurant') || name.includes('restaurace')) types.add('restaurant')
  if (name.includes('hotel')) types.add('hotel')
  if (name.includes('bar')) types.add('bar')
  if (name.includes('cafe') || name.includes('kavárna') || name.includes('kavarna')) types.add('cafe')
  if (name.includes('galerie') || name.includes('gallery')) types.add('gallery')
  if (name.includes('muzeum') || name.includes('museum')) types.add('museum')
  if (name.includes('divadlo') || name.includes('theater')) types.add('theater')
  if (name.includes('zahrada') || name.includes('garden')) types.add('garden')
  if (name.includes('zamek') || name.includes('castle') || name.includes('palac')) types.add('historical')
  if (name.includes('klub') || name.includes('club')) types.add('club')
  if (name.includes('loft')) types.add('loft')
  if (name.includes('studio')) types.add('studio')
  if (name.includes('cowork')) types.add('coworking')
  if (name.includes('lounge')) types.add('lounge')
  if (name.includes('konference') || name.includes('kongres')) types.add('conference')
  if (name.includes('villa') || name.includes('vila')) types.add('villa')
  if (name.includes('pivovar') || name.includes('brewery')) types.add('brewery')
  if (name.includes('kostel') || name.includes('church')) types.add('church')

  // Content-based categorization
  if (content.includes('konference') || content.includes('zasedaci')) types.add('conference')
  if (content.includes('restaurace')) types.add('restaurant')
  if (content.includes('kavárna') || content.includes('kavarna')) types.add('cafe')
  if (content.includes('galerie')) types.add('gallery')
  if (content.includes('historick')) types.add('historical')

  if (types.size === 0) types.add('event_space')

  return Array.from(types).filter(t => VALID_CATEGORIES.includes(t)).slice(0, 4)
}

function generateDescription(venue: any): string {
  const name = venue.name
  const content = venue.scrapedContent || ''
  const address = venue.address || ''
  const district = venue.district || ''
  const capacity = venue.capacityStanding || venue.capacitySeated || 0
  const amenities = Array.isArray(venue.amenities) ? venue.amenities : []

  // Location string
  const locationStr = district ? `v ${district}` : address ? 'v Praze' : 'v Praze'
  const capacityStr = capacity > 0 ? ` s kapacitou až ${capacity} osob` : ''

  // Extract key features from scraped content
  let features = ''
  if (content.length > 100) {
    const lower = content.toLowerCase()
    if (lower.includes('wifi') || lower.includes('wi-fi')) features += ' Wi-Fi připojení je samozřejmostí.'
    if (lower.includes('parking')) features += ' K dispozici je parkování.'
    if (lower.includes('klimatizace') || lower.includes('air')) features += ' Prostory jsou klimatizované.'
    if (lower.includes('terasa') || lower.includes('zahrada')) features += ' Součástí je venkovní terasa.'
    if (lower.includes('catering')) features += ' Zajistíme catering dle vašich přání.'
  }

  // Amenities string
  let amenitiesStr = ''
  if (amenities.length > 0) {
    amenitiesStr = ` Mezi vybavením najdete ${amenities.slice(0, 3).join(', ')}.`
  } else if (features === '') {
    amenitiesStr = ' Prostor je plně vybaven moderním technickým zázemím.'
  }

  // Build description
  const description = `${name} je výjimečný prostor ${locationStr}${capacityStr}, který nabízí ideální zázemí pro firemní akce, konference, workshopy, teambuildingy, soukromé oslavy i networkingová setkání.${amenitiesStr}${features} Díky vynikající dostupnosti, profesionálnímu přístupu a flexibilním možnostem úpravy prostoru podle vašich potřeb zde vytvoříte nezapomenutelný zážitek pro všechny účastníky. Moderní vybavení, příjemná atmosféra a zkušený tým zajistí hladký průběh vaší akce od začátku do konce. Rezervujte si termín ještě dnes a objevte prostor, který perfektně splní vaše očekávání.`

  // Ensure length between 600-900 chars
  if (description.length < 600) {
    return description + ' Jsme tu pro vás, abychom společně vytvořili akci přesně podle vašich představ a požadavků.'
  }

  return description.slice(0, 900)
}

console.log('📝 Generating Czech descriptions for 93 venues...\n')

const enhanced = venues.map((venue: any, index: number) => {
  const description = generateDescription(venue)
  const venueTypes = categorizeVenue(venue)

  console.log(`[${index + 1}/93] ${venue.slug} - ${description.length} chars, ${venueTypes.length} categories`)

  return {
    id: venue.id,
    slug: venue.slug,
    description,
    venueTypes
  }
})

writeFileSync('enhanced-final-93-venues.json', JSON.stringify({ venues: enhanced }, null, 2))
console.log(`\n✅ Generated descriptions for ${enhanced.length} venues`)
console.log('✅ Saved to enhanced-final-93-venues.json')
