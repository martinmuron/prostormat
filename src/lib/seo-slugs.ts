import { VenueType, PRAGUE_DISTRICTS } from '@/types'

// URL slugs for venue types (Czech plurals for better SEO)
export const VENUE_TYPE_SLUGS: Record<VenueType, string> = {
  restaurant: 'restaurace',
  bar: 'bary',
  cafe: 'kavarny',
  rooftop: 'stresni-terasy',
  gallery: 'galerie',
  conference: 'konferencni-prostory',
  historical: 'historicke-prostory',
  villa: 'vily',
  palace: 'palace',
  hotel: 'hotely',
  garden: 'zahrady',
  studio: 'studia',
  loft: 'lofty',
  club: 'kluby',
  theater: 'divadla',
  museum: 'muzea',
  winery: 'vinarstvi',
  event_space: 'eventove-prostory',
  chapel: 'kaple',
  boat: 'lode',
  cinema: 'kina',
  education: 'vzdelavaci-centra',
  coworking: 'coworkingy',
  sports: 'sportoviste',
  other: 'ostatni-prostory'
}

// Display names for SEO pages (Czech plurals)
export const VENUE_TYPE_SEO_NAMES: Record<VenueType, string> = {
  restaurant: 'Restaurace',
  bar: 'Bary',
  cafe: 'Kavárny',
  rooftop: 'Střešní terasy',
  gallery: 'Galerie',
  conference: 'Konferenční prostory',
  historical: 'Historické prostory',
  villa: 'Vily',
  palace: 'Paláce',
  hotel: 'Hotely',
  garden: 'Zahrady',
  studio: 'Studia',
  loft: 'Lofty',
  club: 'Kluby',
  theater: 'Divadla',
  museum: 'Muzea',
  winery: 'Vinařství',
  event_space: 'Eventové prostory',
  chapel: 'Kaple',
  boat: 'Lodě',
  cinema: 'Kina',
  education: 'Vzdělávací centra',
  coworking: 'Coworkingy',
  sports: 'Sportoviště',
  other: 'Ostatní prostory'
}

// Reverse lookup: slug → venue type
export const SLUG_TO_VENUE_TYPE: Record<string, VenueType> = Object.entries(
  VENUE_TYPE_SLUGS
).reduce((acc, [type, slug]) => {
  acc[slug] = type as VenueType
  return acc
}, {} as Record<string, VenueType>)

// District to URL slug mapping
export const DISTRICT_SLUGS: Record<string, string> = PRAGUE_DISTRICTS.reduce(
  (acc, district) => {
    // "Praha 1" → "praha-1"
    acc[district] = district.toLowerCase().replace(' ', '-')
    return acc
  },
  {} as Record<string, string>
)

// Reverse lookup: slug → district name
export const SLUG_TO_DISTRICT: Record<string, string> = Object.entries(
  DISTRICT_SLUGS
).reduce((acc, [district, slug]) => {
  acc[slug] = district
  return acc
}, {} as Record<string, string>)

// Get all venue type slugs for static generation
export function getAllVenueTypeSlugs(): string[] {
  return Object.values(VENUE_TYPE_SLUGS)
}

// Get all district slugs for static generation
export function getAllDistrictSlugs(): string[] {
  return Object.values(DISTRICT_SLUGS)
}

// Parse a landing page slug to extract type and/or district
export function parseLandingPageSlug(slug: string): {
  venueType?: VenueType
  district?: string
} {
  // Check if it's a combined slug (type-district)
  // e.g., "lofty-praha-1" or "restaurace-praha-10"
  const districtMatch = slug.match(/-(praha-\d+)$/)

  if (districtMatch) {
    const districtSlug = districtMatch[1]
    const typeSlug = slug.replace(`-${districtSlug}`, '')

    return {
      venueType: SLUG_TO_VENUE_TYPE[typeSlug],
      district: SLUG_TO_DISTRICT[districtSlug]
    }
  }

  // Check if it's just a venue type
  if (SLUG_TO_VENUE_TYPE[slug]) {
    return { venueType: SLUG_TO_VENUE_TYPE[slug] }
  }

  // Check if it's just a district
  if (SLUG_TO_DISTRICT[slug]) {
    return { district: SLUG_TO_DISTRICT[slug] }
  }

  return {}
}

