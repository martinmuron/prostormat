import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, ArrowLeft, Share2, Clock, BookOpen } from "lucide-react"

import { db } from "@/lib/db"
import { staticBlogPosts } from "@/data/blog-posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { absoluteUrl, DEFAULT_OG_IMAGE, stripHtml } from "@/lib/seo"
import { generateBlogPostingSchema, generateBreadcrumbSchema, schemaToJsonLd } from "@/lib/schema-markup"

// Revalidate blog post pages every 60 seconds
export const revalidate = 60

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

function parseTags(value?: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mapFallbackPost(slug: string): BlogPostData | null {
  const fallback = staticBlogPosts.find((post) => post.slug === slug)
  if (!fallback) return null

  return {
    id: fallback.id,
    title: fallback.title,
    slug: fallback.slug,
    excerpt: fallback.excerpt,
    content: fallback.content.trim(),
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

function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordsPerMinute = 220
  return Math.max(3, Math.ceil(words.length / wordsPerMinute))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function addAnchorsToHeadings(html: string) {
  return html.replace(/<h2>(.*?)<\/h2>/g, (_, heading) => {
    const id = slugify(heading)
    return `<h2 id="${id}">${heading}</h2>`
  })
}

function extractTableOfContents(html: string) {
  const toc: { id: string; title: string }[] = []
  const headingRegex = /<h2>(.*?)<\/h2>/g
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(html)) !== null) {
    const title = match[1]
    toc.push({ id: slugify(title), title })
  }

  return toc
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
  const tags = parseTags(post.tags)
  const fallbackDescription = stripHtml(post.content).slice(0, 155).trim()
  const description = post.metaDescription ?? post.excerpt ?? (fallbackDescription || "Článek z blogu Prostormat.")
  const canonicalUrl = absoluteUrl(`/blog/${post.slug}`)
  const ogImage = post.coverImage ? absoluteUrl(post.coverImage) : DEFAULT_OG_IMAGE
  const images = [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: post.title,
    },
  ]

  return {
    title,
    description,
    keywords: tags.length ? tags : undefined,
    authors: post.author?.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      images,
      siteName: "Prostormat",
      publishedTime: post.publishedAt,
      tags: tags.length ? tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
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

  const tags = parseTags(post.tags)
  const readingTime = estimateReadingTime(post.content)
  const contentWithAnchors = addAnchorsToHeadings(post.content)
  const seoDescription = post.metaDescription ?? post.excerpt ?? (stripHtml(post.content).slice(0, 155).trim() || "Článek z blogu Prostormat.")
  const canonicalUrl = absoluteUrl(`/blog/${post.slug}`)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Domů", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: post.title, url: canonicalUrl },
  ])
  const articleSchema = generateBlogPostingSchema({
    title: post.metaTitle ?? post.title,
    description: seoDescription,
    slug: post.slug,
    contentHtml: post.content,
    coverImage: post.coverImage,
    authorName: post.author?.name ?? undefined,
    publishedAt: post.publishedAt,
    tags,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(breadcrumbSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(articleSchema)}
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white pb-16">
        <div className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na všechny články
          </Link>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-blue-600 font-semibold">
              <span>Blog Prostormat</span>
              <span className="inline-block h-px w-8 bg-blue-200" />
              <span>{new Date(post.publishedAt).toLocaleDateString('cs-CZ')}</span>
              <span className="inline-block h-px w-8 bg-blue-200" />
              <span>{readingTime} min čtení</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <AuthorBadge name={post.author?.name || post.author?.email || 'Prostormat tým'} />
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {readingTime} min čtení
              </span>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="rounded-full border-gray-300 hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" />
                Sdílet článek
              </Button>
            </div>
          </div>
        </div>
      </div>

      {post.coverImage && (
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-12">
          <div className="overflow-hidden rounded-3xl shadow-xl border border-gray-200">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1600}
              height={900}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-blue-600">
          <div
            dangerouslySetInnerHTML={{ __html: contentWithAnchors }}
          />
        </article>

        <footer className="mt-16 rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-[0.25em]">Autor článku</h4>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {post.author?.name || post.author?.email || 'Prostormat tým'}
              </p>
              <p className="text-sm text-gray-500">
                Tipy a strategie pro úspěšné eventy v České republice.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/prostory" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <BookOpen className="w-4 h-4" />
                Prohlédnout prostory
              </Link>
              <Link href="/rychla-poptavka" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                <Calendar className="w-4 h-4" />
                Zadání poptávky
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  )
}

function AuthorBadge({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-700 text-xs font-semibold">
      {initials || "PT"}
    </span>
  )
}
