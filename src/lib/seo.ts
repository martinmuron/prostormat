const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://prostormat.cz"
const DEFAULT_OG_IMAGE_PATH = "/images/prostormat_sharing.jpg"
const DEFAULT_OG_IMAGE_ALT = "Prostormat – Největší katalog event prostorů v Praze"

export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return SITE_URL
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const normalised = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
  return `${SITE_URL}${normalised}`
}

const DEFAULT_OG_IMAGE = absoluteUrl(DEFAULT_OG_IMAGE_PATH)
const DEFAULT_OG_IMAGES = [
  {
    url: DEFAULT_OG_IMAGE,
    width: 1200,
    height: 630,
    alt: DEFAULT_OG_IMAGE_ALT,
  },
] as const

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function takeSentences(input: string, maxLength = 155) {
  if (!input) return ""

  const sentences = input.split(/(?<=[.!?])\s+/)
  let summary = ""

  for (const sentence of sentences) {
    if (!sentence) continue
    const next = summary.length ? `${summary} ${sentence}` : sentence
    if (next.length > maxLength) {
      if (!summary.length) {
        summary = sentence.slice(0, maxLength).replace(/[,.;:\s]+$/, "")
      }
      break
    }
    summary = next
    if (summary.length >= maxLength) break
  }

  return summary || input.slice(0, maxLength).replace(/[,.;:\s]+$/, "")
}

interface VenueMetaOptions {
  name: string
  rawDescription?: string | null
  venueTypeLabel?: string | null
  district?: string | null
  address?: string | null
  capacity?: number | null
}

export function buildVenueMetaDescription({
  name,
  rawDescription,
  venueTypeLabel,
  district,
  address,
  capacity,
}: VenueMetaOptions) {
  const cleaned = rawDescription ? stripHtml(rawDescription) : ""
  if (cleaned) {
    return takeSentences(cleaned)
  }

  const location = district || (address ? address.split(",")[0]?.trim() : null) || "Praze"
  const typeLabel = venueTypeLabel ?? "eventový prostor"
  const capacityText = capacity && capacity > 0 ? ` s kapacitou až ${capacity} osob` : ""

  return `${name} je ${typeLabel} v ${location}${capacityText}. Ideální pro firemní akce, teambuilding i svatební oslavy.`
}

export function buildVenueKeywords({
  name,
  venueTypeLabel,
  district,
}: Pick<VenueMetaOptions, "name" | "venueTypeLabel" | "district">) {
  const keywords = [
    name,
    "event prostor Praha",
    "pronájem prostoru Praha",
    "firemní akce Praha",
    "teambuilding Praha",
    "svatba Praha",
  ]

  if (venueTypeLabel) {
    keywords.push(venueTypeLabel)
  }

  if (district) {
    keywords.push(`event prostor ${district}`, `firemní akce ${district}`)
  }

  return Array.from(new Set(keywords))
}

export { SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES, DEFAULT_OG_IMAGE_ALT, DEFAULT_OG_IMAGE_PATH }
