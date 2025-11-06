import { db } from "@/lib/db"
import { fallbackBlogPosts } from "@/data/blog-fallback-posts"

export async function ensureFallbackBlogPosts(authorId: string) {
  // Get all existing post IDs
  const existingPosts = await db.blogPost.findMany({
    select: { id: true },
  })
  const existingIds = new Set(existingPosts.map((p) => p.id))

  // Find fallback posts that don't exist in database
  const missingPosts = fallbackBlogPosts.filter((post) => !existingIds.has(post.id))

  if (missingPosts.length === 0) {
    return
  }

  console.log(`📝 Importing ${missingPosts.length} missing blog post(s)...`)

  // Import only missing posts
  for (const fallbackPost of missingPosts) {
    try {
      await db.blogPost.create({
        data: {
          id: fallbackPost.id,
          title: fallbackPost.title,
          slug: fallbackPost.slug,
          excerpt: fallbackPost.excerpt,
          content: fallbackPost.content,
          coverImage: fallbackPost.coverImage,
          status: "published",
          authorId,
          tags: fallbackPost.tags,
          metaTitle: fallbackPost.metaTitle,
          metaDescription: fallbackPost.metaDescription,
          publishedAt: new Date(fallbackPost.publishedAt),
        },
      })
      console.log(`✅ Imported: ${fallbackPost.title}`)
    } catch (error) {
      console.error(`❌ Failed to import ${fallbackPost.title}:`, error)
    }
  }
}
