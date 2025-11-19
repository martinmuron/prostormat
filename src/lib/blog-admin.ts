import { db } from "@/lib/db"
import { staticBlogPosts } from "@/data/blog-posts"

export async function ensureStaticBlogPosts(authorId: string) {
  // Get all existing post IDs
  const existingPosts = await db.blogPost.findMany({
    select: { id: true },
  })
  const existingIds = new Set(existingPosts.map((p) => p.id))

  // Find static posts that don't exist in database
  const missingPosts = staticBlogPosts.filter((post) => !existingIds.has(post.id))

  if (missingPosts.length === 0) {
    return
  }

  console.log(`📝 Importing ${missingPosts.length} missing blog post(s)...`)

  // Import only missing posts
  for (const post of missingPosts) {
    try {
      await db.blogPost.create({
        data: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: "published",
          authorId,
          tags: post.tags,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          publishedAt: new Date(post.publishedAt),
        },
      })
      console.log(`✅ Imported: ${post.title}`)
    } catch (error) {
      console.error(`❌ Failed to import ${post.title}:`, error)
    }
  }
}
