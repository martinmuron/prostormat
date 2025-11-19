import type { MetadataRoute } from "next"
import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/seo"
import { generateAllLandingPageSlugs } from "@/lib/seo-slugs"

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
    const venues = await db.venue.findMany({
      where: {
        status: "published",
        parentId: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    })

    routes.push(
      ...venues.map((venue) => ({
        url: `${BASE_URL}/prostory/${venue.slug}`,
        lastModified: toDate(venue.updatedAt),
        changeFrequency: "daily" as ChangeFreq,
        priority: 0.85,
      }))
    )
  } catch (error) {
    console.error("Failed to build venue sitemap entries:", error)
  }

  // SEO landing pages (venue type + district combinations)
  try {
    const landingPages = generateAllLandingPageSlugs()
    routes.push(
      ...landingPages.map((page) => ({
        url: `${BASE_URL}/prostory/kategorie/${page.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as ChangeFreq,
        priority: page.priority,
      }))
    )
  } catch (error) {
    console.error("Failed to build landing page sitemap entries:", error)
  }

  try {
    const posts = await db.blogPost.findMany({
      where: {
        status: "published",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    })

    routes.push(
      ...posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: toDate(post.updatedAt),
        changeFrequency: "weekly" as ChangeFreq,
        priority: 0.6,
      }))
    )
  } catch (error) {
    console.error("Failed to build blog sitemap entries:", error)
  }

  return routes
}
