export type VenueType = 
  | 'restaurant' 
  | 'rooftop' 
  | 'gallery' 
  | 'conference' 
  | 'historical'
  | 'villa'
  | 'palace'
  | 'hotel'
  | 'garden'
  | 'studio'
  | 'loft'
  | 'other'

export type EventType = 
  | 'firemni-akce' 
  | 'teambuilding' 
  | 'svatba' 
  | 'soukroma-akce'

export type UserRole = 'user' | 'venue_manager' | 'admin'

export type VenueStatus = 'draft' | 'active' | 'expired'

export type EventStatus = 'active' | 'closed' | 'expired'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export const VENUE_TYPES: Record<VenueType, string> = {
  restaurant: 'Restaurace',
  rooftop: 'Střešní terasa',
  gallery: 'Galerie',
  conference: 'Konferenční centrum',
  historical: 'Historický prostor',
  villa: 'Vila',
  palace: 'Palác',
  hotel: 'Hotel',
  garden: 'Zahrada',
  studio: 'Studio',
  loft: 'Loft',
  other: 'Jiné'
}

export const EVENT_TYPES: Record<EventType, string> = {
  'firemni-akce': 'Firemní akce',
  'teambuilding': 'Teambuilding',
  'svatba': 'Svatba',
  'soukroma-akce': 'Soukromá akce'
}

export const PRAGUE_DISTRICTS = [
  'Praha 1',
  'Praha 2',
  'Praha 3',
  'Praha 4',
  'Praha 5',
  'Praha 6',
  'Praha 7',
  'Praha 8',
  'Praha 9',
  'Praha 10',
  'Praha 11',
  'Praha 12',
  'Praha 13',
  'Praha 14',
  'Praha 15'
] as const

export const BUDGET_RANGES = [
  'Do 50 000 Kč',
  '50 000 - 100 000 Kč',
  '100 000 - 200 000 Kč',
  '200 000 - 500 000 Kč',
  'Nad 500 000 Kč'
] as const

export const CAPACITY_RANGES = [
  'Do 25 lidí',
  '25 - 50 lidí',
  '50 - 100 lidí',
  '100 - 200 lidí',
  'Nad 200 lidí'
] as const