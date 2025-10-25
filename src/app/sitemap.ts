import type { MetadataRoute } from "next"
import { Client } from "pg"
import { SITE_URL } from "@/lib/seo"

const BASE_URL = SITE_URL

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>

const STATIC_ROUTES: Array<{ path: string; priority?: number; changeFrequency?: ChangeFreq }> = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/prostory", priority: 0.9, changeFrequency: "daily" },
  { path: "/organizace-akce", priority: 0.7 },
  { path: "/rychla-poptavka", priority: 0.8 },
  { path: "/poptavka-prostoru", priority: 0.7 },
  { path: "/event-board", priority: 0.8, changeFrequency: "hourly" },
  { path: "/faq", priority: 0.5 },
  { path: "/kontakt", priority: 0.5 },
  { path: "/blog", priority: 0.7 },
  { path: "/o-nas", priority: 0.6 },
  { path: "/ceny", priority: 0.7 },
  { path: "/pridat-prostor", priority: 0.8 },
  { path: "/eventove-agentury", priority: 0.5 },
  { path: "/ochrana-soukromi", priority: 0.4, changeFrequency: "yearly" },
  { path: "/podminky-pouziti", priority: 0.4, changeFrequency: "yearly" },
]

type VenueRow = { slug: string; updated_at: Date | string | null }
type BlogRow = { slug: string; updated_at: Date | string | null }

function getConnectionString() {
  const direct = process.env.DIRECT_DATABASE_URL || process.env.DIRECT_URL
  const standard = process.env.DATABASE_URL
  if (!direct && !standard) {
    throw new Error("DATABASE_URL is not defined")
  }
  return direct ?? standard!
}

async function query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string): Promise<T[]> {
  const client = new Client({ connectionString: getConnectionString() })
  await client.connect()
  try {
    const result = await client.query<T>(sql)
    return result.rows
  } finally {
    await client.end()
  }
}

function toDate(value: Date | string | null | undefined) {
  if (!value) return new Date()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFrequency ?? "weekly",
    priority: priority ?? 0.7,
  }))

  try {
    const venues = await query<VenueRow>(`
      SELECT slug, updated_at
      FROM prostormat_venues
      WHERE status IN ('published', 'active')
        AND parent_id IS NULL
      ORDER BY updated_at DESC
      LIMIT 1000
    `)

    routes.push(
      ...venues.map((venue) => ({
        url: `${BASE_URL}/prostory/${venue.slug}`,
        lastModified: toDate(venue.updated_at),
        changeFrequency: "daily" as ChangeFreq,
        priority: 0.85,
      }))
    )
  } catch (error) {
    console.error("Failed to build venue sitemap entries:", error)
  }

  try {
    const posts = await query<BlogRow>(`
      SELECT slug, updated_at
      FROM prostormat_blog_posts
      WHERE status = 'published'
      ORDER BY updated_at DESC
      LIMIT 500
    `)

    routes.push(
      ...posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: toDate(post.updated_at),
        changeFrequency: "weekly" as ChangeFreq,
        priority: 0.6,
      }))
    )
  } catch (error) {
    console.error("Failed to build blog sitemap entries:", error)
  }

  return routes
}
