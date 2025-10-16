import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, ArrowLeft, Share2 } from "lucide-react"

import { db } from "@/lib/db"
import { fallbackBlogPosts } from "@/data/blog-fallback-posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type BlogPostData = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  tags?: string | null
  publishedAt: string
  author?: { name: string | null; email: string | null } | null
  metaTitle?: string | null
  metaDescription?: string | null
}

function mapFallbackPost(slug: string): BlogPostData | null {
  const fallback = fallbackBlogPosts.find((post) => post.slug === slug)
  if (!fallback) return null

  return {
    id: fallback.id,
    title: fallback.title,
    slug: fallback.slug,
    excerpt: fallback.excerpt,
    content: fallback.content,
    coverImage: fallback.coverImage,
    tags: fallback.tags,
    publishedAt: fallback.publishedAt,
    author: { name: fallback.author.name, email: fallback.author.email },
    metaTitle: fallback.metaTitle,
    metaDescription: fallback.metaDescription,
  }
}

async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (post && post.status === "published") {
      const publishedAt = (post.publishedAt ?? post.createdAt).toISOString()

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? undefined,
        content: post.content,
        coverImage: post.coverImage ?? undefined,
        tags: post.tags,
        publishedAt,
        author: post.author,
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
      }
    }
  } catch (error) {
    console.error("Error fetching blog post:", error)
  }

  return mapFallbackPost(slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Článek nenalezen | Prostormat",
      description: "Požadovaný blogový článek nebyl nalezen.",
    }
  }

  const title = post.metaTitle ?? post.title
  const description = post.metaDescription ?? post.excerpt ?? "Článek z blogu Prostormat." 

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://prostormat.cz/blog/${post.slug}`,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    alternates: {
      canonical: `https://prostormat.cz/blog/${post.slug}`,
    },
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
              <span>{new Date(post.publishedAt).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
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
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full h-auto rounded-lg shadow-lg"
                priority
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
              <span>Autor: {post.author?.name || post.author?.email || 'Prostormat tým'}</span>
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
