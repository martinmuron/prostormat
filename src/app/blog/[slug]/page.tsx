import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"

async function getBlogPost(slug: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: {
        slug,
        status: "published"
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })
    
    return post
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const tags = post.tags ? JSON.parse(post.tags) : []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Back to blog */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na blog
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt!).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <Button variant="outline" size="sm" className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Share2 className="w-4 h-4 mr-2" />
              Sdílet
            </Button>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Article footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>Autor: {post.author.name || post.author.email}</span>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na blog
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
} 