import { db } from "@/lib/db"
import { fallbackBlogPosts } from "@/data/blog-fallback-posts"

export async function ensureFallbackBlogPosts(authorId: string) {
  const existingCount = await db.blogPost.count()
  if (existingCount > 0) {
    return
  }

  for (const fallbackPost of fallbackBlogPosts) {
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
  }
}