// Build a landing page URL
export function buildLandingPageUrl(
  venueType?: VenueType,
  district?: string
): string {
  if (venueType && district) {
    const typeSlug = VENUE_TYPE_SLUGS[venueType]
    const districtSlug = DISTRICT_SLUGS[district]
    return `/prostory/kategorie/${typeSlug}-${districtSlug}`
  }

  if (venueType) {
    return `/prostory/kategorie/${VENUE_TYPE_SLUGS[venueType]}`
  }

  if (district) {
    return `/prostory/kategorie/${DISTRICT_SLUGS[district]}`
  }

  return '/prostory'
}

// Generate all possible landing page combinations for sitemap
export function generateAllLandingPageSlugs(): {
  slug: string
  venueType?: VenueType
  district?: string
  priority: number
}[] {
  const pages: {
    slug: string
    venueType?: VenueType
    district?: string
    priority: number
  }[] = []

  // Venue type only pages (high priority)
  for (const [type, slug] of Object.entries(VENUE_TYPE_SLUGS)) {
    pages.push({
      slug,
      venueType: type as VenueType,
      priority: 0.8
    })
  }

  // District only pages (high priority)
  for (const [district, slug] of Object.entries(DISTRICT_SLUGS)) {
    pages.push({
      slug,
      district,
      priority: 0.8
    })
  }

  // Combined pages (medium priority)
  for (const [type, typeSlug] of Object.entries(VENUE_TYPE_SLUGS)) {
    for (const [district, districtSlug] of Object.entries(DISTRICT_SLUGS)) {
      pages.push({
        slug: `${typeSlug}-${districtSlug}`,
        venueType: type as VenueType,
        district,
        priority: 0.6
      })
    }
  }

  return pages
}

// Helper for Czech numeral declension
function getCountText(count?: number): string {
  if (!count) return ''
  if (count === 1) return ` - ${count} prostor`
  if (count >= 2 && count <= 4) return ` - ${count} prostory`
  return ` - ${count} prostorů`
}

// Get SEO title for landing page
export function getLandingPageTitle(
  venueType?: VenueType,
  district?: string,
  venueCount?: number
): string {
  const countText = getCountText(venueCount)

  if (venueType && district) {
    return `${VENUE_TYPE_SEO_NAMES[venueType]} v ${district.replace('Praha', 'Praze')}${countText} | Prostormat`
  }

  if (venueType) {
    return `${VENUE_TYPE_SEO_NAMES[venueType]} pro akce v Praze${countText} | Prostormat`
  }

  if (district) {
    return `Prostory pro akce v ${district.replace('Praha', 'Praze')}${countText} | Prostormat`
  }

  return 'Prostory pro firemní akce | Prostormat'
}

// Get SEO description for landing page
export function getLandingPageDescription(
  venueType?: VenueType,
  district?: string,
  venueCount?: number
): string {
  if (venueType && district) {
    const countPart = venueCount ? `Prohlédněte si ${venueCount} ověřených prostorů` : 'Prohlédněte si ověřené prostory'
    return `Najděte ideální ${VENUE_TYPE_SEO_NAMES[venueType].toLowerCase()} pro vaši akci v ${district.replace('Praha', 'Praze')}. ${countPart} s cenami a dostupností.`
  }

  if (venueType) {
    const countPart = venueCount ? `Porovnejte ${venueCount} prostorů` : 'Porovnejte prostory'
    return `Hledáte ${VENUE_TYPE_SEO_NAMES[venueType].toLowerCase()} pro firemní akci, teambuilding nebo oslavu? ${countPart} v Praze na jednom místě.`
  }

  if (district) {
    const countPart = venueCount ? `Nabízíme ${venueCount} ověřených míst` : 'Nabízíme ověřená místa'
    return `Objevte prostory pro firemní akce v ${district.replace('Praha', 'Praze')}. ${countPart} pro konference, teambuilding, svatby a další události.`
  }

  return 'Najděte ideální prostor pro vaši firemní akci v Praze. Ověřené prostory s cenami a dostupností.'
}

// Get H1 heading for landing page
export function getLandingPageH1(
  venueType?: VenueType,
  district?: string
): string {
  if (venueType && district) {
    return `${VENUE_TYPE_SEO_NAMES[venueType]} v ${district.replace('Praha', 'Praze')}`
  }

  if (venueType) {
    return `${VENUE_TYPE_SEO_NAMES[venueType]} pro akce v Praze`
  }

  if (district) {
    return `Prostory pro akce v ${district.replace('Praha', 'Praze')}`
  }

  return 'Prostory pro firemní akce'
}

