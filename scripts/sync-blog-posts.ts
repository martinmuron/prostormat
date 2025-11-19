import { PrismaClient } from "@prisma/client"
import { staticBlogPosts } from "../src/data/blog-posts"

const prisma = new PrismaClient()

async function syncBlogPosts() {
  console.log("🔄 Syncing blog posts to database...")

  // Delete old fallback posts
  const deleted = await prisma.blogPost.deleteMany({
    where: {
      id: {
        startsWith: "fallback-"
      }
    }
  })
  console.log(`🗑️  Deleted ${deleted.count} old fallback posts`)

  // Get admin user for author
  const admin = await prisma.user.findFirst({
    where: { role: "admin" }
  })

  if (!admin) {
    console.error("❌ No admin user found")
    process.exit(1)
  }

  // Insert new posts
  for (const post of staticBlogPosts) {
    try {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          tags: post.tags,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          publishedAt: new Date(post.publishedAt),
        },
        create: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: "published",
          authorId: admin.id,
          tags: post.tags,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          publishedAt: new Date(post.publishedAt),
        },
      })
      console.log(`✅ Synced: ${post.title}`)
    } catch (error) {
      console.error(`❌ Failed to sync ${post.title}:`, error)
    }
  }

  console.log("\n✨ Blog posts synced successfully!")
}

syncBlogPosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
