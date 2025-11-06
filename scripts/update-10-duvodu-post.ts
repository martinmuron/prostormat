import { db } from '../src/lib/db'
import { fallbackBlogPosts } from '../src/data/blog-fallback-posts'

const targetPost = fallbackBlogPosts.find(p => p.id === 'fallback-10-duvodu-prostormat')

if (!targetPost) {
  console.error('Post not found in fallback array')
  process.exit(1)
}

async function updateContent() {
  await db.blogPost.update({
    where: { id: 'fallback-10-duvodu-prostormat' },
    data: { content: targetPost.content }
  })
  console.log('✅ Blog post content updated successfully')
}

updateContent().catch(console.error).finally(() => process.exit(0))
