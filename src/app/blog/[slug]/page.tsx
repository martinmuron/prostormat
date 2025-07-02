import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  tags: string[]
  publishedAt: string
  metaTitle?: string
  metaDescription?: string
  author: { name: string }
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog/${slug}`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      return null
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: "Článek nenalezen - Prostormat",
      description: "Požadovaný článek nebyl nalezen."
    }
  }

  return {
    title: post.metaTitle || `${post.title} - Prostormat Blog`,
    description: post.metaDescription || post.excerpt || "Přečtěte si náš nejnovější článek o event prostorech a organizaci akcí.",
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  // Format content with simple line breaks to paragraphs
  const formattedContent = post.content.split('\n').map((paragraph, index) => {
    if (paragraph.trim() === '') return null
    return (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    )
  }).filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back to Blog */}
        <Link 
          href="/blog"
          className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na blog
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="text-xs hover:bg-gray-300 transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {post.author.name}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(post.publishedAt).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div className="text-base sm:text-lg leading-relaxed">
            {formattedContent}
          </div>
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-black mb-2">Líbí se vám náš blog?</h3>
              <p className="text-sm text-gray-600">
                Objevte další články o event prostorech a organizaci akcí.
              </p>
            </div>
            <Link 
              href="/blog"
              className="inline-block px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Další články
            </Link>
          </div>
        </footer>

        {/* Related Articles CTA */}
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-2">
              Hledáte prostor pro svou akci?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Prohlédněte si naši databázi event prostorů v Praze a najděte ideální místo pro vaši akci.
            </p>
            <Link 
              href="/prostory"
              className="inline-block px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Prohlédnout prostory
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 