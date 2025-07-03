// Helper functions for cross-database seeding

export function formatArrayField(array: string[]): string | string[] {
  // Check if we're using SQLite (based on DATABASE_URL)
  const databaseUrl = process.env.DATABASE_URL || ''
  const isSQLite = databaseUrl.startsWith('file:')
  
  if (isSQLite) {
    // For SQLite, store as JSON string
    return JSON.stringify(array)
  } else {
    // For PostgreSQL, use native array
    return array
  }
}

export function getVenueData(baseData: any) {
  return {
    ...baseData,
    amenities: formatArrayField(baseData.amenities),
    images: formatArrayField(baseData.images)
  }
}

export function getBroadcastData(baseData: any) {
  return {
    ...baseData,
    sentVenues: formatArrayField(baseData.sentVenues || [])
  }
}