// Get rich SEO content for landing page
export function getLandingPageSEOContent(
  venueType?: VenueType,
  district?: string
): { title: string; paragraphs: string[] } | null {
  const typeName = venueType ? VENUE_TYPE_SEO_NAMES[venueType].toLowerCase() : 'prostory'
  const typeNameCapitalized = venueType ? VENUE_TYPE_SEO_NAMES[venueType] : 'Prostory'
  const districtName = district ? district : 'Praha'

  if (venueType && district) {
    return {
      title: `Proč zvolit ${typeName} v městské části ${districtName}?`,
      paragraphs: [
        `Hledáte ideální ${typeName} pro vaši firemní akci, večírek nebo konferenci v lokalitě ${districtName}? Tato městská část Prahy nabízí širokou škálu možností, které vyhoví každému rozpočtu i požadavkům. ${typeNameCapitalized} v této lokalitě jsou oblíbenou volbou díky skvělé dostupnosti MHD a jedinečné atmosféře.`,
        `Ať už plánujete formální setkání, prezentaci produktu nebo neformální teambuilding, ${districtName} má co nabídnout. Naše nabídka zahrnuje prověřené ${typeName}, které disponují potřebným technickým zázemím, možnostmi cateringu a profesionálním personálem připraveným pomoct s organizací vaší akce.`,
        `Výhodou prostor v této lokalitě je také dobrá dopravní dostupnost pro účastníky z celé Prahy i mimopražské hosty. Mnoho ${typeName} nabízí parkování nebo se nachází v blízkosti stanic metra či tramvajových zastávek.`,
        `Vyberte si z našeho seznamu ověřených prostorů a zarezervujte si ten pravý prostor pro vaši akci. Každý prostor obsahuje detailní informace o kapacitě, vybavení, cenách a dostupných termínech.`
      ]
    }
  }

  if (venueType) {
    return {
      title: `${typeNameCapitalized} pro každou příležitost v Praze`,
      paragraphs: [
        `Praha je domovem stovek úžasných míst pro pořádání akcí. Pokud hledáte konkrétně ${typeName}, jste na správném místě. Nabízíme široký výběr v kategorii ${typeName} po celém hlavním městě, od historického centra až po moderní obchodní čtvrtě na okraji Prahy.`,
        `Každý prostor v naší nabídce je detailně popsán, včetně kapacity pro sezení i stání, orientačních cen pronájmu a dostupného vybavení. ${typeNameCapitalized} jsou skvělou volbou pro firmy i soukromé osoby, které chtějí svou akci uspořádat v profesionálním prostředí.`,
        `Při výběru prostoru zvažte nejen kapacitu, ale také dostupnost pro vaše hosty, možnosti parkování a technické vybavení. Mnoho prostor nabízí také catering nebo spolupráci s ověřenými dodavateli občerstvení.`,
        `Prohlédněte si fotografie, přečtěte si popis a kontaktujte majitele prostoru přímo přes náš formulář. Ušetříte čas a získáte rychlou odpověď na vaše dotazy ohledně dostupnosti a ceny.`
      ]
    }
  }

  if (district) {
    return {
      title: `Prostory pro akce v městské části ${districtName}`,
      paragraphs: [
        `${districtName} patří mezi vyhledávané lokality pro pořádání firemních i soukromých akcí v Praze. Díky své poloze a občanské vybavenosti je ideálním místem pro konference, firemní večírky, svatby, školení i narozeninové oslavy.`,
        `V této městské části naleznete pečlivě vybrané prostory různých typů - od restaurací a barů přes konferenční sály až po netradiční místa jako galerie, lofty nebo střešní terasy. Každý typ prostoru nabízí jedinečnou atmosféru pro váš event.`,
        `Většina prostor v ${districtName} je dobře dostupná městskou hromadnou dopravou. Mnoho z nich nabízí také možnost parkování pro hosty nebo se nachází v blízkosti veřejných parkovišť.`,
        `Prozkoumejte možnosti, které ${districtName} nabízí, a najděte prostor, který přesně odpovídá vašim představám. Můžete filtrovat podle kapacity, typu prostoru i cenového rozsahu a rychle najít to pravé místo pro vaši akci.`
      ]
    }
  }

  return null
}
