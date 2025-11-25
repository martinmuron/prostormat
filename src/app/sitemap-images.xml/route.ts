import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/seo"
import { getOptimizedImageUrl } from "@/lib/supabase-images"

const PUBLIC_STATUSES = ["published", "active"]

export async function GET() {
  const venues = await db.venue.findMany({
    where: {
      status: { in: PUBLIC_STATUSES },
      parentId: null,
    },
    select: {
      slug: true,
      name: true,
      images: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  })

  const blogPosts = await db.blogPost.findMany({
    where: {
      status: "published",
      coverImage: { not: null },
    },
    select: {
      slug: true,
      title: true,
      coverImage: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 200,
  })

  const urlEntries: string[] = []

  // Venue images
  for (const venue of venues) {
    const images = Array.isArray(venue.images) ? venue.images : []
    if (images.length === 0) continue

    const imageXml = images
      .slice(0, 10) // Max 10 images per URL
      .map((imagePath) => {
        const imageUrl = getOptimizedImageUrl(imagePath, "medium")
        if (!imageUrl) return ""

        // Escape XML special characters
        const escapedUrl = imageUrl
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;")

        const escapedTitle = venue.name
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;")

        return `
      <image:image>
        <image:loc>${escapedUrl}</image:loc>
        <image:title>${escapedTitle}</image:title>
      </image:image>`
      })
      .filter(Boolean)
      .join("")

    if (imageXml) {
      urlEntries.push(`
  <url>
    <loc>${SITE_URL}/prostory/${venue.slug}</loc>${imageXml}
  </url>`)
    }
  }

  // Blog post cover images
  for (const post of blogPosts) {
    if (!post.coverImage) continue

    const imageUrl = post.coverImage.startsWith("http")
      ? post.coverImage
      : `${SITE_URL}${post.coverImage.startsWith("/") ? "" : "/"}${post.coverImage}`

    const escapedUrl = imageUrl
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

    const escapedTitle = post.title
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

    urlEntries.push(`
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <image:image>
      <image:loc>${escapedUrl}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>
  </url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urlEntries.join("")}
</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
