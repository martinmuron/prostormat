import type { MetadataRoute } from "next"
import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/seo"

const BASE_URL = SITE_URL

const STATIC_ROUTES: Array<{ path: string; priority?: number }> = [
  { path: "" },
  { path: "/prostory" },
  { path: "/organizace-akce" },
  { path: "/rychla-poptavka" },
  { path: "/poptavka-prostoru" },
  { path: "/faq" },
  { path: "/kontakt" },
  { path: "/blog" },
  { path: "/o-nas" },
  { path: "/ceny" },
  { path: "/pridat-prostor" },
  { path: "/verejne-zakazky" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: priority ?? 0.7,
  }))

  try {
    const venues = await db.venue.findMany({
      where: {
        status: { in: ["published", "active"] },
        parentId: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    routes.push(
      ...venues.map((venue) => ({
        url: `${BASE_URL}/prostory/${venue.slug}`,
        lastModified: venue.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    )
  } catch (error) {
    console.error("Failed to build venue sitemap entries:", error)
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
    })

    routes.push(
      ...posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    )
  } catch (error) {
    console.error("Failed to build blog sitemap entries:", error)
  }

  return routes
}
